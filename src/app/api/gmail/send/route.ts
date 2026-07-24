// ============================================================
// API: Gmail Send — Send a reply email
// POST /api/gmail/send
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createGmailClient, sendReply } from "@/lib/gmail";
import type { ApiResponse, SendReplyResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken,
      to,
      subject,
      body: emailBody,
      inReplyTo,
      threadId,
    } = body as {
      accessToken: string;
      to: string;
      subject: string;
      body: string;
      inReplyTo?: string;
      threadId?: string;
    };

    if (!accessToken || !to || !subject || !emailBody) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: "accessToken, to, subject, and body are required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const gmail = createGmailClient(accessToken);
    const messageId = await sendReply(gmail, {
      to,
      subject,
      body: emailBody,
      inReplyTo,
      threadId,
    });

    const response: SendReplyResponse = {
      success: !!messageId,
      gmailMessageId: messageId,
      error: messageId ? undefined : "Failed to send email",
    };

    return NextResponse.json<ApiResponse<SendReplyResponse>>({
      success: response.success,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /gmail/send] Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

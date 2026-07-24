// ============================================================
// API: Summarize Email — Agent 3 standalone endpoint
// POST /api/agents/summarize
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyzeEmail } from "@/agents/inbox-analyzer";
import { summarizeEmail, summarizeThread } from "@/agents/summary-generator";
import { createGmailClient, fetchEmail, fetchThread } from "@/lib/gmail";
import type { ApiResponse, EmailSummary } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, accessToken, includeThread = false } = body as {
      emailId: string;
      accessToken: string;
      includeThread?: boolean;
    };

    if (!emailId || !accessToken) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: "emailId and accessToken are required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const gmail = createGmailClient(accessToken);
    const rawEmail = await fetchEmail(gmail, emailId);

    if (!rawEmail) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: `Email ${emailId} not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    let summary: EmailSummary;

    if (includeThread && rawEmail.threadId) {
      // Fetch and summarize full thread
      const threadEmails = await fetchThread(gmail, rawEmail.threadId);
      if (threadEmails.length > 1) {
        summary = await summarizeThread(threadEmails, rawEmail.threadId);
      } else {
        const analyzed = await analyzeEmail(rawEmail);
        summary = await summarizeEmail(analyzed);
      }
    } else {
      // Summarize single email
      const analyzed = await analyzeEmail(rawEmail);
      summary = await summarizeEmail(analyzed);
    }

    return NextResponse.json<ApiResponse<EmailSummary>>({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/summarize] Error:", error);
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

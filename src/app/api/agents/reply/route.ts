// ============================================================
// API: Generate Reply — Agent 4 standalone endpoint
// POST /api/agents/reply
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyzeEmail } from "@/agents/inbox-analyzer";
import { generateReplies, regenerateWithTone } from "@/agents/smart-replier";
import { createGmailClient, fetchEmail } from "@/lib/gmail";
import type { ApiResponse, DraftReplies, DraftReply, ReplyTone } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      emailId,
      accessToken,
      tone,
      customInstructions,
      numberOfDrafts = 3,
      regenerateTone,
    } = body as {
      emailId: string;
      accessToken: string;
      tone?: ReplyTone;
      customInstructions?: string;
      numberOfDrafts?: number;
      regenerateTone?: ReplyTone; // if set, regenerate single draft with this tone
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

    const analyzed = await analyzeEmail(rawEmail);

    // Single tone regeneration
    if (regenerateTone) {
      const draft = await regenerateWithTone(analyzed, regenerateTone);
      return NextResponse.json<ApiResponse<DraftReply>>({
        success: true,
        data: draft,
        timestamp: new Date().toISOString(),
      });
    }

    // Full draft generation
    const drafts = await generateReplies(analyzed, {
      preferredTone: tone,
      customInstructions,
      numberOfDrafts,
    });

    return NextResponse.json<ApiResponse<DraftReplies>>({
      success: true,
      data: drafts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/reply] Error:", error);
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

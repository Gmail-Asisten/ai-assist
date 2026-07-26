// ============================================================
// API: Global Summary — Summarize entire inbox
// POST /api/agents/global-summary
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { summarizeInbox } from "@/agents/summary-generator";
import type { RawEmail, ApiResponse } from "@/types";
import { InboxSummaryOutput } from "@/agents/summary-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails } = body as {
      emails: RawEmail[];
    };

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: "emails array is required and cannot be empty",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Process all emails up to the fetched limit
    const topEmails = emails;

    const summary = await summarizeInbox(topEmails);

    return NextResponse.json<ApiResponse<InboxSummaryOutput>>({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/global-summary] Error:", error);
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

// ============================================================
// API: Analyze Email — Agent 1 standalone endpoint
// POST /api/agents/analyze
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyzeEmail } from "@/agents/inbox-analyzer";
import { createGmailClient, fetchEmail } from "@/lib/gmail";
import type { ApiResponse, AnalyzedEmail } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, accessToken } = body;

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

    return NextResponse.json<ApiResponse<AnalyzedEmail>>({
      success: true,
      data: analyzed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/analyze] Error:", error);
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

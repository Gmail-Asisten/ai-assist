// ============================================================
// API: Classify Email — Agent 2 standalone endpoint
// POST /api/agents/classify
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyzeEmail } from "@/agents/inbox-analyzer";
import { classifyEmail } from "@/agents/priority-classifier";
import { createGmailClient, fetchEmail } from "@/lib/gmail";
import type { ApiResponse, ClassifiedEmail, UserPreferences } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, accessToken, userPreferences } = body as {
      emailId: string;
      accessToken: string;
      userPreferences?: UserPreferences;
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

    // Agent 1 → Agent 2
    const analyzed = await analyzeEmail(rawEmail);
    const classified = await classifyEmail(analyzed, userPreferences);

    return NextResponse.json<ApiResponse<ClassifiedEmail>>({
      success: true,
      data: classified,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/classify] Error:", error);
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

// ============================================================
// API: Process Email — Main orchestrator endpoint
// POST /api/agents/process
//
// Triggers the full multi-agent pipeline for a single email.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { processEmail } from "@/agents/orchestrator";
import { createGmailClient, fetchEmail } from "@/lib/gmail";
import type { ProcessEmailRequest, ApiResponse, PipelineResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProcessEmailRequest & {
      accessToken?: string;
      userId?: string;
    };

    const { emailId, accessToken, userId } = body;

    if (!emailId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: "emailId is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: "accessToken is required. User must be authenticated via Google OAuth.",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Fetch the email from Gmail
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

    // Run the full pipeline
    const result = await processEmail(rawEmail, {
      userId: userId || "anonymous",
      accessToken,
    });

    return NextResponse.json<ApiResponse<PipelineResult>>({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/process] Error:", error);
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

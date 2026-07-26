// ============================================================
// API: Gmail Sync — Fetch and process inbox emails
// POST /api/gmail/sync
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createGmailClient, fetchInbox } from "@/lib/gmail";
import { processEmail } from "@/agents/orchestrator";
import type { ApiResponse, PipelineResult, RawEmail } from "@/types";

interface SyncResponse {
  processed: PipelineResult[];
  skipped: number;
  nextPageToken: string | null;
  totalEstimate: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken,
      userId,
      maxResults = 10,
      pageToken,
      query,
      processEmails = true, // Set to false to only fetch, not process
      labelIds = ["INBOX"],
    } = body as {
      accessToken: string;
      userId: string;
      maxResults?: number;
      pageToken?: string;
      query?: string;
      processEmails?: boolean;
      labelIds?: string[];
    };

    if (!accessToken) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: "accessToken is required",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Fetch emails from Gmail
    const gmail = createGmailClient(accessToken);
    const { emails, nextPageToken, totalEstimate } = await fetchInbox(gmail, {
      maxResults,
      pageToken,
      query,
      labelIds,
    });

    if (!processEmails) {
      // Return raw emails without processing
      return NextResponse.json<ApiResponse<{ emails: RawEmail[]; nextPageToken: string | null; totalEstimate: number }>>({
        success: true,
        data: { emails, nextPageToken, totalEstimate },
        timestamp: new Date().toISOString(),
      });
    }

    // Process each email through the agent pipeline
    const processed: PipelineResult[] = [];
    let skipped = 0;

    // Process in batches of 3 to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (email) => {
          try {
            return await processEmail(email, {
              userId: userId || "anonymous",
              accessToken,
            });
          } catch (error) {
            console.error(`[Gmail Sync] Failed to process ${email.id}:`, error);
            skipped++;
            return null;
          }
        })
      );
      processed.push(...results.filter((r): r is PipelineResult => r !== null));
    }

    return NextResponse.json<ApiResponse<SyncResponse>>({
      success: true,
      data: {
        processed,
        skipped,
        nextPageToken,
        totalEstimate,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /gmail/sync] Error:", error);
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

// ============================================================
// API: Generate Reply — Agent 4 standalone endpoint
// POST /api/agents/reply
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyzeEmail } from "@/agents/inbox-analyzer";
import { handleDivisionEmail } from "@/agents/division-agents";
import { evaluateDraft } from "@/agents/evaluator";
import { createGmailClient, fetchEmail } from "@/lib/gmail";
import type { ApiResponse, DraftReplies, DraftReply, ReplyTone } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, accessToken } = body as { emailId: string; accessToken: string };

    if (!emailId || !accessToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, error: "emailId and accessToken are required", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const gmail = createGmailClient(accessToken);
    const rawEmail = await fetchEmail(gmail, emailId);

    if (!rawEmail) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, error: `Email ${emailId} not found`, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const analyzed = await analyzeEmail(rawEmail);

    // Simple routing logic based on text
    let division: "CS" | "Logistik" | "Finance" = "CS";
    const text = (analyzed.rawEmail.snippet + " " + analyzed.subject).toLowerCase();
    if (text.includes("kirim") || text.includes("resi") || text.includes("kurir") || text.includes("lambat")) {
      division = "Logistik";
    } else if (text.includes("refund") || text.includes("bayar") || text.includes("uang") || text.includes("tagih")) {
      division = "Finance";
    }

    const { draft, contextText } = await handleDivisionEmail(analyzed, division);
    const evaluation = await evaluateDraft(analyzed, draft, contextText);

    const draftReplies: DraftReplies = {
      drafts: [
        {
          body: draft,
          tone: "formal",
          // @ts-ignore
          evaluation,
        }
      ],
      quickActions: [],
      suggestedTones: ["formal"],
      isAutoReplySafe: !evaluation.hallucination_detected && evaluation.accuracy > 80,
    };

    return NextResponse.json<ApiResponse<DraftReplies>>({
      success: true,
      data: draftReplies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/reply] Error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: error instanceof Error ? error.message : "Internal server error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

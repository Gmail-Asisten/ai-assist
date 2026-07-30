// ============================================================
// API: Generate Reply — Standalone reply endpoint
// POST /api/agents/reply
//
// Generates a contextual reply draft using Gemini directly,
// NOT the division agent pipeline (which is for enterprise CS).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import { createGmailClient, fetchEmail } from "@/lib/gmail";
import type { ApiResponse, DraftReplies } from "@/types";

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

    // Extract email context
    const sender = rawEmail.fromName || rawEmail.from || "pengirim";
    const subject = rawEmail.subject || "(tanpa subjek)";
    const emailBody = rawEmail.bodyText || rawEmail.snippet || "";

    // Generate a contextual reply using Gemini directly
    const draft = await generateText({
      systemPrompt: `Anda adalah asisten email AI yang membantu menulis balasan email yang profesional dan relevan.
Aturan:
- Balas sesuai konteks dan isi email yang diterima
- Gunakan bahasa yang sama dengan email pengirim (jika bahasa Indonesia, balas bahasa Indonesia; jika Inggris, balas Inggris)
- Jangan mengarang fakta atau informasi yang tidak ada di email asli
- Buat balasan yang ringkas, sopan, dan to-the-point
- Jangan tambahkan signature/tanda tangan
- Jangan sertakan "Subject:" di awal balasan
- Langsung mulai dengan salam pembuka yang sesuai`,

      userPrompt: `Buatkan balasan untuk email berikut:

Dari: ${sender}
Subjek: ${subject}
Isi email:
${emailBody.slice(0, 3000)}

Tulis balasan email yang relevan dan profesional:`,

      temperature: 0.7,
      maxTokens: 1024,
    });

    const draftReplies: DraftReplies = {
      drafts: [
        {
          body: draft.trim(),
          tone: "formal",
        }
      ],
      quickActions: [],
      suggestedTones: ["formal", "casual", "friendly"],
      isAutoReplySafe: false,
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

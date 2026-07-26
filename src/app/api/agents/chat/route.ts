import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatHistory, emailContext, prompt, accessToken } = body;

    if (!prompt || !emailContext) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, error: "Missing required fields", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // Build the system instructions using the email context
    const systemPrompt = `You are a helpful AI assistant inside an email inbox application.
You are helping the user with the following email:
From: ${emailContext.from}
To: ${emailContext.to}
Date: ${emailContext.date}
Subject: ${emailContext.subject}

Email Body:
${emailContext.bodyPlain || "No plain text body available."}

Respond to the user's queries based on this email context. Be concise and helpful.`;

    // Format history into the user prompt
    const formattedHistoryText = chatHistory
      .filter((msg: any) => msg.role !== "system")
      .map((msg: any) => `${msg.role === "ai" ? "Assistant" : "User"}: ${msg.content}`)
      .join("\n\n");

    const fullUserPrompt = `${formattedHistoryText}\n\nUser: ${prompt}\nAssistant:`;

    // Generate response using Gemini
    const responseText = await generateText({
      systemPrompt: systemPrompt,
      userPrompt: fullUserPrompt,
      model: "gemini-3.5-flash",
      temperature: 0.7,
      maxTokens: 1024,
    });

    return NextResponse.json<ApiResponse<{ response: string }>>({
      success: true,
      data: { response: responseText },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/chat] Error:", error);
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

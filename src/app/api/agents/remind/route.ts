// ============================================================
// API: Schedule Reminder — Agent 5 standalone endpoint
// POST /api/agents/remind
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { analyzeEmail } from "@/agents/inbox-analyzer";
import { classifyEmail } from "@/agents/priority-classifier";
import { scheduleReminders, createSnoozeReminder } from "@/agents/reminder-scheduler";
import { createGmailClient, fetchEmail } from "@/lib/gmail";
import type { ApiResponse, ScheduledReminder } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      emailId,
      accessToken,
      // For manual snooze
      snoozeUntil,
      customMessage,
    } = body as {
      emailId: string;
      accessToken: string;
      snoozeUntil?: string;
      customMessage?: string;
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

    // Manual snooze — no AI needed
    if (snoozeUntil) {
      const reminder = createSnoozeReminder(
        emailId,
        rawEmail.threadId,
        rawEmail.subject,
        rawEmail.fromName,
        snoozeUntil,
        customMessage
      );

      return NextResponse.json<ApiResponse<ScheduledReminder[]>>({
        success: true,
        data: [reminder],
        timestamp: new Date().toISOString(),
      });
    }

    // AI-powered reminder scheduling
    const analyzed = await analyzeEmail(rawEmail);
    const classified = await classifyEmail(analyzed);
    const reminders = await scheduleReminders(analyzed, classified);

    return NextResponse.json<ApiResponse<ScheduledReminder[]>>({
      success: true,
      data: reminders,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/remind] Error:", error);
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

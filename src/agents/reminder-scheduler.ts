// ============================================================
// Agent 5: Reminder Scheduler
// Mengelola pengingat untuk follow-up, deadline, dan email penting.
// ============================================================

import { generateJSON } from "@/lib/gemini";
import { generateId, now } from "@/lib/utils";
import {
  REMINDER_SYSTEM_PROMPT,
  reminderUserPrompt,
} from "./prompts/reminder.prompt";
import { DEFAULT_AGENT_CONFIGS } from "@/types/agent";
import type {
  AnalyzedEmail,
  ClassifiedEmail,
  ScheduledReminder,
  ReminderType,
  EscalationLevel,
} from "@/types/email";

// Output shape from the LLM
interface ReminderLLMOutput {
  needsReminder: boolean;
  reminders: {
    type: ReminderType;
    remindAt: string;
    message: string;
    escalationLevel: EscalationLevel;
    relatedDeadline: string | null;
  }[];
  reasoning: string;
}

/**
 * Determine and schedule reminders for an email.
 */
export async function scheduleReminders(
  analyzed: AnalyzedEmail,
  classified: ClassifiedEmail
): Promise<ScheduledReminder[]> {
  const config = DEFAULT_AGENT_CONFIGS["reminder-scheduler"];

  // Quick check: skip if no deadlines and low priority
  if (
    classified.priority >= 3 &&
    analyzed.entities.deadlines.length === 0 &&
    !analyzed.needsReply
  ) {
    return [];
  }

  // Prepare compact analysis for the LLM
  const analysisContext = JSON.stringify(
    {
      emailId: analyzed.emailId,
      from: analyzed.fromName,
      subject: analyzed.subject,
      intent: analyzed.intent,
      deadlines: analyzed.entities.deadlines,
      actionRequired: analyzed.entities.actionRequired,
      needsReply: analyzed.needsReply,
      sentiment: analyzed.sentiment,
    },
    null,
    2
  );

  const classificationContext = JSON.stringify(
    {
      priority: classified.priority,
      priorityLabel: classified.priorityLabel,
      routing: classified.routing,
    },
    null,
    2
  );

  // Call LLM for reminder scheduling
  const llmOutput = await generateJSON<ReminderLLMOutput>({
    model: config.model,
    systemPrompt: REMINDER_SYSTEM_PROMPT,
    userPrompt: reminderUserPrompt(analysisContext, classificationContext),
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  if (!llmOutput.needsReminder || !llmOutput.reminders?.length) {
    return [];
  }

  // Build scheduled reminders
  const currentTime = new Date();
  const reminders: ScheduledReminder[] = llmOutput.reminders
    .filter((r) => {
      // Filter out reminders in the past
      const reminderTime = new Date(r.remindAt);
      return reminderTime > currentTime;
    })
    .map((r) => ({
      id: generateId(),
      emailId: analyzed.emailId,
      threadId: analyzed.threadId,
      type: r.type || "follow_up",
      remindAt: r.remindAt,
      message: r.message,
      emailSubject: analyzed.subject,
      emailFrom: analyzed.fromName,
      escalationLevel: r.escalationLevel || 0,
      isActive: true,
      relatedDeadline: r.relatedDeadline || null,
    }));

  return reminders;
}

/**
 * Create a manual snooze reminder.
 */
export function createSnoozeReminder(
  emailId: string,
  threadId: string,
  subject: string,
  fromName: string,
  snoozeUntil: string, // ISO timestamp
  customMessage?: string
): ScheduledReminder {
  return {
    id: generateId(),
    emailId,
    threadId,
    type: "snooze",
    remindAt: snoozeUntil,
    message:
      customMessage || `Kamu men-snooze email "${subject}" dari ${fromName}. Waktunya untuk follow-up!`,
    emailSubject: subject,
    emailFrom: fromName,
    escalationLevel: 0,
    isActive: true,
    relatedDeadline: null,
  };
}

/**
 * Get snooze presets relative to current time.
 */
export function getSnoozePresets(): { label: string; getTime: () => string }[] {
  return [
    {
      label: "1 jam lagi",
      getTime: () => {
        const d = new Date();
        d.setHours(d.getHours() + 1);
        return d.toISOString();
      },
    },
    {
      label: "3 jam lagi",
      getTime: () => {
        const d = new Date();
        d.setHours(d.getHours() + 3);
        return d.toISOString();
      },
    },
    {
      label: "Besok pagi (09:00)",
      getTime: () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        return d.toISOString();
      },
    },
    {
      label: "Senin depan (09:00)",
      getTime: () => {
        const d = new Date();
        const daysUntilMonday = ((8 - d.getDay()) % 7) || 7;
        d.setDate(d.getDate() + daysUntilMonday);
        d.setHours(9, 0, 0, 0);
        return d.toISOString();
      },
    },
    {
      label: "Minggu depan",
      getTime: () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        d.setHours(9, 0, 0, 0);
        return d.toISOString();
      },
    },
  ];
}

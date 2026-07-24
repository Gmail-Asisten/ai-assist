// ============================================================
// Agent 3: Summary Generator
// Merangkum email panjang/thread menjadi poin-poin kunci.
// ============================================================

import { generateJSON } from "@/lib/gemini";
import { htmlToPlainText } from "@/lib/gmail";
import {
  SUMMARIZER_SYSTEM_PROMPT,
  summarizerUserPrompt,
} from "./prompts/summarizer.prompt";
import { emailContentBlock, threadContentBlock } from "./prompts/common.prompt";
import { DEFAULT_AGENT_CONFIGS } from "@/types/agent";
import type {
  RawEmail,
  AnalyzedEmail,
  EmailSummary,
  ActionItem,
  ExtractedDate,
  ParticipantSummary,
} from "@/types/email";

// Output shape from the LLM
interface SummarizerLLMOutput {
  summary: {
    oneLiner: string;
    detailed: string[];
  };
  actionItems: {
    action: string;
    assignedTo: string;
    deadline: string | null;
    isCompleted: boolean;
    priority: "urgent" | "high" | "medium" | "low";
  }[];
  keyDecisions: string[];
  keyDates: {
    text: string;
    iso: string;
    isDeadline: boolean;
  }[];
  participantSummary?: {
    name: string;
    email: string;
    role: string;
    messageCount: number;
  }[];
}

/**
 * Generate a summary for a single email.
 */
export async function summarizeEmail(
  analyzed: AnalyzedEmail
): Promise<EmailSummary> {
  const config = DEFAULT_AGENT_CONFIGS["summary-generator"];

  const bodyText =
    analyzed.rawEmail.bodyText || htmlToPlainText(analyzed.rawEmail.bodyHtml);

  const emailContent = emailContentBlock({
    from: analyzed.from,
    fromName: analyzed.fromName,
    to: analyzed.rawEmail.to,
    subject: analyzed.subject,
    bodyText,
    date: analyzed.rawEmail.date,
    attachments: analyzed.rawEmail.attachments,
  });

  const llmOutput = await generateJSON<SummarizerLLMOutput>({
    model: config.model,
    systemPrompt: SUMMARIZER_SYSTEM_PROMPT,
    userPrompt: summarizerUserPrompt(emailContent, false),
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  return buildSummary(analyzed.emailId, analyzed.threadId, llmOutput);
}

/**
 * Generate a summary for an email thread (multiple messages).
 */
export async function summarizeThread(
  threadEmails: RawEmail[],
  threadId: string
): Promise<EmailSummary> {
  const config = DEFAULT_AGENT_CONFIGS["summary-generator"];

  const threadMessages = threadEmails.map((email) => ({
    from: email.from,
    fromName: email.fromName,
    subject: email.subject,
    bodyText: email.bodyText || htmlToPlainText(email.bodyHtml),
    date: email.date,
  }));

  const threadContent = threadContentBlock(threadMessages);

  const llmOutput = await generateJSON<SummarizerLLMOutput>({
    model: config.model,
    systemPrompt: SUMMARIZER_SYSTEM_PROMPT,
    userPrompt: summarizerUserPrompt(threadContent, true),
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  const emailId = threadEmails[threadEmails.length - 1]?.id || threadId;

  return buildSummary(emailId, threadId, llmOutput);
}

/**
 * Build EmailSummary from LLM output.
 */
function buildSummary(
  emailId: string,
  threadId: string,
  llmOutput: SummarizerLLMOutput
): EmailSummary {
  const actionItems: ActionItem[] = (llmOutput.actionItems || []).map((item) => ({
    action: item.action,
    assignedTo: item.assignedTo || "user",
    deadline: item.deadline || null,
    isCompleted: item.isCompleted || false,
    priority: item.priority || "medium",
  }));

  const keyDates: ExtractedDate[] = (llmOutput.keyDates || []).map((d) => ({
    text: d.text,
    iso: d.iso,
    isDeadline: d.isDeadline || false,
  }));

  const participantSummary: ParticipantSummary[] | undefined =
    llmOutput.participantSummary?.map((p) => ({
      name: p.name,
      email: p.email,
      role: p.role,
      messageCount: p.messageCount || 1,
    }));

  return {
    emailId,
    threadId,
    summary: {
      oneLiner: llmOutput.summary.oneLiner || "No summary available",
      detailed: llmOutput.summary.detailed || [],
    },
    actionItems,
    keyDecisions: llmOutput.keyDecisions || [],
    keyDates,
    participantSummary,
  };
}

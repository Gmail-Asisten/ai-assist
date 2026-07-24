// ============================================================
// Agent 1: Inbox Analyzer
// Membaca dan mengekstrak informasi kunci dari setiap email.
// ============================================================

import { generateJSON } from "@/lib/gemini";
import { htmlToPlainText } from "@/lib/gmail";
import { wordCount, now } from "@/lib/utils";
import { ANALYZER_SYSTEM_PROMPT, analyzerUserPrompt } from "./prompts/analyzer.prompt";
import { emailContentBlock } from "./prompts/common.prompt";
import { DEFAULT_AGENT_CONFIGS } from "@/types/agent";
import type { RawEmail, AnalyzedEmail, ExtractedEntities, EmailIntent, Sentiment } from "@/types/email";

// Output shape from the LLM
interface AnalyzerLLMOutput {
  intent: EmailIntent;
  entities: {
    people: string[];
    dates: { text: string; iso: string; isDeadline: boolean }[];
    deadlines: { text: string; iso: string; isDeadline: boolean }[];
    amounts: { text: string; value: number; currency: string }[];
    links: string[];
    actionRequired: string | null;
    topics: string[];
  };
  language: string;
  needsReply: boolean;
  sentiment: Sentiment;
}

/**
 * Analyze a raw email and extract structured information.
 */
export async function analyzeEmail(rawEmail: RawEmail): Promise<AnalyzedEmail> {
  const config = DEFAULT_AGENT_CONFIGS["inbox-analyzer"];

  // Get plain text body
  const bodyText = rawEmail.bodyText || htmlToPlainText(rawEmail.bodyHtml);

  // Build email content for the prompt
  const emailContent = emailContentBlock({
    from: rawEmail.from,
    fromName: rawEmail.fromName,
    to: rawEmail.to,
    subject: rawEmail.subject,
    bodyText,
    date: rawEmail.date,
    attachments: rawEmail.attachments,
  });

  // Call LLM for analysis
  const llmOutput = await generateJSON<AnalyzerLLMOutput>({
    model: config.model,
    systemPrompt: ANALYZER_SYSTEM_PROMPT,
    userPrompt: analyzerUserPrompt(emailContent),
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  // Build extracted entities
  const entities: ExtractedEntities = {
    people: llmOutput.entities.people || [],
    dates: llmOutput.entities.dates || [],
    deadlines: llmOutput.entities.deadlines || [],
    amounts: llmOutput.entities.amounts || [],
    links: llmOutput.entities.links || [],
    actionRequired: llmOutput.entities.actionRequired || null,
    topics: llmOutput.entities.topics || [],
  };

  // Construct the analyzed email
  const analyzed: AnalyzedEmail = {
    emailId: rawEmail.id,
    threadId: rawEmail.threadId,
    from: rawEmail.from,
    fromName: rawEmail.fromName,
    subject: rawEmail.subject,
    intent: llmOutput.intent,
    entities,
    language: llmOutput.language || "id",
    needsReply: llmOutput.needsReply,
    hasAttachment: rawEmail.attachments.length > 0,
    sentiment: llmOutput.sentiment,
    wordCount: wordCount(bodyText),
    isThread: rawEmail.isThread,
    threadLength: rawEmail.threadLength || 1,
    rawEmail,
  };

  return analyzed;
}

// ============================================================
// Agent 4: Smart Replier
// Menghasilkan draft balasan email sesuai konteks & gaya user.
// ============================================================

import { generateJSON } from "@/lib/gemini";
import { htmlToPlainText } from "@/lib/gmail";
import { generateId } from "@/lib/utils";
import { REPLIER_SYSTEM_PROMPT, replierUserPrompt } from "./prompts/replier.prompt";
import { emailContentBlock } from "./prompts/common.prompt";
import { DEFAULT_AGENT_CONFIGS } from "@/types/agent";
import type { UserPreferences } from "@/types/agent";
import type {
  AnalyzedEmail,
  DraftReplies,
  DraftReply,
  QuickAction,
  ReplyTone,
} from "@/types/email";

// Output shape from the LLM
interface ReplierLLMOutput {
  drafts: {
    tone: ReplyTone;
    subject: string;
    body: string;
    confidence: number;
  }[];
  quickActions: {
    label: string;
    body: string;
    tone: ReplyTone;
  }[];
}

/**
 * Generate draft replies for an email.
 */
export async function generateReplies(
  analyzed: AnalyzedEmail,
  options: {
    preferredTone?: ReplyTone;
    customInstructions?: string;
    numberOfDrafts?: number;
    userPreferences?: UserPreferences;
  } = {}
): Promise<DraftReplies> {
  const config = DEFAULT_AGENT_CONFIGS["smart-replier"];
  const {
    preferredTone,
    customInstructions,
    numberOfDrafts = 3,
    userPreferences,
  } = options;

  // Build email content for the prompt
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

  // Prepare analysis context (compact, no rawEmail)
  const analysisContext = JSON.stringify(
    {
      intent: analyzed.intent,
      entities: analyzed.entities,
      sentiment: analyzed.sentiment,
      language: analyzed.language,
    },
    null,
    2
  );

  // Call LLM for reply generation
  const llmOutput = await generateJSON<ReplierLLMOutput>({
    model: config.model,
    systemPrompt: REPLIER_SYSTEM_PROMPT,
    userPrompt: replierUserPrompt(emailContent, analysisContext, {
      preferredTone: preferredTone || userPreferences?.defaultReplyTone,
      writingStyleSamples: userPreferences?.writingStyleSamples,
      customInstructions,
      numberOfDrafts,
    }),
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  // Build draft replies with unique IDs
  const drafts: DraftReply[] = (llmOutput.drafts || []).map((draft) => ({
    id: generateId(),
    tone: draft.tone,
    subject: draft.subject || `Re: ${analyzed.subject}`,
    body: draft.body,
    confidence: Math.min(1, Math.max(0, draft.confidence || 0.7)),
    includesContext: draft.body.length > 100, // simple heuristic
  }));

  // Build quick actions
  const quickActions: QuickAction[] = (llmOutput.quickActions || []).map((qa) => ({
    label: qa.label,
    body: qa.body,
    tone: qa.tone || "casual",
  }));

  // Add default quick actions if none provided
  if (quickActions.length === 0) {
    quickActions.push(
      {
        label: "Terima kasih",
        body: analyzed.language === "en"
          ? "Thank you for the information. Noted."
          : "Terima kasih atas informasinya. Noted.",
        tone: "formal",
      },
      {
        label: "Oke siap",
        body: analyzed.language === "en"
          ? "Got it, will do. Thanks!"
          : "Oke siap, akan saya kerjakan. Thanks!",
        tone: "casual",
      },
      {
        label: "Akan saya cek",
        body: analyzed.language === "en"
          ? "I'll review this and get back to you shortly."
          : "Akan saya cek dan kabari secepatnya.",
        tone: "formal",
      }
    );
  }

  return {
    emailId: analyzed.emailId,
    threadId: analyzed.threadId,
    inReplyTo: analyzed.subject,
    drafts,
    quickActions,
  };
}

/**
 * Regenerate a single reply with different tone.
 */
export async function regenerateWithTone(
  analyzed: AnalyzedEmail,
  tone: ReplyTone,
  userPreferences?: UserPreferences
): Promise<DraftReply> {
  const result = await generateReplies(analyzed, {
    preferredTone: tone,
    numberOfDrafts: 1,
    userPreferences,
  });

  return (
    result.drafts[0] || {
      id: generateId(),
      tone,
      subject: `Re: ${analyzed.subject}`,
      body: "Unable to generate reply. Please try again.",
      confidence: 0,
      includesContext: false,
    }
  );
}

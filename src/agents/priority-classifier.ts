// ============================================================
// Agent 2: Priority Classifier
// Menentukan tingkat prioritas email berdasarkan konteks.
// ============================================================

import { generateJSON } from "@/lib/gemini";
import { CLASSIFIER_SYSTEM_PROMPT, classifierUserPrompt } from "./prompts/classifier.prompt";
import { DEFAULT_AGENT_CONFIGS } from "@/types/agent";
import type { UserPreferences } from "@/types/agent";
import type {
  AnalyzedEmail,
  ClassifiedEmail,
  PriorityLevel,
  PriorityLabel,
  PriorityFactor,
  RoutingDecision,
} from "@/types/email";

// Output shape from the LLM
interface ClassifierLLMOutput {
  priority: PriorityLevel;
  priorityLabel: PriorityLabel;
  priorityScore: number;
  priorityFactors: PriorityFactor[];
  routing: RoutingDecision;
}

/**
 * Classify the priority of an analyzed email.
 */
export async function classifyEmail(
  analyzed: AnalyzedEmail,
  userPreferences?: UserPreferences
): Promise<ClassifiedEmail> {
  const config = DEFAULT_AGENT_CONFIGS["priority-classifier"];

  // Prepare analysis JSON for the LLM (exclude rawEmail to save tokens)
  const analysisForLLM = {
    emailId: analyzed.emailId,
    from: analyzed.from,
    fromName: analyzed.fromName,
    subject: analyzed.subject,
    intent: analyzed.intent,
    entities: analyzed.entities,
    language: analyzed.language,
    needsReply: analyzed.needsReply,
    hasAttachment: analyzed.hasAttachment,
    sentiment: analyzed.sentiment,
    wordCount: analyzed.wordCount,
    isThread: analyzed.isThread,
    threadLength: analyzed.threadLength,
  };

  // Call LLM for classification
  const llmOutput = await generateJSON<ClassifierLLMOutput>({
    model: config.model,
    systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
    userPrompt: classifierUserPrompt(JSON.stringify(analysisForLLM, null, 2), userPreferences),
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  // Apply VIP/Muted sender overrides
  let finalPriority = llmOutput.priority;
  let finalLabel = llmOutput.priorityLabel;
  let finalScore = llmOutput.priorityScore;
  const factors = [...llmOutput.priorityFactors];

  if (userPreferences) {
    // VIP sender boost
    if (userPreferences.vipSenders.some((vip) =>
      analyzed.from.toLowerCase().includes(vip.toLowerCase())
    )) {
      finalPriority = Math.min(finalPriority, 1) as PriorityLevel; // At least HIGH
      finalScore = Math.max(finalScore, 80);
      finalLabel = finalPriority === 0 ? "urgent" : "high";
      factors.push({
        factor: "vip_sender",
        score: 100,
        reason: `${analyzed.from} is in VIP sender list`,
      });
    }

    // Muted sender downgrade
    if (userPreferences.mutedSenders.some((muted) =>
      analyzed.from.toLowerCase().includes(muted.toLowerCase())
    )) {
      finalPriority = Math.max(finalPriority, 3) as PriorityLevel; // At most LOW
      finalScore = Math.min(finalScore, 20);
      finalLabel = finalPriority === 4 ? "ignore" : "low";
      factors.push({
        factor: "muted_sender",
        score: 0,
        reason: `${analyzed.from} is in muted sender list`,
      });
    }
  }

  // Ensure routing decisions are consistent
  const routing: RoutingDecision = {
    shouldSummarize:
      llmOutput.routing.shouldSummarize ||
      analyzed.wordCount > 500 ||
      analyzed.isThread,
    shouldDraftReply:
      llmOutput.routing.shouldDraftReply ||
      (analyzed.needsReply && finalPriority <= 1),
    shouldSetReminder:
      llmOutput.routing.shouldSetReminder ||
      analyzed.entities.deadlines.length > 0,
    reasons: llmOutput.routing.reasons || [],
  };

  // Construct classified email
  const classified: ClassifiedEmail = {
    ...analyzed,
    priority: finalPriority,
    priorityLabel: finalLabel,
    priorityScore: finalScore,
    priorityFactors: factors,
    routing,
  };

  return classified;
}

/**
 * Get the priority label display info.
 */
export function getPriorityDisplay(level: PriorityLevel): {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
} {
  const displays = {
    0: { label: "Urgent", emoji: "🔴", color: "#EF4444", bgColor: "#FEE2E2" },
    1: { label: "High", emoji: "🟠", color: "#F97316", bgColor: "#FFEDD5" },
    2: { label: "Medium", emoji: "🟡", color: "#EAB308", bgColor: "#FEF9C3" },
    3: { label: "Low", emoji: "🟢", color: "#22C55E", bgColor: "#DCFCE7" },
    4: { label: "Ignore", emoji: "⚪", color: "#9CA3AF", bgColor: "#F3F4F6" },
  };
  return displays[level];
}

// ============================================================
// Agent Orchestrator
// Mengkoordinasikan semua 5 agent dalam pipeline yang efisien.
//
// Pipeline:
//   Email → Agent 1 (Analyze) → Agent 2 (Classify)
//     ├─→ Agent 3 (Summarize)  [parallel, if routing.shouldSummarize]
//     ├─→ Agent 4 (Reply)      [parallel, if routing.shouldDraftReply]
//     └─→ Agent 5 (Remind)     [parallel, if routing.shouldSetReminder]
// ============================================================

import { analyzeEmail } from "./inbox-analyzer";
import { classifyEmail } from "./priority-classifier";
import { summarizeEmail, summarizeThread } from "./summary-generator";
import { scheduleReminders } from "./reminder-scheduler";
import { handleDivisionEmail } from "./division-agents";
import { evaluateDraft } from "./evaluator";
import { fetchThread, createGmailClient } from "@/lib/gmail";
import { now, withRetry, measureTime } from "@/lib/utils";
import type { UserPreferences } from "@/types/agent";
import type {
  RawEmail,
  PipelineResult,
  PipelineError,
  EmailSummary,
  DraftReplies,
  ScheduledReminder,
  ClassifiedEmail,
  AnalyzedEmail,
} from "@/types/email";

export interface OrchestratorOptions {
  userId: string;
  accessToken?: string; // for fetching thread if needed
  userPreferences?: UserPreferences;
  skipAgents?: ("summary" | "reply" | "reminder")[]; // skip specific agents
}

/**
 * Process a single email through the full agent pipeline.
 * This is the main entry point for email processing.
 */
export async function processEmail(
  rawEmail: RawEmail,
  options: OrchestratorOptions
): Promise<PipelineResult> {
  const startTime = performance.now();
  const errors: PipelineError[] = [];
  const { userPreferences, skipAgents = [] } = options;

  // ─── Stage 1: Inbox Analyzer (sequential, required) ─────────
  let analyzed: AnalyzedEmail;
  try {
    analyzed = await withRetry(() => analyzeEmail(rawEmail), {
      maxRetries: 2,
      onRetry: (attempt, error) => {
        console.warn(`[Orchestrator] Analyzer retry ${attempt}:`, error.message);
      },
    });
    console.log(`[Orchestrator] ✅ Agent 1 (Analyzer) completed for ${rawEmail.id}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Orchestrator] ❌ Agent 1 (Analyzer) failed:`, errMsg);
    errors.push({
      agent: "inbox-analyzer",
      error: errMsg,
      timestamp: now(),
    });

    // Can't continue without analysis
    return buildErrorResult(rawEmail, errors, startTime);
  }

  // ─── Stage 2: Priority Classifier (sequential, required) ────
  let classified: ClassifiedEmail;
  try {
    classified = await withRetry(
      () => classifyEmail(analyzed, userPreferences),
      { maxRetries: 2 }
    );
    console.log(
      `[Orchestrator] ✅ Agent 2 (Classifier) completed: ${classified.priorityLabel} (P${classified.priority})`
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Orchestrator] ❌ Agent 2 (Classifier) failed:`, errMsg);
    errors.push({
      agent: "priority-classifier",
      error: errMsg,
      timestamp: now(),
    });

    // Use a fallback classification
    classified = {
      ...analyzed,
      priority: 2,
      priorityLabel: "medium",
      priorityScore: 50,
      priorityFactors: [{ factor: "fallback", score: 50, reason: "Classification failed, using default" }],
      routing: {
        shouldSummarize: analyzed.wordCount > 500 || analyzed.isThread,
        shouldDraftReply: analyzed.needsReply,
        shouldSetReminder: analyzed.entities.deadlines.length > 0,
        reasons: ["Fallback routing due to classifier error"],
      },
    };
  }

  // ─── Stage 3: Parallel agents based on routing decision ─────
  const parallelTasks: Promise<void>[] = [];

  let summary: EmailSummary | null = null;
  let draftReplies: DraftReplies | null = null;
  let reminders: ScheduledReminder[] = [];

  // Agent 3: Summary Generator
  if (classified.routing.shouldSummarize && !skipAgents.includes("summary")) {
    parallelTasks.push(
      (async () => {
        try {
          // If it's a thread and we have an access token, fetch full thread
          if (analyzed.isThread && options.accessToken) {
            const gmail = createGmailClient(options.accessToken);
            const threadEmails = await fetchThread(gmail, analyzed.threadId);
            if (threadEmails.length > 1) {
              summary = await withRetry(
                () => summarizeThread(threadEmails, analyzed.threadId),
                { maxRetries: 1 }
              );
              console.log(`[Orchestrator] ✅ Agent 3 (Summary) completed for thread`);
              return;
            }
          }

          // Single email summary
          summary = await withRetry(() => summarizeEmail(analyzed), {
            maxRetries: 1,
          });
          console.log(`[Orchestrator] ✅ Agent 3 (Summary) completed`);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Orchestrator] ❌ Agent 3 (Summary) failed:`, errMsg);
          errors.push({
            agent: "summary-generator",
            error: errMsg,
            timestamp: now(),
          });
        }
      })()
    );
  }

  // Agent 4: Division Agent & Evaluator
  if (!skipAgents.includes("reply")) {
    parallelTasks.push(
      (async () => {
        try {
          // Route to division based on content
          let division: "CS" | "Logistik" | "Finance" = "CS";
          const text = (analyzed.rawEmail.snippet + " " + analyzed.subject).toLowerCase();
          if (text.includes("kirim") || text.includes("resi") || text.includes("kurir") || text.includes("lambat")) {
            division = "Logistik";
          } else if (text.includes("refund") || text.includes("bayar") || text.includes("uang") || text.includes("tagih")) {
            division = "Finance";
          }

          console.log(`[Orchestrator] Routing to ${division} Agent...`);
          
          const { draft, usedKnowledge, contextText } = await handleDivisionEmail(analyzed, division);
          
          console.log(`[Orchestrator] Evaluating draft from ${division} Agent...`);
          const evaluation = await evaluateDraft(analyzed, draft, contextText);

          draftReplies = {
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
            handledByDivision: division,
          };
          
          console.log(
            `[Orchestrator] ✅ Agent 4 (Division & Evaluator) completed.`
          );
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Orchestrator] ❌ Agent 4 (Division) failed:`, errMsg);
          errors.push({
            agent: "division-agent",
            error: errMsg,
            timestamp: now(),
          });
        }
      })()
    );
  }

  // Agent 5: Reminder Scheduler
  if (classified.routing.shouldSetReminder && !skipAgents.includes("reminder")) {
    parallelTasks.push(
      (async () => {
        try {
          reminders = await withRetry(
            () => scheduleReminders(analyzed, classified),
            { maxRetries: 1 }
          );
          console.log(
            `[Orchestrator] ✅ Agent 5 (Reminder) completed: ${reminders.length} reminders`
          );
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Orchestrator] ❌ Agent 5 (Reminder) failed:`, errMsg);
          errors.push({
            agent: "reminder-scheduler",
            error: errMsg,
            timestamp: now(),
          });
        }
      })()
    );
  }

  // Wait for all parallel agents to complete
  await Promise.all(parallelTasks);

  // ─── Build Final Result ─────────────────────────────────────
  const processingTimeMs = Math.round(performance.now() - startTime);

  const result: PipelineResult = {
    emailId: rawEmail.id,
    threadId: rawEmail.threadId,
    analysis: analyzed,
    classification: classified,
    summary,
    draftReplies,
    reminders,
    processedAt: now(),
    processingTimeMs,
    errors,
  };

  console.log(
    `[Orchestrator] 🏁 Pipeline completed for ${rawEmail.id} in ${processingTimeMs}ms ` +
      `(P${classified.priority}, ${errors.length} errors)`
  );

  return result;
}

/**
 * Process multiple emails in batch.
 */
export async function processBatch(
  rawEmails: RawEmail[],
  options: OrchestratorOptions,
  concurrency: number = 3
): Promise<PipelineResult[]> {
  const results: PipelineResult[] = [];

  // Process in batches to respect rate limits
  for (let i = 0; i < rawEmails.length; i += concurrency) {
    const batch = rawEmails.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((email) => processEmail(email, options))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Build a minimal error result when pipeline fails early.
 */
function buildErrorResult(
  rawEmail: RawEmail,
  errors: PipelineError[],
  startTime: number
): PipelineResult {
  return {
    emailId: rawEmail.id,
    threadId: rawEmail.threadId,
    analysis: {
      emailId: rawEmail.id,
      threadId: rawEmail.threadId,
      from: rawEmail.from,
      fromName: rawEmail.fromName,
      subject: rawEmail.subject,
      intent: "inform",
      entities: {
        people: [],
        dates: [],
        deadlines: [],
        amounts: [],
        links: [],
        actionRequired: null,
        topics: [],
      },
      language: "id",
      needsReply: false,
      hasAttachment: rawEmail.attachments.length > 0,
      sentiment: "neutral",
      wordCount: 0,
      isThread: rawEmail.isThread,
      threadLength: rawEmail.threadLength || 1,
      rawEmail,
    },
    classification: {
      emailId: rawEmail.id,
      threadId: rawEmail.threadId,
      from: rawEmail.from,
      fromName: rawEmail.fromName,
      subject: rawEmail.subject,
      intent: "inform",
      entities: {
        people: [],
        dates: [],
        deadlines: [],
        amounts: [],
        links: [],
        actionRequired: null,
        topics: [],
      },
      language: "id",
      needsReply: false,
      hasAttachment: false,
      sentiment: "neutral",
      wordCount: 0,
      isThread: false,
      threadLength: 1,
      rawEmail,
      priority: 2,
      priorityLabel: "medium",
      priorityScore: 50,
      priorityFactors: [],
      routing: {
        shouldSummarize: false,
        shouldDraftReply: false,
        shouldSetReminder: false,
        reasons: ["Pipeline failed"],
      },
    },
    summary: null,
    draftReplies: null,
    reminders: [],
    processedAt: now(),
    processingTimeMs: Math.round(performance.now() - startTime),
    errors,
  };
}

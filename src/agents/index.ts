// ============================================================
// AI Agents — Public API
// Export semua agent functions untuk digunakan oleh frontend & API
// ============================================================

// Agent 1: Inbox Analyzer
export { analyzeEmail } from "./inbox-analyzer";

// Agent 2: Priority Classifier
export { classifyEmail, getPriorityDisplay } from "./priority-classifier";

// Agent 3: Summary Generator
export { summarizeEmail, summarizeThread } from "./summary-generator";

// Agent 4: Smart Replier
export { generateReplies, regenerateWithTone } from "./smart-replier";

// Agent 5: Reminder Scheduler
export {
  scheduleReminders,
  createSnoozeReminder,
  getSnoozePresets,
} from "./reminder-scheduler";

// Orchestrator
export { processEmail, processBatch } from "./orchestrator";
export type { OrchestratorOptions } from "./orchestrator";

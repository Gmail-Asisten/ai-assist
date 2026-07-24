// ============================================================
// Agent Types — Configuration & state for multi-agent system
// ============================================================

import type {
  AnalyzedEmail,
  ClassifiedEmail,
  EmailSummary,
  DraftReplies,
  ScheduledReminder,
  PipelineResult,
  ReplyTone,
} from "./email";

// ============================================================
// Agent Definitions
// ============================================================

export type AgentName =
  | "inbox-analyzer"
  | "priority-classifier"
  | "summary-generator"
  | "smart-replier"
  | "reminder-scheduler";

export type AgentStatus =
  | "idle"
  | "processing"
  | "completed"
  | "error"
  | "skipped";

export interface AgentState {
  name: AgentName;
  status: AgentStatus;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  retryCount: number;
}

// ============================================================
// Agent Configs
// ============================================================

export interface AgentConfig {
  maxRetries: number;
  timeoutMs: number;
  model: string; // "gemini-2.5-pro" etc
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_AGENT_CONFIGS: Record<AgentName, AgentConfig> = {
  "inbox-analyzer": {
    maxRetries: 2,
    timeoutMs: 15000,
    model: "gemini-2.5-flash",
    temperature: 0.1,
    maxTokens: 2048,
  },
  "priority-classifier": {
    maxRetries: 2,
    timeoutMs: 10000,
    model: "gemini-2.5-flash",
    temperature: 0.0,
    maxTokens: 1024,
  },
  "summary-generator": {
    maxRetries: 2,
    timeoutMs: 20000,
    model: "gemini-2.5-pro",
    temperature: 0.3,
    maxTokens: 4096,
  },
  "smart-replier": {
    maxRetries: 2,
    timeoutMs: 20000,
    model: "gemini-2.5-pro",
    temperature: 0.7,
    maxTokens: 4096,
  },
  "reminder-scheduler": {
    maxRetries: 1,
    timeoutMs: 10000,
    model: "gemini-2.5-flash",
    temperature: 0.0,
    maxTokens: 1024,
  },
};

// ============================================================
// Orchestrator Types
// ============================================================

export interface OrchestratorRequest {
  userId: string;
  emailId: string;
  threadId: string;
  rawEmailData: string; // JSON string of RawEmail
  userPreferences?: UserPreferences;
}

export interface OrchestratorProgress {
  emailId: string;
  agents: AgentState[];
  currentAgent: AgentName | null;
  overallStatus: "processing" | "completed" | "partial" | "failed";
  result: Partial<PipelineResult> | null;
}

// ============================================================
// User Preferences (affects agent behavior)
// ============================================================

export interface UserPreferences {
  language: "id" | "en" | "auto";
  defaultReplyTone: ReplyTone;
  vipSenders: string[]; // email addresses always marked high priority
  mutedSenders: string[]; // email addresses always marked low
  priorityKeywords: PriorityKeyword[];
  quietHours: QuietHours;
  summaryLength: "short" | "medium" | "detailed";
  autoReminders: boolean;
  writingStyleSamples: string[]; // past email samples for style matching
}

export interface PriorityKeyword {
  keyword: string;
  boostLevel: number; // -2 to +2
}

export interface QuietHours {
  enabled: boolean;
  start: string; // "22:00"
  end: string; // "07:00"
  timezone: string; // "Asia/Jakarta"
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: "auto",
  defaultReplyTone: "formal",
  vipSenders: [],
  mutedSenders: [],
  priorityKeywords: [],
  quietHours: {
    enabled: true,
    start: "22:00",
    end: "07:00",
    timezone: "Asia/Jakarta",
  },
  summaryLength: "medium",
  autoReminders: true,
  writingStyleSamples: [],
};

// ============================================================
// Feedback Types (for learning loop)
// ============================================================

export type FeedbackType =
  | "reclassify_priority"
  | "edit_reply"
  | "dismiss_summary"
  | "dismiss_reminder"
  | "approve_reply"
  | "mark_helpful"
  | "mark_unhelpful";

export interface UserFeedback {
  userId: string;
  emailId: string;
  agentName: AgentName;
  feedbackType: FeedbackType;
  originalValue: unknown;
  correctedValue: unknown;
  timestamp: string;
}

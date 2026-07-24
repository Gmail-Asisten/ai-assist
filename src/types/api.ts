// ============================================================
// API Request / Response Types
// ============================================================

import type {
  PipelineResult,
  RawEmail,
  EmailSummary,
  DraftReplies,
  ScheduledReminder,
  ClassifiedEmail,
  ReplyTone,
  PriorityLevel,
  ReminderType,
} from "./email";
import type { UserPreferences, OrchestratorProgress } from "./agent";

// ============================================================
// Orchestrator API
// ============================================================

export interface ProcessEmailRequest {
  emailId: string;
  threadId: string;
  forceReprocess?: boolean;
}

export interface ProcessEmailResponse {
  success: boolean;
  data: PipelineResult | null;
  error?: string;
}

// ============================================================
// Gmail Sync API
// ============================================================

export interface SyncInboxRequest {
  maxResults?: number; // default 20
  pageToken?: string;
  labelIds?: string[];
  query?: string; // Gmail search query
}

export interface SyncInboxResponse {
  success: boolean;
  emails: RawEmail[];
  nextPageToken: string | null;
  totalEstimate: number;
}

// ============================================================
// Agent APIs (Individual)
// ============================================================

export interface AnalyzeRequest {
  rawEmail: RawEmail;
}

export interface ClassifyRequest {
  emailId: string;
  userPreferences?: UserPreferences;
}

export interface SummarizeRequest {
  emailId: string;
  includeThread?: boolean;
}

export interface ReplyRequest {
  emailId: string;
  tone?: ReplyTone;
  customInstructions?: string;
  numberOfDrafts?: number; // default 3
}

export interface RemindRequest {
  emailId: string;
  type?: ReminderType;
  customTime?: string; // ISO timestamp
  customMessage?: string;
}

// ============================================================
// Send Reply API
// ============================================================

export interface SendReplyRequest {
  emailId: string;
  draftId: string;
  editedBody?: string; // if user edited the draft
}

export interface SendReplyResponse {
  success: boolean;
  gmailMessageId: string | null;
  error?: string;
}

// ============================================================
// Feedback API
// ============================================================

export interface SubmitFeedbackRequest {
  emailId: string;
  feedbackType: string;
  originalValue: unknown;
  correctedValue: unknown;
}

// ============================================================
// Reminders API
// ============================================================

export interface UpdateReminderRequest {
  reminderId: string;
  action: "snooze" | "dismiss" | "reschedule";
  newTime?: string; // ISO timestamp for reschedule/snooze
}

// ============================================================
// Stats API
// ============================================================

export interface DashboardStats {
  totalEmails: number;
  urgentCount: number;
  pendingReplies: number;
  activeReminders: number;
  processedToday: number;
  priorityBreakdown: Record<PriorityLevel, number>;
  aiAccuracy: number; // percentage based on feedback
  estimatedTimeSaved: number; // minutes
}

// ============================================================
// Generic API Response Wrapper
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: string;
  timestamp: string;
}

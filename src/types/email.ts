// ============================================================
// Email Types — Used across all agents
// ============================================================

export type EmailIntent =
  | "request_action"
  | "inform"
  | "question"
  | "social"
  | "newsletter"
  | "notification"
  | "spam"
  | "follow_up"
  | "approval"
  | "introduction";

export type PriorityLevel = 0 | 1 | 2 | 3 | 4;

export type PriorityLabel = "urgent" | "high" | "medium" | "low" | "ignore";

export type Sentiment = "positive" | "negative" | "neutral" | "urgent";

export type ReplyTone = "formal" | "casual" | "friendly" | "assertive";

export type ReminderType = "deadline" | "follow_up" | "snooze" | "custom";

export type EscalationLevel = 0 | 1 | 2 | 3; // gentle → important → urgent → overdue

// ============================================================
// Raw Email (from Gmail API)
// ============================================================

export interface RawEmail {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  to: string[];
  cc: string[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
  snippet: string;
  date: string; // ISO timestamp
  labels: string[];
  attachments: AttachmentMeta[];
  isRead: boolean;
  isThread: boolean;
  threadLength?: number;
}

export interface AttachmentMeta {
  filename: string;
  mimeType: string;
  size: number; // bytes
  attachmentId: string;
}

// ============================================================
// Agent 1 Output: Inbox Analyzer
// ============================================================

export interface AnalyzedEmail {
  emailId: string;
  threadId: string;
  from: string;
  fromName: string;
  subject: string;
  intent: EmailIntent;
  entities: ExtractedEntities;
  language: string; // "id" | "en" | etc
  needsReply: boolean;
  hasAttachment: boolean;
  sentiment: Sentiment;
  wordCount: number;
  isThread: boolean;
  threadLength: number;
  rawEmail: RawEmail;
}

export interface ExtractedEntities {
  people: string[];
  dates: ExtractedDate[];
  deadlines: ExtractedDate[];
  amounts: ExtractedAmount[];
  links: string[];
  actionRequired: string | null;
  topics: string[];
}

export interface ExtractedDate {
  text: string; // original text: "Jumat 28 Juli"
  iso: string; // ISO format: "2026-07-28"
  isDeadline: boolean;
}

export interface ExtractedAmount {
  text: string; // "Rp 500jt"
  value: number; // 500000000
  currency: string; // "IDR"
}

// ============================================================
// Agent 2 Output: Priority Classifier
// ============================================================

export interface ClassifiedEmail extends AnalyzedEmail {
  priority: PriorityLevel;
  priorityLabel: PriorityLabel;
  priorityScore: number; // 0-100
  priorityFactors: PriorityFactor[];
  routing: RoutingDecision;
}

export interface PriorityFactor {
  factor: string; // "sender_importance" | "deadline_proximity" | "intent_urgency"
  score: number; // 0-100
  reason: string; // "Email from boss@company.com (VIP sender)"
}

export interface RoutingDecision {
  shouldSummarize: boolean;
  shouldDraftReply: boolean;
  shouldSetReminder: boolean;
  reasons: string[];
}

// ============================================================
// Agent 3 Output: Summary Generator
// ============================================================

export interface EmailSummary {
  emailId: string;
  threadId: string;
  summary: {
    oneLiner: string;
    detailed: string[];
  };
  actionItems: ActionItem[];
  keyDecisions: string[];
  keyDates: ExtractedDate[];
  participantSummary?: ParticipantSummary[]; // for threads
}

export interface ActionItem {
  action: string;
  assignedTo: string; // "user" | person name
  deadline: string | null; // ISO date
  isCompleted: boolean;
  priority: PriorityLabel;
}

export interface ParticipantSummary {
  name: string;
  email: string;
  role: string; // "initiated", "approved", "requested changes"
  messageCount: number;
}

// ============================================================
// Agent 4 Output: Smart Replier
// ============================================================

export interface DraftReplies {
  emailId: string;
  threadId: string;
  inReplyTo: string; // original email subject
  drafts: DraftReply[];
  quickActions: QuickAction[];
  handledByDivision?: string;
}

export interface DraftReply {
  id: string;
  tone: ReplyTone;
  subject: string;
  body: string;
  confidence: number; // 0-1, how confident the AI is
  includesContext: boolean;
}

export interface QuickAction {
  label: string; // "Terima kasih", "Oke siap", etc.
  body: string;
  tone: ReplyTone;
}

// ============================================================
// Agent 5 Output: Reminder Scheduler
// ============================================================

export interface ScheduledReminder {
  id: string;
  emailId: string;
  threadId: string;
  type: ReminderType;
  remindAt: string; // ISO timestamp
  message: string;
  emailSubject: string;
  emailFrom: string;
  escalationLevel: EscalationLevel;
  isActive: boolean;
  relatedDeadline: string | null; // ISO date
}

// ============================================================
// Orchestrator: Full Pipeline Result
// ============================================================

export interface PipelineResult {
  emailId: string;
  threadId: string;
  analysis: AnalyzedEmail;
  classification: ClassifiedEmail;
  summary: EmailSummary | null;
  draftReplies: DraftReplies | null;
  reminders: ScheduledReminder[];
  processedAt: string; // ISO timestamp
  processingTimeMs: number;
  errors: PipelineError[];
}

export interface PipelineError {
  agent: string;
  error: string;
  timestamp: string;
}

// ============================================================
// Utility Functions — Shared across the application
// ============================================================

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Get current ISO timestamp.
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Calculate word count from text.
 */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Parse a date string to ISO format.
 * Handles various formats commonly found in emails.
 */
export function parseEmailDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return new Date().toISOString();
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Calculate days until a deadline from now.
 */
export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const today = new Date();
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a time is within quiet hours.
 */
export function isQuietHours(
  startHour: string,
  endHour: string,
  timezone: string
): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    });
    const currentHour = parseInt(formatter.format(now), 10);

    const start = parseInt(startHour.split(":")[0], 10);
    const end = parseInt(endHour.split(":")[0], 10);

    if (start > end) {
      // Overnight quiet hours (e.g., 22:00 - 07:00)
      return currentHour >= start || currentHour < end;
    }
    return currentHour >= start && currentHour < end;
  } catch {
    return false;
  }
}

/**
 * Calculate smart reminder time based on deadline.
 * Returns ISO timestamps for each escalation level.
 */
export function calculateReminderTimes(
  deadlineIso: string,
  timezone: string = "Asia/Jakarta"
): { level: number; time: string; label: string }[] {
  const deadline = new Date(deadlineIso);
  const daysLeft = daysUntil(deadlineIso);
  const reminders: { level: number; time: string; label: string }[] = [];

  if (daysLeft > 3) {
    // D-3: gentle reminder at 9 AM
    const d3 = new Date(deadline);
    d3.setDate(d3.getDate() - 3);
    d3.setHours(9, 0, 0, 0);
    reminders.push({ level: 0, time: d3.toISOString(), label: "Gentle reminder (D-3)" });
  }

  if (daysLeft > 1) {
    // D-1: important reminder at 9 AM
    const d1 = new Date(deadline);
    d1.setDate(d1.getDate() - 1);
    d1.setHours(9, 0, 0, 0);
    reminders.push({ level: 1, time: d1.toISOString(), label: "Important reminder (D-1)" });
  }

  if (daysLeft > 0) {
    // D-0: urgent reminder at 8 AM
    const d0 = new Date(deadline);
    d0.setHours(8, 0, 0, 0);
    reminders.push({ level: 2, time: d0.toISOString(), label: "Urgent reminder (D-0)" });
  }

  // D+1: overdue alert at 9 AM (always add)
  const d_plus = new Date(deadline);
  d_plus.setDate(d_plus.getDate() + 1);
  d_plus.setHours(9, 0, 0, 0);
  reminders.push({ level: 3, time: d_plus.toISOString(), label: "Overdue alert (D+1)" });

  // Filter out past reminders
  const currentTime = new Date();
  return reminders.filter((r) => new Date(r.time) > currentTime);
}

/**
 * Safely parse JSON with a fallback.
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Retry a function with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, onRetry } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        onRetry?.(attempt + 1, lastError);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Measure execution time of an async function.
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  return { result, durationMs };
}

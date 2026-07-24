// ============================================================
// Gmail API Wrapper — Read, send, and manage emails
// ============================================================

import { google, type gmail_v1 } from "googleapis";
import type { RawEmail, AttachmentMeta } from "@/types/email";

type Gmail = gmail_v1.Gmail;

/**
 * Create an authenticated Gmail client from OAuth access token.
 */
export function createGmailClient(accessToken: string): Gmail {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

/**
 * Fetch inbox emails with pagination.
 */
export async function fetchInbox(
  gmail: Gmail,
  options: {
    maxResults?: number;
    pageToken?: string;
    labelIds?: string[];
    query?: string;
  } = {}
): Promise<{
  emails: RawEmail[];
  nextPageToken: string | null;
  totalEstimate: number;
}> {
  const {
    maxResults = 20,
    pageToken,
    labelIds = ["INBOX"],
    query,
  } = options;

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    pageToken: pageToken || undefined,
    labelIds,
    q: query || undefined,
  });

  const messages = response.data.messages || [];
  const emails: RawEmail[] = [];

  // Fetch full details for each message (in parallel, batched)
  const batchSize = 10;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const detailed = await Promise.all(
      batch.map((msg) => fetchEmail(gmail, msg.id!))
    );
    emails.push(...detailed.filter((e): e is RawEmail => e !== null));
  }

  return {
    emails,
    nextPageToken: response.data.nextPageToken || null,
    totalEstimate: response.data.resultSizeEstimate || 0,
  };
}

/**
 * Fetch a single email by ID with full content.
 */
export async function fetchEmail(
  gmail: Gmail,
  messageId: string
): Promise<RawEmail | null> {
  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const msg = response.data;
    const headers = msg.payload?.headers || [];

    const getHeader = (name: string): string =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

    // Extract body
    const bodyHtml = extractBody(msg.payload, "text/html");
    const bodyText = extractBody(msg.payload, "text/plain");

    // Extract attachments metadata
    const attachments = extractAttachments(msg.payload);

    // Check if part of a thread
    const threadId = msg.threadId || messageId;

    // Parse from field
    const fromRaw = getHeader("From");
    const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
    const fromName = fromMatch ? fromMatch[1].replace(/"/g, "").trim() : fromRaw;
    const fromEmail = fromMatch ? fromMatch[2] : fromRaw;

    // Parse to/cc
    const toRaw = getHeader("To");
    const ccRaw = getHeader("Cc");
    const to = toRaw ? toRaw.split(",").map((s) => s.trim()) : [];
    const cc = ccRaw ? ccRaw.split(",").map((s) => s.trim()) : [];

    return {
      id: messageId,
      threadId,
      from: fromEmail,
      fromName,
      to,
      cc,
      subject: getHeader("Subject") || "(No Subject)",
      bodyHtml,
      bodyText,
      snippet: msg.snippet || "",
      date: getHeader("Date"),
      labels: msg.labelIds || [],
      attachments,
      isRead: !(msg.labelIds || []).includes("UNREAD"),
      isThread: false, // will be updated by thread fetch
      threadLength: 1,
    };
  } catch (error) {
    console.error(`Failed to fetch email ${messageId}:`, error);
    return null;
  }
}

/**
 * Fetch entire thread by thread ID.
 */
export async function fetchThread(
  gmail: Gmail,
  threadId: string
): Promise<RawEmail[]> {
  try {
    const response = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
    });

    const messages = response.data.messages || [];
    const threadLength = messages.length;

    const emails: RawEmail[] = messages.map((msg) => {
      const headers = msg.payload?.headers || [];
      const getHeader = (name: string): string =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

      const fromRaw = getHeader("From");
      const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
      const fromName = fromMatch ? fromMatch[1].replace(/"/g, "").trim() : fromRaw;
      const fromEmail = fromMatch ? fromMatch[2] : fromRaw;

      const toRaw = getHeader("To");
      const ccRaw = getHeader("Cc");

      return {
        id: msg.id!,
        threadId,
        from: fromEmail,
        fromName,
        to: toRaw ? toRaw.split(",").map((s) => s.trim()) : [],
        cc: ccRaw ? ccRaw.split(",").map((s) => s.trim()) : [],
        subject: getHeader("Subject") || "(No Subject)",
        bodyHtml: extractBody(msg.payload, "text/html"),
        bodyText: extractBody(msg.payload, "text/plain"),
        snippet: msg.snippet || "",
        date: getHeader("Date"),
        labels: msg.labelIds || [],
        attachments: extractAttachments(msg.payload),
        isRead: !(msg.labelIds || []).includes("UNREAD"),
        isThread: threadLength > 1,
        threadLength,
      };
    });

    return emails;
  } catch (error) {
    console.error(`Failed to fetch thread ${threadId}:`, error);
    return [];
  }
}

/**
 * Send an email reply via Gmail.
 */
export async function sendReply(
  gmail: Gmail,
  options: {
    to: string;
    subject: string;
    body: string;
    inReplyTo?: string;
    threadId?: string;
  }
): Promise<string | null> {
  const { to, subject, body, inReplyTo, threadId } = options;

  // Build RFC 2822 message
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
    ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`, `References: ${inReplyTo}`] : []),
    "",
    body,
  ];

  const rawMessage = messageParts.join("\r\n");
  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId: threadId || undefined,
      },
    });

    return response.data.id || null;
  } catch (error) {
    console.error("Failed to send reply:", error);
    return null;
  }
}

/**
 * Modify email labels (add/remove).
 */
export async function modifyLabels(
  gmail: Gmail,
  messageId: string,
  addLabels: string[] = [],
  removeLabels: string[] = []
): Promise<boolean> {
  try {
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: addLabels,
        removeLabelIds: removeLabels,
      },
    });
    return true;
  } catch (error) {
    console.error(`Failed to modify labels for ${messageId}:`, error);
    return false;
  }
}

/**
 * Set up Gmail push notifications via Pub/Sub.
 */
export async function setupWatch(
  gmail: Gmail,
  topicName: string
): Promise<{ historyId: string; expiration: string } | null> {
  try {
    const response = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName,
        labelIds: ["INBOX"],
      },
    });

    return {
      historyId: response.data.historyId || "",
      expiration: response.data.expiration || "",
    };
  } catch (error) {
    console.error("Failed to setup Gmail watch:", error);
    return null;
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Extract body text from Gmail message payload (recursive for multipart).
 */
function extractBody(
  payload: gmail_v1.Schema$MessagePart | undefined | null,
  mimeType: string
): string {
  if (!payload) return "";

  // Direct body
  if (payload.mimeType === mimeType && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  // Multipart — recurse into parts
  if (payload.parts) {
    for (const part of payload.parts) {
      const result = extractBody(part, mimeType);
      if (result) return result;
    }
  }

  return "";
}

/**
 * Extract attachment metadata from message payload.
 */
function extractAttachments(
  payload: gmail_v1.Schema$MessagePart | undefined | null
): AttachmentMeta[] {
  const attachments: AttachmentMeta[] = [];

  if (!payload) return attachments;

  if (payload.filename && payload.filename.length > 0 && payload.body?.attachmentId) {
    attachments.push({
      filename: payload.filename,
      mimeType: payload.mimeType || "application/octet-stream",
      size: payload.body.size || 0,
      attachmentId: payload.body.attachmentId,
    });
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      attachments.push(...extractAttachments(part));
    }
  }

  return attachments;
}

/**
 * Strip HTML tags and decode entities for plain text extraction.
 */
export function htmlToPlainText(html: string): string {
  return html
    // Remove style and script tags with content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    // Replace br and p tags with newlines
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

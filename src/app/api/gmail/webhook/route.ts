// ============================================================
// API: Gmail Webhook — Receive push notifications for new emails
// POST /api/gmail/webhook
//
// This endpoint receives push notifications from Gmail via
// Google Cloud Pub/Sub when new emails arrive.
// ============================================================

import { NextRequest, NextResponse } from "next/server";

interface PubSubMessage {
  message: {
    data: string; // base64 encoded
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface GmailNotification {
  emailAddress: string;
  historyId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PubSubMessage;

    // Decode the Pub/Sub message
    const decodedData = Buffer.from(body.message.data, "base64").toString("utf-8");
    const notification: GmailNotification = JSON.parse(decodedData);

    console.log(
      `[Gmail Webhook] New notification for ${notification.emailAddress}, ` +
        `historyId: ${notification.historyId}`
    );

    // TODO: In production, this would:
    // 1. Look up the user by email address
    // 2. Fetch new emails since last historyId using gmail.users.history.list()
    // 3. Process each new email through the agent pipeline
    // 4. Store results in database
    // 5. Send push notification to user if urgent

    // For now, acknowledge the notification
    // Google Cloud Pub/Sub expects a 200 response to acknowledge
    return NextResponse.json(
      { received: true, emailAddress: notification.emailAddress },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Gmail Webhook] Error:", error);
    // Still return 200 to prevent Pub/Sub retries on bad data
    return NextResponse.json(
      { received: false, error: "Failed to process notification" },
      { status: 200 }
    );
  }
}

// Verify the webhook is alive
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "gmail-webhook",
    timestamp: new Date().toISOString(),
  });
}

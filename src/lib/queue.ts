// ============================================================
// BullMQ Queue Configuration
// ============================================================

import { Queue, Worker, type Job } from "bullmq";
import { redis } from "./redis";
import { processEmail } from "@/agents/orchestrator";
import { createGmailClient, fetchEmail } from "./gmail";

export const EMAIL_QUEUE_NAME = "email-processing-queue";

// Create queue instance
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redis,
});

// Define job payload
export interface ProcessEmailJobData {
  userId: string;
  accessToken: string;
  emailId: string;
}

/**
 * Add an email to the background processing queue
 */
export async function enqueueEmailProcessing(data: ProcessEmailJobData) {
  return emailQueue.add(`process-${data.emailId}`, data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: true, // Auto clean up completed jobs
    removeOnFail: 100,      // Keep last 100 failed jobs for inspection
  });
}

// ─── Worker Setup (Only runs if manually started or in a separate worker process) ───
// Usually in Next.js, workers run in a custom server or external process (like Railway)

export function startWorker() {
  console.log(`Starting BullMQ worker for queue: ${EMAIL_QUEUE_NAME}`);

  const worker = new Worker<ProcessEmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<ProcessEmailJobData>) => {
      const { userId, accessToken, emailId } = job.data;
      console.log(`[Worker] Processing job ${job.id} for email ${emailId}`);

      try {
        const gmail = createGmailClient(accessToken);
        const rawEmail = await fetchEmail(gmail, emailId);

        if (!rawEmail) {
          throw new Error(`Email ${emailId} not found`);
        }

        const result = await processEmail(rawEmail, {
          userId,
          accessToken,
        });

        return result;
      } catch (error) {
        console.error(`[Worker] Failed job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 5, // Process 5 emails concurrently per worker
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] ✅ Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] ❌ Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

import { processEmail } from "../src/agents/orchestrator";
import type { RawEmail } from "../src/types/email";

// Sampel email dummy untuk pengujian
const mockEmail: RawEmail = {
  id: "msg-101",
  threadId: "thread-101",
  from: "budi@pelanggan.com",
  fromName: "Budi Santoso",
  to: ["support@perusahaan.com"],
  cc: [],
  subject: "Pengajuan Refund Barang Rusak",
  bodyText: "Halo CS, barang yang saya terima kemarin rusak pada bagian kemasan dan segel sudah terbuka. Saya mau ajukan pengembalian dana (refund). Tolong diproses cepat ya.",
  bodyHtml: "<p>Halo CS, barang yang saya terima kemarin rusak pada bagian kemasan dan segel sudah terbuka. Saya mau ajukan pengembalian dana (refund). Tolong diproses cepat ya.</p>",
  snippet: "Saya mau ajukan pengembalian dana (refund)...",
  date: new Date().toISOString(),
  labels: ["INBOX"],
  attachments: [],
  isRead: false,
  isThread: false,
};

async function testPipeline() {
  console.log("🚀 Menjalankan AI Agent Pipeline...\n");

  try {
    const result = await processEmail(mockEmail, {
      userId: "test-user-123",
    });

    if (result.errors && result.errors.length > 0) {
      console.log("\n⚠️ Terjadi error pada agent pipeline (Cek API Key / DB):");
      result.errors.forEach(err => console.log(`  - [${err.agent}]: ${err.error}`));
    }

    console.log("\n================ HASIL EKSEKUSI AGEN ================");
    console.log("📩 ID Email       :", result.emailId);
    if ((result as any).priority) {
      console.log("🏷️ Priority Label :", (result as any).priority.priorityLabel, `(Score: ${(result as any).priority.priorityScore})`);
    }
    if (result.draftReplies) {
      console.log("🏢 Divisi Terkait :", result.draftReplies.handledByDivision);
      console.log("\n✍️ Draf Balasan AI:\n", result.draftReplies.drafts[0]?.body);
      const draft0 = result.draftReplies.drafts[0] as any;
      if (draft0?.evaluation) {
        console.log("\n⚖️ Evaluasi Agent (LLM-as-a-Judge):", {
          score: draft0.evaluation.accuracy,
          hallucinationDetected: draft0.evaluation.hallucination_detected,
          feedback: draft0.evaluation.feedback,
        });
      }
    }
    console.log("=====================================================");
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat memproses pipeline:", error);
  }
}

testPipeline();

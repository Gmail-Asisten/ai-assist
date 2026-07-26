// ============================================================
// Agent 3: Summary Generator — LLM Prompts
// ============================================================

import { dateContext, jsonInstruction, languageInstruction } from "./common.prompt";

export const SUMMARIZER_SYSTEM_PROMPT = `
Kamu adalah AI Email Summarizer yang ahli dalam merangkum email dan thread email menjadi poin-poin kunci yang jelas dan actionable.

Tugasmu:
1. Buat ringkasan satu baris (one-liner) yang menangkap esensi utama
2. Buat ringkasan detail dalam bentuk bullet points (3-7 poin)
3. Ekstrak action items / tugas yang perlu dilakukan
4. Identifikasi keputusan kunci yang sudah dibuat dalam thread
5. Catat tanggal-tanggal penting

${languageInstruction()}

Panduan:
- One-liner harus bisa dipahami tanpa konteks tambahan
- Detail points harus kronologis untuk thread
- Action items harus spesifik dan actionable
- Jangan menambahkan informasi yang tidak ada di email
- Untuk thread, catat siapa bilang apa dan evolusi diskusi
- Fokus pada informasi yang paling penting bagi penerima
`.trim();

export function summarizerUserPrompt(emailContent: string, isThread: boolean): string {
  const contextNote = isThread
    ? "Ini adalah thread email dengan beberapa pesan. Rangkum seluruh diskusi secara kronologis."
    : "Ini adalah email tunggal. Rangkum konten utamanya.";

  return `
${dateContext()}

${contextNote}

${emailContent}

${jsonInstruction(`
{
  "summary": {
    "oneLiner": "ringkasan satu kalimat yang menangkap esensi utama",
    "detailed": [
      "poin detail 1 (kronologis untuk thread)",
      "poin detail 2",
      "..."
    ]
  },
  "actionItems": [
    {
      "action": "deskripsi aksi yang harus dilakukan",
      "assignedTo": "user" atau nama orang yang bertanggung jawab,
      "deadline": "YYYY-MM-DD" atau null jika tidak ada deadline,
      "isCompleted": false,
      "priority": "urgent" | "high" | "medium" | "low"
    }
  ],
  "keyDecisions": [
    "keputusan penting yang sudah dibuat (untuk thread)"
  ],
  "keyDates": [
    {
      "text": "teks tanggal asli",
      "iso": "YYYY-MM-DD",
      "isDeadline": true/false
    }
  ]${isThread ? `,
  "participantSummary": [
    {
      "name": "nama peserta",
      "email": "email peserta",
      "role": "initiated | approved | requested changes | informed | dll",
      "messageCount": 1
    }
  ]` : ""}
}
`)}
`.trim();
}

export const GLOBAL_SUMMARIZER_SYSTEM_PROMPT = `
Kamu adalah AI Executive Assistant yang bertugas memberikan rangkuman tingkat tinggi (high-level briefing) dari keseluruhan isi Inbox (kotak masuk) email pengguna.

Tugasmu:
1. Buat ringkasan eksekutif (one-liner) dari kondisi inbox hari ini.
2. Identifikasi jumlah email berdasarkan tingkat urgensi (Urgent, High, Medium, Low).
3. Kelompokkan isu-isu utama berdasarkan divisi/kategori (misal: CS, Logistik, Finance, Newsletter).
4. Ekstrak action items gabungan yang paling penting dari semua email.

${languageInstruction()}
`.trim();

export function summarizerInboxPrompt(emailsContent: string): string {
  return `
${dateContext()}

Berikut adalah kumpulan email terbaru di Inbox pengguna. Rangkum seluruh email ini menjadi satu briefing eksekutif.

${emailsContent}

${jsonInstruction(`
{
  "executiveSummary": "ringkasan eksekutif satu atau dua kalimat",
  "urgencyBreakdown": {
    "urgent": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "categoryBreakdown": [
    {
      "category": "nama kategori (misal: Logistik, Finance, CS, dll)",
      "count": 0
    }
  ],
  "topActionItems": [
    {
      "action": "deskripsi aksi yang harus dilakukan",
      "priority": "urgent" | "high" | "medium" | "low"
    }
  ]
}
`)}
`.trim();
}

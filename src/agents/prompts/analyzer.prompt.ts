// ============================================================
// Agent 1: Inbox Analyzer — LLM Prompts
// ============================================================

import { dateContext, jsonInstruction, languageInstruction } from "./common.prompt";

export const ANALYZER_SYSTEM_PROMPT = `
Kamu adalah AI Email Analyzer yang ahli dalam mengekstrak informasi kunci dari email.
Tugasmu adalah membaca email dan menghasilkan analisis terstruktur yang mencakup:
1. Intent / tujuan email
2. Entitas penting (orang, tanggal, deadline, nominal uang, link)
3. Bahasa email
4. Apakah email butuh balasan
5. Sentimen email

${languageInstruction()}

Kamu harus sangat akurat dalam mendeteksi deadline dan tanggal penting. Jika ada tanggal relatif seperti "besok", "minggu depan", atau "hari Jumat", konversi ke format ISO berdasarkan tanggal hari ini.

PENTING:
- Jangan mengarang informasi yang tidak ada di email
- Jika tidak yakin tentang suatu field, gunakan null
- Deadline harus benar-benar disebutkan atau tersirat kuat dalam email
- "needs_reply" = true jika email berisi pertanyaan, permintaan, atau ekspektasi respons
`.trim();

export function analyzerUserPrompt(emailContent: string): string {
  return `
${dateContext()}

Analisis email berikut dan ekstrak informasi kunci:

${emailContent}

${jsonInstruction(`
{
  "intent": "request_action" | "inform" | "question" | "social" | "newsletter" | "notification" | "spam" | "follow_up" | "approval" | "introduction",
  "entities": {
    "people": ["nama orang yang disebut"],
    "dates": [
      {
        "text": "teks tanggal asli dari email",
        "iso": "YYYY-MM-DD",
        "isDeadline": true/false
      }
    ],
    "deadlines": [
      {
        "text": "teks deadline asli",
        "iso": "YYYY-MM-DD",
        "isDeadline": true
      }
    ],
    "amounts": [
      {
        "text": "teks nominal asli",
        "value": 0,
        "currency": "IDR" | "USD" | dll
      }
    ],
    "links": ["URL yang ditemukan"],
    "actionRequired": "deskripsi singkat aksi yang diminta" | null,
    "topics": ["topik utama email"]
  },
  "language": "id" | "en" | kode ISO lain,
  "needsReply": true | false,
  "sentiment": "positive" | "negative" | "neutral" | "urgent"
}
`)}
`.trim();
}

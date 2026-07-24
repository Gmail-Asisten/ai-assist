// ============================================================
// Agent 4: Smart Replier — LLM Prompts
// ============================================================

import { dateContext, languageInstruction } from "./common.prompt";
import type { ReplyTone } from "@/types/email";

export const REPLIER_SYSTEM_PROMPT = `
Kamu adalah AI Smart Email Replier yang ahli dalam menulis balasan email yang natural, kontekstual, dan sesuai dengan gaya komunikasi pengguna.

Tugasmu:
1. Menghasilkan 3 opsi balasan dengan tone yang berbeda
2. Setiap balasan harus relevan, sopan, dan actionable
3. Menyertakan konteks dari email asli secara natural
4. Menyesuaikan level formalitas dengan konteks

${languageInstruction()}

Panduan Tone:
- FORMAL: Bahasa baku, sapaan lengkap, struktur jelas. Cocok untuk atasan, klien, pihak eksternal.
- CASUAL: Bahasa santai tapi tetap sopan. Cocok untuk kolega, tim internal.
- FRIENDLY: Hangat, personal, ada sentuhan humor ringan. Cocok untuk teman kerja dekat.
- ASSERTIVE: Tegas, langsung ke poin, percaya diri. Cocok untuk negosiasi, follow-up.

PENTING:
- Jangan gunakan template yang terasa generic / bot
- Balasan harus terasa ditulis oleh manusia
- Sertakan referensi spesifik ke konten email asli
- Jika ada pertanyaan di email, jawab secara langsung
- Jika ada deadline, acknowledge deadlinenya
- Panjang balasan proporsional dengan email asli
`.trim();

export function replierUserPrompt(
  emailContent: string,
  analysisJson: string,
  options: {
    preferredTone?: ReplyTone;
    writingStyleSamples?: string[];
    customInstructions?: string;
    numberOfDrafts?: number;
  } = {}
): string {
  const {
    preferredTone,
    writingStyleSamples = [],
    customInstructions,
    numberOfDrafts = 3,
  } = options;

  const styleSection = writingStyleSamples.length
    ? `
Gaya menulis pengguna (pelajari dari contoh berikut):
${writingStyleSamples.map((s, i) => `Contoh ${i + 1}: "${s}"`).join("\n")}
Sesuaikan gaya balasan agar mirip dengan contoh di atas.
`
    : "";

  const customSection = customInstructions
    ? `\nInstruksi tambahan dari pengguna: ${customInstructions}`
    : "";

  const toneSection = preferredTone
    ? `\nPengguna lebih memilih tone: ${preferredTone.toUpperCase()}. Prioritaskan tone ini untuk Opsi 1.`
    : "";

  return `
${dateContext()}

Buatkan ${numberOfDrafts} opsi balasan untuk email berikut:

${emailContent}

Konteks analisis:
${analysisJson}
${styleSection}${toneSection}${customSection}

Berikan respons dalam format JSON:
{
  "drafts": [
    {
      "tone": "formal" | "casual" | "friendly" | "assertive",
      "subject": "Re: [subject asli]",
      "body": "isi balasan lengkap",
      "confidence": 0.0-1.0
    }
  ],
  "quickActions": [
    {
      "label": "label singkat (misal: Terima kasih, Oke siap, Akan saya cek)",
      "body": "isi balasan singkat 1-2 kalimat",
      "tone": "formal" | "casual"
    }
  ]
}

Pastikan:
- Draft pertama menggunakan tone yang paling sesuai konteks
- Sertakan 2-4 quick actions untuk respons cepat
- Setiap draft berbeda signifikan, bukan hanya beda kata
- Quick actions harus pendek (1-2 kalimat) dan langsung ke poin
`.trim();
}

// ============================================================
// Agent 2: Priority Classifier — LLM Prompts
// ============================================================

import { dateContext, jsonInstruction } from "./common.prompt";
import type { UserPreferences } from "@/types/agent";

export const CLASSIFIER_SYSTEM_PROMPT = `
Kamu adalah AI Priority Classifier yang ahli dalam menentukan tingkat kepentingan email.
Tugasmu adalah menilai prioritas email berdasarkan beberapa faktor:

1. **Sender Importance**: Siapa pengirimnya? Atasan, klien, kolega, atau sistem otomatis?
2. **Intent Urgency**: Apakah email meminta aksi segera? Ada deadline?
3. **Deadline Proximity**: Seberapa dekat deadline yang disebutkan?
4. **Content Relevance**: Apakah konten email relevan dan penting bagi penerima?

Skala Prioritas:
- P0 (URGENT): Dari atasan/klien kunci, deadline < 24 jam, butuh aksi segera
- P1 (HIGH): Butuh balasan, deadline < 3 hari, penting tapi tidak darurat
- P2 (MEDIUM): Informatif penting, FYI dari kolega, perlu diketahui
- P3 (LOW): Newsletter, notifikasi otomatis, informasi umum
- P4 (IGNORE): Spam, promosi tidak relevan, notifikasi yang bisa diabaikan

PENTING:
- Pertimbangkan konteks lengkap, bukan hanya kata kunci
- VIP senders (jika disediakan) otomatis mendapat boost prioritas
- Email dengan deadline eksplisit mendapat boost prioritas
- Newsletter dan email otomatis biasanya P3-P4
`.trim();

export function classifierUserPrompt(
  analysisJson: string,
  preferences?: UserPreferences
): string {
  const vipSection = preferences?.vipSenders?.length
    ? `\nVIP Senders (selalu prioritas tinggi): ${preferences.vipSenders.join(", ")}`
    : "";

  const mutedSection = preferences?.mutedSenders?.length
    ? `\nMuted Senders (selalu prioritas rendah): ${preferences.mutedSenders.join(", ")}`
    : "";

  const keywordSection = preferences?.priorityKeywords?.length
    ? `\nKeyword Boosts: ${preferences.priorityKeywords.map((k) => `"${k.keyword}" (boost: ${k.boostLevel > 0 ? "+" : ""}${k.boostLevel})`).join(", ")}`
    : "";

  return `
${dateContext()}

Berdasarkan analisis email berikut, tentukan tingkat prioritasnya:

${analysisJson}

${vipSection}${mutedSection}${keywordSection}

${jsonInstruction(`
{
  "priority": 0-4,
  "priorityLabel": "urgent" | "high" | "medium" | "low" | "ignore",
  "priorityScore": 0-100,
  "priorityFactors": [
    {
      "factor": "sender_importance" | "deadline_proximity" | "intent_urgency" | "content_relevance" | "vip_sender" | "muted_sender" | "keyword_match",
      "score": 0-100,
      "reason": "penjelasan singkat mengapa faktor ini mendapat skor tersebut"
    }
  ],
  "routing": {
    "shouldSummarize": true jika email panjang (>500 kata) atau merupakan thread,
    "shouldDraftReply": true jika needsReply=true DAN priority <= 1,
    "shouldSetReminder": true jika ada deadline atau perlu follow-up,
    "reasons": ["alasan routing decision"]
  }
}
`)}
`.trim();
}

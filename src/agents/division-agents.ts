import { genAI } from "@/lib/gemini";
import { DEFAULT_AGENT_CONFIGS } from "@/types/agent";
import { AnalyzedEmail } from "@/types/email";
import { findSimilarKnowledge } from "@/lib/vector";

export async function handleDivisionEmail(
  analyzed: AnalyzedEmail,
  division: "CS" | "Logistik" | "Finance"
) {
  // RAG: Find similar knowledge based on user email
  const knowledge = await findSimilarKnowledge(analyzed.rawEmail.snippet || analyzed.subject, division);
  
  const contextText = knowledge.map((k) => `[SOP ${k.title}]: ${k.content}`).join("\n\n");
  const agentName = `division-${division.toLowerCase()}` as import("@/types/agent").AgentName;
  const modelConfig = DEFAULT_AGENT_CONFIGS[agentName] || DEFAULT_AGENT_CONFIGS["division-cs"];
  
  const model = genAI.getGenerativeModel({
    model: modelConfig.model,
    generationConfig: {
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxTokens,
    },
  });

  const prompt = `
Anda adalah Agen Divisi ${division} di PT. Retail Nusantara.
Tugas Anda adalah merespons email keluhan atau pertanyaan pelanggan berikut.

Gunakan CONTEKAN (RAG) berikut sebagai dasar jawaban Anda. DILARANG mengarang kebijakan di luar contekan ini.

--- CONTEKAN (RAG) ---
${contextText || "Tidak ada SOP spesifik, jawab secara umum dan profesional."}
----------------------

--- EMAIL PELANGGAN ---
Dari: ${analyzed.from}
Subjek: ${analyzed.subject}
Pesan: ${analyzed.rawEmail.snippet}
-----------------------

Tuliskan Draf Balasan Email Anda (Gunakan bahasa Indonesia, profesional, ramah):
  `;

  const result = await model.generateContent(prompt);
  const draft = result.response.text();
  
  return { draft, usedKnowledge: knowledge, contextText };
}

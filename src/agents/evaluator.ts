import { genAI } from "@/lib/gemini";
import { DEFAULT_AGENT_CONFIGS } from "@/types/agent";
import { AnalyzedEmail } from "@/types/email";

export async function evaluateDraft(
  analyzed: AnalyzedEmail,
  draft: string,
  knowledgeContext: string
) {
  const modelConfig = DEFAULT_AGENT_CONFIGS["evaluator"];
  const model = genAI.getGenerativeModel({
    model: modelConfig.model,
    generationConfig: {
      temperature: modelConfig.temperature,
      maxOutputTokens: modelConfig.maxTokens,
      responseMimeType: "application/json",
    },
  });

  const prompt = `
Anda adalah Agen Evaluator. Tugas Anda mengevaluasi kualitas draf balasan agen divisi.
Berikan penilaian JSON berdasarkan kriteria berikut (skor 0-100):
- accuracy: Kesesuaian dengan RAG context (0-100).
- effectiveness: Apakah menjawab masalah pelanggan? (0-100).
- efficiency: Apakah singkat, padat, dan jelas? (0-100).
- explainability: Apakah alasannya masuk akal? (0-100).
- hallucination_detected: (boolean) true jika ada info mengarang di luar context.
- feedback: (string) saran perbaikan singkat.

Konteks SOP (RAG):
${knowledgeContext || "Tidak ada SOP."}

Keluhan Pelanggan:
${analyzed.rawEmail.snippet}

Draf Agen:
${draft}

Return ONLY valid JSON.
  `;

  const result = await model.generateContent(prompt);
  const jsonText = result.response.text();
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return {
      accuracy: 0,
      effectiveness: 0,
      efficiency: 0,
      explainability: 0,
      hallucination_detected: true,
      feedback: "Failed to parse JSON evaluation.",
    };
  }
}

// ============================================================
// Gemini AI Client — Shared LLM interface for all agents
// ============================================================

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerateContentResult,
  type GenerationConfig,
} from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    "⚠️  GEMINI_API_KEY is not set. AI agents will not function without it."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// Safety settings — relaxed for email processing
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

/**
 * Generate structured JSON output from Gemini.
 * This is the main function used by all agents.
 */
export async function generateJSON<T>(options: {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<T> {
  const {
    model: modelName = "gemini-2.5-flash",
    systemPrompt,
    userPrompt,
    temperature = 0.1,
    maxTokens = 4096,
  } = options;

  const model = genAI.getGenerativeModel({
    model: modelName,
    safetySettings,
    systemInstruction: systemPrompt,
  });

  const generationConfig: GenerationConfig = {
    temperature,
    maxOutputTokens: maxTokens,
    responseMimeType: "application/json",
  };

  const result: GenerateContentResult = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig,
  });

  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    // Sometimes the model wraps JSON in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim()) as T;
    }
    throw new Error(`Failed to parse LLM response as JSON: ${text.slice(0, 200)}`);
  }
}

/**
 * Generate plain text output from Gemini.
 * Used for reply drafts where we want natural text, not JSON.
 */
export async function generateText(options: {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const {
    model: modelName = "gemini-2.5-pro",
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 4096,
  } = options;

  const model = genAI.getGenerativeModel({
    model: modelName,
    safetySettings,
    systemInstruction: systemPrompt,
  });

  const generationConfig: GenerationConfig = {
    temperature,
    maxOutputTokens: maxTokens,
  };

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig,
  });

  return result.response.text();
}

export { genAI };

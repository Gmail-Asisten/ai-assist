import { genAI } from "./gemini";
import { prisma } from "./prisma";

const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding;
  return embedding.values;
}

export async function findSimilarKnowledge(query: string, division: string, limit: number = 3) {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  // Use raw SQL for pgvector cosine distance (<=>)
  const knowledge = await prisma.$queryRaw`
    SELECT id, title, content, division, 1 - (embedding <=> ${embeddingString}::vector) as similarity
    FROM company_knowledge
    WHERE division = ${division}
    ORDER BY embedding <=> ${embeddingString}::vector
    LIMIT ${limit};
  `;

  return knowledge as { id: string; title: string; content: string; division: string; similarity: number }[];
}

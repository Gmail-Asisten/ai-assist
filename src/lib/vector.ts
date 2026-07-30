import { genAI } from "./gemini";

// Only import prisma if DATABASE_URL is set and valid
const hasDatabaseUrl =
  !!process.env.DATABASE_URL &&
  process.env.DATABASE_URL.trim() !== '""' &&
  process.env.DATABASE_URL.trim() !== "";

// Mock SOP data used when DB is unavailable or embedding fails
const MOCK_KNOWLEDGE: Record<
  string,
  { id: string; title: string; content: string; division: string; similarity: number }[]
> = {
  Finance: [
    {
      id: "mock-1",
      title: "Kebijakan Pengembalian Barang (Refund)",
      content:
        "Pengembalian barang atau refund hanya bisa dilakukan maksimal 30 hari setelah barang diterima pelanggan. Barang harus dalam kondisi utuh dan segel belum terbuka. Proses refund membutuhkan waktu 3-5 hari kerja.",
      division: "Finance",
      similarity: 0.95,
    },
  ],
  Logistik: [
    {
      id: "mock-2",
      title: "SOP Keterlambatan Pengiriman",
      content:
        "Jika terjadi keterlambatan pengiriman lebih dari 3 hari dari estimasi, pelanggan berhak mendapatkan kompensasi voucher Rp 50.000. Agen logistik harus melacak posisi kurir terakhir dan menginformasikan pelanggan maksimal 1x24 jam.",
      division: "Logistik",
      similarity: 0.92,
    },
  ],
  CS: [
    {
      id: "mock-3",
      title: "SOP Perubahan Alamat Pengiriman",
      content:
        "Alamat pengiriman hanya bisa diubah jika pesanan belum diproses oleh gudang (status masih 'Menunggu Pembayaran' atau 'Sedang Diproses'). Jika sudah dikirim, alamat tidak bisa diubah.",
      division: "CS",
      similarity: 0.88,
    },
  ],
};

/**
 * Generate text embedding using Gemini embedding model.
 * Uses "text-embedding-004" via the v1beta API through the SDK.
 * Falls back gracefully if the model is unavailable.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // text-embedding-004 is supported — use the short alias without "models/" prefix
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.warn("[Vector] ⚠️ Embedding failed, skipping vector search:", err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Find similar knowledge from the company knowledge base using pgvector.
 * Falls back to mock SOP data when:
 * - DATABASE_URL is not configured
 * - Embedding generation fails
 * - Database query fails
 */
export async function findSimilarKnowledge(
  query: string,
  division: string,
  limit: number = 3
): Promise<{ id: string; title: string; content: string; division: string; similarity: number }[]> {
  // No database configured → use mock data immediately
  if (!hasDatabaseUrl) {
    console.log("[Vector] ⚠️ No DATABASE_URL set, using mock SOP data.");
    return MOCK_KNOWLEDGE[division] || MOCK_KNOWLEDGE["CS"];
  }

  // Try vector search with embedding
  try {
    const queryEmbedding = await generateEmbedding(query);

    // If embedding failed (empty array), fall back to mock data
    if (queryEmbedding.length === 0) {
      console.log("[Vector] ⚠️ Embedding returned empty, using mock SOP data.");
      return MOCK_KNOWLEDGE[division] || MOCK_KNOWLEDGE["CS"];
    }

    const { prisma } = await import("./prisma");
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    const knowledge = await prisma.$queryRaw`
      SELECT id, title, content, division, 1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM company_knowledge
      WHERE division = ${division}
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${limit};
    `;

    return knowledge as { id: string; title: string; content: string; division: string; similarity: number }[];
  } catch (err) {
    console.warn("[Vector] ⚠️ pgvector search failed, falling back to mock data:", err instanceof Error ? err.message : err);
    return MOCK_KNOWLEDGE[division] || MOCK_KNOWLEDGE["CS"];
  }
}

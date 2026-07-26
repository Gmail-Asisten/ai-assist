import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from '../src/lib/vector';

const prisma = new PrismaClient();

const sops = [
  {
    title: "Kebijakan Pengembalian Barang (Refund)",
    content: "Pengembalian barang atau refund hanya bisa dilakukan maksimal 30 hari setelah barang diterima pelanggan. Barang harus dalam kondisi utuh dan segel belum terbuka. Proses refund membutuhkan waktu 3-5 hari kerja.",
    division: "Finance"
  },
  {
    title: "SOP Keterlambatan Pengiriman",
    content: "Jika terjadi keterlambatan pengiriman lebih dari 3 hari dari estimasi, pelanggan berhak mendapatkan kompensasi voucher Rp 50.000. Agen logistik harus melacak posisi kurir terakhir dan menginformasikan pelanggan maksimal 1x24 jam.",
    division: "Logistik"
  },
  {
    title: "SOP Perubahan Alamat Pengiriman",
    content: "Alamat pengiriman hanya bisa diubah jika pesanan belum diproses oleh gudang (status masih 'Menunggu Pembayaran' atau 'Sedang Diproses'). Jika sudah dikirim, alamat tidak bisa diubah.",
    division: "CS"
  }
];

async function main() {
  console.log("Seeding Company Knowledge (RAG)...");
  
  for (const sop of sops) {
    const embedding = await generateEmbedding(sop.content);
    const embeddingString = `[${embedding.join(",")}]`;
    
    await prisma.$executeRaw`
      INSERT INTO company_knowledge (id, title, content, division, embedding)
      VALUES (gen_random_uuid(), ${sop.title}, ${sop.content}, ${sop.division}, ${embeddingString}::vector)
    `;
    console.log(`Inserted SOP: ${sop.title}`);
  }
  
  console.log("Seeding finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

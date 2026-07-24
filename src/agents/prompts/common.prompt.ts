// ============================================================
// Shared Prompt Utilities — Used across all agent prompts
// ============================================================

/**
 * Current date context for the LLM to understand relative dates.
 */
export function dateContext(): string {
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return `Hari ini adalah ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}. Waktu sekarang: ${now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })} WIB.`;
}

/**
 * JSON output instruction to ensure structured responses.
 */
export function jsonInstruction(schemaDescription: string): string {
  return `
PENTING: Berikan respons HANYA dalam format JSON yang valid. Jangan tambahkan teks apapun di luar JSON.
Ikuti schema berikut persis:
${schemaDescription}
`.trim();
}

/**
 * Language detection instruction.
 */
export function languageInstruction(): string {
  return `
Deteksi bahasa email secara otomatis. Jika email dalam Bahasa Indonesia, gunakan "id". Jika dalam Bahasa Inggris, gunakan "en". Untuk bahasa lain, gunakan kode ISO 639-1 yang sesuai.
Berikan output summary/analysis dalam bahasa yang SAMA dengan bahasa email asli.
`.trim();
}

/**
 * Build the email content section for prompts.
 */
export function emailContentBlock(email: {
  from: string;
  fromName: string;
  to: string[];
  subject: string;
  bodyText: string;
  date: string;
  attachments?: { filename: string }[];
}): string {
  const attachmentList = email.attachments?.length
    ? `\nLampiran: ${email.attachments.map((a) => a.filename).join(", ")}`
    : "";

  return `
--- EMAIL ---
Dari: ${email.fromName} <${email.from}>
Kepada: ${email.to.join(", ")}
Tanggal: ${email.date}
Subjek: ${email.subject}${attachmentList}

Isi:
${email.bodyText}
--- END EMAIL ---
`.trim();
}

/**
 * Build thread content section for multi-message prompts.
 */
export function threadContentBlock(
  emails: {
    from: string;
    fromName: string;
    subject: string;
    bodyText: string;
    date: string;
  }[]
): string {
  const messages = emails
    .map(
      (email, i) => `
--- PESAN ${i + 1} dari ${emails.length} ---
Dari: ${email.fromName} <${email.from}>
Tanggal: ${email.date}
Subjek: ${email.subject}

${email.bodyText}
`
    )
    .join("\n");

  return `
--- THREAD (${emails.length} pesan) ---
${messages}
--- END THREAD ---
`.trim();
}

# 📧 AI Gmail Assistant - Enterprise Multi-Agent System

Proyek ini adalah arsitektur **Enterprise Multi-Agent** yang dirancang khusus untuk memilah, menganalisis, merangkum, dan membalas email masuk (inbox) secara otomatis menggunakan teknologi **Retrieval-Augmented Generation (RAG)** dan kecerdasan buatan mutakhir dari Google Gemini.

## 🌟 Fitur Utama

- **Smart Inbox Analysis**: Email yang masuk akan langsung dianalisis secara otomatis, mengekstrak entitas penting, nama, kontak, dan niat (intent) pengirim.
- **Priority & Division Routing**: Sistem _routing_ cerdas mendeteksi konteks email dan mendistribusikannya ke agen divisi yang tepat (Customer Service, Logistik, atau Finance) berdasarkan prioritasnya.
- **Global AI Summary**: Mampu merangkum hingga 50 email sekaligus untuk memberikan *executive briefing* kepada Anda (menghitung jumlah email urgen, penting, dan aksi yang harus segera dilakukan).
- **Semantic Vector Search (RAG)**: Pencarian dokumen SOP perusahaan secepat kilat menggunakan `pgvector` di PostgreSQL. Agen tidak akan berhalusinasi karena panduannya diambil langsung dari SOP internal perusahaan.
- **Multi-Agent Evaluation**: Dilengkapi dengan `Evaluator Agent` (LLM-as-a-Judge) yang bertugas memeriksa kualitas draf balasan dari agen lain, menilai akurasi, efektivitas, dan memastikan tidak ada pelanggaran kebijakan.
- **Smart Replies**: Klik 1 tombol untuk langsung mengirim draf balasan (yang sudah dipilah & dievaluasi oleh AI) langsung ke email pengguna akhir melalui Gmail API.

## 🤖 Model AI yang Digunakan (Optimasi Free Tier)

Sistem ini didesain untuk mendistribusikan beban limit API dengan memanfaatkan seluruh jajaran model gratis dari Google Gemini:
- **Gemini 2.0 Flash**: Digunakan untuk *Summary Generator* dan *Customer Service* (mampu membaca puluhan email sekaligus berkat *context window* yang masif).
- **Gemini 1.5 Pro**: Digunakan untuk *Evaluator* dan *Finance Agent* (membutuhkan nalar logika dan perhitungan akurasi yang tinggi).
- **Gemini 1.5 Flash**: Digunakan untuk *Logistics Agent* dan *Priority Classifier* (cepat dan sangat tangguh).
- **Gemini 1.5 Flash-8B**: Digunakan untuk *Inbox Analyzer* dan *Reminder Scheduler* (sangat ringan dan instan untuk tugas parsing sederhana).

## 🛠 Teknologi Pendukung

- **Frontend / Backend:** Next.js (App Router), React, TailwindCSS, TypeScript
- **Database:** PostgreSQL + Prisma ORM + pgvector
- **AI Integration:** `@google/generative-ai` (Gemini SDK)
- **Authentication:** NextAuth.js (Google OAuth 2.0)
- **Deployment:** NGINX, PM2 (Ubuntu VPS)

## 🔧 Setup Instalasi (Lokal)

1. Klon *repository* ini ke komputer Anda:
   ```bash
   git clone <url-repo-anda>
   cd ai-gmail-assistant
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Salin `.env.example` ke `.env.local` (atau buat file `.env.local`) dan masukkan:
   - `DATABASE_URL` (Database PostgreSQL wajib mendukung ekstensi *vector*).
   - `GEMINI_API_KEY` (Dapatkan dari Google AI Studio).
   - `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` (Untuk login Google dan akses Gmail API).
   - `NEXTAUTH_SECRET` (Kunci rahasia enkripsi sesi lokal).
4. Migrasi skema database Prisma (Otomatis mengaktifkan ekstensi `pgvector`):
   ```bash
   npx prisma db push
   ```
5. Jalankan server lokal:
   ```bash
   npm run dev
   ```

Aplikasi sekarang dapat diakses melalui `http://localhost:3000`.

## 🚀 Deployment ke VPS

Untuk proses *deployment* ke production:
1. Pastikan Anda telah melakukan *build* aplikasi.
   ```bash
   npm run build
   ```
2. Pindahkan seluruh file (termasuk folder `.next` hasil build) ke VPS menggunakan alat transfer seperti `rsync` atau Git.
3. Di dalam VPS, gunakan **PM2** untuk menjalankan aplikasi:
   ```bash
   pm2 start npm --name "ai-gmail-assistant" -- start
   ```

---
*Dikembangkan menggunakan teknologi AI Generatif tercanggih untuk kebutuhan Enterprise tingkat tinggi.*

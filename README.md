# Mail Assistant - Enterprise Multi-Agent System

Proyek ini telah dikembangkan menjadi arsitektur **Enterprise Multi-Agent** yang dirancang khusus untuk memilah, menganalisis, dan membalas email masuk pelanggan perusahaan secara otomatis menggunakan teknologi **Retrieval-Augmented Generation (RAG)**.

## 🏆 Kriteria Pemenuhan Tugas (ST167)

Proyek ini secara ketat merespons seluruh kebutuhan *rubrik* tugas:

1. **Studi Kasus Enterprise & Masalah Antar Divisi (ST167.CPMK08.2 - 10 Poin)**
   - **Masalah:** Email pelanggan (_inbox_) perusahaan sering tercampur antara komplain pengiriman, permintaan _refund_ uang, dan informasi layanan umum, sehingga lambat ditangani jika hanya menggunakan satu staf CS.
   - **Solusi:** Sistem _routing_ yang secara cerdas mendeteksi konteks email dan mendistribusikannya ke masing-masing perwakilan (agen) divisi.

2. **Model Multi-Agent yang Saling Berinteraksi (ST167.CPMK22.6 - 10 Poin)**
   - Sistem ini diorkestrasikan agar agen-agen independen dapat berkomunikasi dalam satu _pipeline_ tugas: 
     `Inbox Analyzer` ➔ `Priority Classifier` ➔ `Division Agent (CS/Logistics/Finance)` ➔ `Evaluator Agent`.

3. **Pendekatan RAG, Embedding, dan Vector DB (ST167.CPMK22.5, CPMK22.7 - 60 Poin)**
   - **Model:** Menggunakan **Google Gemini 1.5 Flash** untuk penalaran dan `text-embedding-004` untuk mengubah teks menjadi *embeddings*.
   - **Vector Database:** Menggunakan PostgreSQL yang di-*upgrade* dengan ekstensi `pgvector`.
   - **RAG Pipeline:** Setiap kali Agen Divisi menerima tiket email, ia tidak menjawab menggunakan pengetahuannya sendiri (menghindari bias/halusinasi), melainkan mencari SOP internal spesifik dari Vector DB (menggunakan *Cosine Similarity*) sebagai panduan utama/contekan untuk membalas pelanggan.

4. **Evaluator Model pada Multi-Agent (ST167.CPMK22.6 - 20 Poin)**
   - **LLM-as-a-Judge:** Di akhir alur pemrosesan, sebuah `Evaluator Agent` diterjunkan khusus untuk memeriksa draf balasan yang dibuat oleh Agen Divisi.
   - Agen ini akan menilai persentase dari: **Accuracy, Effectiveness, Efficiency, dan Explainability**. 
   - **Keamanan (Hallucination):** Evaluator akan mendeteksi apakah Agen Divisi berhalusinasi (misalnya: menjanjikan uang kompensasi kepada pelanggan di luar kebijakan SOP yang ada di *database*).

---

## 🚀 Fitur Utama
- **Semantic Vector Search:** Pencarian dokumen SOP perusahaan secepat kilat menggunakan *pgvector*.
- **Smart Division Routing:** Email terpisah secara spesifik (Logistik, Finance, CS Umum).
- **Evaluator Dashboard UI:** Tampilan skor evaluasi performa AI secara _real-time_ di dalam UI setiap email.
- **Smart Replies & Actions:** Klik 1 tombol untuk langsung mengirim draf balasan yang sudah dipilah dan dipastikan aman oleh sistem Evaluator.

## 🛠 Teknologi yang Digunakan
- **Frontend / Backend:** Next.js (App Router), React, TailwindCSS
- **Database:** PostgreSQL + Prisma ORM + pgvector (Ekstensi Vektor)
- **AI Models:** `@google/generative-ai` (Gemini SDK)
- **Authentication:** NextAuth (Google Provider)
- **Deployment:** NGINX, PM2 (Ubuntu VPS)

## 🔧 Setup Instalasai (Lokal)
1. Klon *repository* ini.
2. Jalankan `npm install`.
3. Siapkan *file* `.env.local` dan masukkan:
   - `DATABASE_URL` (database Postgres wajib mendukung ekstensi *vector*).
   - `GEMINI_API_KEY`
   - Kredensial `GOOGLE_CLIENT_ID` dan rahasia *OAuth* lainnya.
4. Jalankan `npx prisma db push` untuk inisialisasi skema dan *pgvector*.
5. Jalankan `npm run dev`.

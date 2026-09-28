# Secure Quiz Wrapper

Wrapper kuis berbasis Google Form dengan monitoring pelanggaran: tab-switch,
blur, dan keluar fullscreen dicatat per peserta, lalu bisa diekspor ke Excel.

## Arsitektur penyimpanan

`lib/db.ts` adalah satu-satunya lapisan yang menyentuh data, dengan dua backend
yang berganti lewat antarmuka yang sama:

- **Postgres** (Supabase, Neon, Vercel Postgres) aktif selama `DATABASE_URL`
  terisi. Inilah yang dipakai di hosting serverless seperti Vercel.
- **File JSON** di `.data/db.json` dipakai kalau `DATABASE_URL` kosong, supaya
  pengembangan lokal tetap jalan tanpa konfigurasi apa pun.

Keduanya mengembalikan bentuk data yang identik, termasuk timestamp sebagai
string ISO, jadi tidak ada kode di atas `lib/db.ts` yang perlu tahu backend mana
yang sedang hidup.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Tanpa konfigurasi tambahan aplikasi langsung memakai `.data/db.json`. Ini cukup
untuk pengembangan, tetapi **tidak akan berhasil di Vercel atau hosting
serverless lain**: filesystem di sana read-only dan tidak bertahan antar
request. Itulah sebabnya `/api/auth/register` membalas 500 ketika dideploy tanpa
database eksternal.

## Setup Supabase / Postgres

1. Buat project di [supabase.com](https://supabase.com).
2. Jalankan `supabase/schema.sql` di SQL Editor. Aman dijalankan berulang kali.
3. Salin connection string dari **Project Settings → Database**. Gunakan URI
   *Session pooler* (port `5432`) yang sudah memuat `?sslmode=require`.
4. Simpan sebagai `DATABASE_URL` di `.env.local`, lalu di **Vercel → Project
   Settings → Environment Variables**. Tambahkan juga domain production ke
   allowed origins bila `npm run dev` dipakai di Vercel.
5. Opsional, pindahkan data lama dari `.data/db.json`:

   ```bash
   DATABASE_URL="postgresql://..." node scripts/migrate-to-postgres.mjs
   ```

   Script aman dijalankan berulang kali karena memakai `upsert` berdasarkan id.
   File JSON tetap dipakai sebagai backup.

Semua akses database hanya dari server Next.js lewat connection string. Jangan
pernah memakai `anon` atau `service_role` key di kode browser: peserta tidak
boleh bisa membaca atau mengubah data monitoringnya sendiri.

Kontrak API tidak berubah, jadi tidak ada yang perlu disesuaikan di frontend.

### Environment variables

| Nama | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Untuk deploy | Connection string Postgres/Supabase. Kosongkan untuk memakai `.data/db.json`. |
| `DATABASE_POOL_MAX` | Tidak | Koneksi per instance serverless, default `2`. |
| `JWT_SECRET` | Untuk deploy | Kunci penandatangan cookie sesi admin. Buat dengan `openssl rand -base64 48`. |

## Perintah

```bash
npm run dev      # server pengembangan
npm run build    # build produksi
npm run lint     # eslint
npx tsc --noEmit # cek tipe
```

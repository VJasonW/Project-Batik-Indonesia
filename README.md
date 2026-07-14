# Peta Interaktif 3D Batik Indonesia

Aplikasi web full-stack interaktif untuk mempelajari motif batik dari berbagai provinsi di Indonesia menggunakan peta 3D yang interaktif, dilengkapi dengan Admin Panel untuk mengelola data motif batik secara langsung.

## Struktur Project

```
├── backend/          # Server API (Express.js + Prisma + SQLite)
└── frontend/         # Aplikasi Web (Next.js + Three.js + Tailwind CSS)
```

---

## Cara Menjalankan Project

### 1. Menjalankan Backend (Server API)

Masuk ke folder `backend`:
```bash
cd backend
```

Instalasi dependensi:
```bash
npm install
```

Inisialisasi Database SQLite & Seeding:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

Jalankan server pengembangan (berjalan di port `3001`):
```bash
npm run dev
```

Akun Admin bawaan hasil seed data:
- **Email:** `admin@batik.id`
- **Password:** `admin123`

---

### 2. Menjalankan Frontend (Aplikasi Web)

Masuk ke folder `frontend`:
```bash
cd ../frontend
```

Instalasi dependensi:
```bash
npm install
```

Jalankan server pengembangan (berjalan di port `3000`):
```bash
npm run dev
```

Buka browser dan akses:
- **Landing Page (Peta 3D):** [http://localhost:3000](http://localhost:3000)
- **Admin Panel Login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Fitur Utama

1. **Peta 3D Interaktif:** Menampilkan 38 provinsi Indonesia dalam bentuk 3D. Dapat diputar (drag), dizoom (scroll), digeser (pan), dan disorot saat kursor didekatkan (hover highlight).
2. **Dynamic Tooltip:** Menampilkan nama provinsi beserta beberapa contoh motif batik saat provinsi disorot.
3. **Halaman Detail Provinsi:** Menampilkan informasi rinci provinsi beserta galeri motif batik yang ada di database.
4. **Detail Motif Batik (Modal):** Menampilkan gambar batik, daerah asal, ringkasan singkat, sejarah, serta makna & filosofi motif batik tersebut.
5. **Admin Panel CRUD:** Admin dapat login dan melakukan pengelolaan (Tambah, Edit, Hapus) motif batik per provinsi, termasuk mengunggah gambar batik secara langsung.
6. **Responsive Design:** Tampilan web dapat menyesuaikan dengan baik di perangkat desktop maupun tablet.

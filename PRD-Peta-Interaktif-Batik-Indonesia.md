# Product Requirements Document (PRD)
## Peta Interaktif 2D Batik Indonesia

| | |
|---|---|
| **Versi Dokumen** | 2.0 (revisi besar: peta diganti dari 3D ke 2D basemap nyata, color palette diganti ke putih-hitam + aksen dinamis per provinsi, interaksi disamakan dengan pola 3-tahap PRD "Pertempuran 5 Hari Semarang") |
| **Tanggal** | 29 Juni 2026 |
| **Status** | Draft — siap untuk diproses agentic coding tool (Antigravity) |
| **Author** | Jason |

---

## 1. Latar Belakang & Ringkasan

Website ini menampilkan **peta Indonesia dalam bentuk 2D**, menggunakan **peta asli berbasis tile map (basemap nyata)** — bukan bentuk wilayah abstrak/buatan — dengan layer batas wilayah seluruh **34 provinsi**. Interaksi dirancang dalam **3 tahap terpisah** (mengikuti pola yang sudah divalidasi pada PRD "Peta Interaktif Sejarah Pertempuran 5 Hari Semarang", untuk menghindari animasi/layout shift berlebihan yang sebelumnya berpotensi memicu bug glitch/bergetar hanya karena gerakan mouse):

1. **Hover** provinsi → muncul **tooltip kecil yang mengikuti posisi kursor** (ringan, tidak memicu perubahan layout apa pun), berisi ringkasan sangat singkat (nama provinsi + 1-2 nama motif batik utama).
2. **Klik** pada provinsi tersebut (di peta) → muncul **panel informasi di 1/3 bagian kanan halaman**, berisi ringkasan lebih lengkap (masih di halaman yang sama, peta tidak berpindah posisi).
3. **Klik** pada konten/tombol di dalam panel kanan tersebut → baru navigasi ke **halaman detail provinsi** yang terpisah, dengan galeri & informasi motif batik lengkap.

Provinsi yang datanya belum lengkap/belum diinput tidak menampilkan tooltip hover maupun panel klik dengan isi penuh (atau menampilkan indikator netral "data motif belum tersedia"), mengikuti pola yang sama dengan kecamatan tanpa data historis pada PRD Pertempuran 5 Hari.

**Tema visual (color palette)**: dominan **putih dan hitam** (monokrom, bersih, minimalis) sebagai warna dasar peta dan UI. Saat sebuah provinsi **di-hover**, warna highlight-nya **berubah mengikuti corak/warna khas batik provinsi tersebut** (misalnya provinsi dengan tradisi batik bernuansa soga-coklat akan menyala kecoklatan, provinsi dengan batik pesisir yang cerah akan menyala dengan warna lebih berani) — bukan satu warna aksen tetap untuk seluruh provinsi seperti pada tema "perang & vintage" di PRD sebelumnya. **Warna aksen per provinsi ini dapat diedit melalui admin panel** apabila di kemudian hari dirasa kurang merepresentasikan/kurang cocok.

Konsep besar mengikuti PRD "Peta Interaktif Sejarah Pertempuran 5 Hari Semarang", dengan perbedaan utama:
- Cakupan wilayah: **per provinsi se-Indonesia (34 provinsi)**, bukan per kecamatan satu kota.
- Tema konten: **motif batik & kekayaan budayanya**, bukan peristiwa sejarah perang.
- Color palette: **putih & hitam (monokrom) sebagai dasar, dengan aksen dinamis per provinsi mengikuti corak batik** (bukan palet tetap putih-merah-coklat bertema vintage/perang), dan aksen ini **dapat diedit lewat admin panel**.
- Pola interaksi 3 tahap (tooltip kursor → panel kanan → navigasi detail) **disamakan persis** dengan PRD Pertempuran 5 Hari, mengganti pola "klik langsung navigasi" pada versi 1.0 PRD ini sebelumnya.
- Bentuk peta diganti dari **3D (extruded mesh, Three.js)** menjadi **2D basemap nyata** (tile map), mengikuti pendekatan yang sudah lebih stabil pada PRD Pertempuran 5 Hari.

> **Catatan**: versi sebelumnya (v1.0) dari PRD ini menggunakan peta 3D penuh (extrude GeoJSON, bisa dirotasi) dengan interaksi satu tahap (klik → langsung navigasi halaman detail) dan color palette earth-tone tetap. Pada revisi ini, pendekatan diganti total mengikuti pola yang telah divalidasi pada PRD Pertempuran 5 Hari Semarang: peta **2D basemap nyata**, interaksi **bertingkat 3 tahap**, dan color palette **putih-hitam + aksen dinamis per provinsi**. Detail teknis lihat FR-1 dan Section 8.1.

---

## 2. Tujuan Produk

1. Menjadi media edukasi & promosi budaya batik Indonesia secara visual dan interaktif, dengan eksplorasi berbasis lokasi geografis nyata.
2. Memetakan motif-motif batik ke wilayah administratif (provinsi) secara jelas dan mudah dieksplorasi, tanpa kompleksitas render 3D.
3. Memberikan alat input (admin panel) bagi pengelola/kurator konten untuk menambah data motif batik secara bertahap, termasuk menyesuaikan warna aksen visual tiap provinsi agar representatif terhadap corak batik daerah tersebut.

## 3. Target Pengguna

- **Pengguna umum**: pelajar, peneliti budaya, turis, pecinta batik yang ingin eksplorasi visual.
- **Admin/kurator konten**: pihak yang menginput dan mengelola data batik per provinsi (mis. mahasiswa/tim proyek itu sendiri), termasuk menentukan/menyesuaikan warna aksen tiap provinsi.

## 4. Lingkup (Scope)

### 4.1 In-Scope (MVP)
- Peta 2D interaktif Indonesia dengan batas wilayah seluruh **34 provinsi**, ditampilkan di atas basemap nyata.
- Indikator visual yang membedakan provinsi **memiliki data motif batik** vs **belum memiliki data** (mis. opacity/fill lebih jelas pada provinsi berdata).
- Interaksi **hover** pada provinsi berdata → **tooltip kecil mengikuti posisi kursor** (ringkasan sangat singkat: nama provinsi + 1-2 nama motif utama) **sekaligus** highlight warna provinsi berubah mengikuti corak/warna khas batik provinsi tersebut.
- Interaksi **klik** pada provinsi berdata (masih di halaman peta) → **panel informasi muncul di 1/3 bagian kanan halaman** (ringkasan lebih lengkap dari tooltip: daftar motif, deskripsi singkat).
- Interaksi **klik** pada konten/tombol di dalam panel kanan tersebut → navigasi ke **halaman detail provinsi** terpisah (`/provinsi/[slug]`).
- Hover/klik pada provinsi tanpa data → tidak menampilkan tooltip/panel penuh, atau menampilkan versi netral "Data motif batik belum tersedia untuk provinsi ini".
- Halaman detail provinsi: galeri seluruh motif batik provinsi tersebut (gambar, nama, sejarah singkat, makna/filosofi per motif).
- Kontrol peta: zoom in/out, pan (drag), reset to default view.
- Backend CRUD untuk data Provinsi & Motif Batik, termasuk pengaturan **warna aksen (accent color)** per provinsi.
- Admin panel sederhana (form input/edit/hapus data motif batik per provinsi, upload gambar, **color picker** untuk menyesuaikan warna aksen hover provinsi).
- Responsive (desktop & tablet minimal; mobile best-effort untuk fase awal).

### 4.2 Out-of-Scope (Fase ini)
- Autentikasi multi-role kompleks (cukup 1 role admin dengan login sederhana).
- Multi-bahasa (boleh ditambahkan di fase berikutnya).
- Mode AR/VR atau peta 3D (sudah digantikan basemap 2D pada revisi ini).
- Komentar/rating dari pengguna publik.

### 4.3 Kemungkinan Pengembangan Lanjutan (Future)
- Filter/search motif batik lintas provinsi.
- Mode "story mode" / guided tour otomatis berpindah antar provinsi.
- Integrasi peta dengan data wisata/budaya lain (situs UNESCO, festival, sentra produksi batik, dll).
- Multi-bahasa (ID/EN).
- Saran warna aksen otomatis (mis. ekstraksi warna dominan dari gambar motif yang diupload) sebagai default sebelum diedit manual oleh admin.

---

## 5. User Flow Utama

```
[Landing Page: Peta 2D Indonesia — basemap nyata, tema putih & hitam]
        |
        v
Hover provinsi:
  - Jika punya data motif batik → tooltip kecil muncul mengikuti posisi kursor
    (nama provinsi + 1-2 nama motif utama) + warna fill provinsi berubah
    mengikuti corak/warna khas batik daerah tersebut
  - Jika tidak punya data → tidak ada tooltip, warna tetap putih/hitam netral
        |
        v
Klik provinsi (di peta, berdata) → Panel informasi muncul di 1/3 bagian kanan halaman
  - Peta tetap di posisi semula (tidak ada pergeseran layout)
  - Isi panel: nama provinsi + daftar ringkas motif batik (maks. 3-5 + "lihat semua")
    + deskripsi singkat budaya batik provinsi + tombol "Lihat detail lengkap"
        |
        v
Klik tombol "Lihat detail lengkap" di panel kanan → Navigasi ke /provinsi/[slug]
        |
        v
[Halaman Detail Provinsi]
  - Header: nama & info singkat provinsi (ibu kota, region, deskripsi budaya batik)
  - Grid/galeri seluruh motif batik provinsi tersebut (gambar + nama)
  - Klik kartu motif → Modal/halaman detail motif (gambar besar, sejarah, makna, filosofi)
  - Tombol "Kembali ke Peta"
```

**Flow Admin:**
```
[Login Admin] → [Dashboard] → [Pilih Provinsi] → [Tambah/Edit/Hapus Motif Batik]
   - Input: nama motif, deskripsi, sejarah, makna filosofis, upload gambar
   - Simpan → data langsung tersedia di tooltip, panel, & halaman detail (live, tanpa redeploy)

[Login Admin] → [Dashboard] → [Pilih Provinsi] → [Atur Warna Aksen]
   - Color picker untuk menentukan warna highlight saat provinsi di-hover
   - Preview langsung di mini-map sebelum disimpan
   - Status provinsi otomatis berubah jadi "berdata" begitu ada minimal 1 motif tersimpan
```

---

## 6. Functional Requirements

### FR-1: Peta Asli (Basemap Nyata) dengan Overlay Batas Provinsi
- Peta menggunakan **basemap nyata** (tile map sungguhan, bukan bentuk wilayah 3D/abstrak yang digambar ulang seperti versi 1.0) — basemap menampilkan kontur pulau, laut, jalan utama, dll secara nyata, sehingga pengguna langsung mengenali bentuk geografis Indonesia sesuai aslinya.
- Di atas basemap, ditampilkan **layer overlay GeoJSON** berisi batas wilayah seluruh **34 provinsi** Indonesia, digambar sebagai polygon yang menempel akurat pada basemap (berbasis data GeoJSON resmi wilayah Indonesia, disederhanakan/disimplify agar performa rendering tetap ringan).
- View awal (default) di-pusatkan & di-zoom otomatis agar seluruh wilayah Indonesia pas terlihat dalam viewport (termasuk Sumatra hingga Papua).
- Kontrol peta: zoom in/out, pan (drag), reset to default view (tombol) — standar kontrol peta berbasis tile (seperti Leaflet/Google Maps), bukan kontrol kamera 3D custom.
- **Visual differentiation data**: provinsi yang memiliki data motif batik diberi fill warna berbeda (lebih jelas/solid, default putih dengan border hitam tegas) dari provinsi tanpa data (fill lebih pudar/abu-abu netral) — lihat Section 11.1 untuk detail palet.
- **Highlight dinamis saat hover** (lihat FR-2): warna fill provinsi berubah dari putih/hitam netral menjadi warna aksen khas batik provinsi tersebut, dengan transisi warna yang smooth (bukan perubahan instan/kasar).

### FR-2: Tooltip Mengikuti Kursor (Hover) + Highlight Warna Dinamis
- Saat kursor hover di atas provinsi **berdata**, tampil **tooltip kecil yang mengikuti posisi kursor** (muncul beberapa pixel di kanan-bawah posisi kursor, mengikuti gerakan mouse secara real-time, dengan throttle/debounce wajar agar tidak memicu glitch).
- Isi tooltip: nama provinsi + ringkasan sangat singkat (maks. 1-2 nama motif batik utama saja — bukan daftar lengkap, untuk menjaga tooltip ringan).
- **Bersamaan dengan tooltip**, warna fill provinsi yang di-hover berubah ke **warna aksen khas batik daerah tersebut** (lihat Section 9.1 untuk field `accent_color` pada data Provinsi), dengan transisi smooth (±200-300ms), lalu kembali ke warna netral putih/hitam saat kursor keluar area.
- Tooltip & highlight warna **tidak memicu perubahan layout apa pun** pada peta atau halaman (tidak ada pergeseran posisi elemen lain, tidak ada panel yang otomatis terbuka).
- Saat hover di atas provinsi **tanpa data**: tooltip tidak muncul, dan warna fill tidak berubah (tetap netral), untuk mengurangi noise visual dan menghindari kesan "ada data" yang menyesatkan.
- Tooltip hilang otomatis & warna kembali netral saat kursor keluar dari area provinsi.
- Pada perangkat sentuh (tanpa hover): tahap tooltip-mengikuti-kursor ini dilewati — tap pertama pada provinsi berdata langsung memicu FR-3 (panel kanan).

### FR-3: Panel Informasi saat Klik (di Halaman Peta)
- Saat provinsi **berdata** diklik (bukan hover), muncul **panel informasi di 1/3 bagian kanan halaman** (slide-in dari kanan dengan animasi sederhana fade/slide — bukan memindahkan posisi peta).
- Peta **tetap berada di posisi semula** (tidak ada pergeseran 2/3-1/3 pada elemen peta itu sendiri) — hanya panel kanan yang muncul menutupi/berdampingan dengan sebagian area peta.
- Isi panel: nama provinsi, deskripsi singkat budaya batik provinsi tersebut, daftar ringkas motif batik (maks. 3-5 motif dengan thumbnail kecil, + "+N lainnya" jika lebih), dan **tombol/link "Lihat detail lengkap"**.
- Klik pada provinsi **tanpa data** → tidak memunculkan panel (atau panel netral kecil "Data motif batik belum tersedia untuk provinsi ini", tanpa tombol navigasi).
- Klik di luar panel (area peta lain) atau tombol "Tutup" pada panel → panel tertutup, kembali ke state default.
- Klik provinsi berdata lain saat panel sedang terbuka → konten panel update ke provinsi baru tersebut (tanpa perlu menutup-buka ulang), dan warna highlight peta ikut menyesuaikan ke aksen provinsi yang baru dipilih.

### FR-4: Navigasi ke Halaman Detail (dari Panel)
- Klik pada **tombol "Lihat detail lengkap" di dalam panel kanan** (bukan klik langsung di peta) → redirect ke halaman `/provinsi/{slug-provinsi}`.
- Halaman detail menampilkan:
  - Nama & info umum provinsi (ibu kota, region, deskripsi budaya batik daerah tersebut).
  - Grid/galeri seluruh motif batik provinsi tersebut.
  - Detail tiap motif: gambar, nama, sejarah singkat, makna/filosofi, daerah asal spesifik (kota/kabupaten jika ada).

### FR-5: Backend & Manajemen Data (CRUD)
- Backend menyediakan REST API untuk:
  - Provinsi: get all (dengan flag `has_data` & `accent_color`), get by slug (dengan seluruh motifnya).
  - Motif Batik: create, read, update, delete — terhubung ke provinsi (foreign key).
  - Upload gambar motif batik (disimpan di storage, URL disimpan di DB).
  - Update warna aksen (`accent_color`) per provinsi — endpoint khusus admin.
- Data harus tersimpan persisten di database (bukan hardcoded di frontend).
- Field `has_data` pada provinsi dihitung otomatis (derived) dari keberadaan minimal 1 motif batik terkait, bukan field yang diinput manual terpisah.

### FR-6: Admin Panel
- Halaman login admin (autentikasi sederhana — email/password atau token).
- Dashboard list 34 provinsi, dengan indikator jumlah motif batik tiap provinsi dan preview warna aksen saat ini.
- Klik provinsi → kelola motif batik provinsi tersebut (tambah/edit/hapus).
- Form input motif batik: nama, deskripsi, sejarah, makna filosofis, upload gambar (preview sebelum submit).
- **Pengaturan warna aksen**: color picker untuk menentukan warna highlight hover provinsi, dengan preview langsung pada mini-map sebelum disimpan, beserta opsi "reset ke warna default" jika tersedia.
- Validasi input dasar (field wajib, ukuran gambar maksimum, format gambar, format warna hex valid).

---

## 7. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| **Performa** | Render awal peta 2D < 2 detik di koneksi normal; tooltip mengikuti kursor & transisi warna hover harus update mulus tanpa lag/glitch; animasi slide-in panel kanan terasa smooth (≥ 30fps). |
| **Kompatibilitas Browser** | Chrome, Edge, Firefox versi terbaru. Basis peta menggunakan basemap tile nyata (Leaflet/MapLibre, lihat Section 8.1); WebGL hanya diperlukan jika memilih MapLibre GL JS, tidak diperlukan jika memilih Leaflet standar. |
| **Responsif** | Layout menyesuaikan di desktop & tablet; mobile minimal bisa lihat & navigasi (panel kanan bisa berubah jadi bottom-sheet di mobile). |
| **Keamanan** | Endpoint admin (create/update/delete, termasuk update warna aksen) wajib terautentikasi; validasi input di backend untuk cegah injection/XSS pada data teks. |
| **Skalabilitas data** | Mendukung 34 provinsi × ±10-30 motif batik per provinsi tanpa penurunan performa signifikan. |
| **Maintainability** | Data peta (GeoJSON) dan data konten (batik + warna aksen) terpisah secara jelas — peta tidak perlu diubah saat data batik atau warna aksen berubah. |

---

## 8. Asumsi Teknis & Rekomendasi Stack

> ⚠️ Bagian ini adalah **asumsi/rekomendasi** berdasarkan kebutuhan "peta basemap nyata + overlay provinsi + tooltip kursor + panel klik + warna aksen dinamis + backend CRUD". Silakan sesuaikan/ganti sebelum dimasukkan ke Antigravity jika preferensi stack berbeda.

### 8.1 Frontend
- **Framework**: React + TypeScript (Next.js direkomendasikan untuk routing `/provinsi/[slug]` dengan SSR/SEO-friendly, mengingat ini konten edukasi yang idealnya bisa diindeks mesin pencari).
- **Render Peta**: gunakan **basemap tile map nyata** (bukan extruded mesh 3D seperti versi 1.0). Library yang direkomendasikan: **Leaflet** via **react-leaflet** (ringan, dukungan GeoJSON layer native lewat `<GeoJSON>` component) — alternatif: **MapLibre GL JS** jika ingin styling basemap lebih custom/vector-based.
  - **Basemap tile**: OpenStreetMap standar untuk MVP (gratis, tanpa API key). Untuk konsistensi dengan tema monokrom putih-hitam (Section 11.1), basemap diberi **filter CSS** (`grayscale(100%)` + sedikit `contrast`/`brightness`) pada container peta, atau gunakan provider tile bertema monokrom (mis. CartoDB Positron) agar tidak bertabrakan secara visual dengan warna aksen dinamis pada overlay provinsi.
  - **Layer GeoJSON provinsi**: di-render sebagai layer terpisah di atas basemap, dengan `style` function yang mengembalikan warna fill berbeda untuk provinsi berdata vs tidak, dan mengembalikan `accent_color` dari data provinsi saat state hover aktif, serta `onEachFeature` untuk binding event hover/klik per polygon.
- **Highlight dinamis saat hover** (FR-2): gunakan method native layer (`layer.setStyle()` pada GeoJSON feature yang di-hover, men-set `fillColor` ke `accent_color` provinsi tersebut) — pola standar Leaflet yang ringan dan **tidak memicu reflow** pada elemen DOM lain, sehingga risiko bug glitch/bergetar minim.
- **Tooltip mengikuti kursor** (FR-2): gunakan tooltip bawaan Leaflet (`bindTooltip` dengan opsi `sticky: true`) yang otomatis mengikuti kursor tanpa implementasi manual `mousemove` + state React.
- **Panel kanan saat klik** (FR-3): gunakan state React terpisah (mis. `selectedProvince`) yang hanya berubah saat event `click` pada layer GeoJSON, terpisah total dari state hover.
- **Color picker admin** (FR-6): komponen color picker standar (mis. `react-colorful` atau native `<input type="color">` dibungkus UI custom) yang menyimpan hasil sebagai hex string ke field `accent_color`.
- **Data Geografis**: GeoJSON batas administrasi 34 provinsi Indonesia (sumber publik, mis. repo GeoJSON Indonesia di GitHub — perlu disederhanakan/disimplify agar performa rendering tetap ringan, dan divalidasi kelengkapan 34 provinsinya).
- **State management**: TanStack Query untuk fetch data dari backend (provinsi, motif batik, warna aksen).
- **Styling**: Tailwind CSS, dengan **color palette dominan putih & hitam** + aksen dinamis per provinsi (detail lihat Section 11.1).

### 8.2 Backend
- **Runtime**: Node.js + Express (atau Fastify).
- **Database**: PostgreSQL (relasional, cocok untuk relasi Provinsi 1—N Motif Batik) — alternatif ringan: SQLite untuk MVP/dev lokal.
- **ORM**: Prisma.
- **Storage gambar**: lokal/filesystem untuk dev, atau S3-compatible storage (mis. Cloudflare R2) untuk production.
- **Autentikasi admin**: JWT sederhana / session-based, 1 role admin cukup untuk MVP.

### 8.3 Struktur Folder (saran tingkat tinggi)
```
/frontend
  /src
    /components (MapIndonesia, ProvinceInfoPanel, ProvinceTooltip, MotifCard, AccentColorPicker, AdminForm, ...)
    /pages atau /app (Next.js routes: / , /provinsi/[slug], /admin/...)
    /lib (api client, leaflet/geojson helpers)
    /data (file GeoJSON batas provinsi Indonesia)
/backend
  /src
    /routes (provinces.ts, motifs.ts, auth.ts, upload.ts)
    /controllers
    /models (Prisma schema)
    /middleware (auth.ts)
  prisma/schema.prisma
```

---

## 9. Data Model

### 9.1 Entity: Province
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| slug | string | unik, untuk URL (mis. `jawa-tengah`) |
| name | string | Nama provinsi |
| capital | string | Ibu kota (opsional) |
| region | string | Wilayah besar (Sumatra/Jawa/Kalimantan/dll, opsional) |
| geo_id | string | ID yang match dengan properti di file GeoJSON |
| short_description | text | Ditampilkan di panel & halaman detail |
| accent_color | string (hex) | Warna highlight saat provinsi di-hover, mencerminkan corak/warna khas batik daerah; default diisi saat seed data, **dapat diedit kapan saja lewat admin panel** |

> Catatan: tidak ada field `has_data` tersimpan permanen — status ini dihitung dari relasi (`COUNT(batik_motifs) > 0`), sama seperti pola pada PRD Pertempuran 5 Hari.

### 9.2 Entity: BatikMotif
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| province_id | FK → Province | Relasi ke provinsi |
| name | string | Nama motif batik |
| image_url | string | URL gambar motif |
| short_summary | string | Ditampilkan di tooltip/panel (ringkas) |
| history | text | Sejarah motif |
| meaning | text | Makna/filosofi motif |
| origin_city | string | Kota/kabupaten asal spesifik (opsional) |
| created_at / updated_at | timestamp | Audit |

### 9.3 Entity: AdminUser
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| email | string | Login |
| password_hash | string | Hash password |

---

## 10. API Endpoints (Draft)

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/provinces` | List 34 provinsi + flag `has_data` + `accent_color` | Publik |
| GET | `/api/provinces/:slug` | Detail provinsi + seluruh motif batiknya | Publik |
| GET | `/api/provinces/:slug/motifs/summary` | Daftar ringkas motif (untuk tooltip & panel, payload kecil) | Publik |
| GET | `/api/motifs/:id` | Detail satu motif batik | Publik |
| POST | `/api/auth/login` | Login admin | Publik |
| POST | `/api/motifs` | Tambah motif batik baru | Admin |
| PUT | `/api/motifs/:id` | Update motif batik | Admin |
| DELETE | `/api/motifs/:id` | Hapus motif batik | Admin |
| PUT | `/api/provinces/:slug/accent-color` | Update warna aksen hover provinsi | Admin |
| POST | `/api/upload` | Upload gambar motif | Admin |

---

## 11. UI/UX Notes

### 11.1 Color Palette (Tema Monokrom + Aksen Dinamis Batik)

| Warna | Kode (saran) | Penggunaan |
|---|---|---|
| **Putih** | `#FAFAFA` (off-white, bukan putih murni agar tetap lembut di mata) | Background utama, fill default provinsi (state idle/netral) |
| **Hitam** | `#1A1A1A` | Teks utama, border peta, stroke batas provinsi, elemen tipografi |
| **Aksen dinamis (per provinsi)** | bervariasi, default disarankan mengikuti corak khas batik daerah (contoh: Jawa Tengah/Yogyakarta → soga-coklat `#6B4226`; Madura → merah-kuning berani `#C0392B`/`#E1AD01`; Cirebon → biru mega mendung `#3B6B8C`; Pekalongan → multi-warna cerah, pilih satu dominan; Bali → turquoise/hijau `#2E8B7C`) | Warna fill **hanya saat provinsi di-hover**, kembali ke putih/hitam netral saat kursor keluar; **dapat diedit bebas lewat admin panel** per provinsi |

- Tema dasar harus terasa **monokrom, bersih, dan modern** (kontras dengan tema vintage/perang pada PRD sebelumnya) — basemap diberi filter grayscale agar selaras.
- Warna aksen per provinsi berfungsi sebagai "kejutan visual" saat eksplorasi: peta yang awalnya hitam-putih perlahan "hidup" dengan warna khas batik saat dijelajahi pengguna.
- Tipografi disarankan menggunakan sans-serif modern dan bersih (kontras dengan kesan klasik/serif pada tema sejarah), agar konsisten dengan kesan minimalis-kontemporer khas presentasi batik modern.
- Ikon/aset bertema batik (motif garis sederhana sebagai dekorasi header, bukan ilustrasi penuh warna) digunakan secukupnya agar tidak bertabrakan dengan kesan monokrom.

### 11.2 Layout & Interaksi Peta

- **Halaman Utama (state default/idle)**: peta 2D Indonesia diposisikan **di tengah layar**, dengan judul singkat tentang Batik Indonesia di header, dan legenda kecil ("provinsi bertanda = memiliki data motif batik"). Peta tetap di posisi ini sepanjang waktu — **tidak ada pergeseran posisi peta** pada interaksi apa pun (hover maupun klik).
- **Saat hover provinsi berdata (state: tooltip + highlight warna)**:
  - Warna fill provinsi bertransisi smooth dari putih/hitam netral ke `accent_color` provinsi tersebut.
  - **Tooltip kecil muncul mengikuti posisi kursor** (card kecil, border hitam tipis, background putih, teks ringkas nama provinsi + 1-2 motif utama).
  - Tidak ada perubahan layout/posisi elemen lain.
- **Saat klik provinsi berdata (state: panel terbuka)**:
  - **Panel informasi slide-in dari kanan**, menempati **1/3 bagian kanan layar** (card dengan border hitam tipis, background putih, judul provinsi diberi aksen warna `accent_color` provinsi tersebut sebagai sentuhan personalisasi), berisi ringkasan lebih lengkap + tombol "Lihat detail lengkap".
  - Peta tetap di posisi tengah/semula — panel hanya menambah elemen baru di atas/berdampingan dengan peta, tidak menggeser peta.
  - Transisi panel (muncul/hilang) smooth (durasi ±200-300ms) tapi sederhana (fade/slide saja, tanpa animasi kompleks pada peta).
- **Saat klik tombol "Lihat detail lengkap" di panel** → navigasi ke halaman detail provinsi (full page, lihat FR-4).
- **Saat panel ditutup** (klik tombol tutup / klik di luar panel): panel hilang, kembali ke state default.
- **Halaman Detail Provinsi**: hero section (nama provinsi, dengan aksen `accent_color` provinsi sebagai elemen dekoratif header), grid card motif batik (gambar + nama), klik card → modal atau halaman detail motif dengan gambar besar, sejarah, dan makna/filosofi.
- **Admin Panel**: layout dashboard standar (sidebar daftar provinsi dengan swatch warna aksen kecil di samping nama, area konten tabel motif + tombol tambah/edit/hapus, plus section "Atur Warna Aksen" dengan color picker dan preview mini-map). Admin panel boleh memakai palet warna yang lebih netral/fungsional demi kemudahan penggunaan, tidak harus seketat tema monokrom publik.

---

## 12. Acceptance Criteria (Definition of Done MVP)

- [ ] Peta menampilkan basemap nyata (bukan bentuk 3D/abstrak) dengan overlay batas seluruh 34 provinsi Indonesia yang akurat secara geografis.
- [ ] Provinsi yang memiliki data motif batik tampil berbeda secara visual (fill lebih solid) dari provinsi tanpa data (fill pudar/netral), mengikuti tema putih-hitam dasar.
- [ ] Hover provinsi berdata memunculkan tooltip kecil yang mengikuti posisi kursor secara mulus (tanpa glitch/bergetar), tanpa memicu perubahan layout apa pun.
- [ ] Hover provinsi berdata mengubah warna fill provinsi tersebut menjadi `accent_color` yang sesuai dengan corak batik daerahnya, dengan transisi smooth.
- [ ] Hover provinsi tanpa data tidak memunculkan tooltip apa pun dan tidak mengubah warna fill.
- [ ] Klik provinsi berdata memunculkan panel informasi di 1/3 bagian kanan halaman, tanpa memindahkan posisi peta.
- [ ] Klik provinsi berdata lain saat panel terbuka memperbarui isi panel (dan warna highlight) ke provinsi yang baru diklik.
- [ ] Klik tombol "Lihat detail lengkap" di dalam panel berhasil navigasi ke halaman detail provinsi yang sesuai.
- [ ] Klik provinsi tanpa data tidak memunculkan panel (atau memunculkan versi netral tanpa tombol navigasi).
- [ ] Halaman detail provinsi menampilkan seluruh motif batik milik provinsi tersebut, diambil dari database (bukan hardcoded).
- [ ] Admin dapat login, menambah, mengedit, dan menghapus data motif batik, dan perubahan langsung terlihat di frontend tanpa redeploy.
- [ ] Admin dapat mengubah `accent_color` tiap provinsi lewat color picker, dengan preview, dan perubahan langsung terlihat saat provinsi di-hover di frontend publik.
- [ ] Upload gambar motif berfungsi dan gambar tampil dengan benar di panel/halaman detail.
- [ ] Tidak ada bug glitch/bergetar pada tooltip maupun panel kanan saat mouse digerakkan di atas peta secara cepat/berulang.

---

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Data GeoJSON batas 34 provinsi Indonesia bisa kompleks/berat → render peta lambat | Sederhanakan (simplify) polygon GeoJSON sebelum dirender; gunakan level-of-detail yang wajar untuk web. |
| Menentukan satu `accent_color` representatif per provinsi bersifat subjektif (sebuah provinsi bisa punya banyak motif dengan warna berbeda-beda) | Jadikan field ini eksplisit **dapat diedit oleh admin** (bukan dihitung otomatis dari gambar), dengan default awal yang masuk akal saat seeding; sediakan preview sebelum simpan agar admin bisa menilai kecocokan secara visual. |
| Data batik 34 provinsi belum lengkap saat development | Mulai dengan beberapa provinsi sample (mis. 5-6 provinsi) untuk validasi teknis peta 2D, tooltip, panel, dan color picker; lengkapi data secara bertahap via admin panel, sama seperti pola pada PRD Pertempuran 5 Hari. |
| Basemap tile peta nyata (berwarna penuh/default OSM) bisa bertabrakan secara visual dengan tema monokrom putih-hitam | Terapkan filter CSS (`grayscale`) pada container basemap, atau gunakan tile provider monokrom (mis. CartoDB Positron) agar basemap selaras dengan overlay provinsi & aksen warna dinamis. |
| Tooltip mengikuti kursor + perubahan warna hover dapat menyebabkan re-render berlebihan jika tidak ditangani dengan benar, berpotensi memicu bug glitch/bergetar | Gunakan API tooltip/style bawaan Leaflet (`bindTooltip(sticky:true)`, `layer.setStyle()`) yang sudah teroptimasi, alih-alih implementasi manual berbasis `onMouseMove` + state React; pastikan state panel klik (FR-3) terpisah total dari state hover (FR-2). |
| Kompatibilitas WebGL/Canvas di device lama (jika memilih MapLibre GL) | Default ke Leaflet standar (raster tile + SVG/Canvas overlay) yang tidak memerlukan WebGL; sediakan fallback pesan jika benar-benar diperlukan. |

---

## 14. Milestone/Fase Pengerjaan (Saran)

1. **Fase 1 — Setup & Validasi Data Peta**: Setup project (frontend+backend), validasi sumber GeoJSON batas 34 provinsi Indonesia, render basemap nyata (Leaflet) + overlay provinsi dasar (warna putih-hitam netral, tanpa data motif).
2. **Fase 2 — Interaksi Peta**: Implementasi tooltip mengikuti kursor saat hover (dengan data dummy) + highlight warna aksen dinamis + panel kanan saat klik, klik tombol di panel → routing ke halaman detail (placeholder).
3. **Fase 3 — Backend & Database**: Setup database, model Province (termasuk `accent_color`) & BatikMotif, API endpoints, seed data sample (5-6 provinsi) dengan warna aksen default.
4. **Fase 4 — Integrasi Data Real**: Hubungkan tooltip, panel, & halaman detail ke API backend (bukan dummy lagi).
5. **Fase 5 — Admin Panel**: Login admin, CRUD motif batik, upload gambar, color picker untuk warna aksen + preview mini-map.
6. **Fase 6 — Pelengkapan Data**: Tim/kurator mulai input seluruh data motif batik 34 provinsi secara bertahap melalui admin panel, sambil menyesuaikan warna aksen tiap provinsi.
7. **Fase 7 — Polish & QA**: Responsive check, optimasi performa tooltip kursor & panel klik (cek tidak ada glitch), testing acceptance criteria.

---

*Dokumen ini disusun sebagai input untuk agentic coding tool (Antigravity). Bagian asumsi teknis (Section 8) dapat diedit sesuai preferensi sebelum dieksekusi. Revisi v2.0 ini menyamakan konsep besar PRD ini dengan PRD "Peta Interaktif Sejarah Pertempuran 5 Hari Semarang": bentuk peta (2D basemap nyata + overlay GeoJSON, bukan 3D), pola interaksi bertingkat 3 tahap (tooltip mengikuti kursor saat hover → panel di 1/3 kanan saat klik, peta tidak bergeser → navigasi halaman detail saat klik tombol di panel), dan struktur dokumen — dengan adaptasi khas tema batik: cakupan wilayah tetap per provinsi (bukan kecamatan), serta color palette dasar putih-hitam dengan aksen warna dinamis per provinsi yang mengikuti corak batik daerah dan dapat disesuaikan lewat admin panel.*

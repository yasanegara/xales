import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const articles = [
  {
    slug: 'apa-itu-tweak',
    title: 'Apa itu tweak? Platform Baru untuk Kreator Indonesia',
    description: 'Kenalan dengan tweak — platform publishing modern yang dirancang khusus agar kreator Indonesia bisa menulis, berbagi, dan menghasilkan dari karya mereka.',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop',
    category: 'Tentang tweak',
    tags: ['tweak', 'platform', 'kreator', 'indonesia'],
    content: `# Apa itu tweak?

**tweak** adalah platform publishing untuk kreator Indonesia — tempat di mana kamu bisa menulis artikel, membangun produk digital (app/tools), dan menghasilkan uang dari karya kamu.

## Kenapa tweak?

Selama ini, kreator Indonesia punya dua pilihan:
- **Blog lama** (Blogspot, WordPress): ribet setup, tampilan jadul, monetisasi susah
- **Media sosial** (Instagram, Twitter): jangkauan besar tapi konten tenggelam, tidak ada monetisasi serius

tweak hadir di tengah keduanya — **tampilan modern**, **mudah digunakan**, dan **monetisasi built-in** sejak hari pertama.

## Untuk siapa tweak?

- **Penulis & blogger** yang ingin tampilan profesional tanpa ribet
- **Developer & maker** yang ingin menjual tools, template, atau app
- **Educator & konsultan** yang ingin memonetisasi knowledge mereka
- **Siapa saja** yang punya sesuatu berharga untuk dibagikan

## Apa yang bisa kamu lakukan di tweak?

### 1. Publish Artikel
Tulis dengan editor markdown yang bersih dan cepat. Tambah gambar, kode, tabel — semua tersedia. Artikel kamu langsung masuk ke feed dan bisa ditemukan oleh ribuan pembaca.

### 2. Jual Konten Premium
Tandai konten sebagai premium, tentukan harga, dan biarkan pembaca yang tertarik bayar langsung. Tidak ada potongan platform yang mencekik — kamu ambil mayoritas.

### 3. Bangun Audiens
Pembaca bisa follow akun kamu. Setiap kali kamu publish, mereka langsung tahu. Feed "Diikuti" memastikan konten kamu sampai ke orang yang benar-benar mau baca.

### 4. Publish App & Tools
Selain artikel, kamu bisa publish app HTML/JavaScript langsung di tweak. Pembaca bisa pakai tool kamu langsung dari browser.

## Mulai sekarang

Daftar gratis di tweak hanya butuh email dan password. Tidak perlu kartu kredit, tidak perlu tunggu review. **Publish dalam 5 menit.**`,
  },
  {
    slug: 'cara-mulai-di-tweak',
    title: 'Cara Mulai di tweak: Panduan Lengkap untuk Kreator Baru',
    description: 'Panduan step-by-step untuk mendaftar, setup profil, dan publish artikel pertama kamu di tweak — dari nol sampai live dalam 15 menit.',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop',
    category: 'Panduan',
    tags: ['panduan', 'pemula', 'setup', 'tweak'],
    content: `# Cara Mulai di tweak

Selamat datang! Artikel ini adalah panduan lengkap untuk kreator baru yang ingin mulai di tweak. Ikuti langkah-langkahnya dan kamu akan publish artikel pertama dalam waktu kurang dari 15 menit.

## Langkah 1: Daftar Akun

1. Buka **tweak.id**
2. Klik tombol **"Mulai gratis"**
3. Masukkan email dan buat password (minimal 8 karakter)
4. Klik **"Daftar"**

Selesai. Akun kamu langsung aktif.

## Langkah 2: Setup Profil

Profil yang lengkap membuat pembaca lebih percaya dan lebih mungkin follow kamu.

Buka **Dashboard → Pengaturan** dan isi:

- **Nama tampilan**: nama asli atau nama pena kamu
- **Username**: akan jadi URL profil kamu (tweak.id/@username)
- **Bio**: 1-2 kalimat tentang siapa kamu dan apa yang kamu tulis
- **Foto profil**: upload foto atau avatar
- **Status**: kalimat singkat yang muncul di profil (opsional)

> 💡 **Tips**: Username tidak bisa diubah setelah dipilih. Pilih yang pendek, mudah diingat, dan relevan dengan brand kamu.

## Langkah 3: Publish Artikel Pertama

1. Dari Dashboard, klik **"Tulis Artikel Baru"**
2. Isi **judul** artikel
3. Tambahkan **deskripsi** singkat (muncul di preview feed)
4. Upload **cover image** (opsional tapi sangat direkomendasikan)
5. Tulis konten di editor
6. Pilih **kategori** dan tambahkan **tags**
7. Klik **"Publish"**

### Format Konten

tweak menggunakan **Markdown** — format teks yang sederhana:

\`\`\`
# Judul Besar
## Sub Judul

**teks tebal**
*teks miring*

- item list
- item lain

> Kutipan penting

\`\`\`code\`\`\`
\`\`\`

## Langkah 4: Bagikan Konten Kamu

Setelah publish, kamu akan dapat URL unik seperti:
\`tweak.id/@username/judul-artikel\`

Bagikan URL ini ke:
- WhatsApp dan grup yang relevan
- Instagram story dengan link
- Twitter/X
- LinkedIn (untuk konten profesional)

## Tips untuk Artikel Pertama

- **Perkenalkan diri**: ceritakan siapa kamu dan apa yang akan kamu bahas
- **Jangan terlalu panjang**: 500-800 kata sudah cukup untuk artikel pertama
- **Gunakan gambar**: artikel dengan gambar cover dapat 3x lebih banyak klik
- **Tulis jujur**: pembaca menghargai suara yang autentik

---

Sudah siap? **[Daftar sekarang](https://tweak.id/register)** dan mulai perjalanan kamu sebagai kreator.`,
  },
  {
    slug: 'menulis-artikel-yang-viral-di-tweak',
    title: 'Menulis Artikel yang Dibaca Ribuan Orang di tweak',
    description: 'Strategi konten terbukti untuk membuat artikel yang menarik, informatif, dan punya potensi viral di platform tweak.',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop',
    category: 'Tips Konten',
    tags: ['konten', 'menulis', 'viral', 'strategi'],
    content: `# Menulis Artikel yang Dibaca Ribuan Orang

Sudah publish tapi sepi pembaca? Atau mau mulai tapi bingung mau nulis apa? Artikel ini bahas strategi konten yang benar-benar bekerja di platform seperti tweak.

## Formula Judul yang Mengundang Klik

Judul adalah penentu hidup mati sebuah artikel. Pembaca memutuskan dalam 2 detik apakah mau klik atau scroll lanjut.

**Format yang terbukti bekerja:**
- **"X Cara..."** → "7 Cara Meningkatkan Produktivitas tanpa Burnout"
- **"Panduan Lengkap..."** → "Panduan Lengkap Freelance di Indonesia 2025"
- **"Kenapa..."** → "Kenapa 90% Startup Gagal di Tahun Pertama"
- **"Dari [A] ke [B]..."** → "Dari Gaji 4 Juta ke 20 Juta: Perjalanan 2 Tahun"

> ❌ Hindari: judul yang terlalu generik seperti "Tips Sukses" atau "Cara Belajar"

## Struktur Artikel yang Membuat Pembaca Tetap Baca

### Opening yang Kuat

Kalimat pertama harus langsung menyentuh masalah atau rasa ingin tahu pembaca:

✅ "Setiap hari ada 1.000 artikel baru di internet. Tapi yang dibaca ribuan orang bisa dihitung jari."

❌ "Dalam artikel ini, saya akan membahas tentang cara menulis artikel yang baik..."

### Body: Pecah Jadi Bagian Kecil

- Gunakan **heading** (##, ###) untuk navigasi
- Paragraf maksimal 3-4 kalimat
- Gunakan **bullet point** untuk daftar
- Sisipkan **blockquote** untuk highlight poin penting

### Closing yang Actionable

Jangan end artikel dengan "Demikian artikel ini..." — itu mematikan.

Tutup dengan:
- **Tantangan**: "Coba terapkan 1 tip ini hari ini"
- **Pertanyaan**: "Mana yang paling relevan dengan kondisi kamu?"
- **CTA**: link ke artikel lain atau halaman profil kamu

## Topik yang Laris di tweak

Berdasarkan tren konten Indonesia, ini kategori dengan engagement tinggi:

1. **Pengembangan diri** — produktivitas, mindset, habit
2. **Keuangan personal** — investasi, freelance, income tambahan
3. **Teknologi & tools** — review app, tutorial, workflow
4. **Karir & kerja** — remote work, career switch, salary negotiation
5. **Bisnis & entrepreneurship** — startup, ide bisnis, case study

## Konsistensi vs Kualitas

Pertanyaan klasik: mending sering publish atau jarang tapi berkualitas?

**Jawaban**: **Konsisten dengan kualitas yang cukup baik.**

- Target 1-2 artikel per minggu
- Artikel 800-1500 kata lebih efektif dari artikel 300 kata atau 5000 kata
- Buat jadwal: Senin riset, Rabu nulis, Jumat publish

## Optimasi Cover Image

Artikel dengan cover image yang bagus dapat **3x lebih banyak klik** di feed.

Tips cover image:
- Ukuran ideal: **1200x630px** (rasio 16:9)
- Gunakan foto yang relevan dengan topik
- Hindari foto stockphoto yang terlalu generik
- Canva free plan sudah cukup untuk buat cover menarik

---

Ingat: **artikel pertama tidak harus sempurna.** Yang penting mulai. Setiap artikel yang kamu publish adalah latihan untuk artikel berikutnya yang lebih baik.`,
  },
  {
    slug: 'publish-app-dan-tools-di-tweak',
    title: 'Publish App & Tools di tweak: Panduan untuk Developer',
    description: 'Cara membuat dan mempublikasikan HTML app, tools, atau kalkulator interaktif langsung di tweak — tanpa hosting tambahan.',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
    category: 'Developer',
    tags: ['app', 'developer', 'html', 'tools', 'tutorial'],
    content: `# Publish App & Tools di tweak

Selain artikel, tweak juga mendukung **konten tipe App** — kamu bisa publish HTML/JavaScript tools yang langsung bisa dipakai oleh pembaca tanpa meninggalkan platform.

## Apa itu App di tweak?

App di tweak adalah konten yang berisi **kode HTML + CSS + JavaScript** yang dirender langsung di browser pembaca. Cocok untuk:

- **Kalkulator** (kalkulator kredit, kalkulator zakat, BMI calculator)
- **Generator** (nama bisnis, password, color palette)
- **Converter** (mata uang, ukuran, format)
- **Mini tools** (timer, todo list, note sederhana)
- **Game sederhana** (quiz, teka-teki)
- **Template interaktif**

## Kenapa Publish App di tweak?

1. **Tidak perlu hosting** — tweak yang handle, kamu fokus buat
2. **Built-in audience** — langsung muncul di feed dan bisa dicari
3. **Monetisasi mudah** — jadikan premium, pembaca bayar untuk akses
4. **Satu tempat** — artikel + app dalam satu profil

## Cara Membuat App

### 1. Pilih Tipe Konten "App"

Saat buat konten baru, pilih tipe **"App (HTML)"** bukan "Artikel (Markdown)".

### 2. Tulis Kode di Editor

Editor app menerima **HTML penuh**, termasuk \`<style>\` dan \`<script>\`:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 2rem; }
    button { padding: 0.5rem 1rem; background: #1a1a1a; color: white; border: none; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <h2>Kalkulator Sederhana</h2>
  <input type="number" id="a" placeholder="Angka 1">
  <input type="number" id="b" placeholder="Angka 2">
  <button onclick="hitung()">Hitung</button>
  <p id="hasil"></p>

  <script>
    function hitung() {
      const a = +document.getElementById('a').value
      const b = +document.getElementById('b').value
      document.getElementById('hasil').textContent = 'Hasil: ' + (a + b)
    }
  </script>
</body>
</html>
\`\`\`

### 3. Preview Sebelum Publish

Editor menampilkan preview real-time di samping kode. Pastikan app berfungsi sebelum publish.

### 4. Tambahkan Deskripsi yang Jelas

Deskripsi yang baik untuk app:
- Jelaskan **apa yang dilakukan** app
- Sebutkan **siapa yang butuh** app ini
- Cantumkan **cara penggunaan** singkat

## Tips Membuat App yang Laku

### Selesaikan Satu Masalah Spesifik

App yang bagus: **"Kalkulator Cicilan Motor"**
App yang terlalu luas: **"Kalkulator Keuangan Lengkap"**

Semakin spesifik masalah yang diselesaikan, semakin jelas nilai yang ditawarkan.

### Tampilan Bersih dan Responsif

\`\`\`css
/* Responsive dasar */
* { box-sizing: border-box; }
body { margin: 0; padding: 1rem; max-width: 600px; margin: 0 auto; }
input, button { width: 100%; margin: 0.5rem 0; }
\`\`\`

### Tambahkan Error Handling

\`\`\`javascript
function hitung() {
  const a = parseFloat(document.getElementById('a').value)
  if (isNaN(a)) {
    alert('Masukkan angka yang valid')
    return
  }
  // proses...
}
\`\`\`

## Monetisasi App

App bisa dijadikan **premium** dengan cara yang sama seperti artikel:

- **Freemium**: versi basic gratis, fitur lengkap premium
- **Paid**: bayar untuk akses penuh
- **Preview + paywall**: tampilkan interface tapi blokir fungsi utama

---

Punya tool yang sering kamu pakai sendiri? **Wrap dalam HTML dan publish di tweak.** Kemungkinan besar ada ribuan orang lain yang butuh hal yang sama.`,
  },
  {
    slug: 'cara-monetisasi-di-tweak',
    title: 'Cara Monetisasi di tweak: Panduan Lengkap Penghasilan Kreator',
    description: 'Semua cara menghasilkan uang dari konten di tweak — dari konten premium, penjualan file, hingga sistem bundle.',
    coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=630&fit=crop',
    category: 'Monetisasi',
    tags: ['monetisasi', 'penghasilan', 'premium', 'kreator'],
    content: `# Cara Monetisasi di tweak

Satu hal yang membedakan tweak dari platform lain: **monetisasi adalah fitur inti, bukan afterthought**. Berikut semua cara yang bisa kamu gunakan untuk menghasilkan dari konten kamu.

## 1. Konten Premium

Cara paling langsung: tandai konten sebagai **premium** dan tentukan harga.

Bagaimana cara kerjanya:
- Pembaca melihat preview/teaser konten
- Untuk baca penuh, mereka bayar harga yang kamu tentukan
- Uang masuk langsung ke rekening/QRIS kamu

**Cocok untuk:**
- Artikel riset mendalam
- Tutorial step-by-step
- Template dan panduan eksklusif
- App dan tools

**Tips pricing:**
- Artikel biasa: Rp 9.000 – Rp 25.000
- Panduan/tutorial lengkap: Rp 25.000 – Rp 75.000
- Bundle konten: Rp 50.000 – Rp 200.000

## 2. Setup Pembayaran

Sebelum bisa menerima bayaran, setup salah satu metode:

### Transfer Bank
Masuk ke **Pengaturan → Pembayaran**, isi:
- Nama bank
- Nomor rekening
- Nama pemegang rekening

### QRIS
Upload gambar QRIS kamu. Pembaca bisa bayar dari aplikasi apapun.

> Pembeli akan melihat info pembayaran setelah klik beli, dan kamu dikabari via notifikasi untuk konfirmasi.

## 3. Penjualan File

Lampirkan file ke artikel atau jual file secara terpisah:

- **Template** (Excel, Notion, Figma)
- **Source code** (project, plugin, snippet)
- **E-book** (PDF)
- **Preset** (Lightroom, VSCO, dll)

File bisa:
- **Gratis** → untuk bangun audiens dan trust
- **Berbayar** → harga terpisah dari artikel induknya
- **Bundled** dengan artikel premium

## 4. Diskon & Promo

Buat diskon untuk meningkatkan konversi:
- Diskon persentase per konten
- Diskon khusus untuk pembaca setia
- Flash sale untuk boost penjualan

Diskon dikelola di **Pengaturan → Diskon** per konten.

## 5. WhatsApp Responder

Aktifkan WA Responder untuk auto-reply setelah pembelian:
- Kirim link download
- Kirim onboarding message
- Arahkan ke komunitas atau channel

Setup di **Pengaturan → WhatsApp Responder**.

## Strategi Monetisasi yang Berhasil

### Mix Gratis dan Premium

Jangan semua konten premium — ini malah mengurangi pembaca.

Formula yang bekerja:
- **80% gratis** → bangun kepercayaan, naikkan follower
- **20% premium** → konten terbaik dan terdalam

### Harga Psikologis

- Rp 9.999 terasa lebih murah dari Rp 10.000
- Bundle selalu lebih menarik dari satuan
- "Dari Rp 75.000, sekarang Rp 49.000" lebih powerful dari langsung Rp 49.000

### Konsisten Publish

Pembaca yang sering melihat konten gratis kamu yang bagus lebih mungkin bayar untuk yang premium. Konsistensi membangun kepercayaan yang mengkonversi.

## Berapa Bisa Dihasilkan?

Tidak ada angka pasti, tapi ini gambaran realistis:

| Jumlah Pembaca Aktif | Konversi 2% | Harga Rp 25.000 |
|---|---|---|
| 500 | 10 pembeli | Rp 250.000/bulan |
| 2.000 | 40 pembeli | Rp 1.000.000/bulan |
| 10.000 | 200 pembeli | Rp 5.000.000/bulan |

Kunci: **bangun audiens dulu, monetisasi mengikuti.**

---

Mulai dengan satu konten premium. Lihat responnya. Iterate dari sana.`,
  },
  {
    slug: 'sistem-afiliasi-tweak',
    title: 'Sistem Afiliasi tweak: Hasilkan Komisi dari Rekomendasi',
    description: 'Cara kerja program afiliasi di tweak — bagaimana kreator bisa mengaktifkan afiliasi per konten dan bagaimana affiliator mendapatkan komisi.',
    coverImage: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&h=630&fit=crop',
    category: 'Monetisasi',
    tags: ['afiliasi', 'komisi', 'monetisasi', 'passive income'],
    content: `# Sistem Afiliasi tweak

Program afiliasi di tweak memungkinkan **dua pihak menghasilkan secara bersamaan** — kreator dapat pembeli baru, affiliator dapat komisi. Win-win yang sebenarnya.

## Bagaimana Cara Kerjanya?

### Untuk Kreator (Pemilik Konten)

1. **Aktifkan afiliasi** per konten di editor
2. **Tentukan rate komisi** (misalnya 20% dari harga jual)
3. **Otomatis** — affiliator yang berhasil membawa pembeli dapat komisi sesuai rate

Contoh: Konten harga Rp 50.000 dengan rate afiliasi 20% → affiliator dapat **Rp 10.000 per penjualan**.

### Untuk Affiliator (Promotor)

1. Temukan konten dengan program afiliasi aktif
2. Bagikan ke audiens kamu
3. Setiap pembelian yang terjadi via link kamu = komisi masuk

## Setup Afiliasi sebagai Kreator

Di editor konten, buka section **"Konten Premium"**:

- Toggle **"Program Afiliasi"** ke aktif
- Isi **persentase komisi** (1–80%)
- Simpan

> 💡 **Tips rate**: 20-30% adalah range yang menarik untuk affiliator tapi tetap worthwhile untuk kamu. Di bawah 15% jarang dipromosikan.

## Strategi Afiliasi yang Efektif

### Sebagai Kreator

**Pilih rate yang kompetitif**

Affiliator punya banyak pilihan konten untuk dipromosikan. Rate 25-30% membuat konten kamu jadi prioritas mereka.

**Buat materi promosi**

Sediakan:
- Deskripsi singkat konten (1-2 kalimat)
- Key points yang bisa dipromosikan
- Target audiens yang tepat

**Konten premium berkualitas**

Affiliator tidak akan mau promosi konten yang mengecewakan pembeli — reputasi mereka taruhan. Pastikan konten kamu benar-benar worth it.

### Sebagai Affiliator

**Promosi ke audiens yang relevan**

Jangan spam. Rekomendasikan hanya ke orang yang benar-benar butuh. Konversi tinggi dari audiens kecil lebih baik dari konversi rendah dari audiens besar.

**Buat konten pendukung**

Tulis review atau testimoni yang jujur. Penjelasan "kenapa saya rekomendasikan ini" jauh lebih efektif dari sekedar share link.

**Tracking performa**

Pantau konten afiliasi mana yang convert. Fokus energi ke yang paling menghasilkan.

## Perhitungan Komisi

| Harga Konten | Rate Afiliasi | Komisi per Penjualan |
|---|---|---|
| Rp 25.000 | 20% | Rp 5.000 |
| Rp 50.000 | 25% | Rp 12.500 |
| Rp 100.000 | 30% | Rp 30.000 |
| Rp 200.000 | 20% | Rp 40.000 |

Dengan 10 penjualan per bulan dari konten Rp 100.000 komisi 30%: **Rp 300.000/bulan** dari satu konten.

## Kombinasi Ideal

**Kreator yang juga affiliator** = maksimalkan penghasilan:
- Hasilkan dari konten sendiri yang premium
- Tambah passive income dari promosi konten kreator lain
- Bangun ekosistem saling support antar kreator

---

Program afiliasi tweak dirancang supaya ekosistem kreator saling menguatkan, bukan bersaing. Mulai aktifkan untuk konten premium terbaik kamu.`,
  },
  {
    slug: 'membangun-audiens-di-tweak',
    title: 'Membangun Audiens di tweak: Strategi Pertumbuhan untuk Kreator',
    description: 'Cara sistematis membangun follower, meningkatkan viewcount, dan menciptakan komunitas pembaca setia di tweak.',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=630&fit=crop',
    category: 'Strategi',
    tags: ['audiens', 'pertumbuhan', 'follower', 'komunitas', 'strategi'],
    content: `# Membangun Audiens di tweak

Konten bagus tanpa audiens seperti pertunjukan tanpa penonton. Tapi audiens tidak datang sendiri — ada sistem yang harus dibangun. Ini strategi yang benar-benar bekerja.

## Pahami Dulu: Bagaimana Pembaca Menemukan Kamu

Di tweak, ada beberapa jalur penemuan:

1. **Feed Terbaru** — konten baru kamu muncul di feed semua pengguna
2. **Feed Trending** — konten dengan banyak view/like naik ke atas
3. **Tag & Kategori** — pembaca yang cari topik spesifik
4. **Profil langsung** — orang yang kamu share profilenya
5. **Rekomendasi** — suggested users di feed

Implikasinya: **kualitas + konsistensi** = naik ke trending = lebih banyak exposure = lebih banyak follower.

## Fase 1: Fondasi (0-100 Follower)

Di fase ini, tujuannya bukan viral — tapi membangun fondasi konten yang solid.

**Langkah:**

1. **Publish 5-10 artikel** sebelum aktif promosi
   - Pembaca baru yang lihat profil kosong = langsung pergi
   - Profil dengan 10 artikel = langsung follow

2. **Tentukan niche yang spesifik**
   - ❌ "Saya nulis tentang bisnis dan lifestyle dan teknologi"
   - ✅ "Saya nulis tentang freelance desain untuk mahasiswa"

3. **Tulis bio yang clear**
   - Siapa kamu + untuk siapa kamu nulis + apa manfaatnya

4. **Upload foto profil yang jelas**
   - Muka terlihat = kepercayaan naik

## Fase 2: Pertumbuhan (100-1000 Follower)

**Distribusi ke luar platform:**

- **WhatsApp Group**: share ke grup yang relevan dengan judul + satu kalimat hook
- **Instagram Story**: screenshot artikel + link di bio, atau gunakan link sticker
- **Twitter/X**: thread yang summarize artikel, link di akhir
- **LinkedIn**: untuk konten karir/bisnis/profesional

**Formula share yang efektif:**

> "Baru publish artikel tentang [masalah spesifik].
> Di dalamnya saya bahas [benefit konkrit 1] dan [benefit konkrit 2].
> Baca gratis di: [link]"

**Engage dengan kreator lain:**

- Comment yang substantif di artikel kreator lain (bukan sekedar "bagus!")
- Follow kreator di niche yang sama
- Kolaborasi artikel atau saling mention

## Fase 3: Skalabilitas (1000+ Follower)

**Buat content series:**

Alih-alih artikel yang standalone, buat series 3-5 artikel yang saling terkait:
- "Freelance dari Nol: Part 1 — Mindset"
- "Freelance dari Nol: Part 2 — Cari Client"
- "Freelance dari Nol: Part 3 — Pricing"

Pembaca yang suka Part 1 akan baca semuanya dan langsung follow.

**Bangun email list (kalau ada):**

Mention di artikel: "Kalau mau dapat notif artikel baru, follow akun ini di tweak."

**Leverage trending moment:**

Konten yang relevan dengan berita/tren terkini dapat pickup organik yang jauh lebih tinggi.

## Konsistensi vs Virality

**Jangan kejar viral — kejar konsistensi.**

Satu artikel viral tidak membangun audiens. Tapi 50 artikel berkualitas yang dipublish konsisten selama setahun = audiens yang solid dan setia.

Target realistis:
- **Minggu 1-4**: 1-2 artikel/minggu, fokus kualitas
- **Bulan 2-3**: mulai distribusi aktif, target 100 follower
- **Bulan 4-6**: iterasi dari data, konten yang populer perbanyak
- **Bulan 7-12**: mulai monetisasi serius, target 1000+ follower

## Metrik yang Penting

- **View count**: indikator reach
- **Follower growth**: indikator retention
- **Engagement rate**: komentar/rating per view
- **Konversi premium**: seberapa banyak yang bayar

Focus pada follower growth dan engagement — itu yang sustainable. View tinggi sekali lalu turun tidak berguna.

---

Audiens dibangun satu orang dalam satu waktu. Tulis untuk satu orang spesifik, publish konsisten, dan hasilnya akan terlihat dalam 3-6 bulan. **Mulai sekarang, bukan "nanti kalau sudah siap."**`,
  },
]

async function main() {
  const password = 'Tweak@2025!'
  const passwordHash = await bcrypt.hash(password, 12)

  // Create or update the @tweak.id account
  const user = await db.user.upsert({
    where: { username: 'tweak.id' },
    update: {},
    create: {
      email: 'hello@tweak.id',
      username: 'tweak.id',
      passwordHash,
      name: 'tweak',
      bio: 'Platform publishing untuk kreator Indonesia. Tulis, bagikan, dan hasilkan dari karya kamu.',
      role: 'admin',
      verified: true,
      status: '✍️ Platform resmi tweak',
      profilePic: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop',
    },
  })

  console.log(`✅ User created: @${user.username} (${user.email})`)

  // Create articles
  for (const article of articles) {
    const post = await db.post.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        type: 'markdown',
        content: article.content,
        category: article.category,
        tags: article.tags,
        coverImage: article.coverImage,
        published: true,
        isPremium: false,
        publishedAt: new Date(),
        viewCount: Math.floor(Math.random() * 800) + 100,
        likeCount: Math.floor(Math.random() * 80) + 10,
        authorId: user.id,
      },
    })
    console.log(`✅ Article: "${post.title}"`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Selesai! Credential akun @tweak.id:')
  console.log('   Email   : hello@tweak.id')
  console.log('   Password: Tweak@2025!')
  console.log('   URL     : /u/tweak.id')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())

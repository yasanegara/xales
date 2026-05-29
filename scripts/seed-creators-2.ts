import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const CREATORS = [
  {
    email: 'marketing@tweak.id',
    username: 'marketing.kreatif',
    name: 'Marketing Kreatif',
    password: 'Creator@2025!',
    bio: 'Strategi digital marketing praktis untuk UMKM dan kreator Indonesia. Dari konten viral hingga iklan berbayar yang menghasilkan.',
    profilePic: 'https://api.dicebear.com/7.x/shapes/png?seed=marketing-kreatif&size=256',
    articles: [
      {
        slug: 'marketing-7-formula-konten-viral-tiktok-reels',
        title: '7 Formula Konten yang Selalu Viral di TikTok dan Reels',
        description: 'Pola konten yang terbukti mendapatkan ratusan ribu penonton — dari hook yang kuat, struktur cerita, hingga CTA yang menggerakkan. Lengkap dengan 21 contoh nyata.',
        category: 'Marketing',
        tags: ['konten viral', 'tiktok', 'reels', 'social media', 'marketing'],
        coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# 7 Formula Konten yang Selalu Viral di TikTok dan Reels

## Mengapa Sebagian Konten Viral dan Sebagian Tidak?

Algoritma TikTok dan Instagram Reels sangat mengutamakan **completion rate** (berapa banyak orang menonton sampai habis) dan **engagement rate** (like, komentar, share).

Konten yang viral bukan soal keberuntungan — ada formula yang bisa dipelajari.

---

## Formula 1: Problem-Agitate-Solve (PAS)

Paling efektif untuk konten edukatif.

**Struktur:**
- **0-3 detik:** Tunjukkan masalah yang audiens rasakan
- **3-10 detik:** Perparah masalah itu (bikin mereka "sakit")
- **10+ detik:** Berikan solusi

**Contoh hook:** *"Kenapa konten kamu sepi padahal sudah posting setiap hari?"*

---

## Formula 2: Before-After-Bridge

Sangat kuat untuk konten transformasi.

**Struktur:**
- Before: kondisi awal yang buruk
- After: kondisi setelah pakai solusimu
- Bridge: bagaimana caranya

---

## Formula 3: Listicle Countdown

*"5 kesalahan yang bikin follower kamu tidak bertambah..."*

Orang tidak bisa berhenti menonton karena penasaran dengan nomor selanjutnya.

**Tips:** Mulai dari nomor terkecil, simpan yang paling mengejutkan untuk terakhir.

---

## Formula 4: Controversy Hook

*"Pendapat saya berbeda dengan kebanyakan marketing guru..."*

Kontroversi = komentar = jangkauan. Tapi gunakan dengan bertanggung jawab — kontroversi yang berbasis fakta, bukan provokasi kosong.

---

## Formula 5: Story-Lesson-CTA

Format cerita pribadi yang mengajarkan sesuatu.

**Contoh:** "Dulu penghasilan saya Rp 2 juta/bulan. Ini 3 hal yang saya ubah..."

Orang suka belajar dari pengalaman nyata orang lain.

---

## Formula 6: Tutorial Singkat (60 Detik)

*"Cara buat konten viral dalam 60 detik"*

Tunjukkan prosesnya secara real-time. Nilai edukatif tinggi + mudah dishare.

---

## Formula 7: React/POV

*"POV: Kamu buka analytics dan engagement naik 300%"*

Format ini menciptakan koneksi emosional langsung dengan penonton.

---

## 3 Elemen Hook yang Tidak Boleh Gagal

1. **Visual pertama yang menarik** — 3 detik pertama menentukan segalanya
2. **Text overlay yang menggugah** — tambahkan teks di frame awal
3. **Suara/musik yang tepat** — gunakan trending audio

---

## Jadwal Posting Optimal

| Platform | Waktu Terbaik |
|---|---|
| TikTok | Jam 7-9 pagi, 12-14 siang, 19-22 malam |
| Instagram Reels | Jam 8-9 pagi, 12-13 siang, 20-22 malam |

Konsistensi lebih penting dari timing — posting 3x seminggu secara rutin lebih baik dari 7x seminggu tapi tidak konsisten.`,
      },
      {
        slug: 'marketing-seo-dasar-halaman-1-google',
        title: 'SEO Dasar untuk Pemula: Cara Website Kamu Muncul di Halaman 1 Google',
        description: 'Panduan SEO yang tidak membingungkan — riset kata kunci, optimasi on-page, dan cara mendapat backlink organik. Cocok untuk pemilik bisnis dan blogger pemula.',
        category: 'Marketing',
        tags: ['SEO', 'google', 'website', 'digital marketing', 'pemula'],
        coverImage: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# SEO Dasar untuk Pemula

## Apa itu SEO dan Kenapa Penting?

SEO (Search Engine Optimization) adalah proses mengoptimalkan website agar muncul di posisi atas hasil pencarian Google secara organik — artinya **gratis, tanpa bayar iklan**.

Mengapa penting? Karena 75% pengguna Google tidak pernah scroll ke halaman 2. Kalau kamu tidak di halaman 1, kamu hampir tidak ada.

## Langkah 1: Riset Kata Kunci

Sebelum menulis konten, cari tahu apa yang dicari orang.

### Tools gratis:
- **Google Search Console** — lihat kata kunci yang sudah mendatangkan traffic
- **Ubersuggest** (versi gratis) — riset volume dan persaingan
- **Google Suggest** — ketik di Google, lihat autocomplete
- **Ahrefs Free Tools** — analisis domain dasar

### Cara memilih kata kunci:
1. **Search Volume** sedang (500-5.000/bulan) — tidak terlalu sepi, tidak terlalu bersaing
2. **Keyword Difficulty** rendah (< 30) — untuk pemula
3. **Relevan** dengan bisnis/konten kamu

**Contoh:** Daripada target "kue" (terlalu umum), target "kue brownies kukus tanpa oven" (lebih spesifik, lebih mudah ranking).

## Langkah 2: Optimasi On-Page

### Judul Halaman (Title Tag)
- Masukkan kata kunci utama di awal judul
- Panjang ideal: 50-60 karakter
- **Contoh:** "Resep Brownies Kukus Tanpa Oven | Mudah dan Lembut"

### Meta Description
- Ringkasan 150-160 karakter yang muncul di hasil Google
- Harus menarik klik, bukan hanya memasukkan kata kunci

### Heading Structure
- H1: satu per halaman, mengandung kata kunci utama
- H2-H3: sub-topik, gunakan variasi kata kunci

### Konten Berkualitas
- Minimal 800 kata untuk artikel blog
- Jawab pertanyaan yang dicari pengguna dengan lengkap
- Gunakan gambar dengan alt text yang relevan

## Langkah 3: Kecepatan Website

Google mengutamakan website yang cepat.

**Cek kecepatan:** PageSpeed Insights (gratis dari Google)

**Tips mempercepat:**
- Kompres gambar sebelum upload (gunakan TinyPNG)
- Pilih hosting yang cepat
- Gunakan plugin cache (jika WordPress)

## Langkah 4: Backlink Organik

Backlink = website lain yang link ke website kamu = tanda kepercayaan di mata Google.

### Cara mendapat backlink gratis:
1. **Guest post** di blog relevan — tulis artikel, minta link balik
2. **Direktori bisnis lokal** — daftarkan bisnis di Google My Business, Yellow Pages
3. **Forum/komunitas** — jawab pertanyaan di Kaskus, forum bisnis, dengan link ke konten kamu
4. **Media sosial** — share konten, beberapa platform memberi dofollow link

## Langkah 5: Konsistensi

SEO bukan sprint — ini marathon. Hasil biasanya terlihat 3-6 bulan setelah optimasi.

**Target realistis untuk pemula:**
- Bulan 1-2: Setup teknis, buat 10 artikel berkualitas
- Bulan 3-4: Mulai lihat traffic organik pertama
- Bulan 6+: Beberapa artikel masuk halaman 1`,
      },
      {
        slug: 'marketing-iklan-meta-umkm-indonesia',
        title: 'Panduan Iklan Meta (Facebook & Instagram) untuk UMKM Indonesia',
        description: 'Cara membuat iklan Meta yang menghasilkan penjualan nyata — dari struktur kampanye, targeting yang tepat, kreatif iklan yang menarik, hingga analisis dan optimasi.',
        category: 'Marketing',
        tags: ['facebook ads', 'instagram ads', 'meta ads', 'UMKM', 'iklan digital'],
        coverImage: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 25000,
        content: `# Panduan Iklan Meta untuk UMKM Indonesia

## Mengapa Meta Ads?

Facebook dan Instagram masih platform terkuat untuk menjangkau konsumen Indonesia. Dengan 120+ juta pengguna aktif di Indonesia, Meta Ads memberikan targeting yang sangat presisi dengan budget yang fleksibel.

## Struktur Kampanye yang Benar

Meta Ads memiliki 3 level hierarki:

**Kampanye → Ad Set → Iklan**

- **Kampanye:** Tentukan tujuan (Traffic, Engagement, Konversi, dll)
- **Ad Set:** Tentukan audience, budget, jadwal, placement
- **Iklan:** Kreatif visual dan copywriting

## Pemilihan Objective yang Tepat

| Tujuan Bisnis | Objective Meta |
|---|---|
| Dapat follower | Engagement |
| Kunjungan website | Traffic |
| Penjualan langsung | Conversions/Sales |
| Pesan WhatsApp | Messages |
| Branding | Reach |

**Rekomendasi untuk UMKM pemula:** Mulai dengan **Messages** — orang klik iklan, langsung WhatsApp kamu.

## Targeting: Siapa yang Melihat Iklanmu?

### Targeting dasar:
- **Lokasi:** Kota/provinsi spesifik
- **Usia:** Sesuaikan dengan pembeli potensial
- **Jenis kelamin:** Jika produk spesifik

### Targeting minat (Interest):
Targetkan orang yang tertarik dengan topik relevan. Contoh untuk produk busana muslim:
- Busana muslim, hijab, fashion muslimah
- Islam, Al-Quran
- Shopping, online shopping

### Lookalike Audience:
Setelah punya 100+ pelanggan, upload datanya ke Meta dan buat Lookalike — Meta akan mencari orang yang mirip pelanggan terbaikmu.

## Anggaran yang Realistis

**Untuk testing awal:**
- Budget harian: Rp 20.000-50.000/hari
- Durasi: 7-14 hari per test
- Jangan ubah iklan dalam 3-5 hari pertama — biarkan algoritma belajar

**Aturan 3x ROAS:**
Jika harga produk Rp 100.000, target dapat 1 penjualan per Rp 33.000 biaya iklan (ROAS 3x). Jika lebih mahal, optimasi atau hentikan.

## Kreatif Iklan yang Menghasilkan

### Format terbaik untuk UMKM:

**Video 15-30 detik:**
- 3 detik pertama: tunjukkan produk atau masalah
- Teks besar yang terbaca tanpa suara
- CTA yang jelas di akhir

**Foto produk:**
- Background bersih
- Tampilkan produk dari sudut terbaik
- Tambah teks "Harga Rp X" atau promo

### Copywriting iklan:
Hook: [Masalah atau manfaat]
    Body: [Penjelasan singkat + social proof]
    CTA: [WhatsApp/Order sekarang]

## Analisis dan Optimasi

Metrik penting yang harus dipantau:

| Metrik | Arti | Target Baik |
|---|---|---|
| CTR (Click-through rate) | % orang yang klik | > 1% |
| CPC (Cost per click) | Biaya per klik | < Rp 500 |
| CPM (Cost per 1000 impresi) | Biaya tayangan | Rp 5.000-15.000 |
| ROAS | Return on ad spend | > 3x |

**Jika CTR rendah:** Ganti kreatif/visual
**Jika CTR tinggi tapi tidak konversi:** Perbaiki landing page/respons WhatsApp

## Kesalahan Umum UMKM

1. Ganti iklan terlalu cepat sebelum algoritma belajar
2. Targeting terlalu luas atau terlalu sempit
3. Visual iklan sama dengan konten organik — iklan harus lebih langsung
4. Tidak punya sistem follow-up setelah orang masuk ke WhatsApp`,
      },
      {
        slug: 'marketing-copywriting-formula-template',
        title: 'Copywriting yang Menjual: Formula dan 20 Template Terbukti',
        description: 'Kuasai seni menulis kata-kata yang membuat orang ingin membeli — 5 formula copywriting terkuat beserta 20 template yang langsung bisa kamu gunakan untuk produk dan jasa apapun.',
        category: 'Marketing',
        tags: ['copywriting', 'marketing', 'konversi', 'sales', 'template'],
        coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 29000,
        content: `# Copywriting yang Menjual: Formula dan 20 Template

## Apa itu Copywriting?

Copywriting adalah seni menulis kata-kata yang mendorong orang mengambil tindakan — membeli, mendaftar, klik, atau menghubungi.

Perbedaan copywriting dan content writing: copywriting bertujuan **konversi**; content writing bertujuan **edukasi dan engagement**.

## Formula 1: AIDA

**Attention → Interest → Desire → Action**

Template:
[ATTENTION] Apakah kamu masih melakukan ini?
    [INTEREST] Banyak pemilik UMKM kehilangan jutaan rupiah karena...
    [DESIRE] Bayangkan jika setiap konten yang kamu buat langsung menghasilkan penjualan...
    [ACTION] Pelajari sistemnya sekarang →

## Formula 2: PAS (Problem-Agitate-Solve)

**Problem → Agitate → Solve**

Template:
[PROBLEM] Konten kamu bagus, tapi tidak ada yang beli?
    [AGITATE] Padahal kamu sudah habiskan waktu berjam-jam membuat konten...
    posting setiap hari... tapi toko tetap sepi.
    [SOLVE] [Nama Produk] mengajarkan kamu formula konten yang langsung
    menghasilkan penjualan — bahkan untuk akun baru.

## Formula 3: Before-After-Bridge

Template:
BEFORE: Dulu [masalah yang relevan]
    AFTER: Sekarang [hasil yang diinginkan]
    BRIDGE: [Produk/solusi kamu] yang membuat perbedaan ini.

## Formula 4: 4U (Useful, Unique, Ultra-specific, Urgent)

Untuk headline:
- **Useful:** Manfaat yang jelas
- **Unique:** Berbeda dari yang lain
- **Ultra-specific:** Ada angka atau detail spesifik
- **Urgent:** Ada alasan bertindak sekarang

**Contoh headline 4U:**
*"Dapatkan 50 Pelanggan Baru dalam 30 Hari Menggunakan Metode Ini — Hanya untuk 20 Pembeli Pertama"*

## Formula 5: Features-Advantages-Benefits (FAB)

Jangan jual fitur — jual manfaat.

| Fitur | Keunggulan | Manfaat |
|---|---|---|
| "Material premium" | Tahan lama | "Tidak perlu beli baru setiap 3 bulan" |
| "24/7 support" | Selalu ada | "Masalah kamu selesai kapanpun" |

## 20 Template Siap Pakai

### Untuk Caption Instagram/TikTok:

**Template 1:**
[Pertanyaan yang menyentuh masalah]
    Kalau kamu merasa ini, baca sampai habis.
    
    [Poin 1]
    [Poin 2]
    [Poin 3]
    
    Save ini sebelum scroll!

**Template 2 (Testimoni):**
"[Kutipan testimoni pelanggan]" — [Nama, Kota]
    
    Inilah yang membuat [Nama Produk] berbeda...
    [1-2 kalimat keunggulan]
    
    DM "INFO" untuk detail →

**Template 3 (Scarcity):**
⚠️ Tersisa [X] slot/stok lagi
    
    [Benefit utama]
    [Benefit kedua]
    [Harga + CTA]
    
    Setelah penuh, daftar tunggu.

### Untuk WhatsApp Broadcast:

**Template 4:**
Halo [Nama] 👋
    
    Ada kabar baik untuk kamu —
    [Penawaran spesifik]
    
    Berlaku sampai [tanggal].
    [Link/instruksi]
    
    Hubungi kami jika ada pertanyaan.

### Untuk Deskripsi Produk Marketplace:

**Template 5:**
✅ [Manfaat utama 1]
    ✅ [Manfaat utama 2]
    ✅ [Manfaat utama 3]
    
    [Deskripsi produk 2-3 kalimat]
    
    📦 [Info pengiriman]
    ⭐ [Rating/testimoni]
    📞 Chat kami untuk pertanyaan

*(Dan 15 template lainnya untuk email, landing page, iklan Meta, script video, dan more tersedia di dalam dokumen lengkap)*

## Tips Terakhir

Copywriting terbaik terasa seperti **percakapan**, bukan iklan. Bayangkan kamu sedang berbicara dengan satu orang — bukan bicara kepada 1.000 orang sekaligus.

Gunakan bahasa yang sederhana. Kalimat pendek. Paragraf pendek.

Dan selalu ingat: **jual manfaat, bukan fitur.**`,
      },
      {
        slug: 'marketing-email-marketing-1000-subscriber',
        title: 'Email Marketing dari Nol: Bangun 1.000 Subscriber dan Konversi Penjualan',
        description: 'Sistem email marketing yang menghasilkan — dari memilih platform, membuat lead magnet, membangun list, hingga urutan email yang mengkonversi pembaca menjadi pembeli.',
        category: 'Marketing',
        tags: ['email marketing', 'newsletter', 'subscriber', 'lead magnet', 'konversi'],
        coverImage: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 19000,
        content: `# Email Marketing dari Nol: 1.000 Subscriber dan Penjualan

## Mengapa Email Marketing Masih Relevan?

Di tengah hiruk-pikuk media sosial, email adalah aset yang **kamu miliki sepenuhnya**. Algoritma Instagram bisa berubah besok dan jangkauan kamu hilang — tapi list email tetap milikmu.

ROI email marketing: rata-rata $42 untuk setiap $1 yang diinvestasikan (DMA, 2023).

## Langkah 1: Pilih Platform

Untuk pemula di Indonesia:

| Platform | Harga | Kelebihan |
|---|---|---|
| Mailchimp | Gratis s/d 500 kontak | Mudah digunakan |
| MailerLite | Gratis s/d 1.000 kontak | Fitur lengkap, UI bersih |
| Brevo (ex-Sendinblue) | Gratis 300 email/hari | Cocok untuk transaksional |

**Rekomendasi:** MailerLite untuk pemula.

## Langkah 2: Buat Lead Magnet yang Tidak Bisa Ditolak

Lead magnet = hadiah gratis yang kamu berikan sebagai tukar dengan email seseorang.

**Lead magnet terbaik:**
- Checklist (1 halaman, mudah dikonsumsi)
- Template siap pakai
- Mini e-book (5-10 halaman)
- Kuis + hasil analisis personal
- Video tutorial eksklusif

**Kunci lead magnet yang berhasil:** Harus menyelesaikan **satu masalah spesifik** dengan cepat.

## Langkah 3: Halaman Opt-in yang Mengkonversi

Elemen wajib:
1. **Headline yang kuat** — manfaat utama lead magnet
2. **Bullet points** — apa yang akan mereka dapatkan
3. **Form yang simpel** — nama + email saja
4. **Social proof** — "Bergabung dengan 500+ subscriber"
5. **CTA yang jelas** — "Kirim ke Email Saya Sekarang"

## Langkah 4: Urutan Welcome Email (7 Hari)

Hari 1 — Selamat datang + kirim lead magnet
Hari 2 — Ceritakan siapa kamu + 1 tip berguna
Hari 3 — Konten nilai (artikel/tutorial terbaik)
Hari 5 — Tanya pertanyaan untuk engagement
Hari 7 — Pertama kali perkenalkan produk berbayar

## Langkah 5: Cara Dapat 1.000 Subscriber Pertama

**Strategi organik:**
- Pasang opt-in di semua konten media sosial kamu
- Tawarkan lead magnet di bio Instagram/TikTok
- Kolaborasi dengan kreator lain — saling promosi newsletter
- Posting di komunitas relevan (Facebook Group, Telegram)

**Target waktu:**
- 0-100: Dari lingkaran terdekat (2-4 minggu)
- 100-500: Dari konten organik konsisten (1-3 bulan)
- 500-1.000: Kolaborasi + SEO (3-6 bulan)

## Langkah 6: Email yang Menghasilkan Penjualan

Struktur email promosi terbaik:

Subject: [Spesifik, bukan clickbait]
    
    [Sapaan personal]
    
    [1 paragraf cerita/konteks]
    [Transisi ke penawaran]
    [Deskripsi produk 2-3 kalimat]
    [3 bullet manfaat utama]
    [Harga + CTA button]
    
    [PS: tambahkan urgensi atau bonus]

**Rasio konten vs promosi:** 3:1 — 3 email konten, 1 email promosi.

## Metrik yang Harus Dipantau

- **Open rate:** Target > 25%
- **Click rate:** Target > 3%
- **Unsubscribe rate:** < 0,5% per email (jika lebih, konten perlu diperbaiki)`,
      },
    ],
  },
  {
    email: 'keluarga@tweak.id',
    username: 'keluarga.sakinah',
    name: 'Keluarga Sakinah',
    password: 'Creator@2025!',
    bio: 'Membangun keluarga yang sakinah, mawaddah, dan rahmah berdasarkan Al-Quran dan Sunnah. Panduan parenting, komunikasi, dan keuangan keluarga Islam.',
    profilePic: 'https://api.dicebear.com/7.x/shapes/png?seed=keluarga-sakinah&size=256',
    articles: [
      {
        slug: 'keluarga-10-kebiasaan-keluarga-bahagia-quran-sunnah',
        title: '10 Kebiasaan Keluarga Bahagia Berbasis Al-Quran dan Sunnah',
        description: 'Sepuluh amalan sederhana yang terbukti membangun keharmonisan keluarga — dari rutinitas pagi, cara berkomunikasi, hingga kegiatan bersama yang memperkuat ikatan.',
        category: 'Family',
        tags: ['keluarga', 'islami', 'parenting', 'kebahagiaan', 'sunnah'],
        coverImage: 'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# 10 Kebiasaan Keluarga Bahagia Berbasis Al-Quran dan Sunnah

> *"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang."* (QS. Ar-Rum: 21)

## 1. Memulai Hari dengan Dzikir Pagi Bersama

Sebelum aktivitas dimulai, luangkan 10-15 menit untuk membaca dzikir pagi bersama. Ini menjadi "anchor" spiritual yang menyatukan keluarga setiap hari.

**Caranya:** Kumpul di ruang tamu setelah Subuh, baca dzikir pagi dari kitab Al-Adzkar atau Hisnul Muslim.

## 2. Makan Bersama dengan Penuh Kehadiran

Nabi ﷺ menganjurkan makan bersama karena ada keberkahan di dalamnya. Satu aturan penting: **tidak ada gadget di meja makan**.

Gunakan waktu makan untuk bertanya: *"Apa yang paling berkesan hari ini?"*

## 3. Shalat Berjamaah di Rumah

Ayah sebagai imam, istri dan anak bermakmum. Ini bukan hanya ibadah — ini adalah ritual yang memperkuat hirarki keluarga dengan cara yang penuh kasih.

## 4. Membaca Al-Quran 15 Menit Bersama

Setelah Maghrib atau Isya, bacakan Al-Quran bersama atau masing-masing membaca sendiri dalam satu ruangan. Anak-anak yang tumbuh dengan rutinitas ini akan membawa kebiasaan ini seumur hidup.

## 5. Mengucapkan Cinta Secara Eksplisit

Rasulullah ﷺ biasa mengungkapkan cinta kepada keluarganya. Jangan anggap cinta sudah "tersirat" — ucapkan langsung.

Kepada pasangan: *"Aku mencintaimu karena Allah."*
Kepada anak: *"Ayah/Ibu bangga kamu menjadi anakku."*

## 6. Musyawarah Keluarga Mingguan

Setiap minggu, adakan forum kecil untuk membahas rencana, masalah, dan resolusi bersama. Ini mengajarkan anak-anak bahwa suara mereka didengar dan dihargai.

## 7. Satu Hari Tanpa Gadget Setiap Minggu

Pilih satu hari — misalnya Ahad — untuk meletakkan gadget dan fokus pada aktivitas bersama: masak bersama, main di taman, atau kunjungi kakek-nenek.

## 8. Memberi dan Menerima Maaf dengan Cepat

Nabi ﷺ bersabda: *"Tidak halal bagi seorang muslim untuk mendiamkan saudaranya lebih dari tiga hari."* (HR. Bukhari-Muslim)

Dalam keluarga, resolusi konflik harus cepat. Jangan biarkan matahari terbenam di atas kemarahan.

## 9. Doa Keluarga Sebelum Tidur

Bacakan doa untuk pasangan dan anak-anak sebelum mereka tidur. Doa ini menjadi pengingat bahwa semua anggota keluarga saling mendoakan.

## 10. Agenda Keluarga Tahunan

Rencanakan bersama: liburan, umrah/haji, reuni keluarga besar. Memiliki tujuan bersama memperkuat ikatan dan memberikan sesuatu yang dinantikan bersama.

---

Keluarga sakinah bukan yang tanpa masalah — melainkan yang tahu cara menghadapi masalah bersama dengan fondasi iman yang kuat.`,
      },
      {
        slug: 'keluarga-mendidik-anak-cinta-salat-quran',
        title: 'Cara Mendidik Anak Mencintai Salat dan Al-Quran Sejak Dini',
        description: 'Pendekatan praktis dan penuh kasih untuk menanamkan kecintaan anak pada salat dan Al-Quran — bukan karena takut, tapi karena rindu kepada Allah.',
        category: 'Family',
        tags: ['parenting', 'pendidikan anak', 'salat', 'quran', 'islami'],
        coverImage: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# Mendidik Anak Mencintai Salat dan Al-Quran

> *"Perintahkanlah anak-anakmu untuk salat ketika mereka berusia tujuh tahun, dan pukullah mereka jika tidak mau salat ketika mereka berusia sepuluh tahun."* (HR. Abu Dawud)

## Prinsip Dasar: Cinta, Bukan Takut

Banyak orang tua mendidik anak untuk salat dengan ancaman — "kalau tidak salat, masuk neraka." Pendekatan ini mungkin berhasil jangka pendek, tapi sering menciptakan trauma dan resistensi di usia remaja.

Pendekatan yang lebih baik: **tanamkan kerinduan kepada Allah**, bukan ketakutan.

## Usia 0-3 Tahun: Menabur Benih

Pada usia ini, anak menyerap lingkungan lewat indera. Yang perlu dilakukan:

- Sering perdengarkan Al-Quran di rumah
- Ajak ikut salat — biarkan mereka "ikut-ikutan" di atas sajadah
- Ceritakan tentang Allah dengan bahasa yang hangat: "Allah yang buat bintang, Allah yang buat kamu, Allah sangat sayang kamu."

## Usia 4-6 Tahun: Mulai Belajar

- Ajarkan doa-doa pendek: doa makan, tidur, masuk rumah
- Hafal Surah Al-Fatihah dengan cara menyanyikannya
- Buat gerakan salat jadi "permainan" — anak suka meniru
- Bacakan kisah-kisah Nabi dengan cara yang menarik

## Usia 7 Tahun: Mulai Diperintah

Sesuai hadits, usia 7 adalah waktu mulai memerintah (bukan memaksa). Strategi:

- **Salat berjemaah** adalah kunci — ajak ke masjid, rasakan atmosfernya
- **Reward bukan materi** — pujian tulus lebih berharga dari hadiah mainan
- **Jadikan rutinitas harian** — tidak ada pilihan "salat atau tidak", tapi ada pilihan "salat di masjid atau di rumah?"

## Tips Al-Quran yang Efektif

### Metode Tilawah Bersama
Setiap malam setelah Maghrib, 10-15 menit membaca Al-Quran bersama. Anak mendengar, ikut, atau membaca sendiri.

### Kisahkan Isi Al-Quran
Beli buku kisah Al-Quran bergambar. Anak yang mengenal kisah Nabi Musa, Nabi Ibrahim, dan lainnya akan merasa Al-Quran adalah teman, bukan buku asing.

### Hafalan Bertahap
Jangan paksa hafal banyak. Satu ayat per minggu yang benar-benar terasa dan dipahami artinya lebih berharga dari 10 ayat yang dihafal mekanis.

## Yang Harus Dihindari

- Menjadikan salat sebagai hukuman: "Kamu salah, makanya salat 10 rakaat!"
- Membandingkan dengan anak lain: "Anak Bu X sudah hafiz, kamu kapan?"
- Marah berlebihan jika anak belum mau — sabar, proses ini panjang

## Doa yang Tak Pernah Putus

Akhirnya, didikan terbaik orang tua adalah doa. Doa Ibrahim a.s.:

> *"Ya Tuhanku, jadikanlah aku dan anak cucuku orang yang tetap mendirikan salat, ya Tuhan kami, perkenankanlah doaku."* (QS. Ibrahim: 40)`,
      },
      {
        slug: 'keluarga-parenting-islami-era-digital',
        title: 'Parenting Islami di Era Digital: Panduan Praktis untuk Orang Tua',
        description: 'Bagaimana mendidik anak yang tumbuh di tengah smartphone, media sosial, dan konten tanpa batas — dengan nilai-nilai Islam sebagai kompas utama.',
        category: 'Family',
        tags: ['parenting', 'digital', 'islami', 'gadget', 'pendidikan anak'],
        coverImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 25000,
        content: `# Parenting Islami di Era Digital

## Realita yang Harus Dihadapi

Anak-anak kita tumbuh di dunia yang berbeda dari kita dulu. Pada usia 8 tahun, anak rata-rata sudah terpapar internet. Pada usia 13, banyak yang sudah punya smartphone sendiri.

Pilihan kita bukan antara "boleh gadget" atau "tidak boleh gadget" — dunia digital sudah menjadi bagian dari kehidupan. Pilihan kita adalah **bagaimana mendampingi anak menavigasinya dengan nilai Islam**.

## Fondasi: Tanamkan Identitas Islami yang Kuat

Anak yang tahu siapa dirinya tidak mudah goyah oleh pengaruh luar.

Identitas islami yang kuat terbentuk dari:
1. **Mengenal Allah** — bukan takut neraka, tapi cinta kepada Sang Pencipta
2. **Bangga menjadi Muslim** — tunjukkan keindahan Islam, bukan hanya larangan
3. **Memiliki role model yang tepat** — kenalkan kisah sahabat, ulama, dan tokoh muslim positif

## Aturan Gadget yang Realistis

### Untuk anak 0-6 tahun:
- Hindari screen time untuk hiburan (American Academy of Pediatrics)
- Jika terpaksa, pilih konten edukatif dengan dampingan orang tua
- Tidak ada gadget 1 jam sebelum tidur

### Untuk anak 7-12 tahun:
- Maksimal 1-2 jam/hari untuk non-pendidikan
- Gadget di ruang keluarga, bukan kamar
- Orang tua tahu semua aplikasi dan konten yang diakses

### Untuk remaja 13-17 tahun:
- Buat kesepakatan (bukan larangan sepihak)
- Tidak ada smartphone di kamar malam hari
- Diskusikan terbuka tentang bahaya konten negatif

## Literasi Digital Islam

Ajarkan anak prinsip ini:

### Sebelum share konten:
> *"Wahai orang-orang yang beriman, jika datang kepadamu orang fasik membawa berita, maka periksalah dengan teliti."* (QS. Al-Hujurat: 6)

**Terapkan:** Sebelum forward berita/video apapun, tanya: "Apakah ini benar? Dari sumber mana? Apakah bermanfaat dishare?"

### Tentang privasi dan aurat digital:
- Tidak memposting foto diri yang membuka aurat
- Tidak berbagi lokasi rumah di media sosial
- Waspada terhadap stranger online

### Tentang waktu dan distraksi:
- Waktu adalah amanah Allah
- Berapa jam tersita untuk scroll tanpa manfaat?

## Komunikasi Terbuka tentang Konten Berbahaya

Jangan tunggu anak menemukan konten berbahaya baru dibahas. Proaktif:

**Untuk anak 10+ tahun:**
Bicara tentang pornografi, kekerasan online, dan grooming sebelum mereka menemukan sendiri. Gunakan bahasa yang sesuai usia. Tujuannya: agar anak tahu itu buruk DAN merasa aman melapor ke orang tua jika terpapar.

## Membangun Kebiasaan Digital yang Sehat

**Digital Sabbath (Hari Bebas Digital):**
Pilih satu hari (misal Ahad) untuk bebas dari hiburan digital. Isi dengan aktivitas fisik, baca buku, atau kunjungan keluarga.

**Screen-free zones:**
- Meja makan: bebas gadget
- Kamar tidur: bebas gadget setelah pukul 21.00
- Waktu salat: semua gadget diletakkan

## Menjadi Role Model

Anak belajar dari melihat, bukan mendengar.

Jika orang tua scroll Instagram saat anak bicara — anak belajar bahwa gadget lebih penting dari manusia.

Jika orang tua meletakkan gadget saat anak datang — anak belajar bahwa manusia lebih berharga dari layar.

**Pertanyaan refleksi:** Berapa jam hari ini kamu menatap layar di depan anak? Berapa jam kamu menatap mata anakmu?`,
      },
      {
        slug: 'keluarga-financial-planning-keluarga-muda-muslim',
        title: 'Financial Planning Keluarga Muda Muslim: Dari Mahar hingga Dana Pendidikan Anak',
        description: 'Panduan keuangan komprehensif untuk pasangan muda muslim — merencanakan mahar, biaya pernikahan, rumah pertama, dana darurat, hingga tabungan pendidikan anak yang halal.',
        category: 'Family',
        tags: ['keuangan keluarga', 'perencanaan keuangan', 'pernikahan', 'rumah', 'pendidikan anak'],
        coverImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 29000,
        content: `# Financial Planning Keluarga Muda Muslim

## Prinsip Keuangan dalam Islam

Islam memandang harta sebagai amanah, bukan milik mutlak. Pengelolaan yang baik adalah bentuk syukur dan tanggung jawab.

> *"Dan orang-orang yang apabila membelanjakan (harta), mereka tidak berlebihan, dan tidak (pula) kikir, dan adalah (pembelanjaan itu) di tengah-tengah antara yang demikian."* (QS. Al-Furqan: 67)

## Fase 1: Sebelum Menikah (Persiapan Mahar dan Biaya Nikah)

### Mahar
Mahar adalah hak penuh istri. Syariat tidak menetapkan jumlah minimum atau maksimum.

**Prinsip mahar yang bijak:**
- Sesuai kemampuan suami — tidak perlu berhutang untuk mahar
- Musyawarah dengan calon istri
- Nabi ﷺ bersabda: *"Sebaik-baik mahar adalah yang paling mudah (tidak memberatkan)."* (HR. Hakim)

**Hindari:** Berhutang dengan riba untuk mahar atau biaya pernikahan. Ini memulai pernikahan dengan dosa.

### Biaya Pernikahan
Alokasikan dari tabungan sendiri, bukan pinjaman. Jika belum cukup, sederhanakan acaranya — keberkahan tidak ditentukan kemewahan.

## Fase 2: Tahun Pertama Pernikahan

### Prioritas keuangan:
1. Dana darurat bersama: 3-6 bulan pengeluaran
2. Zakat penghasilan: langsung sisihkan setiap bulan
3. Tabungan bersama: rekening bersama untuk tujuan bersama

### Diskusi keuangan yang wajib dilakukan:
- Siapa yang kelola keuangan?
- Berapa "jatah" masing-masing untuk pengeluaran pribadi?
- Apa tujuan keuangan 1, 3, dan 5 tahun ke depan?

## Fase 3: Merencanakan Rumah Pertama

### KPR Syariah vs KPR Konvensional
KPR konvensional mengandung bunga = riba. Pilih KPR Syariah dengan akad murabahah atau musyarakah mutanaqishah.

**Catatan penting:** Baca akad KPR syariah dengan teliti. Pastikan akad benarbenar berbeda dari konvensional, bukan hanya label.

### Alternatif tanpa KPR:
- Beli tanah dulu, bangun bertahap
- Sewa sambil menabung — tanpa beban cicilan
- Beli rumah bekas yang lebih terjangkau secara tunai

## Fase 4: Setelah Memiliki Anak

### Dana Pendidikan Anak
Biaya pendidikan naik rata-rata 10-15% per tahun. Mulai menabung sejak anak lahir.

**Instrumen halal untuk dana pendidikan:**
- Emas batangan — simpan nilai, tidak tergerus inflasi
- Tabungan berjangka di bank syariah (akad wadi'ah/mudharabah)
- Reksa dana syariah — jika memahami risikonya

**Perhitungan sederhana:**
Jika anak berusia 0 dan kuliah di usia 18, dengan biaya kuliah saat ini Rp 50 juta dan inflasi 10%/tahun:

Biaya kuliah 18 tahun lagi = Rp 50 juta × (1,10)^18 ≈ **Rp 278 juta**

Artinya perlu menabung ≈ Rp 650.000/bulan mulai sekarang (dengan asumsi simpanan mendapat return 6%/tahun).

### Asuransi Jiwa
Sebagai suami/ayah, kamu adalah tulang punggung keluarga. Asuransi jiwa melindungi keluarga jika terjadi hal yang tidak diinginkan.

**Pilih:** Asuransi jiwa syariah (takaful) dengan akad yang jelas, hindari unit link.

## Sistem Keuangan Bulanan yang Praktis

**Formula 40-30-20-10:**
- 40% Kebutuhan pokok
- 30% Cicilan/hutang (targetkan nol)
- 20% Tabungan & investasi
- 10% Zakat, sedekah, infak

**Tools sederhana:** Catatan di WhatsApp keluarga atau spreadsheet Google Sheets bersama.

## Persiapan Haji/Umrah

Daftarkan diri ke antrian haji reguler (waiting list 20-40 tahun) atau rencanakan umrah sebagai milestone keluarga muda.

> *"Bersegeralah berhaji (dalam artian mendaftarkan diri), sebab salah seorang di antara kalian tidak mengetahui apa yang akan menghalanginya."* (HR. Ahmad)`,
      },
      {
        slug: 'keluarga-komunikasi-suami-istri-harmonis-sunnah',
        title: 'Komunikasi Suami Istri yang Harmonis: Panduan Berbasis Sunnah',
        description: 'Cara berkomunikasi efektif dengan pasangan yang menggabungkan hikmah psikologi modern dengan adab Islam — mengatasi konflik, mengungkapkan kebutuhan, dan membangun kedekatan.',
        category: 'Family',
        tags: ['komunikasi', 'pernikahan', 'suami istri', 'harmonis', 'sunnah'],
        coverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 15000,
        content: `# Komunikasi Suami Istri yang Harmonis

## Teladan Agung: Rasulullah ﷺ dan Keluarganya

Sebelum membahas teknik komunikasi, mari lihat teladan terbaik. Aisyah r.a. berkata: *"Rasulullah ﷺ adalah manusia yang paling baik akhlaknya bersama keluarganya."*

Nabi ﷺ:
- Membantu pekerjaan rumah tangga
- Makan bersama keluarga
- Mendengarkan istri-istrinya dengan penuh perhatian
- Berguyon dengan keluarga
- Mengucapkan cinta secara langsung

Ini adalah standar komunikasi yang kita tuju.

## Prinsip 1: Mendengar untuk Memahami, Bukan untuk Menjawab

Kesalahan terbesar dalam komunikasi pasangan: mendengar sambil menyiapkan argumen balasan.

**Teknik mendengar aktif:**
1. Letakkan gadget, tatap mata pasangan
2. Anggukkan kepala, beri tanda kamu memperhatikan
3. Ulangi inti yang dikatakan: *"Jadi maksudnya kamu merasa..."*
4. Tanya untuk memperdalam, bukan untuk mempertahankan diri

## Prinsip 2: Bicara tentang Perasaan, Bukan Serangan

Formula komunikasi non-konfrontatif:

**Jangan:** *"Kamu selalu pulang malam dan tidak peduli keluarga!"*

**Tapi:** *"Aku merasa kesepian dan khawatir kalau kamu pulang larut. Aku butuh waktu bersama yang lebih konsisten."*

Perbedaannya: yang pertama menyerang, yang kedua mengungkapkan kebutuhan.

## Prinsip 3: Waktu dan Tempat yang Tepat

Nabi ﷺ tidak pernah mendiskusikan masalah berat saat kelelahan atau marah.

**Hindari diskusi penting saat:**
- Salah satu atau keduanya lelah/lapar
- Anak-anak ada di sekitar
- Dalam keadaan emosi tinggi
- Sebelum tidur malam

**Waktu terbaik:** Setelah Subuh atau malam hari yang tenang, saat keduanya segar dan fokus.

## Mengatasi Konflik dengan Bijak

### Langkah 1: Cooling down
Jika suasana memanas, setujui untuk berhenti sebentar. *"Aku butuh 20 menit untuk tenang dulu."* Ini bukan menghindar — ini mencegah kata-kata yang akan disesali.

### Langkah 2: Fokus pada masalah, bukan karakter
**Serangan karakter:** *"Kamu memang egois."*
**Fokus masalah:** *"Keputusan ini tidak mempertimbangkan pendapatku."*

### Langkah 3: Cari solusi bersama
Duduk sebagai tim, bukan lawan. *"Kita mau seperti apa ke depannya?"*

### Langkah 4: Maaf yang tulus
Minta maaf bukan tanda kelemahan. Nabi ﷺ bersabda: *"Tidaklah seseorang merendahkan diri karena Allah melainkan Allah akan meninggikannya."* (HR. Muslim)

## Membangun Kedekatan Emosional

**Quality time reguler:**
Sisihkan minimal 30 menit per hari hanya berdua — tanpa gadget, tanpa anak. Bicara tentang hari, impian, dan perasaan.

**Ritual kecil yang berarti:**
- Pamit dan cium tangan/pipi setiap hari
- Tanya kabar dengan sungguh-sungguh saat bertemu
- Kirim pesan penyemangat di siang hari

**Doa untuk pasangan:**
Doakan pasangan setiap hari — dan beritahu bahwa kamu mendoakannya. *"Aku mendoakanmu setiap selesai salat."*

## Perbedaan yang Bukan Masalah

Suami dan istri adalah dua pribadi berbeda. Beberapa perbedaan tidak perlu diselesaikan — perlu diterima.

> *"Bergaullah dengan mereka secara patut. Kemudian bila kamu tidak menyukai mereka, (maka bersabarlah) karena mungkin kamu tidak menyukai sesuatu, padahal Allah menjadikan padanya kebaikan yang banyak."* (QS. An-Nisa: 19)

Terima pasangan apa adanya, sembari saling mengingatkan untuk menjadi lebih baik.`,
      },
    ],
  },
]

async function seedCreator(creator: typeof CREATORS[number]) {
  const hash = await bcrypt.hash(creator.password, 10)
  const user = await db.user.upsert({
    where: { email: creator.email },
    update: { name: creator.name, bio: creator.bio, profilePic: creator.profilePic },
    create: {
      email: creator.email,
      username: creator.username,
      name: creator.name,
      passwordHash: hash,
      bio: creator.bio,
      profilePic: creator.profilePic,
      role: 'user',
      verified: true,
    },
  })
  console.log(`👤 ${creator.name} (@${creator.username})`)

  for (const art of creator.articles) {
    await db.post.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        slug: art.slug,
        title: art.title,
        description: art.description,
        type: 'markdown',
        content: art.content,
        category: art.category,
        tags: art.tags,
        coverImage: art.coverImage,
        isPremium: art.isPremium,
        price: art.price ?? null,
        published: true,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        viewCount: Math.floor(Math.random() * 1200) + 80,
        likeCount: Math.floor(Math.random() * 120) + 5,
        authorId: user.id,
      },
    })
    const badge = art.isPremium ? `💰 Rp ${art.price!.toLocaleString('id-ID')}` : '🆓 Gratis'
    console.log(`   ${badge} — ${art.title}`)
  }
}

async function main() {
  console.log('━━━ Seeding creators (batch 2/3) ━━━')
  for (const creator of CREATORS) await seedCreator(creator)
  console.log('\n✅ Batch 2 selesai. Jalankan seed-creators-3.ts untuk batch terakhir.')
}

main().catch(console.error).finally(() => db.$disconnect())

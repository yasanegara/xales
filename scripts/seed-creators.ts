import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const CREATORS = [
  {
    email: 'hustle@tweak.id',
    username: 'hustle.halal',
    name: 'Hustle Halal',
    password: 'Creator@2025!',
    bio: 'Berbagi strategi bisnis sampingan dan side hustle yang halal & berkah. Dari freelance hingga usaha rumahan.',
    profilePic: 'https://api.dicebear.com/7.x/shapes/png?seed=hustle-halal&size=256',
    articles: [
      {
        slug: 'hustle-5-side-hustle-halal-modal-nol',
        title: '5 Side Hustle Halal Modal Nol yang Bisa Dimulai Hari Ini',
        description: 'Tidak punya modal bukan alasan untuk tidak memulai. Berikut 5 bisnis sampingan halal yang bisa kamu mulai hari ini dengan modal nol rupiah.',
        category: 'Side Hustle',
        tags: ['side hustle', 'halal', 'bisnis', 'modal nol', 'freelance'],
        coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# 5 Side Hustle Halal Modal Nol yang Bisa Dimulai Hari Ini

Banyak orang berpikir memulai bisnis butuh modal besar. Padahal, di era digital ini, ada banyak peluang yang bisa kamu mulai tanpa mengeluarkan sepeser pun.

## 1. Jasa Penulisan Konten

Kalau kamu bisa menulis, kamu sudah punya modal. Platform seperti Fiverr, Projects.co.id, dan Fastwork selalu butuh penulis artikel, copywriter, dan content writer.

**Cara mulai:**
- Buat profil di Projects.co.id
- Upload 2-3 contoh tulisan sebagai portofolio
- Tawarkan harga kompetitif untuk 3 klien pertama

**Potensi penghasilan:** Rp 50.000–200.000 per artikel

## 2. Reseller Produk Muslim

Jadilah reseller produk busana muslim, makanan halal, atau produk perawatan halal. Banyak supplier yang membuka program reseller tanpa stok.

**Platform terbaik:** Tokopedia, Shopee, Instagram, WhatsApp

**Tips:** Pilih niche yang kamu kuasai — misalnya produk ibu menyusui halal, atau buku-buku Islam.

## 3. Jasa Desain Grafis Sederhana

Dengan Canva gratis, kamu bisa membuat desain untuk UMKM lokal. Banyak pemilik toko kecil yang butuh banner, logo sederhana, atau konten media sosial.

**Tools gratis:** Canva, Adobe Express

## 4. Les Privat Online

Kuasai satu bidang? Ajarkan ke orang lain. Dari pelajaran sekolah, mengaji, bahasa Arab, hingga skill digital — semua bisa dijual lewat Ruangguru, Superprof, atau langsung via WhatsApp.

## 5. Dropship Buku Islam

Hubungi penerbit buku Islam seperti Gema Insani, Al-Kautsar, atau Pustaka Ibnu Katsir. Banyak yang menerima mitra dropship. Kamu hanya perlu promosi, mereka yang kirim.

---

## Kunci Sukses Side Hustle Halal

> "Sebaik-baik pekerjaan adalah pekerjaan seseorang dengan tangannya sendiri, dan setiap jual beli yang mabrur." (HR. Ahmad)

1. **Niat yang benar** — rezeki adalah dari Allah, usaha adalah ikhtiar
2. **Konsisten 30 menit per hari** — lebih baik rutin dari pada sesekali besar
3. **Jaga kepercayaan klien** — amanah adalah modal utama

Mulai dari yang terkecil, lakukan dengan itqan (terbaik), dan biarkan Allah yang meluaskan rezekimu.`,
      },
      {
        slug: 'hustle-jualan-produk-handmade-marketplace',
        title: 'Cara Sukses Jualan Produk Handmade di Marketplace Indonesia',
        description: 'Panduan praktis membuka toko produk handmade di Tokopedia dan Shopee — dari foto produk, deskripsi, hingga strategi promosi organik.',
        category: 'Side Hustle',
        tags: ['handmade', 'marketplace', 'tokopedia', 'shopee', 'jualan online'],
        coverImage: 'https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# Cara Sukses Jualan Produk Handmade di Marketplace Indonesia

Produk handmade memiliki nilai jual yang unik — setiap barang punya cerita dan sentuhan personal. Di Indonesia, permintaan produk handmade terus tumbuh, terutama untuk hadiah, dekorasi rumah, dan fashion muslim.

## Memilih Platform yang Tepat

### Tokopedia
- Cocok untuk produk dengan margin tinggi
- Fitur TopAds efektif untuk produk visual
- Rating toko sangat berpengaruh

### Shopee
- Lebih banyak pembeli muda
- Program gratis ongkir sangat membantu konversi
- Flash sale dan voucher sangat efektif

## Foto Produk yang Menjual

Foto adalah senjata utama di marketplace. Beberapa tips:

1. **Gunakan cahaya alami** — dekat jendela pagi hari
2. **Background putih atau kayu** — clean dan profesional
3. **Minimal 5 foto** — tampak depan, samping, detail, pemakaian, dan ukuran
4. **Edit dengan Lightroom Mobile** (gratis) — tambah kecerahan dan kontras

## Deskripsi yang Mengkonversi

Struktur deskripsi terbaik:
- **Baris pertama:** manfaat utama produk
- **Material/bahan** yang digunakan
- **Ukuran/dimensi** lengkap
- **Cara perawatan**
- **Info pengiriman**

## Strategi Promosi Organik

- **Bagikan ke grup WhatsApp** — mulai dari lingkaran terdekat
- **Konten behind-the-scenes** di Instagram/TikTok — proses pembuatan selalu menarik
- **Gabung komunitas** pembeli/penjual handmade di Facebook

## Penetapan Harga yang Benar

Rumus dasar: **Harga = (Biaya Bahan × 3) + Biaya Tenaga + Biaya Kemasan + Keuntungan**

Jangan jual terlalu murah — produk handmade punya nilai lebih dari produk massal.`,
      },
      {
        slug: 'hustle-blueprint-dropship-produk-muslim',
        title: 'Blueprint Dropship Produk Muslim: Panduan Lengkap dari Nol ke Profit',
        description: 'Sistem lengkap membangun bisnis dropship produk muslim — mencari supplier, membuat toko, strategi konten, hingga scale up. Sudah dibuktikan oleh ratusan reseller.',
        category: 'Side Hustle',
        tags: ['dropship', 'bisnis muslim', 'reseller', 'ecommerce', 'halal'],
        coverImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 29000,
        content: `# Blueprint Dropship Produk Muslim: Panduan Lengkap

## Mengapa Dropship Produk Muslim?

Pasar produk muslim di Indonesia terus tumbuh. Busana muslim, buku Islam, peralatan ibadah, makanan halal — semua memiliki demand yang stabil dan pembeli yang loyal.

Keunggulan dropship:
- Tanpa stok barang
- Modal sangat kecil (hanya biaya promosi)
- Bisa dijalankan dari rumah
- Skalabel

## Fase 1: Riset dan Validasi Niche

Sebelum jualan, validasi dulu apakah niche yang kamu pilih memiliki demand.

### Tools riset gratis:
- **Google Trends** — cek tren pencarian
- **Tokopedia Search** — lihat produk terlaris
- **Shopee** — lihat review dan rating

### Niche dropship produk muslim yang terbukti:
1. Busana muslim wanita (abaya, gamis, hijab)
2. Perlengkapan salat (sajadah, tasbih, mukena)
3. Buku dan kitab Islam
4. Parfum non-alkohol
5. Snack dan makanan halal premium
6. Produk perawatan halal (skincare, haircare)

## Fase 2: Menemukan Supplier Amanah

Supplier adalah kunci bisnis dropship. Kriteria supplier yang baik:

- **Pengiriman cepat** (1-2 hari setelah order)
- **Produk sesuai foto** — tidak menipu
- **Responsif** di WhatsApp
- **Menerima retur** untuk produk cacat

### Cara menemukan supplier:
1. Group Facebook "Supplier Dropship [niche]"
2. Marketplace — hubungi toko dengan rating tinggi
3. Pameran produk muslim (biasanya ada di kota besar)
4. Langsung ke produsen lokal

## Fase 3: Membuat Toko yang Terpercaya

### Di Shopee/Tokopedia:
- Nama toko yang mencerminkan nilai (mis: "Cahaya Muslimah")
- Foto profil toko yang bersih
- Deskripsi toko yang menjelaskan siapa kamu
- Minimal 10 produk sebelum promosi

### Di WhatsApp/Instagram:
- Gunakan WhatsApp Business (gratis)
- Bio yang jelas: apa yang kamu jual, area pengiriman, cara order

## Fase 4: Konten dan Promosi

Konten yang berperforma untuk produk muslim:

**Format terbaik di TikTok/Reels:**
- Unboxing produk
- Tutorial pemakaian (hijab style, dll)
- Review jujur produk
- Konten edukatif tentang kehalalan produk

**Caption yang mengkonversi:**
- Awali dengan manfaat
- Sertakan bukti (testimoni, rating)
- CTA yang jelas: "DM untuk order"

## Fase 5: Sistem dan Skalasi

Setelah 10 transaksi pertama:

1. **Buat template pesan** untuk order, konfirmasi, dan komplain
2. **Catat semua transaksi** di spreadsheet sederhana
3. **Reinvest keuntungan** untuk iklan berbayar
4. **Tambah supplier** untuk diversifikasi produk

### Target milestone:
- Bulan 1: 10 transaksi pertama
- Bulan 3: 50 transaksi/bulan, profit Rp 1-2 juta
- Bulan 6: 150+ transaksi/bulan, profit Rp 5 juta+

## Aspek Syariah yang Harus Dijaga

1. **Jujur tentang kondisi produk** — tidak melebih-lebihkan
2. **Tepat waktu pengiriman** — jangan janjikan sesuatu yang tidak bisa ditepati
3. **Retur yang adil** — kalau produk cacat, tanggung jawab
4. **Hindari produk syubhat** — pastikan kehalalan setiap produk

> "Pedagang yang jujur dan amanah akan bersama para nabi, shiddiqin, dan syuhada." (HR. Tirmidzi)`,
      },
      {
        slug: 'hustle-passive-income-halal-7-model',
        title: 'Sistem Passive Income Halal: 7 Model Bisnis yang Terbukti',
        description: 'Tujuh model passive income yang sesuai syariat Islam — dari konten digital, properti produktif, hingga kemitraan usaha. Lengkap dengan cara memulai dan estimasi hasilnya.',
        category: 'Side Hustle',
        tags: ['passive income', 'halal', 'investasi', 'bisnis', 'keuangan'],
        coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 25000,
        content: `# Sistem Passive Income Halal: 7 Model yang Terbukti

## Apa itu Passive Income yang Halal?

Passive income halal adalah penghasilan yang mengalir meski kamu tidak bekerja aktif, **tanpa mengandung unsur riba, gharar (ketidakpastian berlebih), atau maisir (judi)**.

Landasan fiqhnya: kepemilikan aset yang memberikan manfaat atau kemitraan usaha yang sah.

---

## Model 1: Konten Digital Berbayar

Tulis sekali, dijual berkali-kali. Artikel premium, e-book, template, dan tools digital adalah passive income terbaik untuk era sekarang.

**Cara kerja:** Upload di platform seperti Tweak, Gumroad, atau website sendiri. Setiap pembelian masuk otomatis.

**Modal awal:** Waktu dan ilmu
**Potensi:** Rp 500.000–10 juta/bulan

---

## Model 2: Afiliasi Produk Halal

Rekomendasikan produk halal orang lain, dapatkan komisi. Tidak perlu stok, tidak perlu modal.

**Platform:** Tokopedia Affiliate, Shopee Affiliate, Booksyariah Affiliate

**Tips:** Buat konten review jujur — kepercayaan audiens adalah aset terbesar.

---

## Model 3: Kos-kosan atau Kontrakan

Properti sewaan adalah passive income tertua dan paling dikenal. Akad sewa (ijarah) jelas halal dalam Islam.

**Perhitungan sederhana:**
- Rumah Rp 300 juta disewakan Rp 2 juta/bulan = yield 8% per tahun
- Kos 5 kamar @ Rp 800.000/bulan = Rp 4 juta/bulan

---

## Model 4: Mudharabah (Bagi Hasil Bisnis)

Kamu sebagai shahibul maal (pemilik modal), mitra kamu sebagai mudharib (pengelola bisnis). Keuntungan dibagi sesuai kesepakatan.

**Contoh:** Titipkan modal ke UMKM terpercaya dengan akad bagi hasil 60:40. Tidak ada bunga — murni berbagi untung dan rugi.

**Kunci:** Pilih mudharib yang amanah dan bisnis yang jelas.

---

## Model 5: Wakaf Produktif

Wakafkan aset, hasilnya untuk kamu gunakan (wakaf manfaat) atau untuk amal sambil kamu tetap dapat manfaat ekonomi. Model ini berkembang di Indonesia lewat platform wakaf produktif.

---

## Model 6: Emas sebagai Simpan Nilai

Emas bukan spekulasi — ia adalah penyimpan nilai yang diakui syariat. Beli dan simpan, jual saat butuh atau harga naik.

**Cara terbaik:** Emas fisik batangan (Antam/UBS), bukan emas kertas atau kontrak berjangka.

---

## Model 7: Lisensi Karya Intelektual

Lagu nasyid, buku, kursus, atau software yang kamu buat bisa dilisensikan ke pihak lain. Setiap penggunaan = royalti masuk.

---

## Roadmap Membangun Passive Income

**Tahun 1:** Fokus satu model, bangun sistem
**Tahun 2-3:** Diversifikasi ke 2-3 model
**Tahun 5+:** Arus kas dari multiple sumber

> "Harta terbaik adalah harta orang salih yang menggunakannya untuk dirinya, keluarganya, dan amal di jalan Allah." (HR. Ahmad, sahih)`,
      },
      {
        slug: 'hustle-freelance-digital-pemula',
        title: 'Freelance Digital untuk Pemula: Dari Platform hingga Klien Pertama',
        description: 'Panduan step-by-step memulai karier freelance digital — memilih skill, membuat profil menarik, memenangkan proyek pertama, dan membangun reputasi yang solid.',
        category: 'Side Hustle',
        tags: ['freelance', 'digital', 'pemula', 'klien', 'karier'],
        coverImage: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 19000,
        content: `# Freelance Digital untuk Pemula

## Kenapa Freelance Digital?

Fleksibel, halal, dan skalabel. Kamu bekerja dengan ilmu dan keterampilan — tidak ada unsur yang dilarang syariat. Hasilnya pun langsung proporsional dengan kualitas kerja kamu.

## Langkah 1: Pilih Skill yang Tepat

Skill freelance yang paling dibutuhkan saat ini:

| Skill | Demand | Waktu Belajar |
|---|---|---|
| Penulisan konten/copywriting | Sangat tinggi | 1-2 bulan |
| Desain grafis (Canva/Figma) | Tinggi | 2-3 bulan |
| Video editing | Sangat tinggi | 2-4 bulan |
| Social media management | Tinggi | 1 bulan |
| Terjemahan (Inggris-Indonesia) | Sedang | Langsung |
| Data entry/admin virtual | Sedang | 1 minggu |

**Rekomendasi untuk pemula:** Mulai dari skill yang paling dekat dengan kemampuan kamu sekarang.

## Langkah 2: Buat Profil yang Meyakinkan

### Di Projects.co.id (lokal terbaik):
- Foto profil profesional (bukan selfie)
- Headline yang spesifik: "Copywriter untuk Brand Muslim & UMKM"
- Deskripsi yang fokus pada manfaat untuk klien
- Portofolio minimal 3 contoh kerja (boleh fiktif untuk awal)

### Di Fiverr (internasional):
- Judul gig yang mengandung keyword
- Harga mulai dari $5-10 untuk bangun review
- Response rate tinggi = ranking lebih baik

## Langkah 3: Memenangkan Proyek Pertama

**Strategi 3F: Family, Friends, Followers**
1. Tawarkan ke keluarga dan teman yang punya bisnis
2. Post di grup WhatsApp alumni/komunitas
3. Tawarkan harga perkenalan yang lebih rendah

**Proposal yang menang:**
- Tunjukkan kamu sudah baca brief dengan baik
- Tawarkan solusi spesifik, bukan deskripsi skill umum
- Sertakan satu contoh relevan

## Langkah 4: Dari Klien Pertama ke Recurring Client

Klien pertama adalah investasi jangka panjang. Layani dengan:
- **Over-deliver** — berikan lebih dari yang diminta
- **Komunikasi proaktif** — update progress tanpa diminta
- **Tepat waktu** — deadline adalah amanah

Setelah selesai: minta testimoni dan tanya apakah ada proyek lanjutan.

## Langkah 5: Menaikkan Rate

Setelah 10 proyek dan punya portofolio, naikan rate 20-30%. Klien yang bagus tidak akan keberatan membayar lebih untuk kualitas yang terbukti.

**Benchmark rate freelance Indonesia:**
- Pemula: Rp 50.000-150.000/jam
- Menengah: Rp 150.000-400.000/jam
- Senior: Rp 400.000-1.000.000+/jam`,
      },
    ],
  },
  {
    email: 'fiqh@tweak.id',
    username: 'fiqh.muamalah',
    name: 'Fiqh Muamalah',
    password: 'Creator@2025!',
    bio: 'Kajian fiqh muamalah kontemporer. Membahas hukum transaksi modern, keuangan Islam, dan ekonomi syariah berdasarkan dalil yang sahih.',
    profilePic: 'https://api.dicebear.com/7.x/shapes/png?seed=fiqh-muamalah&size=256',
    articles: [
      {
        slug: 'fiqh-hukum-dompet-digital-paylater',
        title: 'Hukum Dompet Digital dan Paylater: Fatwa dan Penjelasannya',
        description: 'Apakah GoPay, OVO, Dana, dan fitur paylater seperti Shopee Paylater halal? Pembahasan berdasarkan dalil Al-Quran, hadits, dan pendapat ulama kontemporer.',
        category: 'Fiqh',
        tags: ['fiqh', 'muamalah', 'dompet digital', 'paylater', 'halal haram'],
        coverImage: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# Hukum Dompet Digital dan Paylater dalam Islam

## Pendahuluan

Perkembangan teknologi keuangan (fintech) menghadirkan pertanyaan-pertanyaan baru dalam fiqh muamalah. Dua yang paling sering ditanyakan: dompet digital (e-wallet) dan fitur paylater.

## Hukum Dompet Digital (E-Wallet)

### Apa itu dompet digital?

E-wallet seperti GoPay, OVO, Dana, dan LinkAja pada dasarnya adalah **titipan uang** (wadi'ah) yang disimpan di server perusahaan fintech. Kamu menitipkan uang, perusahaan menyimpannya, dan kamu dapat akses sewaktu-waktu.

### Analisis fiqh:

**Akad yang berlaku:** Wadi'ah yad dhomanah — titipan dengan jaminan. Perusahaan menjamin keamanan uang dan bertanggung jawab jika hilang.

**Hukum dasar:** **Boleh (mubah)**, karena:
1. Akadnya jelas — titipan
2. Tidak ada unsur riba
3. Manfaatnya nyata — kemudahan transaksi

**Yang perlu diwaspadai:**
- Bunga/cashback dari dana yang mengendap — jika berasal dari investasi ribawi, ini haram
- Cashback yang dijanjikan di awal sebagai syarat transaksi bisa masuk kategori riba

### Kesimpulan e-wallet:
Penggunaan dasar untuk transaksi: **HALAL**. Namun, perhatikan asal cashback dan bunga yang diberikan.

---

## Hukum Paylater

Paylater (Shopee Paylater, GoPay Later, Kredivo, dll) adalah fasilitas **hutang dengan bunga** yang dibayar belakangan.

### Analisis fiqh:

Paylater adalah qardh (pinjaman) yang disertai bunga/fee. Ini adalah struktur yang **sama dengan riba nasi'ah** yang dilarang Al-Quran:

> *"Allah menghalalkan jual beli dan mengharamkan riba."* (QS. Al-Baqarah: 275)

Adapun dalil yang lebih tegas: Rasulullah ﷺ melaknat pemakan riba, pemberi riba, penulisnya, dan dua saksinya. (HR. Muslim)

### Catatan tentang "paylater syariah":

Beberapa platform mengklaim produk paylater syariah dengan akad murabahah. Dalam murabahah yang sah: barang harus dimiliki dulu oleh penjual sebelum dijual. Jika perusahaan tidak benar-benar memiliki barang tersebut, akadnya tidak sah.

**Rekomendasi:** Hindari paylater kecuali sudah ada sertifikasi DSN-MUI yang valid dan akad murabahahnya benar-benar diterapkan.

---

## Kesimpulan Praktis

| Produk | Hukum | Catatan |
|---|---|---|
| E-wallet (GoPay, OVO, Dana) | Halal | Perhatikan asal cashback |
| Paylater berbunga | Haram | Mengandung riba |
| Paylater murabahah bersertifikat | Khilaf | Perlu verifikasi akad |

Wallahu a'lam bish-shawab.`,
      },
      {
        slug: 'fiqh-zakat-penghasilan-karyawan-freelancer',
        title: 'Panduan Zakat Penghasilan untuk Karyawan dan Freelancer',
        description: 'Cara menghitung zakat penghasilan yang benar — nisab, haul, dan cara penyalurannya. Dilengkapi kalkulator sederhana dan contoh perhitungan nyata.',
        category: 'Fiqh',
        tags: ['zakat', 'penghasilan', 'fiqh', 'karyawan', 'freelancer'],
        coverImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=630&fit=crop&q=80',
        isPremium: false,
        price: null,
        content: `# Panduan Zakat Penghasilan untuk Karyawan dan Freelancer

## Dasar Hukum Zakat Penghasilan

Zakat penghasilan (zakat profesi) adalah zakat yang dikeluarkan dari hasil bekerja. Landasan hukumnya:

> *"Wahai orang-orang yang beriman, infakkanlah (zakat) sebagian dari hasil usahamu yang baik-baik."* (QS. Al-Baqarah: 267)

Mayoritas ulama kontemporer, termasuk Yusuf al-Qaradawi dalam *Fiqh az-Zakat*, mewajibkan zakat penghasilan bagi yang telah mencapai nisab.

## Nisab Zakat Penghasilan

Nisab zakat penghasilan setara dengan **85 gram emas murni** per tahun, atau dikonversi ke penghasilan bulanan:

**Formula:**
Nisab bulanan = (harga emas/gram × 85) ÷ 12

**Contoh perhitungan (harga emas Rp 1.000.000/gram):**
Nisab = (1.000.000 × 85) ÷ 12 = Rp 7.083.333/bulan

Jika penghasilan ≥ Rp 7,08 juta/bulan → **wajib zakat**

## Ada Dua Pendapat tentang Haul

### Pendapat 1: Haul per Bulan
Zakat langsung dikeluarkan setiap bulan saat menerima gaji. Kadar: **2,5%**.

**Contoh:** Gaji Rp 10 juta → Zakat = Rp 10 juta × 2,5% = **Rp 250.000/bulan**

### Pendapat 2: Haul per Tahun (Akumulasi)
Penghasilan dikumpulkan setahun, zakat dikeluarkan setahun sekali jika total mencapai nisab.

**Pilihan:** Pendapat pertama lebih mudah dan lebih aman secara fiqh.

## Perhitungan untuk Freelancer

Freelancer penghasilannya tidak tetap. Cara mudah:

1. Hitung rata-rata penghasilan 3 bulan terakhir
2. Jika rata-rata ≥ nisab → zakat dari setiap penerimaan
3. Keluarkan 2,5% dari setiap payment yang diterima

**Contoh:**
- Proyek A: Rp 3 juta → Zakat Rp 75.000
- Proyek B: Rp 8 juta → Zakat Rp 200.000
- Total bulan ini → Zakat Rp 275.000

## Ke Mana Menyalurkan Zakat?

**Prioritas utama:** Fakir dan miskin di sekitar kamu
**Lembaga resmi:** BAZNAS, Dompet Dhuafa, LAZ terpercaya lainnya

**Tips:** Sisihkan zakat segera saat menerima gaji, jangan tunggu akhir bulan.

> *"Ambillah zakat dari harta mereka, guna membersihkan dan menyucikan mereka."* (QS. At-Taubah: 103)`,
      },
      {
        slug: 'fiqh-investasi-islami-mudharabah-musyarakah-emas',
        title: 'Investasi Islami: Mudharabah, Musyarakah, dan Emas Berdasarkan An-Nizham al-Iqtisadi',
        description: 'Panduan investasi yang benar-benar halal berdasarkan kitab An-Nizham al-Iqtisadi fil Islam karya Taqiyyuddin an-Nabhani — tanpa saham, obligasi, atau sukuk negara.',
        category: 'Finance',
        tags: ['investasi halal', 'mudharabah', 'musyarakah', 'emas', 'an-nabhani'],
        coverImage: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 29000,
        content: `# Investasi Islami Berdasarkan An-Nizham al-Iqtisadi fil Islam

## Pendahuluan: Mengapa Banyak "Investasi Syariah" Bermasalah?

Taqiyyuddin an-Nabhani dalam *An-Nizham al-Iqtisadi fil Islam* menjelaskan bahwa sistem ekonomi kapitalisme modern, termasuk banyak instrumen keuangan berlabel "syariah", pada hakikatnya masih berlandaskan riba.

Sukuk negara, misalnya, walaupun disebut syariah, tetap merupakan **surat hutang** yang memberikan imbal hasil tetap kepada pemegangnya — ini adalah struktur riba dalam bungkus berbeda.

An-Nabhani menegaskan: *"Riba bukan hanya bunga bank. Setiap tambahan yang disyaratkan dalam akad pinjaman adalah riba, tanpa memandang namanya."*

## Investasi yang Benar-benar Halal

### 1. Mudharabah (شركة المضاربة)

**Definisi:** Kamu sebagai shahibul maal (pemilik modal) memberikan modal kepada mudharib (pengelola) untuk berbisnis. Keuntungan dibagi sesuai nisbah yang disepakati; kerugian ditanggung pemilik modal (kecuali karena kelalaian mudharib).

**Dasar:** Nabi ﷺ sendiri pernah menjadi mudharib untuk Khadijah r.a. sebelum menikah.

**Contoh praktis:**
- Modal: Rp 10 juta untuk bisnis katering teman
- Nisbah: 60% untuk pemilik modal, 40% untuk pengelola
- Jika untung Rp 2 juta: kamu dapat Rp 1,2 juta
- Jika rugi: kamu menanggung kerugian modal

**Kunci:** Pilih mudharib yang amanah. Buat akad tertulis yang jelas.

### 2. Musyarakah (شركة العنان)

**Definisi:** Dua pihak atau lebih bergabung dengan modal dan/atau tenaga untuk berbisnis bersama. Keuntungan dan kerugian ditanggung proporsional.

**Cocok untuk:** Membuka usaha bersama, bergabung sebagai pemegang saham aktif di usaha UMKM lokal.

**Perbedaan dengan saham:** Dalam musyarakah yang sah, kamu adalah **mitra usaha aktif** yang tahu bisnisnya, bukan sekadar pemegang kertas yang diperjualbelikan di bursa.

### 3. Ijarah (الإجارة)

**Definisi:** Menyewakan aset (properti, kendaraan, peralatan) dan mendapat imbalan jasa (ujrah).

**Contoh:**
- Sewa kos-kosan: kamu memiliki properti, disewakan, dapat sewa bulanan
- Sewa kendaraan: mobil/motor disewakan untuk rental

**An-Nabhani menegaskan:** Ijarah adalah akad yang jelas halal karena ada pertukaran manfaat nyata.

### 4. Emas sebagai Simpan Nilai

An-Nabhani dalam *An-Nizham al-Iqtisadi* berulang kali menegaskan bahwa **emas dan perak adalah mata uang hakiki dalam Islam** (an-naqdain). Menyimpan emas bukan spekulasi — ini adalah menjaga nilai kekayaan dari inflasi.

**Cara yang benar:**
- Beli emas fisik batangan (Antam, UBS)
- Simpan sendiri atau di brankas
- **Hindari:** emas kertas, ETF emas, kontrak berjangka emas

**Perhitungan zakat emas:**
- Nisab: 85 gram
- Haul: 1 tahun
- Kadar: 2,5%

### 5. Kepemilikan Usaha Langsung (Tijara)

Cara paling langsung: buka usaha sendiri atau beli usaha yang sudah jalan. Kamu adalah pemilik penuh, menanggung risiko penuh, dan menikmati keuntungan penuh.

## Yang Harus Dihindari Menurut An-Nabhani

| Instrumen | Masalah |
|---|---|
| Obligasi/sukuk negara | Hutang berbunga = riba |
| Deposito bank konvensional | Bunga tetap = riba |
| Saham di bursa (umumnya) | Banyak perusahaan ribawi + spekulasi |
| Reksa dana campuran | Portofolio campur halal-haram |
| Asuransi jiwa konvensional | Gharar + riba |
| Paylater/kredit berbunga | Riba nasi'ah |

## Memulai Investasi Islami

**Langkah 1:** Bersihkan dari riba — tutup deposito berbunga, keluar dari saham ribawi

**Langkah 2:** Bangun dana darurat dalam emas fisik (3-6 bulan pengeluaran)

**Langkah 3:** Cari peluang mudharabah/musyarakah di sekitar kamu — UMKM keluarga, teman yang buka usaha

**Langkah 4:** Jika punya properti lebih — sewakan dengan akad ijarah yang jelas

> *"Sesungguhnya Allah Maha Baik dan tidak menerima kecuali yang baik."* (HR. Muslim)`,
      },
      {
        slug: 'fiqh-muamalah-modern-transaksi-digital',
        title: 'Fiqh Muamalah Modern: Transaksi Digital yang Halal dan yang Harus Dihindari',
        description: 'Panduan fiqh praktis untuk era digital — hukum belanja online, dropship, afiliasi, NFT, kripto, dan berbagai transaksi modern lainnya berdasarkan dalil yang kuat.',
        category: 'Fiqh',
        tags: ['fiqh muamalah', 'transaksi digital', 'ecommerce', 'kripto', 'halal haram'],
        coverImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 25000,
        content: `# Fiqh Muamalah Modern: Panduan Transaksi Digital

## Prinsip Dasar Muamalah

Kaidah fiqh yang menjadi landasan:

> *"Hukum asal dalam muamalah adalah boleh, kecuali ada dalil yang mengharamkannya."*

Setiap transaksi baru dihukumi halal sampai ditemukan unsur yang mengharamkannya: **riba, gharar (ketidakpastian berlebih), maisir (judi), atau kezaliman**.

## Belanja Online

**Hukum:** Halal, dengan catatan:
- Barang harus jelas spesifikasinya (tidak gharar)
- Penjual harus memiliki barang atau mampu menghadirkannya
- Tidak ada unsur penipuan

**Masalah yang sering muncul:**
- Foto produk tidak sesuai kenyataan → penjual berdosa, pembeli boleh retur
- Pre-order tanpa kepastian stok → gharar yang perlu dihindari

## Dropship

**Hukum:** Ada dua pendapat.

**Pendapat pertama (boleh):** Akad salam — jual barang yang akan diadakan dengan spesifikasi jelas dan harga di muka. Mayoritas ulama kontemporer membolehkan.

**Pendapat kedua (perlu hati-hati):** Nabi ﷺ bersabda: *"Jangan menjual apa yang tidak ada padamu."* (HR. Abu Dawud). Sebagian ulama menggunakan ini untuk melarang dropship tanpa kepemilikan.

**Solusi praktis:** Buat akad wakalah — kamu bertindak sebagai wakil (agen) penjual, bukan penjual langsung. Ini menghindari masalah fiqh.

## Marketing Afiliasi

**Hukum:** Halal — ini adalah akad ju'alah (memberikan upah atas hasil kerja tertentu) atau samsarah (makelar/broker).

**Dalil:** Rasulullah ﷺ tidak melarang praktik samsarah yang adil.

**Yang harus dijaga:** Jujur dalam merekomendasikan — jangan rekomendasikan produk yang kamu tidak percayai hanya demi komisi.

## Kripto/Aset Digital

**Hukum:** Khilaf (diperdebatkan) di kalangan ulama.

**Yang mengharamkan:** Tidak ada nilai intrinsik, spekulatif, gharar berlebih.

**Yang membolehkan:** Aset digital bisa menjadi alat tukar yang sah jika diterima masyarakat.

**Kesimpulan praktis:** Hindari kripto untuk spekulasi (beli-jual harian untuk cari untung). Jika untuk transaksi nyata — lebih bisa diterima secara fiqh.

## NFT

**Hukum:** Bergantung pada kontennya.
- NFT karya seni halal → boleh diperjualbelikan
- NFT karya seni haram (gambar makhluk bernyawa berlebihan, musik haram) → haram
- NFT yang murni spekulatif → mendekati maisir

## Pinjaman Online (Pinjol)

**Hukum:** Mayoritas **haram** karena mengandung riba.

Bahkan yang berlabel syariah perlu diperiksa ulang struktur akadnya.

**Alternatif:** Pinjam ke keluarga/teman (qardh hasan), koperasi syariah, atau BMT.

## Tabel Ringkasan

| Transaksi | Hukum | Catatan |
|---|---|---|
| Belanja online | Halal | Perhatikan kejelasan produk |
| Dropship (wakalah) | Halal | Gunakan akad wakalah |
| Afiliasi | Halal | Jujur dalam promosi |
| Kripto (transaksi) | Khilaf | Hindari spekulasi |
| NFT halal | Halal | Tergantung konten |
| Pinjol berbunga | Haram | Riba |
| Paylater berbunga | Haram | Riba |`,
      },
      {
        slug: 'fiqh-keuangan-keluarga-muslim-budgeting-zakat-wakaf',
        title: 'Manajemen Keuangan Keluarga Muslim: Budgeting, Zakat, dan Wakaf Produktif',
        description: 'Sistem keuangan keluarga yang sesuai syariat — dari membagi penghasilan, menunaikan kewajiban zakat, menabung halal, hingga berwakaf produktif untuk masa depan.',
        category: 'Finance',
        tags: ['keuangan keluarga', 'budgeting', 'zakat', 'wakaf', 'islam'],
        coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop&q=80',
        isPremium: true,
        price: 29000,
        content: `# Manajemen Keuangan Keluarga Muslim

## Filosofi Dasar

Dalam Islam, harta adalah amanah Allah. Kita hanya pengelola sementara. Oleh karena itu, mengelolanya dengan baik adalah bagian dari ibadah.

> *"Sesungguhnya harta dan anak-anakmu hanyalah cobaan bagimu."* (QS. At-Taghabun: 15)

## Sistem Budgeting Islami: 40-30-20-10

Pembagian penghasilan bulanan yang seimbang:

| Pos | Persentase | Keterangan |
|---|---|---|
| Kebutuhan pokok | 40% | Makan, tagihan, transportasi |
| Cicilan & hutang | 30% | Maksimal — usahakan kurang |
| Tabungan & investasi | 20% | Emas, modal usaha |
| Zakat, sedekah, infak | 10% | Kewajiban dan kebaikan |

**Prinsip:** Keluarkan zakat dan sedekah pertama kali, baru sisanya dikelola.

## Mengelola Hutang dengan Benar

Islam tidak melarang berhutang, tapi memberikan adab:

1. **Catat setiap hutang** — QS. Al-Baqarah: 282 memerintahkan pencatatan
2. **Niat kuat untuk melunasi** — Rasulullah ﷺ berdoa perlindungan dari hutang
3. **Hindari hutang berbunga** — riba dalam segala bentuknya
4. **Lunasi yang terkecil dulu** (metode snowball) atau yang tertinggi (metode avalanche)

## Tabungan Halal untuk Keluarga

**Prioritas tabungan:**
1. Dana darurat: 3-6 bulan pengeluaran dalam emas/tabungan tanpa bunga
2. Dana pendidikan anak: rekening khusus atau logam mulia
3. Dana haji/umrah: BPIH atau tabungan haji di bank syariah (akad wadi'ah)
4. Modal usaha masa depan

**Catatan:** Tabungan di bank konvensional dengan bunga — bunga tersebut sebaiknya disedekahkan, bukan dinikmati.

## Zakat Keluarga: Kewajiban yang Sering Terlupa

### Zakat yang wajib ditunaikan:
- **Zakat penghasilan** — setiap bulan 2,5% dari gaji jika sudah nisab
- **Zakat fitrah** — setiap Ramadan untuk setiap anggota keluarga
- **Zakat maal** — jika emas/tabungan sudah mencapai nisab dan haul

### Cara praktis:
Buat amplop atau akun tersendiri khusus zakat. Setiap gajian, langsung sisihkan.

## Wakaf Produktif untuk Warisan Jariyah

Wakaf tidak harus menunggu kaya. Ada beberapa cara wakaf produktif yang terjangkau:

### Wakaf tunai
Mulai dari Rp 10.000 melalui platform seperti BWI (Badan Wakaf Indonesia) atau Dompet Dhuafa Wakaf.

### Wakaf buku/mushaf
Wakafkan mushaf ke masjid, pesantren, atau penjara.

### Wakaf saham produktif
Beberapa lembaga menerima wakaf dalam bentuk aset produktif yang hasilnya untuk pendidikan/kesehatan umat.

> *"Jika seorang manusia meninggal, terputuslah amalnya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, dan anak salih yang mendoakannya."* (HR. Muslim)

## Rencana Keuangan 5 Tahun

**Tahun 1-2:** Lunasi semua hutang berbunga, bangun dana darurat
**Tahun 2-3:** Mulai investasi halal (emas, modal usaha kecil)
**Tahun 3-5:** Rencanakan haji, alokasi pendidikan anak
**Setiap tahun:** Tingkatkan porsi sedekah dan wakaf

Kunci: konsisten, bukan besar. Rp 100.000/bulan yang konsisten lebih baik dari Rp 1 juta yang sekali-sekali.`,
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
  console.log('━━━ Seeding creators (batch 1/3) ━━━')
  for (const creator of CREATORS) await seedCreator(creator)
  console.log('\n✅ Batch 1 selesai. Jalankan seed-creators-2.ts untuk batch berikutnya.')
}

main().catch(console.error).finally(() => db.$disconnect())

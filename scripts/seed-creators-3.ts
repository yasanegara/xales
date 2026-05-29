import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const CREATOR = {
  email: 'manajemen@tweak.id',
  username: 'manajemen.produktif',
  name: 'Manajemen Produktif',
  password: 'Creator@2025!',
  bio: 'Sistem produktivitas, manajemen diri, dan kepemimpinan berbasis nilai Islam. Untuk profesional, pengusaha, dan siapapun yang ingin bekerja dengan itqan.',
  profilePic: 'https://api.dicebear.com/7.x/shapes/png?seed=manajemen-produktif&size=256',
  articles: [
    {
      slug: 'manajemen-waktu-ulama-produktif',
      title: 'Teknik Manajemen Waktu yang Digunakan Para Ulama Produktif',
      description: 'Bagaimana ulama seperti Imam Nawawi, Ibnu Qayyim, dan Imam Syafi\'i bisa menghasilkan ratusan kitab di era tanpa teknologi? Pelajari sistem mereka dan terapkan hari ini.',
      category: 'Manajemen',
      tags: ['manajemen waktu', 'produktivitas', 'ulama', 'islami', 'time management'],
      coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=630&fit=crop&q=80',
      isPremium: false,
      price: null,
      content: `# Teknik Manajemen Waktu Para Ulama Produktif

## Pertanyaan yang Menggelitik

Imam Nawawi wafat di usia 44 tahun, namun meninggalkan puluhan kitab yang masih dikaji hingga hari ini. Imam Syafi'i menulis ratusan halaman tanpa komputer. Ibnu Qayyim al-Jauziyyah menulis lebih dari 80 karya besar.

Apa rahasia mereka?

## 1. Tabaruk wal Barakah: Mencari Keberkahan Waktu

Para ulama memahami bahwa tidak semua waktu bernilai sama. Mereka memanfaatkan **waktu-waktu barakah**:

- **Sepertiga malam terakhir** — untuk ibadah dan menulis
- **Setelah Subuh** — pikiran paling jernih
- **Hari Senin dan Kamis** — hari yang Nabi ﷺ sukai untuk berpuasa dan beramal

**Praktis hari ini:** Identifikasi 2-3 jam paling produktif dalam harimu dan proteksi waktu tersebut.

## 2. At-Tartib: Keteraturan yang Ketat

Imam Nawawi memiliki jadwal harian yang sangat terstruktur. Setiap waktu ada tugasnya masing-masing. Tidak ada "nanti-nanti" dalam kamus mereka.

Ibnu Jama'ah dalam *Tadzkiratus Sami' wal Mutakallim* mencatat: para ulama membagi hari ke dalam blok-blok waktu yang jelas — untuk mengajar, menulis, membaca, ibadah, dan istirahat.

**Praktis:** Buat time blocking harian. Tulis di malam sebelumnya: jam 06-08 untuk X, jam 09-12 untuk Y, dll.

## 3. Qillatus Shaghaaib: Meminimalkan Hal Sia-sia

> *"Di antara tanda baiknya Islam seseorang adalah meninggalkan hal yang tidak bermanfaat baginya."* (HR. Tirmidzi, hasan)

Para ulama sangat selektif terhadap apa yang mereka izinkan masuk ke dalam waktu mereka. Pergaulan yang tidak produktif, pembicaraan sia-sia, hiburan yang berlebihan — semua dihindari.

**Praktis:** Audit waktumu selama 3 hari. Berapa jam untuk hal yang benar-benar bermakna?

## 4. Al-Istimrar: Konsistensi di atas Intensitas

Nabi ﷺ bersabda: *"Amalan yang paling dicintai Allah adalah yang paling konsisten meskipun sedikit."* (HR. Bukhari)

Para ulama tidak menulis 50 halaman sekali duduk lalu berhenti berminggu-minggu. Mereka menulis 2-5 halaman setiap hari tanpa jeda.

**Praktis:** Tentukan satu kebiasaan inti (1 artikel/hari, 30 menit belajar/hari) dan lakukan tanpa henti selama 90 hari.

## 5. An-Niyyah was Sadaad: Niat dan Ketepatan Sasaran

Sebelum memulai, para ulama selalu memperjelas: *"Untuk apa ini?"* Niat yang jelas menghasilkan fokus yang tajam.

Ibnu Qayyim berkata: *"Siapa yang tidak mengenal ke mana ia pergi, tidak akan sampai meski berjalan sejauh apapun."*

**Praktis:** Setiap pagi tulis satu kalimat: "Hari ini saya ingin mencapai ____ karena ____."

## 6. At-Tafriq: Pisahkan Waktu Kerja dan Istirahat

Para ulama tidak bekerja non-stop. Mereka istirahat — dan ketika istirahat, benar-benar beristirahat (tidur siang, berjalan, bermain dengan keluarga).

Ini sesuai sains modern: otak butuh *diffuse mode* untuk memproses informasi secara kreatif.

## Implementasi Sistem Ulama dalam 1 Minggu

**Hari 1-2:** Audit waktu — catat semua aktivitas setiap jam
**Hari 3:** Identifikasi kebocoran waktu terbesar
**Hari 4:** Buat jadwal ideal berdasarkan waktu-waktu barakah
**Hari 5-7:** Jalankan jadwal, evaluasi di malam hari

> *"Waktu lebih berharga dari emas. Jika kamu menyia-nyiakan emas, kamu masih bisa mendapatkannya kembali. Tapi jika kamu menyia-nyiakan waktu, ia tidak akan pernah kembali."* — Hasan Al-Bashri`,
    },
    {
      slug: 'manajemen-sistem-kerja-efisien-itqan',
      title: 'Membangun Sistem Kerja Efisien dengan Prinsip Itqan dalam Islam',
      description: 'Itqan — kesempurnaan dalam bekerja — adalah perintah Allah. Pelajari bagaimana membangun sistem kerja yang tidak hanya efisien, tapi juga bernilai ibadah.',
      category: 'Manajemen',
      tags: ['itqan', 'sistem kerja', 'produktivitas', 'kualitas', 'islam'],
      coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=630&fit=crop&q=80',
      isPremium: false,
      price: null,
      content: `# Sistem Kerja Efisien dengan Prinsip Itqan

## Apa itu Itqan?

> *"Sesungguhnya Allah mencintai jika salah seorang di antara kalian melakukan suatu pekerjaan, ia melakukannya dengan itqan (sempurna/profesional)."* (HR. Baihaqi, sahih)

Itqan bukan perfeksionisme yang melumpuhkan. Itqan adalah **komitmen untuk melakukan setiap pekerjaan dengan standar terbaik yang kamu mampu**, diselesaikan hingga tuntas, dan dipertanggungjawabkan.

## Perbedaan Sibuk dan Produktif

Banyak orang sibuk tapi tidak produktif. Mereka mengerjakan banyak hal tapi tidak ada yang benar-benar selesai dengan baik.

Produktif dengan itqan berarti:
- **Sedikit, tapi berkualitas** — daripada banyak tapi setengah-setengah
- **Selesaikan, baru mulai baru** — tuntas adalah prinsip itqan
- **Evaluasi dan perbaiki** — itqan bukan statis, terus disempurnakan

## Sistem GTD (Get Things Done) ala Islam

David Allen menciptakan GTD — sistem manajemen tugas terpopuler di dunia. Ternyata, prinsipnya selaras dengan nilai Islam.

### Langkah 1: Capture (Catat Semua)
Kosongkan beban mental. Tulis semua yang ada di kepala ke satu tempat. Otak bukan tempat menyimpan daftar tugas.

**Tool:** Buku catatan atau Notion/Obsidian

### Langkah 2: Clarify (Klarifikasi)
Untuk setiap item yang dicatat, tanya: *"Apa tindakan konkret selanjutnya?"*

Bukan "beli hadiah ulang tahun istri" (terlalu luas) tapi "buka Tokopedia, cari jam tangan wanita budget 300rb" (spesifik dan actionable).

### Langkah 3: Organize (Kategorikan)
Bagi tugas ke dalam kategori:
- Segera (hari ini)
- Minggu ini
- Suatu hari (tidak mendesak)
- Menunggu orang lain
- Referensi (tidak perlu tindakan)

### Langkah 4: Reflect (Review Mingguan)
Setiap Jumat malam atau Ahad pagi, review sistem:
- Apa yang sudah selesai? (syukuri)
- Apa yang perlu dilanjutkan?
- Apa prioritas minggu depan?

### Langkah 5: Engage (Kerjakan)
Pilih tugas berdasarkan: konteks (di mana kamu sekarang?), energi (seberapa segar?), dan prioritas.

## Deep Work: Bekerja Tanpa Gangguan

Cal Newport dalam *Deep Work* menyebut kemampuan fokus mendalam sebagai keahlian terlangka dan terberharga di era digital.

Para ulama sudah mempraktikkan ini berabad-abad sebelum istilah "deep work" ada.

**Teknik Pomodoro:**
- 25 menit kerja fokus penuh (tidak ada notifikasi, tidak ada distraksi)
- 5 menit istirahat
- Setelah 4 sesi: istirahat 15-30 menit

**Setting deep work:**
- Matikan notifikasi HP
- Tutup tab yang tidak relevan
- Informasikan ke keluarga: "30 menit ini jangan diganggu kecuali darurat"

## Sistem Arsip dan Dokumentasi

Itqan juga berarti **mendokumentasikan pekerjaan dengan baik** — sehingga bisa diulang, diperbaiki, dan diserahkan ke orang lain jika diperlukan.

**Struktur folder yang rapi:**
📁 Proyek
      📁 [Nama Klien/Proyek]
        📄 Brief & Scope
        📄 Progress
        📄 Deliverables
        📄 Invoice

## Evaluasi Harian: Muhasabah Kerja

Sebelum tidur, luangkan 5 menit:
1. Apa 3 hal terbaik yang selesai hari ini?
2. Apa yang bisa lebih baik besok?
3. Apa 1 tugas paling penting untuk besok?

Muhasabah bukan tentang menyalahkan diri — tapi tentang terus tumbuh.

> *"Hisablah dirimu sebelum kamu dihisab."* — Umar bin Khattab r.a.`,
    },
    {
      slug: 'manajemen-proyek-freelancer-tim-kecil',
      title: 'Manajemen Proyek untuk Freelancer dan Tim Kecil: Tools & Framework',
      description: 'Sistem lengkap mengelola proyek dari awal hingga selesai — scope management, timeline, komunikasi klien, hingga tools gratis yang efektif untuk freelancer dan tim kecil Indonesia.',
      category: 'Manajemen',
      tags: ['manajemen proyek', 'freelancer', 'tim', 'tools', 'produktivitas'],
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop&q=80',
      isPremium: true,
      price: 29000,
      content: `# Manajemen Proyek untuk Freelancer dan Tim Kecil

## Mengapa Proyek Gagal?

Riset PMI (Project Management Institute) menemukan bahwa 70% proyek gagal atau overbudget. Penyebab utama:

1. Scope yang tidak jelas di awal
2. Komunikasi yang buruk
3. Tidak ada sistem tracking progress
4. Estimasi waktu yang terlalu optimis

Panduan ini akan menyelesaikan keempat masalah itu.

## Framework: 5 Fase Proyek

### Fase 1: Initiation (Inisiasi)

Sebelum proyek dimulai, pastikan ini jelas:

**Brief dokumen yang wajib ada:**
- Apa output akhir proyek?
- Siapa yang terlibat dan apa peran masing-masing?
- Apa bukan bagian dari proyek (out of scope)?
- Kapan deadline-nya?
- Berapa budget-nya?

**Template scope statement:**
Proyek: [Nama]
    Klien: [Nama klien]
    Output: [Deskripsi spesifik hasil akhir]
    Timeline: [Tanggal mulai] - [Deadline]
    Budget: Rp [X]
    Out of scope: [Sebutkan apa saja yang TIDAK termasuk]
    Revision: Maksimal [X] kali

### Fase 2: Planning (Perencanaan)

Pecah proyek menjadi tugas-tugas kecil yang bisa dikerjakan dalam 1-2 hari.

**Work Breakdown Structure (WBS):**
Proyek Website UMKM
    ├── Desain UI
    │   ├── Wireframe halaman utama (2 hari)
    │   ├── Desain mobile (1 hari)
    │   └── Revisi desain (1 hari)
    ├── Development
    │   ├── Setup hosting & domain (0.5 hari)
    │   ├── Coding halaman utama (3 hari)
    │   └── Integrasi konten (1 hari)
    └── Testing & Launch
        ├── QA testing (1 hari)
        └── Launch & handover (0.5 hari)

**Estimasi waktu:** Selalu kalikan estimasi awal dengan 1.5x untuk buffer.

### Fase 3: Execution (Pelaksanaan)

**Daily standup (5 menit):**
- Kemarin saya mengerjakan: [X]
- Hari ini saya akan mengerjakan: [Y]
- Ada hambatan: [Z] (jika ada)

Untuk freelancer solo: tulis ini di jurnal atau Notion setiap pagi.

**Komunikasi klien:**
- Update progress mingguan (setiap Jumat)
- Jangan tunggu klien bertanya — proaktif
- Dokumentasikan semua keputusan via pesan/email

### Fase 4: Monitoring (Pemantauan)

**Indikator proyek sehat:**
- Progress sesuai atau ahead of schedule
- Budget tidak overrun
- Klien terinformasi dan happy
- Tim tidak overwhelmed

**Red flags yang perlu ditangani segera:**
- Tertinggal > 20% dari schedule
- Scope creep (klien minta tambahan di luar brief)
- Komunikasi dari klien terlambat > 3 hari

### Fase 5: Closing (Penutupan)

Jangan langsung ke proyek berikutnya tanpa:
1. Serah terima formal (dokumen/link/file) ke klien
2. Invoice final dikirim
3. Testimoni diminta
4. Retrospektif internal: apa yang berjalan baik? Apa yang perlu diperbaiki?

## Tools Gratis yang Efektif

### Manajemen Tugas:
- **Notion** — all-in-one workspace, sangat fleksibel
- **Trello** — visual kanban board, cocok untuk tim kecil
- **ClickUp** — fitur lengkap, ada free plan

### Komunikasi Tim:
- **WhatsApp Business** — familiar, semua orang pakai
- **Slack** (gratis) — lebih profesional, bisa organize per channel
- **Telegram** — grup dan channel untuk update

### Dokumentasi:
- **Google Docs** — kolaborasi real-time, gratis
- **Notion** — lebih powerful untuk dokumentasi terstruktur

### Manajemen Waktu:
- **Toggl Track** — track waktu per proyek (penting untuk billing per jam)
- **Google Calendar** — time blocking dan jadwal meeting

## Menangani Scope Creep

Scope creep adalah ketika klien meminta tambahan pekerjaan di luar yang disepakati.

**Cara menangani:**
*"Terima kasih atas masukannya. Permintaan ini di luar scope yang kita sepakati. Saya bisa mengerjakannya sebagai tambahan dengan biaya Rp [X] dan waktu tambahan [Y] hari. Bagaimana?"*

Jangan mengiyakan tanpa negosiasi — ini merugikanmu dan membuat klien tidak menghargai batasmu.

## Template Invoice Sederhana

Minimal sebuah invoice harus mencantumkan:
- Nomor invoice
- Tanggal
- Detail layanan yang diberikan
- Total biaya
- Rekening pembayaran
- Due date pembayaran`,
    },
    {
      slug: 'manajemen-leadership-muslim-amanah',
      title: 'Leadership Muslim: Seni Memimpin Tim dengan Nilai Amanah',
      description: 'Kepemimpinan dalam Islam bukan soal kuasa — tapi tentang amanah dan pelayanan. Panduan praktis memimpin tim dengan nilai-nilai Islam yang menghasilkan kinerja dan loyalitas tinggi.',
      category: 'Manajemen',
      tags: ['leadership', 'kepemimpinan', 'tim', 'amanah', 'islam'],
      coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=630&fit=crop&q=80',
      isPremium: true,
      price: 25000,
      content: `# Leadership Muslim: Memimpin dengan Nilai Amanah

## Definisi Kepemimpinan dalam Islam

> *"Setiap kalian adalah pemimpin, dan setiap pemimpin akan dimintai pertanggungjawaban atas yang dipimpinnya."* (HR. Bukhari-Muslim)

Kepemimpinan dalam Islam adalah **amanah** — bukan privilege, bukan kehormatan, melainkan tanggung jawab berat yang akan dipertanggungjawabkan di hadapan Allah.

Pemimpin terbaik dalam Islam bukan yang paling ditakuti — melainkan yang paling dicintai karena keadilannya.

## Model Kepemimpinan: Rasulullah ﷺ

Para pakar manajemen modern memuji gaya kepemimpinan Nabi ﷺ yang jauh mendahului zamannya:

**Servant Leadership:** Beliau melayani, bukan dilayani. Mengikuti ekspedisi, membantu membangun Masjid, menjahit baju sendiri.

**Participative Leadership:** Bermusyawarah dengan sahabat dalam urusan dunia. Perang Badar, Uhud, dan Khandak diputuskan melalui musyawarah.

**Transformational Leadership:** Mengubah perilaku dan karakter pengikutnya, bukan sekadar mengejar target.

## 5 Prinsip Kepemimpinan Islam

### 1. Amanah (Dapat Dipercaya)

Pemimpin yang amanah:
- Menepati janji kepada tim
- Transparan tentang keputusan dan alasannya
- Mengakui kesalahan

**Praktis:** Jika berjanji review proposal tim pada Kamis — lakukan. Jika tidak bisa, kabari lebih awal dan minta maaf.

### 2. Adil dalam Perlakuan

Tidak ada favoritisme. Setiap anggota tim diperlakukan sama dalam hal:
- Akses ke sumber daya
- Kesempatan berkembang
- Konsekuensi atas kesalahan

Umar bin Khattab r.a. dikenal tidak pernah memberi keistimewaan kepada keluarganya dalam kepemimpinannya.

### 3. Syura (Musyawarah)

Libatkan tim dalam pengambilan keputusan, terutama yang berdampak pada mereka.

**Manfaat praktis:**
- Keputusan lebih baik (input dari berbagai perspektif)
- Tim lebih berkomitmen (mereka ikut memutuskan)
- Membangun rasa memiliki

**Format 1-on-1 efektif:**
- Apa yang berjalan baik di tim kita?
- Apa yang menurutmu perlu diperbaiki?
- Apa yang bisa aku lakukan untuk lebih mendukungmu?

### 4. Kasih Sayang kepada Tim

> *"Allah tidak menyayangi orang yang tidak menyayangi manusia."* (HR. Bukhari)

Pemimpin yang peduli dengan kondisi tim — bukan hanya performa kerja, tapi juga kondisi personal.

**Praktis:** Tanya kondisi pribadi anggota tim (dengan proporsi yang tepat). Jika ada yang sakit keluarganya, kirim perhatian nyata.

### 5. Akuntabilitas (Muhasabah Diri)

Pemimpin yang baik mengevaluasi dirinya sendiri sebelum mengevaluasi orang lain.

Monthly self-assessment:
- Apakah saya sudah adil kepada semua anggota tim?
- Apakah saya menepati semua janji yang saya buat?
- Apa satu hal yang bisa saya lakukan lebih baik?

## Membangun Tim yang Loyal

Loyalitas tidak dibeli dengan gaji — dibangun dengan kepercayaan dan perlakuan yang baik.

**3 kebutuhan dasar anggota tim:**
1. **Competence:** Merasa mampu dan terus berkembang
2. **Autonomy:** Dipercaya untuk mengambil keputusan
3. **Relatedness:** Merasa terhubung dan dihargai

**Praktis:**
- Delegasikan tugas nyata dengan kepercayaan penuh
- Beri ruang untuk trial and error
- Rayakan keberhasilan — sekecil apapun

## Menangani Konflik dalam Tim

Konflik tidak selalu buruk — konflik yang dikelola dengan baik menghasilkan inovasi.

**Proses resolusi konflik Islami:**
1. Dengar kedua pihak secara terpisah
2. Fokus pada masalah, bukan karakter
3. Cari solusi yang adil untuk keduanya
4. Dokumentasikan kesepakatan
5. Follow up setelah 2 minggu

## Meninggalkan Warisan Kepemimpinan

Kepemimpinan terbaik adalah yang menghasilkan pemimpin-pemimpin baru.

Nabi ﷺ mendidik para sahabat untuk memimpin — bukan membuat mereka bergantung kepada beliau.

Tanya dirimu: *"Jika aku pergi besok, siapa yang siap menggantikanku?"*

Jika jawabannya "tidak ada" — itu adalah gagal kepemimpinan.`,
    },
    {
      slug: 'manajemen-pkm-profesional-muslim',
      title: 'Sistem PKM (Personal Knowledge Management) untuk Profesional Muslim',
      description: 'Bangun sistem pengelolaan pengetahuan pribadi yang efektif — cara mencatat, mengorganisir, menghubungkan, dan menggunakan ilmu yang kamu pelajari agar tidak terlupakan.',
      category: 'Manajemen',
      tags: ['PKM', 'knowledge management', 'belajar', 'notetaking', 'produktivitas'],
      coverImage: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=630&fit=crop&q=80',
      isPremium: true,
      price: 29000,
      content: `# Sistem PKM untuk Profesional Muslim

## Mengapa Kita Melupakan yang Kita Pelajari?

Menurut *Forgetting Curve* Hermann Ebbinghaus, kita melupakan 50% dari yang kita pelajari dalam 1 jam, dan 70% dalam 24 jam — kecuali kita mengulanginya.

Berapa buku, kursus, dan kajian yang sudah kamu ikuti? Berapa banyak yang benar-benar "menetap" dan mengubah cara berpikirmu?

PKM (Personal Knowledge Management) adalah sistem untuk memastikan ilmu yang kamu pelajari tidak sia-sia.

## Fondasi: Ilmu Adalah Amanah

> *"Barangsiapa menempuh jalan untuk mencari ilmu, Allah akan memudahkan baginya jalan menuju surga."* (HR. Muslim)

Ilmu yang tidak diamalkan adalah hutang. Sistem PKM membantu kita **mengamalkan ilmu** — bukan hanya mengumpulkannya.

## Siklus PKM: CAPTURE → PROCESS → OUTPUT

### Capture: Tangkap Semua

Setiap kali kamu menemukan sesuatu yang berharga — dari buku, kajian, podcast, percakapan, atau pengalaman — catat segera.

**Prinsip:** Pikiran yang tidak dicatat adalah pikiran yang hilang.

**Tools capture:**
- Notifikasi HP → Notion/Obsidian
- Browser → Pocket atau Notion Web Clipper
- Kajian/ceramah → Voice Note → transkrip manual
- Buku → highlight + transfer ke digital

**Buat capture mudah:** Satu tap untuk mencatat. Jika prosesnya rumit, kamu tidak akan melakukannya.

### Process: Olah Menjadi Bermakna

Raw notes tidak bernilai. Yang bernilai adalah **pemahaman dan koneksinya**.

**Teknik Progressive Summarization (Tiago Forte):**
1. Catat kutipan/poin asli (layer 1)
2. Highlight poin terpenting (layer 2)
3. Tulis dengan kata-katamu sendiri (layer 3)
4. Buat summary 3 kalimat (layer 4)

**Atomic Notes:**
Satu catatan = satu ide. Beri judul yang jelas. Ini memudahkan penghubungan antar ide.

### Output: Gunakan untuk Menghasilkan

Pengetahuan yang tidak digunakan tidak bernilai. Output bisa berupa:
- Artikel atau tulisan
- Konten untuk media sosial
- Presentasi atau workshop
- Keputusan bisnis yang lebih baik
- Percakapan yang lebih bermakna

## Tools PKM: Pilih Satu, Kuasai Sepenuhnya

### Obsidian (Rekomendasi untuk Pelajar Serius)
- **Kelebihan:** Lokal (data di komputermu), gratis, graph view yang menunjukkan koneksi antar catatan
- **Cocok untuk:** Peneliti, penulis, pengkaji ilmu agama
- **Kurva belajar:** Sedang

### Notion (Rekomendasi untuk Profesional)
- **Kelebihan:** Cloud, kolaborasi mudah, tampilan cantik
- **Cocok untuk:** Manajer, freelancer, kreator konten
- **Kurva belajar:** Mudah-sedang

### Roam Research / Logseq
- Untuk pengguna advanced yang ingin bidirectional linking
- Lebih cocok untuk peneliti akademik

## Struktur Sistem PKM yang Sederhana

**Folder PARA (Tiago Forte):**
- **Projects:** Proyek aktif yang punya deadline
- **Areas:** Tanggung jawab yang ongoing (keuangan, kesehatan, karier)
- **Resources:** Referensi dan minat yang berguna suatu hari
- **Archive:** Selesai atau tidak aktif lagi

## PKM untuk Pelajar Ilmu Agama

Ilmu agama sangat cocok dengan PKM. Cara membangunnya:

**Struktur catatan fiqh:**
# [Masalah]
    ## Dalil
    - [Ayat/Hadits]
    ## Pendapat Ulama
    - Imam A: ...
    - Imam B: ...
    ## Tarjih (Pilihan terkuat)
    ## Catatan personal

**Buat catatan kajian:**
Setelah setiap kajian, luangkan 10 menit untuk:
1. Tulis 3 poin terpenting
2. Tulis 1 hal yang akan kamu amalkan
3. Tulis pertanyaan yang muncul

## Review Berkala: Menjaga Pengetahuan Tetap Hidup

**Harian (5 menit):** Buka catatan kemarin, tambahkan insight baru
**Mingguan (30 menit):** Review semua catatan minggu ini, buat koneksi antar ide
**Bulanan (2 jam):** Review semua output — apa yang sudah diaplikasikan?
**Tahunan:** Evaluasi seluruh sistem — apa yang perlu disederhanakan?

## Mengajarkan untuk Memahami Lebih Dalam

> *"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain."* (HR. Ahmad)

Cara terbaik untuk benar-benar memahami sesuatu: **ajarkan kepada orang lain**.

Mulai berbagi ilmu — lewat tulisan, konten, atau obrolan. Proses mengajarkan memaksamu menyederhanakan dan memperjelas pemahamanmu.

PKM bukan tentang menjadi lebih pintar — tapi tentang menjadi lebih berguna.`,
    },
  ],
}

async function main() {
  console.log('━━━ Seeding creators (batch 3/3) ━━━')
  const hash = await bcrypt.hash(CREATOR.password, 10)
  const user = await db.user.upsert({
    where: { email: CREATOR.email },
    update: { name: CREATOR.name, bio: CREATOR.bio, profilePic: CREATOR.profilePic },
    create: {
      email: CREATOR.email,
      username: CREATOR.username,
      name: CREATOR.name,
      passwordHash: hash,
      bio: CREATOR.bio,
      profilePic: CREATOR.profilePic,
      role: 'user',
      verified: true,
    },
  })
  console.log(`👤 ${CREATOR.name} (@${CREATOR.username})`)

  for (const art of CREATOR.articles) {
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

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Semua creator berhasil di-seed!')
  console.log('')
  console.log('Akun yang dibuat:')
  console.log('  hustle@tweak.id       / Creator@2025!')
  console.log('  fiqh@tweak.id         / Creator@2025!')
  console.log('  marketing@tweak.id    / Creator@2025!')
  console.log('  keluarga@tweak.id     / Creator@2025!')
  console.log('  manajemen@tweak.id    / Creator@2025!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(console.error).finally(() => db.$disconnect())

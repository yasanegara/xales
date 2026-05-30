# Dokumentasi Platform Tweak

> Dibuat berdasarkan kode aktual di `/Users/manbook/xales-mvp`
> Tanggal: 31 Mei 2026

---

## Daftar Isi

1. [Overview Platform](#1-overview-platform)
2. [Fitur Kreator](#2-fitur-kreator)
3. [Fitur Pembaca / User](#3-fitur-pembaca--user)
4. [Sistem Monetisasi](#4-sistem-monetisasi)
5. [Sistem Gift](#5-sistem-gift)
6. [Sistem Library & Folder](#6-sistem-library--folder)
7. [Dashboard](#7-dashboard)
8. [API Endpoints](#8-api-endpoints)
9. [Database Schema](#9-database-schema)
10. [Tech Stack](#10-tech-stack)

---

## 1. Overview Platform

**Tweak** (sebelumnya dikenal dengan nama domain `xales.id` atau `tweak.id`) adalah platform publishing untuk kreator Indonesia. Platform ini memungkinkan kreator untuk:

- Menulis dan mempublikasikan artikel (Markdown) dan web app (HTML interaktif)
- Memonetisasi konten secara langsung via transfer bank atau QRIS
- Menerima gift/donasi dari pembaca
- Menjual bundle paket konten
- Mendistribusikan file/app berbayar

**Target User:**
- Kreator konten teknis, developer, penulis, atau siapa pun yang ingin berbagi pengetahuan
- Pembaca yang ingin mengakses konten berkualitas dan mendukung kreator

**Value Proposition:**
- Satu platform untuk menulis artikel dan mempublish web app sekaligus
- Monetisasi langsung tanpa perantara payment gateway — kreator menerima uang via rekening sendiri atau QRIS
- Tidak ada platform fee persentase; hanya biaya flat Rp 2.500 per transaksi
- Semua konten memerlukan login untuk dibaca (tidak bisa diakses tanpa akun)

---

## 2. Fitur Kreator

### 2.1 Membuat dan Mengelola Konten

Kreator dapat membuat dua jenis konten:

**Artikel (type: `markdown`)**
- Ditulis menggunakan Markdown dengan editor built-in
- Editor mendukung auto-convert paste HTML ke Markdown
- Dapat dilengkapi cover image (upload file atau URL)
- Mendukung Table of Contents otomatis dari heading Markdown
- Mendukung reading time estimasi otomatis

**App (type: `html`)**
- Berisi HTML/CSS/JavaScript yang dijalankan sebagai iframe full-screen
- Tampil tanpa navigasi platform — user melihat app langsung
- Berguna untuk tools, kalkulator, mini-games, dsb.

**Field yang tersedia saat membuat post:**
- Judul, deskripsi, kategori, tags (comma-separated)
- Konten (Markdown atau HTML)
- Cover image (upload base64 atau URL eksternal)
- Pilihan `isPrivate` — konten hanya terlihat oleh penulis sendiri, tidak muncul di feed
- Pilihan `isPremium` dengan pengaturan harga (IDR) dan diskon (%)
- Pengaturan affiliate: aktifkan komisi affiliate dan set rate (5%–50%)
- Lampiran file (PostFile): bisa berupa file upload (base64) atau URL eksternal

**Status Post:**
- `Draft` — tersimpan tapi tidak muncul di feed publik
- `Published` — terlihat di feed dan bisa diakses user lain

### 2.2 Lampiran File (PostFile)

Setiap post bisa memiliki beberapa file lampiran:
- File upload (disimpan sebagai base64 di database)
- URL eksternal (type `url/link` — mengarah ke link di luar platform)
- Setiap file bisa diset sebagai `isFree` (gratis) atau berbayar dengan harga dan diskon tersendiri
- File berbayar bisa dibeli terpisah dari artikelnya

### 2.3 Bundle

Kreator dapat menggabungkan beberapa artikel dan/atau file menjadi satu paket:
- Bundle memiliki judul, deskripsi, harga, dan diskon tersendiri
- Item dalam bundle bisa berupa Post atau PostFile
- Item bisa diurutkan (field `order`)
- Bundle bisa di-publish atau disimpan sebagai draft
- Pembeli bundle mendapat akses ke semua artikel di dalam bundle tersebut

### 2.4 Kode Diskon

Kreator bisa membuat kode diskon untuk konten premiumnya:
- Tipe `percent` — diskon dalam persen (1–100%)
- Tipe `fixed` — diskon nominal IDR
- Bisa dibatasi maksimum pemakaian (`maxUses`; null = tidak terbatas)
- Bisa diberi tanggal kadaluarsa (`expiresAt`)
- Kode berlaku untuk semua artikel kreator tersebut (jika `postId` null) atau untuk artikel tertentu
- Kreator bisa nonaktifkan kode kapan saja

### 2.5 Affiliate

Setiap kreator bisa mengaktifkan program affiliate:
- Set rate komisi affiliate dari 5% hingga 50% (slider, step 5%)
- Ketika user login meng-klik tombol Share di artikel, link yang di-copy otomatis menyertakan `?ref=username`
- Jika ada yang membeli melalui link tersebut, si pembagi link mendapat komisi sesuai rate yang ditetapkan kreator
- Komisi dihitung: `Math.round(amount * (rate / 100))`

### 2.6 Manajemen Pesanan

Halaman Pesanan memungkinkan kreator memverifikasi dan mengaktifkan pembelian:
- Melihat pesanan `pending` (menunggu konfirmasi) dan `paid` (sudah aktif)
- Tombol "Aktifkan" untuk konfirmasi bahwa pembayaran sudah diterima dan memberikan akses ke pembeli
- Tersedia link WhatsApp langsung ke pembeli jika nomor WA pembeli tercatat

### 2.7 Pengaturan Profil & Metode Pembayaran

Di halaman Settings, kreator dapat mengatur:
- Nama, bio, foto profil, status (maks 80 karakter)
- Rate affiliate default
- **Transfer Bank:** nama bank, nomor rekening, nama pemilik — ini yang ditampilkan ke pembeli saat checkout
- **QRIS:** upload gambar QRIS sebagai base64 — ditampilkan ke pembeli saat checkout
- **WA Responder:** nomor WhatsApp dan template pesan otomatis yang dikirim setelah pembelian berhasil

### 2.8 Profil Publik

Setiap kreator memiliki halaman profil di `/@username` yang menampilkan:
- Avatar, nama, bio, status
- Grid semua konten yang dipublish (artikel dan app)
- Tombol Follow untuk user lain

---

## 3. Fitur Pembaca / User

### 3.1 Autentikasi

- **Daftar:** email + password, atau OAuth Google
- **Login:** email + password, atau OAuth Google
- Setelah login, user diarahkan ke halaman asal (`?from=...`)
- Semua konten platform memerlukan login untuk dibaca

### 3.2 Membaca Artikel

Halaman artikel `/@username/slug`:
- Menampilkan judul, deskripsi, cover image, tanggal publish, reading time
- Table of Contents otomatis untuk artikel Markdown (sticky di sidebar)
- Pilihan tampilan (TampilanButton)
- Konten Markdown dirender dengan styling khusus
- App HTML dirender sebagai iframe full-screen dengan navigasi minimal

**Login Gate:** User yang belum login melihat teaser artikel (judul, deskripsi, cover) dan diminta login/daftar.

**Paywall:** Artikel premium menampilkan:
- Preview 600 karakter pertama (teks saja, tanpa Markdown syntax)
- Untuk App: tampilan "browser mockup" dengan cover image terblur
- Informasi harga dan tombol beli
- Daftar file gratis yang bisa langsung diunduh meskipun artikel belum dibeli

### 3.3 Interaksi Artikel

- **Like:** Klik tombol like di artikel (toggle)
- **Simpan (Bookmark):** Simpan artikel ke library pribadi
- **Share:** Modal share dengan copy link (link otomatis menyertakan `?ref=username` jika user login)
- **Komentar:** User bisa berkomentar di artikel Markdown (kreator bisa menghapus komentar di artikel miliknya)
- **Rating:** Beri rating bintang 1–5 setelah membaca artikel
- **Gift:** Kirim gift ke kreator dari halaman artikel

### 3.4 Feed Utama

Halaman utama (`/`) menampilkan feed konten dengan filter:
- **Tab:** Terbaru, Trending (berdasarkan viewCount + likeCount), Diikuti (konten dari kreator yang diikuti)
- **Filter type:** Semua, Artikel, App
- **Filter tag:** Chip tag populer berdasarkan frekuensi

Feed mendukung infinite scroll (12 item per halaman).

Untuk user yang belum login: tampil hero section dan CTA banner.

### 3.5 Pembelian Konten

Alur pembelian artikel premium:
1. Klik tombol beli di paywall
2. Isi nama dan nomor WhatsApp (opsional), masukkan kode diskon (jika ada)
3. Sistem membuat order dengan status `pending`
4. User melihat informasi rekening/QRIS kreator untuk transfer
5. Kreator menerima notifikasi pesanan pending
6. Kreator klik "Aktifkan" di halaman Pesanan setelah menerima pembayaran
7. Status berubah menjadi `paid`, user mendapat akses konten

Pembelian bundle: sama, tapi di halaman `/bundle/slug`.
Pembelian file terpisah: di halaman `/app/fileId` untuk URL/link, atau via API untuk file biasa.

### 3.6 Artikel Terkait

Di bawah konten artikel, ditampilkan hingga 6 artikel terkait berdasarkan:
- Tag yang sama
- Kategori yang sama
- Penulis yang sama

---

## 4. Sistem Monetisasi

### 4.1 Fee Transaksi

- **Biaya flat per transaksi:** Rp 2.500 per transaksi yang berhasil (status `paid`)
- Fee ini **tidak dibebankan ke pembeli** — melainkan dipotong dari penghasilan kreator saat pencairan
- Fee lama (legacy `serviceFee` per-post-type) masih tersimpan di database tapi model baru menggunakan TRANSACTION_FEE

**Kalkulasi:**
```
Total Penjualan = sum semua amount transaksi paid
Fee Transaksi   = jumlah_transaksi × Rp 2.500
Penghasilan Bersih = Total Penjualan - Fee Transaksi
Saldo Tersedia  = Penghasilan Bersih - Total Dicairkan
```

### 4.2 Harga Konten

- Kreator bebas menentukan harga artikel dalam IDR
- Kreator bisa menambahkan diskon % di level artikel (berlaku otomatis saat checkout)
- Kode diskon bisa diterapkan tambahan saat checkout (persen atau nominal)
- Pembeli hanya membayar sekali; akses selamanya

### 4.3 Pencairan Dana (Withdrawal)

- Kreator mengajukan pencairan dari halaman Saldo & Penghasilan
- Minimum pencairan: **Rp 50.000**
- Data rekening bank harus sudah diisi di Settings
- Status pencairan: `pending` → `approved` → `paid` (atau `rejected`)
- Admin memproses pencairan melalui panel admin
- Riwayat pencairan lengkap tersedia di halaman Penghasilan

### 4.4 Sumber Penghasilan

Dashboard penghasilan menampilkan breakdown per sumber:
- **Artikel** — pembelian artikel premium
- **App/File** — pembelian file atau URL berbayar
- **Bundle** — pembelian paket bundle

### 4.5 Penghasilan Affiliate

Terpisah dari saldo utama, affiliate earnings dihitung dan ditampilkan:
- Dicatat di dashboard Affiliate
- Riwayat per referral dengan komisi yang diterima
- (Catatan: di versi saat ini, affiliate earnings terlihat di dashboard tapi belum diintegrasikan ke saldo withdrawal)

---

## 5. Sistem Gift

Gift adalah sistem tip/donasi dari pembaca ke kreator, berbeda dari pembelian konten.

### 5.1 Cara Kerja Gift dari Artikel

1. Pembaca membuka artikel Markdown
2. Di bagian bawah artikel, terdapat GiftPanel yang menampilkan daftar gift yang sudah dikirim dan opsi kirim baru
3. Pembaca memilih item gift (emoji + nama + harga) dari katalog
4. Pembaca opsional menulis pesan
5. Sistem membuat `SentGift` dengan status `pending_payment`
6. Pembaca melihat informasi rekening/QRIS kreator dan melakukan transfer manual
7. Kreator melihat gift masuk di dashboard Gifts
8. Kreator klik "Konfirmasi" atau "Tolak" untuk mengubah status gift
9. Jika dikonfirmasi (status `paid`), jumlah gift masuk ke `availableGifts` kreator

### 5.2 Gift Wallet (Transfer Kredit)

User bisa memiliki saldo gift kredit (`giftBalance`) untuk mengirim gift langsung tanpa transfer manual:

**Top-Up Gift Kredit:**
- Paket tersedia: Rp 10.000 / 25.000 / 50.000 / 100.000
- User pilih paket, sistem membuat `GiftTopUp` dengan status `pending`
- User transfer ke rekening platform (akun `hello@tweak.id`)
- Admin konfirmasi top-up dan kredit masuk ke `giftBalance` user
- Proses 1–24 jam setelah admin konfirmasi

**Transfer Gift Langsung:**
- Dari halaman Gift Wallet, user bisa kirim gift ke kreator lain hanya dengan memasukkan username
- Tidak perlu artikel tertentu — sistem menggunakan post pertama kreator sebagai referensi
- Langsung memotong `giftBalance` pengirim
- `SentGift` dibuat tanpa perlu konfirmasi pembayaran (karena kredit sudah di-deduct)

### 5.3 Pencairan Gift (Gift Redemption)

- Kreator mengajukan pencairan gift dari halaman "Gift Diterima"
- Minimum pencairan: **Rp 10.000**
- Sistem membuat `GiftRedemption` dengan status `pending`
- Admin memproses dalam 1–3 hari kerja
- Status: `pending` → `approved` → `paid` (atau `rejected`)
- `giftRedeemed` di profil kreator diupdate saat diproses admin

### 5.4 Katalog Gift

Admin mengelola katalog gift item dari panel admin:
- Setiap item memiliki emoji, nama, dan harga (IDR)
- Bisa diaktifkan/dinonaktifkan
- Diurutkan berdasarkan field `order`

### 5.5 Riwayat Gift

- **Sebagai kreator:** Halaman "Gift Diterima" menampilkan semua gift yang masuk, grafik per artikel (top 5), dan riwayat pencairan
- **Sebagai pembaca:** Halaman "Gift Wallet" menampilkan riwayat gift yang dikirim dan diterima dalam tab terpisah

---

## 6. Sistem Library & Folder

### 6.1 Library

Halaman Library (`/dashboard/library`) adalah pusat manajemen konten yang dimiliki user:

**Tab Pembelian** — semua konten yang sudah dibeli:
- Artikel yang dibeli (Purchase)
- File/App yang dibeli (FilePurchase)
- Bundle yang dibeli (BundlePurchase)

**Tab Tersimpan** — artikel yang di-bookmark (SavedPost):
- Artikel yang diklik tombol "Simpan"
- Bisa diakses ulang kapan saja

Setiap item menampilkan: badge type, judul, nama kreator, harga yang dibayar, tanggal, dan tombol langsung ke konten.

### 6.2 Folder (Collection)

User bisa mengorganisasi item library ke dalam folder:

- Buat folder dengan nama dan emoji pilihan (15 pilihan emoji tersedia)
- Rename dan hapus folder
- Tambahkan item ke satu atau lebih folder sekaligus
- Filter library berdasarkan folder aktif
- Setiap item menampilkan berapa folder tempat item tersebut berada

**Tipe item yang bisa dimasukkan ke folder:**
- `article` — referensi ke `Purchase.id`
- `file` — referensi ke `FilePurchase.id`
- `bundle` — referensi ke `BundlePurchase.id`
- `saved` — referensi ke `SavedPost.id`

---

## 7. Dashboard

Dashboard diakses melalui `/dashboard` dan memerlukan login. Layout menggunakan sidebar kiri (desktop) dan bottom navigation (mobile).

### 7.1 Halaman Dashboard (Overview)

`/dashboard`

Menampilkan ringkasan performa kreator:
- **Statistik utama:** Total views, total likes, jumlah post published, total revenue, affiliate earnings
- **Grafik 30 hari:** Bar chart pendapatan harian 30 hari terakhir (dengan tooltip interaktif)
- **Top Posts:** 6 artikel dengan views terbanyak, dengan progress bar relatif
- **Transaksi Terbaru:** 6 pembelian terbaru yang berhasil

### 7.2 Posts

`/dashboard/posts`

Tabel semua post milik kreator dengan:
- Filter tab: Semua / Artikel / Apps
- Kolom: Judul, Type, Status (Draft/Published), Views, Likes, Aksi
- Aksi: Baca (jika published), Edit, Publish/Unpublish, Hapus

### 7.3 New Post / Edit Post

`/dashboard/new` dan `/dashboard/edit/[slug]`

Form lengkap untuk membuat/mengedit post:
- Pilihan type: Artikel (Markdown) atau App (HTML)
- Editor Markdown dengan toolbar dan preview
- Upload cover image atau masukkan URL
- Pengaturan premium: toggle, harga, diskon
- Pengaturan affiliate: toggle aktifkan + slider rate
- Mode private
- Upload lampiran file (dengan pilihan gratis/berbayar dan harga per file)
- Tombol "Simpan Draft" dan "Publish"

### 7.4 Saldo & Penghasilan

`/dashboard/earnings`

Halaman finansial utama kreator:
- **Summary cards:** Total Penjualan, Fee Transaksi, Penghasilan Bersih, Saldo Tersedia
- **Grafik pertumbuhan:** Bar chart 30 hari dengan jumlah hari aktif
- **Sumber Penghasilan:** Breakdown Artikel / App-File / Bundle dalam persen dan nominal
- **Form pencairan:** Input jumlah (min Rp 50.000), tombol ajukan
- **Riwayat Pesanan:** Tab Berhasil / Menunggu, dengan badge type dan info pembayar
- **Riwayat Pencairan:** Status, nominal, info bank, catatan admin

### 7.5 Gift Diterima

`/dashboard/gifts`

Dashboard gift sebagai kreator:
- **Summary:** Total Gift Diterima, Sudah Dicairkan, Siap Dicairkan
- **Grafik Gift per Artikel:** Top 5 artikel berdasarkan total gift yang diterima
- **Riwayat gift masuk:** dengan avatar pengirim, tombol Konfirmasi/Tolak untuk status `pending_payment`
- **Form pencairan gift:** Input jumlah (min Rp 10.000), tombol ajukan
- **Riwayat pencairan gift:** Status redemption

### 7.6 Gift Wallet

`/dashboard/gift-wallet`

Dashboard gift sebagai pembaca/pengirim:
- **Summary:** Gift Kredit Tersedia, Jumlah Gift Dikirim, Total Dibelanjakan
- **Riwayat:** Tab Dikirim / Diterima dengan detail per transaksi
- **Kirim Gift Langsung:** Pilih kreator (username) + pilih gift item + pesan opsional
- **Isi Gift Kredit:** Pilih paket (Rp 10k/25k/50k/100k) → instruksi transfer → konfirmasi

### 7.7 Pesanan

`/dashboard/orders`

Manajemen pesanan masuk:
- Tab: Menunggu / Selesai
- Badge jumlah pesanan pending
- Setiap order menampilkan: judul konten, nama/WA pembeli, jumlah, tanggal, order ID
- Tombol "Aktifkan" untuk konfirmasi pembayaran sudah diterima
- Link WA langsung ke pembeli (jika nomor tercatat)

### 7.8 Bundle

`/dashboard/bundles`

Manajemen bundle:
- Daftar semua bundle dengan status, harga, jumlah item, jumlah pembelian
- Form buat/edit bundle (inline)
- Toggle publish/unpublish
- Hapus bundle

### 7.9 Kode Diskon

`/dashboard/discounts`

Manajemen kode diskon:
- Tabel semua kode: kode, tipe, nilai, pemakaian, berlaku sampai, status
- Form buat kode baru: kode, tipe (persen/nominal), nilai, max uses, expiry date
- Nonaktifkan kode

### 7.10 Library

`/dashboard/library`

Lihat bagian [Sistem Library & Folder](#6-sistem-library--folder).

### 7.11 Affiliate

`/dashboard/affiliate`

- Summary: Total Referral, Total Komisi
- Penjelasan cara kerja affiliate + contoh link
- Riwayat referral: judul artikel, kreator, komisi yang diterima, tanggal

### 7.12 Settings

`/dashboard/settings`

- **Profil:** Nama, status (80 karakter), bio, foto profil, slider affiliate rate
- **Ganti Password:** Password sekarang, baru, konfirmasi (min 8 karakter)
- **Transfer Bank:** Nama bank, nomor rekening, atas nama
- **QRIS:** Upload gambar QRIS (base64)
- **WA Responder:** Nomor WA + template pesan otomatis post-purchase

### 7.13 Admin Panel

Hanya untuk user dengan `role: 'admin'`:

**`/admin`** — Overview platform: total revenue, users, posts, transaksi terbaru, user terbaru

**`/admin/users`** — Manajemen user: ban/unban, promosikan ke admin

**`/admin/posts`** — Lihat semua post, hapus post

**`/admin/purchases`** — Lihat semua transaksi

**`/admin/withdrawals`** — Proses pengajuan pencairan dana: approve, mark as paid, reject, tambahkan catatan

**`/admin/gifts`** — Kelola katalog gift item: tambah, edit (harga, status aktif), dan konfirmasi top-up gift kredit user

---

## 8. API Endpoints

### Autentikasi
| Method | Path | Fungsi |
|--------|------|--------|
| POST | `/api/register` | Daftar akun baru (email + password) |

### Post
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/posts` | List post (query: author, published) |
| POST | `/api/posts` | Buat post baru |
| GET | `/api/posts/[slug]` | Ambil detail post |
| PUT | `/api/posts/[slug]` | Update post (konten, published, dsb) |
| DELETE | `/api/posts/[slug]` | Hapus post |
| POST | `/api/posts/[slug]/cover` | Upload/update cover image |
| GET/POST | `/api/posts/[slug]/purchase` | Cek/buat order pembelian artikel |
| POST | `/api/posts/[slug]/files/[fileId]/purchase` | Beli file terpisah dari artikel |
| POST | `/api/posts/[slug]/like` | Toggle like |
| POST | `/api/posts/[slug]/save` | Toggle simpan (bookmark) |
| POST | `/api/posts/[slug]/view` | Catat view (device-unique) |

### Dashboard
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/dashboard/posts` | List post milik kreator yang login |
| GET | `/api/dashboard/earnings` | Data penghasilan, transaksi, withdrawal |
| POST | `/api/dashboard/withdraw` | Ajukan pencairan saldo |
| PUT | `/api/dashboard/profile` | Update profil (nama, bio, bank, QRIS, WA) |
| PUT | `/api/dashboard/password` | Ganti password |
| GET | `/api/dashboard/files` | List file milik kreator |

### Orders
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/orders` | List pesanan masuk kreator (article + file + bundle) |
| POST | `/api/orders/activate` | Aktifkan/konfirmasi pesanan (type: article/file/bundle) |

### Bundles
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/bundles` | List bundle milik kreator |
| POST | `/api/bundles` | Buat bundle baru |
| GET | `/api/bundles/[slug]` | Detail bundle |
| PUT | `/api/bundles/[slug]` | Update bundle |
| DELETE | `/api/bundles/[slug]` | Hapus bundle |
| POST | `/api/bundles/[slug]/purchase` | Buat order pembelian bundle |

### Discounts
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/discount` | List kode diskon milik kreator |
| POST | `/api/discount` | Buat kode diskon baru |
| DELETE | `/api/discount` | Nonaktifkan kode diskon |

### Users
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/users/[username]` | Profil publik user |
| POST | `/api/users/[username]/follow` | Toggle follow/unfollow kreator |

### Collections (Library Folder)
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/collections` | List folder milik user |
| POST | `/api/collections` | Buat folder baru |
| PATCH | `/api/collections/[id]` | Rename folder |
| DELETE | `/api/collections/[id]` | Hapus folder |
| POST | `/api/collections/[id]/items` | Tambah item ke folder |
| DELETE | `/api/collections/[id]/items` | Hapus item dari folder |

### Comments
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/comments` | List komentar (by postId) |
| POST | `/api/comments` | Buat komentar baru |
| DELETE | `/api/comments/[id]` | Hapus komentar (author atau pemilik post) |

### Ratings
| Method | Path | Fungsi |
|--------|------|--------|
| POST | `/api/ratings` | Beri/update rating artikel (1–5) |

### Images
| Method | Path | Fungsi |
|--------|------|--------|
| POST | `/api/images` | Upload gambar untuk editor |
| GET | `/api/images/[id]` | Serve gambar dari database |

### Files
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/files/[fileId]` | Download/akses file (cek hak akses) |
| GET | `/api/app/[fileId]/check` | Cek apakah user punya akses ke file URL/link |

### Gifts
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/gifts` | List katalog gift item aktif |
| GET | `/api/gifts/balance` | Saldo gift user (sebagai kreator dan pembaca) |
| GET | `/api/gifts/history` | Riwayat gift dikirim dan diterima |
| POST | `/api/gifts/send` | Kirim gift dari artikel (buat SentGift) |
| PATCH | `/api/gifts/send` | Kreator konfirmasi/tolak gift masuk |
| POST | `/api/gifts/redeem` | Ajukan pencairan gift kreator |
| GET | `/api/gifts/topup` | Info paket top-up dan payment platform |
| POST | `/api/gifts/topup` | Buat request top-up gift kredit |
| POST | `/api/gifts/transfer` | Transfer gift langsung via kredit wallet |

### Feed & Lainnya
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/feed` | Feed publik dengan cursor pagination |
| GET | `/api/suggestions` | Saran kreator untuk diikuti |
| GET | `/api/og/[slug]` | Generate OG image card untuk artikel |

### Admin
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/admin/users` | List semua user (admin only) |
| GET | `/api/admin/posts` | List semua post (admin only) |
| GET | `/api/admin/withdrawals` | List semua withdrawal |
| PATCH | `/api/admin/withdrawals/[id]` | Update status withdrawal (approved/paid/rejected) |
| GET | `/api/admin/gifts` | List katalog gift |
| POST | `/api/admin/gifts` | Tambah gift item baru |
| PATCH/DELETE | `/api/admin/gifts/[id]` | Update/hapus gift item |
| GET | `/api/admin/gifts/topups` | List top-up request yang pending |

---

## 9. Database Schema

### User
Tabel pusat untuk semua akun (kreator dan pembaca adalah tipe user yang sama).

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | Primary key |
| email | String (unique) | Email login |
| username | String (unique) | Username publik |
| passwordHash | String? | Hash bcrypt (null jika OAuth) |
| name | String? | Nama tampilan |
| bio | String? | Bio profil |
| profilePic | String? (Text) | Base64 foto profil |
| role | String | `"user"` atau `"admin"` |
| banned | Boolean | Status ban |
| verified | Boolean | Status verifikasi |
| status | String? | Status pendek (maks 80 char) |
| affiliateRate | Int | Default 20% komisi affiliate |
| bankName/bankAccount/bankHolder | String? | Info rekening untuk menerima pembayaran |
| qrisImage | String? (Text) | Base64 gambar QRIS |
| waNumber | String? | Nomor WhatsApp untuk WA Responder |
| waMessage | String? | Template pesan WA otomatis |
| giftBalance | Int | Saldo gift kredit (untuk transfer) |
| giftRedeemed | Int | Total gift yang sudah dicairkan kreator |

### Post
Konten utama platform (artikel atau app).

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | String (cuid) | Primary key |
| slug | String (unique) | URL slug |
| title | String | Judul |
| description | String? | Deskripsi pendek |
| type | String | `"markdown"` atau `"html"` |
| content | String (Text) | Isi konten |
| category | String? | Kategori |
| tags | String[] | Array tag |
| published | Boolean | Status publish |
| isPrivate | Boolean | Hanya terlihat author |
| publishedAt | DateTime? | Waktu publish |
| viewCount | Int | Jumlah view unik |
| likeCount | Int | Jumlah like |
| coverImage | String? (Text) | Base64 atau URL cover |
| isPremium | Boolean | Apakah berbayar |
| price | Int? | Harga IDR |
| discount | Int? | Diskon % di level artikel |
| affiliateEnabled | Boolean | Apakah affiliate aktif |
| affiliateRate | Int | Komisi affiliate % |

### PostFile
Lampiran file atau URL yang dilekatkan ke post.

| Field | Tipe | Keterangan |
|-------|------|------------|
| postId | String | FK ke Post |
| name | String | Nama file |
| mimeType | String | MIME type atau `"url/link"` |
| size | Int | Ukuran bytes (0 untuk URL) |
| data | String? (Text) | Base64 file (null untuk URL) |
| url | String? | URL eksternal (null untuk file) |
| isFree | Boolean | Gratis atau berbayar |
| price | Int? | Harga file terpisah (IDR) |
| discount | Int? | Diskon % untuk file ini |

### Purchase / FilePurchase / BundlePurchase
Tiga tabel pembelian terpisah untuk tiga jenis konten.

Semua memiliki:
- `userId`, `amount`, `status` (`pending` / `paid`), `orderId` (UUID unique)
- `payerName`, `payerWa` — info pembeli yang diisi saat checkout
- `refCode` — username afiliator (hanya di Purchase)
- `serviceFee` — legacy field (hanya di Purchase)
- Constraint unique per user per konten (satu user tidak bisa beli dua kali)

### Discount
Kode diskon yang dibuat kreator.

- `code` unique, `type` (percent/fixed), `value`
- `maxUses` null = tidak terbatas, `usedCount` untuk tracking
- `expiresAt`, `active`
- `postId` null = berlaku untuk semua artikel kreator

### Bundle / BundleItem
Bundle adalah paket beberapa konten.
- `BundleItem` bisa berisi Post atau PostFile (salah satu)
- `order` untuk pengurutan tampilan

### Collection / CollectionItem
Folder library user.
- `Collection` memiliki nama dan emoji
- `CollectionItem` referensi item dengan `itemType` dan `itemId`
- itemType bisa: `"article"` | `"file"` | `"bundle"` | `"saved"`

### Follow / Like / SavedPost / PostView
- `Follow`: relasi follower-following antar user
- `Like`: like user pada post (unique per user per post)
- `SavedPost`: bookmark user pada post (unique per user per post)
- `PostView`: view unik per `deviceId` per post

### Comment / Rating
- `Comment`: komentar user di post
- `Rating`: rating 1–5 dari user untuk post (unique per user per post)

### Gift System

**GiftItem** — katalog item gift (emoji, nama, harga)

**SentGift** — transaksi gift
- Referensi sender, receiver, post, dan giftItem
- `status`: `pending_payment` → `paid` (kreator konfirmasi) atau `rejected`

**GiftTopUp** — request top-up gift kredit
- `status`: `pending` → `confirmed` (admin konfirmasi) atau `rejected`

**GiftRedemption** — request pencairan gift oleh kreator
- `status`: `pending` → `approved` → `paid` atau `rejected`

### Withdrawal
Pengajuan pencairan saldo utama oleh kreator.
- Menyimpan snapshot info bank saat pengajuan
- `status`: `pending` → `approved` → `paid` atau `rejected`
- `adminNote` untuk catatan dari admin

---

## 10. Tech Stack

### Framework & Runtime
- **Next.js 15** (App Router) — framework utama, server components + client components
- **TypeScript** — seluruh codebase
- **Node.js** — runtime

### Database
- **PostgreSQL** — database utama
- **Prisma 5** — ORM untuk semua query database
- Koneksi via `DATABASE_URL` environment variable

### Autentikasi
- **NextAuth.js (next-auth)** — manajemen session
- Provider: `credentials` (email + password dengan bcrypt) dan `google` (OAuth)
- Session strategy: database sessions (tabel `Session` dan `Account`)

### Storage
- Tidak ada storage eksternal (S3, Cloudinary, dll)
- Semua file, gambar, foto profil, QRIS disimpan sebagai **base64** di kolom `Text` PostgreSQL
- Gambar inline di editor disimpan di tabel `Image`

### Deployment
- **Railway** — platform deployment (terlihat dari konfigurasi header `x-forwarded-host`)
- Environment variables: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Google OAuth credentials

### Frontend
- React 19 (via Next.js 15)
- Semua styling menggunakan **inline styles** (tidak ada Tailwind atau CSS framework)
- Beberapa class CSS di `globals.css` untuk layout utama (dashboard shell, grid)

### Utilities
- **bcryptjs** — hash password
- **randomUUID** (Node built-in) — generate order ID

---

*Dokumentasi ini mencerminkan kondisi kode pada 31 Mei 2026. Semua fitur yang didokumentasikan sudah ada dalam kode aktual di repository.*

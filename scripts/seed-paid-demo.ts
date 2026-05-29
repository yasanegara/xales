import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const paidProducts = [
  {
    slug: 'panduan-monetisasi-konten-digital',
    title: 'Panduan Lengkap Monetisasi Konten Digital untuk Kreator Indonesia',
    description: 'Strategi terbukti menghasilkan pendapatan dari artikel, e-book, template, dan web app — lengkap dengan contoh nyata kreator Indonesia.',
    type: 'markdown',
    isPremium: true,
    price: 49000,
    category: 'Bisnis & Monetisasi',
    tags: ['monetisasi', 'konten digital', 'kreator', 'pendapatan'],
    coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=630&fit=crop',
    content: `# Panduan Lengkap Monetisasi Konten Digital

## Pendahuluan

Monetisasi konten digital adalah proses mengubah pengetahuan, keahlian, dan kreativitas kamu menjadi sumber pendapatan yang berkelanjutan.

## Bab 1: Model Monetisasi yang Terbukti

### 1.1 Pay-per-content
Pembaca membayar per artikel atau per akses...

### 1.2 Subscription
Model berlangganan memberikan pendapatan yang lebih stabil...

### 1.3 Bundling
Menjual beberapa produk dalam satu paket dengan harga lebih terjangkau...

## Bab 2: Menentukan Harga yang Tepat

Penetapan harga adalah seni dan sains. Terlalu murah = tidak dihargai. Terlalu mahal = tidak ada yang beli...

## Bab 3: Strategi Pemasaran Konten Premium

Konten premium tidak akan terjual sendiri. Kamu perlu strategi pemasaran yang tepat...

## Kesimpulan

Monetisasi konten digital membutuhkan konsistensi, nilai yang nyata, dan strategi yang tepat.`,
  },
  {
    slug: 'template-email-marketing-kreator',
    title: '30 Template Email Marketing untuk Kreator Digital',
    description: 'Koleksi template email yang sudah terbukti — untuk launch produk, nurturing subscriber, upsell, dan re-engagement. Tinggal copy-paste dan sesuaikan.',
    type: 'markdown',
    isPremium: true,
    price: 29000,
    category: 'Template & Tools',
    tags: ['email marketing', 'template', 'kreator', 'copywriting'],
    coverImage: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1200&h=630&fit=crop',
    content: `# 30 Template Email Marketing untuk Kreator

## Template 1: Email Selamat Datang

**Subject:** Selamat datang di [Nama Platform]! Ini yang perlu kamu tahu

Halo [Nama],

Selamat datang dan terima kasih sudah bergabung!...

## Template 2: Launch Produk Baru

**Subject:** [BARU] [Nama Produk] — Tersedia sekarang untuk [X] orang pertama

Halo [Nama],

Hari ini adalah hari yang saya tunggu-tunggu untuk bagikan ke kamu...

## Template 3: Follow-up Setelah Pembelian

**Subject:** Terima kasih! Ini akses ke [Nama Produk] kamu

Halo [Nama],

Pembelian kamu berhasil diproses...`,
  },
  {
    slug: 'kalkulator-harga-konten-digital',
    title: 'Kalkulator Harga Konten Digital — Berapa Harga yang Tepat?',
    description: 'Web app interaktif untuk menghitung harga ideal konten digital kamu berdasarkan waktu produksi, nilai pasar, dan target audience.',
    type: 'html',
    isPremium: true,
    price: 19000,
    category: 'Tools & App',
    tags: ['kalkulator', 'harga', 'konten digital', 'tools'],
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kalkulator Harga Konten Digital</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7f5f2; min-height: 100vh; padding: 2rem 1rem; }
  .container { max-width: 600px; margin: 0 auto; }
  h1 { font-size: 1.75rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.5rem; }
  .subtitle { color: #6e6a65; margin-bottom: 2rem; }
  .card { background: #fff; border: 1px solid #e5e0d8; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
  label { display: block; font-size: 0.875rem; font-weight: 600; color: #3d3a36; margin-bottom: 0.375rem; }
  input, select { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #e5e0d8; border-radius: 8px; font-size: 1rem; outline: none; }
  .result { background: #1a1a1a; color: #f7f5f2; border-radius: 12px; padding: 2rem; text-align: center; margin-top: 1.5rem; }
  .price { font-size: 3rem; font-weight: 800; }
  .btn { background: #1a1a1a; color: #fff; border: none; padding: 0.875rem 2rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; width: 100%; margin-top: 1rem; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
</style>
</head>
<body>
<div class="container">
  <h1>🧮 Kalkulator Harga</h1>
  <p class="subtitle">Hitung harga ideal konten digital kamu</p>
  <div class="card">
    <div class="grid">
      <div>
        <label>Waktu Produksi (jam)</label>
        <input type="number" id="hours" value="10" min="1">
      </div>
      <div>
        <label>Nilai Jasa per Jam (Rp)</label>
        <input type="number" id="rate" value="150000" step="10000">
      </div>
    </div>
    <br>
    <label>Jenis Konten</label>
    <select id="type">
      <option value="1.0">Artikel / Blog Post</option>
      <option value="1.3">E-book / Panduan</option>
      <option value="1.5">Course / Video</option>
      <option value="2.0">Template / Tools</option>
      <option value="2.5">Web App / Software</option>
    </select>
    <br>
    <label>Target Market</label>
    <select id="market">
      <option value="0.8">Pelajar / Mahasiswa</option>
      <option value="1.0" selected>Profesional Muda</option>
      <option value="1.3">Profesional Senior</option>
      <option value="1.5">Bisnis / Perusahaan</option>
    </select>
    <button class="btn" onclick="calculate()">Hitung Harga</button>
  </div>
  <div class="result" id="result" style="display:none">
    <div style="font-size:0.875rem;opacity:0.7;margin-bottom:0.5rem">Harga yang Disarankan</div>
    <div class="price" id="priceResult"></div>
    <div style="opacity:0.7;margin-top:0.5rem">IDR</div>
    <div style="margin-top:1rem;font-size:0.875rem;opacity:0.8" id="breakdown"></div>
  </div>
</div>
<script>
function formatIDR(n) { return new Intl.NumberFormat('id-ID').format(Math.round(n/1000)*1000) }
function calculate() {
  const hours = parseFloat(document.getElementById('hours').value) || 0
  const rate = parseFloat(document.getElementById('rate').value) || 0
  const typeM = parseFloat(document.getElementById('type').value)
  const marketM = parseFloat(document.getElementById('market').value)
  const base = hours * rate
  const adjusted = base * typeM * marketM
  document.getElementById('priceResult').textContent = 'Rp ' + formatIDR(adjusted)
  document.getElementById('breakdown').textContent = 'Dasar: Rp ' + formatIDR(base) + ' × ' + typeM + ' (jenis) × ' + marketM + ' (market)'
  document.getElementById('result').style.display = 'block'
}
</script>
</body>
</html>`,
  },
  {
    slug: 'rahasia-pertumbuhan-audiens-organik',
    title: 'Rahasia Pertumbuhan Audiens Organik: 0 → 10.000 Pembaca dalam 6 Bulan',
    description: 'Strategi lengkap membangun audiens organik tanpa ikberbayar — SEO konten, distribusi, repurposing, dan community building yang terbukti.',
    type: 'markdown',
    isPremium: true,
    price: 59000,
    category: 'Bisnis & Monetisasi',
    tags: ['audiens', 'pertumbuhan organik', 'SEO', 'konten'],
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop',
    content: `# Rahasia Pertumbuhan Audiens Organik

## Bab 1: Fondasi — Kenapa Kebanyakan Kreator Gagal Tumbuh

Mayoritas kreator fokus pada KONTEN padahal seharusnya fokus pada DISTRIBUSI...

## Bab 2: SEO untuk Konten Kreator

SEO bukan hanya untuk website korporat. Kreator individu bisa memanfaatkan SEO dengan efektif...

## Bab 3: Strategi Distribusi Multi-Platform

Satu konten, banyak platform. Cara repurpose konten secara efisien...

## Bab 4: Community Building

Audiens setia lebih berharga dari audiens besar. Cara membangun komunitas yang engaged...`,
  },
]

async function main() {
  const tweakUser = await db.user.findUnique({ where: { email: 'hello@tweak.id' } })
  if (!tweakUser) {
    console.error('User hello@tweak.id not found. Run seed-tweak.ts first.')
    process.exit(1)
  }

  for (const product of paidProducts) {
    const existing = await db.post.findUnique({ where: { slug: product.slug } })
    if (existing) {
      console.log(`Skip: ${product.slug} (already exists)`)
      continue
    }

    await db.post.create({
      data: {
        ...product,
        authorId: tweakUser.id,
        published: true,
        publishedAt: new Date(),
      },
    })
    console.log(`Created: ${product.title} — Rp ${product.price?.toLocaleString('id-ID')}`)
  }

  console.log('\nDone. Paid demo products seeded.')
}

main().catch(console.error).finally(() => db.$disconnect())

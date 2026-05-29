export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { db } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Katalog Produk',
  description: 'Artikel dan web app premium dari para kreator Tweak. Harga dalam IDR.',
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default async function ProdukPage() {
  const posts = await db.post.findMany({
    where: { published: true, isPrivate: false, isPremium: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, description: true,
      type: true, price: true, coverImage: true, category: true, viewCount: true,
      author: { select: { username: true, name: true, profilePic: true } },
    },
  })

  const freeCount = await db.post.count({ where: { published: true, isPrivate: false, isPremium: false } })

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: '0.625rem' }}>
            Katalog Produk
          </h1>
          <p style={{ fontSize: '1rem', color: '#6e6a65', lineHeight: 1.6 }}>
            Artikel dan web app dari kreator Tweak. Tersedia konten premium berbayar dan konten gratis.
          </p>
        </div>

        {/* Platform info — for Midtrans / compliance */}
        <div style={{ background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9690', marginBottom: '0.25rem' }}>Nama Platform</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>Tweak</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9690', marginBottom: '0.25rem' }}>Jenis Produk</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>Konten Digital (Artikel & Web App)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9690', marginBottom: '0.25rem' }}>Mata Uang</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>IDR (Rupiah)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9690', marginBottom: '0.25rem' }}>Produk Premium</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>{posts.length} produk</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9690', marginBottom: '0.25rem' }}>Konten Gratis</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>{freeCount} konten</div>
          </div>
        </div>

        {/* Category legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#eff6ff', color: '#2563eb', fontSize: '0.8125rem', fontWeight: 600, padding: '0.35rem 0.875rem', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
            📄 Artikel
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#ecfdf5', color: '#059669', fontSize: '0.8125rem', fontWeight: 600, padding: '0.35rem 0.875rem', borderRadius: '20px', border: '1px solid #86efac' }}>
            ⚡ Web App
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#fef3c7', color: '#b45309', fontSize: '0.8125rem', fontWeight: 600, padding: '0.35rem 0.875rem', borderRadius: '20px', border: '1px solid #fcd34d' }}>
            ★ Premium
          </span>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9c9690' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
            <p style={{ fontSize: '1rem' }}>Belum ada produk premium. Kreator sedang mempersiapkan konten.</p>
            <Link href="/" style={{ display: 'inline-block', marginTop: '1.25rem', background: '#1a1a1a', color: '#f7f5f2', padding: '0.625rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>
              Lihat Konten Gratis
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {posts.map((post) => {
              const authorName = post.author.name ?? `@${post.author.username}`
              return (
                <Link
                  key={post.id}
                  href={`/@${post.author.username}/${post.slug}`}
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', overflow: 'hidden', transition: 'box-shadow 0.15s' }}
                >
                  {/* Cover */}
                  <div style={{ aspectRatio: '16/9', background: post.type === 'html' ? 'linear-gradient(135deg, #1e3a5f, #0f2340)' : '#f0ede8', overflow: 'hidden', position: 'relative' }}>
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                        {post.type === 'html' ? '⚡' : '📄'}
                      </div>
                    )}
                    {/* Type badge */}
                    <span style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', background: post.type === 'html' ? '#059669' : '#2563eb', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {post.type === 'html' ? 'App' : 'Artikel'}
                    </span>
                    {/* Premium badge */}
                    <span style={{ position: 'absolute', top: '0.625rem', right: '0.625rem', background: '#b45309', color: '#fef3c7', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      ★ Premium
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1rem 1.125rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {post.category && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
                        {post.category}
                      </span>
                    )}
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </h2>
                    {post.description && (
                      <p style={{ fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.5, marginBottom: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.description}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid #f0ede8' }}>
                      {/* Author */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: '#f0ede8', border: '1px solid #e5e0d8', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#6e6a65', flexShrink: 0 }}>
                          {post.author.profilePic
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={post.author.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (post.author.name?.[0] ?? post.author.username[0]).toUpperCase()
                          }
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#6e6a65' }}>{authorName}</span>
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a1a' }}>
                          {post.price ? formatIDR(post.price) : 'Premium'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>IDR</div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e0d8', display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#9c9690' }}>
          <span>💳 Pembayaran diproses oleh <strong style={{ color: '#1a1a1a' }}>Midtrans</strong></span>
          <span>🔒 Transaksi aman & terenkripsi</span>
          <span>📦 Akses instan setelah pembayaran</span>
          <span>🧾 Semua harga dalam <strong style={{ color: '#1a1a1a' }}>IDR (Rupiah Indonesia)</strong></span>
        </div>
      </div>
    </>
  )
}

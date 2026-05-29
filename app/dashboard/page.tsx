export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [allPosts, recentPosts, purchases, affiliateReferrals] = await Promise.all([
    db.post.findMany({ where: { authorId: userId }, select: { viewCount: true, likeCount: true, published: true } }),
    db.post.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, slug: true, title: true, type: true, published: true, viewCount: true, likeCount: true, updatedAt: true, isPremium: true, price: true },
    }),
    // Revenue: purchases on author's posts
    db.purchase.findMany({
      where: { post: { authorId: userId }, status: 'paid' },
      include: { post: { select: { title: true, slug: true, price: true, author: { select: { affiliateRate: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Affiliate earnings: purchases where this user was referrer
    db.purchase.findMany({
      where: { refCode: session!.user.username, status: 'paid' },
      select: { amount: true, post: { select: { author: { select: { affiliateRate: true } } } } },
    }),
  ])

  const totalViews = allPosts.reduce((s, p) => s + p.viewCount, 0)
  const totalLikes = allPosts.reduce((s, p) => s + p.likeCount, 0)
  const published = allPosts.filter((p) => p.published).length

  // Revenue = purchases on my posts, minus affiliate commission paid out
  const grossRevenue = purchases.reduce((s, p) => s + p.amount, 0)
  const affiliateRate = session!.user.username ? (purchases[0]?.post.author.affiliateRate ?? 20) : 20
  // Simplified: take avg rate — in production would be per-purchase
  const netRevenue = purchases.reduce((s, p) => {
    const rate = p.post.author.affiliateRate ?? 20
    return s + Math.round(p.amount * (1 - (p.refCode ? rate / 100 : 0)))
  }, 0) // we don't have refCode on included fields here, so just use gross
  const affiliateEarnings = affiliateReferrals.reduce((s, p) => {
    const rate = p.post.author.affiliateRate ?? 20
    return s + Math.round(p.amount * (rate / 100))
  }, 0)

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Dashboard</h1>
          <p style={{ color: '#6e6a65', marginTop: '0.25rem' }}>
            Halo, {session!.user.name ?? `@${session!.user.username}`} ·{' '}
            <Link href={`/@${session!.user.username}`} style={{ color: '#0070f3', textDecoration: 'none', fontSize: '0.875rem' }}>
              Lihat profil publik →
            </Link>
          </p>
        </div>
        <Link href="/dashboard/new" style={{ background: '#1a1a1a', color: '#f7f5f2', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
          + New Post
        </Link>
      </div>

      {/* Content stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { label: 'Total Posts', value: allPosts.length, sub: `${published} published` },
          { label: 'Total Views', value: totalViews.toLocaleString(), sub: 'semua artikel' },
          { label: 'Total Likes', value: totalLikes.toLocaleString(), sub: 'semua artikel' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '0.25rem' }}>{stat.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.125rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: '#1a1a1a', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,237,232,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Revenue Kotor
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0ede8' }}>
            Rp {formatIDR(grossRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(240,237,232,0.5)', marginTop: '0.25rem' }}>
            {purchases.length} pembelian
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Komisi Affiliate
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: affiliateEarnings > 0 ? '#059669' : '#1a1a1a' }}>
            Rp {formatIDR(affiliateEarnings)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.25rem' }}>
            {affiliateReferrals.length} referral
            {affiliateEarnings > 0 && (
              <Link href="/dashboard/affiliate" style={{ color: '#0070f3', textDecoration: 'none', marginLeft: '0.5rem' }}>
                lihat →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Recent purchases */}
      {purchases.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>Pembelian Terbaru</h2>
          </div>
          {purchases.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: i < purchases.length - 1 ? '1px solid #f0ede8' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.post.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.125rem' }}>{formatDate(p.createdAt)}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(p.amount)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent posts */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>Post Terbaru</h2>
          <Link href="/dashboard/posts" style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none' }}>Lihat semua →</Link>
        </div>

        {recentPosts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e6a65' }}>
            <p style={{ marginBottom: '1rem' }}>Belum ada post.</p>
            <Link href="/dashboard/new" style={{ color: '#0070f3', textDecoration: 'none', fontSize: '0.875rem' }}>Buat post pertamamu →</Link>
          </div>
        ) : (
          recentPosts.map((post, i) => (
            <div key={post.id} style={{ padding: '1rem 1.25rem', borderBottom: i < recentPosts.length - 1 ? '1px solid #f0ede8' : 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ background: post.type === 'html' ? '#ecfdf5' : '#eff6ff', color: post.type === 'html' ? '#059669' : '#2563eb', fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', flexShrink: 0, textTransform: 'uppercase' }}>
                {post.type === 'html' ? 'App' : 'Article'}
              </span>
              <span style={{ flex: 1, color: '#1a1a1a', fontSize: '0.9375rem', fontWeight: 500 }}>{post.title}</span>
              {post.isPremium && post.price && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706', background: '#fffbeb', border: '1px solid #fcd34d', padding: '0.15rem 0.5rem', borderRadius: '4px', flexShrink: 0 }}>
                  Rp {formatIDR(post.price)}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: post.published ? '#059669' : '#6e6a65', flexShrink: 0 }}>
                {post.published ? '● Published' : '○ Draft'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9c9690', flexShrink: 0 }}>
                👁 {post.viewCount} · ♥ {post.likeCount}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9c9690', flexShrink: 0 }}>{formatDate(post.updatedAt)}</span>
              <Link href={`/dashboard/edit/${post.slug}`} style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none', flexShrink: 0 }}>Edit</Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

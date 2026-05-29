export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Affiliate · XALES' }

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default async function AffiliatePage() {
  const session = await getServerSession(authOptions)

  // Purchases where this user was the referrer
  const referrals = await db.purchase.findMany({
    where: { refCode: session!.user.username, status: 'paid' },
    include: { post: { select: { title: true, slug: true, author: { select: { name: true, username: true, affiliateRate: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Calculate earnings
  const totalEarnings = referrals.reduce((sum, p) => {
    const rate = p.post.author.affiliateRate ?? 20
    return sum + Math.round(p.amount * (rate / 100))
  }, 0)

  const myUsername = session!.user.username!
  const myAffiliateUrl = `https://xales.id/@${myUsername}`

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Affiliate</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Dapatkan komisi setiap kali ada pembelian melalui link-mu
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Referral', value: referrals.length },
          { label: 'Total Komisi', value: `Rp ${formatIDR(totalEarnings)}` },
          { label: 'Konversi', value: referrals.length > 0 ? '—' : '0' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Affiliate link info */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>Cara Kerja Affiliate XALES</div>
        <div style={{ fontSize: '0.875rem', color: '#6e6a65', lineHeight: 1.7 }}>
          <p>1. Klik tombol <strong>↗ Bagikan</strong> di artikel manapun saat kamu login</p>
          <p>2. Link yang di-copy otomatis menyertakan <code style={{ background: '#f0ede8', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>?ref={myUsername}</code></p>
          <p>3. Jika ada yang membeli melalui link-mu, kamu dapat komisi sesuai yang ditetapkan penulis</p>
        </div>
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f7f5f2', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6e6a65', flex: 1, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {myAffiliateUrl}?ref={myUsername}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>contoh link</span>
        </div>
      </div>

      {/* Referral history */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e0d8' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>Riwayat Referral</h2>
        </div>
        {referrals.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e6a65' }}>
            <p>Belum ada referral.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Mulai bagikan artikel premium ke temanmu!</p>
          </div>
        ) : (
          referrals.map((p, i) => {
            const rate = p.post.author.affiliateRate ?? 20
            const commission = Math.round(p.amount * (rate / 100))
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < referrals.length - 1 ? '1px solid #f0ede8' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.post.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.2rem' }}>
                    oleh {p.post.author.name ?? `@${p.post.author.username}`} · {formatDate(p.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#059669' }}>+Rp {formatIDR(commission)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{rate}% dari Rp {formatIDR(p.amount)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

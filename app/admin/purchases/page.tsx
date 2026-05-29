export const dynamic = 'force-dynamic'

import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Purchases · Admin · tweak' }

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default async function AdminPurchasesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1')
  const limit = 30

  const [purchases, total, agg] = await Promise.all([
    db.purchase.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { username: true, name: true } },
        post: { select: { title: true, slug: true, author: { select: { username: true } } } },
      },
    }),
    db.purchase.count(),
    db.purchase.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
  ])

  const pages = Math.ceil(total / limit)
  const totalRevenue = agg._sum.amount ?? 0
  const paidCount = await db.purchase.count({ where: { status: 'paid' } })

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Purchases</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>{total} transaksi · Rp {formatIDR(totalRevenue)} total revenue</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Revenue', value: `Rp ${formatIDR(totalRevenue)}`, accent: true },
          { label: 'Transaksi Sukses', value: paidCount },
          { label: 'Total Transaksi', value: total },
        ].map((s) => (
          <div key={s.label} style={{ background: s.accent ? '#1a1a1a' : '#ffffff', border: `1px solid ${s.accent ? '#2a2724' : '#e5e0d8'}`, borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.accent ? '#f0ede8' : '#1a1a1a' }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', color: s.accent ? 'rgba(240,237,232,0.6)' : '#6e6a65', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto auto auto', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #e5e0d8', fontSize: '0.75rem', color: '#9c9690', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Pembeli</span><span>Artikel</span><span>Penulis</span><span>Nominal</span><span>Status</span><span>Tanggal</span>
        </div>
        {purchases.map((p, i) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto auto auto', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: i < purchases.length - 1 ? '1px solid #f0ede8' : 'none', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>@{p.user.username}</span>
            <span style={{ fontSize: '0.8125rem', color: '#6e6a65', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.post.title}</span>
            <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>@{p.post.author.username}</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap' }}>Rp {formatIDR(p.amount)}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.status === 'paid' ? '#059669' : p.status === 'pending' ? '#d97706' : '#dc2626', whiteSpace: 'nowrap' }}>
              {p.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9c9690', whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</span>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/admin/purchases?page=${p}`}
              style={{ width: '36px', height: '36px', borderRadius: '6px', border: `1px solid ${page === p ? '#1a1a1a' : '#e5e0d8'}`, background: page === p ? '#1a1a1a' : '#ffffff', color: page === p ? '#f7f5f2' : '#6e6a65', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontWeight: page === p ? 600 : 400 }}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

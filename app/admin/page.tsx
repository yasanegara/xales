export const dynamic = 'force-dynamic'

import { db } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import WithdrawalActions from './WithdrawalActions'

export const metadata = { title: 'Admin · Tweak' }

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? '#1a1a1a' : '#ffffff', border: `1px solid ${accent ? '#2a2724' : '#e5e0d8'}`, borderRadius: '10px', padding: '1.25rem' }}>
      <div style={{ fontSize: '1.875rem', fontWeight: 700, color: accent ? '#f0ede8' : '#1a1a1a' }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: accent ? 'rgba(240,237,232,0.6)' : '#6e6a65', marginTop: '0.25rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: accent ? 'rgba(240,237,232,0.4)' : '#9c9690', marginTop: '0.125rem' }}>{sub}</div>}
    </div>
  )
}

export default async function AdminPage() {
  const [
    totalUsers,
    bannedUsers,
    adminUsers,
    totalPosts,
    publishedPosts,
    totalPurchases,
    revenueAgg,
    newUsersToday,
    recentUsers,
    recentPurchases,
    pendingWithdrawals,
    pendingWithdrawalAgg,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { banned: true } }),
    db.user.count({ where: { role: 'admin' } }),
    db.post.count(),
    db.post.count({ where: { published: true } }),
    db.purchase.count({ where: { status: 'paid' } }),
    db.purchase.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    db.user.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, username: true, name: true, email: true, role: true, banned: true, createdAt: true, _count: { select: { posts: true } } },
    }),
    db.purchase.findMany({
      where: { status: 'paid' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { username: true, name: true } },
        post: { select: { title: true, author: { select: { username: true } } } },
      },
    }),
    db.withdrawal.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 10,
      include: { user: { select: { username: true, name: true } } },
    }),
    db.withdrawal.aggregate({ where: { status: 'pending' }, _sum: { amount: true } }),
  ])

  const totalRevenue = revenueAgg._sum.amount ?? 0
  const totalPendingWithdraw = pendingWithdrawalAgg._sum.amount ?? 0

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Overview</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>Platform statistics at a glance</p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Revenue" value={`Rp ${formatIDR(totalRevenue)}`} sub={`${totalPurchases} transaksi`} accent />
        <StatCard label="Total Users" value={totalUsers} sub={`+${newUsersToday} hari ini`} />
        <StatCard label="Total Posts" value={totalPosts} sub={`${publishedPosts} published`} />
        <StatCard label="Pencairan Pending" value={pendingWithdrawals.length} sub={pendingWithdrawals.length > 0 ? `Rp ${formatIDR(totalPendingWithdraw)}` : 'Tidak ada'} />
        <StatCard label="Banned Users" value={bannedUsers} />
      </div>

      {/* Pending withdrawals */}
      <div style={{ background: '#ffffff', border: `1px solid ${pendingWithdrawals.length > 0 ? '#fde68a' : '#e5e0d8'}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
            Permintaan Pencairan
            {pendingWithdrawals.length > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, background: '#fef3c7', color: '#d97706', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>
                {pendingWithdrawals.length} PENDING
              </span>
            )}
          </h2>
          <Link href="/admin/withdrawals" style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none' }}>Kelola →</Link>
        </div>
        <WithdrawalActions withdrawals={pendingWithdrawals} totalPending={totalPendingWithdraw} />
      </div>

      {/* Two column: recent users + recent purchases */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent users */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>User Terbaru</h2>
            <Link href="/admin/users" style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          {recentUsers.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: i < recentUsers.length - 1 ? '1px solid #f0ede8' : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#6e6a65', flexShrink: 0 }}>
                {(u.name?.[0] ?? u.username[0]).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a' }}>@{u.username}</div>
                <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{u.email}</div>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                {u.role === 'admin' && <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#d97706', padding: '0.15rem 0.4rem', borderRadius: '3px', fontWeight: 600 }}>ADMIN</span>}
                {u.banned && <span style={{ fontSize: '0.65rem', background: '#fef2f2', color: '#dc2626', padding: '0.15rem 0.4rem', borderRadius: '3px', fontWeight: 600 }}>BANNED</span>}
                <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>{u._count.posts}p</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent purchases */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>Transaksi Terbaru</h2>
            <Link href="/admin/purchases" style={{ fontSize: '0.8125rem', color: '#0070f3', textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          {recentPurchases.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9c9690', fontSize: '0.875rem' }}>Belum ada transaksi</div>
          ) : recentPurchases.map((p, i) => (
            <div key={p.id} style={{ padding: '0.875rem 1.25rem', borderBottom: i < recentPurchases.length - 1 ? '1px solid #f0ede8' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{p.post.title}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669', flexShrink: 0 }}>Rp {formatIDR(p.amount)}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                @{p.user.username} → @{p.post.author.username} · {formatDate(p.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

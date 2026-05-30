'use client'

import { useState } from 'react'
import Link from 'next/link'

function fmt(n: number) { return new Intl.NumberFormat('id-ID').format(n) }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

interface Props {
  user: { name?: string | null; username: string }
  stats: {
    totalViews: number; totalLikes: number; published: number
    totalPosts: number; totalRevenue: number; affiliateEarnings: number
  }
  daily30: { date: string; amount: number }[]
  recentPurchases: {
    id: string; amount: number; payerName?: string | null
    postTitle: string; postSlug: string; createdAt: string
  }[]
  topPosts: {
    id: string; slug: string; title: string; type: string; published: boolean
    viewCount: number; likeCount: number; isPremium: boolean; price?: number | null
    updatedAt: string; barPct: number
  }[]
}

// ── Mini sparkline SVG ────────────────────────────────────────────────
function Sparkline({ data, color = '#0070f3' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  const W = 120, H = 36
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (v / max) * H * 0.85
    return `${x},${y}`
  }).join(' ')
  const filled = `${pts} ${W},${H} 0,${H}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={filled} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, sparkData, color, icon }: {
  label: string; value: string; sub: string
  sparkData?: number[]; color: string; icon: string
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '18px',
      padding: '1.375rem 1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Color accent strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '18px 18px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.375rem' }}>{sub}</div>
        </div>
        <div style={{ fontSize: '1.5rem', opacity: 0.85 }}>{icon}</div>
      </div>

      {sparkData && (
        <div style={{ marginTop: '0.25rem' }}>
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────
export default function DashboardStats({ user, stats, daily30, recentPurchases, topPosts }: Props) {
  const [activeTab, setActiveTab] = useState<'posts' | 'activity'>('posts')

  const sparkAmounts = daily30.map(d => d.amount)
  const activeDays   = daily30.filter(d => d.amount > 0).length
  const revenueThisMonth = daily30.reduce((s, d) => s + d.amount, 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8125rem', color: '#9c9690', marginBottom: '0.25rem' }}>
            {greeting()},
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {user.name ?? `@${user.username}`}
          </h1>
          <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href={`/@${user.username}`} style={{ fontSize: '0.8125rem', color: '#6e6a65', textDecoration: 'none' }}>
              ↗ Profil publik
            </Link>
            <span style={{ color: '#e5e0d8' }}>·</span>
            <Link href="/dashboard/earnings" style={{ fontSize: '0.8125rem', color: '#6e6a65', textDecoration: 'none' }}>
              💰 Lihat penghasilan lengkap
            </Link>
          </div>
        </div>
        <Link href="/dashboard/new" style={{
          background: '#1a1a1a', color: '#f7f5f2',
          padding: '0.625rem 1.375rem', borderRadius: '10px',
          textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
          letterSpacing: '-0.01em', whiteSpace: 'nowrap',
        }}>
          + Buat Konten
        </Link>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <KpiCard
          label="Pendapatan Bulan Ini"
          value={`Rp ${fmt(revenueThisMonth)}`}
          sub={`${activeDays} hari aktif · ${stats.totalRevenue > 0 ? `Total Rp ${fmt(stats.totalRevenue)}` : 'Belum ada penjualan'}`}
          sparkData={sparkAmounts}
          color="#10b981"
          icon="💰"
        />
        <KpiCard
          label="Total Views"
          value={stats.totalViews.toLocaleString('id-ID')}
          sub={`${stats.totalLikes.toLocaleString('id-ID')} likes · ${stats.published} artikel live`}
          sparkData={Array(30).fill(0).map((_, i) => Math.max(0, stats.totalViews / 30 + Math.sin(i) * 10))}
          color="#6366f1"
          icon="👁"
        />
        <KpiCard
          label="Konten"
          value={`${stats.totalPosts}`}
          sub={`${stats.published} published · ${stats.totalPosts - stats.published} draft`}
          color="#f59e0b"
          icon="✍️"
        />
      </div>

      {/* ── Affiliate banner (if any) ───────────────────────────── */}
      {stats.affiliateEarnings > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: '14px',
          padding: '1rem 1.375rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Komisi Affiliate</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em' }}>
              Rp {fmt(stats.affiliateEarnings)}
            </div>
          </div>
          <Link href="/dashboard/affiliate" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669', textDecoration: 'none', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            Lihat detail →
          </Link>
        </div>
      )}

      {/* ── 30-day chart ───────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>Tren Pendapatan</div>
            <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '2px' }}>30 hari terakhir</div>
          </div>
          <Link href="/dashboard/earnings" style={{ fontSize: '0.75rem', color: '#6e6a65', textDecoration: 'none', background: '#f7f5f2', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
            Detail lengkap →
          </Link>
        </div>
        <BigSparkline data={daily30} />
      </div>

      {/* ── Bottom two-col ─────────────────────────────────────── */}
      <div className="grid-chart-sidebar" style={{ gap: '1rem' }}>

        {/* Left: Posts / Activity tabs */}
        <div style={{ background: '#fff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          {/* Tab header */}
          <div style={{ display: 'flex', padding: '1rem 1.5rem 0', gap: '0', borderBottom: '1px solid #f0ede8' }}>
            {(['posts', 'activity'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 0.875rem',
                marginRight: '1.5rem',
                fontSize: '0.875rem',
                fontWeight: activeTab === t ? 700 : 500,
                color: activeTab === t ? '#1a1a1a' : '#9c9690',
                borderBottom: activeTab === t ? '2px solid #1a1a1a' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                {t === 'posts' ? `Top Konten (${topPosts.length})` : `Penjualan (${recentPurchases.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'posts' ? (
            <div>
              {topPosts.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#9c9690' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✍️</div>
                  <p style={{ marginBottom: '0.875rem', fontSize: '0.9375rem' }}>Belum ada konten</p>
                  <Link href="/dashboard/new" style={{ fontSize: '0.875rem', color: '#0070f3', textDecoration: 'none', fontWeight: 600 }}>
                    Buat konten pertamamu →
                  </Link>
                </div>
              ) : topPosts.map((post, i) => (
                <div key={post.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 1.5rem',
                  borderBottom: i < topPosts.length - 1 ? '1px solid #f7f5f2' : 'none',
                }}>
                  {/* Rank */}
                  <div style={{ width: '20px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? '#f59e0b' : i === 1 ? '#9c9690' : '#d0c9b8', flexShrink: 0 }}>
                    {i + 1}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '3px',
                        background: post.type === 'html' ? '#ecfdf5' : '#eff6ff',
                        color: post.type === 'html' ? '#059669' : '#2563eb',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>{post.type === 'html' ? 'App' : 'Art'}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.title}
                      </span>
                    </div>
                    {/* Mini bar */}
                    <div style={{ height: '4px', background: '#f0ede8', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${post.barPct}%`, background: `linear-gradient(90deg, #6366f1, #8b5cf6)`, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1a1a1a' }}>
                      {post.viewCount.toLocaleString('id-ID')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>views</div>
                  </div>

                  <Link href={`/dashboard/edit/${post.slug}`} style={{ fontSize: '0.75rem', color: '#9c9690', textDecoration: 'none', flexShrink: 0 }}>
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {recentPurchases.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#9c9690' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                  <p style={{ fontSize: '0.9375rem' }}>Belum ada penjualan</p>
                </div>
              ) : recentPurchases.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 1.5rem',
                  borderBottom: i < recentPurchases.length - 1 ? '1px solid #f7f5f2' : 'none',
                }}>
                  {/* Avatar initial */}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 700, color: '#4f46e5', flexShrink: 0,
                  }}>
                    {(p.payerName ?? '?')[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.payerName ?? 'Pembeli'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9c9690', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.postTitle}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                      +Rp {fmt(p.amount)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>{fmtDate(p.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Quick actions */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.875rem' }}>Aksi Cepat</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { href: '/dashboard/new',       label: '✍️  Buat artikel baru',         color: '#1a1a1a', bg: '#f7f5f2' },
                { href: '/dashboard/earnings',   label: '💰  Lihat saldo & pencairan',   color: '#059669', bg: '#ecfdf5' },
                { href: '/dashboard/settings',   label: '⚙️  Lengkapi profil & payment', color: '#6366f1', bg: '#eef2ff' },
                { href: '/dashboard/discounts',  label: '%  Buat kode diskon',           color: '#d97706', bg: '#fffbeb' },
                { href: '/dashboard/bundles',    label: '🗂  Kelola bundle',              color: '#0070f3', bg: '#eff6ff' },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '10px',
                  background: a.bg,
                  color: a.color,
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'opacity 0.1s',
                }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats summary */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: '18px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              Ringkasan
            </div>
            {[
              { label: 'Total Penjualan', value: `Rp ${fmt(stats.totalRevenue)}` },
              { label: 'Total Views', value: stats.totalViews.toLocaleString('id-ID') },
              { label: 'Total Likes', value: stats.totalLikes.toLocaleString('id-ID') },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f7f5f2' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Full-width 30-day bar chart ───────────────────────────────────────
function BigSparkline({ data }: { data: { date: string; amount: number }[] }) {
  const [tooltip, setTooltip] = useState<{ i: number; x: number; y: number } | null>(null)
  const max = Math.max(...data.map(d => d.amount), 1)
  const W = 100, H = 60
  const barW = (W / data.length) * 0.55
  const gap  = W / data.length

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ width: '100%', height: '80px', display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={0} y1={H * (1 - f)} x2={W} y2={H * (1 - f)}
            stroke="#f0ede8" strokeWidth="0.4" />
        ))}
        {data.map((d, i) => {
          const bh = d.amount > 0 ? Math.max((d.amount / max) * H * 0.9, 1.5) : 1
          const x  = i * gap + (gap - barW) / 2
          const y  = H - bh
          const isHovered = tooltip?.i === i
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barW} height={bh} rx="0.8"
                fill={d.amount > 0
                  ? isHovered
                    ? '#10b981'
                    : 'url(#bar-grad)'
                  : '#f0ede8'}
                style={{ cursor: d.amount > 0 ? 'pointer' : 'default', transition: 'fill 0.1s' }}
                onMouseEnter={e => {
                  const svg = (e.target as SVGElement).closest('svg')!
                  const rect = svg.getBoundingClientRect()
                  const px = (i * gap + gap / 2) / W * rect.width
                  const py = (y / H) * rect.height
                  setTooltip({ i, x: px, y: py })
                }}
              />
            </g>
          )
        })}
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>

      {tooltip && data[tooltip.i].amount > 0 && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x, 260), top: Math.max(tooltip.y - 48, 0),
          background: '#1a1a1a', color: '#f7f5f2',
          borderRadius: '8px', padding: '0.5rem 0.75rem',
          fontSize: '0.75rem', pointerEvents: 'none', zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 700 }}>Rp {new Intl.NumberFormat('id-ID').format(data[tooltip.i].amount)}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{fmtDateShort(data[tooltip.i].date)}</div>
        </div>
      )}

      {/* X-axis labels — every 5 days */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
        {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map(d => (
          <span key={d.date} style={{ fontSize: '0.6rem', color: '#b0aca6' }}>{fmtDateShort(d.date)}</span>
        ))}
      </div>
    </div>
  )
}

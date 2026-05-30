'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function formatIDR(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const TYPE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  article: { label: 'Artikel', color: '#2563eb', bg: '#eff6ff' },
  file:    { label: 'App/File', color: '#059669', bg: '#ecfdf5' },
  bundle:  { label: 'Bundle', color: '#7c3aed', bg: '#f5f3ff' },
}
const STATUS_WD: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Menunggu', color: '#92400e', bg: '#fffbeb' },
  approved: { label: 'Disetujui', color: '#065f46', bg: '#ecfdf5' },
  paid:     { label: 'Dibayar', color: '#1d4ed8', bg: '#eff6ff' },
  rejected: { label: 'Ditolak', color: '#dc2626', bg: '#fef2f2' },
}

interface Transaction {
  id: string; type: string; label: string; amount: number; serviceFee: number
  payerName?: string | null; createdAt: string
}
interface Withdrawal {
  id: string; amount: number; status: string; bankName: string
  bankAccount: string; bankHolder: string; adminNote?: string | null; createdAt: string
}
interface DayData { date: string; amount: number }
interface SourceBreakdown { article: number; file: number; bundle: number }
interface EarningsData {
  totalRevenue: number; transactionFee: number; transactionCount: number; creatorEarnings: number
  totalWithdrawn: number; availableBalance: number
  sourceBreakdown: SourceBreakdown
  dailyEarnings: DayData[]
  transactions: Transaction[]
  pendingTransactions: Transaction[]
  withdrawals: Withdrawal[]
}

// ── SVG Bar Chart ────────────────────────────────────────────────────────────
function EarningsChart({ data }: { data: DayData[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: DayData } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const max = Math.max(...data.map(d => d.amount), 1)
  const W = 100
  const H = 100
  const barW = (W / data.length) * 0.6
  const gap  = W / data.length

  // Show only every 5th label
  const labelDays = data.filter((_, i) => i % 5 === 0 || i === data.length - 1)

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '140px', overflow: 'visible', display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={0} y1={H * (1 - f)} x2={W} y2={H * (1 - f)}
            stroke="#f0ede8" strokeWidth="0.5" />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const bh = d.amount > 0 ? Math.max((d.amount / max) * H * 0.85, 1) : 0
          const x  = i * gap + (gap - barW) / 2
          const y  = H - bh
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barW} height={bh}
                fill={d.amount > 0 ? '#1a1a1a' : '#f0ede8'}
                rx="1"
                style={{ cursor: d.amount > 0 ? 'pointer' : 'default', transition: 'fill 0.1s' }}
                onMouseEnter={e => {
                  const svg = svgRef.current
                  if (!svg) return
                  const rect = svg.getBoundingClientRect()
                  const px = (i * gap + gap / 2) / W * rect.width
                  const py = (y / H) * rect.height
                  setTooltip({ x: px, y: py, day: d })
                }}
              />
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x, 260),
          top: Math.max(tooltip.y - 56, 0),
          background: '#1a1a1a', color: '#f7f5f2',
          borderRadius: '8px', padding: '0.5rem 0.75rem',
          fontSize: '0.75rem', pointerEvents: 'none', zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 700 }}>{formatIDR(tooltip.day.amount)}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{formatDateShort(tooltip.day.date)}</div>
        </div>
      )}

      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', paddingLeft: '0', paddingRight: '0' }}>
        {labelDays.map(d => (
          <span key={d.date} style={{ fontSize: '0.625rem', color: '#9c9690' }}>
            {formatDateShort(d.date)}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Source Breakdown Bars ────────────────────────────────────────────────────
function SourceBreakdown({ breakdown }: { breakdown: SourceBreakdown }) {
  const total = breakdown.article + breakdown.file + breakdown.bundle
  if (total === 0) return <p style={{ fontSize: '0.875rem', color: '#9c9690' }}>Belum ada penjualan.</p>

  const sources = [
    { key: 'article', name: 'Artikel', color: TYPE_LABEL.article.color, bg: TYPE_LABEL.article.bg },
    { key: 'file',    name: 'App/File', color: TYPE_LABEL.file.color,    bg: TYPE_LABEL.file.bg },
    { key: 'bundle',  name: 'Bundle',  color: TYPE_LABEL.bundle.color,   bg: TYPE_LABEL.bundle.bg },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {sources.map(s => {
        const amt = breakdown[s.key as keyof typeof breakdown]
        const pct = total > 0 ? Math.round((amt / total) * 100) : 0
        return (
          <div key={s.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: s.color }} />
                <span style={{ color: '#3d3a36', fontWeight: 500 }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: '#9c9690' }}>{pct}%</span>
                <span style={{ color: '#1a1a1a', fontWeight: 600, minWidth: '80px', textAlign: 'right' }}>{formatIDR(amt)}</span>
              </div>
            </div>
            <div style={{ height: '6px', background: '#f0ede8', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function EarningsPage() {
  const [data, setData]           = useState<EarningsData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [orderTab, setOrderTab]   = useState<'paid' | 'pending'>('paid')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/dashboard/earnings').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount.replace(/\D/g, ''))
    if (!amount || amount < 50000) { setError('Minimum pencairan Rp 50.000'); return }
    setError(''); setWithdrawing(true)
    const res = await fetch('/api/dashboard/withdraw', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const json = await res.json()
    setWithdrawing(false)
    if (!res.ok) { setError(json.error); return }
    setSuccess('Permintaan pencairan berhasil!'); setWithdrawAmount(''); load()
    setTimeout(() => setSuccess(''), 4000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9c9690' }}>
      Memuat data penghasilan...
    </div>
  )
  if (!data) return null

  const activeOrders = orderTab === 'paid' ? data.transactions : data.pendingTransactions

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Penghasilan</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>Grafik, sumber pendapatan, dan riwayat transaksi</p>
      </div>

      {/* ── Summary cards ────────────────────────────────────── */}
      <div className="summary-cards">
        {[
          { label: 'Total Penjualan', value: formatIDR(data.totalRevenue), sub: 'semua transaksi lunas', accent: '#1a1a1a' },
          { label: 'Fee Transaksi', value: formatIDR(data.transactionFee), sub: `${data.transactionCount} transaksi × Rp 2.500`, accent: '#dc2626' },
          { label: 'Penghasilan Bersih', value: formatIDR(data.creatorEarnings), sub: 'setelah fee', accent: '#059669' },
          { label: 'Saldo Tersedia', value: formatIDR(data.availableBalance), sub: 'siap dicairkan', accent: '#0070f3' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.125rem 1.25rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.accent, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#3d3a36', marginTop: '0.2rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Chart + Source + Withdraw ─────────────────────────── */}
      <div className="grid-chart-sidebar">

        {/* Chart */}
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>Pertumbuhan Penghasilan</div>
              <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '2px' }}>30 hari terakhir</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6e6a65', background: '#f0ede8', padding: '0.25rem 0.625rem', borderRadius: '6px' }}>
              {data.dailyEarnings.filter(d => d.amount > 0).length} hari aktif
            </div>
          </div>
          <EarningsChart data={data.dailyEarnings} />
        </div>

        {/* Right column: Source + Withdraw */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Source breakdown */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>Sumber Penghasilan</div>
            <SourceBreakdown breakdown={data.sourceBreakdown} />
          </div>

          {/* Withdraw form */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>Cairkan Dana</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6e6a65' }}>Saldo tersedia</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0070f3', letterSpacing: '-0.02em' }}>{formatIDR(data.availableBalance)}</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.3rem' }}>Jumlah (min. Rp 50.000)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8125rem', color: '#6e6a65' }}>Rp</span>
                <input type="text" value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="50000"
                  style={{ width: '100%', paddingLeft: '2.25rem', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            {error   && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{error}</p>}
            {success && <p style={{ color: '#059669', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{success}</p>}
            <button onClick={handleWithdraw} disabled={withdrawing || data.availableBalance < 50000}
              style={{ width: '100%', padding: '0.6875rem', borderRadius: '8px', border: 'none',
                background: data.availableBalance >= 50000 ? '#1a1a1a' : '#e5e0d8',
                color: data.availableBalance >= 50000 ? '#f7f5f2' : '#9c9690',
                fontSize: '0.875rem', fontWeight: 600, cursor: data.availableBalance >= 50000 ? 'pointer' : 'not-allowed',
              }}>
              {withdrawing ? 'Memproses...' : 'Ajukan Pencairan'}
            </button>
            {data.availableBalance < 50000 && (
              <p style={{ fontSize: '0.7rem', color: '#9c9690', textAlign: 'center', marginTop: '0.4rem' }}>Saldo belum mencukupi minimum</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Order history ─────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem', marginBottom: '1.25rem' }}>
        {/* Header + tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>Riwayat Pesanan</div>
          <div style={{ display: 'flex', background: '#f0ede8', borderRadius: '8px', padding: '3px' }}>
            {(['paid', 'pending'] as const).map(tab => (
              <button key={tab} onClick={() => setOrderTab(tab)}
                style={{
                  padding: '0.3rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.15s',
                  background: orderTab === tab ? '#ffffff' : 'transparent',
                  color: orderTab === tab ? '#1a1a1a' : '#9c9690',
                  boxShadow: orderTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}>
                {tab === 'paid' ? `Berhasil (${data.transactions.length})` : `Menunggu (${data.pendingTransactions.length})`}
              </button>
            ))}
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#9c9690' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {orderTab === 'paid' ? '💸' : '⏳'}
            </div>
            <p style={{ fontSize: '0.875rem' }}>
              {orderTab === 'paid' ? 'Belum ada pesanan yang berhasil.' : 'Tidak ada pesanan yang menunggu konfirmasi.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeOrders.map(t => {
              const tl = TYPE_LABEL[t.type] ?? TYPE_LABEL.article
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  background: '#fafaf8', border: '1px solid #f0ede8',
                  borderRadius: '8px', padding: '0.875rem 1rem',
                }}>
                  {/* Type badge */}
                  <span style={{ flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: tl.bg, color: tl.color, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {tl.label}
                  </span>

                  {/* Title + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.1rem' }}>
                      {t.payerName ?? 'Anonim'} · {formatDate(t.createdAt)}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: orderTab === 'paid' ? '#059669' : '#b45309' }}>
                      {orderTab === 'paid' ? '+' : ''}{formatIDR(t.amount - t.serviceFee)}
                    </div>
                    {t.serviceFee > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>
                        −{formatIDR(t.serviceFee)} biaya layanan
                      </div>
                    )}
                    {orderTab === 'pending' && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, background: '#fffbeb', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        Menunggu
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Withdrawal history ────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>
          Riwayat Pencairan ({data.withdrawals.length})
        </div>

        {data.withdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9c9690', fontSize: '0.875rem' }}>
            Belum ada pengajuan pencairan.{' '}
            <Link href="/dashboard/settings" style={{ color: '#1a1a1a', fontWeight: 600 }}>Setup rekening →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {data.withdrawals.map(w => {
              const st = STATUS_WD[w.status] ?? STATUS_WD.pending
              return (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: '#fafaf8', border: '1px solid #f0ede8',
                  borderRadius: '8px', padding: '0.875rem 1rem',
                }}>
                  {/* Status badge */}
                  <span style={{ flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, background: st.bg, color: st.color, padding: '0.2rem 0.625rem', borderRadius: '4px' }}>
                    {st.label}
                  </span>

                  {/* Bank info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a' }}>
                      {w.bankName} — {w.bankAccount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                      a.n. {w.bankHolder} · {formatDate(w.createdAt)}
                    </div>
                    {w.adminNote && (
                      <div style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.2rem', fontStyle: 'italic' }}>
                        Catatan: {w.adminNote}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>
                    {formatIDR(w.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

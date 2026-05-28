'use client'

import { useState, useEffect } from 'react'

function formatIDR(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }

const TYPE_LABEL: Record<string, string> = { article: 'Artikel', file: 'File/App', bundle: 'Bundle' }
const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Menunggu', color: '#92400e', bg: '#fffbeb' },
  approved: { label: 'Disetujui', color: '#065f46', bg: '#ecfdf5' },
  paid:     { label: 'Sudah Dibayar', color: '#1d4ed8', bg: '#eff6ff' },
  rejected: { label: 'Ditolak', color: '#dc2626', bg: '#fef2f2' },
}

interface Transaction {
  id: string; type: string; label: string; amount: number
  payerName?: string | null; createdAt: string
}
interface Withdrawal {
  id: string; amount: number; status: string; bankName: string
  bankAccount: string; bankHolder: string; adminNote?: string | null; createdAt: string
}
interface EarningsData {
  totalRevenue: number; platformFee: number; creatorEarnings: number
  totalWithdrawn: number; availableBalance: number
  transactions: Transaction[]; withdrawals: Withdrawal[]
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/dashboard/earnings').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount.replace(/\D/g, ''))
    if (!amount) { setError('Masukkan jumlah'); return }
    setError(''); setWithdrawing(true)
    const res = await fetch('/api/dashboard/withdraw', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const json = await res.json()
    setWithdrawing(false)
    if (!res.ok) { setError(json.error); return }
    setSuccess('Permintaan pencairan berhasil dikirim!'); setWithdrawAmount(''); load()
  }

  if (loading) return <div style={{ padding: '2rem', color: '#9c9690' }}>Memuat...</div>
  if (!data) return null

  const stats = [
    { label: 'Total Penjualan', value: formatIDR(data.totalRevenue), sub: 'semua transaksi', color: '#1a1a1a' },
    { label: 'Fee Platform (10%)', value: formatIDR(data.platformFee), sub: 'dipotong otomatis', color: '#dc2626' },
    { label: 'Penghasilan Bersih', value: formatIDR(data.creatorEarnings), sub: 'setelah fee', color: '#059669' },
    { label: 'Saldo Tersedia', value: formatIDR(data.availableBalance), sub: 'siap dicairkan', color: '#0070f3' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Saldo & Penghasilan</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.9rem' }}>Riwayat penjualan dan pencairan dana</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.625rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '0.2rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Transaction history */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>
            Riwayat Penjualan ({data.transactions.length})
          </h2>
          {data.transactions.length === 0 ? (
            <p style={{ color: '#9c9690', fontSize: '0.9rem' }}>Belum ada penjualan.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.transactions.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.875rem 1rem', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.1rem' }}>
                      {TYPE_LABEL[t.type]} · {t.payerName ?? '—'} · {formatDate(t.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#059669' }}>+{formatIDR(t.amount)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>−{formatIDR(Math.floor(t.amount * 0.10))} fee</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdraw panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Form cairkan */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>Cairkan Dana</h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Saldo tersedia</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0070f3' }}>{formatIDR(data.availableBalance)}</div>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }}>Jumlah cairkan (min. Rp 50.000)</label>
              <input
                type="text"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="50000"
                style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{error}</p>}
            {success && <p style={{ color: '#059669', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{success}</p>}
            <button
              onClick={handleWithdraw}
              disabled={withdrawing || data.availableBalance < 50000}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none',
                background: data.availableBalance >= 50000 ? '#1a1a1a' : '#e5e0d8',
                color: data.availableBalance >= 50000 ? '#f7f5f2' : '#9c9690',
                fontSize: '0.9375rem', fontWeight: 600,
                cursor: data.availableBalance >= 50000 ? 'pointer' : 'not-allowed',
              }}
            >
              {withdrawing ? 'Memproses...' : 'Ajukan Pencairan'}
            </button>
            {data.availableBalance < 50000 && (
              <p style={{ fontSize: '0.75rem', color: '#9c9690', textAlign: 'center', marginTop: '0.5rem' }}>
                Saldo belum mencukupi minimum Rp 50.000
              </p>
            )}
          </div>

          {/* Withdrawal history */}
          {data.withdrawals.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.875rem' }}>Riwayat Pencairan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {data.withdrawals.map(w => {
                  const st = STATUS_LABEL[w.status] ?? STATUS_LABEL.pending
                  return (
                    <div key={w.id} style={{ borderBottom: '1px solid #f0ede8', paddingBottom: '0.625rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>{formatIDR(w.amount)}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, background: st.bg, color: st.color, borderRadius: '4px', padding: '0.1rem 0.45rem' }}>{st.label}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{w.bankName} · {w.bankAccount} · {formatDate(w.createdAt)}</div>
                      {w.adminNote && <div style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.15rem' }}>Catatan: {w.adminNote}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

function formatIDR(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Menunggu',      color: '#92400e', bg: '#fef3c7' },
  approved: { label: 'Disetujui',     color: '#065f46', bg: '#d1fae5' },
  paid:     { label: 'Sudah Dibayar', color: '#1d4ed8', bg: '#dbeafe' },
  rejected: { label: 'Ditolak',       color: '#dc2626', bg: '#fee2e2' },
}

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'paid',     label: 'Sudah Dibayar' },
  { value: 'rejected', label: 'Ditolak' },
]

interface Withdrawal {
  id: string; amount: number; status: string
  bankName: string; bankAccount: string; bankHolder: string
  adminNote?: string | null; createdAt: string
  user: { username: string; name?: string | null; email: string; waNumber?: string | null }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/withdrawals')
      .then(r => r.json())
      .then((d: Withdrawal[]) => {
        setWithdrawals(d)
        const init: Record<string, string> = {}
        d.forEach(w => { init[w.id] = w.status })
        setSelectedStatus(init)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const act = async (id: string) => {
    const status = selectedStatus[id]
    if (!status) return
    setProcessing(id)
    await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setProcessing(null)
    load()
  }

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter)
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length
  const pendingTotal = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0)

  if (loading) return <div style={{ padding: '2rem', color: '#9c9690' }}>Memuat...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Permintaan Pencairan</h1>
          <p style={{ color: '#6e6a65', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {pendingCount > 0 ? `${pendingCount} menunggu · Total ${formatIDR(pendingTotal)}` : `${withdrawals.length} total`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.375rem 0.875rem', borderRadius: '6px', fontSize: '0.8125rem',
              fontWeight: 500, cursor: 'pointer', border: '1px solid',
              background: filter === f ? '#1a1a1a' : '#ffffff',
              color: filter === f ? '#f0ede8' : '#6e6a65',
              borderColor: filter === f ? '#1a1a1a' : '#e5e0d8',
            }}>
              {f === 'all' ? 'Semua' : STATUS[f]?.label}
              {' '}
              <span style={{ opacity: 0.6 }}>({f === 'all' ? withdrawals.length : withdrawals.filter(w => w.status === f).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#9c9690' }}>
          Tidak ada data.
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 180px 100px 130px 80px', gap: '0', borderBottom: '2px solid #e5e0d8', padding: '0.625rem 1rem', background: '#f7f5f2' }}>
            {['Kreator', 'Nominal', 'Bank', 'Tanggal', 'Status', 'Aksi'].map(h => (
              <span key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6e6a65', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>

          {filtered.map((w, i) => {
            const st = STATUS[w.status] ?? STATUS.pending
            const changed = selectedStatus[w.id] !== w.status
            const busy = processing === w.id

            return (
              <div key={w.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 180px 100px 130px 80px',
                gap: '0', alignItems: 'center',
                padding: '0.75rem 1rem',
                borderBottom: i < filtered.length - 1 ? '1px solid #f0ede8' : 'none',
                background: w.status === 'pending' ? '#fffdf7' : '#fff',
              }}>
                {/* Kreator */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {w.user.name ?? `@${w.user.username}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.1rem' }}>
                    <span>@{w.user.username}</span>
                    {w.user.waNumber && (
                      <a
                        href={`https://wa.me/62${w.user.waNumber.replace(/^0/, '').replace(/^62/, '')}?text=${encodeURIComponent(
                          `Halo ${w.user.name ?? w.user.username}! Update pencairan *${formatIDR(w.amount)}*: ${STATUS[selectedStatus[w.id] ?? w.status]?.label ?? st.label}. Cek: https://tweak.my.id/dashboard/earnings`
                        )}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: '#059669', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 600 }}
                      >
                        💬 WA
                      </a>
                    )}
                    <a
                      href={`mailto:${w.user.email}`}
                      style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 600 }}
                    >
                      ✉️
                    </a>
                  </div>
                </div>

                {/* Nominal */}
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>
                  {formatIDR(w.amount)}
                </div>

                {/* Bank */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {w.bankName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690', fontFamily: 'monospace' }}>{w.bankAccount}</div>
                </div>

                {/* Tanggal */}
                <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{formatDate(w.createdAt)}</div>

                {/* Status dropdown */}
                <select
                  value={selectedStatus[w.id] ?? w.status}
                  onChange={e => setSelectedStatus(s => ({ ...s, [w.id]: e.target.value }))}
                  style={{
                    background: STATUS[selectedStatus[w.id] ?? w.status]?.bg ?? st.bg,
                    color: STATUS[selectedStatus[w.id] ?? w.status]?.color ?? st.color,
                    border: '1px solid transparent', borderRadius: '6px',
                    padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', outline: 'none', width: '100%',
                  }}
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* Simpan */}
                <button
                  onClick={() => act(w.id)}
                  disabled={!changed || busy}
                  style={{
                    marginLeft: '0.5rem', padding: '0.375rem 0.625rem', borderRadius: '6px', border: 'none',
                    background: changed && !busy ? '#1a1a1a' : '#e5e0d8',
                    color: changed && !busy ? '#f0ede8' : '#9c9690',
                    fontWeight: 600, fontSize: '0.75rem',
                    cursor: changed && !busy ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {busy ? '...' : 'Simpan'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

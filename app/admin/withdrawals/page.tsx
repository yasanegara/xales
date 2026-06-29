'use client'

import { useState, useEffect } from 'react'

function formatIDR(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: 'Menunggu',      color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  approved: { label: 'Disetujui',     color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7' },
  paid:     { label: 'Sudah Dibayar', color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
  rejected: { label: 'Ditolak',       color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
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
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/withdrawals')
      .then(r => r.json())
      .then(d => {
        setWithdrawals(d)
        const initStatus: Record<string, string> = {}
        d.forEach((w: Withdrawal) => { initStatus[w.id] = w.status })
        setSelectedStatus(initStatus)
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
      body: JSON.stringify({ status, adminNote: notes[id] ?? '' }),
    })
    setProcessing(null)
    setExpanded(null)
    load()
  }

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter)
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length
  const pendingTotal = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0)

  const inputStyle: React.CSSProperties = {
    background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '6px',
    padding: '0.5rem 0.75rem', fontSize: '0.8125rem', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  if (loading) return <div style={{ padding: '2rem', color: '#9c9690' }}>Memuat...</div>

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Permintaan Pencairan</h1>
          <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {pendingCount > 0
              ? `${pendingCount} menunggu · Total pending ${formatIDR(pendingTotal)}`
              : `${withdrawals.length} total withdrawal`}
          </p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.375rem 0.875rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500,
                cursor: 'pointer', border: '1px solid',
                background: filter === f ? '#1a1a1a' : '#ffffff',
                color: filter === f ? '#f0ede8' : '#6e6a65',
                borderColor: filter === f ? '#1a1a1a' : '#e5e0d8',
              }}
            >
              {f === 'all' ? 'Semua' : STATUS[f]?.label}
              {f !== 'all' && (
                <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
                  ({withdrawals.filter(w => w.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#9c9690' }}>
          Tidak ada withdrawal dengan status ini.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map(w => {
            const st = STATUS[w.status] ?? STATUS.pending
            const isOpen = expanded === w.id
            return (
              <div
                key={w.id}
                style={{ background: '#fff', border: `1px solid ${isOpen ? '#1a1a1a' : st.border}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s' }}
              >
                {/* Row header — click to expand */}
                <div
                  onClick={() => setExpanded(isOpen ? null : w.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>{formatIDR(w.amount)}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, background: st.bg, color: st.color, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#4a4540' }}>
                      {w.user.name ?? `@${w.user.username}`}
                      <span style={{ color: '#9c9690' }}> · @{w.user.username} · {w.user.email}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.1rem' }}>
                      {w.bankName} · <strong style={{ color: '#4a4540' }}>{w.bankAccount}</strong> · a.n. {w.bankHolder} · {formatDate(w.createdAt)}
                    </div>
                    {w.adminNote && (
                      <div style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.2rem' }}>Catatan: {w.adminNote}</div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#9c9690', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Expanded actions */}
                {isOpen && (
                  <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f0ede8', paddingTop: '1rem', background: '#fafaf8' }}>
                    {/* Notifikasi manual */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9c9690', fontWeight: 600 }}>NOTIFIKASI:</span>
                      {w.user.waNumber && (
                        <a
                          href={`https://wa.me/62${w.user.waNumber.replace(/^0/, '').replace(/^62/, '')}?text=${encodeURIComponent(
                            `Halo ${w.user.name ?? w.user.username}!\n\nUpdate pencairan kamu sebesar *${formatIDR(w.amount)}*:\n\nStatus: ${st.label}\n\nCek riwayat: https://tweak.my.id/dashboard/earnings`
                          )}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#dcfce7', color: '#15803d', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #86efac' }}
                        >
                          💬 Kirim WA
                        </a>
                      )}
                      <a
                        href={`mailto:${w.user.email}?subject=${encodeURIComponent('Update Pencairan Dana — Tweak')}&body=${encodeURIComponent(
                          `Halo ${w.user.name ?? w.user.username},\n\nPencairan kamu sebesar ${formatIDR(w.amount)} — Status: ${st.label}.\n\nCek di: https://tweak.my.id/dashboard/earnings\n\nSalam,\nTim Tweak`
                        )}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #93c5fd' }}
                      >
                        ✉️ Kirim Email
                      </a>
                    </div>

                    {/* Status change */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.625rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', marginBottom: '0.375rem' }}>Ubah Status</label>
                        <select
                          value={selectedStatus[w.id] ?? w.status}
                          onChange={e => setSelectedStatus(s => ({ ...s, [w.id]: e.target.value }))}
                          style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                          {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6e6a65', marginBottom: '0.375rem' }}>Catatan Admin</label>
                        <input
                          value={notes[w.id] ?? (w.adminNote ?? '')}
                          onChange={e => setNotes(n => ({ ...n, [w.id]: e.target.value }))}
                          placeholder="Opsional"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => act(w.id)}
                      disabled={processing === w.id || selectedStatus[w.id] === w.status}
                      style={{
                        padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
                        background: (processing === w.id || selectedStatus[w.id] === w.status) ? '#e5e0d8' : '#1a1a1a',
                        color: (processing === w.id || selectedStatus[w.id] === w.status) ? '#9c9690' : '#f0ede8',
                        fontWeight: 600, fontSize: '0.875rem',
                        cursor: (processing === w.id || selectedStatus[w.id] === w.status) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {processing === w.id ? 'Menyimpan...' : 'Simpan Status'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

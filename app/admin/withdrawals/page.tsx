'use client'

import { useState, useEffect } from 'react'

function formatIDR(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Menunggu',     color: '#92400e', bg: '#fffbeb' },
  approved: { label: 'Disetujui',    color: '#065f46', bg: '#ecfdf5' },
  paid:     { label: 'Sudah Dibayar', color: '#1d4ed8', bg: '#eff6ff' },
  rejected: { label: 'Ditolak',      color: '#dc2626', bg: '#fef2f2' },
}

interface Withdrawal {
  id: string; amount: number; status: string
  bankName: string; bankAccount: string; bankHolder: string
  adminNote?: string | null; createdAt: string
  user: { username: string; name?: string | null; email: string }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/withdrawals').then(r => r.json()).then(d => { setWithdrawals(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const act = async (id: string, status: string) => {
    setProcessing(id)
    await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote: notes[id] ?? '' }),
    })
    setProcessing(null); load()
  }

  const pending   = withdrawals.filter(w => w.status === 'pending')
  const processed = withdrawals.filter(w => w.status !== 'pending')

  if (loading) return <div style={{ padding: '2rem', color: '#9c9690' }}>Memuat...</div>

  const totalPending = pending.reduce((s, w) => s + w.amount, 0)

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Permintaan Pencairan</h1>
          <p style={{ color: '#6e6a65', marginTop: '0.25rem' }}>{pending.length} menunggu · Total {formatIDR(totalPending)}</p>
        </div>
      </div>

      {/* Pending */}
      {pending.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '2rem', textAlign: 'center', color: '#9c9690', marginBottom: '2rem' }}>
          Tidak ada permintaan yang menunggu.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2.5rem' }}>
          {pending.map(w => (
            <div key={w.id} style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.875rem' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a' }}>{formatIDR(w.amount)}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6e6a65', marginTop: '0.15rem' }}>
                    {w.user.name ?? `@${w.user.username}`} · {w.user.email}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '0.1rem' }}>
                    {w.bankName} · <strong>{w.bankAccount}</strong> · a.n. {w.bankHolder}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.1rem' }}>{formatDate(w.createdAt)}</div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, background: STATUS.pending.bg, color: STATUS.pending.color, borderRadius: '4px', padding: '0.2rem 0.5rem' }}>
                  {STATUS.pending.label}
                </span>
              </div>
              <input
                value={notes[w.id] ?? ''}
                onChange={e => setNotes(n => ({ ...n, [w.id]: e.target.value }))}
                placeholder="Catatan admin (opsional)"
                style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => act(w.id, 'approved')} disabled={!!processing}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  ✓ Setujui
                </button>
                <button onClick={() => act(w.id, 'paid')} disabled={!!processing}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '8px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  ✓ Tandai Dibayar
                </button>
                <button onClick={() => act(w.id, 'rejected')} disabled={!!processing}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  ✕ Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {processed.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>Riwayat</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {processed.map(w => {
              const st = STATUS[w.status]
              return (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.875rem 1rem', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>{formatIDR(w.amount)} · {w.user.name ?? `@${w.user.username}`}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{w.bankName} · {w.bankAccount} · {formatDate(w.createdAt)}</div>
                    {w.adminNote && <div style={{ fontSize: '0.75rem', color: '#6e6a65' }}>Catatan: {w.adminNote}</div>}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, background: st.bg, color: st.color, borderRadius: '4px', padding: '0.2rem 0.5rem', flexShrink: 0 }}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

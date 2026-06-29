'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Withdrawal {
  id: string
  amount: number
  status: string
  bankName: string
  bankAccount: string
  bankHolder: string
  createdAt: Date
  user: { username: string; name: string | null; email: string; waNumber: string | null }
}

function formatIDR(n: number) { return new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function WithdrawalActions({ withdrawals, totalPending }: { withdrawals: Withdrawal[]; totalPending: number }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  const act = async (id: string, status: string) => {
    setProcessing(id)
    await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote: notes[id] ?? '' }),
    })
    setProcessing(null)
    router.refresh()
  }

  if (withdrawals.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9c9690', fontSize: '0.875rem' }}>
        Tidak ada permintaan yang menunggu
      </div>
    )
  }

  return (
    <div>
      {withdrawals.map((w, i) => (
        <div key={w.id} style={{ borderBottom: i < withdrawals.length - 1 ? '1px solid #f0ede8' : 'none' }}>
          {/* Row */}
          <div
            onClick={() => setExpanded(expanded === w.id ? null : w.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer' }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                @{w.user.username} {w.user.name ? `(${w.user.name})` : ''}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>
                {w.bankName} · {w.bankAccount} · a.n. {w.bankHolder} · {formatDate(w.createdAt)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <span style={{ fontWeight: 700, color: '#d97706', fontSize: '0.9375rem' }}>
                Rp {formatIDR(w.amount)}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>{expanded === w.id ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* Expanded actions */}
          {expanded === w.id && (
            <div style={{ padding: '0 1.25rem 1rem', background: '#fafaf8' }}>
              {/* Notifikasi manual */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                {w.user.waNumber && (
                  <a
                    href={`https://wa.me/62${w.user.waNumber.replace(/^0/, '').replace(/^62/, '')}?text=${encodeURIComponent(
                      `Halo ${w.user.name ?? w.user.username}!\n\nPencairan kamu sebesar *Rp ${formatIDR(w.amount)}* sedang diproses.\n\nEstimasi transfer: 1×24 jam kerja.\n\nTweak — tweak.my.id`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#dcfce7', color: '#15803d', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #86efac' }}
                  >
                    💬 Kirim WA
                  </a>
                )}
                <a
                  href={`mailto:${w.user.email}?subject=${encodeURIComponent('Update Pencairan Dana — Tweak')}&body=${encodeURIComponent(
                    `Halo ${w.user.name ?? w.user.username},\n\nPencairan kamu sebesar Rp ${formatIDR(w.amount)} sedang diproses.\n\nEstimasi transfer: 1×24 jam kerja.\n\nSalam,\nTim Tweak`
                  )}`}
                  onClick={e => e.stopPropagation()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #93c5fd' }}
                >
                  ✉️ Kirim Email
                </a>
                <span style={{ fontSize: '0.75rem', color: '#9c9690', alignSelf: 'center', marginLeft: '0.25rem' }}>{w.user.email}</span>
              </div>

              <input
                value={notes[w.id] ?? ''}
                onChange={e => setNotes(n => ({ ...n, [w.id]: e.target.value }))}
                placeholder="Catatan admin (opsional)"
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', background: '#fff', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', outline: 'none', marginBottom: '0.625rem', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={e => { e.stopPropagation(); act(w.id, 'approved') }}
                  disabled={!!processing}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#059669', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  ✓ Setujui
                </button>
                <button
                  onClick={e => { e.stopPropagation(); act(w.id, 'paid') }}
                  disabled={!!processing}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  ✓ Dibayar
                </button>
                <button
                  onClick={e => { e.stopPropagation(); act(w.id, 'rejected') }}
                  disabled={!!processing}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  ✕ Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', background: '#fafaf8' }}>
        <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>Total pending</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>Rp {formatIDR(totalPending)}</span>
      </div>
    </div>
  )
}

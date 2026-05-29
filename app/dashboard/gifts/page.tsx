'use client'

import { useState, useEffect } from 'react'

function fmt(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Menunggu', color: '#92400e', bg: '#fffbeb' },
  approved: { label: 'Disetujui', color: '#065f46', bg: '#ecfdf5' },
  paid:     { label: 'Dibayar',   color: '#1d4ed8', bg: '#eff6ff' },
  rejected: { label: 'Ditolak',  color: '#dc2626', bg: '#fef2f2' },
}

interface Redemption { id: string; amount: number; status: string; createdAt: string }
interface BalanceData {
  giftEarnings: number; giftRedeemed: number; availableGifts: number
  redemptions: Redemption[]
}

interface GiftItem { id: string; emoji: string; name: string; price: number }
interface SentGift {
  id: string; amount: number; message?: string | null; createdAt: string; status: string
  sender: { username: string; name?: string | null; profilePic?: string | null }
  giftItem: GiftItem
  post: { title: string; slug: string }
}
interface HistoryData { received: SentGift[] }

function Avatar({ user, size = 32 }: { user: SentGift['sender']; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: '#f0ede8', border: '1px solid #e5e0d8', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.38}px`, fontWeight: 700, color: '#6e6a65',
    }}>
      {user.profilePic
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (user.name?.[0] ?? user.username[0]).toUpperCase()
      }
    </div>
  )
}

// Bar chart: gift per article
function GiftByArticle({ gifts }: { gifts: SentGift[] }) {
  const map: Record<string, { title: string; total: number }> = {}
  gifts.forEach(g => {
    const k = g.post.slug
    if (!map[k]) map[k] = { title: g.post.title, total: 0 }
    map[k].total += g.amount
  })
  const rows = Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5)
  if (rows.length === 0) return <p style={{ fontSize: '0.875rem', color: '#9c9690' }}>Belum ada data.</p>
  const max = rows[0].total

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {rows.map(r => (
        <div key={r.title}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
            <span style={{ color: '#3d3a36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{r.title}</span>
            <span style={{ fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>{fmt(r.total)}</span>
          </div>
          <div style={{ height: '6px', background: '#f0ede8', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(r.total / max) * 100}%`, background: '#f59e0b', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardGiftsPage() {
  const [balance, setBalance]   = useState<BalanceData | null>(null)
  const [history, setHistory]   = useState<HistoryData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [amount, setAmount]     = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [msg, setMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    const [b, h] = await Promise.all([
      fetch('/api/gifts/balance').then(r => r.json()),
      fetch('/api/gifts/history').then(r => r.json()),
    ])
    setBalance(b); setHistory(h); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const redeem = async () => {
    const n = parseInt(amount.replace(/\D/g, ''))
    if (!n || n < 10000) { setMsg({ type: 'err', text: 'Minimum Rp 10.000' }); return }
    setRedeeming(true); setMsg(null)
    const res = await fetch('/api/gifts/redeem', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: n }),
    })
    const data = await res.json()
    setRedeeming(false)
    if (!res.ok) { setMsg({ type: 'err', text: data.error }); return }
    setMsg({ type: 'ok', text: 'Permintaan pencairan berhasil!' })
    setAmount('')
    load()
    setTimeout(() => setMsg(null), 4000)
  }

  if (loading) return <div style={{ padding: '2rem', color: '#9c9690' }}>Memuat...</div>
  if (!balance || !history) return null

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Gift dari Pembaca</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>Kelola hadiah yang kamu terima dan cairkan ke saldo</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Gift Diterima', value: fmt(balance.giftEarnings), color: '#f59e0b', emoji: '🎁' },
          { label: 'Sudah Dicairkan', value: fmt(balance.giftRedeemed), color: '#9c9690', emoji: '✓' },
          { label: 'Siap Dicairkan', value: fmt(balance.availableGifts), color: '#059669', emoji: '💰' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.125rem 1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{s.emoji}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#6e6a65', marginTop: '0.125rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left: chart + riwayat gift diterima */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Gift per artikel */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>
              Gift per Artikel 🏆
            </div>
            <GiftByArticle gifts={history.received} />
          </div>

          {/* Riwayat gift diterima */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>
              Riwayat Gift Diterima ({history.received.length})
            </div>

            {history.received.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9c9690' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</div>
                <p style={{ fontSize: '0.875rem' }}>Belum ada gift yang masuk.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.received.map(g => (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.875rem', background: '#fafaf8',
                    border: '1px solid #f0ede8', borderRadius: '8px',
                  }}>
                    <Avatar user={g.sender} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                          {g.sender.name ?? `@${g.sender.username}`}
                        </span>
                        <span style={{ fontSize: '1.125rem' }}>{g.giftItem.emoji}</span>
                        <span style={{ fontSize: '0.75rem', color: '#9c9690', marginLeft: 'auto', flexShrink: 0 }}>
                          {fmtDate(g.createdAt)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        pada "{g.post.title}"
                      </div>
                      {g.message && (
                        <p style={{ fontSize: '0.75rem', color: '#6e6a65', fontStyle: 'italic', marginTop: '0.25rem' }}>
                          "{g.message}"
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f59e0b' }}>+{fmt(g.amount)}</div>
                      {g.status === 'pending_payment' && (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button onClick={async () => {
                            await fetch('/api/gifts/send', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ giftId: g.id, action: 'confirm' }) })
                            load()
                          }} style={{ fontSize: '0.65rem', fontWeight: 700, background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.15rem 0.5rem', cursor: 'pointer' }}>
                            ✓ Konfirmasi
                          </button>
                          <button onClick={async () => {
                            await fetch('/api/gifts/send', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ giftId: g.id, action: 'reject' }) })
                            load()
                          }} style={{ fontSize: '0.65rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', padding: '0.15rem 0.5rem', cursor: 'pointer' }}>
                            ✕ Tolak
                          </button>
                        </div>
                      )}
                      {g.status === 'paid' && <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 600 }}>✓ Terkonfirmasi</span>}
                      {g.status === 'rejected' && <span style={{ fontSize: '0.65rem', color: '#dc2626' }}>Ditolak</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: tukar gift + riwayat pencairan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Tukar gift ke saldo */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.875rem' }}>
              🔄 Tukar Gift ke Saldo
            </div>
            <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.875rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.25rem' }}>Tersedia untuk dicairkan</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>{fmt(balance.availableGifts)}</div>
            </div>

            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.3rem' }}>
              Jumlah cairkan (min. Rp 10.000)
            </label>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8125rem', color: '#6e6a65' }}>Rp</span>
              <input type="text" value={amount}
                onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="10000"
                style={{ width: '100%', paddingLeft: '2.25rem', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {msg && (
              <p style={{ fontSize: '0.8125rem', color: msg.type === 'ok' ? '#059669' : '#dc2626', marginBottom: '0.5rem' }}>
                {msg.text}
              </p>
            )}

            <button onClick={redeem} disabled={redeeming || balance.availableGifts < 10000}
              style={{
                width: '100%', padding: '0.6875rem', borderRadius: '8px', border: 'none',
                background: balance.availableGifts >= 10000 ? '#f59e0b' : '#e5e0d8',
                color: balance.availableGifts >= 10000 ? '#fff' : '#9c9690',
                fontSize: '0.875rem', fontWeight: 700,
                cursor: balance.availableGifts >= 10000 ? 'pointer' : 'not-allowed',
              }}>
              {redeeming ? 'Memproses...' : '🔄 Ajukan Pencairan Gift'}
            </button>
            <p style={{ fontSize: '0.7rem', color: '#9c9690', textAlign: 'center', marginTop: '0.4rem' }}>
              Diproses admin dalam 1–3 hari kerja
            </p>
          </div>

          {/* Riwayat pencairan gift */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.875rem' }}>
              Riwayat Pencairan Gift
            </div>
            {balance.redemptions.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#9c9690', textAlign: 'center', padding: '1rem 0' }}>Belum ada pencairan.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {balance.redemptions.map(r => {
                  const st = STATUS[r.status] ?? STATUS.pending
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: '#fafaf8', border: '1px solid #f0ede8', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a' }}>{fmt(r.amount)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>{fmtDate(r.createdAt)}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, background: st.bg, color: st.color, padding: '0.2rem 0.625rem', borderRadius: '4px' }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

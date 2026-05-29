'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function fmt(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface GiftItem { id: string; emoji: string; name: string; price: number }
interface SentGift {
  id: string; amount: number; message?: string | null; createdAt: string
  sender?: { username: string; name?: string | null; profilePic?: string | null }
  receiver?: { username: string; name?: string | null; profilePic?: string | null }
  giftItem: GiftItem
  post?: { title: string; slug: string; author?: { username: string } }
}
interface HistoryData { sent: SentGift[]; received: SentGift[] }
interface BalanceData { giftBalance: number; totalSent: number }

export default function GiftWalletPage() {
  const [balance, setBalance]     = useState<BalanceData | null>(null)
  const [history, setHistory]     = useState<HistoryData | null>(null)
  const [catalog, setCatalog]     = useState<GiftItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'sent' | 'received'>('sent')
  // Transfer form
  const [toUser, setToUser]       = useState('')
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)
  const [transferMsg, setTransferMsg] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [transferResult, setTransferResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    const [b, h, c] = await Promise.all([
      fetch('/api/gifts/balance').then(r => r.json()),
      fetch('/api/gifts/history').then(r => r.json()),
      fetch('/api/gifts').then(r => r.json()),
    ])
    setBalance(b); setHistory(h); setCatalog(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const transfer = async () => {
    if (!toUser.trim() || !selectedGift) { setTransferResult({ type: 'err', text: 'Isi username dan pilih gift' }); return }
    setTransferring(true); setTransferResult(null)
    const res = await fetch('/api/gifts/transfer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUsername: toUser.trim().replace('@', ''), giftItemId: selectedGift.id, message: transferMsg }),
    })
    const data = await res.json()
    setTransferring(false)
    if (!res.ok) { setTransferResult({ type: 'err', text: data.error }); return }
    setTransferResult({ type: 'ok', text: data.message })
    setToUser(''); setSelectedGift(null); setTransferMsg('')
    load()
    setTimeout(() => setTransferResult(null), 4000)
  }

  if (loading) return <div style={{ padding: '2rem', color: '#9c9690' }}>Memuat...</div>
  if (!balance || !history) return null

  const activeList = tab === 'sent' ? history.sent : history.received

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Gift Wallet</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>Kelola gift yang kamu kirim dan terima</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.125rem 1.25rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>💳</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.02em' }}>{fmt(balance.giftBalance)}</div>
          <div style={{ fontSize: '0.8rem', color: '#6e6a65', marginTop: '0.125rem' }}>Gift Kredit Tersedia</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.125rem 1.25rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>🎁</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{history.sent.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#6e6a65', marginTop: '0.125rem' }}>Gift Dikirim</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.125rem 1.25rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>💸</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '-0.02em' }}>{fmt(balance.totalSent)}</div>
          <div style={{ fontSize: '0.8rem', color: '#6e6a65', marginTop: '0.125rem' }}>Total Dibelanjakan</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left: riwayat */}
        <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f0ede8', borderRadius: '8px', padding: '3px', marginBottom: '1.25rem' }}>
            {(['sent', 'received'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '0.35rem', borderRadius: '6px', border: 'none',
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#1a1a1a' : '#9c9690',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}>
                {t === 'sent' ? `Dikirim (${history.sent.length})` : `Diterima (${history.received.length})`}
              </button>
            ))}
          </div>

          {activeList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#9c9690' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</div>
              <p style={{ fontSize: '0.875rem' }}>
                {tab === 'sent' ? 'Belum pernah kirim gift.' : 'Belum ada gift yang diterima.'}
              </p>
              {tab === 'sent' && (
                <Link href="/" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.8125rem', color: '#1a1a1a', fontWeight: 600 }}>
                  Jelajahi artikel →
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeList.map(g => {
                const other = tab === 'sent' ? g.receiver : g.sender
                return (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.875rem', background: '#fafaf8',
                    border: '1px solid #f0ede8', borderRadius: '8px',
                  }}>
                    {/* Avatar */}
                    {other && (
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: '#f0ede8', border: '1px solid #e5e0d8', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#6e6a65',
                      }}>
                        {other.profilePic
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={other.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (other.name?.[0] ?? other.username[0]).toUpperCase()
                        }
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                          {tab === 'sent' ? `ke ${other?.name ?? '@' + other?.username}` : `dari ${other?.name ?? '@' + other?.username}`}
                        </span>
                        <span style={{ fontSize: '1rem' }}>{g.giftItem.emoji}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#9c9690', flexShrink: 0 }}>
                          {fmtDate(g.createdAt)}
                        </span>
                      </div>
                      {g.post && (
                        <div style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          pada "{g.post.title}"
                        </div>
                      )}
                      {g.message && (
                        <p style={{ fontSize: '0.75rem', color: '#6e6a65', fontStyle: 'italic', marginTop: '0.2rem' }}>
                          "{g.message}"
                        </p>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: tab === 'sent' ? '#dc2626' : '#059669', flexShrink: 0 }}>
                      {tab === 'sent' ? '-' : '+'}{fmt(g.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: transfer + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Transfer langsung */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
              📤 Kirim Gift ke Kreator
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6e6a65', marginBottom: '1rem', lineHeight: 1.5 }}>
              Kirim gift langsung ke kreator pilihanmu — tanpa harus di halaman artikel.
            </p>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.3rem' }}>Username kreator</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9c9690', fontSize: '0.875rem' }}>@</span>
                <input type="text" value={toUser} onChange={e => setToUser(e.target.value)}
                  placeholder="hustle.halal"
                  style={{ width: '100%', paddingLeft: '1.75rem', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.6rem 0.75rem 0.6rem 1.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6a65', marginBottom: '0.5rem' }}>Pilih Gift</label>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {catalog.map(g => (
                  <button key={g.id} onClick={() => setSelectedGift(selectedGift?.id === g.id ? null : g)}
                    title={`${g.name} · ${fmt(g.price)}`}
                    style={{
                      fontSize: '1.375rem', padding: '0.375rem', borderRadius: '8px', cursor: 'pointer',
                      border: `2px solid ${selectedGift?.id === g.id ? '#1a1a1a' : '#e5e0d8'}`,
                      background: selectedGift?.id === g.id ? '#f7f5f2' : '#fff',
                      transform: selectedGift?.id === g.id ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}>
                    {g.emoji}
                  </button>
                ))}
              </div>
              {selectedGift && (
                <p style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.375rem' }}>
                  {selectedGift.emoji} {selectedGift.name} · {fmt(selectedGift.price)}
                </p>
              )}
            </div>

            <input type="text" value={transferMsg} onChange={e => setTransferMsg(e.target.value)}
              placeholder="Pesan (opsional)"
              style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }} />

            {transferResult && (
              <p style={{ fontSize: '0.8125rem', color: transferResult.type === 'ok' ? '#059669' : '#dc2626', marginBottom: '0.5rem' }}>
                {transferResult.text}
              </p>
            )}

            <button onClick={transfer} disabled={transferring || !toUser || !selectedGift}
              style={{
                width: '100%', padding: '0.6875rem', borderRadius: '8px', border: 'none',
                background: toUser && selectedGift ? '#7c3aed' : '#e5e0d8',
                color: toUser && selectedGift ? '#fff' : '#9c9690',
                fontSize: '0.875rem', fontWeight: 700,
                cursor: toUser && selectedGift ? 'pointer' : 'not-allowed',
              }}>
              {transferring ? 'Mengirim...' : selectedGift ? `Kirim ${selectedGift.emoji} · ${fmt(selectedGift.price)}` : 'Kirim Gift'}
            </button>
          </div>

          {/* Info kredit */}
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.625rem' }}>💡 Gift Kredit</div>
            <p style={{ fontSize: '0.75rem', color: '#6e6a65', lineHeight: 1.6 }}>
              Gift kredit adalah saldo yang bisa kamu gunakan untuk mengirim gift ke kreator.
              Isi saldo melalui halaman <strong>Settings → Isi Gift Kredit</strong>.
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
              Saldo kamu: {fmt(balance.giftBalance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
interface TopUpPaymentInfo {
  bankName?: string | null; bankAccount?: string | null
  bankHolder?: string | null; qrisImage?: string | null
}
interface TopUpData { packages: number[]; paymentInfo: TopUpPaymentInfo | null }

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
  // Top-up
  const [topupData, setTopupData]     = useState<TopUpData | null>(null)
  const [topupPkg, setTopupPkg]       = useState<number | null>(null)
  const [topupStep, setTopupStep]     = useState<'pick' | 'payment' | 'done'>('pick')
  const [topping, setTopping]         = useState(false)

  const load = async () => {
    setLoading(true)
    const [b, h, c, t] = await Promise.all([
      fetch('/api/gifts/balance').then(r => r.json()),
      fetch('/api/gifts/history').then(r => r.json()),
      fetch('/api/gifts').then(r => r.json()),
      fetch('/api/gifts/topup').then(r => r.json()),
    ])
    setBalance(b); setHistory(h); setCatalog(c); setTopupData(t)
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

  const startTopup = async () => {
    if (!topupPkg) return
    setTopping(true)
    await fetch('/api/gifts/topup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: topupPkg }),
    })
    setTopping(false)
    setTopupStep('payment')
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

          {/* Top-up gift kredit */}
          <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.375rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
              💳 Isi Gift Kredit
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6e6a65', lineHeight: 1.5, marginBottom: '1rem' }}>
              Beli kredit untuk transfer gift langsung ke kreator favoritmu.
            </p>

            {topupStep === 'pick' && topupData && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {topupData.packages.map(pkg => (
                    <button key={pkg} onClick={() => setTopupPkg(topupPkg === pkg ? null : pkg)}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: `2px solid ${topupPkg === pkg ? '#7c3aed' : '#e5e0d8'}`, background: topupPkg === pkg ? '#f5f3ff' : '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, color: topupPkg === pkg ? '#7c3aed' : '#1a1a1a', transition: 'all 0.15s' }}>
                      {fmt(pkg)}
                    </button>
                  ))}
                </div>
                <button onClick={startTopup} disabled={!topupPkg || topping}
                  style={{ width: '100%', padding: '0.6875rem', borderRadius: '8px', border: 'none', background: topupPkg ? '#7c3aed' : '#e5e0d8', color: topupPkg ? '#fff' : '#9c9690', fontSize: '0.875rem', fontWeight: 700, cursor: topupPkg ? 'pointer' : 'not-allowed' }}>
                  {topping ? 'Memproses...' : topupPkg ? `Beli ${fmt(topupPkg)} Kredit` : 'Pilih Paket'}
                </button>
              </>
            )}

            {topupStep === 'payment' && topupData?.paymentInfo && topupPkg && (
              <>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.875rem', fontSize: '0.8125rem', color: '#92400e' }}>
                  Transfer <strong>{fmt(topupPkg)}</strong> ke rekening platform di bawah.
                </div>
                {topupData.paymentInfo.bankAccount && (
                  <div style={{ border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Transfer Bank</div>
                    <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{topupData.paymentInfo.bankName}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', margin: '0.2rem 0' }}>{topupData.paymentInfo.bankAccount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6e6a65' }}>a.n. {topupData.paymentInfo.bankHolder}</div>
                  </div>
                )}
                <button onClick={() => setTopupStep('done')}
                  style={{ width: '100%', padding: '0.6875rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', marginBottom: '0.375rem' }}>
                  ✓ Sudah Transfer
                </button>
                <button onClick={() => setTopupStep('pick')} style={{ width: '100%', background: 'none', border: 'none', color: '#9c9690', fontSize: '0.8rem', cursor: 'pointer', padding: '0.25rem' }}>
                  ← Kembali
                </button>
              </>
            )}

            {topupStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Menunggu konfirmasi admin</div>
                <p style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.25rem', lineHeight: 1.5 }}>Kredit akan masuk dalam 1–24 jam setelah admin konfirmasi.</p>
                <button onClick={() => { setTopupStep('pick'); setTopupPkg(null) }}
                  style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.375rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer', color: '#6e6a65' }}>
                  Isi Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

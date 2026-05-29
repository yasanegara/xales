'use client'

import { useState, useEffect, useRef } from 'react'

interface GiftItem { id: string; emoji: string; name: string; price: number }
interface SentGift {
  id: string; amount: number; message?: string | null; createdAt: string
  sender: { username: string; name?: string | null; profilePic?: string | null }
  giftItem: GiftItem
}

interface Props {
  postId: string
  isAuthor: boolean
  isLoggedIn: boolean
  initialGifts: SentGift[]
}

function fmt(n: number) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n) }

export default function GiftPanel({ postId, isAuthor, isLoggedIn, initialGifts }: Props) {
  const [catalog, setCatalog]   = useState<GiftItem[]>([])
  const [gifts, setGifts]       = useState<SentGift[]>(initialGifts)
  const [showPanel, setShowPanel] = useState(false)
  const [selected, setSelected] = useState<GiftItem | null>(null)
  const [message, setMessage]   = useState('')
  const [sending, setSending]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/gifts').then(r => r.json()).then(setCatalog)
  }, [])

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowPanel(false)
    }
    if (showPanel) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [showPanel])

  const send = async () => {
    if (!selected || sending) return
    setSending(true)
    const res = await fetch('/api/gifts/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, giftItemId: selected.id, message }),
    })
    if (res.ok) {
      const g = await res.json()
      setGifts(prev => [g, ...prev])
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setShowPanel(false); setSelected(null); setMessage('') }, 1800)
    }
    setSending(false)
  }

  // Group gifts by emoji for display
  const grouped = gifts.reduce<Record<string, { gift: SentGift; count: number }>>((acc, g) => {
    const key = g.giftItem.id
    if (!acc[key]) acc[key] = { gift: g, count: 0 }
    acc[key].count++
    return acc
  }, {})

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Gift summary badges */}
        {Object.values(grouped).map(({ gift, count }) => (
          <div key={gift.giftItem.id} title={`${count} ${gift.giftItem.name}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '20px', padding: '0.2rem 0.625rem', fontSize: '0.875rem', cursor: 'default' }}>
            <span>{gift.giftItem.emoji}</span>
            {count > 1 && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>{count}</span>}
          </div>
        ))}

        {/* Send button */}
        {!isAuthor && isLoggedIn && (
          <button onClick={() => setShowPanel(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: showPanel ? '#1a1a1a' : '#f0ede8', border: `1px solid ${showPanel ? '#1a1a1a' : '#e5e0d8'}`, borderRadius: '20px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, color: showPanel ? '#f7f5f2' : '#6e6a65', cursor: 'pointer', transition: 'all 0.15s' }}>
            🎁 Kirim Hadiah
          </button>
        )}
      </div>

      {/* Gift picker panel */}
      {showPanel && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.125rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 40, width: '280px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selected?.emoji}</div>
              <div style={{ fontWeight: 600, color: '#059669' }}>Hadiah terkirim!</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Pilih Hadiah</div>
              {catalog.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: '#9c9690', textAlign: 'center', padding: '1rem 0' }}>Belum ada hadiah tersedia</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  {catalog.map(g => (
                    <button key={g.id} onClick={() => setSelected(selected?.id === g.id ? null : g)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '0.625rem 0.25rem', borderRadius: '8px', border: `1px solid ${selected?.id === g.id ? '#1a1a1a' : '#e5e0d8'}`, background: selected?.id === g.id ? '#f7f5f2' : '#ffffff', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '1.5rem' }}>{g.emoji}</span>
                      <span style={{ fontSize: '0.65rem', color: '#6e6a65', textAlign: 'center', lineHeight: 1.2 }}>{g.name}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: selected?.id === g.id ? '#1a1a1a' : '#9c9690' }}>{fmt(g.price)}</span>
                    </button>
                  ))}
                </div>
              )}
              {selected && (
                <>
                  <input value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Pesan (opsional)"
                    style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', outline: 'none', marginBottom: '0.625rem', boxSizing: 'border-box' }} />
                  <button onClick={send} disabled={sending}
                    style={{ width: '100%', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
                    {sending ? 'Mengirim...' : `Kirim ${selected.emoji} · ${fmt(selected.price)}`}
                  </button>
                  <p style={{ fontSize: '0.7rem', color: '#9c9690', textAlign: 'center', marginTop: '0.5rem' }}>
                    Pembayaran manual — creator akan konfirmasi
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

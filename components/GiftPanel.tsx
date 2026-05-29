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

function Avatar({ user, size = 24 }: { user: SentGift['sender']; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#f0ede8', border: '2px solid #fff',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.4}px`, fontWeight: 700, color: '#6e6a65',
    }}>
      {user.profilePic
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (user.name?.[0] ?? user.username[0]).toUpperCase()
      }
    </div>
  )
}

// Floating emoji animation — muncul dan naik saat gift terkirim
function FloatingEmoji({ emoji, onDone }: { emoji: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <span style={{
      position: 'absolute', bottom: '100%', left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '2rem', pointerEvents: 'none',
      animation: 'gift-float 1.4s ease-out forwards',
    }}>
      {emoji}
    </span>
  )
}

export default function GiftPanel({ postId, isAuthor, isLoggedIn, initialGifts }: Props) {
  const [catalog, setCatalog]     = useState<GiftItem[]>([])
  const [gifts, setGifts]         = useState<SentGift[]>(initialGifts)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState<GiftItem | null>(null)
  const [message, setMessage]     = useState('')
  const [sending, setSending]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [floats, setFloats]       = useState<{ id: number; emoji: string }[]>([])
  const [tab, setTab]             = useState<'send' | 'list'>('send')
  const panelRef  = useRef<HTMLDivElement>(null)
  const floatIdRef = useRef(0)

  useEffect(() => {
    fetch('/api/gifts').then(r => r.json()).then(setCatalog)
  }, [])

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowModal(false)
    }
    if (showModal) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [showModal])

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
      // Launch floating emoji
      const id = ++floatIdRef.current
      setFloats(f => [...f, { id, emoji: selected.emoji }])
      setTimeout(() => {
        setSuccess(false); setShowModal(false); setSelected(null); setMessage('')
      }, 1800)
    }
    setSending(false)
  }

  // Group by gift type for badges
  const grouped = gifts.reduce<Record<string, { gift: SentGift; count: number }>>((acc, g) => {
    const k = g.giftItem.id
    if (!acc[k]) acc[k] = { gift: g, count: 0 }
    acc[k].count++
    return acc
  }, {})

  // Top 3 unique gifters (by amount sent)
  const gifterMap: Record<string, { sender: SentGift['sender']; total: number }> = {}
  gifts.forEach(g => {
    const k = g.sender.username
    if (!gifterMap[k]) gifterMap[k] = { sender: g.sender, total: 0 }
    gifterMap[k].total += g.amount
  })
  const topGifters = Object.values(gifterMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const totalAmount = gifts.reduce((s, g) => s + g.amount, 0)

  return (
    <>
      {/* Inject float animation */}
      <style>{`
        @keyframes gift-float {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          60%  { opacity: 1; transform: translateX(-50%) translateY(-48px) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-72px) scale(0.8); }
        }
      `}</style>

      <div style={{ position: 'relative' }} ref={panelRef}>
        {/* Floating emojis */}
        {floats.map(f => (
          <FloatingEmoji key={f.id} emoji={f.emoji}
            onDone={() => setFloats(fs => fs.filter(x => x.id !== f.id))} />
        ))}

        {/* ── Summary row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>

          {/* Gift badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            {Object.values(grouped).map(({ gift, count }) => (
              <button key={gift.giftItem.id}
                onClick={() => { setShowModal(true); setTab('list') }}
                title={`${count}× ${gift.giftItem.name}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  background: '#fef9ec', border: '1px solid #fde68a',
                  borderRadius: '20px', padding: '0.2rem 0.625rem',
                  fontSize: '0.875rem', cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              >
                <span>{gift.giftItem.emoji}</span>
                {count > 1 && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>{count}</span>}
              </button>
            ))}
          </div>

          {/* Top gifter avatars (stacked) */}
          {topGifters.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {topGifters.map((g, i) => (
                <div key={g.sender.username} title={g.sender.name ?? `@${g.sender.username}`}
                  style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: topGifters.length - i }}>
                  <Avatar user={g.sender} size={22} />
                </div>
              ))}
              {totalAmount > 0 && (
                <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: '#9c9690' }}>
                  {fmt(totalAmount)}
                </span>
              )}
            </div>
          )}

          {/* Send button */}
          {!isAuthor && isLoggedIn && (
            <button onClick={() => { setShowModal(p => !p); setTab('send') }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: showModal ? '#1a1a1a' : '#f0ede8',
                border: `1px solid ${showModal ? '#1a1a1a' : '#e5e0d8'}`,
                borderRadius: '20px', padding: '0.3rem 0.875rem',
                fontSize: '0.8125rem', fontWeight: 600,
                color: showModal ? '#f7f5f2' : '#3d3a36',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              🎁 Kirim Hadiah
            </button>
          )}
        </div>

        {/* ── Modal ── */}
        {showModal && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: 0,
            background: '#ffffff', border: '1px solid #e5e0d8',
            borderRadius: '14px', padding: '1.25rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            zIndex: 50, width: '300px',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: '#f0ede8', borderRadius: '8px', padding: '3px', marginBottom: '1rem' }}>
              {(['send', 'list'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '0.3rem', borderRadius: '6px', border: 'none',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    background: tab === t ? '#fff' : 'transparent',
                    color: tab === t ? '#1a1a1a' : '#9c9690',
                    boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {t === 'send' ? '🎁 Kirim' : `📋 Daftar (${gifts.length})`}
                </button>
              ))}
            </div>

            {tab === 'send' ? (
              success ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{selected?.emoji}</div>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.9375rem' }}>Hadiah terkirim! 🎉</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    Pilih Hadiah
                  </div>
                  {catalog.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#9c9690', textAlign: 'center', padding: '1rem 0' }}>Belum ada hadiah</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', marginBottom: '0.875rem' }}>
                      {catalog.map(g => (
                        <button key={g.id} onClick={() => setSelected(selected?.id === g.id ? null : g)}
                          style={{
                            flexShrink: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '4px',
                            padding: '0.75rem 0.625rem', borderRadius: '10px',
                            border: `2px solid ${selected?.id === g.id ? '#1a1a1a' : '#e5e0d8'}`,
                            background: selected?.id === g.id ? '#f7f5f2' : '#fff',
                            cursor: 'pointer', transition: 'all 0.15s', minWidth: '64px',
                            transform: selected?.id === g.id ? 'scale(1.05)' : 'scale(1)',
                          }}>
                          <span style={{ fontSize: '1.75rem' }}>{g.emoji}</span>
                          <span style={{ fontSize: '0.65rem', color: '#6e6a65', textAlign: 'center', lineHeight: 1.2 }}>{g.name}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected?.id === g.id ? '#1a1a1a' : '#9c9690' }}>
                            {fmt(g.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selected && (
                    <>
                      <input value={message} onChange={e => setMessage(e.target.value)}
                        placeholder={`Pesan untuk kreator (opsional)`}
                        style={{
                          width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8',
                          borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem',
                          outline: 'none', marginBottom: '0.625rem', boxSizing: 'border-box',
                        }} />
                      <button onClick={send} disabled={sending}
                        style={{
                          width: '100%', background: '#1a1a1a', color: '#f7f5f2',
                          border: 'none', borderRadius: '8px', padding: '0.75rem',
                          fontSize: '0.9rem', fontWeight: 700,
                          cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                        }}>
                        {sending ? 'Mengirim...' : (
                          <>{selected.emoji} Kirim · <span>{fmt(selected.price)}</span></>
                        )}
                      </button>
                    </>
                  )}
                </>
              )
            ) : (
              /* List tab */
              <div>
                {gifts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9c9690', fontSize: '0.875rem', padding: '1rem 0' }}>
                    Belum ada hadiah dikirim.
                  </p>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {gifts.map(g => (
                      <div key={g.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                        padding: '0.625rem', background: '#fafaf8',
                        borderRadius: '8px', border: '1px solid #f0ede8',
                      }}>
                        <Avatar user={g.sender} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a' }}>
                              {g.sender.name ?? `@${g.sender.username}`}
                            </span>
                            <span style={{ fontSize: '1rem' }}>{g.giftItem.emoji}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: '#059669', flexShrink: 0 }}>
                              {fmt(g.amount)}
                            </span>
                          </div>
                          {g.message && (
                            <p style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.2rem', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              "{g.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

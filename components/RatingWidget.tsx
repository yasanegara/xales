'use client'

import { useState, useEffect } from 'react'

interface Props {
  postId: string
  isAuthor: boolean
}

export default function RatingWidget({ postId, isAuthor }: Props) {
  const [avg, setAvg]           = useState(0)
  const [count, setCount]       = useState(0)
  const [userRating, setUser]   = useState<number | null>(null)
  const [hovered, setHovered]   = useState<number | null>(null)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    fetch(`/api/ratings?postId=${postId}`)
      .then(r => r.json())
      .then(d => { setAvg(d.avg); setCount(d.count); setUser(d.userRating) })
  }, [postId])

  const rate = async (value: number) => {
    if (isAuthor || loading) return
    setLoading(true)
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, value }),
    })
    if (res.ok) {
      const d = await res.json()
      setUser(d.value)
      // refetch avg
      fetch(`/api/ratings?postId=${postId}`).then(r => r.json()).then(d => { setAvg(d.avg); setCount(d.count) })
    }
    setLoading(false)
  }

  const display = hovered ?? userRating ?? 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => rate(star)}
            onMouseEnter={() => !isAuthor && setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            disabled={isAuthor || loading}
            style={{
              background: 'none', border: 'none', padding: '2px',
              cursor: isAuthor ? 'default' : 'pointer',
              fontSize: '1.125rem', lineHeight: 1,
              color: star <= display ? '#f59e0b' : '#d1cdc7',
              transition: 'color 0.1s, transform 0.1s',
              transform: hovered === star && !isAuthor ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>
        {avg > 0 ? `${avg} (${count})` : count > 0 ? `(${count})` : 'Belum ada rating'}
      </span>
      {userRating && !isAuthor && (
        <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>· Kamu beri {userRating}★</span>
      )}
    </div>
  )
}

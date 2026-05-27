'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface LikeButtonProps {
  slug: string
  initialCount: number
}

export default function LikeButton({ slug, initialCount }: LikeButtonProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch(`/api/posts/${slug}/like`)
      .then((r) => r.json())
      .then((d) => setLiked(d.liked))
  }, [session, slug])

  const toggle = async () => {
    if (!session || loading) return
    setLoading(true)
    const res = await fetch(`/api/posts/${slug}/like`, { method: 'POST' })
    const data = await res.json()
    setLiked(data.liked)
    setCount((c) => (data.liked ? c + 1 : c - 1))
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={!session || loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: liked ? '#1a1a2e' : '#111111',
        border: `1px solid ${liked ? '#0070f3' : '#222222'}`,
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        color: liked ? '#0070f3' : '#888888',
        fontSize: '0.875rem',
        cursor: session ? 'pointer' : 'default',
        transition: 'all 0.15s',
        opacity: loading ? 0.6 : 1,
      }}
      title={!session ? 'Login untuk like' : undefined}
    >
      <span style={{ fontSize: '1.125rem' }}>{liked ? '♥' : '♡'}</span>
      <span style={{ fontWeight: 500 }}>{count.toLocaleString()}</span>
    </button>
  )
}

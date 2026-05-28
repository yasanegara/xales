'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  username: string
  initialFollowing?: boolean
  initialFollowerCount?: number
  size?: 'sm' | 'md'
  onFollowChange?: (following: boolean, delta: number) => void
}

export default function FollowButton({ username, initialFollowing = false, initialFollowerCount = 0, size = 'md', onFollowChange }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!session || session.user.username === username) return
    fetch(`/api/users/${username}/follow`)
      .then(r => r.json())
      .then(d => { setFollowing(d.following); setChecked(true) })
  }, [session, username])

  if (!session) return null
  if (session.user.username === username) return null
  if (!checked) return null

  const toggle = async () => {
    setLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${username}/follow`, { method })
    if (res.ok) {
      const next = !following
      setFollowing(next)
      onFollowChange?.(next, next ? 1 : -1)
      router.refresh()
    }
    setLoading(false)
  }

  const sm = size === 'sm'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        background: following ? '#f7f5f2' : '#1a1a1a',
        color: following ? '#6e6a65' : '#f7f5f2',
        border: following ? '1px solid #e5e0d8' : '1px solid #1a1a1a',
        borderRadius: sm ? '6px' : '8px',
        padding: sm ? '0.25rem 0.75rem' : '0.5rem 1.25rem',
        fontSize: sm ? '0.8125rem' : '0.875rem',
        fontWeight: 500,
        cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.15s',
      }}
    >
      {following ? 'Mengikuti' : '+ Ikuti'}
    </button>
  )
}

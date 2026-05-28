'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FollowButton from './FollowButton'

interface SuggestedUser {
  id: string
  username: string
  name: string | null
  profilePic: string | null
  bio: string | null
  status: string | null
  followerCount: number
  postCount: number
  primaryType: string
  topCategories: string[]
}

export default function SuggestedUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/suggestions?limit=6')
      .then(r => r.json())
      .then(d => { setUsers(d.suggestions ?? []); setLoading(false) })
  }, [])

  if (loading || users.length === 0) return null

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>Mungkin Kamu Suka</h2>
        <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>berdasarkan minat & jenis konten</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px',
              padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href={`/@${u.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: '#f0ede8', border: '1px solid #e5e0d8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 700, color: '#6e6a65', overflow: 'hidden',
                  }}
                >
                  {u.profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.profilePic} alt={u.name ?? u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (u.name?.[0] ?? u.username[0]).toUpperCase()
                  )}
                </div>
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/@${u.username}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.name ?? `@${u.username}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>@{u.username}</div>
                </Link>
              </div>
            </div>

            {u.status && (
              <p style={{ fontSize: '0.8125rem', color: '#6e6a65', lineHeight: 1.4, margin: 0 }}>
                {u.status}
              </p>
            )}

            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px',
                background: u.primaryType === 'html' ? '#ecfdf5' : '#eff6ff',
                color: u.primaryType === 'html' ? '#059669' : '#2563eb',
                textTransform: 'uppercase',
              }}>
                {u.primaryType === 'html' ? 'App' : 'Article'}
              </span>
              {u.topCategories.map(c => (
                <span key={c} style={{ fontSize: '0.7rem', color: '#6e6a65', background: '#f0ede8', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>
                  {c}
                </span>
              ))}
            </div>

            {/* Stats + follow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ fontSize: '0.75rem', color: '#9c9690', display: 'flex', gap: '0.75rem' }}>
                <span>{u.postCount} post</span>
                <span>{u.followerCount} pengikut</span>
              </div>
              <FollowButton username={u.username} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

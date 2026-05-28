'use client'

import { useState, useEffect } from 'react'
import FollowButton from '@/components/FollowButton'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Props {
  username: string
  name?: string | null
  profilePic?: string | null
  bio?: string | null
  status?: string | null
  createdAt: string
  postCount: number
  followers: number
  following: number
  totalViews: number
  totalLikes: number
}

export default function ProfileHeader({
  username, name, profilePic, bio, status, createdAt,
  postCount, followers, following, totalViews, totalLikes,
}: Props) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const stats = [
    { label: 'post',      value: postCount },
    { label: 'pengikut',  value: followers },
    { label: 'mengikuti', value: following },
  ]

  const avatar = (
    <div style={{
      width: mobile ? '88px' : '110px',
      height: mobile ? '88px' : '110px',
      flexShrink: 0,
      borderRadius: '12px',
      background: '#f0ede8',
      border: '1px solid #e5e0d8',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {profilePic ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePic}
          alt={name ?? username}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'top center',
            display: 'block',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.25rem', fontWeight: 700, color: '#6e6a65',
        }}>
          {(name?.[0] ?? username[0]).toUpperCase()}
        </div>
      )}
    </div>
  )

  const info = (
    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
      {/* Username + follow */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        flexWrap: 'wrap', marginBottom: '0.875rem',
        justifyContent: 'flex-start',
      }}>
        <h1 style={{ fontSize: '1.1875rem', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          {username}
        </h1>
        <FollowButton username={username} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: '1.75rem', marginBottom: '0.875rem',
        justifyContent: 'flex-start',
      }}>
        {stats.map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>
              {s.value.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.1rem' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Display name */}
      {name && (
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a1a', marginBottom: '0.2rem' }}>
          {name}
        </div>
      )}

      {/* Status */}
      {status && (
        <div style={{ fontSize: '0.875rem', color: '#6e6a65', marginBottom: '0.25rem' }}>{status}</div>
      )}

      {/* Bio */}
      {bio && (
        <div style={{
          fontSize: '0.9rem', color: '#3d3a36', lineHeight: 1.6,
          whiteSpace: 'pre-line', marginBottom: '0.375rem',
        }}>
          {bio}
        </div>
      )}

      {/* Views + join date */}
      <div style={{ fontSize: '0.8rem', color: '#9c9690' }}>
        👁 {totalViews.toLocaleString()} · ♥ {totalLikes.toLocaleString()} · Bergabung {formatDate(createdAt)}
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: mobile ? '1.25rem' : '2.5rem',
      marginBottom: '2rem',
    }}>
      {avatar}
      {info}
    </div>
  )
}

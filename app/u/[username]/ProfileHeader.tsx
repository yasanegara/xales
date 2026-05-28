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
      width:  mobile ? '100px' : '110px',
      height: mobile ? '128px' : undefined,
      flexShrink: 0,
      alignSelf: mobile ? 'center' : 'stretch',
      borderRadius: '14px',
      background: '#f0ede8',
      border: '1px solid #e5e0d8',
      overflow: 'hidden',
      position: 'relative',
      minHeight: mobile ? '128px' : '140px',
    }}>
      {profilePic ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePic}
          alt={name ?? username}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%', minHeight: '100%',
            width: 'auto', height: 'auto',
            maxWidth: 'none',
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
    <div style={{ flex: 1, minWidth: 0, textAlign: mobile ? 'center' : 'left' }}>
      {/* Username + follow */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        flexWrap: 'wrap', marginBottom: '0.875rem',
        justifyContent: mobile ? 'center' : 'flex-start',
      }}>
        <h1 style={{ fontSize: '1.1875rem', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          {username}
        </h1>
        <FollowButton username={username} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: '1.75rem', marginBottom: '0.875rem',
        justifyContent: mobile ? 'center' : 'flex-start',
      }}>
        {stats.map(s => (
          <div key={s.label} style={{ fontSize: '0.9rem', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
            <strong>{s.value.toLocaleString()}</strong>{' '}
            <span style={{ color: '#6e6a65', fontWeight: 400 }}>{s.label}</span>
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
      flexDirection: mobile ? 'column' : 'row',
      alignItems: mobile ? 'center' : 'stretch',
      gap: mobile ? '1rem' : '2.5rem',
      marginBottom: '2rem',
    }}>
      {avatar}
      {info}
    </div>
  )
}

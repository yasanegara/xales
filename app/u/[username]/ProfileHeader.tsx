'use client'

import { useState, useEffect } from 'react'
import FollowButton from '@/components/FollowButton'
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
  verified: boolean
  reputationScore: number
}


const BADGES = [
  { icon: '✍️', label: 'Kreator', desc: 'Sudah publish minimal 1 konten', color: '#6366f1', bg: '#eef2ff', active: (p: Props) => p.postCount >= 1 },
  { icon: '🔥', label: 'Populer', desc: 'Meraih 1.000+ total views',       color: '#f97316', bg: '#fff7ed', active: (p: Props) => p.totalViews >= 1000 },
  { icon: '⭐', label: 'Dikenal', desc: 'Memiliki 50+ pengikut',           color: '#f59e0b', bg: '#fffbeb', active: (p: Props) => p.followers >= 50 },
]

export default function ProfileHeader(props: Props) {
  const { username, name, profilePic, bio, status, createdAt,
    postCount, followers, following, totalViews, totalLikes,
    verified } = props

  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sz   = mobile ? '88px' : '110px'

  const stats = [
    { label: 'Post',      value: postCount },
    { label: 'Pengikut',  value: followers },
    { label: 'Mengikuti', value: following },
  ]

  return (
    <div style={{ display: 'flex', gap: mobile ? '1.25rem' : '2rem', marginBottom: '1rem', alignItems: 'flex-start' }}>

      {/* Left col */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: sz, gap: '6px' }}>
        {/* Avatar */}
        <div style={{ width: sz, height: sz, borderRadius: '12px', background: '#f0ede8', border: '1px solid #e5e0d8', overflow: 'hidden', position: 'relative' }}>
          {profilePic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilePic} alt={name ?? username}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 700, color: '#6e6a65' }}>
              {(name?.[0] ?? username[0]).toUpperCase()}
            </div>
          )}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
          {BADGES.map(badge => {
            const on = badge.active(props)
            return (
              <div key={badge.label} title={on ? `${badge.label} — ${badge.desc}` : `${badge.label} (belum aktif)`}
                style={{ flex: 1, aspectRatio: '1', borderRadius: '7px', background: on ? badge.bg : '#f0ede8', border: `1px solid ${on ? badge.color + '55' : '#e5e0d8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', filter: on ? 'none' : 'grayscale(1)', opacity: on ? 1 : 0.3, cursor: 'default' }}
              >
                {badge.icon}
              </div>
            )
          })}
        </div>

        {/* Verified */}
        <div title={verified ? 'Akun terverifikasi' : 'Belum terverifikasi'}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', background: verified ? '#eff6ff' : '#f0ede8', border: `1px solid ${verified ? '#93c5fd' : '#e5e0d8'}`, borderRadius: '7px', padding: '0.275rem 0.5rem', filter: verified ? 'none' : 'grayscale(1)', opacity: verified ? 1 : 0.35 }}>
          <span style={{ fontSize: '0.75rem', color: verified ? '#1d4ed8' : '#6e6a65' }}>✓</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: verified ? '#1d4ed8' : '#6e6a65' }}>Terverifikasi</span>
        </div>

      </div>

      {/* Right col */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>

        {/* Display name + Follow */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: mobile ? '1.125rem' : '1.3125rem', fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
            {name ?? username}
          </h1>
          <FollowButton username={username} />
        </div>

        {/* @username */}
        <div style={{ fontSize: '0.8125rem', color: '#9c9690', marginBottom: '0.875rem' }}>
          @{username}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: mobile ? '1.25rem' : '2rem', marginBottom: '0.875rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15 }}>
                {s.value.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#9c9690', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Status */}
        {status && (
          <div style={{ fontSize: '0.875rem', color: '#6e6a65', marginBottom: '0.3rem', fontStyle: 'italic' }}>{status}</div>
        )}

        {/* Bio */}
        {bio && (
          <div style={{ fontSize: '0.9rem', color: '#3d3a36', lineHeight: 1.65, whiteSpace: 'pre-line', marginBottom: '0.5rem' }}>
            {bio}
          </div>
        )}

        {/* Footer: views + join */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.775rem', color: '#b0aca6', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <span>👁 {totalViews.toLocaleString()}</span>
          <span>·</span>
          <span>♥ {totalLikes.toLocaleString()}</span>
          <span>·</span>
          <span>Bergabung {formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

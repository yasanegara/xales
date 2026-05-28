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

function reputationLevel(score: number) {
  if (score >= 2000) return { label: 'Master',       color: '#7c3aed', bg: '#f5f3ff' }
  if (score >= 500)  return { label: 'Kreator Pro',  color: '#0284c7', bg: '#f0f9ff' }
  if (score >= 100)  return { label: 'Kontributor',  color: '#059669', bg: '#f0fdf4' }
  return               { label: 'Pemula',          color: '#9c9690', bg: '#f7f5f2' }
}

// Badge rules — active when condition met
const BADGES = [
  {
    icon: '✍️',
    label: 'Kreator',
    desc: 'Sudah publish minimal 1 konten',
    color: '#6366f1',
    bg: '#eef2ff',
    active: (p: Props) => p.postCount >= 1,
  },
  {
    icon: '🔥',
    label: 'Populer',
    desc: 'Meraih 1.000+ total views',
    color: '#f97316',
    bg: '#fff7ed',
    active: (p: Props) => p.totalViews >= 1000,
  },
  {
    icon: '⭐',
    label: 'Dikenal',
    desc: 'Memiliki 50+ pengikut',
    color: '#f59e0b',
    bg: '#fffbeb',
    active: (p: Props) => p.followers >= 50,
  },
]

export default function ProfileHeader(props: Props) {
  const { username, name, profilePic, bio, status, createdAt,
    postCount, followers, following, totalViews, totalLikes,
    verified, reputationScore } = props

  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sz = mobile ? '88px' : '110px'
  const stats = [
    { label: 'post',      value: postCount },
    { label: 'pengikut',  value: followers },
    { label: 'mengikuti', value: following },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
      gap: mobile ? '1.25rem' : '2rem', marginBottom: '2rem',
    }}>

      {/* Left col: avatar + badges */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexShrink: 0, width: sz }}>

        {/* Avatar */}
        <div style={{
          width: sz, height: sz, borderRadius: '12px',
          background: '#f0ede8', border: '1px solid #e5e0d8',
          overflow: 'hidden', position: 'relative',
        }}>
          {profilePic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilePic} alt={name ?? username}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 700, color: '#6e6a65' }}>
              {(name?.[0] ?? username[0]).toUpperCase()}
            </div>
          )}
        </div>

        {/* Badge slots */}
        <div style={{ display: 'flex', gap: '5px', marginTop: '0.625rem', width: '100%' }}>
          {BADGES.map(badge => {
            const on = badge.active(props)
            return (
              <div
                key={badge.label}
                title={on ? `${badge.label} — ${badge.desc}` : `${badge.label} (belum aktif: ${badge.desc})`}
                style={{
                  flex: 1, aspectRatio: '1', borderRadius: '8px',
                  background: on ? badge.bg : '#f0ede8',
                  border: `1px solid ${on ? badge.color + '55' : '#e5e0d8'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                  filter: on ? 'none' : 'grayscale(1)',
                  opacity: on ? 1 : 0.35,
                  cursor: 'default', transition: 'all 0.2s',
                }}
              >
                {badge.icon}
              </div>
            )
          })}
        </div>

        {/* Verified */}
        <div
          title={verified ? 'Akun terverifikasi' : 'Belum terverifikasi'}
          style={{
            marginTop: '5px', width: '100%',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: verified ? '#eff6ff' : '#f0ede8',
            border: `1px solid ${verified ? '#93c5fd' : '#e5e0d8'}`,
            borderRadius: '8px', padding: '0.3rem 0.5rem',
            filter: verified ? 'none' : 'grayscale(1)',
            opacity: verified ? 1 : 0.35,
          }}
        >
          <span style={{ fontSize: '0.85rem' }}>✓</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: verified ? '#1d4ed8' : '#6e6a65' }}>
            Terverifikasi
          </span>
        </div>

        {/* Reputation score */}
        {(() => {
          const lvl = reputationLevel(reputationScore)
          return (
            <div
              title={`Skor reputasi: ${reputationScore} poin`}
              style={{
                marginTop: '5px', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: lvl.bg, border: `1px solid ${lvl.color}44`,
                borderRadius: '8px', padding: '0.3rem 0.5rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: lvl.color }}>{lvl.label}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: lvl.color }}>{reputationScore}</span>
            </div>
          )
        })()}
      </div>

      {/* Right col: username, stats, name, status, bio */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Username + follow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          <h1 style={{ fontSize: '1.1875rem', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
            {username}
          </h1>
          <FollowButton username={username} />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.75rem', marginBottom: '0.875rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>
                {s.value.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6e6a65', marginTop: '0.1rem' }}>{s.label}</span>
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
          <div style={{ fontSize: '0.9rem', color: '#3d3a36', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '0.375rem' }}>
            {bio}
          </div>
        )}

        {/* Views + join */}
        <div style={{ fontSize: '0.8rem', color: '#9c9690' }}>
          👁 {totalViews.toLocaleString()} · ♥ {totalLikes.toLocaleString()} · Bergabung {formatDate(createdAt)}
        </div>
      </div>
    </div>
  )
}

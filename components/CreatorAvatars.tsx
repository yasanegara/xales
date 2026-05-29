'use client'

import Link from 'next/link'

interface Creator {
  username: string
  name: string | null
  profilePic: string | null
  _count: { posts: number }
}

// Cycle through 3 sizes and 5 vertical offsets for asymmetric feel
const SIZES = [44, 52, 36, 48, 40, 56, 38, 50, 42, 46]
const OFFSETS = [0, -8, 4, -4, 8, -6, 2, -10, 6, -2]

export default function CreatorAvatars({
  creators,
  totalUsers,
  session,
}: {
  creators: Creator[]
  totalUsers: number
  session: boolean
}) {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Stats row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>
            {totalUsers.toLocaleString('id-ID')} kreator
          </span>
          <span style={{ fontSize: '0.875rem', color: '#9c9690' }}> sudah bergabung</span>
        </div>
        {!session && (
          <Link href="/register" style={{
            fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a',
            textDecoration: 'none', borderBottom: '1.5px solid #1a1a1a', paddingBottom: '1px',
          }}>
            Bergabung sekarang →
          </Link>
        )}
      </div>

      {/* Asymmetric avatar row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0', rowGap: '1rem' }}>
        {creators.map((creator, i) => {
          const size = SIZES[i % SIZES.length]
          const offsetY = OFFSETS[i % OFFSETS.length]
          const label = creator.name ?? `@${creator.username}`

          return (
            <Link
              key={creator.username}
              href={`/@${creator.username}`}
              title={label}
              style={{
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: i < creators.length - 1 ? '-6px' : '0',
                transform: `translateY(${offsetY}px)`,
                zIndex: creators.length - i,
                position: 'relative',
                transition: 'transform 0.18s, z-index 0s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = `translateY(${offsetY - 8}px) scale(1.12)`
                el.style.zIndex = '99'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = `translateY(${offsetY}px) scale(1)`
                el.style.zIndex = String(creators.length - i)
              }}
            >
              <div style={{
                width: size, height: size,
                borderRadius: '50%',
                border: '2.5px solid #f7f5f2',
                background: '#f0ede8',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: `${size * 0.38}px`, fontWeight: 700, color: '#6e6a65',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                flexShrink: 0,
              }}>
                {creator.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creator.profilePic}
                    alt={label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                ) : (
                  (creator.name?.[0] ?? creator.username[0]).toUpperCase()
                )}
              </div>
            </Link>
          )
        })}

        {/* +N more badge */}
        {totalUsers > creators.length && (
          <Link
            href="/register"
            style={{
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44,
              borderRadius: '50%',
              border: '2.5px solid #f7f5f2',
              background: '#1a1a1a',
              color: '#f7f5f2',
              fontSize: '0.6875rem', fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              marginLeft: '8px',
              flexShrink: 0,
            }}
          >
            +{(totalUsers - creators.length).toLocaleString('id-ID')}
          </Link>
        )}
      </div>
    </div>
  )
}

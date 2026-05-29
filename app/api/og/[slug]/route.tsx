import { ImageResponse } from 'next/og'
import { db } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await db.post.findUnique({
    where: { slug, published: true },
    select: {
      title: true,
      description: true,
      type: true,
      author: { select: { name: true, username: true } },
    },
  })

  if (!post) return new Response('Not found', { status: 404 })

  const authorName = post.author.name ?? `@${post.author.username}`
  const desc = post.description
    ? post.description.length > 110
      ? post.description.slice(0, 110) + '…'
      : post.description
    : null

  // Adaptive title font size
  const titleLen = post.title.length
  const titleSize = titleLen > 70 ? 52 : titleLen > 45 ? 64 : 76

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(150deg, #faf7f2 0%, #ede8e0 100%)',
          padding: '0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'relative',
        }}
      >
        {/* Left accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '630px', background: '#1a1a1a' }} />

        {/* Content area */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px', paddingLeft: '80px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#9c9690', letterSpacing: '-0.02em' }}>
              tweak
            </span>
            <span style={{ fontSize: '14px', color: '#c8c2b8' }}>·</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: post.type === 'html' ? '#059669' : '#2563eb',
                background: post.type === 'html' ? '#ecfdf5' : '#eff6ff',
                padding: '3px 10px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {post.type === 'html' ? 'App' : 'Article'}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: `${titleSize}px`,
              fontWeight: 800,
              color: '#1a1a1a',
              lineHeight: 1.25,
              marginBottom: '24px',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {post.title}
          </div>

          {/* Description */}
          {desc && (
            <div style={{ fontSize: '26px', color: '#6e6a65', lineHeight: 1.55, marginBottom: '36px' }}>
              {desc}
            </div>
          )}
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#1a1a1a',
            padding: '20px 80px',
          }}
        >
          <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.65)' }}>
            oleh {authorName}
          </span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
            tweak.id
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

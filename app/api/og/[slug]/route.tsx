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
      coverImage: true,
      author: { select: { name: true, username: true } },
    },
  })

  if (!post) return new Response('Not found', { status: 404 })

  const authorName = post.author.name ?? `@${post.author.username}`
  const desc = post.description
    ? post.description.length > 100 ? post.description.slice(0, 100) + '…' : post.description
    : null

  const hasCover = !!post.coverImage
  const isBase64Cover = post.coverImage?.startsWith('data:')
  const isUrlCover = post.coverImage?.startsWith('http')

  // Cover image src for <img> in ImageResponse
  const coverSrc = isBase64Cover ? post.coverImage! : isUrlCover ? post.coverImage! : null

  const titleLen = post.title.length
  const titleSize = hasCover
    ? (titleLen > 60 ? 44 : titleLen > 40 ? 52 : 62)
    : (titleLen > 70 ? 52 : titleLen > 45 ? 64 : 76)

  return new ImageResponse(
    hasCover && coverSrc ? (
      // ── Layout with cover: image right half, text left half ──────────────
      <div style={{ width: '1200px', height: '630px', display: 'flex', position: 'relative', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {/* Left: text panel */}
        <div style={{ width: '600px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(150deg, #faf7f2 0%, #ede8e0 100%)', padding: '0', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '630px', background: '#1a1a1a' }} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '48px 48px 48px 60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#9c9690' }}>Tweak</span>
              <span style={{ fontSize: '13px', color: '#c8c2b8' }}>·</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: post.type === 'html' ? '#059669' : '#2563eb', background: post.type === 'html' ? '#ecfdf5' : '#eff6ff', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {post.type === 'html' ? 'App' : 'Article'}
              </span>
            </div>
            <div style={{ fontSize: `${titleSize}px`, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.25, flex: 1, display: 'flex', alignItems: 'center' }}>
              {post.title}
            </div>
            {desc && (
              <div style={{ fontSize: '20px', color: '#6e6a65', lineHeight: 1.55, marginBottom: '24px' }}>{desc}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', padding: '18px 48px 18px 60px' }}>
            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)' }}>oleh {authorName}</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>tweak.id</span>
          </div>
        </div>

        {/* Right: cover image */}
        <div style={{ width: '600px', height: '630px', overflow: 'hidden', display: 'flex' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    ) : (
      // ── Text-only layout (no cover) ───────────────────────────────────────
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(150deg, #faf7f2 0%, #ede8e0 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '630px', background: '#1a1a1a' }} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px', paddingLeft: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#9c9690' }}>Tweak</span>
            <span style={{ fontSize: '14px', color: '#c8c2b8' }}>·</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: post.type === 'html' ? '#059669' : '#2563eb', background: post.type === 'html' ? '#ecfdf5' : '#eff6ff', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {post.type === 'html' ? 'App' : 'Article'}
            </span>
          </div>
          <div style={{ fontSize: `${titleSize}px`, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.25, marginBottom: '24px', flex: 1, display: 'flex', alignItems: 'center' }}>
            {post.title}
          </div>
          {desc && (
            <div style={{ fontSize: '26px', color: '#6e6a65', lineHeight: 1.55, marginBottom: '36px' }}>{desc}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', padding: '20px 80px' }}>
          <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.65)' }}>oleh {authorName}</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>tweak.id</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

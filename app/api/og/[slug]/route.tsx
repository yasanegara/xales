import { ImageResponse } from 'next/og'
import { db } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const fwdHost  = req.headers.get('x-forwarded-host')
  const fwdProto = req.headers.get('x-forwarded-proto') ?? 'https'
  const rawHost  = new URL(req.url).host
  const host     = (fwdHost ?? (rawHost.includes('localhost') ? 'xales.id' : rawHost)) || 'xales.id'
  const proto    = fwdHost ? fwdProto : 'https'
  const baseUrl  = `${proto}://${host}`

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
    ? post.description.length > 110 ? post.description.slice(0, 110) + '…' : post.description
    : null

  const coverSrc = post.coverImage?.startsWith('data:') || post.coverImage?.startsWith('http')
    ? post.coverImage
    : null

  const titleLen  = post.title.length
  const titleSize = coverSrc
    ? (titleLen > 60 ? 46 : titleLen > 40 ? 56 : 68)
    : (titleLen > 70 ? 52 : titleLen > 45 ? 64 : 76)

  const typeLabel = post.type === 'html' ? 'App' : 'Article'
  const typeBg    = post.type === 'html' ? '#065f46' : '#1e40af'

  return new ImageResponse(
    coverSrc ? (
      // ── Cover penuh + gradient overlay ─────────────────────────────────────
      <div style={{ width: '1200px', height: '630px', display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Cover image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverSrc} alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Dark gradient overlay */}
        <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.12) 100%)', display: 'flex' }} />

        {/* Top badges */}
        <div style={{ position: 'absolute', top: '36px', left: '48px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', fontFamily: '-apple-system, sans-serif' }}>Tweak</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', background: typeBg, padding: '4px 10px', borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '-apple-system, sans-serif' }}>
            {typeLabel}
          </span>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: `${titleSize}px`, fontWeight: 800, color: '#ffffff', lineHeight: 1.25, fontFamily: 'Georgia, serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.title}
          </div>
          {desc && (
            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, fontFamily: '-apple-system, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {desc}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', fontFamily: '-apple-system, sans-serif' }}>oleh {authorName}</span>
            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', fontFamily: '-apple-system, sans-serif' }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${baseUrl}/tweak-icon.png`} alt="" width={22} height={22} style={{ borderRadius: '4px' }} />
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: '-apple-system, sans-serif' }}>xales.id</span>
            </div>
          </div>
        </div>
      </div>
    ) : (
      // ── Text-only layout (no cover) ───────────────────────────────────────
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(150deg, #faf7f2 0%, #ede8e0 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '8px', height: '630px', background: '#1a1a1a' }} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px', paddingLeft: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#9c9690' }}>Tweak</span>
            <span style={{ fontSize: '14px', color: '#c8c2b8' }}>·</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: post.type === 'html' ? '#059669' : '#2563eb', background: post.type === 'html' ? '#ecfdf5' : '#eff6ff', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {typeLabel}
            </span>
          </div>
          <div style={{ fontSize: `${titleSize}px`, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.25, marginBottom: '24px', flex: 1, display: 'flex', alignItems: 'center', fontFamily: 'Georgia, serif' }}>
            {post.title}
          </div>
          {desc && (
            <div style={{ fontSize: '26px', color: '#6e6a65', lineHeight: 1.55, marginBottom: '36px' }}>{desc}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', padding: '20px 80px' }}>
          <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.65)' }}>oleh {authorName}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${baseUrl}/tweak-icon.png`} alt="" width={28} height={28} style={{ borderRadius: '6px' }} />
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>xales.id</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

interface Creator {
  username: string
  name: string | null
  profilePic: string | null
  _count: { posts: number }
}

const CFGS = [
  { bx:-190, by:-55, sz:76, d:0.050, f:0.38, rx:10, ry: 8 },
  { bx:-112, by:-82, sz:58, d:0.080, f:0.43, rx: 8, ry:11 },
  { bx: -44, by:-70, sz:52, d:0.100, f:0.50, rx: 7, ry: 9 },
  { bx:  28, by:-78, sz:82, d:0.040, f:0.36, rx:11, ry: 9 },
  { bx: 100, by:-62, sz:64, d:0.070, f:0.46, rx: 9, ry: 8 },
  { bx: 170, by:-48, sz:70, d:0.060, f:0.41, rx: 8, ry:12 },
  { bx:-200, by: 14, sz:52, d:0.090, f:0.53, rx: 7, ry: 8 },
  { bx:-128, by: 42, sz:82, d:0.040, f:0.35, rx:12, ry:10 },
  { bx: -54, by: 66, sz:64, d:0.070, f:0.48, rx: 9, ry: 9 },
  { bx:  18, by: 56, sz:52, d:0.090, f:0.44, rx: 7, ry:10 },
  { bx:  90, by: 72, sz:76, d:0.050, f:0.39, rx:10, ry: 8 },
  { bx: 162, by: 48, sz:58, d:0.080, f:0.52, rx: 8, ry:10 },
  { bx:-174, by:-18, sz:64, d:0.060, f:0.45, rx: 9, ry: 8 },
  { bx: 196, by: 16, sz:52, d:0.090, f:0.37, rx: 7, ry:11 },
  { bx: -90, by: -8, sz:70, d:0.050, f:0.42, rx:10, ry: 9 },
  { bx:  56, by:-20, sz:58, d:0.070, f:0.49, rx: 8, ry: 8 },
  { bx: -18, by: 24, sz:76, d:0.040, f:0.40, rx:10, ry: 9 },
  { bx: 124, by: 20, sz:52, d:0.100, f:0.55, rx: 7, ry: 9 },
]

const PHASES = CFGS.map((_, i) => (i / CFGS.length) * Math.PI * 2)

// Pre-compute connections between nearby avatars (base-position distance < 165px)
const CONNECTIONS: [number, number][] = []
for (let i = 0; i < CFGS.length; i++) {
  for (let j = i + 1; j < CFGS.length; j++) {
    const dx = CFGS[i].bx - CFGS[j].bx
    const dy = CFGS[i].by - CFGS[j].by
    if (Math.sqrt(dx * dx + dy * dy) < 165) CONNECTIONS.push([i, j])
  }
}

export default function CreatorAvatars({
  creators,
  totalUsers,
  session,
}: {
  creators: Creator[]
  totalUsers: number
  session: boolean
}) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const avatarRefs    = useRef<(HTMLElement | null)[]>([])
  const lineRefs      = useRef<(SVGLineElement | null)[]>([])
  const nodeRefs      = useRef<(SVGCircleElement | null)[]>([])
  const posRef        = useRef(CFGS.map(() => ({ x: 0, y: 0 })))
  const mouseRef      = useRef({ nx: 0.5, ny: 0.5, active: false })
  const idleTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerSize = useRef({ w: 560, h: 260 })
  const scaleRef      = useRef(1)

  const [scale, setScale] = useState(1)
  const count   = Math.min(creators.length, CFGS.length)
  const cfgsRef = useRef(CFGS.slice(0, count))
  cfgsRef.current = CFGS.slice(0, count)

  // Valid connections given current count
  const validConns = CONNECTIONS.filter(([a, b]) => a < count && b < count)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      const h = e.contentRect.height
      containerSize.current = { w, h }
      const s = Math.min(1, Math.max(0.42, w / 560))
      scaleRef.current = s
      setScale(s)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    let raf: number
    const loop = (ts: number) => {
      const t = ts / 1000
      const s = scaleRef.current
      const { w, h } = containerSize.current
      const cx = w / 2
      const cy = h / 2

      // Update avatar positions
      cfgsRef.current.forEach((c, i) => {
        const el  = avatarRefs.current[i]
        const pos = posRef.current[i]
        if (!el || !pos) return

        let tx: number, ty: number
        if (mouseRef.current.active) {
          tx = (mouseRef.current.nx - 0.5) * c.d * 380
          ty = (mouseRef.current.ny - 0.5) * c.d * 220
          pos.x += (tx - pos.x) * 0.09
          pos.y += (ty - pos.y) * 0.09
        } else {
          const phase = PHASES[i]
          tx = Math.cos(t * c.f + phase) * c.rx
          ty = Math.sin(t * c.f + phase) * c.ry
          pos.x += (tx - pos.x) * 0.028
          pos.y += (ty - pos.y) * 0.028
        }
        el.style.transform = `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
      })

      // Update SVG lines + nodes
      validConns.forEach(([ai, bi], ci) => {
        const lineEl = lineRefs.current[ci]
        const nodeEl = nodeRefs.current[ci]
        if (!lineEl || !nodeEl) return

        const pa = posRef.current[ai]
        const pb = posRef.current[bi]
        const x1 = cx + CFGS[ai].bx * s + pa.x
        const y1 = cy + CFGS[ai].by * s + pa.y
        const x2 = cx + CFGS[bi].bx * s + pb.x
        const y2 = cy + CFGS[bi].by * s + pb.y

        lineEl.setAttribute('x1', x1.toFixed(1))
        lineEl.setAttribute('y1', y1.toFixed(1))
        lineEl.setAttribute('x2', x2.toFixed(1))
        lineEl.setAttribute('y2', y2.toFixed(1))

        nodeEl.setAttribute('cx', ((x1 + x2) / 2).toFixed(1))
        nodeEl.setAttribute('cy', ((y1 + y2) / 2).toFixed(1))
      })

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activate = (nx: number, ny: number) => {
    mouseRef.current = { nx, ny, active: true }
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => { mouseRef.current.active = false }, 2000)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = containerRef.current?.getBoundingClientRect()
    if (!r) return
    activate((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
  }

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const r = containerRef.current?.getBoundingClientRect()
    if (!r) return
    activate(
      (e.touches[0].clientX - r.left) / r.width,
      (e.touches[0].clientY - r.top) / r.height,
    )
  }

  return (
    <div>
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseLeave={() => { mouseRef.current.active = false }}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { mouseRef.current.active = false }}
        style={{ position: 'relative', height: '260px', overflow: 'hidden' }}
      >
        {/* SVG layer — lines + midpoint nodes */}
        <svg
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 0,
            overflow: 'hidden',
          }}
        >
          {validConns.map(([, ], ci) => (
            <g key={ci}>
              <line
                ref={el => { lineRefs.current[ci] = el }}
                stroke="#d0c8bc"
                strokeWidth="0.75"
                strokeLinecap="round"
              />
              <circle
                ref={el => { nodeRefs.current[ci] = el }}
                r="2"
                fill="#c4bbb0"
              />
            </g>
          ))}
        </svg>

        {/* Avatar links — above SVG */}
        {CFGS.slice(0, count).map((cfg, i) => {
          const cr  = creators[i]
          const lbl = cr.name ?? `@${cr.username}`
          const sz  = Math.round(cfg.sz * scale)

          return (
            <Link
              key={cr.username}
              href={`/@${cr.username}`}
              title={lbl}
              style={{
                position: 'absolute',
                left: `calc(50% + ${cfg.bx * scale}px)`,
                top:  `calc(50% + ${cfg.by * scale}px)`,
                textDecoration: 'none',
                display: 'block',
                zIndex: CFGS.length - i + 1,
              }}
            >
              <div
                ref={el => { avatarRefs.current[i] = el }}
                style={{
                  width: sz, height: sz,
                  borderRadius: '10px',
                  background: '#f0ede8',
                  border: '2.5px solid rgba(255,255,255,0.95)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: `${sz * 0.38}px`, fontWeight: 700, color: '#6e6a65',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.11)',
                  transform: 'translate(-50%, -50%)',
                  willChange: 'transform',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.11)' }}
              >
                {cr.profilePic
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={cr.profilePic} alt={lbl} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  : (cr.name?.[0] ?? cr.username[0]).toUpperCase()
                }
              </div>
            </Link>
          )
        })}
      </div>

      {/* Stats + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a1a' }}>
            {totalUsers.toLocaleString('id-ID')} kreator
          </span>
          <span style={{ fontSize: '0.875rem', color: '#9c9690' }}> sudah bergabung</span>
        </div>
        {!session && (
          <Link href="/register" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', borderBottom: '1.5px solid #1a1a1a', paddingBottom: '1px' }}>
            Bergabung sekarang →
          </Link>
        )}
      </div>
    </div>
  )
}

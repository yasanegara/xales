'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

interface Creator {
  username: string
  name: string | null
  profilePic: string | null
  _count: { posts: number }
}

// Base positions relative to container center (reference width 560px)
// depth = parallax sensitivity, freq/amp = idle float params
const CFGS = [
  { bx:-190, by:-55, sz:76, d:0.050, fx:0.40, fy:0.35, px:0.0, py:1.2, ax:8,  ay:10 },
  { bx:-112, by:-82, sz:58, d:0.080, fx:0.50, fy:0.45, px:2.1, py:0.7, ax:7,  ay:12 },
  { bx: -44, by:-70, sz:52, d:0.100, fx:0.30, fy:0.55, px:1.0, py:2.5, ax:6,  ay: 8 },
  { bx:  28, by:-78, sz:82, d:0.040, fx:0.45, fy:0.40, px:3.2, py:0.3, ax:9,  ay:11 },
  { bx: 100, by:-62, sz:64, d:0.070, fx:0.35, fy:0.50, px:0.8, py:1.8, ax:7,  ay: 9 },
  { bx: 170, by:-48, sz:70, d:0.060, fx:0.55, fy:0.30, px:1.5, py:0.9, ax:8,  ay:13 },
  { bx:-200, by: 14, sz:52, d:0.090, fx:0.42, fy:0.48, px:2.7, py:1.4, ax:6,  ay: 8 },
  { bx:-128, by: 42, sz:82, d:0.040, fx:0.38, fy:0.42, px:0.5, py:2.1, ax:10, ay:12 },
  { bx: -54, by: 66, sz:64, d:0.070, fx:0.52, fy:0.36, px:1.9, py:0.6, ax:7,  ay:10 },
  { bx:  18, by: 56, sz:52, d:0.090, fx:0.31, fy:0.53, px:2.3, py:1.7, ax:6,  ay: 9 },
  { bx:  90, by: 72, sz:76, d:0.050, fx:0.47, fy:0.38, px:0.2, py:2.8, ax:8,  ay:11 },
  { bx: 162, by: 48, sz:58, d:0.080, fx:0.36, fy:0.44, px:3.0, py:1.0, ax:7,  ay:10 },
  { bx:-174, by:-18, sz:64, d:0.060, fx:0.44, fy:0.52, px:1.2, py:2.3, ax:8,  ay: 9 },
  { bx: 196, by: 16, sz:52, d:0.090, fx:0.33, fy:0.41, px:2.6, py:0.4, ax:6,  ay:11 },
  { bx: -90, by: -8, sz:70, d:0.050, fx:0.49, fy:0.46, px:0.9, py:1.5, ax:9,  ay:12 },
  { bx:  56, by:-20, sz:58, d:0.070, fx:0.41, fy:0.34, px:1.7, py:2.6, ax:7,  ay: 8 },
  { bx: -18, by: 24, sz:76, d:0.040, fx:0.37, fy:0.51, px:3.1, py:0.8, ax:8,  ay:10 },
  { bx: 124, by: 20, sz:52, d:0.100, fx:0.53, fy:0.39, px:0.4, py:1.9, ax:6,  ay: 9 },
]

export default function CreatorAvatars({
  creators,
  totalUsers,
  session,
}: {
  creators: Creator[]
  totalUsers: number
  session: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const avatarRefs   = useRef<(HTMLElement | null)[]>([])
  const posRef       = useRef(CFGS.map(() => ({ x: 0, y: 0 })))
  const mouseRef     = useRef({ nx: 0.5, ny: 0.5, active: false })
  const idleTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [scale, setScale] = useState(1)

  const count   = Math.min(creators.length, CFGS.length)
  const cfgsRef = useRef(CFGS.slice(0, count))
  cfgsRef.current = CFGS.slice(0, count)

  // Scale to container width
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([e]) => {
      setScale(Math.min(1, Math.max(0.42, e.contentRect.width / 560)))
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // RAF animation loop — direct DOM mutation, no re-renders
  useEffect(() => {
    let raf: number
    const loop = (ts: number) => {
      const t = ts / 1000
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
          tx = Math.sin(t * c.fx + c.px) * c.ax
          ty = Math.sin(t * c.fy + c.py) * c.ay
          pos.x += (tx - pos.x) * 0.022
          pos.y += (ty - pos.y) * 0.022
        }
        el.style.transform = `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
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
      {/* Cluster */}
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseLeave={() => { mouseRef.current.active = false }}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { mouseRef.current.active = false }}
        style={{ position: 'relative', height: '260px', overflow: 'hidden' }}
      >
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
                zIndex: CFGS.length - i,
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

      {/* Stats + CTA — below cluster */}
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

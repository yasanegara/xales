'use client'

import { useState, useEffect } from 'react'
import type { Heading } from '@/lib/headings'

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Active heading tracking
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-72px 0px -70% 0px', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (headings.length === 0) return null

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger toggle — fixed left side */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Daftar Isi"
        title="Daftar Isi"
        style={{
          position: 'fixed',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: '#ffffff',
          border: '1px solid #e5e0d8',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          transition: 'box-shadow 0.15s',
        }}
      >
        {isOpen ? (
          <span style={{ fontSize: '1rem', color: '#1a1a1a', lineHeight: 1 }}>✕</span>
        ) : (
          <>
            <span style={{ display: 'block', width: '14px', height: '1.5px', background: '#1a1a1a', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '14px', height: '1.5px', background: '#1a1a1a', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '10px', height: '1.5px', background: '#1a1a1a', borderRadius: '2px', alignSelf: 'flex-start', marginLeft: '2px' }} />
          </>
        )}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 48,
          background: 'rgba(26,26,26,0.15)',
          backdropFilter: 'blur(1px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
      />

      {/* TOC Drawer — slides in from left */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          background: '#ffffff',
          borderRight: '1px solid #e5e0d8',
          boxShadow: '4px 0 32px rgba(0,0,0,0.1)',
          zIndex: 49,
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 0.75rem',
            borderBottom: '1px solid #f0ede8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: '#ffffff',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Daftar Isi
          </span>
          <span style={{ fontSize: '0.7rem', color: '#9c9690' }}>{headings.length} bagian</span>
        </div>

        {/* TOC list */}
        <nav style={{ padding: '0.75rem 0.75rem 2rem', flex: 1 }}>
          {headings.map((h, i) => (
            <button
              key={i}
              onClick={() => scrollTo(h.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                padding: '0.375rem 0.625rem',
                paddingLeft: `${0.625 + (h.level - 1) * 1}rem`,
                fontSize: h.level === 1 ? '0.875rem' : '0.8125rem',
                lineHeight: 1.5,
                borderRadius: '6px',
                color: activeId === h.id ? '#1a1a1a' : h.level === 1 ? '#3d3a36' : '#6e6a65',
                fontWeight: activeId === h.id ? 600 : h.level === 1 ? 500 : 400,
                background: activeId === h.id ? '#f0ede8' : 'transparent',
                borderLeft: `2px solid ${activeId === h.id ? '#1a1a1a' : 'transparent'}`,
                transition: 'all 0.15s',
                marginBottom: '0.125rem',
              }}
            >
              {h.text}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}

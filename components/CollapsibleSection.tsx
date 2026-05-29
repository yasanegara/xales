'use client'

import { useState } from 'react'

interface Props {
  title: React.ReactNode
  right?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleSection({ title, right, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: 'none', border: 'none', borderBottom: open ? '1px solid #e5e0d8' : 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {right && <span onClick={e => e.stopPropagation()}>{right}</span>}
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ flexShrink: 0, transition: 'transform 0.2s ease', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          >
            <path d="M4 6l4 4 4-4" stroke="#9c9690" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && <div>{children}</div>}
    </div>
  )
}

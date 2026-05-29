'use client'

import { useState } from 'react'

interface Props {
  title: string
  url: string
}

export default function AppShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or not supported — fall through to copy
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={share}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        background: 'none', border: '1px solid #e5e0d8',
        borderRadius: '6px', padding: '0.25rem 0.625rem',
        fontSize: '0.75rem', fontWeight: 600,
        color: copied ? '#059669' : '#1a1a1a',
        cursor: 'pointer', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ Tersalin' : '↑ Bagikan'}
    </button>
  )
}

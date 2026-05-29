'use client'

import { useState, useEffect } from 'react'
import { READING_EVENT } from './TampilanButton'

const FONT_SIZES = { sm: '0.9rem', md: '1rem', lg: '1.175rem' } as const
type FontSize = keyof typeof FONT_SIZES

const FONT_FAMILIES = {
  sans:  'system-ui, -apple-system, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono:  'var(--font-mono, monospace)',
} as const
type FontFamily = keyof typeof FONT_FAMILIES

interface Props {
  children: React.ReactNode
  isMarkdown: boolean
}

export default function ReadingWrapper({ children, isMarkdown }: Props) {
  const [readMode,   setReadMode]   = useState(false)
  const [fontSize,   setFontSize]   = useState<FontSize>('md')
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans')

  useEffect(() => {
    const mode = localStorage.getItem('tweak_read_mode')
    const size = localStorage.getItem('tweak_font_size') as FontSize | null
    const fam  = localStorage.getItem('tweak_font_family') as FontFamily | null
    if (mode === '1') setReadMode(true)
    if (size && size in FONT_SIZES) setFontSize(size)
    if (fam  && fam  in FONT_FAMILIES) setFontFamily(fam)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { readMode: rm, fontSize: fs, fontFamily: ff } = (e as CustomEvent).detail
      setReadMode(rm)
      setFontSize(fs)
      if (ff) setFontFamily(ff)
    }
    window.addEventListener(READING_EVENT, handler)
    return () => window.removeEventListener(READING_EVENT, handler)
  }, [])

  if (!isMarkdown) return <>{children}</>

  const contentStyle: React.CSSProperties = {
    fontFamily: FONT_FAMILIES[fontFamily],
    fontSize: FONT_SIZES[fontSize],
    ...(readMode
      ? { background: '#faf7f0', borderRadius: '12px', padding: '2.5rem 3rem', color: '#2d2420', lineHeight: 1.85 }
      : {}),
  }

  return <div style={contentStyle}>{children}</div>
}

'use client'

import { useState, useEffect } from 'react'
import { READING_EVENT } from './TampilanButton'

const FONT_SIZES = { sm: '0.9rem', md: '1rem', lg: '1.175rem' } as const
type FontSize = keyof typeof FONT_SIZES

interface Props {
  children: React.ReactNode
  isMarkdown: boolean
}

export default function ReadingWrapper({ children, isMarkdown }: Props) {
  const [readMode, setReadMode] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('md')

  useEffect(() => {
    const mode = localStorage.getItem('xales_read_mode')
    const size = localStorage.getItem('xales_font_size') as FontSize | null
    if (mode === '1') setReadMode(true)
    if (size && size in FONT_SIZES) setFontSize(size)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { readMode: rm, fontSize: fs } = (e as CustomEvent).detail
      setReadMode(rm)
      setFontSize(fs)
    }
    window.addEventListener(READING_EVENT, handler)
    return () => window.removeEventListener(READING_EVENT, handler)
  }, [])

  if (!isMarkdown) return <>{children}</>

  const contentStyle: React.CSSProperties = readMode
    ? { background: '#faf7f0', borderRadius: '12px', padding: '2.5rem 3rem', color: '#2d2420', lineHeight: 1.85, fontSize: FONT_SIZES[fontSize] }
    : { fontSize: FONT_SIZES[fontSize] }

  return <div style={contentStyle}>{children}</div>
}

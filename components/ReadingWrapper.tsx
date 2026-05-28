'use client'

import { useState, useEffect, useRef } from 'react'

const FONT_SIZES = { sm: '0.9rem', md: '1rem', lg: '1.175rem' } as const
type FontSize = keyof typeof FONT_SIZES

interface Props {
  children: React.ReactNode
  isMarkdown: boolean
}

export default function ReadingWrapper({ children, isMarkdown }: Props) {
  const [readMode, setReadMode] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('md')
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mode = localStorage.getItem('xales_read_mode')
    const size = localStorage.getItem('xales_font_size') as FontSize | null
    if (mode === '1') setReadMode(true)
    if (size && size in FONT_SIZES) setFontSize(size)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false)
      }
    }
    if (showPanel) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showPanel])

  const toggleReadMode = () => {
    const next = !readMode
    setReadMode(next)
    localStorage.setItem('xales_read_mode', next ? '1' : '0')
  }

  const setSize = (size: FontSize) => {
    setFontSize(size)
    localStorage.setItem('xales_font_size', size)
  }

  const contentStyle: React.CSSProperties = readMode
    ? {
        background: '#faf7f0',
        borderRadius: '12px',
        padding: '2.5rem 3rem',
        color: '#2d2420',
        lineHeight: 1.85,
        fontSize: FONT_SIZES[fontSize],
      }
    : {
        fontSize: FONT_SIZES[fontSize],
      }

  return (
    <div>
      {isMarkdown && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1.25rem',
            position: 'relative',
          }}
          ref={panelRef}
        >
          <button
            onClick={() => setShowPanel((p) => !p)}
            title="Pengaturan tampilan baca"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: showPanel ? '#1a1a1a' : '#f0ede8',
              border: `1px solid ${showPanel ? '#1a1a1a' : '#e5e0d8'}`,
              borderRadius: '6px',
              padding: '0.375rem 0.75rem',
              fontSize: '0.8125rem',
              color: showPanel ? '#f7f5f2' : '#6e6a65',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '0.875rem' }}>⚙</span>
            <span>Tampilan</span>
          </button>

          {showPanel && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#ffffff',
                border: '1px solid #e5e0d8',
                borderRadius: '10px',
                padding: '1.125rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                zIndex: 40,
                width: '240px',
              }}
            >
              {/* Read Mode */}
              <div style={{ marginBottom: '1.125rem' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#9c9690',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.625rem',
                  }}
                >
                  Mode Baca
                </div>
                <button
                  onClick={toggleReadMode}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: readMode ? '#faf7f0' : '#f7f5f2',
                    border: `1px solid ${readMode ? '#d4c9b0' : '#e5e0d8'}`,
                    borderRadius: '8px',
                    padding: '0.625rem 0.875rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 500 }}>Nyaman di Mata</div>
                    <div style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '1px' }}>
                      {readMode ? 'Aktif · Latar hangat & spasi lebar' : 'Nonaktif'}
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: '36px',
                      height: '20px',
                      background: readMode ? '#1a1a1a' : '#d1cdc7',
                      borderRadius: '10px',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '3px',
                        left: readMode ? '19px' : '3px',
                        width: '14px',
                        height: '14px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Font Size */}
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#9c9690',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.625rem',
                  }}
                >
                  Ukuran Teks
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(
                    [
                      { key: 'sm', label: 'A', desc: 'Kecil' },
                      { key: 'md', label: 'A', desc: 'Sedang' },
                      { key: 'lg', label: 'A', desc: 'Besar' },
                    ] as const
                  ).map(({ key, label, desc }, i) => (
                    <button
                      key={key}
                      onClick={() => setSize(key)}
                      title={desc}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.25rem',
                        border: `1px solid ${fontSize === key ? '#1a1a1a' : '#e5e0d8'}`,
                        borderRadius: '6px',
                        background: fontSize === key ? '#1a1a1a' : '#f7f5f2',
                        color: fontSize === key ? '#ffffff' : '#6e6a65',
                        cursor: 'pointer',
                        fontSize: ['0.8rem', '1rem', '1.2rem'][i],
                        fontWeight: 600,
                        lineHeight: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                      <span style={{ fontSize: '0.6rem', fontWeight: 400, opacity: 0.7 }}>{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={contentStyle}>{children}</div>
    </div>
  )
}

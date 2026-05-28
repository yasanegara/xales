'use client'

import { useRef, useState } from 'react'
import ImageUploadButton from './ImageUploadButton'

interface Props {
  value: string
  onChange: (v: string) => void
}

interface ToolbarBtn {
  label: string
  title: string
  action: () => void
  divider?: boolean
}

const GUIDE_SECTIONS = [
  {
    title: 'Judul',
    items: [
      { syntax: '# Judul H1', desc: 'Heading besar' },
      { syntax: '## Judul H2', desc: 'Heading sedang' },
      { syntax: '### Judul H3', desc: 'Heading kecil' },
    ],
  },
  {
    title: 'Teks',
    items: [
      { syntax: '**tebal**', desc: 'Teks tebal' },
      { syntax: '*miring*', desc: 'Teks miring' },
      { syntax: '~~coret~~', desc: 'Teks dicoret' },
      { syntax: '`kode`', desc: 'Kode inline' },
    ],
  },
  {
    title: 'Daftar',
    items: [
      { syntax: '- item\n- item', desc: 'Daftar poin' },
      { syntax: '1. item\n2. item', desc: 'Daftar bernomor' },
      { syntax: '- [x] selesai\n- [ ] belum', desc: 'Checklist' },
    ],
  },
  {
    title: 'Link & Gambar',
    items: [
      { syntax: '[teks](https://url.com)', desc: 'Tautan' },
      { syntax: '![alt](https://url.com/img.jpg)', desc: 'Gambar dari URL' },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      { syntax: '> kutipan', desc: 'Blockquote' },
      { syntax: '```\nkode blok\n```', desc: 'Blok kode' },
      { syntax: '---', desc: 'Garis pemisah' },
      { syntax: '| A | B |\n|---|---|\n| 1 | 2 |', desc: 'Tabel' },
    ],
  },
]

export default function MarkdownEditor({ value, onChange }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [showGuide, setShowGuide] = useState(false)

  // Insert/wrap text at cursor
  const wrap = (before: string, after = '', placeholder = 'teks') => {
    const ta = taRef.current
    if (!ta) { onChange(value + before + placeholder + after); return }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = value.slice(start, end) || placeholder
    const next = value.slice(0, start) + before + sel + after + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + sel.length)
    })
  }

  // Insert at start of current line
  const linePrefix = (prefix: string, placeholder = 'teks') => {
    const ta = taRef.current
    if (!ta) { onChange(value + '\n' + prefix + placeholder); return }
    const start = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const alreadyHas = value.slice(lineStart).startsWith(prefix)
    let next: string
    if (alreadyHas) {
      next = value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
    } else {
      next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    }
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      const offset = alreadyHas ? -prefix.length : prefix.length
      ta.setSelectionRange(start + offset, start + offset)
    })
  }

  // Insert a block (code block, table) with newlines
  const insertBlock = (text: string) => {
    const ta = taRef.current
    const pos = ta ? ta.selectionStart : value.length
    const prefix = pos > 0 && value[pos - 1] !== '\n' ? '\n' : ''
    const next = value.slice(0, pos) + prefix + text + '\n' + value.slice(pos)
    onChange(next)
    requestAnimationFrame(() => {
      if (!ta) return
      ta.focus()
      ta.setSelectionRange(pos + prefix.length + text.length + 1, pos + prefix.length + text.length + 1)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); wrap('**', '**') }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); wrap('*', '*', 'teks miring') }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); wrap('[', '](https://)', 'teks link') }
    // Tab → insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      wrap('  ', '', '')
    }
  }

  const BTN = (label: string, title: string, onClick: () => void): ToolbarBtn => ({ label, title, action: onClick })
  const DIV: ToolbarBtn = { label: '|', title: '', action: () => {}, divider: true }

  const buttons: ToolbarBtn[] = [
    BTN('H1', 'Heading 1', () => linePrefix('# ')),
    BTN('H2', 'Heading 2', () => linePrefix('## ')),
    BTN('H3', 'Heading 3', () => linePrefix('### ')),
    DIV,
    BTN('B', 'Tebal (Ctrl+B)', () => wrap('**', '**')),
    BTN('I', 'Miring (Ctrl+I)', () => wrap('*', '*', 'teks miring')),
    BTN('S̶', 'Coret', () => wrap('~~', '~~')),
    DIV,
    BTN('`', 'Kode inline', () => wrap('`', '`', 'kode')),
    BTN('```', 'Blok kode', () => insertBlock('```\n\n```')),
    BTN('>', 'Kutipan', () => linePrefix('> ')),
    DIV,
    BTN('•', 'Daftar poin', () => linePrefix('- ')),
    BTN('1.', 'Daftar angka', () => linePrefix('1. ')),
    BTN('☑', 'Checklist', () => linePrefix('- [ ] ')),
    DIV,
    BTN('🔗', 'Tautan (Ctrl+K)', () => wrap('[', '](https://)', 'teks link')),
    BTN('—', 'Garis pemisah', () => insertBlock('---')),
  ]

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flexWrap: 'wrap',
          background: '#fafaf8',
          border: '1px solid #e5e0d8',
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          padding: '0.5rem 0.625rem',
        }}
      >
        {buttons.map((btn, i) =>
          btn.divider ? (
            <span key={i} style={{ color: '#d0c9b8', margin: '0 4px', userSelect: 'none' }}>│</span>
          ) : (
            <button
              key={i}
              type="button"
              title={btn.title}
              onClick={btn.action}
              style={{
                background: 'none',
                border: '1px solid transparent',
                borderRadius: '5px',
                padding: '3px 7px',
                fontSize: btn.label === '```' ? '0.7rem' : btn.label === '1.' ? '0.75rem' : '0.875rem',
                fontWeight: ['H1', 'H2', 'H3', 'B'].includes(btn.label) ? 700 : 500,
                fontStyle: btn.label === 'I' ? 'italic' : 'normal',
                color: '#3d3a36',
                cursor: 'pointer',
                lineHeight: 1,
                minWidth: '28px',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f0ede8'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e0d8' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' }}
            >
              {btn.label}
            </button>
          )
        )}

        <span style={{ color: '#d0c9b8', margin: '0 4px' }}>│</span>
        <ImageUploadButton onInsert={(md) => { const pos = taRef.current?.selectionStart ?? value.length; onChange(value.slice(0, pos) + md + value.slice(pos)) }} />

        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          title="Panduan Markdown"
          style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            background: showGuide ? '#1a1a1a' : 'none',
            border: `1px solid ${showGuide ? '#1a1a1a' : '#e5e0d8'}`,
            borderRadius: '5px', padding: '3px 8px',
            fontSize: '0.75rem', fontWeight: 500,
            color: showGuide ? '#f7f5f2' : '#6e6a65',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          ? Panduan
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={'Mulai menulis...\n\nGunakan toolbar di atas atau ketik langsung syntax Markdown.\nContoh: **tebal**, *miring*, # Judul'}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: '480px',
          background: '#ffffff',
          border: '1px solid #e5e0d8',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '1.125rem 1.25rem',
          color: '#1a1a1a',
          fontSize: '0.9375rem',
          lineHeight: 1.75,
          resize: 'vertical',
          outline: 'none',
          fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
          tabSize: 2,
        }}
      />

      {/* Markdown guide */}
      {showGuide && (
        <div
          style={{
            marginTop: '0.75rem',
            background: '#ffffff',
            border: '1px solid #e5e0d8',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a' }}>Panduan Markdown</span>
            <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>Klik syntax untuk insert ke editor</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0 }}>
            {GUIDE_SECTIONS.map((section) => (
              <div key={section.title} style={{ padding: '1rem 1.25rem', borderRight: '1px solid #f0ede8', borderBottom: '1px solid #f0ede8' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
                  {section.title}
                </div>
                {section.items.map((item) => (
                  <div
                    key={item.syntax}
                    onClick={() => {
                      const ta = taRef.current
                      const pos = ta?.selectionStart ?? value.length
                      const prefix = pos > 0 && value[pos - 1] !== '\n' ? '\n' : ''
                      onChange(value.slice(0, pos) + prefix + item.syntax + '\n' + value.slice(pos))
                      requestAnimationFrame(() => { ta?.focus() })
                    }}
                    style={{ marginBottom: '0.375rem', cursor: 'pointer', borderRadius: '5px', padding: '0.375rem 0.5rem', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f7f5f2' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none' }}
                  >
                    <code style={{ fontSize: '0.8rem', color: '#1a1a1a', display: 'block', whiteSpace: 'pre', fontFamily: 'monospace' }}>
                      {item.syntax.length > 28 ? item.syntax.split('\n')[0] + (item.syntax.includes('\n') ? ' ...' : '') : item.syntax}
                    </code>
                    <span style={{ fontSize: '0.75rem', color: '#9c9690' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding: '0.75rem 1.25rem', background: '#f7f5f2', borderTop: '1px solid #e5e0d8' }}>
            <p style={{ fontSize: '0.8125rem', color: '#6e6a65', margin: 0 }}>
              <strong>Shortcut:</strong> Ctrl+B tebal · Ctrl+I miring · Ctrl+K tautan · Tab indent
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

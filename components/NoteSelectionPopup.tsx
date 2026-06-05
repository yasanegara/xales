'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

interface ToolbarState {
  x: number
  y: number
  text: string
}

export default function NoteSelectionPopup({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)

  useEffect(() => {
    if (!session) return

    const handleMouseUp = (e: MouseEvent) => {
      setTimeout(() => {
        const selection = window.getSelection()
        const text = selection?.toString().trim()

        if (!text || text.length < 5) {
          setToolbar(null)
          return
        }

        // Check that selection is inside our container
        const range = selection?.getRangeAt(0)
        if (!range || !containerRef.current?.contains(range.commonAncestorContainer)) {
          setToolbar(null)
          return
        }

        const rect = range.getBoundingClientRect()
        setToolbar({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + window.scrollY - 10,
          text,
        })
      }, 10)
    }

    const handleMouseDown = (e: MouseEvent) => {
      // Clear toolbar if clicked outside it
      const target = e.target as HTMLElement
      if (!target.closest('[data-note-toolbar]')) {
        setToolbar(null)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [session])

  const openNoteModal = () => {
    if (!toolbar) return
    window.dispatchEvent(new CustomEvent('open-note-modal', { detail: { quote: toolbar.text } }))
    setToolbar(null)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {children}

      {/* Floating selection toolbar */}
      {toolbar && (
        <div
          data-note-toolbar
          style={{
            position: 'absolute',
            left: toolbar.x,
            top: toolbar.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 50,
          }}
        >
          <button
            onMouseDown={e => e.preventDefault()} // prevent losing selection
            onClick={openNoteModal}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              transition: 'all 0.15s',
            }}
          >
            ✏ Simpan Catatan
          </button>
          {/* Triangle pointer */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '-6px',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1a1a1a',
          }} />
        </div>
      )}
    </div>
  )
}

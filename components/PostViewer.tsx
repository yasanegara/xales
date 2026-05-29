'use client'

import { useEffect, useRef } from 'react'
import MarkdownContent from './MarkdownContent'

interface PostViewerProps {
  type: string
  content: string
  title: string
}

function AppViewer({ content, title }: { content: string; title: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Set srcDoc only once via ref — prevents flicker on parent re-renders
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframe.src = url
    return () => URL.revokeObjectURL(url)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — content is stable after mount

  return (
    <iframe
      ref={iframeRef}
      title={title}
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads"
      style={{ width: '100%', height: '100svh', border: 'none', display: 'block' }}
    />
  )
}

export default function PostViewer({ type, content, title }: PostViewerProps) {
  if (type === 'html') return <AppViewer content={content} title={title} />
  return <MarkdownContent content={content} />
}

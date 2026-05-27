'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PostViewerProps {
  type: string
  content: string
  title: string
}

export default function PostViewer({ type, content, title }: PostViewerProps) {
  if (type === 'html') {
    return (
      <iframe
        srcDoc={content}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          minHeight: '80vh',
          border: 'none',
          borderRadius: '8px',
          background: '#fff',
        }}
        title={title}
      />
    )
  }

  return (
    <div className="prose" style={{ maxWidth: '100%' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

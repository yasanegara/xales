'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { headingId } from '@/lib/headings'
import type { Components } from 'react-markdown'

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getTextContent).join('')
  if (node && typeof node === 'object') {
    const el = node as { props?: { children?: React.ReactNode } }
    if (el.props?.children !== undefined) return getTextContent(el.props.children)
  }
  return ''
}

function makeHeading(level: 1 | 2 | 3) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  return function HeadingComponent({ children }: { children?: React.ReactNode }) {
    const text = getTextContent(children)
    const id = headingId(text)
    return <Tag id={id}>{children}</Tag>
  }
}

const components: Components = {
  h1: makeHeading(1),
  h2: makeHeading(2),
  h3: makeHeading(3),
}

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose" style={{ maxWidth: '100%' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import PostViewer from './PostViewer'
import ImageUploadButton from './ImageUploadButton'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface PostEditorProps {
  type: 'markdown' | 'html'
  value: string
  onChange: (val: string) => void
}

export default function PostEditor({ type, value, onChange }: PostEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  const tabStyle = (active: boolean) => ({
    padding: '0.375rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    background: active ? '#1a1a1a' : 'transparent',
    color: active ? '#f7f5f2' : '#6e6a65',
    border: active ? '1px solid #1a1a1a' : '1px solid transparent',
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={tabStyle(tab === 'edit')} onClick={() => setTab('edit')}>Edit</button>
        <button style={tabStyle(tab === 'preview')} onClick={() => setTab('preview')}>Preview</button>
        {type === 'markdown' && tab === 'edit' && (
          <div style={{ marginLeft: 'auto' }}>
            <ImageUploadButton onInsert={(md) => onChange(value + md)} />
          </div>
        )}
      </div>

      {tab === 'edit' ? (
        type === 'markdown' ? (
          <div data-color-mode="light">
            <MDEditor
              value={value}
              onChange={(v) => onChange(v ?? '')}
              height={500}
              preview="edit"
            />
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`<!DOCTYPE html>\n<html>\n<head><title>My App</title></head>\n<body>\n  <!-- Your web app here -->\n</body>\n</html>`}
            style={{
              width: '100%',
              minHeight: '500px',
              background: '#ffffff',
              border: '1px solid #e5e0d8',
              borderRadius: '8px',
              padding: '1rem',
              color: '#1a1a1a',
              fontSize: '0.875rem',
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        )
      ) : (
        <div
          style={{
            border: '1px solid #e5e0d8',
            borderRadius: '8px',
            overflow: 'hidden',
            minHeight: '400px',
            padding: type === 'markdown' ? '1.5rem' : '0',
            background: '#ffffff',
          }}
        >
          {value ? (
            <PostViewer type={type} content={value} title="Preview" />
          ) : (
            <p style={{ color: '#9c9690', padding: '2rem', textAlign: 'center' }}>
              Belum ada konten untuk di-preview
            </p>
          )}
        </div>
      )}
    </div>
  )
}

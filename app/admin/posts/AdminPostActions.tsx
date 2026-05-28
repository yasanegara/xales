'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  postId: string
  slug: string
  published: boolean
}

export default function AdminPostActions({ postId, slug, published }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const act = async (action: 'unpublish' | 'delete') => {
    if (action === 'delete' && !confirm('Hapus post ini permanen?')) return
    setLoading(true)
    await fetch('/api/admin/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {published && (
        <button onClick={() => act('unpublish')} disabled={loading}
          style={{ fontSize: '0.75rem', color: '#d97706', background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer', padding: 0, fontWeight: 500 }}>
          Unpublish
        </button>
      )}
      <button onClick={() => act('delete')} disabled={loading}
        style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer', padding: 0, fontWeight: 500 }}>
        Hapus
      </button>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function SaveButton({ slug }: { slug: string }) {
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch(`/api/posts/${slug}/save`)
      .then((r) => r.json())
      .then((d) => { setSaved(d.saved); setChecked(true) })
  }, [slug, session])

  if (!session || !checked) return null

  const toggle = async () => {
    setLoading(true)
    const res = await fetch(`/api/posts/${slug}/save`, {
      method: saved ? 'DELETE' : 'POST',
    })
    if (res.ok) setSaved(!saved)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Hapus dari Library' : 'Simpan ke Library'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        background: saved ? '#eff6ff' : '#f7f5f2',
        border: `1px solid ${saved ? '#93c5fd' : '#e5e0d8'}`,
        borderRadius: '6px',
        padding: '0.375rem 0.75rem',
        fontSize: '0.8125rem',
        color: saved ? '#1d4ed8' : '#6e6a65',
        cursor: loading ? 'default' : 'pointer',
        fontWeight: 500,
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s',
      }}
    >
      <span>{saved ? '★' : '☆'}</span>
      <span>{saved ? 'Tersimpan' : 'Simpan'}</span>
    </button>
  )
}

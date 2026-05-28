'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PostFormFields, { type PostFormData } from '@/components/PostFormFields'

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [slug, setSlug] = useState('')
  const [form, setForm] = useState<PostFormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(async ({ slug: s }) => {
      setSlug(s)
      const res = await fetch(`/api/posts/${s}`)
      const data = await res.json()
      setForm({
        title: data.title ?? '',
        description: data.description ?? '',
        type: data.type,
        content: data.content ?? '',
        category: data.category ?? '',
        tags: (data.tags ?? []).join(', '),
        isPremium: data.isPremium ?? false,
        price: data.price ? String(data.price) : '',
        discount: data.discount ? String(data.discount) : '',
        files: [],  // existing files fetched separately via API
      })
    })
  }, [params])

  const handleSubmit = async (published: boolean) => {
    if (!form) return
    if (form.isPremium && !form.price) { setError('Isi harga untuk konten premium'); return }
    setLoading(true)
    setError('')
    const res = await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        content: form.content,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published,
        isPremium: form.isPremium,
        price: form.isPremium && form.price ? parseInt(form.price) : null,
        newFiles: form.files,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    if (published && session?.user.username) {
      router.push(`/@${session.user.username}/${slug}`)
    } else {
      router.push('/dashboard/posts')
    }
    router.refresh()
  }

  if (!form) return <div style={{ color: '#6e6a65', padding: '4rem', textAlign: 'center' }}>Loading...</div>

  return (
    <PostFormFields
      form={form}
      onChange={setForm}
      error={error}
      loading={loading}
      isEdit
      onSaveDraft={() => handleSubmit(false)}
      onPublish={() => handleSubmit(true)}
    />
  )
}

export const dynamic = 'force-dynamic'

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PostFormFields, { type PostFormData } from '@/components/PostFormFields'

export default function NewPostPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState<PostFormData>({
    title: '', description: '', type: 'markdown', content: '',
    category: '', tags: '', isPrivate: false, isPremium: false, price: '', discount: '', files: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (published: boolean) => {
    if (!form.title || !form.content) { setError('Judul dan konten wajib diisi'); return }
    if (form.isPremium && !form.price) { setError('Isi harga untuk konten premium'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        type: form.type,
        content: form.content,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published,
        isPrivate: form.isPrivate,
        isPremium: form.isPrivate ? false : form.isPremium,
        price: (!form.isPrivate && form.isPremium && form.price) ? parseInt(form.price) : null,
        files: form.isPrivate ? [] : form.files,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push(published ? `/@${session?.user.username}/${data.slug}` : '/dashboard/posts')
    router.refresh()
  }

  return (
    <PostFormFields
      form={form}
      onChange={setForm}
      error={error}
      loading={loading}
      onSaveDraft={() => handleSubmit(false)}
      onPublish={() => handleSubmit(true)}
    />
  )
}

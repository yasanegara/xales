'use client'

import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed_${slug}`
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      fetch(`/api/posts/${slug}/view`, { method: 'POST' })
    }
  }, [slug])

  return null
}

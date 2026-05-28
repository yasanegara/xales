'use client'

import { useEffect } from 'react'

function getDeviceId(): string {
  const key = 'xales_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const deviceId = getDeviceId()
    fetch(`/api/posts/${slug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    })
  }, [slug])

  return null
}

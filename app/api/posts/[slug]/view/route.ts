import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { deviceId } = await req.json().catch(() => ({}))

  if (!deviceId || typeof deviceId !== 'string') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const post = await db.post.findUnique({ where: { slug }, select: { id: true } })
  if (!post) return NextResponse.json({ ok: false }, { status: 404 })

  // Only count if this device hasn't viewed this post before
  const existing = await db.postView.findUnique({
    where: { postId_deviceId: { postId: post.id, deviceId } },
  })

  if (!existing) {
    await db.$transaction([
      db.postView.create({ data: { postId: post.id, deviceId } }),
      db.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }),
    ])
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { rateLimit, getIp } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const comments = await db.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { username: true, name: true, profilePic: true } } },
  })
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  if (!rateLimit(`comment:${ip}`, 20, 60_000))
    return NextResponse.json({ error: 'Terlalu banyak komentar. Tunggu sebentar.' }, { status: 429 })

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

  const { postId, content } = await req.json()
  if (!postId || !content?.trim()) return NextResponse.json({ error: 'Konten tidak boleh kosong' }, { status: 400 })
  if (content.length > 2000) return NextResponse.json({ error: 'Maksimal 2000 karakter' }, { status: 400 })

  const post = await db.post.findUnique({ where: { id: postId }, select: { id: true, type: true } })
  if (!post || post.type !== 'markdown') return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const comment = await db.comment.create({
    data: { content: content.trim(), userId: session.user.id, postId },
    include: { user: { select: { username: true, name: true, profilePic: true } } },
  })
  return NextResponse.json(comment, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const session = await getServerSession(authOptions)

  const [agg, userRating] = await Promise.all([
    db.rating.aggregate({ where: { postId }, _avg: { value: true }, _count: true }),
    session ? db.rating.findUnique({ where: { userId_postId: { userId: session.user.id, postId } } }) : null,
  ])

  return NextResponse.json({
    avg: agg._avg.value ? Math.round(agg._avg.value * 10) / 10 : 0,
    count: agg._count,
    userRating: userRating?.value ?? null,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

  const { postId, value } = await req.json()
  if (!postId || !value || value < 1 || value > 5) return NextResponse.json({ error: 'Rating 1-5' }, { status: 400 })

  const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true } })
  if (!post) return NextResponse.json({ error: 'Post tidak ditemukan' }, { status: 404 })
  if (post.authorId === session.user.id) return NextResponse.json({ error: 'Tidak bisa rating konten sendiri' }, { status: 400 })

  const rating = await db.rating.upsert({
    where: { userId_postId: { userId: session.user.id, postId } },
    create: { userId: session.user.id, postId, value },
    update: { value },
  })
  return NextResponse.json(rating)
}

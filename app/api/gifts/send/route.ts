import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

  const { postId, giftItemId, message } = await req.json()
  if (!postId || !giftItemId) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  const [post, gift] = await Promise.all([
    db.post.findUnique({ where: { id: postId }, select: { authorId: true, type: true, published: true } }),
    db.giftItem.findUnique({ where: { id: giftItemId } }),
  ])

  if (!post || !post.published) return NextResponse.json({ error: 'Post tidak ditemukan' }, { status: 404 })
  if (!gift || !gift.isActive) return NextResponse.json({ error: 'Hadiah tidak tersedia' }, { status: 404 })
  if (post.authorId === session.user.id) return NextResponse.json({ error: 'Tidak bisa kirim hadiah ke diri sendiri' }, { status: 400 })

  const sentGift = await db.sentGift.create({
    data: {
      senderId: session.user.id,
      receiverId: post.authorId,
      postId,
      giftItemId,
      amount: gift.price,
      message: message?.trim() || null,
    },
    include: {
      sender: { select: { username: true, name: true, profilePic: true } },
      giftItem: true,
    },
  })

  return NextResponse.json(sentGift, { status: 201 })
}

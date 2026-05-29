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
    db.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true, published: true,
        author: {
          select: {
            bankName: true, bankAccount: true, bankHolder: true,
            qrisImage: true, waNumber: true, name: true, username: true,
          },
        },
      },
    }),
    db.giftItem.findUnique({ where: { id: giftItemId } }),
  ])

  if (!post || !post.published) return NextResponse.json({ error: 'Post tidak ditemukan' }, { status: 404 })
  if (!gift || !gift.isActive) return NextResponse.json({ error: 'Hadiah tidak tersedia' }, { status: 404 })
  if (post.authorId === session.user.id) return NextResponse.json({ error: 'Tidak bisa kirim hadiah ke diri sendiri' }, { status: 400 })

  const sentGift = await db.sentGift.create({
    data: {
      senderId:   session.user.id,
      receiverId: post.authorId,
      postId,
      giftItemId,
      amount:  gift.price,
      message: message?.trim() || null,
      status:  'pending_payment',
    },
    include: {
      sender:   { select: { username: true, name: true, profilePic: true } },
      giftItem: true,
    },
  })

  return NextResponse.json({
    gift: sentGift,
    paymentInfo: {
      bankName:    post.author.bankName,
      bankAccount: post.author.bankAccount,
      bankHolder:  post.author.bankHolder,
      qrisImage:   post.author.qrisImage,
      waNumber:    post.author.waNumber,
      creatorName: post.author.name ?? `@${post.author.username}`,
    },
  }, { status: 201 })
}

// Kreator konfirmasi pembayaran gift diterima
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { giftId, action } = await req.json() // action: 'confirm' | 'reject'
  if (!giftId || !['confirm', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const gift = await db.sentGift.findUnique({
    where: { id: giftId },
    select: { id: true, receiverId: true, status: true },
  })

  if (!gift) return NextResponse.json({ error: 'Gift tidak ditemukan' }, { status: 404 })
  if (gift.receiverId !== session.user.id) return NextResponse.json({ error: 'Bukan gift milikmu' }, { status: 403 })
  if (gift.status !== 'pending_payment') return NextResponse.json({ error: 'Status tidak bisa diubah' }, { status: 400 })

  const updated = await db.sentGift.update({
    where: { id: giftId },
    data: { status: action === 'confirm' ? 'paid' : 'rejected' },
  })

  return NextResponse.json({ gift: updated })
}

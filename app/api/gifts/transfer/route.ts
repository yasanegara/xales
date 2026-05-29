import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

// Transfer gift balance (giftBalance) ke kreator lain secara langsung
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { toUsername, giftItemId, message } = await req.json()
  if (!toUsername || !giftItemId) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  const senderId = session.user.id

  const [sender, receiver, giftItem] = await Promise.all([
    db.user.findUnique({ where: { id: senderId }, select: { id: true, giftBalance: true } }),
    db.user.findUnique({ where: { username: toUsername }, select: { id: true, username: true } }),
    db.giftItem.findUnique({ where: { id: giftItemId } }),
  ])

  if (!sender) return NextResponse.json({ error: 'Sender tidak ditemukan' }, { status: 404 })
  if (!receiver) return NextResponse.json({ error: `Kreator @${toUsername} tidak ditemukan` }, { status: 404 })
  if (!giftItem || !giftItem.isActive) return NextResponse.json({ error: 'Gift tidak tersedia' }, { status: 404 })
  if (receiver.id === senderId) return NextResponse.json({ error: 'Tidak bisa transfer ke diri sendiri' }, { status: 400 })
  if (sender.giftBalance < giftItem.price) {
    return NextResponse.json({ error: `Saldo gift tidak cukup. Tersedia: Rp ${sender.giftBalance.toLocaleString('id-ID')}` }, { status: 400 })
  }

  // Cari post dummy untuk transfer langsung (pakai post pertama kreator)
  const receiverPost = await db.post.findFirst({
    where: { authorId: receiver.id, published: true },
    select: { id: true },
  })

  if (!receiverPost) return NextResponse.json({ error: 'Kreator belum punya konten' }, { status: 400 })

  await db.$transaction([
    // Kurangi giftBalance pengirim
    db.user.update({ where: { id: senderId }, data: { giftBalance: { decrement: giftItem.price } } }),
    // Buat SentGift record
    db.sentGift.create({
      data: {
        senderId,
        receiverId: receiver.id,
        postId: receiverPost.id,
        giftItemId,
        amount: giftItem.price,
        message: message?.trim() || null,
      },
    }),
  ])

  return NextResponse.json({ success: true, message: `Gift ${giftItem.emoji} berhasil dikirim ke @${toUsername}!` }, { status: 201 })
}

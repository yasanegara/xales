import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const PACKAGES = [10000, 25000, 50000, 100000] // IDR

export async function GET() {
  // Kembalikan paket dan payment info platform (@tweak.id)
  const platform = await db.user.findFirst({
    where: { email: 'hello@tweak.id' },
    select: { bankName: true, bankAccount: true, bankHolder: true, qrisImage: true },
  })

  return NextResponse.json({ packages: PACKAGES, paymentInfo: platform ?? null })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount } = await req.json()
  if (!PACKAGES.includes(amount)) {
    return NextResponse.json({ error: 'Pilih paket yang tersedia' }, { status: 400 })
  }

  const platform = await db.user.findFirst({
    where: { email: 'hello@tweak.id' },
    select: { bankName: true, bankAccount: true, bankHolder: true, qrisImage: true },
  })

  const topup = await db.giftTopUp.create({
    data: {
      userId:  session.user.id,
      amount,
      orderId: randomUUID(),
      status:  'pending',
    },
  })

  return NextResponse.json({
    topup,
    paymentInfo: platform ?? null,
    message: 'Transfer ke rekening platform, lalu klik "Sudah Transfer".',
  }, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { TRANSACTION_FEE } from '@/lib/fees'
import { notifyWithdrawalSubmitted } from '@/lib/notify'

const MIN_WITHDRAW = 50_000

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { amount } = await req.json()
  if (!amount || amount < MIN_WITHDRAW)
    return NextResponse.json({ error: `Minimal cairkan Rp ${MIN_WITHDRAW.toLocaleString('id-ID')}` }, { status: 400 })

  // Fetch user bank info
  const user = await db.user.findUnique({ where: { id: userId }, select: { bankName: true, bankAccount: true, bankHolder: true } })
  if (!user?.bankAccount)
    return NextResponse.json({ error: 'Lengkapi rekening bank di Settings terlebih dahulu' }, { status: 400 })

  // Compute available balance
  const [articleSales, fileSales, bundleSales, transactionCount, prevWithdrawals] = await Promise.all([
    db.purchase.aggregate({ where: { post: { authorId: userId }, status: 'paid' }, _sum: { amount: true } }),
    db.filePurchase.aggregate({ where: { file: { post: { authorId: userId } }, status: 'paid' }, _sum: { amount: true } }),
    db.bundlePurchase.aggregate({ where: { bundle: { authorId: userId }, status: 'paid' }, _sum: { amount: true } }),
    db.purchase.count({ where: { post: { authorId: userId }, status: 'paid' } }),
    db.withdrawal.aggregate({ where: { userId, status: { in: ['approved', 'paid'] } }, _sum: { amount: true } }),
  ])
  const totalRevenue = (articleSales._sum.amount ?? 0) + (fileSales._sum.amount ?? 0) + (bundleSales._sum.amount ?? 0)
  const transactionFee = transactionCount * TRANSACTION_FEE
  const creatorEarnings = totalRevenue - transactionFee
  const totalWithdrawn = prevWithdrawals._sum.amount ?? 0
  const available = creatorEarnings - totalWithdrawn

  if (amount > available)
    return NextResponse.json({ error: `Saldo tidak cukup. Tersedia: Rp ${available.toLocaleString('id-ID')}` }, { status: 400 })

  // Check no pending withdrawal
  const pending = await db.withdrawal.findFirst({ where: { userId, status: 'pending' } })
  if (pending)
    return NextResponse.json({ error: 'Masih ada permintaan pencairan yang sedang diproses' }, { status: 400 })

  const withdrawal = await db.withdrawal.create({
    data: {
      userId, amount,
      bankName: user.bankName ?? '',
      bankAccount: user.bankAccount,
      bankHolder: user.bankHolder ?? '',
    },
  })

  const creator = await db.user.findUnique({ where: { id: userId }, select: { name: true, waNumber: true } })
  notifyWithdrawalSubmitted({
    creatorWa: creator?.waNumber,
    creatorName: creator?.name ?? 'Kreator',
    amount,
  })

  return NextResponse.json(withdrawal, { status: 201 })
}

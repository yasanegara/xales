import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export const PLATFORM_FEE_RATE = 0.10 // 10%

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const [articleSales, fileSales, bundleSales, withdrawals] = await Promise.all([
    db.purchase.findMany({
      where: { post: { authorId: userId }, status: 'paid' },
      select: { id: true, amount: true, payerName: true, createdAt: true, post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.filePurchase.findMany({
      where: { file: { post: { authorId: userId } }, status: 'paid' },
      select: { id: true, amount: true, payerName: true, createdAt: true, file: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.bundlePurchase.findMany({
      where: { bundle: { authorId: userId }, status: 'paid' },
      select: { id: true, amount: true, payerName: true, createdAt: true, bundle: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const transactions = [
    ...articleSales.map(p => ({ id: p.id, type: 'article' as const, label: p.post.title, amount: p.amount, payerName: p.payerName, createdAt: p.createdAt })),
    ...fileSales.map(p => ({ id: p.id, type: 'file' as const, label: p.file.name, amount: p.amount, payerName: p.payerName, createdAt: p.createdAt })),
    ...bundleSales.map(p => ({ id: p.id, type: 'bundle' as const, label: p.bundle.title, amount: p.amount, payerName: p.payerName, createdAt: p.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0)
  const platformFee  = Math.floor(totalRevenue * PLATFORM_FEE_RATE)
  const creatorEarnings = totalRevenue - platformFee
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'approved' || w.status === 'paid')
    .reduce((s, w) => s + w.amount, 0)
  const availableBalance = creatorEarnings - totalWithdrawn

  return NextResponse.json({ totalRevenue, platformFee, creatorEarnings, totalWithdrawn, availableBalance, transactions, withdrawals })
}

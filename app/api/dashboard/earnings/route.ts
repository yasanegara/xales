import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { TRANSACTION_FEE } from '@/lib/fees'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const [articlePaid, filePaid, bundlePaid, articlePending, filePending, bundlePending, withdrawals] = await Promise.all([
    db.purchase.findMany({
      where: { post: { authorId: userId }, status: 'paid' },
      select: { id: true, amount: true, serviceFee: true, payerName: true, createdAt: true, post: { select: { title: true, slug: true } } },
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
    db.purchase.findMany({
      where: { post: { authorId: userId }, status: 'pending' },
      select: { id: true, amount: true, serviceFee: true, payerName: true, createdAt: true, post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.filePurchase.findMany({
      where: { file: { post: { authorId: userId } }, status: 'pending' },
      select: { id: true, amount: true, payerName: true, createdAt: true, file: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.bundlePurchase.findMany({
      where: { bundle: { authorId: userId }, status: 'pending' },
      select: { id: true, amount: true, payerName: true, createdAt: true, bundle: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const paidTransactions = [
    ...articlePaid.map(p => ({ id: p.id, type: 'article' as const, label: p.post.title, amount: p.amount, serviceFee: p.serviceFee ?? 0, payerName: p.payerName, createdAt: p.createdAt.toISOString() })),
    ...filePaid.map(p => ({ id: p.id, type: 'file' as const, label: p.file.name, amount: p.amount, serviceFee: 0, payerName: p.payerName, createdAt: p.createdAt.toISOString() })),
    ...bundlePaid.map(p => ({ id: p.id, type: 'bundle' as const, label: p.bundle.title, amount: p.amount, serviceFee: 0, payerName: p.payerName, createdAt: p.createdAt.toISOString() })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pendingTransactions = [
    ...articlePending.map(p => ({ id: p.id, type: 'article' as const, label: p.post.title, amount: p.amount, serviceFee: p.serviceFee ?? 0, payerName: p.payerName, createdAt: p.createdAt.toISOString() })),
    ...filePending.map(p => ({ id: p.id, type: 'file' as const, label: p.file.name, amount: p.amount, serviceFee: 0, payerName: p.payerName, createdAt: p.createdAt.toISOString() })),
    ...bundlePending.map(p => ({ id: p.id, type: 'bundle' as const, label: p.bundle.title, amount: p.amount, serviceFee: 0, payerName: p.payerName, createdAt: p.createdAt.toISOString() })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Revenue totals — transaction fee deducted per transaction (not passed to buyer)
  const totalRevenue = paidTransactions.reduce((s, t) => s + t.amount, 0)
  const transactionCount = paidTransactions.length
  const transactionFee = transactionCount * TRANSACTION_FEE
  const creatorEarnings = totalRevenue - transactionFee
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'approved' || w.status === 'paid')
    .reduce((s, w) => s + w.amount, 0)
  const availableBalance = Math.max(0, creatorEarnings - totalWithdrawn)

  // Source breakdown
  const sourceBreakdown = {
    article: articlePaid.reduce((s, p) => s + p.amount - (p.serviceFee ?? 0), 0),
    file:    filePaid.reduce((s, p) => s + p.amount, 0),
    bundle:  bundlePaid.reduce((s, p) => s + p.amount, 0),
  }

  // Daily earnings — last 30 days (before transaction fee deduction)
  const now = new Date()
  const days: { date: string; amount: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const amount = paidTransactions
      .filter(t => t.createdAt.slice(0, 10) === dateStr)
      .reduce((s, t) => s + t.amount, 0)
    days.push({ date: dateStr, amount })
  }

  return NextResponse.json({
    totalRevenue, transactionFee, transactionCount, creatorEarnings, totalWithdrawn, availableBalance,
    sourceBreakdown,
    dailyEarnings: days,
    transactions: paidTransactions,
    pendingTransactions,
    withdrawals: withdrawals.map(w => ({ ...w, createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString() })),
  })
}

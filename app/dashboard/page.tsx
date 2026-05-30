export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import DashboardStats from '@/components/DashboardStats'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [allPosts, recentPosts, recentPurchases, affiliateReferrals, allPurchases, userProfile] = await Promise.all([
    db.post.findMany({
      where: { authorId: userId },
      select: { viewCount: true, likeCount: true, published: true },
    }),
    db.post.findMany({
      where: { authorId: userId },
      orderBy: { viewCount: 'desc' },
      take: 6,
      select: { id: true, slug: true, title: true, type: true, published: true, viewCount: true, likeCount: true, updatedAt: true, isPremium: true, price: true },
    }),
    db.purchase.findMany({
      where: { post: { authorId: userId }, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, amount: true, payerName: true, createdAt: true, post: { select: { title: true, slug: true } } },
    }),
    db.purchase.findMany({
      where: { refCode: session!.user.username, status: 'paid' },
      select: { amount: true, post: { select: { author: { select: { affiliateRate: true } } } } },
    }),
    // For 30-day earnings chart
    db.purchase.findMany({
      where: { post: { authorId: userId }, status: 'paid', createdAt: { gte: thirtyDaysAgo } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, bio: true, bankAccount: true, qrisImage: true },
    }),
  ])

  const totalViews    = allPosts.reduce((s, p) => s + p.viewCount, 0)
  const totalLikes    = allPosts.reduce((s, p) => s + p.likeCount, 0)
  const published     = allPosts.filter(p => p.published).length
  const grossRevenue  = recentPurchases.reduce((s, p) => s + p.amount, 0) // last 6
  const totalRevenue  = allPurchases.reduce((s, p) => s + p.amount, 0)
  const affiliateEarnings = affiliateReferrals.reduce((s, p) => {
    const rate = p.post.author.affiliateRate ?? 20
    return s + Math.round(p.amount * (rate / 100))
  }, 0)

  // Build 30-day daily earnings array
  const dailyMap: Record<string, number> = {}
  for (const p of allPurchases) {
    const d = new Date(p.createdAt).toISOString().slice(0, 10)
    dailyMap[d] = (dailyMap[d] ?? 0) + p.amount
  }
  const daily30: { date: string; amount: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    daily30.push({ date: key, amount: dailyMap[key] ?? 0 })
  }

  const maxPostViews = Math.max(...recentPosts.map(p => p.viewCount), 1)

  // Onboarding: calculate incomplete steps
  const onboardingSteps = [
    { done: !!(userProfile?.name && userProfile.name.trim()), label: 'Lengkapi nama profil', href: '/dashboard/settings' },
    { done: !!(userProfile?.bio && userProfile.bio.trim()), label: 'Tambahkan bio singkat', href: '/dashboard/settings' },
    { done: allPosts.length > 0, label: 'Buat konten pertamamu', href: '/dashboard/new' },
    { done: allPosts.some(p => p.published), label: 'Publish artikel atau app', href: '/dashboard/new' },
    { done: !!(userProfile?.bankAccount || userProfile?.qrisImage), label: 'Setup metode pembayaran', href: '/dashboard/settings#payment' },
  ]
  const doneCount = onboardingSteps.filter(s => s.done).length
  const showOnboarding = doneCount < onboardingSteps.length

  return (
    <DashboardStats
      user={{ name: session!.user.name, username: session!.user.username }}
      onboarding={showOnboarding ? { steps: onboardingSteps, doneCount } : null}
      stats={{ totalViews, totalLikes, published, totalPosts: allPosts.length, totalRevenue, affiliateEarnings }}
      daily30={daily30}
      recentPurchases={recentPurchases.map(p => ({
        id: p.id,
        amount: p.amount,
        payerName: p.payerName,
        postTitle: p.post.title,
        postSlug: p.post.slug,
        createdAt: p.createdAt.toISOString(),
      }))}
      topPosts={recentPosts.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        published: p.published,
        viewCount: p.viewCount,
        likeCount: p.likeCount,
        isPremium: p.isPremium,
        price: p.price,
        updatedAt: p.updatedAt.toISOString(),
        barPct: Math.round((p.viewCount / maxPostViews) * 100),
      }))}
    />
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

async function guard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

export async function GET(req: NextRequest) {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const search = searchParams.get('search') ?? ''
  const filter = searchParams.get('filter') ?? 'all'

  const where = {
    ...(search ? { OR: [{ username: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(filter === 'admin' ? { role: 'admin' } : filter === 'banned' ? { banned: true } : {}),
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, username: true, name: true, email: true,
        role: true, banned: true, createdAt: true,
        _count: { select: { posts: true, followers: true, purchases: true } },
      },
    }),
    db.user.count({ where }),
  ])

  return NextResponse.json({ users, total })
}

export async function PUT(req: NextRequest) {
  const session = await guard()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, action } = await req.json()
  if (!userId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Prevent self-demote or self-ban
  if (userId === session.user.id && (action === 'demote' || action === 'ban'))
    return NextResponse.json({ error: 'Cannot perform this action on yourself' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (action === 'ban') updates.banned = true
  else if (action === 'unban') updates.banned = false
  else if (action === 'promote') updates.role = 'admin'
  else if (action === 'demote') updates.role = 'user'
  else return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  await db.user.update({ where: { id: userId }, data: updates })
  return NextResponse.json({ ok: true })
}

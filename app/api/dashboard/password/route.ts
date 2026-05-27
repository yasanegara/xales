import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { current, next } = await req.json()

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const valid = await bcrypt.compare(current, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Password sekarang salah' }, { status: 400 })

  const passwordHash = await bcrypt.hash(next, 12)
  await db.user.update({ where: { id: session.user.id }, data: { passwordHash } })

  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// GET — list my invites + stats
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invites = await db.invite.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      invitedUser: { select: { username: true, name: true, profilePic: true, createdAt: true } },
    },
  })

  return NextResponse.json({ invites })
}

// POST — generate new invite code
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Generate unique 8-char code
  let code: string
  let exists = true
  do {
    code = randomBytes(4).toString('hex').toUpperCase()
    exists = !!(await db.invite.findUnique({ where: { code } }))
  } while (exists)

  const invite = await db.invite.create({
    data: { code, ownerId: session.user.id },
    include: { invitedUser: { select: { username: true, name: true, profilePic: true, createdAt: true } } },
  })

  return NextResponse.json({ invite }, { status: 201 })
}

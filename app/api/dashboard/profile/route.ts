import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, bio, status, profilePic, affiliateRate } = await req.json()

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: name || null,
      bio: bio || null,
      status: status || null,
      profilePic: profilePic || null,
      ...(affiliateRate !== undefined ? { affiliateRate: Math.min(50, Math.max(5, affiliateRate)) } : {}),
    },
  })

  return NextResponse.json({ ok: true, name: updated.name })
}

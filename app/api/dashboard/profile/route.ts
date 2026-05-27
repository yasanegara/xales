import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, bio, profilePic } = await req.json()

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { name, bio, profilePic },
  })

  return NextResponse.json({ ok: true, name: updated.name })
}

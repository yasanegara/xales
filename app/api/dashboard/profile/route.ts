import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, bio, status, profilePic, affiliateRate, bankName, bankAccount, bankHolder, waNumber, waMessage } = body

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name: name || null } : {}),
      ...(bio !== undefined ? { bio: bio || null } : {}),
      ...(status !== undefined ? { status: status || null } : {}),
      ...(profilePic !== undefined ? { profilePic: profilePic || null } : {}),
      ...(affiliateRate !== undefined ? { affiliateRate: Math.min(50, Math.max(5, affiliateRate)) } : {}),
      ...(bankName !== undefined ? { bankName: bankName || null } : {}),
      ...(bankAccount !== undefined ? { bankAccount: bankAccount || null } : {}),
      ...(bankHolder !== undefined ? { bankHolder: bankHolder || null } : {}),
      ...(waNumber !== undefined ? { waNumber: waNumber || null } : {}),
      ...(waMessage !== undefined ? { waMessage: waMessage || null } : {}),
    },
  })

  return NextResponse.json({ ok: true, name: updated.name })
}

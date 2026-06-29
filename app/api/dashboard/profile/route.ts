import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, bio, status, profilePic, affiliateRate, bankName, bankAccount, bankHolder, qrisImage, waNumber, waMessage } = body

  // Validate WA number: Indonesian mobile, 9-13 digits, starts with 08x/628x/8x
  if (waNumber !== undefined && waNumber) {
    const digits = String(waNumber).replace(/\D/g, '')
    const normalized = digits.replace(/^0/, '').replace(/^62/, '')
    if (!/^8\d{7,11}$/.test(normalized)) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp tidak valid. Gunakan format 08xx atau 628xx (9–13 digit).' },
        { status: 400 }
      )
    }
  }

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
      ...(qrisImage !== undefined ? { qrisImage: qrisImage || null } : {}),
      ...(waNumber !== undefined ? { waNumber: waNumber || null } : {}),
      ...(waMessage !== undefined ? { waMessage: waMessage || null } : {}),
    },
  })

  return NextResponse.json({ ok: true, name: updated.name })
}

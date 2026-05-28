import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ owned: false })

  const { fileId } = await params

  const purchase = await db.filePurchase.findFirst({
    where: { userId: session.user.id, fileId, status: 'paid' },
  })

  return NextResponse.json({ owned: !!purchase })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB original, ~7MB base64

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, mimeType } = await req.json()

  if (!data || !mimeType) return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  if (!mimeType.startsWith('image/')) return NextResponse.json({ error: 'Bukan file gambar' }, { status: 400 })

  // Estimate original size from base64 length
  const estimatedSize = Math.round((data.length * 3) / 4)
  if (estimatedSize > MAX_SIZE) return NextResponse.json({ error: 'Gambar terlalu besar (maks 5MB)' }, { status: 400 })

  const image = await db.image.create({
    data: {
      data,
      mimeType,
      size: estimatedSize,
      uploaderId: session.user.id,
    },
  })

  return NextResponse.json({ id: image.id, url: `/api/images/${image.id}` }, { status: 201 })
}

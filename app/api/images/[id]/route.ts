import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const image = await db.image.findUnique({ where: { id } })
  if (!image) return new NextResponse('Not found', { status: 404 })

  const buffer = Buffer.from(image.data, 'base64')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': image.mimeType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

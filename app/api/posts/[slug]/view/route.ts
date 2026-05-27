import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  await db.post.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  })

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// Serves the cover image as a real HTTP image response.
// Used by the OG image generator so ImageResponse gets an HTTP URL instead of a raw base64 string.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await db.post.findUnique({
    where: { slug, published: true },
    select: { coverImage: true },
  })

  if (!post?.coverImage?.startsWith('data:')) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Parse data URL: "data:<mime>;base64,<data>"
  const [header, base64] = post.coverImage.split(',')
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
  const buffer = Buffer.from(base64, 'base64')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}

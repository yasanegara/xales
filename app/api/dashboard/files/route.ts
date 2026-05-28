import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = new URL(req.url).searchParams.get('type')

  const files = await db.postFile.findMany({
    where: {
      post: { authorId: session.user.id },
      ...(type === 'url' ? { mimeType: 'url/link' } : {}),
    },
    select: {
      id: true, name: true, mimeType: true, url: true,
      post: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(files.map(f => ({
    id: f.id, name: f.name, mimeType: f.mimeType, url: f.url,
    postTitle: f.post.title,
  })))
}

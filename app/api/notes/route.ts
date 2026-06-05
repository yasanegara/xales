import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notes = await db.note.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, postSlug: true, postTitle: true, postAuthorUsername: true, quote: true, comment: true, createdAt: true },
  })

  return NextResponse.json(notes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postSlug, postTitle, postAuthorUsername, quote, comment } = await req.json()
  if (!postSlug || !postTitle || !postAuthorUsername || !quote?.trim()) {
    return NextResponse.json({ error: 'Field wajib kurang' }, { status: 400 })
  }

  const note = await db.note.create({
    data: { userId: session.user.id, postSlug, postTitle, postAuthorUsername, quote: quote.trim(), comment: comment?.trim() || null },
  })

  return NextResponse.json(note, { status: 201 })
}

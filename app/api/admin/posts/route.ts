import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

async function guard() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin' ? session : null
}

export async function PUT(req: NextRequest) {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { postId, action } = await req.json()
  if (!postId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  if (action === 'unpublish') {
    await db.post.update({ where: { id: postId }, data: { published: false } })
  } else if (action === 'delete') {
    await db.post.delete({ where: { id: postId } })
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

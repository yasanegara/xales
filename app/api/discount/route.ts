import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

// GET — list author's discount codes
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const discounts = await db.discount.findMany({
    where: { authorId: session.user.id },
    include: { post: { select: { title: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ discounts })
}

// POST — create discount code
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, type, value, postId, maxUses, expiresAt } = await req.json()

  if (!code || !type || !value)
    return NextResponse.json({ error: 'code, type, dan value wajib diisi' }, { status: 400 })
  if (!['percent', 'fixed'].includes(type))
    return NextResponse.json({ error: 'type harus percent atau fixed' }, { status: 400 })
  if (type === 'percent' && (value < 1 || value > 100))
    return NextResponse.json({ error: 'Persen harus antara 1-100' }, { status: 400 })

  // Verify postId belongs to this author if provided
  if (postId) {
    const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (!post || post.authorId !== session.user.id)
      return NextResponse.json({ error: 'Post tidak ditemukan' }, { status: 404 })
  }

  try {
    const discount = await db.discount.create({
      data: {
        code: code.toUpperCase(),
        type, value,
        authorId: session.user.id,
        postId: postId ?? null,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })
    return NextResponse.json({ discount }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kode sudah digunakan' }, { status: 400 })
  }
}

// DELETE — deactivate discount code
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const discount = await db.discount.findUnique({ where: { id }, select: { authorId: true } })
  if (!discount || discount.authorId !== session.user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.discount.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parentId = req.nextUrl.searchParams.get('parentId') ?? null

  const [folders, files] = await Promise.all([
    db.driveFolder.findMany({
      where: { userId: session.user.id, parentId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, emoji: true, color: true, createdAt: true,
        _count: { select: { children: true, files: true } } },
    }),
    db.driveFile.findMany({
      where: { userId: session.user.id, folderId: parentId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, mimeType: true, size: true, url: true,
        isPublic: true, shareToken: true, createdAt: true, updatedAt: true },
    }),
  ])

  // Breadcrumb trail
  const breadcrumb: { id: string; name: string }[] = []
  if (parentId) {
    let cur: string | null = parentId
    while (cur) {
      const crumbItem: { id: string; name: string; parentId: string | null; userId: string } | null
        = await db.driveFolder.findUnique({ where: { id: cur }, select: { id: true, name: true, parentId: true, userId: true } })
      if (!crumbItem || crumbItem.userId !== session.user.id) break
      breadcrumb.unshift({ id: crumbItem.id, name: crumbItem.name })
      cur = crumbItem.parentId
    }
  }

  return NextResponse.json({ folders, files, breadcrumb })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, parentId, emoji, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nama folder wajib diisi' }, { status: 400 })

  if (parentId) {
    const parent = await db.driveFolder.findUnique({ where: { id: parentId } })
    if (!parent || parent.userId !== session.user.id)
      return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 })
  }

  const folder = await db.driveFolder.create({
    data: { userId: session.user.id, name: name.trim(), parentId: parentId ?? null, emoji: emoji ?? '📁', color: color ?? '#f59e0b' },
    select: { id: true, name: true, emoji: true, color: true, createdAt: true, _count: { select: { children: true, files: true } } },
  })

  return NextResponse.json({ folder }, { status: 201 })
}

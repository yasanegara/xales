import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { rateLimit, getIp } from '@/lib/ratelimit'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = getIp(req)
  if (!rateLimit(`drive-upload:${session.user.id}:${ip}`, 20, 60_000))
    return NextResponse.json({ error: 'Terlalu banyak upload. Coba lagi sebentar.' }, { status: 429 })

  const { name, mimeType, size, data, url, folderId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nama file wajib diisi' }, { status: 400 })

  // Validate folder ownership
  if (folderId) {
    const folder = await db.driveFolder.findUnique({ where: { id: folderId } })
    if (!folder || folder.userId !== session.user.id)
      return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 })
  }

  // For uploaded files, enforce size limit
  if (data && size > MAX_SIZE)
    return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })

  const file = await db.driveFile.create({
    data: {
      userId:   session.user.id,
      folderId: folderId ?? null,
      name:     name.trim(),
      mimeType: mimeType ?? 'application/octet-stream',
      size:     size ?? 0,
      data:     data ?? null,
      url:      url ?? null,
    },
    select: { id: true, name: true, mimeType: true, size: true, url: true, isPublic: true, shareToken: true, createdAt: true },
  })

  return NextResponse.json({ file }, { status: 201 })
}

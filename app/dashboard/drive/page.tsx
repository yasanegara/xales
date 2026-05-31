export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import DriveClient from './DriveClient'

export const metadata = { title: 'Drive · Tweak' }

export default async function DrivePage() {
  const session = await getServerSession(authOptions)
  const userId  = session!.user.id

  const [rootFolders, rootFiles] = await Promise.all([
    db.driveFolder.findMany({
      where: { userId, parentId: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, emoji: true, color: true, createdAt: true,
        _count: { select: { children: true, files: true } } },
    }),
    db.driveFile.findMany({
      where: { userId, folderId: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, mimeType: true, size: true, url: true,
        isPublic: true, shareToken: true, createdAt: true, updatedAt: true },
    }),
  ])

  return <DriveClient
    initialFolders={rootFolders.map(f => ({ ...f, createdAt: f.createdAt.toISOString() }))}
    initialFiles={rootFiles.map(f => ({ ...f, createdAt: f.createdAt.toISOString(), updatedAt: f.updatedAt.toISOString() }))}
  />
}

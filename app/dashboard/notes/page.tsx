export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import NotesClient from './NotesClient'

export const metadata = { title: 'Catatan Saya · Tweak' }

export default async function NotesPage() {
  const session = await getServerSession(authOptions)
  const notes = await db.note.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, postSlug: true, postTitle: true, postAuthorUsername: true, quote: true, comment: true, createdAt: true },
  })

  return (
    <NotesClient
      notes={notes.map(n => ({ ...n, createdAt: n.createdAt.toISOString() }))}
    />
  )
}

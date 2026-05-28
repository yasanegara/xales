import { db } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StandaloneAppPage from './StandaloneAppPage'

export default async function AppPage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params

  const file = await db.postFile.findUnique({
    where: { id: fileId },
    include: {
      post: {
        select: {
          slug: true,
          title: true,
          published: true,
          author: { select: { name: true, username: true } },
        },
      },
    },
  })

  if (!file || file.mimeType !== 'url/link' || !file.url || !file.post.published) {
    notFound()
  }

  return (
    <StandaloneAppPage
      fileId={file.id}
      slug={file.post.slug}
      name={file.name}
      price={file.price ?? null}
      discount={file.discount ?? null}
      url={file.url}
    />
  )
}

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
          description: true,
          content: true,
          published: true,
          author: { select: { name: true, username: true } },
        },
      },
    },
  })

  if (!file || file.mimeType !== 'url/link' || !file.url || !file.post.published) {
    notFound()
  }

  // Use description, or first 300 chars of content as intro
  const intro = file.post.description ?? file.post.content?.slice(0, 300).replace(/[#*_`>\-]/g, '').trim() ?? ''

  return (
    <StandaloneAppPage
      fileId={file.id}
      slug={file.post.slug}
      name={file.name}
      intro={intro}
      price={file.price ?? null}
      discount={file.discount ?? null}
      url={file.url}
    />
  )
}

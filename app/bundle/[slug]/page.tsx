import { db } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import BundleCheckout from './BundleCheckout'

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  const bundle = await db.bundle.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { username: true, name: true, bankName: true, bankAccount: true, bankHolder: true, qrisImage: true, waNumber: true } },
      items: {
        include: {
          post: { select: { id: true, title: true, slug: true, type: true, description: true } },
          file: { select: { id: true, name: true, mimeType: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!bundle) notFound()

  let isPurchased = false
  if (session) {
    const purchase = await db.bundlePurchase.findUnique({
      where: { userId_bundleId: { userId: session.user.id, bundleId: bundle.id } },
    })
    isPurchased = purchase?.status === 'paid'
  }

  const effectivePrice = bundle.discount
    ? Math.round(bundle.price * (1 - bundle.discount / 100))
    : bundle.price

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <BundleCheckout
          slug={bundle.slug}
          title={bundle.title}
          description={bundle.description}
          price={bundle.price}
          discount={bundle.discount}
          effectivePrice={effectivePrice}
          authorName={bundle.author.name ?? `@${bundle.author.username}`}
          authorUsername={bundle.author.username}
          isPurchased={isPurchased}
          items={bundle.items.map(i => ({
            label: i.post ? i.post.title : i.file?.name ?? '',
            type: i.post ? (i.post.type === 'html' ? 'app' : 'article') : 'app',
            description: i.post?.description ?? null,
            href: i.post ? `/@${bundle.author.username}/${i.post.slug}` : i.file ? `/app/${i.file.id}` : '#',
          }))}
        />
      </div>
    </>
  )
}

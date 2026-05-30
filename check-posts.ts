import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
async function main() {
  const posts = await db.post.findMany({
    select: { 
      id: true, 
      title: true, 
      slug: true,
      authorId: true,
      author: { select: { username: true } },
      published: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })
  console.log(`Total posts: ${posts.length}\n`)
  posts.forEach(p => {
    const author = p.author?.username || `[ORPHANED - authorId: ${p.authorId}]`
    console.log(`${p.title.substring(0,50).padEnd(52)} | @${author.padEnd(20)} | ${p.published ? '✅' : '🔒'}`)
  })
}
main().finally(() => db.$disconnect())

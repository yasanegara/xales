import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
async function main() {
  const users = await db.user.findMany({ select: { username: true, email: true, role: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  console.log(`\n📊 Total users: ${users.length}\n`)
  users.forEach((u, i) => console.log(`${i+1}. @${u.username.padEnd(20)} | ${u.email.padEnd(30)} | ${u.role}`))
}
main().finally(() => db.$disconnect())

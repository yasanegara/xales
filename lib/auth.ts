import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from './prisma'
import { slugify } from './utils'

async function generateUniqueUsername(base: string): Promise<string> {
  const clean = slugify(base).replace(/-/g, '_').slice(0, 20) || 'user'
  let username = clean
  let i = 1
  while (await db.user.findUnique({ where: { username } })) {
    username = `${clean}${i++}`
  }
  return username
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.passwordHash) return null
        if (user.banned) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false
        const existing = await db.user.findUnique({ where: { email: user.email } })

        if (existing?.banned) return false

        if (!existing) {
          const username = await generateUniqueUsername(
            user.name?.split(' ')[0] ?? user.email.split('@')[0]
          )
          const newUser = await db.user.create({
            data: { email: user.email, username, name: user.name, profilePic: user.image },
          })
          user.id = newUser.id
          ;(user as { username?: string; role?: string }).username = newUser.username
          ;(user as { username?: string; role?: string }).role = newUser.role
        } else {
          user.id = existing.id
          ;(user as { username?: string; role?: string }).username = existing.username
          ;(user as { username?: string; role?: string }).role = existing.role
          if (!existing.profilePic && user.image) {
            await db.user.update({ where: { id: existing.id }, data: { profilePic: user.image } })
          }
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as unknown as { username: string }).username
      }
      // Always refresh role from DB so middleware stays in sync
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        })
        token.role = dbUser?.role ?? 'user'
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        // Always fetch role + profilePic fresh from DB so role changes take effect immediately
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { profilePic: true, role: true, banned: true },
        })
        session.user.role = dbUser?.role ?? 'user'
        session.user.profilePic = dbUser?.profilePic ?? null
        // Block banned users
        if (dbUser?.banned) return { ...session, user: { ...session.user, id: '' } }
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}

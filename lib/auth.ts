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
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, username: user.username }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth — create user if first login
      if (account?.provider === 'google') {
        if (!user.email) return false

        const existing = await db.user.findUnique({ where: { email: user.email } })

        if (!existing) {
          const username = await generateUniqueUsername(
            user.name?.split(' ')[0] ?? user.email.split('@')[0]
          )
          const newUser = await db.user.create({
            data: {
              email: user.email,
              username,
              name: user.name,
              profilePic: user.image,
            },
          })
          user.id = newUser.id
          ;(user as { username?: string }).username = newUser.username
        } else {
          user.id = existing.id
          ;(user as { username?: string }).username = existing.username
          // Update profile pic from Google if not set
          if (!existing.profilePic && user.image) {
            await db.user.update({
              where: { id: existing.id },
              data: { profilePic: user.image },
            })
          }
        }
      }
      return true
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as unknown as { username: string }).username
      }
      return token
    },

    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}

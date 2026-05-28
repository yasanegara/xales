import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      role: string
      profilePic?: string | null
    } & DefaultSession['user']
  }
}

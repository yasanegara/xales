import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
  // /api/images/[id] is intentionally NOT matched — public access needed for rendering
}

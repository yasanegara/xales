import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin + /dashboard — only check authentication here.
  // Role check (admin) is handled by the admin layout via getServerSession()
  // which reads from DB, so role changes take effect immediately.
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
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

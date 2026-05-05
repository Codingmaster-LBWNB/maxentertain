import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken, verifySession } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow login page and login API through
  if (pathname === '/maxowner/login' || pathname.startsWith('/api/maxowner/auth/')) {
    return NextResponse.next()
  }

  const token = getSessionToken(req)
  if (!token || !(await verifySession(token))) {
    const loginUrl = new URL('/maxowner/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/maxowner/:path*', '/api/maxowner/:path*'],
}

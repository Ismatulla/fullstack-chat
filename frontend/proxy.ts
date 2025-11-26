import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const refreshToken = request.cookies.get('refreshToken')
  const accessToken = request.cookies.get('accessToken')

  const publicRoutes = ['/login', '/signup']
  const isPublic = publicRoutes.includes(pathname)

  // User is NOT authenticated (no refresh token)
  if (!refreshToken && !isPublic && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // User IS authenticated and trying to access login/signup
  if (accessToken && refreshToken && isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}

import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')
  const { pathname } = request.nextUrl

  const publicRoutes = ['/login', '/signup']

  const isPublicRoute = publicRoutes.includes(pathname)
  const protectedRoute = ['/']
  const isProtectedRoute = protectedRoute.includes(pathname)

  if (isProtectedRoute && !refreshToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)

    return NextResponse.redirect(loginUrl)
  }

  if (refreshToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

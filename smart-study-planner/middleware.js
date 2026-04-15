import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

const protectedRoutes = ['/dashboard', '/tasks', '/planner', '/progress', '/assistant']
const authRoutes = ['/login', '/signup']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value
  const user = token ? verifyToken(token) : null

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    //if (!user) {
  
    //return NextResponse.redirect(new URL('/login', request.url))
    //}
    return NextResponse.next()
  }

  // Redirect root to dashboard or login
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(user ? '/dashboard' : '/login', request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

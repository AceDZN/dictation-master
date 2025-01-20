import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from "./lib/auth"

// Protected routes that require authentication
const protectedRoutes = ['/dictation/create']

export const config = {
  matcher: [
    // Protected routes
    '/dictation/create',
    // Auth routes
    '/auth/:path*'
  ]
}

export async function middleware(request: NextRequest) {
  const session = await auth()
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Allow API auth routes to pass through
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect to home if authenticated user tries to access auth pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect to login if unauthenticated user tries to access protected pages
  if (isProtectedRoute && !session) {
    let from = request.nextUrl.pathname
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }
    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, request.url)
    )
  }

  return NextResponse.next()
} 
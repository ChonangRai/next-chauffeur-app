import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/user/signin' || 
                      path === '/user/signup' || 
                      path === '/administrator/signin' ||
                      path === '/administrator/setup'  // Add setup page to public paths

  // Get the token from the cookies
  const token = request.cookies.get('session')?.value || ''

  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access login page, redirect to appropriate dashboard
    if (path.startsWith('/administrator') && path !== '/administrator/setup') {  // Don't redirect setup page
      return NextResponse.redirect(new URL('/administrator/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/user/dashboard', request.url))
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected page, redirect to appropriate login
    if (path.startsWith('/administrator') && path !== '/administrator/setup') {  // Don't redirect setup page
      return NextResponse.redirect(new URL('/administrator/signin', request.url))
    }
    return NextResponse.redirect(new URL('/user/signin', request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/user/dashboard/:path*',
    '/administrator/:path*',
    '/user/signin',
    '/user/signup'
  ]
} 
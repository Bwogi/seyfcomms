import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

// Add paths that should be public (no auth required)
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/',
  '/api/auth/login',
  '/api/auth/register',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Verify the token
    verify(token.value, process.env.JWT_SECRET || '')
    return NextResponse.next()
  } catch (error) {
    // Token is invalid - redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

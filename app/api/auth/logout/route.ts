import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Delete the auth token cookie
  cookies().delete('auth-token')
  
  return NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  )
}

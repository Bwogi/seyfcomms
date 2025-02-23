import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import clientPromise from '@/app/lib/mongodb'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const { email, password } = loginSchema.parse(body)
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const users = db.collection('users')
    
    // Find user by email
    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // Set JWT token in HTTP-only cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    // Return success but don't include the password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(
      { message: 'Login successful', user: userWithoutPassword },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import clientPromise from '@/app/lib/mongodb'
import { sign } from 'jsonwebtoken'
import { Resend } from 'resend'
import { emailTemplates } from '@/app/lib/email-templates'
import { logToDb } from '@/app/lib/logger'

// Input validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Add dynamic config to prevent static rendering
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const { email, password } = registerSchema.parse(body)
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const users = db.collection('users')
    
    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      await logToDb({
        type: 'auth',
        action: 'registration_failed',
        email,
        timestamp: new Date(),
        metadata: { reason: 'email_exists' }
      })

      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create verification token
    const verificationToken = sign(
      { email, type: 'email-verification' },
      process.env.JWT_SECRET || '',
      { expiresIn: '24h' }
    )

    // Create user with unverified status
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Create verification URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${appUrl}/auth/verify-email?token=${verificationToken}`

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send verification email
    await resend.emails.send({
      from: 'SeyfComms <onboarding@resend.dev>',
      to: email,
      ...emailTemplates.verifyEmail({ url: verificationUrl })
    })

    await logToDb({
      type: 'auth',
      action: 'registration_success',
      userId: result.insertedId.toString(),
      email,
      timestamp: new Date()
    })

    return NextResponse.json(
      { 
        message: 'Registration successful. Please check your email to verify your account.',
        userId: result.insertedId 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Failed to register user' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '@/app/lib/mongodb'
import { sign } from 'jsonwebtoken'
import { Resend } from 'resend'
import { emailTemplates } from '@/app/lib/email-templates'
import { logToDb, getRecentFailedAttempts } from '@/app/lib/logger'

// Input validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Add dynamic config to prevent static rendering
export const dynamic = 'force-dynamic'

// Rate limiting map
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_DURATION = 3600000 // 1 hour in milliseconds
const MAX_REQUESTS = 3 // Maximum 3 requests per hour

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const { email } = forgotPasswordSchema.parse(body)

    // Check rate limit
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const now = Date.now()
    const userRateLimit = rateLimit.get(ip)

    // Check recent failed attempts from database
    const recentFailures = await getRecentFailedAttempts(email)
    if (recentFailures >= 5) {
      await logToDb({
        type: 'auth',
        action: 'password_reset_blocked',
        email,
        ip,
        userAgent,
        timestamp: new Date(),
        metadata: { reason: 'too_many_failures' }
      })

      return NextResponse.json(
        { message: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      )
    }

    if (userRateLimit) {
      // Reset count if time window has passed
      if (now - userRateLimit.timestamp > RATE_LIMIT_DURATION) {
        rateLimit.set(ip, { count: 1, timestamp: now })
      } else if (userRateLimit.count >= MAX_REQUESTS) {
        await logToDb({
          type: 'auth',
          action: 'password_reset_blocked',
          email,
          ip,
          userAgent,
          timestamp: new Date(),
          metadata: { reason: 'rate_limit_exceeded' }
        })

        return NextResponse.json(
          { message: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      } else {
        rateLimit.set(ip, { 
          count: userRateLimit.count + 1, 
          timestamp: userRateLimit.timestamp 
        })
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now })
    }
    
    // Check if Resend API key exists
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is missing')
      return NextResponse.json(
        { message: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Check if JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing')
      return NextResponse.json(
        { message: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const users = db.collection('users')
    
    // Find user by email
    const user = await users.findOne({ email })
    
    // Don't reveal if user exists or not
    if (!user) {
      await logToDb({
        type: 'auth',
        action: 'password_reset_failed',
        email,
        ip,
        userAgent,
        timestamp: new Date(),
        metadata: { reason: 'user_not_found' }
      })

      return NextResponse.json(
        { message: 'If an account exists with that email, we have sent password reset instructions.' },
        { status: 200 }
      )
    }

    // Create reset token
    const resetToken = sign(
      { userId: user._id.toString(), type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Create reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`

    try {
      // Initialize Resend
      const resend = new Resend(process.env.RESEND_API_KEY)

      // Send email using template
      await resend.emails.send({
        from: 'SeyfComms <onboarding@resend.dev>',
        to: email,
        ...emailTemplates.resetPassword({ url: resetUrl })
      })

      await logToDb({
        type: 'auth',
        action: 'password_reset_email_sent',
        email,
        ip,
        userAgent,
        userId: user._id.toString(),
        timestamp: new Date()
      })

      return NextResponse.json(
        { message: 'If an account exists with that email, we have sent password reset instructions.' },
        { status: 200 }
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      
      await logToDb({
        type: 'error',
        action: 'email_send_failed',
        email,
        ip,
        userAgent,
        userId: user._id.toString(),
        timestamp: new Date(),
        error: emailError
      })

      return NextResponse.json(
        { message: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

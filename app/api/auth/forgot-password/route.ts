import { NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '@/app/lib/mongodb'
import { sign } from 'jsonwebtoken'
import nodemailer from 'nodemailer'

// Input validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const { email } = forgotPasswordSchema.parse(body)
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const users = db.collection('users')
    
    // Find user by email
    const user = await users.findOne({ email })
    
    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with that email, we have sent password reset instructions.' },
        { status: 200 }
      )
    }

    // Create reset token
    const resetToken = sign(
      { userId: user._id.toString(), type: 'password-reset' },
      process.env.JWT_SECRET || '',
      { expiresIn: '1h' }
    )

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@seyfcomms.com',
      to: email,
      subject: 'Reset your SeyfComms password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You recently requested to reset your password for your SeyfComms account. Click the button below to reset it.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>This password reset link is only valid for the next hour.</p>
        </div>
      `,
    })

    return NextResponse.json(
      { message: 'If an account exists with that email, we have sent password reset instructions.' },
      { status: 200 }
    )
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

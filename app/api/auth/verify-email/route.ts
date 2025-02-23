import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import clientPromise from '@/app/lib/mongodb'
import { logToDb } from '@/app/lib/logger'

// Add dynamic config to prevent static rendering
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || '') as { email: string; type: string }

    if (decoded.type !== 'email-verification') {
      await logToDb({
        type: 'auth',
        action: 'email_verification_failed',
        email: decoded.email,
        timestamp: new Date(),
        metadata: { reason: 'invalid_token_type' }
      })

      return NextResponse.json(
        { message: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const users = db.collection('users')

    // Update user verification status
    const result = await users.updateOne(
      { email: decoded.email },
      { 
        $set: { 
          verified: true,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      await logToDb({
        type: 'auth',
        action: 'email_verification_failed',
        email: decoded.email,
        timestamp: new Date(),
        metadata: { reason: 'user_not_found' }
      })

      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    await logToDb({
      type: 'auth',
      action: 'email_verification_success',
      email: decoded.email,
      timestamp: new Date()
    })

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

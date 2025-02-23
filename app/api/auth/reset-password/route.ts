import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { verify } from 'jsonwebtoken'
import clientPromise from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'

// Input validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const { token, password } = resetPasswordSchema.parse(body)
    
    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || '') as { userId: string; type: string }
    
    if (decoded.type !== 'password-reset') {
      return NextResponse.json(
        { message: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const users = db.collection('users')
    
    // Find user
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Update password
    await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json(
      { message: 'Password reset successful' },
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
      { message: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

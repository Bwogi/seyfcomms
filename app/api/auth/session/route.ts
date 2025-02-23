import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import clientPromise from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const token = cookies().get('auth-token')
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Verify JWT token
    const decoded = verify(token.value, process.env.JWT_SECRET || '') as { userId: string }
    
    // Get user from database
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const users = db.collection('users')
    
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Return user without password
    const { email, _id, createdAt, updatedAt } = user
    return NextResponse.json({ 
      user: { email, _id, createdAt, updatedAt }
    }, { status: 200 })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

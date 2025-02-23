import clientPromise from './mongodb'

export type LogType = 'auth' | 'error' | 'info'

export type LogAction = 
  | 'registration_failed'
  | 'registration_success'
  | 'login_failed'
  | 'login_success'
  | 'password_reset_blocked'
  | 'password_reset_failed'
  | 'password_reset_success'
  | 'password_reset_email_sent'
  | 'email_verification_failed'
  | 'email_verification_success'
  | 'email_send_failed'

interface BaseError {
  name: string;
  message: string;
  stack?: string;
}

export interface LogError extends BaseError {
  code?: string | number;
  details?: Record<string, unknown>;
}

export interface LogEntry {
  type: LogType;
  action: LogAction;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  error?: LogError;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export async function logToDb(entry: LogEntry) {
  try {
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const logs = db.collection('logs')
    
    await logs.insertOne(entry)
  } catch (error) {
    console.error('Failed to write log to database:', error)
    // Still log to console as fallback
    console.log('Log entry:', entry)
  }
}

export async function getRecentFailedAttempts(email: string, minutes: number = 60): Promise<number> {
  try {
    const client = await clientPromise
    const db = client.db('seyfcomms')
    const logs = db.collection('logs')
    
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000)
    
    const count = await logs.countDocuments({
      type: 'auth',
      action: 'password_reset_failed',
      email,
      timestamp: { $gte: cutoffTime }
    })
    
    return count
  } catch (error) {
    console.error('Failed to get recent failed attempts:', error)
    return 0
  }
}

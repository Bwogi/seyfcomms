'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')
        if (!token) {
          setStatus('error')
          setMessage('Verification token is missing')
          return
        }

        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Email verified successfully')
        } else {
          setStatus('error')
          setMessage(data.message || 'Failed to verify email')
        }
      } catch (error: unknown) {
        console.error('Email verification error:', error instanceof Error ? error.message : 'Unknown error')
        setStatus('error')
        setMessage('An error occurred while verifying your email. Please try again later.')
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Email Verification
        </h2>
        <div className="mt-4 text-center">
          {status === 'verifying' && (
            <p className="text-gray-600">Verifying your email address...</p>
          )}
          {status === 'success' && (
            <>
              <p className="text-green-600">{message}</p>
              <div className="mt-4">
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary-600 hover:text-primary-500"
                >
                  Continue to login
                </Link>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-red-600">{message}</p>
              <div className="mt-4">
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary-600 hover:text-primary-500"
                >
                  Return to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Disclosure } from '@headlessui/react'

interface User {
  email: string
  _id: string
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch user session info
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setUser(null)
      toast.success('Logged out successfully')
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {() => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-xl font-bold text-primary-600">
                    SeyfComms
                  </Link>
                </div>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                        >
                          Dashboard
                        </Link>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{user.email}</span>
                          <button
                            onClick={handleLogout}
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/auth/register"
                          className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Icon for menu button */}
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <div className="border-t border-gray-200 pt-4 pb-3">
                    <div className="px-4 flex items-center">
                      <div className="text-base font-medium text-gray-800">{user.email}</div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

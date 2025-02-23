'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      toast.success('Logged out successfully')
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="rounded-lg border-4 border-dashed border-gray-200 p-4 text-center">
                <h2 className="text-lg font-semibold mb-4">Welcome to SeyfComms!</h2>
                <p className="text-gray-600 mb-8">Your secure communication platform</p>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

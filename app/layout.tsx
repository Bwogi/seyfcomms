import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from './components/Navigation'
import Providers from './components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SeyfComms - Secure Communications Platform',
  description: 'A secure communications platform for encrypted messaging and file sharing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full`}>
        <Providers>
          <main>
            <Navigation />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}

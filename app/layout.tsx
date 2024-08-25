'use client';

import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

function NavBar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-white">Personal Dashboard</Link>
        <div className="flex items-center space-x-4">
          <Link href="/habits" className="text-gray-300 hover:text-blue-400">Habits</Link>
          <Link href="/fitness" className="text-gray-300 hover:text-blue-400">Fitness</Link>
          <Link href="/diet" className="text-gray-300 hover:text-blue-400">Diet</Link>
          <Link href="/meditation" className="text-gray-300 hover:text-blue-400">Meditation</Link>
          <Link href="/wealth" className="text-gray-300 hover:text-blue-400">Wealth</Link>
          <Link href="/relationships" className="text-gray-300 hover:text-blue-400">Relationships</Link>
          <Link href="/links-and-papers" className="text-gray-300 hover:text-blue-400">Links & Papers</Link>
          {isAuthenticated ? (
            <button onClick={logout} className="text-gray-300 hover:text-blue-400">Logout</button>
          ) : (
            <Link href="/cheerios" className="text-gray-300 hover:text-blue-400">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <AuthProvider>
        <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
          <NavBar />
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
        </body>
      </AuthProvider>
    </html>
  )
}
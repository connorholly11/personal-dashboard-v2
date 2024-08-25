'use client';

import React, { useState, useEffect } from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { db } from '../lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { AuthProvider } from '../contexts/AuthContext'
import { useAuth } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [darkMode, setDarkMode] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const fetchDarkMode = async () => {
      try {
        const docRef = doc(db, 'settings', 'darkMode')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const isDarkMode = docSnap.data().value
          setDarkMode(isDarkMode)
          document.documentElement.classList.toggle('dark', isDarkMode)
        }
      } catch (error) {
        console.error("Error fetching dark mode setting:", error)
      }
    }
    fetchDarkMode()
  }, [])

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !darkMode
      setDarkMode(newDarkMode)
      document.documentElement.classList.toggle('dark')
      await setDoc(doc(db, 'settings', 'darkMode'), { value: newDarkMode })
    } catch (error) {
      console.error("Error toggling dark mode:", error)
    }
  }

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <AuthProvider>
        <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300`}>
          <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
              <Link href="/" className="font-bold text-xl text-gray-800 dark:text-white">Personal Dashboard</Link>
              <div className="flex items-center space-x-4">
                <Link href="/habits" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Habits</Link>
                <Link href="/fitness" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Fitness</Link>
                <Link href="/diet" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Diet</Link>
                <Link href="/meditation" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Meditation</Link>
                <Link href="/wealth" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Wealth</Link>
                <Link href="/relationships" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Relationships</Link>
                <Link href="/links-and-papers" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Links & Papers</Link>
                {isAuthenticated ? (
                  <button onClick={logout} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Logout</button>
                ) : (
                  <Link href="/cheerios" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Login</Link>
                )}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {darkMode ? '🌞' : '🌙'}
                </button>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
        </body>
      </AuthProvider>
    </html>
  )
}
import React from 'react'
import dynamic from 'next/dynamic'

const HabitTracker = dynamic(() => import('../../components/HabitTracker'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function Habits() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Habit Tracker</h1>
      <HabitTracker />
    </main>
  )
}
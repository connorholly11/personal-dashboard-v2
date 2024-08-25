import React from 'react'
import dynamic from 'next/dynamic'

const FitnessTracker = dynamic(() => import('../../components/FitnessTracker'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function Fitness() {
  return (
    <main className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">Fitness Tracker</h1>
      <FitnessTracker />
    </main>
  )
}
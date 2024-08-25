import React from 'react'
import dynamic from 'next/dynamic'

const MeditationTracker = dynamic(() => import('../../components/MeditationTracker'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function Meditation() {
  return (
    <main className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">Meditation Tracker</h1>
      <MeditationTracker />
    </main>
  )
}
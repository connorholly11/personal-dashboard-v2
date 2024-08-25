import React from 'react'
import dynamic from 'next/dynamic'

const WealthTracker = dynamic(() => import('../../components/WealthTracker'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function Wealth() {
  return (
    <main className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">Wealth Tracker</h1>
      <WealthTracker />
    </main>
  )
}
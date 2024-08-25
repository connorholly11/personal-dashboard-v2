'use client';

import React from 'react'
import dynamic from 'next/dynamic'

const FoodTracker = dynamic(() => import('../../components/FoodTracker'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function Diet() {
  return (
    <main className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">Diet Tracker</h1>
      <FoodTracker />
    </main>
  )
}
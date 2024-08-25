'use client';

import React from 'react'
import dynamic from 'next/dynamic'

const RelationshipTracker = dynamic(() => import('../../components/RelationshipTracker'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function Relationships() {
  return (
    <main className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">Relationship Tracker</h1>
      <RelationshipTracker />
    </main>
  )
}
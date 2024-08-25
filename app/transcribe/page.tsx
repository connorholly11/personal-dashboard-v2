'use client';

import React from 'react'
import dynamic from 'next/dynamic'

const NoteTranscriber = dynamic(() => import('../../components/NoteTranscriber'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
})

export default function Transcribe() {
  return (
    <main className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-4">Note Transcriber</h1>
      <NoteTranscriber />
    </main>
  )
}
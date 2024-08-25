import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Chatbot = dynamic(() => import('../components/Chatbot'), { 
  ssr: false,
  loading: () => <p>Loading Chatbot...</p>
})

const navItems = [
  { href: "/habits", title: "Habits", description: "3/5 completed today" },
  { href: "/fitness", title: "Fitness", description: "Upper body workout at 2 PM" },
  { href: "/diet", title: "Diet", description: "1200/2000 calories consumed" },
  { href: "/meditation", title: "Meditation", description: "15 min session completed" },
  { href: "/wealth", title: "Wealth", description: "$500 saved this month" },
  { href: "/relationships", title: "Relationships", description: "2 catch-ups scheduled" },
  { href: "/transcribe", title: "Transcribe", description: "1 new note ready" },
]

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Personal Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href} className="group">
              <div className="aspect-square bg-blue-100 rounded-lg flex flex-col items-center justify-center p-4 text-center transition-transform transform hover:scale-105 shadow-md">
                <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-600">{item.title}</h2>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="bg-gray-100 rounded-lg shadow-lg p-6">
          <Chatbot />
        </div>
      </div>
    </main>
  )
}
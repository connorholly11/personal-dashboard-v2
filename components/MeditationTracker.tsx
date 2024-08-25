'use client';

import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from '../contexts/AuthContext'
interface MeditationSession {
  id: number
  date: Date
  duration: number
  type: string
  notes: string
}

const MeditationTracker: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([])
  const [newSession, setNewSession] = useState<MeditationSession>({
    id: 0,
    date: new Date(),
    duration: 0,
    type: '',
    notes: ''
  })
  const [meditationTypes, setMeditationTypes] = useState(['Jhana', 'Open Awareness', 'Yoga Nidra', 'Metta'])
  const [newType, setNewType] = useState('')

  useEffect(() => {
    const storedSessions = localStorage.getItem('meditationSessions')
    const storedTypes = localStorage.getItem('meditationTypes')
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions))
    }
    if (storedTypes) {
      setMeditationTypes(JSON.parse(storedTypes))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('meditationSessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('meditationTypes', JSON.stringify(meditationTypes))
  }, [meditationTypes])

  const addSession = () => {
    if (newSession.duration > 0 && newSession.type) {
      setSessions([...sessions, { ...newSession, id: Date.now() }])
      setNewSession({
        id: 0,
        date: new Date(),
        duration: 0,
        type: '',
        notes: ''
      })
    }
  }

  const addMeditationType = () => {
    if (newType && !meditationTypes.includes(newType)) {
      setMeditationTypes([...meditationTypes, newType])
      setNewType('')
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Meditation Tracker</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DatePicker
            selected={newSession.date}
            onChange={(date: Date | null) => setNewSession({ ...newSession, date: date || new Date() })}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            value={newSession.duration}
            onChange={(e) => setNewSession({ ...newSession, duration: Number(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Duration"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Meditation Type</label>
          <select
            value={newSession.type}
            onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="">Select a type</option>
            {meditationTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Add New Type</label>
          <div className="flex mt-1">
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="block w-full border rounded-l-md p-2"
              placeholder="New meditation type"
            />
            <button
              onClick={addMeditationType}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={newSession.notes}
            onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Any thoughts or observations about your session"
            rows={3}
          />
        </div>
        <button
          onClick={addSession}
          className="col-span-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Add Session
        </button>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Recent Sessions</h3>
        <ul className="space-y-2">
          {sessions.slice(-5).reverse().map((session) => (
            <li key={session.id} className="bg-gray-100 p-4 rounded-md">
              <p className="font-semibold">{session.date.toLocaleDateString()} - {session.type}</p>
              <p>{session.duration} minutes</p>
              {session.notes && <p className="mt-2 text-gray-600">{session.notes}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MeditationTracker
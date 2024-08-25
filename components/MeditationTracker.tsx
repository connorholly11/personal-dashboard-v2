'use client';

import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase';

interface MeditationSession {
  id: string;
  date: Date;
  duration: number;
  type: string;
  notes: string;
}

const MeditationTracker: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([])
  const [newSession, setNewSession] = useState<MeditationSession>({
    id: '',
    date: new Date(),
    duration: 0,
    type: '',
    notes: ''
  })
  const [meditationTypes, setMeditationTypes] = useState(['Jhana', 'Open Awareness', 'Yoga Nidra', 'Metta'])
  const [newType, setNewType] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSessions()
    }
  }, [isAuthenticated, user])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('meditationSessions')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching meditation sessions:', error)
    } else {
      setSessions(data?.map(session => ({
        ...session,
        date: new Date(session.date)
      })) || [])
    }
  }

  const addSession = async () => {
    if (!isAuthenticated || !user || newSession.duration <= 0 || !newSession.type) return;

    const { data, error } = await supabase
      .from('meditationSessions')
      .insert({
        user_id: user.id,
        date: newSession.date.toISOString(),
        duration: newSession.duration,
        type: newSession.type,
        notes: newSession.notes
      })

    if (error) {
      console.error('Error adding meditation session:', error)
    } else {
      setNewSession({
        id: '',
        date: new Date(),
        duration: 0,
        type: '',
        notes: ''
      })
      fetchSessions()
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
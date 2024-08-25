'use client';

import React, { useState, useEffect } from 'react'
import { FaPlus, FaRedo, FaClock, FaTrash } from 'react-icons/fa'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

interface Habit {
  id: string;
  name: string;
  startDate: Date;
  purpose: string;
  history: { startDate: Date; endDate: Date }[];
}

const HabitTracker: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState('')
  const [newHabitPurpose, setNewHabitPurpose] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)

  const formatDuration = (startDate: Date, endDate: Date = new Date()) => {
    const diff = endDate.getTime() - startDate.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  const addHabit = async () => {
    if (!isAuthenticated) {
      alert("You must be logged in to add a habit.");
      return;
    }
    if (newHabit.trim()) {
      await addDoc(collection(db, 'habits'), {
        name: newHabit,
        startDate: new Date(),
        purpose: newHabitPurpose,
        history: []
      })
      setNewHabit('')
      setNewHabitPurpose('')
    }
  }

  const restartHabit = async (habit: Habit) => {
    if (!isAuthenticated) {
      alert("You must be logged in to restart a habit.");
      return;
    }
    const newHistory = [
      ...habit.history,
      { startDate: habit.startDate, endDate: new Date() }
    ];
    await updateDoc(doc(db, 'habits', habit.id), {
      startDate: new Date(),
      history: newHistory
    })
  }

  const deleteHabit = async (id: string) => {
    if (!isAuthenticated) {
      alert("You must be logged in to delete a habit.");
      return;
    }
    await deleteDoc(doc(db, 'habits', id))
    setDeleteConfirmation(null)
  }

  useEffect(() => {
    const q = query(collection(db, 'habits'), orderBy('startDate', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habitsData: Habit[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          startDate: data.startDate.toDate(),
          purpose: data.purpose,
          history: Array.isArray(data.history) ? data.history.map((h: any) => ({
            startDate: h.startDate.toDate(),
            endDate: h.endDate.toDate()
          })) : []
        } as Habit;
      })
      setHabits(habitsData)
    })

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <div className="space-y-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="w-full border rounded-md p-2"
            placeholder="New habit to track"
          />
          <input
            type="text"
            value={newHabitPurpose}
            onChange={(e) => setNewHabitPurpose(e.target.value)}
            className="w-full border rounded-md p-2"
            placeholder="Why do you want to form this habit?"
          />
          <button onClick={addHabit} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300">
            <FaPlus /> Add Habit
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white p-4 rounded-md shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{habit.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaClock /> <span>Current streak: {formatDuration(habit.startDate)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <strong>Purpose:</strong> {habit.purpose}
            </div>
            {habit.history && habit.history.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Previous streaks:</strong>
                <ul className="list-disc list-inside">
                  {habit.history.map((streak, index) => (
                    <li key={index}>
                      {formatDuration(streak.startDate, streak.endDate)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-2 space-x-2">
              <button onClick={() => restartHabit(habit)} className="text-blue-500 hover:text-blue-700">
                <FaRedo /> Restart
              </button>
              <button onClick={() => setDeleteConfirmation(habit.id)} className="text-red-500 hover:text-red-700">
                <FaTrash /> Delete
              </button>
            </div>
            {deleteConfirmation === habit.id && (
              <div className="mt-2 bg-red-100 p-2 rounded">
                <p>Are you sure you want to delete this habit?</p>
                <div className="mt-2 space-x-2">
                  <button onClick={() => deleteHabit(habit.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                    Yes, delete
                  </button>
                  <button onClick={() => setDeleteConfirmation(null)} className="bg-gray-300 px-2 py-1 rounded">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default HabitTracker
'use client';

import React, { useState, useEffect } from 'react'
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from '../contexts/AuthContext'

interface Relationship {
  id: string;
  name: string;
  lastInteraction: Date;
}

const RelationshipTracker: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [newRelationship, setNewRelationship] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRelationships()
    }
  }, [isAuthenticated, user])

  const fetchRelationships = async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .order('lastInteraction', { ascending: false })

    if (error) {
      console.error('Error fetching relationships:', error)
    } else {
      setRelationships(data?.map(relationship => ({
        ...relationship,
        lastInteraction: new Date(relationship.lastInteraction)
      })) || [])
    }
  }

  const addRelationship = async () => {
    if (!isAuthenticated || !user) {
      alert("You must be logged in to add a relationship.");
      return;
    }
    if (newRelationship.trim()) {
      const { error } = await supabase
        .from('relationships')
        .insert({
          name: newRelationship,
          lastInteraction: new Date().toISOString(),
          user_id: user.id
        })

      if (error) {
        console.error('Error adding relationship:', error)
      } else {
        setNewRelationship('')
        fetchRelationships()
      }
    }
  }

  const removeRelationship = async (id: string) => {
    if (!isAuthenticated) {
      alert("You must be logged in to remove a relationship.");
      return;
    }
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error removing relationship:', error)
    } else {
      fetchRelationships()
    }
  }

  const updateLastInteraction = async (id: string, date: Date) => {
    if (!isAuthenticated) {
      alert("You must be logged in to update a relationship.");
      return;
    }
    const { error } = await supabase
      .from('relationships')
      .update({ lastInteraction: date.toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating last interaction:', error)
    } else {
      fetchRelationships()
    }
  }

  const formatDuration = (date: Date) => {
    const diff = new Date().getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <div className="space-y-6 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-white">Relationship Tracker</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newRelationship}
          onChange={(e) => setNewRelationship(e.target.value)}
          className="flex-grow border rounded-md p-2 bg-white bg-opacity-80 text-gray-800"
          placeholder="New relationship to track"
        />
        <button onClick={addRelationship} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300">
          <FaPlus />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relationships.map((relationship) => (
          <div key={relationship.id} className="bg-white bg-opacity-80 p-4 rounded-md shadow-md transform hover:scale-105 transition duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{relationship.name}</span>
              <button onClick={() => removeRelationship(relationship.id)} className="text-red-500 hover:text-red-700">
                <FaTrash />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaClock /> <span>Last interaction: {formatDuration(relationship.lastInteraction)}</span>
            </div>
            <div className="mt-2">
              <DatePicker
                selected={relationship.lastInteraction}
                onChange={(date: Date | null) => {
                  if (date) {
                    updateLastInteraction(relationship.id, date);
                  }
                }}
                className="border rounded-md p-2 w-full"
                maxDate={new Date()}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelationshipTracker
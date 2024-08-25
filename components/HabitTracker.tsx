'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaRedo, FaClock, FaTrash } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Habit {
  id: string;
  name: string;
  start_date: string;
  purpose: string;
  history: { start_date: string; end_date: string }[];
}

const HabitTracker: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [newHabitPurpose, setNewHabitPurpose] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const fetchHabits = async () => {
    if (isAuthenticated && user) {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching habits:', error);
      } else {
        setHabits(data || []);
      }
    }
  };

  const testSupabaseConnection = async () => {
    const { data, error } = await supabase.from('habits').select('count').single();
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase. Habit count:', data.count);
    }
  };

  useEffect(() => {
    testSupabaseConnection();
    fetchHabits();
  }, [isAuthenticated, user]);

  const addHabit = async () => {
    if (!isAuthenticated || !user) {
      alert("You must be logged in to add a habit.");
      return;
    }
    if (newHabit.trim()) {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          name: newHabit,
          start_date: new Date().toISOString(),
          purpose: newHabitPurpose,
          history: [],
          user_id: user.id
        })
        .select();

      if (error) {
        console.error('Error adding habit:', error);
        alert('Failed to add habit. Please try again.');
      } else {
        setNewHabit('');
        setNewHabitPurpose('');
        fetchHabits();
      }
    }
  };

  const restartHabit = async (habit: Habit) => {
    if (!isAuthenticated) {
      alert("You must be logged in to restart a habit.");
      return;
    }
    const newHistory = [
      ...habit.history,
      { start_date: habit.start_date, end_date: new Date().toISOString() }
    ];
    const { error } = await supabase
      .from('habits')
      .update({
        start_date: new Date().toISOString(),
        history: newHistory
      })
      .eq('id', habit.id);

    if (error) {
      console.error('Error restarting habit:', error);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!isAuthenticated) {
      alert("You must be logged in to delete a habit.");
      return;
    }
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting habit:', error);
    } else {
      setDeleteConfirmation(null);
    }
  };

  const formatDuration = (startDate: string, endDate: string = new Date().toISOString()) => {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <div className="space-y-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="w-full border rounded-md p-2 bg-gray-700 text-white"
            placeholder="New habit to track"
          />
          <input
            type="text"
            value={newHabitPurpose}
            onChange={(e) => setNewHabitPurpose(e.target.value)}
            className="w-full border rounded-md p-2 bg-gray-700 text-white"
            placeholder="Why do you want to form this habit?"
          />
          <button onClick={addHabit} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
            <FaPlus className="inline mr-2" /> Add Habit
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
              <FaClock /> <span>Current streak: {formatDuration(habit.start_date)}</span>
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
                      {formatDuration(streak.start_date, streak.end_date)}
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
  );
};

export default HabitTracker;
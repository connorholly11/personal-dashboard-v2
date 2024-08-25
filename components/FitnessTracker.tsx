'use client';

import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext';
import { FaPlus } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Exercise {
  id: number
  name: string
  sets: { reps: number; weight: number }[]
}

interface Workout {
  id: string;
  date: Date;
  exercises: Exercise[];
}

const FitnessTracker: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([])
  const [exerciseName, setExerciseName] = useState('')
  const [customExercise, setCustomExercise] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [showGraph, setShowGraph] = useState(false)
  const [exerciseOptions, setExerciseOptions] = useState(['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row'])
  const [foods, setFoods] = useState<string[]>([]);
  const [newFood, setNewFood] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWorkouts()
    }
  }, [isAuthenticated, user])

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching workouts:', error)
    } else {
      setWorkouts(data || [])
    }
  }

  const addExercise = () => {
    if (!isAuthenticated) {
      alert("You must be logged in to add an exercise.");
      return;
    }
    const nameToAdd = customExercise || exerciseName
    if (nameToAdd.trim()) {
      setCurrentWorkout(prevWorkout => [...prevWorkout, {
        id: Date.now(),
        name: nameToAdd,
        sets: []
      }]);
      setExerciseName('');
      setCustomExercise('');
      if (!exerciseOptions.includes(nameToAdd)) {
        setExerciseOptions(prevOptions => [...prevOptions, nameToAdd]);
      }
    }
  }

  const addSet = (exerciseId: number) => {
    if (!isAuthenticated) {
      alert("You must be logged in to add a set.");
      return;
    }
    if (reps && weight) {
      setCurrentWorkout(currentWorkout.map(exercise => 
        exercise.id === exerciseId 
          ? { ...exercise, sets: [...exercise.sets, { reps: Number(reps), weight: Number(weight) }] }
          : exercise
      ))
      setReps('')
      setWeight('')
    }
  }

  const finishWorkout = async () => {
    if (!isAuthenticated || !user) {
      alert("You must be logged in to finish a workout.");
      return;
    }
    if (currentWorkout.length > 0) {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          date: new Date(),
          exercises: currentWorkout
        })

      if (error) {
        console.error('Error inserting workout:', error)
      } else {
        setCurrentWorkout([])
        fetchWorkouts()
      }
    }
  }

  const getChartData = () => {
    if (!selectedExercise) return null

    const exerciseData = workouts
      .flatMap(workout => workout.exercises.filter(exercise => exercise.name === selectedExercise))
      .sort((a, b) => a.id - b.id)

    if (exerciseData.length === 0) return null

    const labels = exerciseData.map((_, index) => `Workout ${index + 1}`)
    const weightData = exerciseData.map(exercise => Math.max(...exercise.sets.map(set => set.weight)))
    const repsData = exerciseData.map(exercise => Math.max(...exercise.sets.map(set => set.reps)))

    return {
      labels,
      datasets: [
        {
          label: 'Weight (lbs)',
          data: weightData,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Reps',
          data: repsData,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    }
  }

  const addFood = async () => {
    if (!isAuthenticated || !user) {
      alert("You must be logged in to add food.");
      return;
    }
    if (newFood.trim()) {
      const { data, error } = await supabase
        .from('foods')
        .insert({
          name: newFood,
          user_id: user.id,
          date: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error adding food:', error);
        alert('Failed to add food. Please try again.');
      } else {
        setFoods([...foods, newFood]);
        setNewFood('');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Fitness Tracker</h1>
      {isAuthenticated ? (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Add Exercise</h2>
          <div className="flex space-x-2 mb-4">
            <select
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="flex-grow border rounded-md p-2"
            >
              <option value="">Select an exercise</option>
              {exerciseOptions.map((exercise) => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
            <input
              type="text"
              value={customExercise}
              onChange={(e) => setCustomExercise(e.target.value)}
              className="flex-grow border rounded-md p-2"
              placeholder="Or enter a custom exercise"
            />
            <button onClick={addExercise} className="bg-blue-500 text-white px-4 py-2 rounded">
              Add Exercise
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Please log in to add exercises.</p>
      )}
      {currentWorkout.map((exercise) => (
        <div key={exercise.id} className="mb-4 p-4 border rounded-md">
          <h3 className="font-semibold">{exercise.name}</h3>
          {isAuthenticated ? (
            <div className="flex mt-2 space-x-2">
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="border p-2 w-20"
                placeholder="Reps"
              />
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border p-2 w-20"
                placeholder="Weight (lbs)"
              />
              <button onClick={() => addSet(exercise.id)} className="bg-green-500 text-white px-4 py-2 rounded">
                Add Set
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Please log in to add sets.</p>
          )}
          {exercise.sets.map((set, index) => (
            <div key={index} className="mt-1">
              Set {index + 1}: {set.reps} reps, {set.weight} lbs
            </div>
          ))}
        </div>
      ))}
      {isAuthenticated ? (
        <button onClick={finishWorkout} className="bg-green-500 text-white px-4 py-2 rounded w-full mt-4">
          Finish Workout
        </button>
      ) : (
        <p className="text-gray-500">Please log in to finish a workout.</p>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Exercise Progress</h2>
        <select
          value={selectedExercise || ''}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="border rounded-md p-2 mb-2"
        >
          <option value="">Select an exercise</option>
          {exerciseOptions.map((exercise) => (
            <option key={exercise} value={exercise}>{exercise}</option>
          ))}
        </select>
        {selectedExercise && (
          <button
            onClick={() => setShowGraph(!showGraph)}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            {showGraph ? 'Hide Graph' : 'Show Graph'}
          </button>
        )}
        {showGraph && selectedExercise && (
          <div className="mt-4">
            {getChartData() ? (
              <Line data={getChartData()!} />
            ) : (
              <p className="text-gray-500">No data available for this exercise.</p>
            )}
          </div>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Food Tracker</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newFood}
            onChange={(e) => setNewFood(e.target.value)}
            className="flex-grow border rounded-md p-2"
            placeholder="Enter food item"
          />
          <button onClick={addFood} className="bg-blue-500 text-white px-4 py-2 rounded">
            <FaPlus className="inline mr-2" /> Add Food
          </button>
        </div>
        <ul>
          {foods.map((food, index) => (
            <li key={index}>{food}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default FitnessTracker
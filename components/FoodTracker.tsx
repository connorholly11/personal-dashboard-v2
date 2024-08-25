'use client';

import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, arrayUnion, arrayRemove, getDocs, updateDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
interface Food {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DailyFood {
  id: string
  date: string
  foods: Food[]
}

const FoodTracker: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [dailyFoods, setDailyFoods] = useState<DailyFood[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newFood, setNewFood] = useState<Food>({ id: 0, name: '', calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [currentDailyFoodId, setCurrentDailyFoodId] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'dailyFoods'), orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const dailyFoodsData: DailyFood[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as DailyFood))
      setDailyFoods(dailyFoodsData)
    })

    return () => unsubscribe()
  }, [])

  const addFood = async () => {
    if (newFood.name.trim()) {
      const currentDate = selectedDate.toISOString().split('T')[0]
      const dailyFoodRef = collection(db, 'dailyFoods')
      const q = query(dailyFoodRef, where('date', '==', currentDate))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        await addDoc(dailyFoodRef, {
          date: currentDate,
          foods: [newFood]
        })
      } else {
        const docRef = doc(db, 'dailyFoods', querySnapshot.docs[0].id)
        await updateDoc(docRef, {
          foods: arrayUnion(newFood)
        })
      }

      setNewFood({ id: 0, name: '', calories: 0, protein: 0, carbs: 0, fat: 0 })
    }
  }

  const removeFood = async (dailyFoodId: string, foodId: number) => {
    const docRef = doc(db, 'dailyFoods', dailyFoodId)
    await updateDoc(docRef, {
      foods: arrayRemove(foodId)
    })
  }

  const getCurrentDayFoods = () => {
    const currentDate = selectedDate.toISOString().split('T')[0]
    const currentDayFood = dailyFoods.find(day => day.date === currentDate)
    if (currentDayFood) {
      setCurrentDailyFoodId(currentDayFood.id)
      return currentDayFood.foods
    }
    return []
  }

  const calculateDailyTotals = (foods: Food[]) => {
    return foods.reduce((totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fat: totals.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Food Tracker</h2>
      <div className="mb-4">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date) => setSelectedDate(date)}
          className="border rounded-md p-2"
        />
      </div>
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Food Name</label>
          <input
            type="text"
            value={newFood.name}
            onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="e.g., Apple"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Calories</label>
          <input
            type="number"
            value={newFood.calories}
            onChange={(e) => setNewFood({ ...newFood, calories: Number(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="kcal"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Protein</label>
          <input
            type="number"
            value={newFood.protein}
            onChange={(e) => setNewFood({ ...newFood, protein: Number(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="grams"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Carbs</label>
          <input
            type="number"
            value={newFood.carbs}
            onChange={(e) => setNewFood({ ...newFood, carbs: Number(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="grams"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fat</label>
          <input
            type="number"
            value={newFood.fat}
            onChange={(e) => setNewFood({ ...newFood, fat: Number(e.target.value) })}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="grams"
          />
        </div>
      </div>
      <button onClick={addFood} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Add Food</button>
      <div>
        <h3 className="text-xl font-bold mb-2">Food Log for {selectedDate.toDateString()}</h3>
        {getCurrentDayFoods().length === 0 ? (
          <p className="text-gray-500">No foods logged for this day. Start by adding a new food above!</p>
        ) : (
          <>
            <ul className="space-y-2">
              {getCurrentDayFoods().map((food) => (
                <li key={food.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                  <span className="font-bold">{food.name}</span>
                  <span>{food.calories} cal</span>
                  <span>{food.protein}g protein</span>
                  <span>{food.carbs}g carbs</span>
                  <span>{food.fat}g fat</span>
                  <button 
                    onClick={() => currentDailyFoodId && removeFood(currentDailyFoodId, food.id)} 
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-blue-100 p-4 rounded-md">
              <h4 className="font-bold">Daily Totals:</h4>
              {(() => {
                const totals = calculateDailyTotals(getCurrentDayFoods())
                return (
                  <p>
                    Calories: {totals.calories} | 
                    Protein: {totals.protein}g | 
                    Carbs: {totals.carbs}g | 
                    Fat: {totals.fat}g
                  </p>
                )
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FoodTracker
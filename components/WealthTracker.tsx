'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import Papa from 'papaparse';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface FinancialEntry {
  id: string;
  date: Date;
  amount: number;
  category: 'income' | 'expense' | 'subscription';
  description: string;
}

interface WealthSnapshot {
  id: string;
  date: Date;
  totalWealth: number;
}

const WealthTracker: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [wealthSnapshots, setWealthSnapshots] = useState<WealthSnapshot[]>([]);
  const [newEntry, setNewEntry] = useState<Omit<FinancialEntry, 'id'>>({
    date: new Date(),
    amount: 0,
    category: 'income',
    description: '',
  });

  useEffect(() => {
    const entriesQuery = query(collection(db, 'financialEntries'), orderBy('date', 'desc'));
    const snapshotsQuery = query(collection(db, 'wealthSnapshots'), orderBy('date', 'desc'));

    const unsubscribeEntries = onSnapshot(entriesQuery, (querySnapshot) => {
      const entriesData: FinancialEntry[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as FinancialEntry));
      setEntries(entriesData);
    });

    const unsubscribeSnapshots = onSnapshot(snapshotsQuery, (querySnapshot) => {
      const snapshotsData: WealthSnapshot[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as WealthSnapshot));
      setWealthSnapshots(snapshotsData);
    });

    return () => {
      unsubscribeEntries();
      unsubscribeSnapshots();
    };
  }, []);

  const addEntry = async () => {
    if (!isAuthenticated) {
      alert("You must be logged in to add an entry.");
      return;
    }
    await addDoc(collection(db, 'financialEntries'), newEntry);
    setNewEntry({
      date: new Date(),
      amount: 0,
      category: 'income',
      description: '',
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      alert("You must be logged in to upload files.");
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv') {
        Papa.parse(file, {
          complete: (results) => {
            // Process CSV data
            console.log(results.data);
            // You'll need to map this data to your FinancialEntry structure
            // and then add each entry to Firestore
          },
          header: true,
        });
      } else if (file.type === 'application/pdf') {
        // For PDF parsing, you'd need a server-side solution or a more complex client-side library
        console.log('PDF parsing not implemented in this example');
      }
    }
  };

  const getChartData = () => {
    const labels = wealthSnapshots.map(snapshot => snapshot.date.toLocaleDateString());
    const data = wealthSnapshots.map(snapshot => snapshot.totalWealth);

    return {
      labels,
      datasets: [
        {
          label: 'Total Wealth',
          data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Wealth Tracker</h2>
      
      {isAuthenticated && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Add New Entry</h3>
          <input
            type="date"
            value={newEntry.date.toISOString().split('T')[0]}
            onChange={(e) => setNewEntry({...newEntry, date: new Date(e.target.value)})}
            className="border rounded-md p-2 mr-2"
          />
          <input
            type="number"
            value={newEntry.amount}
            onChange={(e) => setNewEntry({...newEntry, amount: parseFloat(e.target.value)})}
            className="border rounded-md p-2 mr-2"
            placeholder="Amount"
          />
          <select
            value={newEntry.category}
            onChange={(e) => setNewEntry({...newEntry, category: e.target.value as 'income' | 'expense' | 'subscription'})}
            className="border rounded-md p-2 mr-2"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="subscription">Subscription</option>
          </select>
          <input
            type="text"
            value={newEntry.description}
            onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
            className="border rounded-md p-2 mr-2"
            placeholder="Description"
          />
          <button onClick={addEntry} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Add Entry
          </button>
        </div>
      )}

      {isAuthenticated && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Upload Statement</h3>
          <input
            type="file"
            accept=".csv,.pdf"
            onChange={handleFileUpload}
            className="border rounded-md p-2"
          />
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Recent Entries</h3>
        <ul className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <li key={entry.id} className="bg-gray-100 p-2 rounded-md">
              {entry.date.toLocaleDateString()} - {entry.category}: ${entry.amount} - {entry.description}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Wealth Over Time</h3>
        <Line data={getChartData()} />
      </div>
    </div>
  );
};

export default WealthTracker;
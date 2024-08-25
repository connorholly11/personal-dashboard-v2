'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/supabase';
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
  const { isAuthenticated, user } = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [wealthSnapshots, setWealthSnapshots] = useState<WealthSnapshot[]>([]);
  const [newEntry, setNewEntry] = useState<Omit<FinancialEntry, 'id'>>({
    date: new Date(),
    amount: 0,
    category: 'income',
    description: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEntries();
      fetchWealthSnapshots();
    }
  }, [isAuthenticated, user]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('financialEntries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      setEntries(data?.map(entry => ({
        ...entry,
        date: new Date(entry.date)
      })) || []);
    }
  };

  const fetchWealthSnapshots = async () => {
    const { data, error } = await supabase
      .from('wealthSnapshots')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching wealth snapshots:', error);
    } else {
      setWealthSnapshots(data?.map(snapshot => ({
        ...snapshot,
        date: new Date(snapshot.date)
      })) || []);
    }
  };

  const addEntry = async () => {
    if (!isAuthenticated || !user) {
      alert("You must be logged in to add an entry.");
      return;
    }
    const { error } = await supabase
      .from('financialEntries')
      .insert({ ...newEntry, user_id: user.id });

    if (error) {
      console.error('Error adding entry:', error);
    } else {
      setNewEntry({
        date: new Date(),
        amount: 0,
        category: 'income',
        description: '',
      });
      fetchEntries();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated || !user) {
      alert("You must be logged in to upload files.");
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv') {
        Papa.parse(file, {
          complete: async (results) => {
            // Process CSV data
            console.log(results.data);
            // You'll need to map this data to your FinancialEntry structure
            // and then add each entry to Supabase
            // Example (adjust according to your CSV structure):
            for (const row of results.data as any[]) {
              await supabase.from('financialEntries').insert({
                date: new Date(row.date),
                amount: parseFloat(row.amount),
                category: row.category,
                description: row.description,
                user_id: user.id
              });
            }
            fetchEntries();
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

  if (!isAuthenticated) {
    return <div>Please log in to view your wealth tracker.</div>;
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Wealth Tracker</h2>
      
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

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Upload Statement</h3>
        <input
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileUpload}
          className="border rounded-md p-2"
        />
      </div>

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
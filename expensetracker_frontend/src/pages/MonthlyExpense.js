import React, { useEffect, useState } from 'react';
import axios from '../utils/api';

const MonthlyExpense = () => {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('/monthly-summary/');
        setSummary(res.data);
      } catch {
        alert('Failed to load summary');
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Monthly Summary</h2>
      <p>Total Budget: ₹{summary.budget}</p>
      <p>Total Expenses: ₹{summary.expenses}</p>
      <p>Remaining: ₹{summary.remaining}</p>
    </div>
  );
};

export default MonthlyExpense;

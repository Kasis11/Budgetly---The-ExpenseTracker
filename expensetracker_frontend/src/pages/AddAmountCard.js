import React, { useState } from 'react';
import api from '../utils/api';

const AddAmountCard = ({ total, onAdd }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return alert("Enter a valid amount");

    try {
      const res = await api.post('/wallet/add-amount/', { amount });
      onAdd(parseFloat(amount));
      setAmount('');
      alert(`₹${amount} added! New balance: ₹${res.data.balance}`);
    } catch (err) {
      console.error('Failed to add amount:', err);
      alert('Failed to add amount');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      {/* <h3 className="text-lg font-semibold mb-2 text-center">Wallet Balance</h3>
      <p className="text-2xl font-bold text-green-600 text-center mb-4">₹{total.toFixed(2)}</p> */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="number"
          value={amount}
          placeholder="Enter amount"
          onChange={(e) => setAmount(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
          <div className="flex justify-center">

        <button
          type="submit"
          className="bg-blue-600 w-40 h-10 text-white py-1 rounded hover:bg-blue-700"
        >
          Add Amount
        </button>
        </div>
      </form>
    </div>
  );
};

export default AddAmountCard;

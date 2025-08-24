// import React, { useState } from "react";
// import api from "../utils/api";

// const AddExpense = () => {
//   const [amount, setAmount] = useState("");
//   const [category, setCategory] = useState("");
//   const [customCategory, setCustomCategory] = useState("");
//   const [note, setNote] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const finalCategory = category === "Other" ? customCategory : category;

//     try {
      // await api.post("/expenses/", {
//         amount,
//         category: finalCategory,
//         title: note,
//       });

//       alert("Expense added successfully!");
//       setAmount("");
//       setCategory("");
//       setCustomCategory("");
//       setNote("");
//     } catch (err) {
//       console.error("Error adding expense:", err.response?.data || err);
//       alert("Failed to add expense");
//     }
//   };

//   return (
//     <div className="p-6 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="number"
//           placeholder="Amount"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="w-full border p-2 mb-4 rounded"
//           required
//         />

//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           className="w-full border p-2 mb-4 rounded"
//           required
//         >
//           <option value="" disabled>Select Category</option>
//           <option value="Breakfast">Breakfast</option>
//           <option value="Lunch">Lunch</option>
//           <option value="Dinner">Dinner</option>
//           <option value="Petrol">Petrol</option>
//           <option value="Other">Other</option>
//         </select>

//         {category === "Other" && (
//           <input
//             type="text"
//             placeholder="Enter custom category"
//             value={customCategory}
//             onChange={(e) => setCustomCategory(e.target.value)}
//             className="w-full border p-2 mb-4 rounded"
//             required
//           />
//         )}

//         <input
//           type="text"
//           placeholder="Note (optional)"
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           className="w-full border p-2 mb-4 rounded"
//         />

//         <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full">
//           Add Expense
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddExpense;

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import api from '../utils/api'; // Make sure this path is correct

const AddExpenseModal = ({ open, onClose, onRefresh, fetchWallet }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');

  const categories = ['Lunch', 'Dinner', 'Breakfast', 'Petrol', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCategory = category === 'Other' ? customCategory : category;

    if (!selectedCategory || !amount || !date) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      await api.post('/expenses/', {
        title: selectedCategory,
        amount: parseFloat(amount),
        category: selectedCategory,
        note,
        date,
      });

      onRefresh(); // Reload the expense list
      onClose();   // Close the modal
      // Clear form
      setAmount('');
      setCategory('');
      setCustomCategory('');
      setNote('');
      setDate('');
      fetchWallet();       
    } catch (err) {
      console.error('Failed to add expense:', err);
      alert('Error adding expense');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
          <Dialog.Title className="text-xl font-bold mb-4">Add New Expense</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {category === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            )}
            <textarea
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddExpenseModal;

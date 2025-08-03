import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import api from '../utils/api';

const SetBudgetModal = ({ open, setOpen, fetchBudget }) => {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('daily');
  const [notify, setNotify] = useState(true); // default is enabled

  const handleSubmit = async () => {
    try {
      await api.post('/budget/', {
        amount,
        period,
        notify_on_threshold: notify,
      });
      fetchBudget();
      setOpen(false);
    } catch (err) {
      console.error('Error setting budget:', err);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
          <Dialog.Title className="text-xl font-bold mb-4">Set Budget</Dialog.Title>

          <div className="space-y-4">
            <input
              type="number"
              placeholder="Enter budget amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notify}
                onChange={() => setNotify((prev) => !prev)}
                className="w-4 h-4"
              />
              <label className="text-sm">Enable Budget Usage Alerts</label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Budget
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SetBudgetModal;

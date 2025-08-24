import React, { useEffect, useState } from "react";
import AddAmountCard from "./AddAmountCard";
import AddExpenseModal from "./AddExpenseModal";
import SetBudgetModal from "./SetBudgetModal";
import ExpenseTable from "./ExpenseTable";
import api from "../utils/api";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [budget, setBudget] = useState({
    daily_budget: 0,
    monthly_budget: 0,
    yearly_budget: 0,
  });
  const [alerts, setAlerts] = useState({}); // <-- New state

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses/");
      setExpenses(res.data);
      const total = res.data.reduce(
        (sum, exp) => sum + parseFloat(exp.amount),
        0
      );
      setTotalExpense(total);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet/");
      if (res.data.length > 0) {
        setWalletBalance(parseFloat(res.data[0].balance));
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await api.get("/budget/");
      if (res.data.length > 0) {
        setBudget({
          daily_budget: parseFloat(res.data[0].daily_budget || 0),
          monthly_budget: parseFloat(res.data[0].monthly_budget || 0),
          yearly_budget: parseFloat(res.data[0].yearly_budget || 0),
        });
      }
    } catch (err) {
      console.error("Failed to fetch budget:", err);
    }
  };

  const checkBudgetAlerts = async () => {
    try {
      const res = await api.get("/budget/check_usage/");
      if (res.data.alerts) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error("Failed to check budget alerts:", err);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await api.post("/expenses/", expenseData);
      fetchExpenses();
    } catch (err) {
      console.error("Failed to add expense:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}/`);
      fetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
  };

  useEffect(() => {
  if (localStorage.getItem("access_token")) {
    fetchExpenses();
    fetchWallet();
    fetchBudget();
    checkBudgetAlerts();
  }
}, []);


  return (
    <div className="p-4 space-y-6">
      {/* ✅ Budget Alerts Notification */}
      {Object.keys(alerts).length > 0 && (
        <div className="relative bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded shadow">
          {/* ❌ Close button */}
          <button
            onClick={() => setAlerts({})}
            className="absolute top-2 right-2 text-yellow-700 hover:text-red-600 font-bold text-lg"
            aria-label="Close alert"
          >
            ×
          </button>

          <p className="font-semibold mb-1">⚠️ Budget Usage Alert:</p>
          {Object.entries(alerts).map(([key, msg]) => (
            <p key={key} className="text-sm">
              - {msg}
            </p>
          ))}
        </div>
      )}
      {/* Top 3 Cards: Add Amount | Add Expense | Set Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AddAmountCard
          total={walletBalance}
          onAdd={(amount) => setWalletBalance((prev) => prev + amount)}
        />

        <div className="bg-white p-4 rounded shadow-md flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Add Expense
          </h3>

          <div className="flex justify-center">
            <button
              className="bg-red-600 w-40 h-10 text-white py-2 rounded hover:bg-red-700"
              onClick={() => setShowExpenseModal(true)}
            >
              Add Expense
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-md flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-2 text-center">Set Budget</h3>
          <div className="flex justify-center">
            <button
              className="bg-blue-600 w-40 h-10 text-white py-2 rounded hover:bg-blue-700"
              onClick={() => setShowBudgetModal(true)}
            >
              set Budget
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Balance & Total Expense */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-semibold text-center mb-2">
            Wallet Balance
          </h3>
          <p className="text-3xl font-bold text-green-600 text-center">
            ₹{walletBalance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-semibold text-center mb-2">
            Total Expense
          </h3>
          <p className="text-3xl font-bold text-red-600 text-center">
            ₹{totalExpense.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Set Budget Display */}
      {/* Set Budget Display */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Your Set Budgets
        </h3>

        {budget.daily_budget === 0 &&
        budget.monthly_budget === 0 &&
        budget.yearly_budget === 0 ? (
          <p className="text-gray-500 text-center">No budgets set.</p>
        ) : (
          <div
            className={`grid gap-4 text-center justify-items-center ${
              [
                budget.daily_budget,
                budget.monthly_budget,
                budget.yearly_budget,
              ].filter((v) => v > 0).length === 1
                ? "grid-cols-1"
                : [
                    budget.daily_budget,
                    budget.monthly_budget,
                    budget.yearly_budget,
                  ].filter((v) => v > 0).length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {budget.daily_budget > 0 && (
              <div className=" p-4 rounded w-48">
                <p className="text-gray-600">Daily</p>
                <p className="text-xl font-bold">
                  ₹{budget.daily_budget.toFixed(2)}
                </p>
              </div>
            )}
            {budget.monthly_budget > 0 && (
              <div className=" p-4 rounded w-48">
                <p className="text-gray-600">Monthly</p>
                <p className="text-xl font-bold">
                  ₹{budget.monthly_budget.toFixed(2)}
                </p>
              </div>
            )}
            {budget.yearly_budget > 0 && (
              <div className="p-4 rounded w-48">
                <p className="text-gray-600">Yearly</p>
                <p className="text-xl font-bold">
                  ₹{budget.yearly_budget.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expense Table */}
      <ExpenseTable
        expenses={expenses}
        onDelete={handleDelete}
        onRefresh={fetchExpenses}
      />

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <AddExpenseModal
          open={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onRefresh={fetchExpenses}
        />
      )}

      {/* Set Budget Modal */}
      {showBudgetModal && (
        <SetBudgetModal
          open={showBudgetModal}
          setOpen={setShowBudgetModal}
          fetchBudget={fetchBudget}
        />
      )}
    </div>
  );
};

export default Dashboard;

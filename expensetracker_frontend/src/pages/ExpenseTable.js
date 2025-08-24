import React, { useState, useEffect } from "react";
import { HiAdjustments } from "react-icons/hi";
import api from "../utils/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ConfirmModal from "./ConfirmModal";

const ExpenseTable = ({ expenses, onDelete, onRefresh, fetchWallet }) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editedExpense, setEditedExpense] = useState({});
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Petrol", "Other"];

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtering logic
  useEffect(() => {
    let filtered = [...expenses];

    if (filterType === "category" && filterValue) {
      filtered = filtered.filter((exp) => exp.category === filterValue);
    } else if (filterType === "startDate" && filterValue) {
      filtered = filtered.filter(
        (exp) => new Date(exp.date) >= new Date(filterValue)
      );
    } else if (
      filterType === "monthYear" &&
      filterValue?.month &&
      filterValue?.year
    ) {
      filtered = filtered.filter((exp) => {
        const date = new Date(exp.date);
        return (
          (date.getMonth() + 1).toString().padStart(2, "0") ===
            filterValue.month &&
          date.getFullYear().toString() === filterValue.year
        );
      });
    }

    setFilteredExpenses(filtered);
  }, [filterType, filterValue, expenses]);

  const handleDeleteClick = (exp) => {
    setDeleteTarget(exp); // store expense info
    setShowConfirm(true); // open modal
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await api.delete(`/expenses/${deleteTarget.id}/?refund=true`); // always refund if Yes
        onRefresh();
        fetchWallet();       // <-- add this to refresh wallet balance

      } catch (err) {
        console.error("Failed to delete expense:", err);
      }
    }
    setShowConfirm(false);
    setDeleteTarget(null);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedExpense({ ...filteredExpenses[index] });
  };

  const handleChange = (field, value) => {
    setEditedExpense((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await api.put(`/expenses/${editedExpense.id}/`, editedExpense);
      setEditIndex(null);
      setEditedExpense({});
      onRefresh();
    } catch (err) {
      console.error("Failed to update expense:", err);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    let reportTitle = "Expenses Report";
    if (filterType === "monthYear" && filterValue?.month && filterValue?.year) {
      const monthName = new Date(
        `${filterValue.year}-${filterValue.month}-01`
      ).toLocaleString("default", { month: "long" });
      reportTitle += ` - ${monthName} ${filterValue.year}`;
    }

    doc.text(reportTitle, 14, 16);

    const tableData = filteredExpenses.map((e) => [
      new Date(e.date).toLocaleDateString(),
      `${e.amount}`,
      e.category,
      e.note || "-",
    ]);

    doc.autoTable({
      head: [["Date", "Amount", "Category", "Note"]],
      body: tableData,
      startY: 20,
    });

    doc.save("expenses_report.pdf");
  };

  return (
    <div className="mt-6">
      {/* Filter Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border rounded shadow hover:bg-gray-100"
        >
          <HiAdjustments className="text-xl" />
          <span className="text-base font-medium">Filters</span>
        </button>
        <button
          className="bg-purple-600 text-white text-sm px-4 py-2 rounded shadow hover:bg-purple-700"
          onClick={handleExportPDF}
        >
          Export to PDF
        </button>
      </div>

      {/* Filter Fields */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-4 items-end border p-4 rounded bg-gray-50">
          <div>
            <label className="block text-sm font-medium">Filter By</label>
            <select
              className="border px-3 py-1 rounded"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue(e.target.value === "monthYear" ? {} : "");
              }}
            >
              <option value="">-- Select --</option>
              <option value="category">Category</option>
              <option value="startDate">Start Date</option>
              <option value="monthYear">Month and Year</option>
            </select>
          </div>

          {/* Category filter */}
          {filterType === "category" && (
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                className="border px-3 py-1 rounded"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="">All</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Date filter */}
          {filterType === "startDate" && (
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="border px-3 py-1 rounded"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
          )}

          {/* Month and Year filter */}
          {filterType === "monthYear" && (
            <>
              <div>
                <label className="block text-sm font-medium">Month</label>
                <select
                  className="border px-3 py-1 rounded"
                  value={filterValue.month || ""}
                  onChange={(e) =>
                    setFilterValue((prev) => ({
                      ...prev,
                      month: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Month --</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = `${(i + 1).toString().padStart(2, "0")}`;
                    const label = new Date(0, i).toLocaleString("default", {
                      month: "long",
                    });
                    return (
                      <option key={month} value={month}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Year</label>
                <select
                  className="border px-3 py-1 rounded"
                  value={filterValue.year || ""}
                  onChange={(e) =>
                    setFilterValue((prev) => ({
                      ...prev,
                      year: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Year --</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          )}

          <button
            className="bg-gray-300 text-sm px-3 py-1 rounded"
            onClick={() => {
              setFilterType("");
              setFilterValue("");
            }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 border border-gray-300 rounded">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Note</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp, idx) => (
              <tr key={exp.id} className="bg-white border-b">
                <td className="px-4 py-2 border">
                  {editIndex === idx ? (
                    <input
                      type="date"
                      value={editedExpense.date?.slice(0, 10)}
                      onChange={(e) => handleChange("date", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    new Date(exp.date).toLocaleDateString()
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editIndex === idx ? (
                    <input
                      type="number"
                      value={editedExpense.amount}
                      onChange={(e) => handleChange("amount", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    `₹${exp.amount}`
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editIndex === idx ? (
                    <select
                      value={editedExpense.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="">Select</option>
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    exp.category
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editIndex === idx ? (
                    <input
                      type="text"
                      value={editedExpense.note || ""}
                      onChange={(e) => handleChange("note", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    exp.note || "-"
                  )}
                </td>
                <td className="px-4 py-2 border flex flex-wrap gap-2">
                  {editIndex === idx ? (
                    <>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded text-xs"
                        onClick={() => setEditIndex(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() => handleEdit(idx)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() => handleDeleteClick(exp)} // ✅ open modal
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        message={`Do you want to refund ₹${deleteTarget?.amount} back to wallet?`}
      />
    </div>
  );
};

export default ExpenseTable;

"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import FilterBar from "@/components/FilterBar";
import ExpenseList from "@/components/ExpenseList";
import ExpenseForm from "@/components/ExpenseForm";
import Modal from "@/components/Modal";
import { Expense, ExpenseFormData } from "@/types";
import { exportToCSV } from "@/lib/export";
import { formatCurrency } from "@/lib/formatting";

export default function ExpensesPage() {
  const {
    filteredExpenses,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    expenses,
    isLoaded,
  } = useExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleAdd(data: ExpenseFormData) {
    addExpense(data);
    setShowForm(false);
    showToast("Expense added!");
  }

  function handleEdit(data: ExpenseFormData) {
    if (!editingExpense) return;
    updateExpense(editingExpense.id, data);
    setEditingExpense(null);
    showToast("Expense updated!");
  }

  function handleDelete(id: string) {
    deleteExpense(id);
    showToast("Expense deleted");
  }

  const filteredTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {expenses.length} total expenses
          </p>
        </div>
        {filteredExpenses.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Filtered total</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(filteredTotal)}
            </p>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onExport={() => exportToCSV(filteredExpenses)}
        onAdd={() => setShowForm(true)}
        resultCount={filteredExpenses.length}
      />

      {/* List */}
      <ExpenseList
        expenses={filteredExpenses}
        onEdit={setEditingExpense}
        onDelete={handleDelete}
        isLoaded={isLoaded}
      />

      {/* Add Modal */}
      {showForm && (
        <Modal title="Add Expense" onClose={() => setShowForm(false)}>
          <ExpenseForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <Modal title="Edit Expense" onClose={() => setEditingExpense(null)}>
          <ExpenseForm
            initial={editingExpense}
            onSubmit={handleEdit}
            onCancel={() => setEditingExpense(null)}
          />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

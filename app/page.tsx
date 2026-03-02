"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import SummaryCards from "@/components/SummaryCards";
import SpendingChart from "@/components/SpendingChart";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import ExpenseList from "@/components/ExpenseList";
import ExpenseForm from "@/components/ExpenseForm";
import Modal from "@/components/Modal";
import { Expense, ExpenseFormData } from "@/types";
import ExportHub from "@/components/ExportHub";
import { SAMPLE_EXPENSES } from "@/lib/sampleData";
import { saveExpenses } from "@/lib/storage";

export default function DashboardPage() {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoaded,
    stats,
    chartData,
  } = useExpenses();

  function loadSampleData() {
    saveExpenses(SAMPLE_EXPENSES);
    window.location.reload();
  }

  const [showForm, setShowForm] = useState(false);
  const [showHub, setShowHub] = useState(false);
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

  // Show only the 5 most recent on dashboard
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <button
              onClick={() => setShowHub(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Hub
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={stats} />

      {/* Charts */}
      <SpendingChart
        dailySpending={chartData.dailySpending}
        categoryBreakdown={chartData.categoryBreakdown}
      />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Expenses */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Recent Expenses
            </h2>
            <a
              href="/expenses"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              View all →
            </a>
          </div>
          <ExpenseList
            expenses={recentExpenses}
            onEdit={setEditingExpense}
            onDelete={handleDelete}
            isLoaded={isLoaded}
          />
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-700">All Time</h2>
          </div>
          <CategoryBreakdown
            spendingByCategory={stats.spendingByCategory}
            total={stats.totalSpending}
          />
        </div>
      </div>

      {/* Empty state call-to-action */}
      {isLoaded && expenses.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Start tracking your expenses
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Add your first expense above, or load sample data to explore the app.
          </p>
          <button
            onClick={loadSampleData}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Load Sample Data
          </button>
        </div>
      )}

      {/* Export Hub */}
      {showHub && <ExportHub expenses={expenses} onClose={() => setShowHub(false)} />}

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

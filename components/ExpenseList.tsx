"use client";

import { useState } from "react";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isLoaded: boolean;
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  isLoaded,
}: ExpenseListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  if (!isLoaded) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="text-4xl mb-3">💸</div>
        <p className="text-gray-600 font-medium mb-1">No expenses found</p>
        <p className="text-sm text-gray-400">
          Add your first expense or adjust your filters
        </p>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dayExpenses = grouped[date];
        const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);

        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {formatDate(date)}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {formatCurrency(dayTotal)}
              </p>
            </div>

            <div className="space-y-2">
              {dayExpenses.map((expense) => {
                const color =
                  CATEGORY_COLORS[
                    expense.category as keyof typeof CATEGORY_COLORS
                  ] ?? "#6b7280";
                const icon =
                  CATEGORY_ICONS[
                    expense.category as keyof typeof CATEGORY_ICONS
                  ] ?? "📦";

                return (
                  <div
                    key={expense.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 group hover:border-gray-200 transition-colors"
                  >
                    {/* Category dot */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      {icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {expense.description}
                      </p>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${color}18`,
                          color,
                        }}
                      >
                        {expense.category}
                      </span>
                    </div>

                    {/* Amount */}
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatCurrency(expense.amount)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          confirmDelete === expense.id
                            ? "bg-red-100 text-red-600"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title={
                          confirmDelete === expense.id
                            ? "Click again to confirm"
                            : "Delete"
                        }
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

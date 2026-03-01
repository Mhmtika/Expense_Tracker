"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseFormData, FilterState, Category } from "@/types";
import { loadExpenses, saveExpenses } from "@/lib/storage";
import { formatDateInput } from "@/lib/formatting";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
  sortBy: "date",
  sortOrder: "desc",
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) saveExpenses(expenses);
  }, [expenses, isLoaded]);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const expense: Expense = {
      id: generateId(),
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description.trim(),
      date: data.date,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpense = useCallback(
    (id: string, data: ExpenseFormData) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                amount: parseFloat(data.amount),
                category: data.category,
                description: data.description.trim(),
                date: data.date,
              }
            : e
        )
      );
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const filteredExpenses = expenses.filter((e) => {
    if (
      filters.search &&
      !e.description.toLowerCase().includes(filters.search.toLowerCase()) &&
      !e.category.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.category !== "All" && e.category !== filters.category) {
      return false;
    }
    if (filters.dateFrom && e.date < filters.dateFrom) return false;
    if (filters.dateTo && e.date > filters.dateTo) return false;
    return true;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let cmp = 0;
    if (filters.sortBy === "date") cmp = a.date.localeCompare(b.date);
    else if (filters.sortBy === "amount") cmp = a.amount - b.amount;
    else if (filters.sortBy === "category")
      cmp = a.category.localeCompare(b.category);
    return filters.sortOrder === "asc" ? cmp : -cmp;
  });

  // Stats
  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  const monthlySpending = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const spendingByCategory = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {}
  );

  const topCategory =
    Object.entries(spendingByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "—";

  // Daily spending for chart (last 30 days)
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return formatDateInput(d);
  });

  const dailySpending = last30.map((date) => ({
    date: date.slice(5), // MM-DD
    amount: expenses
      .filter((e) => e.date === date)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  return {
    expenses,
    filteredExpenses: sortedExpenses,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoaded,
    stats: {
      totalSpending,
      monthlySpending,
      spendingByCategory,
      topCategory,
      count: expenses.length,
      monthlyCount: expenses.filter((e) =>
        e.date.startsWith(currentMonth)
      ).length,
    },
    chartData: {
      dailySpending,
      categoryBreakdown: Object.entries(spendingByCategory).map(
        ([name, value]) => ({ name, value })
      ),
    },
  };
}

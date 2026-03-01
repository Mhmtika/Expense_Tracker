"use client";

import { useState, useEffect } from "react";
import { Expense, ExpenseFormData, CATEGORIES, Category } from "@/types";
import { formatDateInput } from "@/lib/formatting";

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  initial?: Expense | null;
}

const EMPTY_FORM: ExpenseFormData = {
  amount: "",
  category: "Food",
  description: "",
  date: formatDateInput(new Date()),
};

export default function ExpenseForm({
  onSubmit,
  onCancel,
  initial,
}: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        amount: String(initial.amount),
        category: initial.category,
        description: initial.description,
        date: initial.date,
      });
    } else {
      setForm({ ...EMPTY_FORM, date: formatDateInput(new Date()) });
    }
    setErrors({});
  }, [initial]);

  function validate(): boolean {
    const e: Partial<ExpenseFormData> = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0)
      e.amount = "Enter a valid positive amount";
    if (amt > 1_000_000) e.amount = "Amount is too large";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.description.trim().length > 200)
      e.description = "Max 200 characters";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Small delay for visual feedback
    setTimeout(() => {
      onSubmit(form);
      setSubmitting(false);
    }, 150);
  }

  function field(key: keyof ExpenseFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => field("amount", e.target.value)}
            className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
              errors.amount
                ? "border-red-400 bg-red-50 focus:border-red-500"
                : "border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => field("category", e.target.value as Category)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          placeholder="What did you spend on?"
          value={form.description}
          onChange={(e) => field("description", e.target.value)}
          maxLength={200}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
            errors.description
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={form.date}
          max={formatDateInput(new Date())}
          onChange={(e) => field("date", e.target.value)}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
            errors.date
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-xs text-red-500">{errors.date}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? "Saving…" : initial ? "Save Changes" : "Add Expense"}
        </button>
      </div>
    </form>
  );
}

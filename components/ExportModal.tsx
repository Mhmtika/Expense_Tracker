"use client";

import { useState, useMemo, useEffect } from "react";
import { Expense, CATEGORIES, Category, CATEGORY_ICONS } from "@/types";
import { formatDate, formatCurrency, formatDateInput } from "@/lib/formatting";
import { exportToCSV, exportToJSON, exportToPDF, ExportFormat } from "@/lib/export";

interface ExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_META: Record<ExportFormat, { label: string; icon: string; desc: string; color: string }> = {
  csv: {
    label: "CSV",
    icon: "📊",
    desc: "Spreadsheet-compatible, works with Excel & Google Sheets",
    color: "border-emerald-400 bg-emerald-50 text-emerald-700",
  },
  json: {
    label: "JSON",
    icon: "{ }",
    desc: "Structured data format, ideal for developers & APIs",
    color: "border-blue-400 bg-blue-50 text-blue-700",
  },
  pdf: {
    label: "PDF",
    icon: "📄",
    desc: "Formatted report with totals, ready to print or share",
    color: "border-rose-400 bg-rose-50 text-rose-700",
  },
};

type Step = "configure" | "preview";

export default function ExportModal({ expenses, onClose }: ExportModalProps) {
  const [step, setStep] = useState<Step>("configure");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [filename, setFilename] = useState("expenses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(CATEGORIES)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (!selectedCategories.has(e.category)) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo, selectedCategories]);

  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function toggleAllCategories() {
    if (selectedCategories.size === CATEGORIES.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(CATEGORIES));
    }
  }

  async function handleExport() {
    if (filtered.length === 0) return;
    setIsExporting(true);
    try {
      // Slight delay so loading state is visible
      await new Promise((r) => setTimeout(r, 400));
      const name = filename.trim() || "expenses";
      if (format === "csv") exportToCSV(filtered, name);
      else if (format === "json") exportToJSON(filtered, name);
      else await exportToPDF(filtered, name);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } finally {
      setIsExporting(false);
    }
  }

  const previewRows = filtered.slice(0, 8);
  const hasMore = filtered.length > 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm">
              ⬇
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Export Data</h2>
              <p className="text-xs text-gray-500">{expenses.length} total expenses available</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {(["configure", "preview"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  {i > 0 && <div className="w-6 h-px bg-gray-200" />}
                  <button
                    onClick={() => s === "preview" && filtered.length > 0 ? setStep(s) : s === "configure" ? setStep(s) : undefined}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                      step === s
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-400"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>{i + 1}</span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {step === "configure" ? (
            <div className="space-y-6">
              {/* Format selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(FORMAT_META) as [ExportFormat, typeof FORMAT_META[ExportFormat]][]).map(
                    ([fmt, meta]) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                          format === fmt
                            ? meta.color + " shadow-sm"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        <span className="text-xl font-mono font-bold">{meta.icon}</span>
                        <span className="text-sm font-semibold">{meta.label}</span>
                        <span className="text-[11px] leading-tight opacity-70">{meta.desc}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Filename */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filename
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    placeholder="expenses"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors font-mono"
                  />
                  <span className="text-sm text-gray-400 font-mono">.{format}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Only letters, numbers, hyphens and underscores
                </p>
              </div>

              {/* Date range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      max={dateTo || formatDateInput(new Date())}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom}
                      max={formatDateInput(new Date())}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="mt-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Clear dates
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Categories</label>
                  <button
                    onClick={toggleAllCategories}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    {selectedCategories.size === CATEGORIES.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategories.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          active
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <span>{CATEGORY_ICONS[cat]}</span>
                        <span className="font-medium">{cat}</span>
                        {active && (
                          <svg className="w-3.5 h-3.5 ml-auto text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Preview step */
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Showing first {Math.min(8, filtered.length)} of{" "}
                <span className="font-semibold text-gray-900">{filtered.length}</span> records that will be exported.
              </p>

              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm">No expenses match your filters</p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {previewRows.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(e.date)}</td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1 text-gray-700">
                              {CATEGORY_ICONS[e.category]} {e.category}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 max-w-[180px] truncate">{e.description}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-900">{formatCurrency(e.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    {hasMore && (
                      <tfoot>
                        <tr className="bg-gray-50 border-t border-gray-200">
                          <td colSpan={4} className="px-4 py-2 text-xs text-gray-400 text-center">
                            +{filtered.length - 8} more rows not shown
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          {/* Summary bar */}
          <div className="flex items-center gap-4 mb-4 px-4 py-3 bg-gray-50 rounded-xl text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Records:</span>
              <span className="font-semibold text-gray-900">{filtered.length}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Total:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(filteredTotal)}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Format:</span>
              <span className="font-semibold text-gray-900 uppercase">{format}</span>
            </div>
            {exported && (
              <span className="ml-auto text-xs text-emerald-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Downloaded!
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {step === "preview" && (
                <button
                  onClick={() => setStep("configure")}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="flex gap-2">
              {step === "configure" && (
                <button
                  onClick={() => setStep("preview")}
                  disabled={filtered.length === 0}
                  className="px-4 py-2 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Preview →
                </button>
              )}
              <button
                onClick={handleExport}
                disabled={isExporting || filtered.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[130px] justify-center"
              >
                {isExporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Exporting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export {format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FilterState, CATEGORIES, Category } from "@/types";

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onExport: () => void;
  onAdd: () => void;
  resultCount: number;
}

export default function FilterBar({
  filters,
  onChange,
  onExport,
  onAdd,
  resultCount,
}: FilterBarProps) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleSort(col: FilterState["sortBy"]) {
    if (filters.sortBy === col) {
      set("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
    } else {
      onChange({ ...filters, sortBy: col, sortOrder: "desc" });
    }
  }

  const sortIcon = (col: FilterState["sortBy"]) => {
    if (filters.sortBy !== col) return <span className="text-gray-300">↕</span>;
    return filters.sortOrder === "asc" ? (
      <span className="text-indigo-600">↑</span>
    ) : (
      <span className="text-indigo-600">↓</span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search expenses…"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => set("category", e.target.value as Category | "All")}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 bg-white transition-colors"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Add & Export */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-gray-500 shrink-0">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set("dateFrom", e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
          <label className="text-xs text-gray-500 shrink-0">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set("dateTo", e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
          {(filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => onChange({ ...filters, dateFrom: "", dateTo: "" })}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">Sort:</span>
          {(["date", "amount", "category"] as FilterState["sortBy"][]).map(
            (col) => (
              <button
                key={col}
                onClick={() => toggleSort(col)}
                className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                  filters.sortBy === col
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {col.charAt(0).toUpperCase() + col.slice(1)} {sortIcon(col)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400">
        Showing {resultCount} {resultCount === 1 ? "expense" : "expenses"}
      </p>
    </div>
  );
}

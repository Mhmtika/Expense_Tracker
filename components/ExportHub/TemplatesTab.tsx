"use client";

import { useState } from "react";
import { Expense, Category } from "@/types";
import {
  EXPORT_TEMPLATES,
  ExportTemplate,
  getDateRangeForTemplate,
  addHistoryRecord,
  TAG_COLORS,
  FORMAT_BADGES,
  DATE_RANGE_LABELS,
} from "@/lib/cloudExport";
import { exportToCSV, exportToJSON, exportToPDF } from "@/lib/export";

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function TemplatesTab({ expenses }: { expenses: Expense[] }) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  function getFiltered(template: ExportTemplate): Expense[] {
    const { from, to } = getDateRangeForTemplate(template);
    return expenses.filter((e) => {
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      if (template.categories !== "all" && !(template.categories as Category[]).includes(e.category)) return false;
      return true;
    });
  }

  async function handleExport(template: ExportTemplate) {
    const filtered = getFiltered(template);
    if (!filtered.length) return;
    setExporting(template.id);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const filename = `${template.id}-${new Date().toISOString().slice(0, 10)}`;
      if (template.format === "csv") exportToCSV(filtered, filename);
      else if (template.format === "json") exportToJSON(filtered, filename);
      else await exportToPDF(filtered, filename);
      addHistoryRecord({
        templateName: template.name,
        destination: "Download",
        format: template.format,
        recordCount: filtered.length,
        status: "success",
        filename: `${filename}.${template.format}`,
      });
      setExported(template.id);
      setTimeout(() => setExported(null), 2500);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Export Templates</h3>
        <p className="text-sm text-gray-500 mt-1">
          Pre-configured reports for common use cases — one click to export.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORT_TEMPLATES.map((template) => {
          const filtered = getFiltered(template);
          const isExporting = exporting === template.id;
          const isExported = exported === template.id;
          const isEmpty = filtered.length === 0;

          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{template.icon}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[template.tag] ?? "bg-gray-100 text-gray-600"}`}>
                  {template.tag}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed flex-1">{template.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded border uppercase ${FORMAT_BADGES[template.format]}`}>
                  {template.format}
                </span>
                <span className="text-xs text-gray-400">{DATE_RANGE_LABELS[template.dateRange]}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className={`text-xs font-medium ${isEmpty ? "text-gray-300" : "text-gray-500"}`}>
                  {filtered.length} records
                </span>
              </div>

              <button
                onClick={() => handleExport(template)}
                disabled={isExporting || isEmpty}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  isExported
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isEmpty
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                    : "bg-slate-900 text-white hover:bg-indigo-600 group-hover:bg-indigo-600"
                }`}
              >
                {isExporting ? (
                  <><Spinner /> Exporting…</>
                ) : isExported ? (
                  <>✓ Downloaded!</>
                ) : isEmpty ? (
                  "No data for this period"
                ) : (
                  `Export ${template.format.toUpperCase()}`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

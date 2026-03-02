"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/types";
import TemplatesTab from "./TemplatesTab";
import IntegrationsTab from "./IntegrationsTab";
import ScheduleTab from "./ScheduleTab";
import HistoryTab from "./HistoryTab";
import ShareTab from "./ShareTab";
import { loadIntegrations } from "@/lib/cloudExport";

type Tab = "templates" | "integrations" | "schedule" | "history" | "share";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "templates", label: "Templates", icon: "⚡" },
  { id: "integrations", label: "Integrations", icon: "🔌" },
  { id: "schedule", label: "Schedule", icon: "🕐" },
  { id: "history", label: "History", icon: "📋" },
  { id: "share", label: "Share", icon: "🔗" },
];

export default function ExportHub({
  expenses,
  onClose,
}: {
  expenses: Expense[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("templates");
  const [connectedCount, setConnectedCount] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const integrations = loadIntegrations();
    setConnectedCount(Object.values(integrations).filter((i) => i.connected).length);
  }, [tab]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-5xl sm:max-h-[88vh] h-[92vh] sm:h-[88vh] flex flex-col bg-white sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              ☁
            </div>
            <div>
              <h2 className="text-white text-sm font-semibold leading-none">Export Hub</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {expenses.length} expenses · {connectedCount} integration{connectedCount !== 1 ? "s" : ""} active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-44 bg-slate-900 border-r border-slate-800 flex flex-col gap-0.5 py-3 px-2 shrink-0">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full ${
                  tab === item.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            ))}

            {/* Bottom status */}
            <div className="mt-auto pt-6 px-3 pb-2 space-y-2">
              {connectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-500">
                    {connectedCount} connected
                  </span>
                </div>
              )}
              <div className="text-xs text-slate-700">ExpenseAI v3</div>
            </div>
          </nav>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {tab === "templates" && <TemplatesTab expenses={expenses} />}
            {tab === "integrations" && <IntegrationsTab expenses={expenses} />}
            {tab === "schedule" && <ScheduleTab />}
            {tab === "history" && <HistoryTab />}
            {tab === "share" && <ShareTab expenses={expenses} />}
          </div>
        </div>
      </div>
    </div>
  );
}

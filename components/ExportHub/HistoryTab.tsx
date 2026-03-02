"use client";

import { useState, useEffect } from "react";
import { ExportHistoryRecord, loadHistory, timeAgo, FORMAT_BADGES } from "@/lib/cloudExport";

const DESTINATION_ICONS: Record<string, string> = {
  Download: "⬇",
  "Google Sheets": "📊",
  Dropbox: "📦",
  OneDrive: "☁️",
  Notion: "📝",
  Slack: "💬",
  "Full Sync": "↻",
};

export default function HistoryTab() {
  const [history, setHistory] = useState<ExportHistoryRecord[]>([]);

  useEffect(() => { setHistory(loadHistory()); }, []);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Export History</h3>
          <p className="text-sm text-gray-500 mt-1">A complete log of all past exports and syncs.</p>
        </div>
        {history.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {history.length} records
          </span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-14">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium text-gray-500 mb-1">No exports yet</p>
          <p className="text-xs text-gray-400">
            Export from the Templates or Integrations tabs to see history here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-4 hover:border-gray-200 transition-colors"
            >
              {/* Status dot */}
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  record.status === "success"
                    ? "bg-emerald-400"
                    : record.status === "pending"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-red-400"
                }`}
              />

              {/* Destination icon */}
              <span className="text-lg shrink-0">
                {DESTINATION_ICONS[record.destination] ?? "📤"}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {record.templateName}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase border ${
                      FORMAT_BADGES[record.format] ?? "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {record.format}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{record.destination}</span>
                  <span>·</span>
                  <span>{record.recordCount} records</span>
                  <span>·</span>
                  <span className="font-mono truncate max-w-[140px]">{record.filename}</span>
                </div>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 shrink-0">{timeAgo(record.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

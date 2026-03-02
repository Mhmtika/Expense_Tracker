"use client";

import { useState, useEffect } from "react";
import {
  ScheduledExport,
  Frequency,
  Destination,
  loadSchedules,
  saveSchedules,
  getNextRun,
  EXPORT_TEMPLATES,
  FREQUENCY_LABELS,
  DESTINATION_LABELS,
} from "@/lib/cloudExport";

export default function ScheduleTab() {
  const [schedules, setSchedules] = useState<ScheduledExport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    frequency: "weekly" as Frequency,
    time: "09:00",
    destination: "download" as Destination,
    templateId: "monthly-summary",
  });

  useEffect(() => { setSchedules(loadSchedules()); }, []);

  function handleAdd() {
    const schedule: ScheduledExport = {
      id: String(Date.now()),
      enabled: true,
      templateId: form.templateId,
      frequency: form.frequency,
      time: form.time,
      destination: form.destination,
      nextRun: getNextRun(form.frequency, form.time),
    };
    const updated = [...schedules, schedule];
    setSchedules(updated);
    saveSchedules(updated);
    setShowForm(false);
  }

  function toggleSchedule(id: string) {
    const updated = schedules.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSchedules(updated);
    saveSchedules(updated);
  }

  function deleteSchedule(id: string) {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Exports</h3>
          <p className="text-sm text-gray-500 mt-1">
            Automate your expense reports on a recurring schedule.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Schedule
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-indigo-200 p-5 mb-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Configure Schedule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Template</label>
              <select
                value={form.templateId}
                onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500"
              >
                {EXPORT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Frequency</label>
              <div className="flex gap-2">
                {(["daily", "weekly", "monthly"] as Frequency[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setForm((prev) => ({ ...prev, frequency: f }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      form.frequency === f
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {FREQUENCY_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Destination</label>
              <select
                value={form.destination}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value as Destination }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500"
              >
                {(Object.entries(DESTINATION_LABELS) as [Destination, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <div className="text-4xl mb-3">🕐</div>
          <p className="text-sm font-medium text-gray-500 mb-1">No schedules yet</p>
          <p className="text-xs">Create your first automated export above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const template = EXPORT_TEMPLATES.find((t) => t.id === schedule.templateId);
            return (
              <div
                key={schedule.id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${
                  schedule.enabled ? "border-gray-200" : "border-gray-100 opacity-60"
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleSchedule(schedule.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    schedule.enabled ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      schedule.enabled ? "translate-x-[18px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span>{template?.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{template?.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {FREQUENCY_LABELS[schedule.frequency]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>at {schedule.time}</span>
                    <span>→ {DESTINATION_LABELS[schedule.destination]}</span>
                    {schedule.enabled && (
                      <span className="text-emerald-600 font-medium">
                        Next: {new Date(schedule.nextRun).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

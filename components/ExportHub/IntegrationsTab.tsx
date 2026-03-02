"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/types";
import {
  IntegrationId,
  IntegrationStatus,
  loadIntegrations,
  saveIntegrations,
  addHistoryRecord,
} from "@/lib/cloudExport";
import { exportToCSV } from "@/lib/export";

interface IntegrationDef {
  id: IntegrationId;
  name: string;
  description: string;
  icon: string;
  features: string[];
  comingSoon?: boolean;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Sync expenses directly to a Google Sheets spreadsheet with auto-refresh.",
    icon: "📊",
    features: ["Auto-sync", "Real-time updates", "Custom formulas"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Automatically back up expense files to your Dropbox folder.",
    icon: "📦",
    features: ["Automatic backup", "Version history", "File sharing"],
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    description: "Save and sync reports to Microsoft OneDrive.",
    icon: "☁️",
    features: ["Office integration", "Auto-sync", "Collaboration"],
    comingSoon: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Export expenses as a Notion database with custom views.",
    icon: "📝",
    features: ["Database sync", "Custom views", "Team sharing"],
    comingSoon: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send automatic expense summaries to your Slack channels.",
    icon: "💬",
    features: ["Weekly summaries", "Alert thresholds", "Team updates"],
    comingSoon: true,
  },
];

const MOCK_ACCOUNTS: Record<IntegrationId, string> = {
  "google-sheets": "you@gmail.com",
  dropbox: "you@dropbox.com",
  onedrive: "you@outlook.com",
  notion: "you@notion.so",
  slack: "#finance-team",
};

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function IntegrationsTab({ expenses }: { expenses: Expense[] }) {
  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => { setIntegrations(loadIntegrations()); }, []);

  async function handleConnect(id: IntegrationId) {
    setConnecting(id);
    await new Promise((r) => setTimeout(r, 1800));
    const updated = {
      ...integrations,
      [id]: { connected: true, accountName: MOCK_ACCOUNTS[id], lastSync: new Date().toISOString() },
    };
    setIntegrations(updated);
    saveIntegrations(updated as Record<IntegrationId, IntegrationStatus>);
    setConnecting(null);
  }

  function handleDisconnect(id: IntegrationId) {
    const updated = { ...integrations, [id]: { connected: false } };
    setIntegrations(updated);
    saveIntegrations(updated as Record<IntegrationId, IntegrationStatus>);
  }

  async function handleSync(id: IntegrationId) {
    setSyncing(id);
    await new Promise((r) => setTimeout(r, 1200));
    const filename = `sync-${id}-${new Date().toISOString().slice(0, 10)}`;
    exportToCSV(expenses, filename);
    addHistoryRecord({
      templateName: "Full Sync",
      destination: INTEGRATIONS.find((i) => i.id === id)?.name ?? id,
      format: "csv",
      recordCount: expenses.length,
      status: "success",
      filename: `${filename}.csv`,
    });
    const updated = { ...integrations, [id]: { ...integrations[id], lastSync: new Date().toISOString() } };
    setIntegrations(updated);
    saveIntegrations(updated as Record<IntegrationId, IntegrationStatus>);
    setSyncing(null);
  }

  const connectedCount = Object.values(integrations).filter((i) => i.connected).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
        <p className="text-sm text-gray-500 mt-1">
          Connect your tools to automatically sync and share expense data.
        </p>
      </div>

      {connectedCount > 0 && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-sm text-emerald-700 font-medium">
            {connectedCount} integration{connectedCount > 1 ? "s" : ""} active
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration) => {
          const status = integrations[integration.id];
          const isConnected = !!status?.connected;
          const isConnecting = connecting === integration.id;
          const isSyncing = syncing === integration.id;

          return (
            <div
              key={integration.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                isConnected ? "border-emerald-200 shadow-sm" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{integration.name}</h4>
                      {integration.comingSoon && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">Soon</span>
                      )}
                    </div>
                    {isConnected && status.accountName && (
                      <p className="text-xs text-emerald-600 font-medium">{status.accountName}</p>
                    )}
                  </div>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-600 font-medium">Connected</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-3 leading-relaxed">{integration.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {integration.features.map((f) => (
                  <span key={f} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                    {f}
                  </span>
                ))}
              </div>

              {isConnected ? (
                <div className="space-y-2">
                  {status.lastSync && (
                    <p className="text-xs text-gray-400">
                      Last sync: {new Date(status.lastSync).toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={isSyncing}
                      className="flex-1 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 text-xs font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isSyncing ? <><Spinner /> Syncing…</> : "↻ Sync Now"}
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => !integration.comingSoon && handleConnect(integration.id)}
                  disabled={isConnecting || !!integration.comingSoon}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    integration.comingSoon
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100"
                      : "bg-slate-900 text-white hover:bg-indigo-600"
                  }`}
                >
                  {isConnecting ? <><Spinner /> Connecting…</> : integration.comingSoon ? "Coming Soon" : "Connect"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

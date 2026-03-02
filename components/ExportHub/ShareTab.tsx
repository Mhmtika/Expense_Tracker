"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/types";
import { formatCurrency } from "@/lib/formatting";

type Expiry = "24h" | "7d" | "30d" | "never";

const EXPIRY_LABELS: Record<Expiry, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  never: "Never",
};

function generateToken(): string {
  return Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9);
}

export default function ShareTab({ expenses }: { expenses: Expense[] }) {
  const [token] = useState(generateToken);
  const [expiry, setExpiry] = useState<Expiry>("7d");
  const [viewOnly, setViewOnly] = useState(true);
  const [allowDownload, setAllowDownload] = useState(false);
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [linkGenerated, setLinkGenerated] = useState(false);

  const shareUrl = `https://expenseai.io/share/${token}`;
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  useEffect(() => {
    import("qrcode").then((QRCode) => {
      QRCode.default
        .toDataURL(shareUrl, {
          width: 180,
          margin: 2,
          color: { dark: "#312e81", light: "#ffffff" },
        })
        .then(setQrCode);
    });
  }, [shareUrl]);

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setLinkGenerated(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const toggles = [
    {
      label: "View only",
      desc: "Recipients can view but not edit",
      value: viewOnly,
      set: setViewOnly,
    },
    {
      label: "Allow download",
      desc: "Recipients can download the data",
      value: allowDownload,
      set: setAllowDownload,
    },
    {
      label: "Password protect",
      desc: "Require a password to access",
      value: passwordProtect,
      set: setPasswordProtect,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Share & Collaborate</h3>
        <p className="text-sm text-gray-500 mt-1">
          Generate a shareable snapshot link for your expense data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Share URL */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="text-xs font-semibold text-gray-600 block mb-2">Share Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  copied
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-900 text-white hover:bg-indigo-600"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
            {linkGenerated && (
              <p className="mt-2 text-xs text-indigo-600 flex items-center gap-1">
                <span>✓</span> Link generated — share it with anyone
              </p>
            )}
          </div>

          {/* Expiry */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="text-xs font-semibold text-gray-600 block mb-3">Link Expiry</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(EXPIRY_LABELS) as [Expiry, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setExpiry(key)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                    expiry === key
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Permission toggles */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <label className="text-xs font-semibold text-gray-600 block">Permissions</label>
            {toggles.map((opt) => (
              <div key={opt.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
                <button
                  onClick={() => opt.set(!opt.value)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    opt.value ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      opt.value ? "translate-x-[18px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Quick share */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="text-xs font-semibold text-gray-600 block mb-3">Quick Share</label>
            <div className="flex gap-2">
              {["📧 Email", "💬 Slack", "📱 WhatsApp", "🔗 Teams"].map((s) => (
                <button
                  key={s}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: QR + summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-600 mb-4 self-start">QR Code</p>
            {qrCode ? (
              <img src={qrCode} alt="Share QR Code" className="w-[160px] h-[160px] rounded-xl" />
            ) : (
              <div className="w-[160px] h-[160px] bg-gray-100 rounded-xl animate-pulse" />
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">Scan to open on mobile</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-600 mb-3">Snapshot Summary</p>
            <div className="space-y-2.5">
              {[
                { label: "Records", value: String(expenses.length) },
                { label: "Total value", value: formatCurrency(total) },
                { label: "Expires", value: EXPIRY_LABELS[expiry] },
                { label: "Access", value: viewOnly ? "View only" : "Full access" },
                { label: "Download", value: allowDownload ? "Allowed" : "Disabled" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <p className="text-xs text-gray-500">Snapshot ready to share</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

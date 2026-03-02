import { Category } from "@/types";
import { formatDateInput } from "./formatting";

export type ExportFormat = "csv" | "json" | "pdf";
export type Frequency = "daily" | "weekly" | "monthly";
export type Destination =
  | "download"
  | "email"
  | "google-sheets"
  | "dropbox"
  | "onedrive"
  | "notion";
export type IntegrationId =
  | "google-sheets"
  | "dropbox"
  | "onedrive"
  | "notion"
  | "slack";

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  format: ExportFormat;
  dateRange: "all" | "current-month" | "last-month" | "last-3-months" | "current-year";
  categories: Category[] | "all";
  tag: string;
}

export interface ExportHistoryRecord {
  id: string;
  timestamp: string;
  templateName: string;
  destination: string;
  format: ExportFormat;
  recordCount: number;
  status: "success" | "pending" | "failed";
  filename: string;
}

export interface ScheduledExport {
  id: string;
  enabled: boolean;
  templateId: string;
  frequency: Frequency;
  time: string;
  destination: Destination;
  nextRun: string;
  lastRun?: string;
}

export interface IntegrationStatus {
  connected: boolean;
  accountName?: string;
  lastSync?: string;
}

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "tax-report",
    name: "Tax Report",
    description: "Annual expense breakdown for tax filing. Includes all categories.",
    icon: "🧾",
    format: "pdf",
    dateRange: "current-year",
    categories: "all",
    tag: "Tax",
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "This month's expenses with category totals.",
    icon: "📅",
    format: "csv",
    dateRange: "current-month",
    categories: "all",
    tag: "Popular",
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "Detailed breakdown by spending category over 3 months.",
    icon: "🏷️",
    format: "json",
    dateRange: "last-3-months",
    categories: "all",
    tag: "Analysis",
  },
  {
    id: "annual-review",
    name: "Annual Review",
    description: "Full year overview for financial planning and budgeting.",
    icon: "📊",
    format: "pdf",
    dateRange: "current-year",
    categories: "all",
    tag: "Finance",
  },
  {
    id: "budget-overview",
    name: "Budget Overview",
    description: "Essential spending: food, bills and transport for last 3 months.",
    icon: "💰",
    format: "csv",
    dateRange: "last-3-months",
    categories: ["Food", "Bills", "Transportation"],
    tag: "Budget",
  },
  {
    id: "spending-insights",
    name: "Spending Insights",
    description: "Entertainment and shopping deep-dive for lifestyle analysis.",
    icon: "🔍",
    format: "json",
    dateRange: "last-3-months",
    categories: ["Entertainment", "Shopping"],
    tag: "Insights",
  },
];

export const TAG_COLORS: Record<string, string> = {
  Tax: "bg-amber-100 text-amber-700",
  Popular: "bg-indigo-100 text-indigo-700",
  Analysis: "bg-blue-100 text-blue-700",
  Finance: "bg-emerald-100 text-emerald-700",
  Budget: "bg-rose-100 text-rose-700",
  Insights: "bg-purple-100 text-purple-700",
};

export const FORMAT_BADGES: Record<ExportFormat, string> = {
  csv: "bg-emerald-50 text-emerald-700 border-emerald-200",
  json: "bg-blue-50 text-blue-700 border-blue-200",
  pdf: "bg-rose-50 text-rose-700 border-rose-200",
};

export const DATE_RANGE_LABELS: Record<string, string> = {
  all: "All time",
  "current-month": "This month",
  "last-month": "Last month",
  "last-3-months": "Last 3 months",
  "current-year": "This year",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const DESTINATION_LABELS: Record<Destination, string> = {
  download: "Download",
  email: "Email",
  "google-sheets": "Google Sheets",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
  notion: "Notion",
};

// ── Storage helpers ─────────────────────────────────────────────────────────

const HISTORY_KEY = "export-hub-history";
const INTEGRATIONS_KEY = "export-hub-integrations";
const SCHEDULES_KEY = "export-hub-schedules";

export function loadHistory(): ExportHistoryRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

export function addHistoryRecord(
  record: Omit<ExportHistoryRecord, "id" | "timestamp">
): ExportHistoryRecord {
  const records = loadHistory();
  const newRecord: ExportHistoryRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([newRecord, ...records].slice(0, 50)));
  return newRecord;
}

export function loadIntegrations(): Record<IntegrationId, IntegrationStatus> {
  if (typeof window === "undefined") return {} as Record<IntegrationId, IntegrationStatus>;
  try { return JSON.parse(localStorage.getItem(INTEGRATIONS_KEY) || "{}"); }
  catch { return {} as Record<IntegrationId, IntegrationStatus>; }
}

export function saveIntegrations(data: Record<IntegrationId, IntegrationStatus>): void {
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(data));
}

export function loadSchedules(): ScheduledExport[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SCHEDULES_KEY) || "[]"); }
  catch { return []; }
}

export function saveSchedules(schedules: ScheduledExport[]): void {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

// ── Utilities ────────────────────────────────────────────────────────────────

export function getNextRun(frequency: Frequency, time: string): string {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) {
    if (frequency === "daily") next.setDate(next.getDate() + 1);
    else if (frequency === "weekly") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

export function getDateRangeForTemplate(
  template: ExportTemplate
): { from: string; to: string } {
  const now = new Date();
  const today = formatDateInput(now);
  switch (template.dateRange) {
    case "current-month": return {
      from: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
    case "last-month": return {
      from: formatDateInput(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
    case "last-3-months": return {
      from: formatDateInput(new Date(now.getFullYear(), now.getMonth() - 3, 1)),
      to: today,
    };
    case "current-year": return {
      from: formatDateInput(new Date(now.getFullYear(), 0, 1)),
      to: today,
    };
    default: return { from: "", to: "" };
  }
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(isoString).toLocaleDateString();
}

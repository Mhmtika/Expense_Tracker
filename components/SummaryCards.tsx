"use client";

import { formatCurrency } from "@/lib/formatting";
import { CATEGORY_ICONS } from "@/types";

interface Stats {
  totalSpending: number;
  monthlySpending: number;
  spendingByCategory: Record<string, number>;
  topCategory: string;
  count: number;
  monthlyCount: number;
}

export default function SummaryCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Total Spending",
      value: formatCurrency(stats.totalSpending),
      sub: `${stats.count} transactions`,
      icon: "💰",
      color: "bg-indigo-50 text-indigo-700",
      border: "border-indigo-100",
    },
    {
      label: "This Month",
      value: formatCurrency(stats.monthlySpending),
      sub: `${stats.monthlyCount} transactions`,
      icon: "📅",
      color: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-100",
    },
    {
      label: "Top Category",
      value:
        stats.topCategory === "—"
          ? "—"
          : `${CATEGORY_ICONS[stats.topCategory as keyof typeof CATEGORY_ICONS] ?? ""} ${stats.topCategory}`,
      sub:
        stats.topCategory !== "—"
          ? formatCurrency(stats.spendingByCategory[stats.topCategory] ?? 0)
          : "No data yet",
      icon: "🏆",
      color: "bg-amber-50 text-amber-700",
      border: "border-amber-100",
    },
    {
      label: "Avg per Transaction",
      value:
        stats.count > 0
          ? formatCurrency(stats.totalSpending / stats.count)
          : "$0.00",
      sub: `Across all time`,
      icon: "📊",
      color: "bg-rose-50 text-rose-700",
      border: "border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm`}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{card.icon}</span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${card.color}`}
            >
              {card.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
          <p className="text-sm text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

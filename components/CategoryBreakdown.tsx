"use client";

import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/types";
import { formatCurrency } from "@/lib/formatting";

interface Props {
  spendingByCategory: Record<string, number>;
  total: number;
}

export default function CategoryBreakdown({ spendingByCategory, total }: Props) {
  const sorted = Object.entries(spendingByCategory).sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Breakdown</h3>
        <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Breakdown</h3>
      <div className="space-y-3">
        {sorted.map(([category, amount]) => {
          const pct = total > 0 ? (amount / total) * 100 : 0;
          const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? "#6b7280";
          const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] ?? "📦";

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

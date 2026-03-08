"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency, formatDateInput } from "@/lib/formatting";
import { Category } from "@/types";

const CATEGORY_META: Record<Category, { color: string; emoji: string }> = {
  Food:           { color: "#f87171", emoji: "🍔" },
  Transportation: { color: "#2dd4bf", emoji: "🚗" },
  Entertainment:  { color: "#60a5fa", emoji: "🎬" },
  Shopping:       { color: "#fbbf24", emoji: "🛍️" },
  Bills:          { color: "#a78bfa", emoji: "📄" },
  Other:          { color: "#9ca3af", emoji: "📦" },
};

function useBudgetStreak(expenses: ReturnType<typeof useExpenses>["expenses"]) {
  return useMemo(() => {
    if (!expenses.length) return 0;

    // Daily totals
    const byDate: Record<string, number> = {};
    expenses.forEach((e) => {
      byDate[e.date] = (byDate[e.date] || 0) + e.amount;
    });

    // Average daily spend (days that have spending)
    const totals = Object.values(byDate);
    const avg = totals.reduce((s, v) => s + v, 0) / totals.length;

    // Count consecutive days back from today that are under average
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const key = formatDateInput(cursor);
      if (key in byDate) {
        if (byDate[key] <= avg) streak++;
        else break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [expenses]);
}

export default function MonthlyInsights() {
  const { expenses } = useExpenses();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  const donutData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [monthlyExpenses]);

  const top3 = useMemo(
    () => [...donutData].sort((a, b) => b.value - a.value).slice(0, 3),
    [donutData]
  );

  const streak = useBudgetStreak(expenses);
  const hasData = donutData.length > 0;

  return (
    <div className="max-w-sm mx-auto">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 px-8 py-8">

        {/* Title */}
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-black text-gray-900 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Monthly Insights
          </h1>
          {/* Sketchy underline */}
          <div className="flex justify-center mt-1">
            <svg viewBox="0 0 260 12" className="w-64 h-3" fill="none">
              <path
                d="M2 6 Q20 2 38 6 Q56 10 74 6 Q92 2 110 6 Q128 10 146 6 Q164 2 182 6 Q200 10 218 6 Q236 2 258 6"
                stroke="#374151"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="4 2"
              />
            </svg>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="relative flex justify-center mb-6">
          {hasData ? (
            <div className="relative w-52 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {donutData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_META[entry.name as Category]?.color ?? "#9ca3af"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => formatCurrency(typeof v === "number" ? v : 0)}
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white border-2 border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                  <span className="text-sm font-semibold text-gray-700">Spending</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-52 h-52 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
              <span className="text-sm text-gray-400">No data</span>
            </div>
          )}
        </div>

        {/* Top 3 Categories */}
        <div className="mb-6">
          <div className="space-y-3">
            {top3.length > 0 ? (
              top3.map((item) => {
                const meta = CATEGORY_META[item.name as Category];
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    {/* Colored left bar */}
                    <div
                      className="w-1 h-7 rounded-full shrink-0"
                      style={{ backgroundColor: meta?.color ?? "#9ca3af" }}
                    />
                    <span className="text-base">
                      {meta?.emoji}{" "}
                      <span className="font-semibold text-gray-800">
                        {item.name}:
                      </span>{" "}
                      <span className="text-gray-700">{formatCurrency(item.value)}</span>
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 text-center">No expenses this month</p>
            )}
          </div>
          {top3.length > 0 && (
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400 italic">Top 3!</span>
            </div>
          )}
        </div>

        {/* Budget Streak Box */}
        <div
          className="rounded-2xl px-6 py-5 text-center"
          style={{
            border: "2.5px dashed #9ca3af",
            backgroundColor: "#fafafa",
          }}
        >
          <p className="text-base font-semibold text-gray-700 mb-2">Budget Streak</p>
          <div className="flex items-center justify-center gap-4">
            <span
              className="text-6xl font-black leading-none"
              style={{ color: "#22c55e" }}
            >
              {streak}
            </span>
            {/* Toggle pill (decorative — sketched as hatched/inactive) */}
            <div
              className="w-14 h-7 rounded-full relative overflow-hidden shrink-0"
              style={{ border: "2px solid #d1d5db", backgroundColor: "#f3f4f6" }}
            >
              {/* Hatched pattern */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#d1d5db" strokeWidth="2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hatch)" />
              </svg>
            </div>
          </div>
          <p className="text-base font-semibold text-gray-600 mt-2">days!</p>
        </div>
      </div>
    </div>
  );
}

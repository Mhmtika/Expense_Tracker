"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { CATEGORY_COLORS } from "@/types";
import { formatCurrency } from "@/lib/formatting";

interface DailyData {
  date: string;
  amount: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface SpendingChartProps {
  dailySpending: DailyData[];
  categoryBreakdown: CategoryData[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-semibold text-gray-900">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function SpendingChart({
  dailySpending,
  categoryBreakdown,
}: SpendingChartProps) {
  const hasData = categoryBreakdown.length > 0;

  // Show every 5th label to avoid crowding
  const tickFormatter = (value: string, index: number) =>
    index % 5 === 0 ? value : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Daily Bar Chart */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Daily Spending — Last 30 Days
        </h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailySpending} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
            No expense data yet
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          By Category
        </h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryBreakdown.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ??
                      "#6b7280"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) =>
                  formatCurrency(typeof value === "number" ? value : parseFloat(String(value ?? 0)))
                }
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
            No expense data yet
          </div>
        )}
      </div>
    </div>
  );
}

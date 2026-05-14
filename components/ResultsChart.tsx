"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { YearResult, formatCurrency } from "@/lib/calculator";

interface Props {
  results: YearResult[];
  breakEvenYear: number | null;
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const buy = Number(payload.find((p) => p.dataKey === "buyingNetWorth")?.value ?? 0);
  const rent = Number(payload.find((p) => p.dataKey === "rentingNetWorth")?.value ?? 0);
  const diff = buy - rent;
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs shadow-md">
      <div className="font-medium mb-1">Year {label}</div>
      <div className="flex justify-between gap-4">
        <span className="text-emerald-600">Buying</span>
        <span>{formatCurrency(buy)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-sky-600">Renting</span>
        <span>{formatCurrency(rent)}</span>
      </div>
      <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-zinc-200 dark:border-zinc-700">
        <span className="text-zinc-500">Difference</span>
        <span className={diff >= 0 ? "text-emerald-600" : "text-sky-600"}>
          {diff >= 0 ? "+" : ""}
          {formatCurrency(diff)}
        </span>
      </div>
    </div>
  );
}

export function ResultsChart({ results, breakEvenYear }: Props) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={results} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
          <XAxis
            dataKey="year"
            label={{ value: "Year", position: "insideBottom", offset: -4, fontSize: 12 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v) =>
              v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}k`
            }
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {breakEvenYear !== null && (
            <ReferenceLine
              x={breakEvenYear}
              stroke="#a1a1aa"
              strokeDasharray="4 4"
              label={{ value: `Break-even: yr ${breakEvenYear}`, position: "top", fontSize: 11, fill: "#71717a" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="buyingNetWorth"
            name="Buying"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="rentingNetWorth"
            name="Renting"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

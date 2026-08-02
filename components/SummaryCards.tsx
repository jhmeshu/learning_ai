"use client";

import { Stats } from "@/lib/types";
import { fmt } from "@/lib/utils";

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const up = current >= previous;
  return (
    <div className={`stat-delta ${up ? "up" : "down"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}% vs last month
    </div>
  );
}

export default function SummaryCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-4">
      <div className="card">
        <div className="stat-label">Balance (all time)</div>
        <div className="stat-value" style={{ color: stats.balance >= 0 ? "var(--green)" : "var(--red)" }}>
          {fmt(stats.balance)}
        </div>
      </div>
      <div className="card">
        <div className="stat-label">Income this month</div>
        <div className="stat-value" style={{ color: "var(--green)" }}>
          {fmt(stats.monthIncome)}
        </div>
        <Delta current={stats.monthIncome} previous={stats.prevMonthIncome} />
      </div>
      <div className="card">
        <div className="stat-label">Expenses this month</div>
        <div className="stat-value" style={{ color: "var(--red)" }}>
          {fmt(stats.monthExpense)}
        </div>
        <Delta current={stats.monthExpense} previous={stats.prevMonthExpense} />
      </div>
      <div className="card">
        <div className="stat-label">Net this month</div>
        <div className="stat-value" style={{ color: stats.monthNet >= 0 ? "var(--green)" : "var(--red)" }}>
          {fmt(stats.monthNet)}
        </div>
      </div>
    </div>
  );
}

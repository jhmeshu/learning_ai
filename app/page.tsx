"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SummaryCards from "@/components/SummaryCards";
import TransactionTable from "@/components/TransactionTable";
import { Category, Stats, Transaction } from "@/lib/types";
import { fmt, monthLabel, thisMonthKey } from "@/lib/utils";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <div style={{ fontWeight: 600 }}>{monthLabel(String(label))}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([s, t, c]) => {
      setStats(s);
      setTransactions(t);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const monthSpend = useMemo(() => {
    const thisKey = thisMonthKey();
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      if (t.date.slice(0, 7) !== thisKey) continue;
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
    const catById = new Map(categories.map((c) => [c.id, c]));
    return Array.from(map.entries())
      .map(([categoryId, total]) => ({
        categoryId,
        name: catById.get(categoryId)?.name || "Unknown",
        color: catById.get(categoryId)?.color || "#94a3b8",
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions, categories]);

  const totalMonthSpend = monthSpend.reduce((s, c) => s + c.total, 0);
  const recent = transactions.slice(0, 8);

  if (loading || !stats) {
    return <div className="empty">Loading…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Your money at a glance.</div>
        </div>
        <Link href="/transactions" className="btn btn-primary">
          + Add transaction
        </Link>
      </div>

      <SummaryCards stats={stats} />

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Last 6 months</h2>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySeries} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                <XAxis dataKey="month" tickFormatter={(v) => monthLabel(v).split(" ")[0]} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `$${v}`} width={60} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Top spending categories · this month</h2>
          {monthSpend.length === 0 ? (
            <div className="empty">No expenses this month yet.</div>
          ) : (
            <div className="legend">
              {monthSpend.map((c) => (
                <div key={c.categoryId} className="legend-item">
                  <span className="legend-name">
                    <span className="color-dot" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>{fmt(c.total)}</span>
                </div>
              ))}
              <div className="legend-item muted" style={{ fontSize: 13 }}>
                <span>Total</span>
                <span>{fmt(totalMonthSpend)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Recent transactions</h2>
          <Link href="/transactions" className="btn btn-sm">
            View all
          </Link>
        </div>
        <TransactionTable
          transactions={recent}
          categories={categories}
          readOnly
        />
      </div>
    </div>
  );
}

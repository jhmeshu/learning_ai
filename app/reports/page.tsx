"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Stats } from "@/lib/types";
import { fmt, monthLabel } from "@/lib/utils";

function BarTip({
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

function PieTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: { name: string; total: number } }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div style={{ fontWeight: 600 }}>{p?.name}</div>
      <div>{p ? fmt(p.total) : ""}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((s) => {
        setStats(s);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return <div className="empty">Loading…</div>;
  }

  const pieData = stats.spentByCategory.filter((c) => c.total > 0).slice(0, 8);
  const totalSpend = pieData.reduce((s, c) => s + c.total, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <div className="sub">Where your money goes.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Income vs expense · last 6 months</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlySeries} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
              <XAxis dataKey="month" tickFormatter={(v) => monthLabel(v).split(" ")[0]} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `$${v}`} width={60} />
              <Tooltip content={<BarTip />} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Spending by category · all time</h2>
          {pieData.length === 0 ? (
            <div className="empty">No expenses yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="total" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {pieData.map((c) => (
                        <Cell key={c.categoryId} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend" style={{ width: "100%", marginTop: 12 }}>
                {pieData.map((c) => (
                  <div key={c.categoryId} className="legend-item">
                    <span className="legend-name">
                      <span className="color-dot" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span>
                      {fmt(c.total)} ({((c.total / totalSpend) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Category breakdown</h2>
          {stats.spentByCategory.length === 0 ? (
            <div className="empty">No expenses yet.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.spentByCategory.map((c) => (
                    <tr key={c.categoryId}>
                      <td>
                        <span className="color-dot" style={{ background: c.color, marginRight: 6 }} />
                        {c.name}
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmt(c.total)}</td>
                      <td>
                        <div className="progress" style={{ width: 120 }}>
                          <div
                            style={{
                              width: `${Math.min(100, (c.total / totalSpend) * 100)}%`,
                              background: c.color,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

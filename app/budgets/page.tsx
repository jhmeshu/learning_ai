"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stats } from "@/lib/types";
import { fmt } from "@/lib/utils";

export default function BudgetsPage() {
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

  const totalBudget = stats.budgetUsage.reduce((s, b) => s + b.budget, 0);
  const totalSpent = stats.budgetUsage.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <div className="sub">Monthly spending limits per category.</div>
        </div>
        <Link href="/categories" className="btn">
          Manage categories
        </Link>
      </div>

      {stats.budgetUsage.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="icon">🎯</div>
            <div>
              No budgets set yet. Set monthly limits on the{" "}
              <Link href="/categories" style={{ color: "var(--accent)" }}>
                Categories
              </Link>{" "}
              page.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="budget-head">
              <strong>Overall</strong>
              <span>
                {fmt(totalSpent)} / {fmt(totalBudget)} ({overallPct.toFixed(0)}%)
              </span>
            </div>
            <div className="progress">
              <div
                style={{
                  width: `${Math.min(100, overallPct)}%`,
                  background: overallPct > 100 ? "var(--red)" : overallPct > 80 ? "var(--amber)" : "var(--green)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-2">
            {stats.budgetUsage.map((b) => {
              const over = b.spent > b.budget;
              const warn = !over && b.pct > 80;
              return (
                <div className="card" key={b.categoryId}>
                  <div className="budget-head">
                    <strong>
                      <span className="color-dot" style={{ background: b.color }} />
                      {b.name}
                    </strong>
                    <span className={over ? "danger-text" : warn ? "warning-text" : ""}>
                      {fmt(b.spent)} / {fmt(b.budget)} ({b.pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="progress">
                    <div
                      style={{
                        width: `${Math.min(100, b.pct)}%`,
                        background: over ? "var(--red)" : warn ? "var(--amber)" : b.color,
                      }}
                    />
                  </div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                    {over
                      ? `Over budget by ${fmt(b.spent - b.budget)}`
                      : `${fmt(b.budget - b.spent)} left this month`}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

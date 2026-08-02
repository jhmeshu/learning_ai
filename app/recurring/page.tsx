"use client";

import { useCallback, useEffect, useState } from "react";
import RecurringForm from "@/components/RecurringForm";
import { Category, Recurring } from "@/lib/types";
import { FREQUENCY_LABELS } from "@/lib/recurring";
import { fmt, prettyDate } from "@/lib/utils";

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recurring | null>(null);
  const [formKey, setFormKey] = useState(0);

  function openForm(rec: Recurring | null) {
    setEditing(rec);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  const load = useCallback(async () => {
    const [rec, cats] = await Promise.all([
      fetch("/api/recurring").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setRecurring(rec);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  async function toggleActive(rec: Recurring) {
    await fetch(`/api/recurring/${rec.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !rec.active }),
    });
    load();
  }

  async function handleDelete(rec: Recurring) {
    if (!confirm(`Delete "${rec.label}"? Past generated transactions stay.`)) return;
    await fetch(`/api/recurring/${rec.id}`, { method: "DELETE" });
    load();
  }

  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Recurring transactions</h1>
          <div className="sub">Rules auto-create transactions when due.</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openForm(null)}
        >
          + Add recurring
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading…</div>
        ) : recurring.length === 0 ? (
          <div className="empty">
            <div className="icon">🔁</div>
            <div>No recurring rules yet. Add one to automate bills or salary.</div>
          </div>
        ) : (
          <div>
            {recurring.map((rec) => {
              const cat = catById.get(rec.categoryId);
              return (
                <div key={rec.id} className="recur-item">
                  <div className="recur-main">
                    <span className="badge" style={{ opacity: rec.active ? 1 : 0.4 }}>
                      <span className="color-dot" style={{ background: cat?.color || "#94a3b8" }} />
                    </span>
                    <div>
                      <div className="recur-label" style={{ opacity: rec.active ? 1 : 0.5 }}>
                        {rec.label}
                      </div>
                      <div className="recur-meta">
                        {fmt(rec.amount)} · {FREQUENCY_LABELS[rec.frequency]}
                        {rec.interval > 1 ? ` ×${rec.interval}` : ""} · next{" "}
                        {prettyDate(rec.nextRunDate)} · {cat?.name || "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="inline-actions">
                    <button className="btn btn-sm" onClick={() => toggleActive(rec)}>
                      {rec.active ? "Pause" : "Resume"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openForm(rec)}
                    >
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rec)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RecurringForm
        key={formKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={categories}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}

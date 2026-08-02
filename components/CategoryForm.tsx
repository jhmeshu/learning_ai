"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Category, TxType } from "@/lib/types";

const PALETTE = [
  "#4f46e5",
  "#16a34a",
  "#f97316",
  "#8b5cf6",
  "#eab308",
  "#ec4899",
  "#0ea5e9",
  "#ef4444",
  "#64748b",
  "#14b8a6",
];

export default function CategoryForm({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Category | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<TxType>(initial?.type ?? "expense");
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);
  const [monthlyBudget, setMonthlyBudget] = useState(
    initial?.monthlyBudget != null ? String(initial.monthlyBudget) : ""
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    const payload = {
      name,
      type,
      color,
      monthlyBudget: monthlyBudget === "" ? null : Number(monthlyBudget),
    };
    try {
      const res = await fetch(
        initial ? `/api/categories/${initial.id}` : "/api/categories",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={initial ? "Edit category" : "Add category"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Name</label>
          <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Food" />
        </div>
        <div className="field">
          <label>Type</label>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as TxType)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="field">
          <label>Color</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: c,
                  border: color === c ? "2px solid #111827" : "2px solid transparent",
                  cursor: "pointer",
                }}
                aria-label={`color ${c}`}
              />
            ))}
          </div>
        </div>
        <div className="field">
          <label>Monthly budget (expenses only, optional)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            placeholder="Leave empty for no limit"
          />
        </div>
        {error && <p className="danger-text" style={{ margin: "0 0 8px" }}>{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : initial ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

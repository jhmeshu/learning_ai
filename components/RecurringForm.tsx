"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Category, Frequency, Recurring, TxType } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const FREQ_UNITS: Record<Frequency, string> = {
  daily: "days",
  weekly: "weeks",
  monthly: "months",
  yearly: "years",
};

export default function RecurringForm({
  open,
  onClose,
  categories,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  initial?: Recurring | null;
  onSaved: () => void;
}) {
  const initType: TxType = initial?.type ?? "expense";
  const [label, setLabel] = useState(initial?.label ?? "");
  const [type, setType] = useState<TxType>(initType);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(
    () =>
      initial?.categoryId ??
      categories.find((c) => c.type === initType)?.id ??
      ""
  );
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "monthly");
  const [interval, setInterval] = useState(initial ? String(initial.interval) : "1");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function changeType(next: TxType) {
    setType(next);
    if (!categories.some((c) => c.id === categoryId && c.type === next)) {
      setCategoryId(categories.find((c) => c.type === next)?.id ?? "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!label || !amount || Number(amount) <= 0 || !categoryId) {
      setError("Label, amount, and category are required.");
      return;
    }
    setSaving(true);
    const payload = {
      label,
      type,
      amount: Number(amount),
      categoryId,
      frequency,
      interval: Number(interval) || 1,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      startDate,
    };
    try {
      const res = await fetch(
        initial ? `/api/recurring/${initial.id}` : "/api/recurring",
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

  const options = categories.filter((c) => c.type === type);

  return (
    <Modal open={open} title={initial ? "Edit recurring" : "Add recurring"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Label</label>
          <input className="input" type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Netflix" />
        </div>
        <div className="field">
          <label>Type</label>
          <select className="select" value={type} onChange={(e) => changeType(e.target.value as TxType)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="field">
          <label>Amount</label>
          <input className="input" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <div className="field">
          <label>Category</label>
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {options.length === 0 && <option value="">No {type} categories</option>}
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label>Frequency</label>
            <select className="select" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="field">
            <label>Every N {FREQ_UNITS[frequency]}</label>
            <input className="input" type="number" min="1" value={interval} onChange={(e) => setInterval(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Start date</label>
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Tags (comma separated)</label>
          <input className="input" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="subscription" />
        </div>
        {error && <p className="danger-text" style={{ margin: "0 0 8px" }}>{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : initial ? "Save changes" : "Add recurring"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

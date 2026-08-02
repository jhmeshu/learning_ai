"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Category, Transaction, TxType } from "@/lib/types";
import { todayISO } from "@/lib/utils";

export default function TransactionForm({
  open,
  onClose,
  categories,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  initial?: Transaction | null;
  onSaved: () => void;
}) {
  const initType: TxType = initial?.type ?? "expense";
  const [type, setType] = useState<TxType>(initType);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [categoryId, setCategoryId] = useState(
    () =>
      initial?.categoryId ??
      categories.find((c) => c.type === initType)?.id ??
      ""
  );
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
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
    if (!amount || Number(amount) <= 0 || !date || !categoryId) {
      setError("Amount, date, and category are required.");
      return;
    }
    setSaving(true);
    const payload = {
      type,
      amount: Number(amount),
      date,
      categoryId,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
    };
    try {
      const res = await fetch(
        initial ? `/api/transactions/${initial.id}` : "/api/transactions",
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
    <Modal open={open} title={initial ? "Edit transaction" : "Add transaction"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Type</label>
          <select className="select" value={type} onChange={(e) => changeType(e.target.value as TxType)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="field">
          <label>Amount</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
        <div className="field">
          <label>Tags (comma separated)</label>
          <input
            className="input"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="groceries, weekly"
          />
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea
            className="textarea"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {error && <p className="danger-text" style={{ margin: "0 0 8px" }}>{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : initial ? "Save changes" : "Add transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

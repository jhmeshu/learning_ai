"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { Category, Transaction, TxType } from "@/lib/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | TxType>("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [formKey, setFormKey] = useState(0);

  function openForm(txn: Transaction | null) {
    setEditing(txn);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (categoryId) params.set("categoryId", categoryId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const [txns, cats] = await Promise.all([
      fetch(`/api/transactions?${params.toString()}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setTransactions(txns);
    setCategories(cats);
    setLoading(false);
  }, [search, type, categoryId, from, to]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function handleDelete(t: Transaction) {
    if (!confirm(`Delete ${t.notes || "this transaction"}?`)) return;
    await fetch(`/api/transactions/${t.id}`, { method: "DELETE" });
    setTransactions((prev) => prev.filter((x) => x.id !== t.id));
  }

  const total = useMemo(
    () =>
      transactions.reduce(
        (acc, t) => {
          if (t.type === "income") acc.income += t.amount;
          else acc.expense += t.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      ),
    [transactions]
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <div className="sub">
            {transactions.length} shown · income{" "}
            <span className="amount-income">+${total.income.toFixed(2)}</span> ·
            expenses{" "}
            <span className="amount-expense">−${total.expense.toFixed(2)}</span>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openForm(null)}
        >
          + Add transaction
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters">
          <div className="field">
            <label>Search</label>
            <input
              className="input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Notes or tags…"
            />
          </div>
          <div className="field">
            <label>Type</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value as "" | TxType)}>
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="field">
            <label>Category</label>
            <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>From</label>
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>To</label>
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading…</div>
        ) : (
          <TransactionTable
            transactions={transactions}
            categories={categories}
            showRecurringBadge
            onEdit={(t) => openForm(t)}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TransactionForm
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

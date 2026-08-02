"use client";

import { useCallback, useEffect, useState } from "react";
import CategoryForm from "@/components/CategoryForm";
import { Category } from "@/lib/types";
import { fmt } from "@/lib/utils";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formKey, setFormKey] = useState(0);

  function openForm(cat: Category | null) {
    setEditing(cat);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  const load = useCallback(async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    load();
  }

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  function renderRows(list: Category[]) {
    if (list.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="muted">
            None yet.
          </td>
        </tr>
      );
    }
    return list.map((c) => (
      <tr key={c.id}>
        <td>
          <span className="color-dot" style={{ background: c.color, marginRight: 6 }} />
          {c.name}
        </td>
        <td className="muted">
          {c.monthlyBudget != null ? fmt(c.monthlyBudget) : "—"}
        </td>
        <td className="muted">{c.id}</td>
        <td>
          <div className="inline-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => openForm(c)}
            >
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>
              Delete
            </button>
          </div>
        </td>
      </tr>
    ));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <div className="sub">Group transactions and set monthly budgets.</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openForm(null)}
        >
          + Add category
        </button>
      </div>

      <div className="card">
        <h2>Expenses</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Monthly budget</th>
                <th>ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>{renderRows(expense)}</tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Income</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Monthly budget</th>
                <th>ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>{renderRows(income)}</tbody>
          </table>
        </div>
      </div>

      <CategoryForm
        key={formKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}

"use client";

import { Category, Transaction } from "@/lib/types";
import { fmt, prettyDate } from "@/lib/utils";

export default function TransactionTable({
  transactions,
  categories,
  onEdit,
  onDelete,
  showRecurringBadge,
  readOnly,
}: {
  transactions: Transaction[];
  categories: Category[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
  showRecurringBadge?: boolean;
  readOnly?: boolean;
}) {
  const catById = new Map(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return (
      <div className="empty">
        <div className="icon">💸</div>
        <div>No transactions found.</div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Notes</th>
            <th>Tags</th>
            <th>Amount</th>
            {!readOnly && <th></th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const cat = catById.get(t.categoryId);
            return (
              <tr key={t.id}>
                <td>{prettyDate(t.date)}</td>
                <td>
                  <span className="color-dot" style={{ background: cat?.color || "#94a3b8", marginRight: 6 }} />
                  {cat?.name || "Unknown"}
                  {showRecurringBadge && t.recurringId && (
                    <span className="tag" style={{ marginLeft: 6 }}>recurring</span>
                  )}
                </td>
                <td>{t.notes || <span className="muted">—</span>}</td>
                <td>
                  {t.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </td>
                <td className={t.type === "income" ? "amount-income" : "amount-expense"}>
                  {t.type === "income" ? "+" : "−"}
                  {fmt(t.amount)}
                </td>
                <td>
                  {!readOnly && (
                    <div className="inline-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => onEdit?.(t)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(t)}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

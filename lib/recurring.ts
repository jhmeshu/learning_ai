import { DB, Frequency, Recurring, Transaction } from "./types";
import { round2, toLocalISO, uid } from "./utils";

export function nextOccurrence(
  date: string,
  frequency: Frequency,
  interval: number
): string {
  const d = new Date(date + "T00:00:00");
  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + interval);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7 * interval);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + interval);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + interval);
      break;
  }
  return toLocalISO(d);
}

export function runRecurring(db: DB, now = new Date()): number {
  const today = toLocalISO(now);
  let created = 0;
  for (const r of db.recurring) {
    if (!r.active) continue;
    let guard = 0;
    while (r.nextRunDate <= today && guard < 400) {
      const txn: Transaction = {
        id: uid(),
        type: r.type,
        amount: r.amount,
        date: r.nextRunDate,
        categoryId: r.categoryId,
        tags: [...r.tags],
        notes: r.label,
        recurringId: r.id,
      };
      db.transactions.push(txn);
      r.nextRunDate = nextOccurrence(r.nextRunDate, r.frequency, r.interval);
      created++;
      guard++;
    }
  }
  return created;
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function buildRecurring(input: Partial<Recurring>): Recurring {
  const startDate = input.startDate || toLocalISO(new Date());
  return {
    id: input.id || uid(),
    label: input.label || "",
    type: input.type === "income" ? "income" : "expense",
    amount: round2(Number(input.amount) || 0),
    categoryId: input.categoryId || "",
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    frequency: input.frequency || "monthly",
    interval: Math.max(1, Math.floor(Number(input.interval) || 1)),
    startDate,
    nextRunDate: input.nextRunDate || startDate,
    active: input.active !== false,
  };
}

import { DB, Stats } from "./types";
import { round2, toLocalISO } from "./utils";

export function computeStats(db: DB): Stats {
  const now = new Date();
  const thisKey = toLocalISO(now).slice(0, 7);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = toLocalISO(prev).slice(0, 7);

  const catById = new Map(db.categories.map((c) => [c.id, c]));

  let totalIncome = 0;
  let totalExpense = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  let prevMonthIncome = 0;
  let prevMonthExpense = 0;

  const spentByCategory = new Map<string, number>();
  const monthSpentByCategory = new Map<string, number>();

  const monthly: Record<string, { income: number; expense: number }> = {};
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    monthly[toLocalISO(d).slice(0, 7)] = { income: 0, expense: 0 };
  }

  for (const t of db.transactions) {
    const key = t.date.slice(0, 7);
    if (monthly[key]) {
      if (t.type === "income") monthly[key].income += t.amount;
      else monthly[key].expense += t.amount;
    }

    if (t.type === "income") {
      totalIncome += t.amount;
      if (key === thisKey) monthIncome += t.amount;
      if (key === prevKey) prevMonthIncome += t.amount;
    } else {
      totalExpense += t.amount;
      spentByCategory.set(
        t.categoryId,
        (spentByCategory.get(t.categoryId) || 0) + t.amount
      );
      if (key === thisKey) {
        monthExpense += t.amount;
        monthSpentByCategory.set(
          t.categoryId,
          (monthSpentByCategory.get(t.categoryId) || 0) + t.amount
        );
      }
      if (key === prevKey) prevMonthExpense += t.amount;
    }
  }

  const spentByCategoryOut = Array.from(spentByCategory.entries()).map(
    ([categoryId, total]) => {
      const cat = catById.get(categoryId);
      return {
        categoryId,
        name: cat?.name || "Unknown",
        color: cat?.color || "#94a3b8",
        total: round2(total),
      };
    }
  );
  spentByCategoryOut.sort((a, b) => b.total - a.total);

  const monthSpent = Array.from(monthSpentByCategory.entries()).map(
    ([categoryId, total]) => {
      const cat = catById.get(categoryId);
      return {
        categoryId,
        name: cat?.name || "Unknown",
        color: cat?.color || "#94a3b8",
        total: round2(total),
      };
    }
  );
  monthSpent.sort((a, b) => b.total - a.total);

  const budgetUsage = db.categories
    .filter((c) => c.type === "expense" && c.monthlyBudget != null)
    .map((c) => {
      const spent = round2(monthSpentByCategory.get(c.id) || 0);
      const budget = c.monthlyBudget as number;
      return {
        categoryId: c.id,
        name: c.name,
        color: c.color,
        budget,
        spent,
        pct: budget > 0 ? round2((spent / budget) * 100) : 0,
      };
    })
    .sort((a, b) => b.pct - a.pct);

  return {
    totalIncome: round2(totalIncome),
    totalExpense: round2(totalExpense),
    balance: round2(totalIncome - totalExpense),
    monthIncome: round2(monthIncome),
    monthExpense: round2(monthExpense),
    monthNet: round2(monthIncome - monthExpense),
    prevMonthIncome: round2(prevMonthIncome),
    prevMonthExpense: round2(prevMonthExpense),
    spentByCategory: spentByCategoryOut,
    monthlySeries: Object.entries(monthly).map(([month, v]) => ({
      month,
      income: round2(v.income),
      expense: round2(v.expense),
    })),
    budgetUsage,
  };
}

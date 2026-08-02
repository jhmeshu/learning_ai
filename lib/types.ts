export type TxType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: TxType;
  color: string;
  monthlyBudget: number | null;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  date: string;
  categoryId: string;
  tags: string[];
  notes?: string;
  recurringId?: string;
}

export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export interface Recurring {
  id: string;
  label: string;
  type: TxType;
  amount: number;
  categoryId: string;
  tags: string[];
  frequency: Frequency;
  interval: number;
  startDate: string;
  nextRunDate: string;
  active: boolean;
}

export interface DB {
  categories: Category[];
  transactions: Transaction[];
  recurring: Recurring[];
}

export interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
}

export interface CategorySpend {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

export interface BudgetUsage {
  categoryId: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  pct: number;
}

export interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  prevMonthIncome: number;
  prevMonthExpense: number;
  spentByCategory: CategorySpend[];
  monthlySeries: MonthlyPoint[];
  budgetUsage: BudgetUsage[];
}

import { promises as fs } from "fs";
import path from "path";
import { Category, DB, Recurring, Transaction } from "./types";
import { round2, toLocalISO, uid } from "./utils";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const SAMPLE_NOTES = [
  "Groceries",
  "Lunch",
  "Coffee",
  "Dinner out",
  "Weekly shop",
  "Snacks",
  "Farmers market",
];

function seed(): DB {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const todayDay = now.getDate();
  const nextMonthFirst = toLocalISO(new Date(y, mo + 1, 1));

  const categories: Category[] = [
    { id: "salary", name: "Salary", type: "income", color: "#16a34a", monthlyBudget: null },
    { id: "freelance", name: "Freelance", type: "income", color: "#0ea5e9", monthlyBudget: null },
    { id: "food", name: "Food", type: "expense", color: "#f97316", monthlyBudget: 500 },
    { id: "rent", name: "Rent", type: "expense", color: "#8b5cf6", monthlyBudget: 1500 },
    { id: "transport", name: "Transport", type: "expense", color: "#eab308", monthlyBudget: 200 },
    { id: "fun", name: "Fun", type: "expense", color: "#ec4899", monthlyBudget: 300 },
    { id: "other", name: "Other", type: "expense", color: "#64748b", monthlyBudget: 100 },
  ];

  const transactions: Transaction[] = [];

  for (let m = 3; m >= 0; m--) {
    const base = new Date(y, mo - m, 1);
    const by = base.getFullYear();
    const bmo = base.getMonth();
    const biso = (d: number) => toLocalISO(new Date(by, bmo, d));
    const daysInMonth = new Date(by, bmo + 1, 0).getDate();
    const isCurrent = m === 0;
    const dayClamp = (d: number) => (isCurrent ? Math.min(d, todayDay) : d);

    transactions.push({
      id: uid(),
      type: "income",
      amount: 4200,
      date: biso(1),
      categoryId: "salary",
      tags: ["salary"],
      notes: "Monthly salary",
    });
    transactions.push({
      id: uid(),
      type: "expense",
      amount: 1450,
      date: biso(dayClamp(3)),
      categoryId: "rent",
      tags: ["housing"],
      notes: "Rent",
    });

    const foodCount = m === 0 ? 14 : 12;
    for (let i = 0; i < foodCount; i++) {
      const day = dayClamp(2 + ((i * 7 + (m * 3)) % (daysInMonth - 4)));
      transactions.push({
        id: uid(),
        type: "expense",
        amount: round2(8 + ((i * 37) % 35)),
        date: biso(day),
        categoryId: "food",
        tags: ["groceries"],
        notes: SAMPLE_NOTES[i % SAMPLE_NOTES.length],
      });
    }

    const funCount = m === 0 ? 6 : 5;
    for (let i = 0; i < funCount; i++) {
      const day = dayClamp(4 + ((i * 9 + m * 5) % (daysInMonth - 5)));
      transactions.push({
        id: uid(),
        type: "expense",
        amount: round2(15 + ((i * 53) % 60)),
        date: biso(day),
        categoryId: "fun",
        tags: ["entertainment"],
        notes: i % 2 ? "Movies" : "Night out",
      });
    }

    for (let i = 0; i < 4; i++) {
      const day = dayClamp(2 + ((i * 11 + m * 7) % (daysInMonth - 3)));
      transactions.push({
        id: uid(),
        type: "expense",
        amount: round2(20 + ((i * 29 + m * 13) % 50)),
        date: biso(day),
        categoryId: "transport",
        tags: ["commute"],
        notes: "Fuel / transit",
      });
    }
  }

  const recurring: Recurring[] = [
    {
      id: uid(),
      label: "Monthly salary",
      type: "income",
      amount: 4200,
      categoryId: "salary",
      tags: ["salary"],
      frequency: "monthly",
      interval: 1,
      startDate: nextMonthFirst,
      nextRunDate: nextMonthFirst,
      active: true,
    },
    {
      id: uid(),
      label: "Rent",
      type: "expense",
      amount: 1450,
      categoryId: "rent",
      tags: ["housing"],
      frequency: "monthly",
      interval: 1,
      startDate: nextMonthFirst,
      nextRunDate: nextMonthFirst,
      active: true,
    },
    {
      id: uid(),
      label: "Netflix",
      type: "expense",
      amount: 15.99,
      categoryId: "fun",
      tags: ["subscription"],
      frequency: "monthly",
      interval: 1,
      startDate: nextMonthFirst,
      nextRunDate: nextMonthFirst,
      active: true,
    },
    {
      id: uid(),
      label: "Gym membership",
      type: "expense",
      amount: 30,
      categoryId: "other",
      tags: ["fitness"],
      frequency: "monthly",
      interval: 1,
      startDate: nextMonthFirst,
      nextRunDate: nextMonthFirst,
      active: true,
    },
  ];

  return { categories, transactions, recurring };
}

export async function readDb(): Promise<DB> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  const db = JSON.parse(raw) as DB;
  if (!db.recurring) db.recurring = [];
  return db;
}

export async function writeDb(db: DB): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpPath = `${DB_PATH}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmpPath, DB_PATH);
}

async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await writeDb(seed());
  }
}

export const dbPath = DB_PATH;

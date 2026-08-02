import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { runRecurring } from "@/lib/recurring";
import { Transaction } from "@/lib/types";
import { round2, uid } from "@/lib/utils";

export async function GET(request: Request) {
  const db = await readDb();
  runRecurring(db);
  await writeDb(db);

  const url = new URL(request.url);
  const q = url.searchParams;

  let txns = db.transactions;
  const type = q.get("type");
  if (type === "income" || type === "expense") {
    txns = txns.filter((t) => t.type === type);
  }
  const from = q.get("from");
  if (from) txns = txns.filter((t) => t.date >= from);
  const to = q.get("to");
  if (to) txns = txns.filter((t) => t.date <= to);
  const categoryId = q.get("categoryId");
  if (categoryId) txns = txns.filter((t) => t.categoryId === categoryId);
  const tag = q.get("tag");
  if (tag) txns = txns.filter((t) => t.tags.includes(tag));
  const search = q.get("search")?.toLowerCase();
  if (search) {
    txns = txns.filter(
      (t) =>
        (t.notes ?? "").toLowerCase().includes(search) ||
        t.tags.some((tg) => tg.toLowerCase().includes(search))
    );
  }

  txns.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return NextResponse.json(txns);
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = await readDb();

  const txn: Transaction = {
    id: uid(),
    type: body.type === "income" ? "income" : "expense",
    amount: round2(Number(body.amount) || 0),
    date: String(body.date || ""),
    categoryId: String(body.categoryId || ""),
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    notes: body.notes ? String(body.notes) : undefined,
    recurringId: body.recurringId || undefined,
  };

  if (!txn.amount || !txn.date || !txn.categoryId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  db.transactions.push(txn);
  await writeDb(db);
  return NextResponse.json(txn, { status: 201 });
}

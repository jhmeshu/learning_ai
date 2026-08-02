import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { round2 } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json();
  const db = await readDb();
  const txn = db.transactions.find((t) => t.id === id);
  if (!txn) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (body.type === "income" || body.type === "expense") txn.type = body.type;
  if ("amount" in body) txn.amount = round2(Number(body.amount) || 0);
  if (typeof body.date === "string" && body.date) txn.date = body.date;
  if (typeof body.categoryId === "string" && body.categoryId)
    txn.categoryId = body.categoryId;
  if (Array.isArray(body.tags)) txn.tags = body.tags.map(String);
  if ("notes" in body) txn.notes = body.notes ? String(body.notes) : undefined;
  await writeDb(db);
  return NextResponse.json(txn);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const before = db.transactions.length;
  db.transactions = db.transactions.filter((t) => t.id !== id);
  if (db.transactions.length === before) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writeDb(db);
  return NextResponse.json({ ok: true });
}

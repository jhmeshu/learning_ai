import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { buildRecurring } from "@/lib/recurring";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json();
  const db = await readDb();
  const idx = db.recurring.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const rec = buildRecurring({ ...db.recurring[idx], ...body, id });
  db.recurring[idx] = rec;
  await writeDb(db);
  return NextResponse.json(rec);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const before = db.recurring.length;
  db.recurring = db.recurring.filter((r) => r.id !== id);
  if (db.recurring.length === before) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writeDb(db);
  return NextResponse.json({ ok: true });
}

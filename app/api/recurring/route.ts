import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { buildRecurring, runRecurring } from "@/lib/recurring";

export async function GET() {
  const db = await readDb();
  runRecurring(db);
  await writeDb(db);
  return NextResponse.json(db.recurring);
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = await readDb();
  const rec = buildRecurring(body);
  if (!rec.label || !rec.categoryId || !rec.amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  db.recurring.push(rec);
  await writeDb(db);
  return NextResponse.json(rec, { status: 201 });
}

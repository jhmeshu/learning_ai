import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json();
  const db = await readDb();
  const cat = db.categories.find((c) => c.id === id);
  if (!cat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (typeof body.name === "string") cat.name = body.name.trim();
  if (body.type === "income" || body.type === "expense") cat.type = body.type;
  if (typeof body.color === "string") cat.color = body.color;
  if ("monthlyBudget" in body) {
    cat.monthlyBudget =
      body.monthlyBudget == null || body.monthlyBudget === ""
        ? null
        : Number(body.monthlyBudget);
  }
  if (!cat.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  await writeDb(db);
  return NextResponse.json(cat);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const before = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  if (db.categories.length === before) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writeDb(db);
  return NextResponse.json({ ok: true });
}

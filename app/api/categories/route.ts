import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { Category } from "@/lib/types";
import { uid } from "@/lib/utils";

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.categories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = await readDb();
  const cat: Category = {
    id: uid(),
    name: String(body.name ?? "").trim(),
    type: body.type === "income" ? "income" : "expense",
    color: String(body.color ?? "#64748b"),
    monthlyBudget:
      body.monthlyBudget == null || body.monthlyBudget === ""
        ? null
        : Number(body.monthlyBudget),
  };
  if (!cat.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  db.categories.push(cat);
  await writeDb(db);
  return NextResponse.json(cat, { status: 201 });
}

import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { runRecurring } from "@/lib/recurring";
import { computeStats } from "@/lib/stats";

export async function GET() {
  const db = await readDb();
  const created = runRecurring(db);
  if (created > 0) await writeDb(db);
  const stats = computeStats(db);
  return NextResponse.json(stats);
}

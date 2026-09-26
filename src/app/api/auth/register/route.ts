import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { email, password, name } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "email + password required" }, { status: 400 });
  const e = email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email: e } });
  if (existing) return NextResponse.json({ error: "email already registered" }, { status: 409 });
  const hash = await bcrypt.hash(password, 10);
  const user = await db.user.create({ data: { email: e, name: name || null, passwordHash: hash, emailVerified: new Date() } });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}

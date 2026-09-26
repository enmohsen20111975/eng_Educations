import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { email, password, name } = await req.json().catch(() => ({}));
  const e = (email || "").trim().toLowerCase();
  const p = password || "";
  // Validate email format
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }
  // Validate password strength
  if (p.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const existing = await db.user.findUnique({ where: { email: e } });
  if (existing) return NextResponse.json({ error: "email already registered" }, { status: 409 });
  const hash = await bcrypt.hash(p, 10);
  const user = await db.user.create({ data: { email: e, name: name || null, passwordHash: hash, emailVerified: new Date() } });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}

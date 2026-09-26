import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseOr400, ok, bad, serverError } from "@/lib/api-helpers";
import { z } from "zod";

export const revalidate = 3600; // ISR: cache knowledge content 1h (read-heavy, fast)

export async function GET() {
  try {
    const sections = await db.section.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { lessons: true, questions: true } },
      },
    });
    return ok(sections);
  } catch (e) {
    return serverError(String(e));
  }
}

const sectionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  description: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  order: z.number().int().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }
  const parsed = parseOr400(sectionSchema, body);
  if (!parsed.ok) return parsed.res;
  try {
    const maxOrder = await db.section.aggregate({ _max: { order: true } });
    const data = {
      ...parsed.data,
      order: parsed.data.order ?? (maxOrder._max.order ?? 0) + 1,
    };
    const section = await db.section.create({ data });
    return ok(section, { status: 201 });
  } catch (e) {
    return serverError(String(e));
  }
}

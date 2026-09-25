import { NextResponse } from "next/server";
import type { z } from "zod";

/** Read the per-device student key from header or query. */
export function getStudentKey(req: Request): string {
  const fromHeader = req.headers.get("x-student-key");
  if (fromHeader) return fromHeader;
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("studentKey");
  if (fromQuery) return fromQuery;
  return "anonymous";
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export function serverError(msg: string) {
  return NextResponse.json({ error: msg }, { status: 500 });
}

/** Run a zod parse; on failure return a 400 Response, else the data. */
export function parseOr400<T>(
  schema: z.ZodType<T>,
  raw: unknown,
): { ok: true; data: T } | { ok: false; res: Response } {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

import { db } from "@/lib/db";
import { bad, ok, serverError, requireAdmin } from "@/lib/api-helpers";
import { SOURCE_LEVELS } from "@/lib/spec";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  if (!sectionId) return bad("sectionId required");
  try {
    const refs = await db.reference.findMany({
      where: { sectionId },
      orderBy: [{ level: "asc" }, { createdAt: "desc" }],
    });
    return ok(refs);
  } catch (e) {
    return serverError(String(e));
  }
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req); if (guard) return guard;
  let body: any;
  try { body = await req.json(); } catch { return bad("Invalid JSON"); }
  const { sectionId, title, level, type, url, citation } = body ?? {};
  if (!title || !level || !citation) return bad("title, level, citation required");
  const levelLabel =
    SOURCE_LEVELS.find((l) => String(l.level) === String(level))?.label ||
    "Secondary Educational Sources";
  try {
    const ref = await db.reference.create({
      data: {
        sectionId: sectionId || null,
        title,
        level: String(level),
        levelLabel,
        type: type || "BOOK",
        url: url || null,
        citation,
      },
    });
    return ok(ref, { status: 201 });
  } catch (e) {
    return serverError(String(e));
  }
}

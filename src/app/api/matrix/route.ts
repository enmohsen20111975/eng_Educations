import { db } from "@/lib/db";
import { bad, ok, serverError, requireAdmin } from "@/lib/api-helpers";
import { BLOOM_LEVELS, DIFFICULTIES, QUESTION_TYPES } from "@/lib/types";

export const revalidate = 3600; // ISR: cache knowledge content 1h (read-heavy, fast)

/** GET returns every matrix cell for every section, joined with the current
 * (live) count of questions matching that cell, plus section metadata. */
export async function GET() {
  try {
    const sections = await db.section.findMany({ orderBy: { order: "asc" } });
    const cells = await db.generationMatrixCell.findMany();
    const counts = await db.question.groupBy({
      by: ["sectionId", "difficulty", "bloomLevel", "type"],
      _count: { _all: true },
    });

    const countMap = new Map<string, number>();
    for (const c of counts) {
      countMap.set(
        `${c.sectionId}|${c.difficulty}|${c.bloomLevel}|${c.type}`,
        c._count._all,
      );
    }

    // Ensure every section has all 24 cells represented (target default + live count).
    const out = sections.flatMap((s) =>
      DIFFICULTIES.flatMap((d) =>
        BLOOM_LEVELS.flatMap((b) =>
          QUESTION_TYPES.map((t) => {
            const key = `${s.id}|${d}|${b}|${t}`;
            const existing = cells.find(
              (c) =>
                c.sectionId === s.id &&
                c.difficulty === d &&
                c.bloomLevel === b &&
                c.type === t,
            );
            return {
              sectionId: s.id,
              sectionTitle: s.title,
              sectionColor: s.color,
              difficulty: d,
              bloomLevel: b,
              type: t,
              targetCount: existing?.targetCount ?? defaultTarget(d, t),
              currentCount: countMap.get(key) ?? 0,
            };
          }),
        ),
      ),
    );

    return ok(out);
  } catch (e) {
    return serverError(String(e));
  }
}

function defaultTarget(d: string, t: string): number {
  if (t === "TrueFalse") return d === "Easy" ? 10 : d === "Medium" ? 8 : 6;
  return d === "Easy" ? 25 : d === "Medium" ? 20 : 15;
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req); if (guard) return guard;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON");
  }
  const { sectionId, difficulty, bloomLevel, type, targetCount } = body ?? {};
  if (!sectionId || !difficulty || !bloomLevel || !type || typeof targetCount !== "number") {
    return bad("sectionId, difficulty, bloomLevel, type, targetCount are required");
  }
  try {
    const cell = await db.generationMatrixCell.upsert({
      where: {
        sectionId_difficulty_bloomLevel_type: {
          sectionId,
          difficulty,
          bloomLevel,
          type,
        },
      },
      create: { sectionId, difficulty, bloomLevel, type, targetCount },
      update: { targetCount },
    });
    return ok(cell);
  } catch (e) {
    return serverError(String(e));
  }
}

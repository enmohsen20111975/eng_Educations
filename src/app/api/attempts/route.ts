import { db } from "@/lib/db";
import { getStudentKey, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const studentKey = getStudentKey(req);
  try {
    const attempts = await db.quizAttempt.findMany({
      where: { studentKey, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 50,
      include: { section: true },
    });
    const rows = attempts.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      sectionId: a.sectionId,
      studentKey: a.studentKey,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      score: a.score,
      totalQuestions: a.totalQuestions,
      durationSec: a.durationSec,
      section: a.section,
    }));
    return ok(rows);
  } catch (e) {
    return serverError(String(e));
  }
}

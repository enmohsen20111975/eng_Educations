import { db } from "@/lib/db";
import { getStudentKey, ok, serverError } from "@/lib/api-helpers";
import type { ProgressSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const studentKey = getStudentKey(req);
  try {
    const attempts = await db.quizAttempt.findMany({
      where: { studentKey, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      include: { section: true },
    });

    if (attempts.length === 0) {
      const empty: ProgressSummary = {
        totalAttempts: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        averageScore: 0,
        sectionsCovered: 0,
        bestSection: null,
        recentAttempts: [],
        bySection: [],
        byDifficulty: [
          { difficulty: "Easy", attempts: 0, correct: 0 },
          { difficulty: "Medium", attempts: 0, correct: 0 },
          { difficulty: "Hard", attempts: 0, correct: 0 },
        ],
        timeline: [],
      };
      return ok(empty);
    }

    const totalCorrect = attempts.reduce((s, a) => s + a.score, 0);
    const totalQ = attempts.reduce((s, a) => s + a.totalQuestions, 0);

    // group by section
    const bySecMap = new Map<
      string,
      { section: any; attempts: number; correct: number; total: number }
    >();
    for (const a of attempts) {
      // Include cert-track attempts (section null) as a pseudo "Certification" bucket
      const key = a.sectionId || `cert:${a.certificationId ?? "mixed"}`;
      const cur = bySecMap.get(key) || {
        section: a.section || { id: key, title: a.certificationId ? "Certification quiz" : "Mixed / Certification", color: "emerald", icon: "Award" },
        attempts: 0,
        correct: 0,
        total: 0,
      };
      cur.attempts++;
      cur.correct += a.score;
      cur.total += a.totalQuestions;
      bySecMap.set(key, cur);
    }
    const bySection = Array.from(bySecMap.values())
      .map((v) => ({
        ...v,
        accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    // best section by accuracy (min 1 attempt)
    const bestSection = bySection[0]
      ? {
          section: bySection[0].section,
          accuracy: bySection[0].accuracy,
          attempts: bySection[0].attempts,
        }
      : null;

    // group by difficulty — need answers; aggregate from question difficulty.
    // We join via QuizAnswer -> Question. Do one query.
    const answers = await db.quizAnswer.findMany({
      where: { attempt: { studentKey } },
      include: { question: { select: { difficulty: true } } },
    });
    const diffAgg: Record<string, { attempts: number; correct: number }> = {
      Easy: { attempts: 0, correct: 0 },
      Medium: { attempts: 0, correct: 0 },
      Hard: { attempts: 0, correct: 0 },
    };
    for (const ans of answers) {
      const d = ans.question?.difficulty;
      if (!d || !diffAgg[d]) continue;
      diffAgg[d].attempts++;
      if (ans.isCorrect) diffAgg[d].correct++;
    }
    const byDifficulty = (["Easy", "Medium", "Hard"] as const).map((d) => ({
      difficulty: d,
      attempts: diffAgg[d].attempts,
      correct: diffAgg[d].correct,
    }));

    // timeline by day (last 14 days)
    const dayMap = new Map<string, { attempts: number; correct: number }>();
    for (const a of attempts) {
      const day = new Date(a.completedAt!).toISOString().slice(0, 10);
      const cur = dayMap.get(day) || { attempts: 0, correct: 0 };
      cur.attempts++;
      cur.correct += a.score;
      dayMap.set(day, cur);
    }
    const timeline = Array.from(dayMap.entries())
      .map(([day, v]) => ({ day, ...v }))
      .sort((a, b) => (a.day < b.day ? -1 : 1))
      .slice(-14);

    const summary: ProgressSummary = {
      totalAttempts: attempts.length,
      totalQuestionsAnswered: totalQ,
      totalCorrect,
      averageScore: totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0,
      sectionsCovered: bySecMap.size,
      bestSection,
      recentAttempts: attempts.slice(0, 8).map((a) => ({
        id: a.id,
        studentId: a.studentId,
        sectionId: a.sectionId,
        studentKey: a.studentKey,
        startedAt: a.startedAt,
        completedAt: a.completedAt!,
        score: a.score,
        totalQuestions: a.totalQuestions,
        durationSec: a.durationSec,
        section: a.section,
      })),
      bySection,
      byDifficulty,
      timeline,
    };
    return ok(summary);
  } catch (e) {
    return serverError(String(e));
  }
}

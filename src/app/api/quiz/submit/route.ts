import { db } from "@/lib/db";
import { bad, getStudentKey, ok, serverError, notFound } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

interface SubmitAnswer {
  questionId: string;
  selectedOptionId: string | null;
  timeSpentSec: number;
}

/** Submit a quiz: grade answers, persist QuizAnswer rows, finalize the attempt,
 * and return the graded results (including correct option ids). */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON");
  }
  const { attemptId, answers } = body ?? {};
  if (!attemptId || !Array.isArray(answers)) {
    return bad("attemptId and answers[] are required");
  }

  try {
    const attempt = await db.quizAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) return notFound("Attempt not found");
    if (attempt.completedAt) return bad("Attempt already submitted");

    const startedAt = new Date(attempt.startedAt).getTime();
    const now = Date.now();
    const durationSec = Math.max(1, Math.round((now - startedAt) / 1000));

    // Resolve each answer's correctness against the DB.
    const rows: SubmitAnswer[] = answers;
    const questionIds = rows.map((r) => r.questionId);
    const questions = await db.question.findMany({
      where: { id: { in: questionIds } },
      include: { options: true },
    });
    const qMap = new Map(questions.map((q) => [q.id, q]));

    let score = 0;
    const graded: {
      questionId: string;
      selectedOptionId: string | null;
      isCorrect: boolean;
      correctOptionId: string | null;
    }[] = [];

    const createData = rows.map((r) => {
      const q = qMap.get(r.questionId);
      const correctOption = q?.options.find((o) => o.isCorrect) || null;
      const selected = q?.options.find((o) => o.id === r.selectedOptionId) || null;
      const isCorrect = !!selected?.isCorrect;
      if (isCorrect) score++;
      graded.push({
        questionId: r.questionId,
        selectedOptionId: r.selectedOptionId ?? null,
        isCorrect,
        correctOptionId: correctOption?.id ?? null,
      });
      return {
        attemptId: attempt.id,
        questionId: r.questionId,
        selectedOptionId: r.selectedOptionId ?? null,
        isCorrect,
        timeSpentSec: Math.max(0, Math.round(r.timeSpentSec || 0)),
      };
    });

    await db.quizAnswer.createMany({ data: createData });

    const updated = await db.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        completedAt: new Date(now),
        score,
        durationSec,
      },
    });

    return ok({
      attemptId: updated.id,
      score,
      totalQuestions: updated.totalQuestions,
      durationSec: updated.durationSec,
      results: graded,
    });
  } catch (e) {
    return serverError(String(e));
  }
}

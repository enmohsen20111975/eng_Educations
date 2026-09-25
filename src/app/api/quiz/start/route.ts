import { db } from "@/lib/db";
import { bad, getStudentKey, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** Start a quiz: pick `count` questions (filtered by section/difficulty) and
 * create a QuizAttempt row. Returns the questions with options but WITHOUT
 * revealing which option is correct (client hides isCorrect). */
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }
  const studentKey = getStudentKey(req);
  const sectionId: string | undefined = body?.sectionId || undefined;
  const difficulty: string | undefined = body?.difficulty || undefined;
  const count: number = Math.max(1, Math.min(40, Number(body?.count) || 10));

  try {
    const where = {
      ...(sectionId ? { sectionId } : {}),
      ...(difficulty ? { difficulty } : {}),
    };
    const all = await db.question.findMany({
      where,
      include: { options: { orderBy: { order: "asc" } } },
    });
    if (all.length === 0) {
      return bad("No questions available for this filter. Try another section or difficulty.", 404);
    }
    // Shuffle and take `count`.
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, count);
    const questionIds = shuffled.map((q) => q.id);

    const attempt = await db.quizAttempt.create({
      data: {
        studentKey,
        sectionId: sectionId ?? null,
        totalQuestions: shuffled.length,
        questionIds: JSON.stringify(questionIds),
      },
    });

    // Strip isCorrect before sending to the client.
    const safe = shuffled.map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      lessonId: q.lessonId,
      type: q.type,
      difficulty: q.difficulty,
      bloomLevel: q.bloomLevel,
      skillType: q.skillType,
      stem: q.stem,
      explanation: null, // hidden until submit
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      options: q.options.map((o) => ({
        id: o.id,
        questionId: o.questionId,
        text: o.text,
        isCorrect: false, // hidden
        order: o.order,
      })),
    }));

    return ok({
      attemptId: attempt.id,
      questions: safe,
      totalQuestions: safe.length,
    });
  } catch (e) {
    return serverError(String(e));
  }
}

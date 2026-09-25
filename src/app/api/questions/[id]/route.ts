import { db } from "@/lib/db";
import { notFound, ok, serverError, bad } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const question = await db.question.findUnique({
      where: { id },
      include: {
        options: { orderBy: { order: "asc" } },
        section: true,
        lesson: true,
      },
    });
    if (!question) return notFound("Question not found");
    return ok(question);
  } catch (e) {
    return serverError(String(e));
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON");
  }
  const { sectionId, lessonId, type, difficulty, bloomLevel, skillType, stem, explanation, options } = body ?? {};
  try {
    // Replace options if provided.
    if (Array.isArray(options)) {
      await db.questionOption.deleteMany({ where: { questionId: id } });
      await db.questionOption.createMany({
        data: options.map((o: any, i: number) => ({
          questionId: id,
          text: o.text,
          isCorrect: !!o.isCorrect,
          order: o.order ?? i,
        })),
      });
    }
    const question = await db.question.update({
      where: { id },
      data: {
        sectionId: sectionId,
        lessonId: lessonId === undefined ? undefined : lessonId || null,
        type,
        difficulty,
        bloomLevel,
        skillType,
        stem,
        explanation,
      },
      include: { options: { orderBy: { order: "asc" } } },
    });
    return ok(question);
  } catch (e) {
    return serverError(String(e));
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await db.question.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return serverError(String(e));
  }
}

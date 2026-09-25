import { db } from "@/lib/db";
import { notFound, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        section: { include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } } } },
        certification: true,
        competency: { include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } } } },
        module: true,
        questions: {
          orderBy: { createdAt: "asc" },
          where: { OR: [{ status: "READY" }, { status: "DRAFT" }] },
          include: { options: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!lesson) return notFound("Lesson not found");
    return ok(lesson);
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
    return serverError("Invalid JSON");
  }
  try {
    const lesson = await db.lesson.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        titleAr: body.titleAr,
        order: body.order,
        conceptIntroduction: body.conceptIntroduction,
        example: body.example,
        keyFormulas: body.keyFormulas,
        exercise: body.exercise,
        durationMin: body.durationMin,
      },
    });
    return ok(lesson);
  } catch (e) {
    return serverError(String(e));
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await db.lesson.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return serverError(String(e));
  }
}

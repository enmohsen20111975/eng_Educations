import { db } from "@/lib/db";
import { bad, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  if (!sectionId) return bad("sectionId query param required");
  try {
    const lessons = await db.lesson.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
      include: { _count: { select: { questions: true } } },
    });
    return ok(lessons);
  } catch (e) {
    return serverError(String(e));
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON");
  }
  if (!body?.sectionId || !body?.slug || !body?.title || !body?.conceptIntroduction) {
    return bad("sectionId, slug, title, conceptIntroduction are required");
  }
  try {
    const lesson = await db.lesson.create({
      data: {
        sectionId: body.sectionId,
        slug: body.slug,
        title: body.title,
        titleAr: body.titleAr,
        order: body.order ?? 0,
        conceptIntroduction: body.conceptIntroduction,
        example: body.example,
        keyFormulas: body.keyFormulas,
        exercise: body.exercise,
        durationMin: body.durationMin ?? 15,
      },
    });
    return ok(lesson, { status: 201 });
  } catch (e) {
    return serverError(String(e));
  }
}

import { db } from "@/lib/db";
import { bad, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  const competencyId = url.searchParams.get("competencyId");
  const certificationId = url.searchParams.get("certificationId");
  if (!sectionId && !competencyId && !certificationId)
    return bad("sectionId, competencyId, or certificationId query param required");
  try {
    const where: any = {};
    if (sectionId) where.sectionId = sectionId;
    if (competencyId) where.competencyId = competencyId;
    if (certificationId) where.certificationId = certificationId;
    const lessons = await db.lesson.findMany({
      where,
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
  if ((!body?.sectionId && !body?.certificationId) || !body?.slug || !body?.title || !body?.conceptIntroduction) {
    return bad("sectionId OR certificationId, slug, title, conceptIntroduction are required");
  }
  try {
    const lesson = await db.lesson.create({
      data: {
        sectionId: body.sectionId || null,
        certificationId: body.certificationId || null,
        competencyId: body.competencyId || null,
        moduleId: body.moduleId || null,
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

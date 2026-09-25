import { db } from "@/lib/db";
import { bad, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  const difficulty = url.searchParams.get("difficulty");
  if (!sectionId) return bad("sectionId query param required");
  try {
    const questions = await db.question.findMany({
      where: {
        sectionId,
        ...(difficulty ? { difficulty } : {}),
      },
      orderBy: { createdAt: "asc" },
      include: { options: { orderBy: { order: "asc" } } },
    });
    return ok(questions);
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
  const { sectionId, lessonId, type, difficulty, bloomLevel, skillType, stem, explanation, options } = body ?? {};
  if (!sectionId || !type || !difficulty || !bloomLevel || !stem || !Array.isArray(options) || options.length < 2) {
    return bad("sectionId, type, difficulty, bloomLevel, stem and >=2 options are required");
  }
  if (!options.some((o: any) => o.isCorrect)) {
    return bad("At least one option must be marked correct");
  }
  try {
    const question = await db.question.create({
      data: {
        sectionId,
        lessonId: lessonId || null,
        type,
        difficulty,
        bloomLevel,
        skillType: skillType || null,
        stem,
        explanation: explanation || null,
        options: {
          create: options.map((o: any, i: number) => ({
            text: o.text,
            isCorrect: !!o.isCorrect,
            order: o.order ?? i,
          })),
        },
      },
      include: { options: { orderBy: { order: "asc" } } },
    });
    return ok(question, { status: 201 });
  } catch (e) {
    return serverError(String(e));
  }
}

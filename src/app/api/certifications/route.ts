import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/api-helpers";

export const revalidate = 3600; // ISR: cache knowledge content 1h (read-heavy, fast)

/** Full certification tree: certifications → domains → competencies, with
 * per-competency lesson/KO/question counts + overall readiness. */
export async function GET() {
  try {
    const certs = await db.certification.findMany({
      orderBy: { order: "asc" },
      include: {
        domains: {
          orderBy: { order: "asc" },
          include: {
            competencies: {
              orderBy: { order: "asc" },
              include: {
                _count: { select: { lessons: true, knowledgeObjects: true, questions: true } },
              },
            },
            _count: { select: { questions: true, knowledgeObjects: true } },
          },
        },
        standards: { include: { standard: true } },
        _count: { select: { lessons: true, questions: true, knowledgeObjects: true } },
      },
    });

    const readyQL = await db.question.groupBy({
      by: ["certificationId"],
      where: { status: "READY", certificationId: { not: null } },
      _count: { _all: true },
    });
    const readyQMap = new Map(readyQL.map((r) => [r.certificationId!, r._count._all]));

    const readyLessons = await db.lesson.groupBy({
      by: ["certificationId"],
      where: { status: "READY", certificationId: { not: null } },
      _count: { _all: true },
    });
    const readyLessonsMap = new Map(readyLessons.map((r) => [r.certificationId!, r._count._all]));

    const fullTemplateLessons = await db.lesson.groupBy({
      by: ["certificationId"],
      where: { sections: { not: null }, certificationId: { not: null } },
      _count: { _all: true },
    });
    const fullTemplateMap = new Map(fullTemplateLessons.map((r) => [r.certificationId!, r._count._all]));

    const tree = certs.map((c) => {
      const lessonsTotal = c._count.lessons;
      const lessonsReady = readyLessonsMap.get(c.id) ?? 0;
      const lessonsFull = fullTemplateMap.get(c.id) ?? 0;
      const questionsTotal = c._count.questions;
      const questionsReady = readyQMap.get(c.id) ?? 0;
      const kos = c._count.knowledgeObjects;
      const lT = lessonsTotal || 1;
      const readiness = Math.round(
        0.4 * ((lessonsFull / lT) * 100) +
          0.25 * ((lessonsReady / lT) * 100) +
          0.35 * (questionsTotal ? (questionsReady / questionsTotal) * 100 : 0),
      );
      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        fullName: c.fullName,
        body: c.body,
        currentVersion: c.currentVersion,
        bokReference: c.bokReference,
        description: c.description,
        color: c.color,
        icon: c.icon,
        order: c.order,
        group: c.group,
        domains: c.domains.map((d) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          weight: d.weight,
          order: d.order,
          description: d.description,
          competencyCount: d.competencies.length,
          questionCount: d._count.questions,
          koCount: d._count.knowledgeObjects,
          competencies: d.competencies.map((comp) => ({
            id: comp.id,
            name: comp.name,
            code: comp.code,
            description: comp.description,
            order: comp.order,
            lessonCount: comp._count.lessons,
            koCount: comp._count.knowledgeObjects,
            questionCount: comp._count.questions,
          })),
        })),
        standards: c.standards.map((cs) => ({
          slug: cs.standard.slug,
          name: cs.standard.name,
          organization: cs.standard.organization,
          number: cs.standard.number,
          version: cs.standard.version,
        })),
        lessonsTotal,
        lessonsReady,
        lessonsFullTemplate: lessonsFull,
        questionsTotal,
        questionsReady,
        koCount: kos,
        readiness,
      };
    });

    return ok(tree);
  } catch (e) {
    return serverError(String(e));
  }
}

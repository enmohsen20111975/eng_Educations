import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/api-helpers";
import { CONTENT_STATUSES } from "@/lib/spec";
import type { TrackerSummary, TrackerSection } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Coverage tracker: per-section per-lesson lifecycle status + readiness. */
export async function GET() {
  try {
    const sections = await db.section.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { _count: { select: { questions: true, knowledgeObjects: true } } },
        },
        _count: { select: { questions: true, knowledgeObjects: true, references: true } },
      },
    });

    const readyQ = await db.question.groupBy({
      by: ["sectionId"],
      where: { status: "READY" },
      _count: { _all: true },
    });
    const readyQMap = new Map(readyQ.map((r) => [r.sectionId, r._count._all]));

    const readyQL = await db.question.groupBy({
      by: ["lessonId"],
      where: { status: "READY" },
      _count: { _all: true },
    });
    const readyQLMap = new Map(readyQL.map((r) => [r.lessonId ?? "", r._count._all]));

    const trackerSections: TrackerSection[] = sections.map((s) => {
      const lessons = s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        status: l.status as any,
        hasFullTemplate: !!l.sections,
        koCount: l._count.knowledgeObjects,
        questionCount: l._count.questions,
        readyQuestions: readyQLMap.get(l.id) ?? 0,
      }));

      const lessonsReady = s.lessons.filter((l) => l.status === "READY").length;
      const lessonsFullTemplate = s.lessons.filter((l) => !!l.sections).length;
      const questionsTotal = s._count.questions;
      const questionsReady = readyQMap.get(s.id) ?? 0;
      const koCount = s._count.knowledgeObjects;
      const referencesCount = s._count.references;

      const LT = s.lessons.length || 1;
      const templatePct = (lessonsFullTemplate / LT) * 100;
      const readyLessonPct = (lessonsReady / LT) * 100;
      const readyQPct = questionsTotal ? (questionsReady / questionsTotal) * 100 : 0;
      const readiness = Math.round(
        0.4 * templatePct + 0.25 * readyLessonPct + 0.35 * readyQPct,
      );

      return {
        id: s.id,
        title: s.title,
        titleAr: s.titleAr,
        slug: s.slug,
        order: s.order,
        icon: s.icon,
        color: s.color,
        lessons,
        lessonsTotal: s.lessons.length,
        lessonsReady,
        lessonsFullTemplate,
        koCount,
        questionsTotal,
        questionsReady,
        referencesCount,
        readiness,
      };
    });

    const totals = {
      sections: sections.length,
      lessons: trackerSections.reduce((s, x) => s + x.lessonsTotal, 0),
      lessonsReady: trackerSections.reduce((s, x) => s + x.lessonsReady, 0),
      lessonsFullTemplate: trackerSections.reduce((s, x) => s + x.lessonsFullTemplate, 0),
      knowledgeObjects: trackerSections.reduce((s, x) => s + x.koCount, 0),
      questions: trackerSections.reduce((s, x) => s + x.questionsTotal, 0),
      questionsReady: trackerSections.reduce((s, x) => s + x.questionsReady, 0),
      references: trackerSections.reduce((s, x) => s + x.referencesCount, 0),
      overallReadiness: trackerSections.length
        ? Math.round(trackerSections.reduce((s, x) => s + x.readiness, 0) / trackerSections.length)
        : 0,
    };

    const lessonStatusCounts = await db.lesson.groupBy({ by: ["status"], _count: { _all: true } });
    const qStatusCounts = await db.question.groupBy({ by: ["status"], _count: { _all: true } });
    const byStatus = CONTENT_STATUSES.map((st) => ({
      status: st,
      lessons: lessonStatusCounts.find((x) => x.status === st)?._count._all ?? 0,
      questions: qStatusCounts.find((x) => x.status === st)?._count._all ?? 0,
    }));

    const summary: TrackerSummary = { sections: trackerSections, totals, byStatus };
    return ok(summary);
  } catch (e) {
    return serverError(String(e));
  }
}

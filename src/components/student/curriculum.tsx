"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  ListChecks,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  SectionIcon,
  PageLoader,
  EmptyState,
  ViewHeader,
} from "@/components/shared";
import { accentGradient, accentSoft } from "@/lib/student-key";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CurriculumView() {
  const store = useAppStore();
  const activeSectionId = store.activeSectionId;

  if (!activeSectionId) return <SectionsExplorer />;
  return <SectionDetail key={activeSectionId} sectionId={activeSectionId} />;
}

function SectionsExplorer() {
  const store = useAppStore();
  const [q, setQ] = React.useState("");
  const { data: sections, isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: api.sections,
  });

  const filtered = (sections || []).filter((s) =>
    (s.title + " " + (s.titleAr || "") + " " + s.description)
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );

  return (
    <div>
      <ViewHeader
        title="Curriculum"
        description="23 engineering disciplines, each with structured lessons, worked examples, key formulas, and exercises."
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search disciplines…"
              className="w-full pl-9 sm:w-64"
            />
          </div>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No disciplines match your search"
          description="Try a different keyword."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SectionListCard key={s.id} section={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionListCard({ section }: { section: any }) {
  const store = useAppStore();
  const grad = accentGradient(section.color);
  const soft = accentSoft(section.color);
  return (
    <Card className="group overflow-hidden p-0 transition-all hover:shadow-md hover:-translate-y-0.5">
      <button
        onClick={() => store.openSection(section.id)}
        className="flex w-full flex-col items-start p-5 text-left"
      >
        <div className="mb-3 flex w-full items-center justify-between">
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", grad)}>
            <SectionIcon name={section.icon} className="h-6 w-6" />
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            #{String(section.order).padStart(2, "0")}
          </span>
        </div>
        <h3 className="text-base font-semibold leading-snug">{section.title}</h3>
        {section.titleAr ? (
          <p className="mt-0.5 text-xs text-muted-foreground" dir="rtl">
            {section.titleAr}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {section.description}
        </p>
        <div className="mt-4 flex w-full items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> {section._count.lessons} lessons
          </span>
          <span className={cn("rounded-full px-2 py-0.5 font-semibold", soft)}>
            {section._count.questions} questions
          </span>
        </div>
      </button>
    </Card>
  );
}

function SectionDetail({ sectionId }: { sectionId: string }) {
  const store = useAppStore();
  const { data: section, isLoading } = useQuery({
    queryKey: ["section", sectionId],
    queryFn: () => api.section(sectionId),
  });

  if (isLoading) return <PageLoader label="Loading lessons…" />;
  if (!section)
    return (
      <EmptyState
        icon={BookOpen}
        title="Section not found"
        action={<Button onClick={() => store.openCurriculum()}>Back to curriculum</Button>}
      />
    );

  const grad = accentGradient(section.color);
  const soft = accentSoft(section.color);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => store.openCurriculum()}
        className="mb-4 gap-1"
      >
        <ArrowLeft className="h-4 w-4" /> All disciplines
      </Button>

      {/* Section header */}
      <Card className="relative mb-6 overflow-hidden p-0">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", grad)} aria-hidden />
        <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow", grad)}>
              <SectionIcon name={section.icon} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{section.title}</h1>
              {section.titleAr ? (
                <p className="text-sm text-muted-foreground" dir="rtl">{section.titleAr}</p>
              ) : null}
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{section.description}</p>
            </div>
          </div>
          <Button onClick={() => store.openQuiz(section.id)} className="gap-2 shrink-0">
            <ListChecks className="h-4 w-4" /> Quiz this section
          </Button>
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <span className="text-xs text-muted-foreground">
          {section.lessons.length} lessons · {section._count.questions} questions
        </span>
      </div>

      {section.lessons.length === 0 ? (
        <EmptyState icon={BookOpen} title="No lessons yet" description="Lessons will appear here once an admin adds them." />
      ) : (
        <div className="space-y-3">
          {section.lessons.map((lesson: any, idx: number) => (
            <Card
              key={lesson.id}
              className="group flex items-center gap-4 p-4 transition-all hover:shadow-md hover:border-primary/40"
            >
              <button
                onClick={() => store.openLesson(lesson.id, section.id)}
                className="flex w-full items-center gap-4 text-left"
              >
                <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold", soft)}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{lesson.title}</h3>
                  {lesson.titleAr ? (
                    <p className="text-xs text-muted-foreground" dir="rtl">{lesson.titleAr}</p>
                  ) : null}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {lesson.durationMin} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ListChecks className="h-3.5 w-3.5" /> {lesson._count?.questions ?? 0} questions
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

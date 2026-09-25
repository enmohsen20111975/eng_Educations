"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  ListChecks,
  Sigma,
  PenLine,
  BookText,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  MarkdownView,
  PageLoader,
  EmptyState,
  SectionIcon,
} from "@/components/shared";
import { accentGradient, accentSoft } from "@/lib/student-key";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LessonView() {
  const store = useAppStore();
  const lessonId = store.activeLessonId;

  if (!lessonId)
    return (
      <EmptyState
        icon={BookText}
        title="No lesson selected"
        action={<Button onClick={() => store.openCurriculum()}>Browse curriculum</Button>}
      />
    );

  return <LessonDetail key={lessonId} lessonId={lessonId} />;
}

function LessonDetail({ lessonId }: { lessonId: string }) {
  const store = useAppStore();
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => api.lesson(lessonId),
  });

  if (isLoading) return <PageLoader label="Loading lesson…" />;
  if (!lesson)
    return (
      <EmptyState
        icon={BookText}
        title="Lesson not found"
        action={<Button onClick={() => store.openCurriculum()}>Back</Button>}
      />
    );

  const { section, questions } = lesson;
  const grad = accentGradient(section?.color);
  const soft = accentSoft(section?.color);

  // sibling navigation
  const siblings: { id: string; title: string; order: number }[] =
    section?.lessons ?? [];
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => store.openSection(section.id)}
        className="mb-4 gap-1"
      >
        <ArrowLeft className="h-4 w-4" /> {section.title}
      </Button>

      {/* Lesson header */}
      <Card className="mb-6 overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", grad)}>
              <SectionIcon name={section.icon} className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section.title} · Lesson {String(idx + 1).padStart(2, "0")}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{lesson.title}</h1>
              {lesson.titleAr ? (
                <p className="text-sm text-muted-foreground" dir="rtl">{lesson.titleAr}</p>
              ) : null}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {lesson.durationMin} min read
                </span>
                {questions.length > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="h-3.5 w-3.5" /> {questions.length} practice questions
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <Button onClick={() => store.openQuiz(section.id)} className="gap-2 shrink-0">
            <ListChecks className="h-4 w-4" /> Quiz this section
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Concept introduction */}
          <Card className="p-5">
            <SectionLabel icon={BookText} label="Concept Introduction" soft={soft} />
            <div className="mt-3">
              <MarkdownView content={lesson.conceptIntroduction} />
            </div>
          </Card>

          {/* Example */}
          {lesson.example ? (
            <Card className="p-5">
              <SectionLabel icon={Lightbulb} label="Worked Example" soft={soft} />
              <div className="mt-3">
                <MarkdownView content={lesson.example} />
              </div>
            </Card>
          ) : null}

          {/* Exercise */}
          {lesson.exercise ? (
            <Card className="p-5">
              <SectionLabel icon={PenLine} label="Practice Exercise" soft={soft} />
              <div className="mt-3">
                <MarkdownView content={lesson.exercise} />
              </div>
            </Card>
          ) : null}
        </div>

        {/* Sidebar: key formulas + question preview */}
        <div className="space-y-6">
          {lesson.keyFormulas ? (
            <Card className="p-5">
              <SectionLabel icon={Sigma} label="Key Formulas & Facts" soft={soft} />
              <ul className="eng-scroll mt-3 max-h-72 space-y-2 overflow-y-auto pr-1 font-mono text-sm">
                {lesson.keyFormulas
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li
                      key={i}
                      className="rounded-lg bg-muted/60 px-3 py-2 text-[13px] leading-relaxed"
                    >
                      {line}
                    </li>
                  ))}
              </ul>
            </Card>
          ) : null}

          {questions.length > 0 ? (
            <Card className="p-5">
              <SectionLabel icon={ListChecks} label="Practice Questions" soft={soft} />
              <div className="eng-scroll mt-3 max-h-96 space-y-3 overflow-y-auto pr-1">
                {questions.slice(0, 6).map((q) => (
                  <div key={q.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium leading-snug">{q.stem}</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {q.options.map((o) => (
                        <li key={o.id} className={cn("flex items-center gap-1.5", o.isCorrect && "font-medium text-emerald-600 dark:text-emerald-400")}>
                          {o.isCorrect ? "✓" : "•"} {o.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-2"
                onClick={() => store.openQuiz(section.id)}
              >
                <ListChecks className="h-4 w-4" /> Take quiz ({questions.length})
              </Button>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Prev / Next */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {prev ? (
          <Button variant="outline" onClick={() => store.openLesson(prev.id, section.id)} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
          </Button>
        ) : (
          <span />
        )}
        <span className="text-xs text-muted-foreground">
          Lesson {idx + 1} of {siblings.length || idx + 1}
        </span>
        {next ? (
          <Button variant="outline" onClick={() => store.openLesson(next.id, section.id)} className="gap-2">
            <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  label,
  soft,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  soft: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", soft)}>
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-sm font-semibold uppercase tracking-wide">{label}</h2>
    </div>
  );
}

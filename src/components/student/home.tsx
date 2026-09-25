"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  ListChecks,
  Layers3,
  Database,
  Sparkles,
  Trophy,
  Target,
  PlayCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  SectionIcon,
  StatCard,
  PageLoader,
} from "@/components/shared";
import { accentGradient, accentSoft } from "@/lib/student-key";
import type { SectionWithCounts } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function HomeView() {
  const store = useAppStore();
  const { data: sections, isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: api.sections,
  });

  const totalQuestions = sections?.reduce((s, x) => s + x._count.questions, 0) ?? 0;
  const totalLessons = sections?.reduce((s, x) => s + x._count.lessons, 0) ?? 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <div className="eng-grid-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl" aria-hidden />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            23 engineering disciplines · Generation Matrix question bank
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Master engineering fundamentals,{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              one lesson &amp; quiz at a time
            </span>
            .
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            A structured curriculum across mechanical, civil, electrical and
            materials engineering — rich lessons with worked examples, key
            formulas, exercises, and a question bank driven by Bloom&rsquo;s
            taxonomy and difficulty levels.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={store.openCurriculum} className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Curriculum
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => store.openQuiz(null)}
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Take a Quiz
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={store.openProgress}
              className="gap-2"
            >
              <Trophy className="h-4 w-4" />
              My Progress
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Disciplines"
          value={sections?.length ?? "—"}
          icon={Layers3}
          hint="Engineering sections"
          accent="emerald"
        />
        <StatCard
          label="Lessons"
          value={totalLessons || "—"}
          icon={BookOpen}
          hint="With examples & exercises"
          accent="teal"
        />
        <StatCard
          label="Questions"
          value={totalQuestions || "—"}
          icon={ListChecks}
          hint="Across 3 difficulties"
          accent="cyan"
        />
        <StatCard
          label="Matrix Target"
          value="7,728"
          icon={Target}
          hint="Path to 5,000-question bank"
          accent="amber"
        />
      </section>

      {/* Sections grid */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Engineering disciplines
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap a discipline to explore its lessons and take practice quizzes.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={store.openCurriculum}
          >
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(sections || []).map((s) => (
              <SectionCard key={s.id} section={s} />
            ))}
          </div>
        )}
      </section>

      {/* Generation matrix teaser */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Database className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold">
                Question Generation Matrix
              </h3>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Every question is classified by section × difficulty × Bloom&rsquo;s
                level × type. The matrix documents how the bank scales toward a
                5,000-question target — and an Admin UI lets you add more from
                the browser.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => store.openAdmin("matrix")} className="gap-2 shrink-0">
            <Database className="h-4 w-4" />
            Open Matrix
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionCard({ section }: { section: SectionWithCounts }) {
  const store = useAppStore();
  const grad = accentGradient(section.color);
  const soft = accentSoft(section.color);
  return (
    <Card className="group relative overflow-hidden p-0 transition-all hover:shadow-md hover:-translate-y-0.5">
      <button
        onClick={() => store.openSection(section.id)}
        className="flex w-full flex-col items-start p-5 text-left"
      >
        <div className="mb-3 flex w-full items-center justify-between">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
              grad,
            )}
          >
            <SectionIcon name={section.icon} className="h-6 w-6" />
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              soft,
            )}
          >
            {section._count.questions} Q
          </span>
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          {section.title}
        </h3>
        {section.titleAr ? (
          <p className="mt-0.5 text-xs text-muted-foreground" dir="rtl">
            {section.titleAr}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {section.description}
        </p>
        <div className="mt-4 flex w-full items-center justify-between border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {section._count.lessons} lessons
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Explore <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </button>
    </Card>
  );
}

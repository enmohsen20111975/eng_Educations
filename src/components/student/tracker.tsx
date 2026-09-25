"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  Layers3,
  PlusCircle,
  Target,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  PageLoader,
  EmptyState,
  StatCard,
  ViewHeader,
  SectionIcon,
} from "@/components/shared";
import { STATUS_META } from "@/lib/spec";
import { accentGradient, accentSoft } from "@/lib/student-key";
import type { ContentStatus, TrackerSummary } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  circle: BookOpenCheck,
  alert: AlertTriangle,
  x: XCircle,
  check: CheckCircle2,
  eye: Eye,
};

export function TrackerView() {
  const { data, isLoading } = useQuery<TrackerSummary>({
    queryKey: ["tracker"],
    queryFn: api.tracker,
  });

  if (isLoading) return <PageLoader label="Loading coverage tracker…" />;
  if (!data) return <EmptyState icon={Target} title="Couldn't load tracker" />;

  return (
    <div className="space-y-8">
      <ViewHeader
        title="Coverage Tracker"
        description="Detailed progress across all 23 disciplines and their lessons — following the data-collector engine spec (24-section lessons, Knowledge Objects, sources, validation)."
      />

      {/* Summary */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Overall readiness"
          value={`${data.totals.overallReadiness}%`}
          icon={Target}
          hint="Weighted: template + READY + validated questions"
          accent="emerald"
        />
        <StatCard
          label="Full-template lessons"
          value={`${data.totals.lessonsFullTemplate}/${data.totals.lessons}`}
          icon={BookOpenCheck}
          hint="Upgraded to 24-section spec"
          accent="teal"
        />
        <StatCard
          label="Knowledge Objects"
          value={data.totals.knowledgeObjects}
          icon={Database}
          hint="Source-backed concept units"
          accent="cyan"
        />
        <StatCard
          label="Ready questions"
          value={`${data.totals.questionsReady}/${data.totals.questions}`}
          icon={CheckCircle2}
          hint="Validated & READY"
          accent="amber"
        />
      </section>

      {/* By status */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold">Content by lifecycle status</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {data.byStatus.map((row) => {
            const meta = STATUS_META[row.status as ContentStatus];
            const Icon = STATUS_ICON[meta.icon];
            return (
              <div key={row.status} className={cn("rounded-xl border border-border p-3", meta.tone)}>
                <Icon className="h-4 w-4" />
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">{meta.label}</p>
                <p className="mt-1 text-lg font-bold tabular-nums">{row.lessons} <span className="text-xs font-normal opacity-70">lessons</span></p>
                <p className="text-xs tabular-nums opacity-80">{row.questions} questions</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed table: sections × lessons */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">Disciplines × Lessons — detailed progress</h3>
          <p className="text-xs text-muted-foreground">
            Expand a discipline to see each lesson's status, Knowledge Objects, and validated questions.
          </p>
        </div>
        <div className="eng-scroll max-h-[70vh] overflow-y-auto">
          {data.sections.map((s) => (
            <SectionRow key={s.id} section={s} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function SectionRow({ section }: { section: TrackerSummary["sections"][number] }) {
  const [open, setOpen] = React.useState(false);
  const store = useAppStore();
  const grad = accentGradient(section.color);
  const soft = accentSoft(section.color);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-muted/30"
      >
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", grad)}>
          <SectionIcon name={section.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{section.title}</p>
            {section.lessonsFullTemplate === section.lessonsTotal && section.lessonsTotal > 0 ? (
              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">FULL SPEC</span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {section.lessonsTotal} lessons · {section.lessonsFullTemplate} full-template · {section.koCount} KOs · {section.questionsReady}/{section.questionsTotal} questions ready · {section.referencesCount} refs
          </p>
        </div>
        <div className="hidden w-40 shrink-0 sm:block">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Readiness</span>
            <span className="font-semibold tabular-nums">{section.readiness}%</span>
          </div>
          <Progress value={section.readiness} className="mt-1 h-1.5" />
        </div>
        <PlusCircle className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-45")} />
      </button>

      {open ? (
        <div className="bg-muted/20 px-5 pb-4">
          {section.lessons.length === 0 ? (
            <p className="py-3 text-xs text-muted-foreground">No lessons.</p>
          ) : (
            <div className="space-y-1.5">
              {section.lessons.map((l) => {
                const meta = STATUS_META[l.status as ContentStatus];
                const Icon = STATUS_ICON[meta.icon];
                return (
                  <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold", soft)}>
                      {String(l.order).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {l.koCount} KO · {l.questionCount} Q ({l.readyQuestions} ready) {l.hasFullTemplate ? "· 24-section ✓" : "· abbreviated"}
                      </p>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.tone)}>
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => store.openLesson(l.id, section.id)}
                    >
                      Open
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => store.openSection(section.id)} className="gap-1.5">
              <Layers3 className="h-3.5 w-3.5" /> Browse lessons
            </Button>
            <Button size="sm" variant="ghost" onClick={() => store.openAdmin("lessons")} className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Edit in Admin
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

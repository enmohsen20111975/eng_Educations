"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  ChevronDown,
  Database,
  Layers3,
  ListChecks,
  Target,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { PageLoader, SectionIcon, ViewHeader } from "@/components/shared";
import { accentGradient, accentSoft } from "@/lib/student-key";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const GROUP_META: Record<string, { icon: string; color: string; desc: string }> = {
  "Maintenance & Reliability": {
    icon: "Wrench",
    color: "emerald",
    desc: "Maintenance, reliability & asset management certifications (CMRP, CRE, CAMA, ISO 5500x) and reliability methods.",
  },
  "Project & Business": {
    icon: "TrendingUp",
    color: "teal",
    desc: "Project, program & business management (PMP, CAPM, MBA fundamentals, engineering economics).",
  },
  Quality: {
    icon: "Target",
    color: "cyan",
    desc: "Quality & process improvement (Six Sigma, Lean, SPC, DMAIC).",
  },
  "Engineering Fundamentals": {
    icon: "Calculator",
    color: "amber",
    desc: "Mathematics, physics, chemistry, mechanics — the quantitative backbone.",
  },
  Mechanical: {
    icon: "Flame",
    color: "rose",
    desc: "Thermodynamics, fluids, solid mechanics, heat transfer, vibrations, design, materials.",
  },
  "Civil & Construction": {
    icon: "Building2",
    color: "sky",
    desc: "Surveying, structures, geotechnical, transportation, hydraulics, environmental.",
  },
  "Electrical & Control": {
    icon: "Zap",
    color: "violet",
    desc: "Circuits, electronics, digital logic, control systems.",
  },
};

export function LibraryView() {
  const store = useAppStore();
  const { data: sections, isLoading: secLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: api.sections,
  });
  const { data: certs } = useQuery<any[]>({
    queryKey: ["certifications"],
    queryFn: api.certifications as any,
  });

  if (secLoading) return <PageLoader label="Loading library…" />;

  // Build groups: certs + sections bucketed by `group`.
  const buckets = new Map<
    string,
    { certs: any[]; sections: any[] }
  >();
  for (const c of certs || []) {
    const g = c.group || "Maintenance & Reliability";
    if (!buckets.has(g)) buckets.set(g, { certs: [], sections: [] });
    buckets.get(g)!.certs.push(c);
  }
  for (const s of sections || []) {
    const g = (s as any).group || "Engineering Fundamentals";
    if (!buckets.has(g)) buckets.set(g, { certs: [], sections: [] });
    buckets.get(g)!.sections.push(s);
  }

  // stable group order
  const ORDER = [
    "Maintenance & Reliability",
    "Project & Business",
    "Quality",
    "Engineering Fundamentals",
    "Mechanical",
    "Civil & Construction",
    "Electrical & Control",
  ];
  const groups = ORDER.filter((g) => buckets.has(g)).concat(
    Array.from(buckets.keys()).filter((g) => !ORDER.includes(g)),
  );

  return (
    <div className="space-y-8">
      <ViewHeader
        title="Knowledge Library"
        description="The complete scientific reference, grouped by subject domain. Each group holds its certifications (full BOKs) and engineering disciplines — with live readiness."
      />

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Groups" value={groups.length} />
        <Stat
          label="Certifications"
          value={(certs || []).length}
        />
        <Stat label="Disciplines" value={(sections || []).length} />
        <Stat
          label="Lessons (full-spec)"
          value={
            ((certs || []).reduce((s: number, c: any) => s + c.lessonsTotal, 0) +
              (sections || []).reduce(
                (s, x) => s + x._count.lessons,
                0,
              )) as number
          }
        />
      </section>

      {groups.map((g) => {
        const b = buckets.get(g)!;
        const meta = GROUP_META[g] || {
          icon: "Layers3",
          color: "emerald",
          desc: "",
        };
        const totalLessons =
          b.certs.reduce((s, c) => s + c.lessonsTotal, 0) +
          b.sections.reduce((s, x) => s + x._count.lessons, 0);
        const readyLessons =
          b.certs.reduce((s, c) => s + c.lessonsReady, 0);
        const readyQ =
          b.certs.reduce((s, c) => s + c.questionsReady, 0) +
          b.sections.reduce((s, x) => 0, 0); // section questions are DRAFT; count via sections? skip
        return (
          <GroupCard
            key={g}
            name={g}
            meta={meta}
            certs={b.certs}
            sections={b.sections}
            totalLessons={totalLessons}
            readyLessons={readyLessons}
          />
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </Card>
  );
}

function GroupCard({
  name,
  meta,
  certs,
  sections,
  totalLessons,
  readyLessons,
}: {
  name: string;
  meta: { icon: string; color: string; desc: string };
  certs: any[];
  sections: any[];
  totalLessons: number;
  readyLessons: number;
}) {
  const [open, setOpen] = React.useState(true);
  const store = useAppStore();
  const grad = accentGradient(meta.color);
  const soft = accentSoft(meta.color);
  const hasItems = certs.length + sections.length > 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", grad)} aria-hidden />
        <button
          onClick={() => hasItems && setOpen((o) => !o)}
          className="relative flex w-full items-center gap-4 p-5 text-left"
        >
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow", grad)}>
            <SectionIcon name={meta.icon} className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">{name}</h2>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", soft)}>
                {certs.length} cert{certs.length === 1 ? "" : "s"} · {sections.length} discipl{sections.length === 1 ? "ine" : "ines"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{meta.desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Lessons</p>
            <p className="text-xl font-bold tabular-nums">{readyLessons}/{totalLessons}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">ready</p>
          </div>
          {hasItems ? (
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", !open && "-rotate-90")} />
          ) : null}
        </button>
      </div>

      {open && hasItems ? (
        <div className="space-y-4 border-t border-border p-5">
          {certs.length > 0 ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Certifications</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {certs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => store.openCertifications()}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 hover:shadow-sm"
                  >
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", accentGradient(c.color))}>
                      <Award className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.name} · {c.body}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{c.fullName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums">{c.readiness}%</p>
                      <p className="text-[10px] text-muted-foreground">{c.lessonsReady}/{c.lessonsTotal} L · {c.questionsReady}/{c.questionsTotal} Q</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {sections.length > 0 ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Disciplines</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => store.openSection(s.id)}
                    className="group flex flex-col items-start rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="mb-2 flex w-full items-center justify-between">
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", accentGradient(s.color))}>
                        <SectionIcon name={s.icon} className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">#{String(s.order).padStart(2, "0")}</span>
                    </div>
                    <p className="text-sm font-semibold leading-snug">{s.title}</p>
                    {s.titleAr ? <p className="text-[11px] text-muted-foreground" dir="rtl">{s.titleAr}</p> : null}
                    <div className="mt-2 flex w-full items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" /> {s._count.lessons} lessons</span>
                      <span className={cn("rounded-full px-1.5 py-0.5 font-semibold", soft)}>{s._count.questions} Q</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

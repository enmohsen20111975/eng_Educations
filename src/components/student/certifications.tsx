"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  ChevronDown,
  Database,
  FileText,
  Layers3,
  ListChecks,
  PlusCircle,
  Target,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  PageLoader,
  EmptyState,
  StatCard,
  ViewHeader,
} from "@/components/shared";
import { accentGradient, accentSoft } from "@/lib/student-key";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CertTree {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  body: string;
  currentVersion: string;
  bokReference: string | null;
  description: string;
  color: string;
  icon: string;
  order: number;
  domains: {
    id: string;
    code: string | null;
    name: string;
    weight: number;
    order: number;
    description: string | null;
    competencyCount: number;
    questionCount: number;
    koCount: number;
    competencies: {
      id: string;
      name: string;
      code: string | null;
      description: string | null;
      order: number;
      lessonCount: number;
      koCount: number;
      questionCount: number;
    }[];
  }[];
  standards: { slug: string; name: string; organization: string; number: string; version: string | null }[];
  lessonsTotal: number;
  lessonsReady: number;
  lessonsFullTemplate: number;
  questionsTotal: number;
  questionsReady: number;
  koCount: number;
  readiness: number;
}

export function CertificationsView() {
  const { data, isLoading } = useQuery<CertTree[]>({
    queryKey: ["certifications"],
    queryFn: api.certifications as any,
  });

  if (isLoading) return <PageLoader label="Loading certifications…" />;
  if (!data || data.length === 0)
    return (
      <div>
        <ViewHeader
          title="Professional Certifications"
          description="The certification knowledge tracks — the core of the platform (CMRP, CRE, CAMA, PMP, Six Sigma, ISO 55000). Start: CMRP pilot."
        />
        <EmptyState
          icon={Award}
          title="No certifications modeled yet"
          description="Load the CMRP pilot structure via Admin → or the content pipeline."
        />
      </div>
    );

  const totals = {
    certifications: data.length,
    domains: data.reduce((s, c) => s + c.domains.length, 0),
    competencies: data.reduce((s, c) => s + c.domains.reduce((a, d) => a + d.competencyCount, 0), 0),
    lessons: data.reduce((s, c) => s + c.lessonsTotal, 0),
    questions: data.reduce((s, c) => s + c.questionsTotal, 0),
    kos: data.reduce((s, c) => s + c.koCount, 0),
    standards: data.reduce((s, c) => s + c.standards.length, 0),
    readiness: data.length ? Math.round(data.reduce((s, c) => s + c.readiness, 0) / data.length) : 0,
  };

  return (
    <div className="space-y-8">
      <ViewHeader
        title="Professional Certifications"
        description="The certification knowledge tracks — the core of the platform. CMRP is the pilot; the same engine ingests CRE, CAMA, PMP, Six Sigma, ISO 55000 next."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Certifications" value={totals.certifications} icon={Award} hint="Modeled BOKs" accent="emerald" />
        <StatCard label="BOK pillars" value={totals.domains} icon={Layers3} hint="Domains across certs" accent="teal" />
        <StatCard label="Competencies" value={totals.competencies} icon={Target} hint="BOK competencies" accent="cyan" />
        <StatCard label="Overall readiness" value={`${totals.readiness}%`} icon={BookOpen} hint="Cert content ready" accent="amber" />
      </section>

      {data.map((c) => (
        <CertCard key={c.id} cert={c} />
      ))}
    </div>
  );
}

function CertCard({ cert }: { cert: CertTree }) {
  const [open, setOpen] = React.useState(true);
  const store = useAppStore();
  const grad = accentGradient(cert.color);
  const soft = accentSoft(cert.color);

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className={cn("relative overflow-hidden p-6", )}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", grad)} aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow", grad)}>
              <Award className="h-7 w-7" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{cert.name}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{cert.body}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">v{cert.currentVersion}</span>
              </div>
              <p className="text-sm text-muted-foreground">{cert.fullName}</p>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{cert.description}</p>
              {cert.bokReference ? (
                <p className="mt-1 text-xs text-muted-foreground">BOK: {cert.bokReference}</p>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Readiness</p>
            <p className="text-3xl font-bold tabular-nums">{cert.readiness}%</p>
            <div className="mt-1 w-32">
              <Progress value={cert.readiness} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Coverage strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-border bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Layers3 className="h-3.5 w-3.5" /> {cert.domains.length} pillars</span>
        <span className="inline-flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {cert.domains.reduce((a, d) => a + d.competencyCount, 0)} competencies</span>
        <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {cert.lessonsTotal} lessons ({cert.lessonsReady} ready, {cert.lessonsFullTemplate} full-spec)</span>
        <span className="inline-flex items-center gap-1"><Database className="h-3.5 w-3.5" /> {cert.koCount} Knowledge Objects</span>
        <span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> {cert.questionsReady}/{cert.questionsTotal} ready questions</span>
        <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {cert.standards.length} standards</span>
      </div>

      {/* Standards chips */}
      {cert.standards.length > 0 ? (
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {cert.standards.map((s) => (
            <span key={s.slug} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", soft)}>
              {s.name} {s.version ? `(${s.version})` : ""} · {s.organization}
            </span>
          ))}
        </div>
      ) : null}

      {/* Domains */}
      <div className="p-6">
        <button
          onClick={() => setOpen((o) => !o)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", !open && "-rotate-90")} />
          Body of Knowledge — {cert.domains.length} pillars
        </button>
        {open ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {cert.domains.map((d) => (
              <DomainCard key={d.id} domain={d} grad={grad} soft={soft} />
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function DomainCard({
  domain,
  grad,
  soft,
}: {
  domain: CertTree["domains"][number];
  grad: string;
  soft: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 text-left">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-mono text-xs font-bold text-white", grad)}>
          {domain.code || String(domain.order).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{domain.name}</p>
            <span className="text-xs text-muted-foreground tabular-nums">~{domain.weight}%</span>
          </div>
          {domain.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{domain.description}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>{domain.competencyCount} competencies</span>
            <span>{domain.questionCount} Q</span>
            <span>{domain.koCount} KO</span>
          </div>
        </div>
        <PlusCircle className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-45")} />
      </button>
      {open ? (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
          {domain.competencies.map((c) => (
            <li key={c.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/40">
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold", soft)}>
                {String(c.order).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                {c.description ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2 text-[10px] text-muted-foreground">
                <span>{c.lessonCount}L</span>
                <span>{c.koCount}KO</span>
                <span>{c.questionCount}Q</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

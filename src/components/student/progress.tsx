"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Brain,
  CheckCircle2,
  Clock,
  Layers3,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { PageLoader, EmptyState, StatCard, ViewHeader } from "@/components/shared";
import type { ProgressSummary } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#f43f5e", "#8b5cf6"];

export function ProgressView() {
  const store = useAppStore();
  const { data, isLoading } = useQuery<ProgressSummary>({
    queryKey: ["progress"],
    queryFn: api.progress,
    refetchOnMount: true,
  });

  if (isLoading) return <PageLoader label="Loading your progress…" />;
  if (!data)
    return <EmptyState icon={Trophy} title="Couldn't load progress" />;

  if (data.totalAttempts === 0)
    return (
      <div>
        <ViewHeader title="My Progress" description="Track quiz attempts, accuracy by discipline, and growth over time." />
        <EmptyState
          icon={Trophy}
          title="No quiz attempts yet"
          description="Take your first quiz to start building your progress dashboard."
          action={
            <button
              onClick={() => store.openQuiz(null)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Take a quiz
            </button>
          }
        />
      </div>
    );

  return (
    <div className="space-y-8">
      <ViewHeader
        title="My Progress"
        description="Track quiz attempts, accuracy by discipline, and growth over time."
      />

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Quizzes taken"
          value={data.totalAttempts}
          icon={CheckCircle2}
          hint="Completed attempts"
          accent="emerald"
        />
        <StatCard
          label="Questions answered"
          value={data.totalQuestionsAnswered}
          icon={Brain}
          hint={`${data.totalCorrect} correct`}
          accent="teal"
        />
        <StatCard
          label="Average accuracy"
          value={`${data.averageScore}%`}
          icon={Target}
          hint="Across all quizzes"
          accent="cyan"
        />
        <StatCard
          label="Disciplines covered"
          value={data.sectionsCovered}
          icon={Layers3}
          hint="Distinct sections attempted"
          accent="amber"
        />
      </section>

      {/* Best section highlight */}
      {data.bestSection ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow">
                <Award className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Strongest discipline
                </p>
                <p className="text-lg font-bold">{data.bestSection.section.title}</p>
                <p className="text-sm text-muted-foreground">
                  {data.bestSection.accuracy}% accuracy · {data.bestSection.attempts}{" "}
                  attempt{data.bestSection.attempts === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <button
              onClick={() => store.openSection(data.bestSection!.section.id)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Continue this section
            </button>
          </div>
        </Card>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" /> Accuracy over time
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Correct answers per day (last 14 days)
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="correct" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Correct" />
                <Line type="monotone" dataKey="attempts" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Attempts" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4 text-primary" /> Accuracy by difficulty
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Where are you strongest?</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byDifficulty} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="difficulty" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }}
                />
                <Bar dataKey="correct" radius={[6, 6, 0, 0]} name="Correct">
                  {data.byDifficulty.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="attempts" radius={[6, 6, 0, 0]} fill="#cbd5e1" name="Attempts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* By section */}
      <Card className="p-5">
        <h3 className="mb-1 text-sm font-semibold">Accuracy by discipline</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Disciplines you've attempted, ranked by accuracy.
        </p>
        <div className="eng-scroll max-h-80 space-y-3 overflow-y-auto pr-1">
          {data.bySection.map((row) => (
            <div key={row.section.id} className="flex items-center gap-3">
              <div className="w-40 shrink-0 truncate text-sm font-medium">
                {row.section.title}
              </div>
              <Progress value={row.accuracy} className="h-2.5 flex-1" />
              <div className="w-24 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {row.accuracy}% · {row.attempts}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent attempts */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary" /> Recent attempts
        </h3>
        <div className="eng-scroll max-h-96 overflow-y-auto pr-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Discipline</th>
                <th className="py-2 pr-4 font-medium">Score</th>
                <th className="py-2 pr-4 font-medium">Accuracy</th>
                <th className="py-2 pr-4 font-medium">Duration</th>
                <th className="py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAttempts.map((a) => {
                const acc = a.totalQuestions
                  ? Math.round((a.score / a.totalQuestions) * 100)
                  : 0;
                return (
                  <tr key={a.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4">
                      {a.section ? a.section.title : "Mixed"}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">
                      {a.score}/{a.totalQuestions}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          acc >= 70
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : acc >= 50
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {acc}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground tabular-nums">
                      {Math.max(1, Math.round(a.durationSec / 60))}m
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(a.completedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

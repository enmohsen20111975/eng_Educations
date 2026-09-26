"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListChecks,
  RefreshCw,
  Trophy,
  XCircle,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  DifficultyBadge,
  BloomBadge,
  TypeBadge,
  PageLoader,
  EmptyState,
  ViewHeader,
} from "@/components/shared";
import type {
  Difficulty,
  QuizStartResponse,
  QuizSubmitResponse,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Phase = "config" | "active" | "results";

export function QuizView() {
  const store = useAppStore();
  const [phase, setPhase] = React.useState<Phase>("config");
  const [config, setConfig] = React.useState<{
    sectionId: string;
    difficulty: string;
    count: number;
  }>({
    sectionId: store.quizSectionId || "all",
    difficulty: store.quizDifficulty || "all",
    count: 10,
  });
  const [quiz, setQuiz] = React.useState<QuizStartResponse | null>(null);
  const [result, setResult] = React.useState<QuizSubmitResponse | null>(null);

  // Reset phase when entering quiz view fresh
  React.useEffect(() => {
    if (store.quizSectionId) setConfig((c) => ({ ...c, sectionId: store.quizSectionId! }));
  }, [store.quizSectionId]);

  const startMutation = useMutation({
    mutationFn: (cfg: { sectionId: string; difficulty: string; count: number }) =>
      api.startQuiz({
        sectionId: cfg.sectionId === "all" ? undefined : cfg.sectionId,
        difficulty: cfg.difficulty === "all" ? undefined : cfg.difficulty,
        count: cfg.count,
      }),
    onSuccess: (data) => {
      setQuiz(data);
      setResult(null);
      setPhase("active");
    },
    onError: (e: any) => toast.error(e.message || "Failed to start quiz"),
  });

  const submitMutation = useMutation({
    mutationFn: api.submitQuiz,
    onSuccess: (data) => {
      setResult(data);
      setPhase("results");
    },
    onError: (e: any) => toast.error(e.message || "Failed to submit quiz"),
  });

  if (phase === "config")
    return (
      <QuizConfig
        config={config}
        setConfig={setConfig}
        onStart={() => startMutation.mutate(config)}
        loading={startMutation.isPending}
      />
    );
  if (phase === "active" && quiz)
    return (
      <QuizActive
        quiz={quiz}
        onCancel={() => {
          setQuiz(null);
          setPhase("config");
        }}
        onSubmit={(answers) =>
          submitMutation.mutate({ attemptId: quiz.attemptId, answers })
        }
        submitting={submitMutation.isPending}
      />
    );
  if (phase === "results" && result && quiz)
    return (
      <QuizResults
        result={result}
        quiz={quiz}
        onRetake={() => {
          setQuiz(null);
          setResult(null);
          setPhase("config");
        }}
        onProgress={store.openProgress}
      />
    );
  return null;
}

// ---------------------------------------------------------------- Config

function QuizConfig({
  config,
  setConfig,
  onStart,
  loading,
}: {
  config: { sectionId: string; difficulty: string; count: number };
  setConfig: React.Dispatch<
    React.SetStateAction<{ sectionId: string; difficulty: string; count: number }>
  >;
  onStart: () => void;
  loading: boolean;
}) {
  const { data: sections, isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: api.sections,
  });
  const store = useAppStore();

  const selectedSection = (sections || []).find(
    (s) => s.id === config.sectionId,
  );
  const estMinutes = Math.ceil((config.count * 45) / 60);

  return (
    <div>
      <ViewHeader
        title="Practice Quiz"
        description="Configure your quiz by discipline, difficulty, and length. Questions are drawn from the Generation Matrix question bank."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block text-sm font-medium">Discipline</Label>
              {isLoading ? (
                <PageLoader label="Loading disciplines…" />
              ) : (
                <Select
                  value={config.sectionId}
                  onValueChange={(v) => setConfig((c) => ({ ...c, sectionId: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All disciplines (mixed)</SelectItem>
                    {sections!.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Difficulty</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["all", "Easy", "Medium", "Hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      config.difficulty === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent",
                    )}
                  >
                    {d === "all" ? "Mixed" : d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-medium">Number of questions</Label>
                <span className="text-sm font-semibold tabular-nums">
                  {config.count}
                </span>
              </div>
              <Slider
                value={[config.count]}
                min={5}
                max={30}
                step={5}
                onValueChange={(v) => setConfig((c) => ({ ...c, count: v[0] }))}
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>~{estMinutes} min</span>
                <span>30</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
            <Button onClick={onStart} disabled={loading} className="gap-2">
              <ListChecks className="h-4 w-4" />
              {loading ? "Starting…" : "Start Quiz"}
            </Button>
            {selectedSection ? (
              <Button
                variant="outline"
                onClick={() => store.openSection(selectedSection.id)}
              >
                Review lessons first
              </Button>
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Quiz tips
          </div>
          <ul className="eng-scroll mt-3 max-h-80 list-disc space-y-2 overflow-y-auto pr-4 text-sm text-muted-foreground">
            <li>Each question has exactly one correct answer.</li>
            <li>Questions are sampled randomly — no two quizzes are identical.</li>
            <li>Difficulty affects Bloom&rsquo;s taxonomy depth.</li>
            <li>Your score is saved to this device for progress tracking.</li>
            <li>Review explanations after submitting to learn from misses.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Active

interface AnswerMap {
  [questionId: string]: { optionId: string | null; timeSpentSec: number };
}

function QuizActive({
  quiz,
  onCancel,
  onSubmit,
  submitting,
}: {
  quiz: QuizStartResponse;
  onCancel: () => void;
  onSubmit: (answers: {
    questionId: string;
    selectedOptionId: string | null;
    timeSpentSec: number;
  }[]) => void;
  submitting: boolean;
}) {
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const qStartRef = React.useRef<number>(Date.now());

  const current = quiz.questions[idx];
  const answered = Object.keys(answers).length;
  const progress = (answered / quiz.questions.length) * 100;

  const recordAnswer = (optionId: string | null) => {
    const elapsed = Math.round((Date.now() - qStartRef.current) / 1000);
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { optionId, timeSpentSec: elapsed },
    }));
  };

  const goNext = () => {
    recordAnswer(answers[current.id]?.optionId ?? null);
    if (idx < quiz.questions.length - 1) {
      setIdx((i) => i + 1);
      qStartRef.current = Date.now();
    }
  };

  const goPrev = () => {
    if (idx > 0) {
      setIdx((i) => i - 1);
      qStartRef.current = Date.now();
    }
  };

  const handleSubmit = () => {
    // record current timing
    const elapsed = Math.round((Date.now() - qStartRef.current) / 1000);
    const finalAnswers = { ...answers };
    if (current && !finalAnswers[current.id]) {
      finalAnswers[current.id] = { optionId: null, timeSpentSec: elapsed };
    } else if (current && finalAnswers[current.id]) {
      finalAnswers[current.id] = {
        ...finalAnswers[current.id],
        timeSpentSec: (finalAnswers[current.id].timeSpentSec || 0) + elapsed,
      };
    }
    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: finalAnswers[q.id]?.optionId ?? null,
      timeSpentSec: finalAnswers[q.id]?.timeSpentSec ?? 0,
    }));
    onSubmit(payload);
  };

  const currentSelection = answers[current.id]?.optionId ?? null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Exit quiz
        </Button>
        <div className="text-sm text-muted-foreground">
          Question{" "}
          <span className="font-semibold text-foreground">{idx + 1}</span> of{" "}
          {quiz.questions.length}
        </div>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>{answered} answered</span>
          <span>{quiz.questions.length - answered} remaining</span>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <DifficultyBadge value={current.difficulty} />
          <BloomBadge value={current.bloomLevel} />
          <TypeBadge value={current.type} />
          {current.skillType ? (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {current.skillType}
            </span>
          ) : null}
        </div>

        <h2 className="text-lg font-semibold leading-snug sm:text-xl">
          {current.stem}
        </h2>

        <RadioGroup
          value={currentSelection ?? ""}
          onValueChange={(v) => recordAnswer(v)}
          className="mt-5 space-y-2"
        >
          {current.options.map((o, i) => {
            const selected = currentSelection === o.id;
            return (
              <label
                key={o.id}
                htmlFor={o.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-accent/40",
                )}
              >
                <RadioGroupItem value={o.id} id={o.id} className="mt-0.5" />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-xs font-semibold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm leading-snug">{o.text}</span>
              </label>
            );
          })}
        </RadioGroup>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={goPrev} disabled={idx === 0} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        {idx < quiz.questions.length - 1 ? (
          <Button onClick={goNext} className="gap-2">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? "Submitting…" : "Submit Quiz"} <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Results

function QuizResults({
  result,
  quiz,
  onRetake,
  onProgress,
}: {
  result: QuizSubmitResponse;
  quiz: QuizStartResponse;
  onRetake: () => void;
  onProgress: () => void;
}) {
  const pct = result.totalQuestions
    ? Math.round((result.score / result.totalQuestions) * 100)
    : 0;
  const pass = pct >= 70;
  const mins = Math.max(1, Math.round(result.durationSec / 60));

  return (
    <div>
      <ViewHeader title="Quiz Results" description="Review your answers and learn from the explanations." />

      {/* Score hero */}
      <Card className={cn("mb-6 overflow-hidden p-0", pass ? "" : "")}>
        <div className={cn("flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left", pass ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10" : "bg-gradient-to-br from-amber-500/10 to-rose-500/10")}>
          <div className="flex items-center gap-4">
            <span className={cn("flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg", pass ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-amber-500 to-orange-600")}>
              <Trophy className="h-8 w-8" />
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {pass ? "Well done!" : "Keep practicing"}
              </p>
              <p className="text-4xl font-bold tabular-nums">
                {result.score}
                <span className="text-2xl text-muted-foreground">/{result.totalQuestions}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {pct}% correct · {mins} min · {pass ? "Passed" : "Below 70%"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onRetake} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retake
            </Button>
            <Button variant="outline" onClick={onProgress} className="gap-2">
              <Clock className="h-4 w-4" /> View progress
            </Button>
          </div>
        </div>
      </Card>

      {/* Per-question review */}
      <div className="space-y-4">
        {quiz.questions.map((q, i) => {
          const res = result.results.find((r) => r.questionId === q.id);
          const selected = res?.selectedOptionId ?? null;
          const correctId = res?.correctOptionId ?? null;
          return (
            <Card key={q.id} className="p-5">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    res?.isCorrect
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                  )}
                >
                  {res?.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Question {i + 1}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug">
                    {q.stem}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {q.options.map((o) => {
                      const isCorrect = o.id === correctId;
                      const isSelected = o.id === selected;
                      return (
                        <div
                          key={o.id}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                            isCorrect
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : isSelected
                                ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : "border-border text-muted-foreground",
                          )}
                        >
                          {isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : isSelected ? <XCircle className="h-4 w-4 shrink-0" /> : <span className="w-4" />}
                          <span>{o.text}</span>
                          {isCorrect ? <span className="ml-auto text-xs font-medium">Correct answer</span> : isSelected ? <span className="ml-auto text-xs font-medium">Your answer</span> : null}
                        </div>
                      );
                    })}
                  </div>
                  {res?.explanation ? (
                    <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">Explanation: </span>
                      {res.explanation}
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

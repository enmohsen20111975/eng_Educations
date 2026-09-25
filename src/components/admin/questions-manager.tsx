"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ListChecks, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import {
  BloomBadge,
  DifficultyBadge,
  EmptyState,
  PageLoader,
  TypeBadge,
} from "@/components/shared";
import type { Lesson, Question, QuestionOption, Section } from "@/lib/types";
import {
  BLOOM_LEVELS,
  DIFFICULTIES,
  QUESTION_TYPES,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OptionRow { id?: string; text: string; isCorrect: boolean }
interface FormState {
  sectionId: string;
  lessonId: string;
  type: "MultipleChoice" | "TrueFalse";
  difficulty: "Easy" | "Medium" | "Hard";
  bloomLevel: "Remember" | "Understand" | "Apply" | "Analyze";
  skillType: string;
  stem: string;
  explanation: string;
  options: OptionRow[];
}

const emptyMC: FormState = {
  sectionId: "", lessonId: "", type: "MultipleChoice", difficulty: "Easy",
  bloomLevel: "Understand", skillType: "Conceptual", stem: "", explanation: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
};
const emptyTF: FormState = {
  sectionId: "", lessonId: "", type: "TrueFalse", difficulty: "Easy",
  bloomLevel: "Remember", skillType: "Definitional", stem: "", explanation: "",
  options: [
    { text: "True", isCorrect: true },
    { text: "False", isCorrect: false },
  ],
};

export function QuestionsManager() {
  const qc = useQueryClient();
  const { data: sections } = useQuery<Section[]>({
    queryKey: ["sections-raw"],
    queryFn: async () => (await api.sections()) as unknown as Section[],
  });
  const [sectionId, setSectionId] = React.useState<string>("");
  React.useEffect(() => {
    if (!sectionId && sections && sections.length > 0) setSectionId(sections[0].id);
  }, [sections, sectionId]);

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: ["lessons", sectionId],
    queryFn: () => api.lessonsBySection(sectionId),
    enabled: !!sectionId,
  });
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["questions", sectionId],
    queryFn: () => api.questions({ sectionId }),
    enabled: !!sectionId,
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Question | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyMC);
  const [delId, setDelId] = React.useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: async (vals: FormState) => {
      const payload = {
        sectionId: vals.sectionId,
        lessonId: vals.lessonId || null,
        type: vals.type,
        difficulty: vals.difficulty,
        bloomLevel: vals.bloomLevel,
        skillType: vals.skillType || null,
        stem: vals.stem,
        explanation: vals.explanation || null,
        options: vals.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, order: i })),
      };
      if (editing) return api.updateQuestion(editing.id, payload);
      return api.createQuestion(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Question updated" : "Question created");
      qc.invalidateQueries({ queryKey: ["questions", sectionId] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["matrix"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message || "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => api.deleteQuestion(id),
    onSuccess: () => {
      toast.success("Question deleted");
      qc.invalidateQueries({ queryKey: ["questions", sectionId] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["matrix"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Delete failed"),
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyMC, sectionId });
    setOpen(true);
  };
  const startEdit = (q: Question) => {
    setEditing(q);
    setForm({
      sectionId: q.sectionId,
      lessonId: q.lessonId || "",
      type: q.type, difficulty: q.difficulty, bloomLevel: q.bloomLevel,
      skillType: q.skillType || "", stem: q.stem, explanation: q.explanation || "",
      options: q.options.map((o: QuestionOption) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
    });
    setOpen(true);
  };

  const setType = (t: "MultipleChoice" | "TrueFalse") => {
    setForm((f) => {
      if (t === "TrueFalse")
        return { ...f, type: t, options: [{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }] };
      const has4 = f.options.length >= 4;
      return {
        ...f, type: t,
        options: has4 ? f.options.slice(0, 4) : [
          ...f.options,
          ...Array.from({ length: 4 - f.options.length }, () => ({ text: "", isCorrect: false })),
        ],
      };
    });
  };

  const setOptionText = (i: number, text: string) =>
    setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { ...o, text } : o)) }));
  const setCorrect = (i: number) =>
    setForm((f) => ({ ...f, options: f.options.map((o, idx) => ({ ...o, isCorrect: idx === i })) }));
  const addOption = () =>
    setForm((f) => ({ ...f, options: [...f.options, { text: "", isCorrect: false }] }));
  const removeOption = (i: number) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));

  const valid =
    form.stem.trim() &&
    form.options.filter((o) => o.text.trim()).length >= 2 &&
    form.options.some((o) => o.isCorrect && o.text.trim());

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger><SelectValue placeholder="Choose section" /></SelectTrigger>
            <SelectContent>
              {(sections || []).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={startCreate} disabled={!sectionId} className="gap-2">
          <Plus className="h-4 w-4" /> New question
        </Button>
      </div>

      {!sectionId ? (
        <EmptyState icon={ListChecks} title="Pick a section" description="Select a discipline to manage its questions." />
      ) : isLoading ? (
        <PageLoader />
      ) : !questions || questions.length === 0 ? (
        <EmptyState icon={ListChecks} title="No questions yet" description="Create the first question for this section." action={<Button onClick={startCreate} className="gap-2"><Plus className="h-4 w-4" /> New question</Button>} />
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <DifficultyBadge value={q.difficulty} />
                    <BloomBadge value={q.bloomLevel} />
                    <TypeBadge value={q.type} />
                    {q.skillType ? <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{q.skillType}</span> : null}
                  </div>
                  <p className="text-sm font-medium leading-snug">{q.stem}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {q.options.map((o) => (
                      <span key={o.id} className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5", o.isCorrect && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium")}>
                        {o.isCorrect ? <Check className="h-3 w-3" /> : null}{o.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(q)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDelId(q.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit question" : "New question"}</DialogTitle>
            <DialogDescription>
              Classify by difficulty, Bloom&rsquo;s level, and type — this feeds the Generation Matrix.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="qstem">Question stem</Label>
              <Textarea id="qstem" value={form.stem} onChange={(e) => setForm((f) => ({ ...f, stem: e.target.value }))} rows={2} placeholder="The question text…" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t === "MultipleChoice" ? "MCQ" : "True/False"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bloom level</Label>
                <Select value={form.bloomLevel} onValueChange={(v) => setForm((f) => ({ ...f, bloomLevel: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOOM_LEVELS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Skill type</Label>
                <Input value={form.skillType} onChange={(e) => setForm((f) => ({ ...f, skillType: e.target.value }))} placeholder="Conceptual" />
              </div>
            </div>
            {lessons && lessons.length > 0 ? (
              <div>
                <Label>Linked lesson (optional)</Label>
                <Select value={form.lessonId || "none"} onValueChange={(v) => setForm((f) => ({ ...f, lessonId: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific lesson</SelectItem>
                    {lessons.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {/* Options editor */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Answer options</Label>
                {form.type === "MultipleChoice" ? (
                  <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add option</Button>
                ) : null}
              </div>
              <div className="space-y-2">
                {form.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrect(i)}
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        o.isCorrect ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "border-border text-muted-foreground hover:border-emerald-500/50",
                      )}
                      title="Mark as correct"
                    >
                      {o.isCorrect ? <Check className="h-4 w-4" /> : <span className="text-xs">{String.fromCharCode(65 + i)}</span>}
                    </button>
                    <Input
                      value={o.text}
                      onChange={(e) => setOptionText(i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      disabled={form.type === "TrueFalse"}
                      className="flex-1"
                    />
                    {form.type === "MultipleChoice" && form.options.length > 2 ? (
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeOption(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {form.type === "TrueFalse" ? "True/False uses fixed options." : "Click the circle to mark the correct answer. Min 2 options."}
              </p>
            </div>

            <div>
              <Label htmlFor="qexp">Explanation</Label>
              <Textarea id="qexp" value={form.explanation} onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))} rows={2} placeholder="Why is the correct answer correct?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !valid}>
              {saveMut.isPending ? "Saving…" : editing ? "Save changes" : "Create question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>This removes it from the question bank and the Generation Matrix counts.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => delId && delMut.mutate(delId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

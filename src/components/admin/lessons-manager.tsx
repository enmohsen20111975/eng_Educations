"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Clock, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState, PageLoader } from "@/components/shared";
import type { Lesson, Section } from "@/lib/types";
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

interface FormState {
  sectionId: string;
  slug: string;
  title: string;
  titleAr: string;
  order: number;
  conceptIntroduction: string;
  example: string;
  keyFormulas: string;
  exercise: string;
  durationMin: number;
}

const empty: FormState = {
  sectionId: "", slug: "", title: "", titleAr: "", order: 0,
  conceptIntroduction: "", example: "", keyFormulas: "", exercise: "", durationMin: 15,
};

export function LessonsManager() {
  const qc = useQueryClient();
  const { data: sections } = useQuery<Section[]>({
    queryKey: ["sections-raw"],
    queryFn: async () => {
      const list = await api.sections();
      return list as unknown as Section[];
    },
  });
  const [sectionId, setSectionId] = React.useState<string>("");
  React.useEffect(() => {
    if (!sectionId && sections && sections.length > 0) setSectionId(sections[0].id);
  }, [sections, sectionId]);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", sectionId],
    queryFn: () => api.lessonsBySection(sectionId),
    enabled: !!sectionId,
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Lesson | null>(null);
  const [form, setForm] = React.useState<FormState>(empty);
  const [delId, setDelId] = React.useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: async (vals: FormState) => {
      if (editing) return api.updateLesson(editing.id, vals);
      return api.createLesson(vals);
    },
    onSuccess: () => {
      toast.success(editing ? "Lesson updated" : "Lesson created");
      qc.invalidateQueries({ queryKey: ["lessons", sectionId] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message || "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => api.deleteLesson(id),
    onSuccess: () => {
      toast.success("Lesson deleted");
      qc.invalidateQueries({ queryKey: ["lessons", sectionId] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Delete failed"),
  });

  const slugify = (t: string) =>
    t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const startCreate = () => {
    setEditing(null);
    setForm({
      ...empty,
      sectionId,
      order: (lessons?.length ?? 0) + 1,
    });
    setOpen(true);
  };
  const startEdit = (l: Lesson) => {
    setEditing(l);
    setForm({
      sectionId: l.sectionId, slug: l.slug, title: l.title, titleAr: l.titleAr || "",
      order: l.order, conceptIntroduction: l.conceptIntroduction,
      example: l.example || "", keyFormulas: l.keyFormulas || "",
      exercise: l.exercise || "", durationMin: l.durationMin,
    });
    setOpen(true);
  };

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
          <Plus className="h-4 w-4" /> New lesson
        </Button>
      </div>

      {!sectionId ? (
        <EmptyState icon={BookOpen} title="Pick a section" description="Select a discipline above to manage its lessons." />
      ) : isLoading ? (
        <PageLoader />
      ) : !lessons || lessons.length === 0 ? (
        <EmptyState icon={BookOpen} title="No lessons yet" description="Create the first lesson for this section." action={<Button onClick={startCreate} className="gap-2"><Plus className="h-4 w-4" /> New lesson</Button>} />
      ) : (
        <div className="space-y-3">
          {lessons.map((l, i) => (
            <Card key={l.id} className="flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-sm">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{l.title}</p>
                {l.titleAr ? <p className="text-xs text-muted-foreground" dir="rtl">{l.titleAr}</p> : null}
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {l.durationMin} min</span>
                  <span className="inline-flex items-center gap-1"><ListChecks className="h-3 w-3" /> {l._count?.questions ?? 0} Q</span>
                  <span className="font-mono">{l.slug}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(l)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDelId(l.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit lesson" : "New lesson"}</DialogTitle>
            <DialogDescription>
              Each lesson includes a concept introduction, worked example, key formulas, and an exercise — richer than introduction-only content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ltitle">Title</Label>
                <Input id="ltitle" value={form.title} onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, title: v, slug: editing ? f.slug : slugify(v) }));
                }} placeholder="e.g. Vectors and Matrices" />
              </div>
              <div>
                <Label htmlFor="ltitlear">Title (Arabic)</Label>
                <Input id="ltitlear" value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2">
                <Label htmlFor="lslug">Slug</Label>
                <Input id="lslug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="font-mono text-sm" />
              </div>
              <div>
                <Label htmlFor="lorder">Order</Label>
                <Input id="lorder" type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="ldur" className="shrink-0">Duration (min)</Label>
              <Input id="ldur" type="number" value={form.durationMin} onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))} className="w-28" />
            </div>
            <div>
              <Label htmlFor="lci">Concept introduction</Label>
              <Textarea id="lci" value={form.conceptIntroduction} onChange={(e) => setForm((f) => ({ ...f, conceptIntroduction: e.target.value }))} rows={5} placeholder="Core theory. Use - for bullets, `code` for formulas, **bold** for emphasis." className="font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="lex">Worked example</Label>
              <Textarea id="lex" value={form.example} onChange={(e) => setForm((f) => ({ ...f, example: e.target.value }))} rows={4} placeholder="A solved problem demonstrating the concept." className="font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="lkf">Key formulas & facts</Label>
              <Textarea id="lkf" value={form.keyFormulas} onChange={(e) => setForm((f) => ({ ...f, keyFormulas: e.target.value }))} rows={4} placeholder="One formula per line, e.g. σ = F / A" className="font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="lxr">Practice exercise</Label>
              <Textarea id="lxr" value={form.exercise} onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))} rows={3} placeholder="A prompt for the learner to solve." className="font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => saveMut.mutate(form)}
              disabled={saveMut.isPending || !form.title || !form.slug || !form.conceptIntroduction}
            >
              {saveMut.isPending ? "Saving…" : editing ? "Save changes" : "Create lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lesson?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the lesson. Questions linked to it will be unlinked but kept.</AlertDialogDescription>
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

"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Layers3 } from "lucide-react";
import { api } from "@/lib/api";
import { SectionIcon, EmptyState, PageLoader } from "@/components/shared";
import { accentGradient } from "@/lib/student-key";
import type { Section } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const ICON_OPTIONS = [
  "Calculator", "Atom", "FlaskConical", "Thermometer", "Waves", "Layers",
  "Move3d", "Zap", "Cpu", "Binary", "SlidersHorizontal", "Gem", "Wrench",
  "Settings2", "Flame", "Activity", "Ruler", "Building2", "Mountain", "Car",
  "Leaf", "Droplets", "TrendingUp",
];
const COLOR_OPTIONS = [
  "emerald", "cyan", "lime", "orange", "sky", "violet", "teal", "amber",
  "fuchsia", "indigo", "rose", "red",
];

interface FormState {
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

const empty: FormState = {
  slug: "", title: "", titleAr: "", description: "",
  icon: "Calculator", color: "emerald", order: 0,
};

export function SectionsManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: api.sections,
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Section | null>(null);
  const [form, setForm] = React.useState<FormState>(empty);
  const [delId, setDelId] = React.useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: async (vals: FormState) => {
      if (editing) return api.updateSection(editing.id, vals);
      return api.createSection(vals);
    },
    onSuccess: () => {
      toast.success(editing ? "Section updated" : "Section created");
      qc.invalidateQueries({ queryKey: ["sections"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message || "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => api.deleteSection(id),
    onSuccess: () => {
      toast.success("Section deleted");
      qc.invalidateQueries({ queryKey: ["sections"] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message || "Delete failed"),
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ ...empty, order: (data?.length ?? 0) + 1 });
    setOpen(true);
  };
  const startEdit = (s: Section) => {
    setEditing(s);
    setForm({
      slug: s.slug, title: s.title, titleAr: s.titleAr || "", description: s.description,
      icon: s.icon, color: s.color, order: s.order,
    });
    setOpen(true);
  };

  const slugify = (t: string) =>
    t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data?.length ?? 0} sections · target is 23 disciplines
        </p>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New section
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={Layers3} title="No sections yet" description="Create the first engineering discipline." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Discipline</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Lessons</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Questions</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white", accentGradient(s.color))}>
                          <SectionIcon name={s.icon} className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium">{s.title}</p>
                          {s.titleAr ? <p className="text-xs text-muted-foreground" dir="rtl">{s.titleAr}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.slug}</td>
                    <td className="hidden px-4 py-3 md:table-cell tabular-nums">{s._count.lessons}</td>
                    <td className="hidden px-4 py-3 md:table-cell tabular-nums">{s._count.questions}</td>
                    <td className="px-4 py-3 tabular-nums">{s.order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDelId(s.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit section" : "New section"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the discipline details." : "Define a new engineering discipline for the curriculum."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title" value={form.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, title: v, slug: editing ? f.slug : slugify(v) }));
                }}
                placeholder="e.g. Engineering Mathematics"
              />
            </div>
            <div>
              <Label htmlFor="titleAr">Title (Arabic, optional)</Label>
              <Input id="titleAr" value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} dir="rtl" placeholder="الهندسة الرياضية" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="engineering-mathematics" className="font-mono text-sm" />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="One or two sentences describing this discipline." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Color</Label>
                <Select value={form.color} onValueChange={(v) => setForm((f) => ({ ...f, color: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => saveMut.mutate(form)}
              disabled={saveMut.isPending || !form.title || !form.slug || !form.description}
            >
              {saveMut.isPending ? "Saving…" : editing ? "Save changes" : "Create section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the section and all its lessons and questions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => delId && delMut.mutate(delId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

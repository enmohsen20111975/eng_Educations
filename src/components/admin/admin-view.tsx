"use client";

import * as React from "react";
import { BookOpen, Database, ListChecks, Layers3 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ViewHeader } from "@/components/shared";
import { SectionsManager } from "./sections-manager";
import { LessonsManager } from "./lessons-manager";
import { QuestionsManager } from "./questions-manager";
import { MatrixDashboard } from "./matrix-dashboard";

const TABS = [
  { id: "sections", label: "Sections", icon: Layers3 },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "questions", label: "Questions", icon: ListChecks },
  { id: "matrix", label: "Generation Matrix", icon: Database },
] as const;

export function AdminView() {
  const store = useAppStore();
  const tab = store.adminTab;

  return (
    <div>
      <ViewHeader
        title="Admin Console"
        description="Add, edit, and remove curriculum content directly from the browser. The database supports this natively — changes persist immediately."
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => store.setAdminTab(t.id)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "sections" && <SectionsManager />}
      {tab === "lessons" && <LessonsManager />}
      {tab === "questions" && <QuestionsManager />}
      {tab === "matrix" && <MatrixDashboard />}
    </div>
  );
}

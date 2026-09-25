"use client";

import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { HomeView } from "@/components/student/home";
import { CurriculumView } from "@/components/student/curriculum";
import { LessonView } from "@/components/student/lesson-viewer";
import { QuizView } from "@/components/student/quiz";
import { ProgressView } from "@/components/student/progress";
import { AdminView } from "@/components/admin/admin-view";

export default function Home() {
  const view = useAppStore((s) => s.view);

  return (
    <AppShell>
      {view === "home" && <HomeView />}
      {view === "curriculum" && <CurriculumView />}
      {view === "lesson" && <LessonView />}
      {view === "quiz" && <QuizView />}
      {view === "progress" && <ProgressView />}
      {view === "admin" && <AdminView />}
    </AppShell>
  );
}

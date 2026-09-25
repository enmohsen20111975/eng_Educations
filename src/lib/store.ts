"use client";

import { create } from "zustand";

export type View =
  | "home"
  | "curriculum"
  | "lesson"
  | "quiz"
  | "progress"
  | "admin"
  | "tracker";

interface AppState {
  view: View;
  /** contextual ids for the current view */
  activeSectionId: string | null;
  activeLessonId: string | null;
  activeQuestionId: string | null;
  /** admin sub-tab */
  adminTab: "sections" | "lessons" | "questions" | "matrix";
  /** quiz config carried into the quiz view */
  quizSectionId: string | null;
  quizDifficulty: string | null;

  setView: (v: View) => void;
  openCurriculum: () => void;
  openSection: (sectionId: string) => void;
  openLesson: (lessonId: string, sectionId?: string) => void;
  openQuiz: (sectionId: string | null, difficulty?: string | null) => void;
  openProgress: () => void;
  openAdmin: (tab?: AppState["adminTab"]) => void;
  openTracker: () => void;
  openHome: () => void;
  setAdminTab: (tab: AppState["adminTab"]) => void;
  setActiveQuestionId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  activeSectionId: null,
  activeLessonId: null,
  activeQuestionId: null,
  adminTab: "sections",
  quizSectionId: null,
  quizDifficulty: null,

  setView: (v) => set({ view: v }),
  openHome: () => set({ view: "home" }),
  openCurriculum: () => set({ view: "curriculum" }),
  openSection: (sectionId) =>
    set({ view: "curriculum", activeSectionId: sectionId }),
  openLesson: (lessonId, sectionId) =>
    set((s) => ({
      view: "lesson",
      activeLessonId: lessonId,
      activeSectionId: sectionId ?? s.activeSectionId,
    })),
  openQuiz: (sectionId, difficulty) =>
    set({ view: "quiz", quizSectionId: sectionId, quizDifficulty: difficulty ?? null }),
  openProgress: () => set({ view: "progress" }),
  openAdmin: (tab) =>
    set({ view: "admin", adminTab: tab ?? "sections" }),
  openTracker: () => set({ view: "tracker" }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setActiveQuestionId: (id) => set({ activeQuestionId: id }),
}));

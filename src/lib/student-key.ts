import type { Difficulty, BloomLevel, QuestionType } from "./types";

/**
 * Stable per-device student key. We persist a random key in localStorage so a
 * learner's quiz history sticks to this device without requiring auth.
 */
export const STUDENT_KEY_STORAGE = "eng_edu_student_key";
export const STUDENT_NAME_STORAGE = "eng_edu_student_name";

export function getStudentKey(): string {
  if (typeof window === "undefined") return "server";
  let k = window.localStorage.getItem(STUDENT_KEY_STORAGE);
  if (!k) {
    k =
      "sk_" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36).slice(-4);
    window.localStorage.setItem(STUDENT_KEY_STORAGE, k);
  }
  return k;
}

export function getStudentName(): string {
  if (typeof window === "undefined") return "Engineer";
  return (
    window.localStorage.getItem(STUDENT_NAME_STORAGE) || "Engineer"
  );
}

export function setStudentName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDENT_NAME_STORAGE, name);
}

/** Tailwind gradient classes per accent color used by sections. */
export const ACCENT_GRADIENTS: Record<string, string> = {
  emerald: "from-emerald-500 to-teal-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-pink-500",
  violet: "from-violet-500 to-purple-500",
  cyan: "from-cyan-500 to-sky-500",
  lime: "from-lime-500 to-green-500",
  fuchsia: "from-fuchsia-500 to-pink-500",
  indigo: "from-indigo-500 to-blue-500",
  teal: "from-teal-500 to-emerald-500",
  orange: "from-orange-500 to-amber-500",
  sky: "from-sky-500 to-cyan-500",
  red: "from-red-500 to-rose-500",
};

export function accentGradient(color?: string | null): string {
  if (!color) return ACCENT_GRADIENTS.emerald;
  return ACCENT_GRADIENTS[color] || ACCENT_GRADIENTS.emerald;
}

/** Tailwind soft chip classes per accent color. */
export const ACCENT_SOFT: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  lime: "bg-lime-500/10 text-lime-600 dark:text-lime-400",
  fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function accentSoft(color?: string | null): string {
  if (!color) return ACCENT_SOFT.emerald;
  return ACCENT_SOFT[color] || ACCENT_SOFT.emerald;
}

export const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export const BLOOM_STYLE: Record<BloomLevel, string> = {
  Remember: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Understand: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  Apply: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Analyze: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

export const TYPE_STYLE: Record<QuestionType, string> = {
  MultipleChoice: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  TrueFalse: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
};

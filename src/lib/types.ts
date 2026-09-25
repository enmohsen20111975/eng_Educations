// Shared TypeScript types mirroring the Prisma models (client-safe subset).

export type Difficulty = "Easy" | "Medium" | "Hard";
export type BloomLevel = "Remember" | "Understand" | "Apply" | "Analyze";
export type QuestionType = "MultipleChoice" | "TrueFalse";

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
export const BLOOM_LEVELS: BloomLevel[] = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
];
export const QUESTION_TYPES: QuestionType[] = [
  "MultipleChoice",
  "TrueFalse",
];

export interface Section {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  description: string;
  icon: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  sectionId: string;
  slug: string;
  title: string;
  titleAr: string | null;
  order: number;
  conceptIntroduction: string;
  example: string | null;
  keyFormulas: string | null;
  exercise: string | null;
  durationMin: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id: string;
  sectionId: string;
  lessonId: string | null;
  type: QuestionType;
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  skillType: string | null;
  stem: string;
  explanation: string | null;
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
}

export interface SectionWithCounts extends Section {
  _count: { lessons: number; questions: number };
}

export interface LessonWithCounts extends Lesson {
  section?: Section;
  _count?: { questions: number };
}

export interface MatrixCell {
  sectionId: string;
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  type: QuestionType;
  targetCount: number;
  currentCount: number;
}

export interface QuizStartResponse {
  attemptId: string;
  questions: Question[];
  totalQuestions: number;
}

export interface QuizSubmitResponse {
  attemptId: string;
  score: number;
  totalQuestions: number;
  durationSec: number;
  results: {
    questionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
    correctOptionId: string | null;
  }[];
}

export interface QuizAttemptRow {
  id: string;
  studentId: string | null;
  sectionId: string | null;
  studentKey: string;
  startedAt: string;
  completedAt: string | null;
  score: number;
  totalQuestions: number;
  durationSec: number;
  section?: Section | null;
}

export interface ProgressSummary {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  averageScore: number;
  sectionsCovered: number;
  bestSection: { section: Section; accuracy: number; attempts: number } | null;
  recentAttempts: QuizAttemptRow[];
  bySection: {
    section: Section;
    attempts: number;
    correct: number;
    total: number;
    accuracy: number;
  }[];
  byDifficulty: { difficulty: Difficulty; attempts: number; correct: number }[];
  timeline: { day: string; attempts: number; correct: number }[];
}

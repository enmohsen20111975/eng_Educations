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
  sectionId: string | null;
  slug: string;
  title: string;
  titleAr: string | null;
  order: number;
  conceptIntroduction: string;
  example: string | null;
  keyFormulas: string | null;
  exercise: string | null;
  durationMin: number;
  // v2
  sections: string | null; // JSON string of the 24-section template
  referenceIds: string | null; // JSON string[] of Reference ids
  status: ContentStatus;
  version: string;
  confidence: string; // LOW|MEDIUM|HIGH
  verificationStatus: string; // PENDING|VERIFIED|FAILED|HUMAN_REVIEW_REQUIRED
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContentStatus =
  | "DRAFT"
  | "REQUIRES_RESEARCH"
  | "NOT_READY"
  | "READY"
  | "HUMAN_REVIEW_REQUIRED";

export interface KnowledgeObject {
  id: string;
  sectionId: string | null;
  lessonId: string | null;
  title: string;
  domain: string | null;
  competency: string | null;
  topic: string | null;
  concept: string | null;
  body: string; // JSON string
  version: string;
  confidence: string;
  verificationStatus: string;
  status: ContentStatus;
  referenceIds: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reference {
  id: string;
  sectionId: string | null;
  title: string;
  level: string;
  levelLabel: string;
  type: string;
  url: string | null;
  citation: string;
  createdAt: string;
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
  sectionId: string | null;
  lessonId: string | null;
  type: QuestionType;
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  cognitiveLevel: string | null;
  skillType: string | null;
  certificationId: string | null;
  domainId: string | null;
  competencyId: string | null;
  stem: string;
  explanation: string | null;
  // v2 enrichment
  whyCorrect: string | null;
  whyOthersWrong: string | null; // JSON string[]
  referenceIds: string | null; // JSON string[]
  knowledgeObjectId: string | null;
  status: ContentStatus;
  verificationStatus: string;
  version: string;
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
  sectionId: string | null;
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  type: QuestionType;
  targetCount: number;
  currentCount: number;
}

/** A row of the Coverage Tracker: one section with per-lesson + aggregate
 * lifecycle status, Knowledge Object and question counts, and a readiness % */
export interface TrackerLesson {
  id: string;
  title: string;
  order: number;
  status: ContentStatus;
  hasFullTemplate: boolean; // sections JSON present (24-section upgrade)
  koCount: number;
  questionCount: number;
  readyQuestions: number;
}
export interface TrackerSection {
  id: string;
  title: string;
  titleAr: string | null;
  slug: string;
  order: number;
  icon: string;
  color: string;
  lessons: TrackerLesson[];
  // aggregates
  lessonsTotal: number;
  lessonsReady: number; // status === READY
  lessonsFullTemplate: number; // upgraded to 24-section spec
  koCount: number;
  questionsTotal: number;
  questionsReady: number;
  referencesCount: number;
  readiness: number; // 0..100 (weighted: lessons ready + full-template + ready questions)
}
export interface TrackerSummary {
  sections: TrackerSection[];
  totals: {
    sections: number;
    lessons: number;
    lessonsReady: number;
    lessonsFullTemplate: number;
    knowledgeObjects: number;
    questions: number;
    questionsReady: number;
    references: number;
    overallReadiness: number;
  };
  byStatus: { status: ContentStatus; lessons: number; questions: number }[];
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
    explanation: string | null;
  }[];
}

export interface QuizAttemptRow {
  id: string;
  studentId: string | null;
  sectionId: string | null;
  certificationId: string | null;
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

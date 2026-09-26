import type {
  Lesson,
  MatrixCell,
  ProgressSummary,
  Question,
  QuizAttemptRow,
  QuizStartResponse,
  QuizSubmitResponse,
  Section,
  SectionWithCounts,
  TrackerSummary,
  KnowledgeObject,
  Reference,
} from "./types";
import { getStudentKey } from "./student-key";

/** Build headers, automatically attaching the per-device student key. */
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", ...(extra || {}) };
  if (typeof window !== "undefined") {
    h["x-student-key"] = getStudentKey();
  }
  return h;
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${t}`);
  }
  return (await res.json()) as T;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${t}`);
  }
  return (await res.json()) as T;
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${t}`);
  }
  return (await res.json()) as T;
}

export async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${t}`);
  }
}

// ---- High-level helpers (typed wrappers around the API) ----

export const api = {
  sections: () => apiGet<SectionWithCounts[]>("/api/sections"),
  section: (id: string) => apiGet<Section & { lessons: Lesson[] }>("/api/sections/" + id),
  createSection: (data: Partial<Section>) => apiPost<Section>("/api/sections", data),
  updateSection: (id: string, data: Partial<Section>) => apiPut<Section>("/api/sections/" + id, data),
  deleteSection: (id: string) => apiDelete("/api/sections/" + id),

  lessonsBySection: (sectionId: string) => apiGet<Lesson[]>(`/api/lessons?sectionId=${sectionId}`),
  lessonsByCompetency: (competencyId: string) =>
    apiGet<Lesson[]>(`/api/lessons?competencyId=${competencyId}`),
  lessonsByCertification: (certificationId: string) =>
    apiGet<Lesson[]>(`/api/lessons?certificationId=${certificationId}`),
  lesson: (id: string) => apiGet<Lesson & { section: Section | null; certification: any; competency: any; questions: Question[] }>(`/api/lessons/${id}`),
  createLesson: (data: Partial<Lesson>) => apiPost<Lesson>("/api/lessons", data),
  updateLesson: (id: string, data: Partial<Lesson>) => apiPut<Lesson>("/api/lessons/" + id, data),
  deleteLesson: (id: string) => apiDelete("/api/lessons/" + id),

  questions: (params: { sectionId?: string; difficulty?: string }) =>
    apiGet<Question[]>(`/api/questions?${new URLSearchParams(params as any).toString()}`),
  question: (id: string) => apiGet<Question & { section: Section; lesson: Lesson | null }>("/api/questions/" + id),
  createQuestion: (data: any) => apiPost<Question>("/api/questions", data),
  updateQuestion: (id: string, data: any) => apiPut<Question>("/api/questions/" + id, data),
  deleteQuestion: (id: string) => apiDelete("/api/questions/" + id),

  matrix: () => apiGet<MatrixCell[]>("/api/matrix"),
  upsertMatrixCell: (data: Partial<MatrixCell>) => apiPost<MatrixCell>("/api/matrix", data),

  tracker: () => apiGet<TrackerSummary>("/api/tracker"),
  certifications: () =>
    apiGet<any[]>("/api/certifications"), // CertTree[]
  loadReferenceContent: (sectionSlug: string) =>
    apiPost<any>("/api/admin/load-reference", { sectionSlug }),

  references: (sectionId: string) =>
    apiGet<Reference[]>(`/api/references?sectionId=${sectionId}`),
  createReference: (data: Partial<Reference>) => apiPost<Reference>("/api/references", data),
  knowledgeObjects: (sectionId: string) =>
    apiGet<KnowledgeObject[]>(`/api/knowledge-objects?sectionId=${sectionId}`),

  updateLessonStatus: (id: string, data: { status?: string; confidence?: string; verificationStatus?: string; version?: string }) =>
    apiPut<Lesson>(`/api/lessons/${id}/status`, data),
  updateQuestionStatus: (id: string, data: { status?: string; verificationStatus?: string; version?: string }) =>
    apiPut<Question>(`/api/questions/${id}/status`, data),

  startQuiz: (body: { sectionId?: string; certificationId?: string; difficulty?: string; count?: number }) =>
    apiPost<QuizStartResponse>("/api/quiz/start", body),
  submitQuiz: (body: {
    attemptId: string;
    answers: { questionId: string; selectedOptionId: string | null; timeSpentSec: number }[];
  }) => apiPost<QuizSubmitResponse>("/api/quiz/submit", body),

  attempts: () => apiGet<QuizAttemptRow[]>("/api/attempts"),
  progress: () => apiGet<ProgressSummary>("/api/progress"),
};

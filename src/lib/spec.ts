// Data-collector engine spec constants (from the Universal Professional
// Education Knowledge Engine master spec). Shared by content generators,
// the lesson viewer, the admin editors, and the coverage tracker.

/** The 24-section lesson template (spec §9). Each lesson's `sections` JSON is
 * keyed by these ids; values are strings or "NOT_APPLICABLE". */
export const LESSON_TEMPLATE: { id: string; label: string; group: string }[] = [
  { id: "learning_objectives", label: "Learning Objectives", group: "Plan" },
  { id: "prerequisites", label: "Prerequisites", group: "Plan" },
  { id: "introduction", label: "Introduction", group: "Plan" },
  { id: "terminology", label: "Terminology", group: "Plan" },
  { id: "detailed_explanation", label: "Detailed Explanation", group: "Core" },
  { id: "core_principles", label: "Core Principles", group: "Core" },
  { id: "components", label: "Components", group: "Core" },
  { id: "process", label: "Process", group: "Core" },
  { id: "formula_calculation", label: "Formula / Calculation", group: "Core" },
  { id: "worked_example", label: "Worked Example", group: "Application" },
  { id: "industrial_example", label: "Industrial Example", group: "Application" },
  { id: "case_study", label: "Case Study", group: "Application" },
  { id: "visual_explanation", label: "Visual Explanation", group: "Application" },
  { id: "simulation_opportunity", label: "Simulation Opportunity", group: "Application" },
  { id: "common_mistakes", label: "Common Mistakes", group: "Review" },
  { id: "limitations", label: "Limitations", group: "Review" },
  { id: "comparison", label: "Comparison", group: "Review" },
  { id: "practical_application", label: "Practical Application", group: "Review" },
  { id: "decision_scenario", label: "Decision Scenario", group: "Review" },
  { id: "practice_questions", label: "Practice Questions", group: "Assess" },
  { id: "certification_questions", label: "Certification Questions", group: "Assess" },
  { id: "summary", label: "Summary", group: "Assess" },
  { id: "key_takeaways", label: "Key Takeaways", group: "Assess" },
  { id: "references", label: "References", group: "Assess" },
];

/** Knowledge Object body fields (spec §7). */
export const KO_FIELDS: { id: string; label: string }[] = [
  { id: "definitions", label: "Definitions" },
  { id: "principles", label: "Principles" },
  { id: "components", label: "Components" },
  { id: "mechanism", label: "Mechanism" },
  { id: "process", label: "Process" },
  { id: "formulas", label: "Formulas" },
  { id: "metrics", label: "Metrics" },
  { id: "examples", label: "Examples" },
  { id: "industrial_examples", label: "Industrial Examples" },
  { id: "case_studies", label: "Case Studies" },
  { id: "common_errors", label: "Common Errors" },
  { id: "limitations", label: "Limitations" },
  { id: "best_practices", label: "Best Practices" },
  { id: "related_concepts", label: "Related Concepts" },
  { id: "prerequisites", label: "Prerequisites" },
  { id: "references", label: "References" },
];

/** Source hierarchy (spec §5). */
export const SOURCE_LEVELS: { level: number; label: string }[] = [
  { level: 1, label: "Official Certification Body" },
  { level: 2, label: "Official Standard / Standards Organization" },
  { level: 3, label: "Official Body of Knowledge / Handbook / Exam Outline" },
  { level: 4, label: "Peer-reviewed Academic Research" },
  { level: 5, label: "Professional Organizations" },
  { level: 6, label: "University / Academic Publications" },
  { level: 7, label: "Technical Publications / Industry Sources" },
  { level: 8, label: "Vendor Technical Documentation" },
  { level: 9, label: "Secondary Educational Sources" },
];

/** Content lifecycle statuses (spec §1, §6, §22). */
export const CONTENT_STATUSES = [
  "DRAFT",
  "REQUIRES_RESEARCH",
  "NOT_READY",
  "READY",
  "HUMAN_REVIEW_REQUIRED",
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const STATUS_META: Record<
  ContentStatus,
  { label: string; tone: string; icon: "circle" | "alert" | "x" | "check" | "eye" }
> = {
  DRAFT: {
    label: "Draft",
    tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    icon: "circle",
  },
  REQUIRES_RESEARCH: {
    label: "Needs Research",
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: "alert",
  },
  NOT_READY: {
    label: "Not Ready",
    tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    icon: "x",
  },
  READY: {
    label: "Ready",
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: "check",
  },
  HUMAN_REVIEW_REQUIRED: {
    label: "Human Review",
    tone: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    icon: "eye",
  },
};

export const VERIFICATION_META: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Pending", tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  VERIFIED: { label: "Verified", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  FAILED: { label: "Failed", tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  HUMAN_REVIEW_REQUIRED: {
    label: "Human Review",
    tone: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  },
};

/** Cognitive levels for question diversity (spec §15). */
export const COGNITIVE_LEVELS = [
  "Recall",
  "Understanding",
  "Application",
  "Analysis",
  "Evaluation",
  "Calculation",
  "Scenario",
  "DecisionMaking",
] as const;

/** Industry contexts (spec §11). */
export const INDUSTRY_CONTEXTS = [
  "Manufacturing",
  "Oil & Gas",
  "Power",
  "Mining",
  "Automotive",
  "Chemical",
  "Healthcare",
  "Container Terminal",
  "Utilities",
  "Construction",
  "IT",
  "Services",
] as const;

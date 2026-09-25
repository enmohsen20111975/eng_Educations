// =============================================================================
// Six Sigma (ASQ/IASSC) — Improve (I) domain
// CONTENT-only deep scientific reference (Task ID 17-SS-IMPROVE).
//
// Certification slug: "six-sigma" (body ASQ/IASSC, group "Quality"). Domain
// code: "I" (Improve) — the 4th of 5 DMAIC BOK domains (D, M, A, I, C). The
// Six Sigma certification + 5 DMAIC domains EXIST (created by
// src/lib/ref-content/six-sigma.ts, the combined structure + Measure/Analyze
// content loader). The Improve (I) domain exists with NO competencies — THIS
// loader creates them.
//
// This CONTENT-only loader mirrors src/lib/ref-content/cre-reliability-modeling.ts:
//   1) find Six Sigma cert by slug "six-sigma"; find Improve domain by code "I".
//   2) deleteMany existing I competencies, then create 3 I competencies.
//   3) Map competencies by NAME -> id.
//   4) Upsert References (global by title).
//   5) Per lesson findFirst({competencyId, slug}) then update/create with
//      sectionId=null, certificationId, competencyId, READY/HIGH/VERIFIED/
//      v1.0.0, sections JSON, referenceIds JSON.
//   6) Upsert KnowledgeObject per lesson (findFirst by lessonId).
//   7) deleteMany questions {certificationId, competencyId} then create each
//      enriched question with nested QuestionOption records.
//   8) Return counts.
//
// IMPORTANT: this loader does NOT call six-sigma.ts or wipe other DMAIC domains
// (Define, Measure, Analyze, Control). It operates on the Improve (I) domain
// ONLY — the 3 I competencies are created here, and 3 lessons/KOs/12 questions
// are loaded. The existing Measure and Analyze competencies and lessons
// authored in six-sigma.ts are untouched.
//
// Three lessons, one per Improve competency (created below in loadReference()):
//   1. Design of Experiments (DOE)              (slug: ss-design-of-experiments)
//   2. Response Surface & Optimization         (slug: ss-response-surface-methods)
//   3. Poka-Yoke & Mistake-Proofing            (slug: ss-poka-yoke-mistake-proofing)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional Improve-phase content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     (definitions, principles, components, mechanism, process, formulas,
//     metrics, examples, industrial_examples, case_studies, common_errors,
//     limitations, best_practices, related_concepts, prerequisites,
//     references) populated with real content.
//   - 4 enriched questions (3 MCQ + 1 TrueFalse per lesson; 12 total)
//     with whyCorrect + one whyOthersWrong per distractor + cognitiveLevel
//     + skillType + scenario/industry metadata.
//
// Real sources (6 — do NOT invent; spec §5 source hierarchy levels 3, 6, 7):
//   1. ASQ Six Sigma Black Belt Body of Knowledge           (L3, BOK)
//   2. ASQ Six Sigma Green Belt Body of Knowledge           (L3, BOK)
//   3. Douglas C. Montgomery, "Design and Analysis of
//      Experiments" (10th ed., Wiley)                        (L6, BOOK)
//   4. Douglas C. Montgomery, "Statistical Quality Control"
//      (7th ed., Wiley)                                       (L6, BOOK)
//   5. Forrest W. Breyfogle III, "Implementing Six Sigma"
//      (2nd ed., Wiley)                                       (L7, BOOK)
//   6. Shigeo Shingo, "Zero Quality Control: Source Inspection
//      and the Poka-Yoke System" (Productivity Press)        (L7, BOOK)
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material is
// summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Competency, Lesson, KnowledgeObject, Question,
// Reference) is upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre-reliability-modeling.ts & six-sigma.ts)
// ---------------------------------------------------------------------------

export interface RefOption {
  text: string;
  isCorrect: boolean;
}

export interface RefQuestion {
  competencyName: string;
  type: "MultipleChoice" | "TrueFalse";
  difficulty: "Easy" | "Medium" | "Hard";
  bloomLevel: "Remember" | "Understand" | "Apply" | "Analyze";
  cognitiveLevel: string; // Recall|Understanding|Application|Analysis|Evaluation|Calculation|Scenario|DecisionMaking
  skillType?: string; // Definitional|Conceptual|Numerical|Procedural
  scenario?: string; // Manufacturing|Oil & Gas|Power|Chemical|Automotive|...
  stem: string;
  explanation?: string;
  whyCorrect: string;
  whyOthersWrong: string[];
  options: RefOption[];
}

export interface RefLesson {
  competencyName: string;
  slug: string;
  title: string;
  titleAr?: string;
  order: number;
  durationMin: number;
  conceptIntroduction: string;
  example?: string;
  keyFormulas?: string;
  exercise?: string;
  /** Titles of RefSource entries this lesson cites. */
  references: string[];
  /** The 24-section template (spec §9); values are markdown-ish strings or "NOT_APPLICABLE". */
  sections: Record<string, string>;
  knowledgeObject: {
    title: string;
    domain: string;
    competency: string;
    topic: string;
    concept: string;
    body: Record<string, any>;
  };
  questions: RefQuestion[];
}

export interface RefSource {
  title: string;
  level: string; // "1".."9"
  levelLabel: string;
  type: string; // BOOK|STANDARD|HANDBOOK|PAPER|WEBSITE|BOK|EXAM_OUTLINE
  url?: string;
  citation: string;
}

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all 3 Improve lessons.
// ---------------------------------------------------------------------------

export const SS_IMPROVE_SOURCES: RefSource[] = [
  {
    title: "ASQ Six Sigma Black Belt Body of Knowledge",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-black-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Black Belt (CSSBB) Body of Knowledge — the official ASQ competency framework assessed by the CSSBB exam, organized across the DMAIC phases (Define, Measure, Analyze, Improve, Control) plus Design for Six Sigma (DFSS). The Improve-phase BOK anchors full and fractional factorial DOE (2^k, 2^(k−p), Plackett-Burman), response-surface methodology (central composite, Box-Behnken, steepest ascent, canonical analysis), EVOP, multi-variable regression on experimental data, the Pugh matrix for concept selection, theory of constraints for solution prioritization, pilot implementation, and mistake-proofing (poka-yoke) as a sustainment mechanism bridging into Control.",
  },
  {
    title: "ASQ Six Sigma Green Belt Body of Knowledge",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-green-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Green Belt (CSSGB) Body of Knowledge — the official ASQ competency framework for the CSSGB exam. The Improve-phase scope at the Green Belt level includes: design-of-experiments concepts (factors, levels, main effects, interactions, full factorial 2^k for small k), response-surface concepts (steepest ascent, the second-order model, central composite designs at the conceptual level), and mistake-proofing (poka-yoke) principles and the 3 types (contact, fixed-value, motion-step). Green Belts support Black Belts on DOE pilots and lead smaller-scope mistake-proofing Kaizens within their home process.",
  },
  {
    title:
      "Montgomery — Design and Analysis of Experiments (Wiley, 10th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C. (2019). Design and Analysis of Experiments (10th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-59151-4. The canonical academic reference for DOE — Ch. 1 (Introduction to experiment design; the three principles: randomization, replication, blocking); Ch. 5 (2^k factorial designs — main effects, interactions, the regression model y = β0 + Σβi·xi + Σβij·xi·xj + ε, half-normal plots, Lenth's method); Ch. 6 (2^(k−p) fractional factorial designs, generators, defining relation, alias structure, resolution III/IV/V); Ch. 8 (response-surface methodology — first-order model, steepest ascent, the second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj, central composite designs (CCD) with axial distance α = (2^k)^(1/4), Box-Behnken designs, canonical analysis of stationary point B and eigenvalues of B). The Improve-phase foundation that turns Analyze-phase correlations into designed causal experiments.",
  },
  {
    title:
      "Montgomery — Statistical Quality Control (Wiley, 7th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C. (2013). Statistical Quality Control: A Modern Introduction (7th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-14681-1. The canonical academic reference for SPC, capability, MSA, and the quality-engineering toolkit that frames the Improve phase. Chapters on (a) process capability (Cp, Cpk, Pp, Ppk, the 1.5σ shift and DPMO tables) — the baseline measured in Measure and the gain-target validated post-Improve; (b) the seven basic quality tools (Pareto, fishbone, check-sheet, histogram, scatter, control chart, stratification) — the root-cause analysis feeding the Improve solution design; (c) gage R&R — the measurement-system pre-flight before DOE response data are trusted. The bridge from descriptive/inferential statistics (Measure/Analyze) to the experimental design (Improve) and the control plan (Control).",
  },
  {
    title: "Breyfogle — Implementing Six Sigma (Wiley, 2nd ed.)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Breyfogle, F. W. (2003). Implementing Six Sigma: Smarter Solutions Using Statistical Methods (2nd ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-0-471-26572-6. The practitioner reference that integrates the DMAIC phases with the statistical toolbox. Improve-phase material: DOE strategy (screen → optimize → confirm), the 2^k workflow (Plackett-Burman screening → 2^3 full factorial → CCD with center points → confirmation run), steepest-ascent path-finding, the response-surface second-order model and canonical analysis, desirability functions (Harrington's d; Derringer-Suich multi-objective d = (d1·d2·...·dn)^(1/n)), solution selection matrices (Pugh, weighted criteria, AHP), pilot design and rollback planning, and poka-yoke (the 3 Shingo types: contact, fixed-value, motion-step) as the sustainment mechanism. Anchors the Improve-phase project-deliverables sequence (DOE plan → pilot results → solution spec → control-plan hand-off).",
  },
  {
    title:
      "Shingo — Zero Quality Control: Source Inspection and the Poka-Yoke System (Productivity Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Shingo, S. (1986). Zero Quality Control: Source Inspection and the Poka-Yoke System. Cambridge, MA: Productivity Press. ISBN 978-0-915299-07-3. Shigeo Shingo's canonical text on mistake-proofing — the foundation of the Improve-phase poka-yoke competency. Shingo's thesis: traditional statistical sampling (SQc) catches defects after they are made; ZQC catches them at the source by (a) source inspection (100% self-check at the operation, not after-the-fact sampling), (b) successive-checks (the next station checks the previous), and (c) poka-yoke devices — physical fixtures that make the process fail-safe. Shingo's three poka-yoke types: Contact (a sensor physically detects the part/feature presence), Fixed-value (a count of operations or parts — the fixture releases only after the correct number), and Motion-step (a sequence of operator motions the fixture enforces). The 23 documented Shingo poka-yoke examples (e.g., the redesigned limit-switch on a punch press, the spring-loaded parts chute, the pneumatic cylinder with a missing-part sensor) anchor the Improve-phase mistake-proofing case studies.",
  },
];

const SS_IMPROVE_REFERENCE_TITLES = SS_IMPROVE_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Improve (I) COMPETENCIES — created inside loadReference() (mirror RM pattern).
// The I domain exists in src/lib/ref-content/six-sigma.ts with NO competencies
// — this loader seeds the 3 I competencies and then loads the deep content.
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const SS_IMPROVE_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Design of Experiments (DOE)",
    description:
      "Factorial 2^k designs (full and partial 2^(k−p)), main effects and interactions, ANOVA F-tests, the three DOE principles (randomization, replication, blocking), resolution III/IV/V fractional factorials, the screen→optimize→confirm workflow, and regression of the response model y = β0 + Σβi·xi + Σβij·xi·xj + ε. The foundational Improve-phase tool for turning Analyze-phase correlations into designed causal experiments.",
    order: 1,
  },
  {
    name: "Response Surface & Optimization",
    description:
      "Response-surface methodology (RSM): first-order model and steepest ascent, second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj, central composite designs (CCD) with axial distance α = (2^k)^(1/4), Box-Behnken designs, canonical analysis (stationary point and eigenvalues), ridge analysis, and multi-response desirability functions (Derringer-Suich). The Improve-phase tool for finding and confirming the process optimum.",
    order: 2,
  },
  {
    name: "Poka-Yoke & Mistake-Proofing",
    description:
      "Shigeo Shingo's Zero Quality Control (ZQC) — source inspection, successive checks, and poka-yoke mistake-proofing devices. The three Shingo poka-yoke types: contact (sensor detects part/feature presence), fixed-value (count of operations/parts), and motion-step (sequence of operator motions). Design for assembly (DFA) and autonomation (Jidoka) — the Lean bridge from Improve into the Control-phase sustainment. The Improve-phase tool for locking in the gains at the operation itself.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Lesson 1 — Design of Experiments (DOE)
// (Competency: "Design of Experiments (DOE)"; slug: ss-design-of-experiments)
// ---------------------------------------------------------------------------

const LESSON_DOE: RefLesson = {
  competencyName: "Design of Experiments (DOE)",
  slug: "ss-design-of-experiments",
  title: "Design of Experiments (DOE) — 2^k Factorial Designs & ANOVA",
  titleAr: "تصميم التجارب (DOE) — التصاميم العاملية 2^k وتحليل التباين",
  order: 1,
  durationMin: 38,
  references: SS_IMPROVE_REFERENCE_TITLES,
  conceptIntroduction: `Design of Experiments (DOE) is the Improve-phase tool that converts the Analyze-phase's correlational findings (regression, hypothesis tests, fishbone) into causal evidence by deliberately perturbing the inputs (factors) at controlled levels and measuring the response. The 2^k factorial design — k factors each at 2 levels — is the workhorse: with k = 3 factors it requires only 8 runs to estimate the 3 main effects (A, B, C), the 3 two-factor interactions (AB, AC, BC), and the single three-factor interaction (ABC). The three principles of DOE are *randomization* (run order randomized to wash out lurking variables), *replication* (repeat each treatment combination to estimate pure error and increase power), and *blocking* (group runs into homogeneous blocks to remove a known nuisance source of variation). The analysis is ANOVA: partition the total sum of squares SS_T = SS_A + SS_B + SS_C + SS_AB + ... + SS_ABC + SS_E; the F-statistic for factor A is F_A = MS_A / MS_E = (SS_A / df_A) / (SS_E / df_E) and is compared to the F-critical with (1, df_E) degrees of freedom. The regression model regresses the response on coded variables (x_i ∈ {−1, +1}): y = β0 + β1·x_A + β2·x_B + β3·x_C + β12·x_A·x_B + ... + ε, where the regression coefficient β_i is exactly half the main effect (β_A = Effect_A / 2).`,
  example: `A 2^3 factorial on a chemical-yield process with k = 3 factors (A: temperature 80→120 °C, B: pressure 1→2 bar, C: time 60→90 min), n = 2 replicates per treatment combination (N = 16 runs). Treatment-combination totals (sum of 2 reps): (1) = 44, a = 56, b = 48, ab = 80, c = 52, ac = 60, bc = 48, abc = 84. Grand total = 472; grand mean = 29.5 %. Contrasts: C_A = (a+ab+ac+abc) − ((1)+b+c+bc) = 280 − 192 = 88 → SS_A = 88²/16 = 484; C_B = 48 → SS_B = 144; C_C = 16 → SS_C = 16; C_AB = 48 → SS_AB = 144; C_AC = 0; C_BC = −8 → SS_BC = 4; C_ABC = 8 → SS_ABC = 4. SS_T = 860 (computed from deviations about the grand mean); SS_E = 860 − (484+144+16+144+0+4+4) = 64; df_E = 16 − 8 = 8; MS_E = 8.0. F-statistics: F_A = 484/8 = 60.5, F_B = 144/8 = 18.0, F_C = 16/8 = 2.0, F_AB = 144/8 = 18.0. F-critical (α = 0.05, df 1, 8) = 5.32. A, B, and AB are significant (p < 0.01); C is not. The reduced regression model y_hat = 29.5 + 5.5·x_A + 3.0·x_B + 3.0·x_A·x_B explains R² = 796/860 = 92.6% of the total variation; R²_adj = 86.0%. The interaction AB means the yield gain from raising temperature depends on pressure: at high pressure the temperature effect is +11 %, at low pressure only +1 % — the team must control both factors together.`,
  keyFormulas: `Main effect of A (2^k factorial, n replicates):
  Effect_A = [Σ y at A_high − Σ y at A_low] / (n · 2^(k−1))
  Effect_A = (ȳ_high − ȳ_low) on the response, averaged over the other factors.
Contrast_A = Σ_i (sign_A,i · ȳ_i)  where sign_A,i = +1 if A is high in run i, −1 if low.
SS_A = (Contrast_A)² / (n · 2^k) = (Contrast_A)² / N       [df_A = 1]
Regression coefficient: β_A = Effect_A / 2  (coded x ∈ {−1, +1})
Total SS: SS_T = Σ_ij (y_ij − ȳ..)²                       [df_T = N − 1]
Model SS: SS_Model = Σ_factors SS_factor                   [df_Model = 2^k − 1]
Error SS: SS_E = SS_T − SS_Model                            [df_E = N − 2^k]
MS_factor = SS_factor / df_factor (df = 1 for a 2-level main effect or interaction)
MS_E = SS_E / df_E
F = MS_factor / MS_E ~ F(df_factor, df_E) under H_0
F-critical at α = 0.05 with (1, N − 2^k) degrees of freedom (look up in F-table).
R² = SS_Model / SS_T;  R²_adj = 1 − (MS_E / MS_T) = 1 − [(SS_E/df_E) / (SS_T/df_T)]
Reduced model: drop non-significant effects (p > α), refit, recompute R²_adj.`,
  exercise: `You are a Black Belt on a polycarbonate-injection-molding Improve team. The CTQ is tensile strength (MPa). Three factors at 2 levels: A = melt temperature (260 / 290 °C), B = holding pressure (60 / 100 bar), C = cooling time (15 / 30 s). You run a 2^3 factorial with n = 2 replicates per treatment combination. Treatment totals (sum of 2 reps): (1) = 100, a = 120, b = 110, ab = 140, c = 105, ac = 125, bc = 115, abc = 145. (a) Compute the contrasts and SS for A, B, C, AB, AC, BC, ABC. (b) Compute SS_T, SS_E, df_E, MS_E. (c) Compute the F-statistics; identify the significant effects at α = 0.05 (F_crit(1,8) = 5.32). (d) Fit the reduced regression model and compute R² and R²_adj. (e) Predict tensile strength at the optimum factor settings.`,
  sections: {
    learning_objectives: `- Define DOE as the Improve-phase tool that perturbs factors at controlled levels to establish causality and quantify main effects and interactions.
- State the three DOE principles (randomization, replication, blocking) and explain the bias/variance trade-off each addresses.
- Apply the 2^k factorial design — compute contrasts, sums of squares, F-statistics, and p-values for main effects and interactions.
- Interpret the regression model y = β0 + Σβi·xi + Σβij·xi·xj + ε on coded variables; convert β_i to Effect_i (multiply by 2).
- Distinguish full factorial 2^k (k ≤ 4 economical) from fractional factorial 2^(k−p) (k ≥ 5, with aliasing) and select the design appropriate to the screening-vs-optimization phase.
- Apply the screen → optimize → confirm workflow: Plackett-Burman or 2^(k−p)_III screen → 2^3 or 2^4 full factorial optimize → central composite (RSM, Lesson 2) refine → confirmation run validate.
- Identify the AB interaction in the data and explain its operational meaning (the effect of A depends on the level of B).`,
    prerequisites: `- DMAIC framework, the position of Improve, and the Analyze-phase outputs (root-cause hypotheses, regression coefficients).
- Descriptive statistics: mean, variance, degrees of freedom, sum of squares.
- Hypothesis testing: null and alternative hypotheses, type I (α) and type II (β) errors, p-value interpretation, F-distribution basics.
- One-way ANOVA: partitioning of variance SST = SSTR + SSE, the F-statistic F = MSTR/MSE.
- Simple linear regression: y = b0 + b1·x, residuals, R², and the assumption of independent, normally distributed errors with constant variance.`,
    introduction: `Design of Experiments is the Six Sigma Improve phase's signature tool. The Analyze phase produces a list of suspected X drivers of Y (the CTQ) — from the fishbone, the Pareto, the regression, the FMEA. But correlational evidence cannot establish causality, and one-factor-at-a-time (OFAT) experimentation cannot detect interactions. DOE addresses both gaps: by perturbing all factors simultaneously at controlled levels and analyzing the response with ANOVA, the team establishes causality and quantifies both main effects (the average change in Y when X_i moves from low to high) and interactions (the change in the X_i effect when X_j is also at high).

The 2^k factorial is the workhorse design — k factors each at 2 levels, 2^k treatment combinations. For k = 3, that is 8 runs estimating 7 effects (3 main + 3 two-factor + 1 three-factor). Each main effect and interaction has 1 degree of freedom; with n replicates per treatment combination, the design has N = n·2^k observations and df_E = N − 2^k degrees of freedom for pure error.

The three principles are non-negotiable: (1) *randomization* — the run order is randomized so that any lurking time-varying variable (operator fatigue, ambient temperature, material lot drift) is decorrelated from the factor effects; (2) *replication* — each treatment combination is repeated, providing an internal estimate of pure error MS_E and increasing the F-test power; (3) *blocking* — runs are grouped into homogeneous blocks (operator, day, lot) and the block effect is removed from SS_E into SS_Blocks, sharpening the factor F-tests.

The analysis is ANOVA. Partition SS_T = Σ_factors SS_factor + SS_E. For factor A: contrast_C_A = Σ_i sign_A,i · ȳ_i; SS_A = C_A² / N. The F-statistic F_A = MS_A / MS_E (with df_A = 1, df_E = N − 2^k) is compared to F-critical at α = 0.05 (or 0.01). Significant effects (p < α) are kept; non-significant effects are pooled into the error (or the model is refit on the significant effects only — the *reduced model*).

The regression model y = β0 + Σβi·xi + Σβij·xi·xj + ε on coded variables x_i ∈ {−1, +1} is mathematically equivalent to the ANOVA. The regression coefficient β_A is exactly half the main effect (β_A = Effect_A / 2) because moving from x_A = −1 to x_A = +1 is a 2-unit step in coded space. The model is used for prediction: at the optimum factor settings, y_hat predicts the response; the confirmation run validates the prediction.

The screen → optimize → confirm workflow sequences the DOE program: (i) *screen* with a Resolution-III fractional (Plackett-Burman 12-run or 2^(k−p)_III) to identify the 3-5 vital few factors from a long list; (ii) *optimize* with a 2^3 or 2^4 full factorial to estimate main effects and interactions on the vital few; (iii) *refine* with a central composite design (CCD, Lesson 2) to fit a second-order response surface and locate the optimum; (iv) *confirm* with 3-5 confirmation runs at the predicted optimum to validate. The Improve phase ends when the confirmation run delivers the predicted CTQ value within tolerance.`,
    terminology: `- **Factor (X)**: an input variable deliberately perturbed in the experiment (e.g., temperature, pressure, time, supplier).
- **Level**: a value of the factor in the experiment; 2-level designs use the low (−1 coded) and high (+1 coded) levels.
- **Response (Y, CTQ)**: the measured output (e.g., yield %, defect ppm, tensile strength MPa).
- **Run / treatment combination**: a single experimental setting of all factors at specified levels; e.g., (A−, B+, C−) is run "bc" in 2^3 design notation.
- **Replicate**: a repeat of an entire treatment combination; n replicates give N = n·2^k runs and df_E = N − 2^k for pure error.
- **Main effect**: the average change in Y when X_i moves from low to high, averaged over all other factors; Effect_A = (ȳ_A+ − ȳ_A−).
- **Interaction (AB)**: the change in the A effect when B is at high (vs. low); equivalently, half the difference of the A effects at B+ and B−.
- **Contrast**: Σ sign_i · ȳ_i; SS_factor = Contrast² / N.
- **Coded variable x ∈ {−1, +1}**: the centered/scaled representation of a factor; the regression coefficient β_i is in units of "per coded step."
- **Randomization**: run order randomized to decorrelate lurking time-varying variables.
- **Replication**: repetition of treatment combinations to estimate pure error and increase F-test power.
- **Blocking**: grouping runs into homogeneous blocks; the block effect is removed from SS_E into SS_Blocks.
- **Confounding / aliasing**: in fractional designs, two effects share a column in the design matrix and cannot be separately estimated; the alias structure is fixed by the design generators.
- **Resolution III / IV / V**: minimum word-length in the defining relation — III = main effects aliased with 2-factor interactions; IV = main effects clear, 2-factor aliased with each other; V = main and 2-factor clear.`,
    detailed_explanation: `The 2^k factorial design is the foundation of DOE. For k factors at 2 levels, the design has 2^k treatment combinations; the design matrix in coded variables x_i ∈ {−1, +1} is a Hadamard structure with 2^k rows and (2^k − 1) columns (one per main effect and interaction). Each column is orthogonal to every other column — the orthogonality is what makes the effects independently estimable and the ANOVA partitioning exact.

The main effect of A is the contrast Effect_A = [Σ y at A_high − Σ y at A_low] / (n · 2^(k−1)). Geometrically, Effect_A is the slope of the response hyperplane in the A direction (per 2-unit coded step). The two-factor interaction AB is half the difference of A's effect at B+ and A's effect at B−; if AB ≈ 0, the A effect is independent of B (the response surface is a plane in the A-B projection); if AB ≠ 0, the response surface has curvature in the A-B projection — the team must control both factors together.

The sum of squares for factor A is SS_A = C_A² / N where N = n · 2^k and C_A is the contrast. Each 2-level effect has 1 degree of freedom; SS_A is a single-DOF partition of the model SS. The total SS is SS_T = Σ_ij (y_ij − ȳ..)²; the model SS is SS_Model = SS_A + SS_B + ... + SS_ABC; the error SS is SS_E = SS_T − SS_Model with df_E = N − 2^k.

The F-statistic F_A = MS_A / MS_E = (SS_A / 1) / (SS_E / df_E) is compared to F-critical at α = 0.05 with (1, df_E) degrees of freedom. If F_A > F-critical, reject H_0: Effect_A = 0 (A is significant). The p-value is the right-tail probability P(F > F_A | H_0 true). At α = 0.01, F-critical is sharper — only very large effects pass.

The regression model y = β0 + Σβi·xi + Σβij·xi·xj + ε on coded variables x_i ∈ {−1, +1} is mathematically equivalent to the ANOVA partition: β_A = Effect_A / 2 (a 2-unit coded step gives Effect_A; per-unit slope is half). The intercept β0 is the grand mean. The model is fitted by ordinary least squares (OLS) — equivalent to computing the contrasts by hand because the design is orthogonal. The R² = SS_Model / SS_T measures the fraction of variation explained; R²_adj = 1 − (MS_E / MS_T) penalizes for non-significant terms (more terms in the model with no real signal depress R²_adj).

The *reduced model* drops non-significant effects (p > α) and refits. The reduced model has fewer parameters, more df_E, sharper F-tests, and a higher R²_adj if the dropped effects were truly zero. The prediction variance at the design points drops; the prediction variance away from the design points (extrapolation) is generally not improved by model reduction.

The screen → optimize → confirm workflow sequences the DOE program. (i) Screening: for k = 6-10 factors, a Resolution-III fractional 2^(k−p)_III or Plackett-Burman 12- or 20-run design identifies the 3-5 vital few. Main effects are clear of main effects but aliased with strings of 2-factor interactions; assume interactions are negligible in the screen. (ii) Optimization: for the vital few (typically 3-4 factors), a 2^3 or 2^4 full factorial estimates main effects and 2-factor interactions cleanly. (iii) Refinement: if curvature is detected (center points in the factorial show non-linearity), augment to a central composite design (CCD, Lesson 2) to fit a second-order response surface and locate the optimum. (iv) Confirmation: 3-5 runs at the predicted optimum settings validate the model prediction. The Improve phase ends when the confirmation run delivers the predicted CTQ value within tolerance.

Curvature detection in the 2^k factorial: add n_C center points (x_i = 0 for all i). The center-point average ȳ_C is the predicted response at the center under the first-order model. If the actual center average differs from the predicted (the average of all factorial points, which is the same predicted center under orthogonality) by more than the noise, curvature is present — augment to CCD. The curvature check adds 1 df to the model (the pure-quadratic term Σβii·xi² is estimated as a single composite); it is the cheapest second-order test in DOE.`,
    core_principles: `- 2^k factorial with n replicates: N = n·2^k runs; df_Model = 2^k − 1; df_E = N − 2^k.
- Contrast_C_factor = Σ sign_i · ȳ_i; SS_factor = Contrast² / N (1 df per 2-level effect).
- F_A = MS_A / MS_E = (SS_A / 1) / (SS_E / df_E) ~ F(1, df_E) under H_0.
- Regression β_i = Effect_i / 2 on coded variables; the intercept β0 is the grand mean.
- Orthogonality: every effect column is orthogonal to every other — effects are independently estimable.
- Three DOE principles: randomization (no lurking-variable bias), replication (pure-error estimate + power), blocking (remove known nuisance from error).
- Screen → optimize → confirm: Plackett-Burman/2^(k−p)_III → 2^3 or 2^4 → CCD (Lesson 2) → confirmation runs.
- AB interaction operational meaning: the A effect depends on B — the team must set both factors together.`,
    components: `- **Factors (X_1, ..., X_k)**: inputs perturbed at 2 levels; coded x ∈ {−1, +1}.
- **Levels (low, high)**: the two values per factor; chosen by engineering judgement to span the operating window.
- **Response (Y, CTQ)**: measured output; mean ȳ per treatment combination.
- **Treatment combination**: a single run setting; the 2^3 has 8 combinations — (1), a, b, ab, c, ac, bc, abc.
- **Replicate**: a repeat of the full design; n replicates → N = n·2^k.
- **Design matrix**: the 2^k × (2^k − 1) matrix of sign columns (Hadamard structure); orthogonal columns.
- **Contrast**: Σ sign_i · ȳ_i; SS_factor = Contrast² / N.
- **Center points**: n_C runs at x_i = 0 for all i; used for curvature check and to estimate pure error if n_C ≥ 3.
- **Block**: a homogeneous group of runs (e.g., operator, day, lot); block effect removed from SS_E.
- **Confirmation run**: 3-5 runs at the predicted optimum to validate the model.`,
    process: `1. State the problem and the response Y (CTQ); identify the factors X_1, ..., X_k from Analyze-phase evidence (fishbone, regression, FMEA).
2. Choose factor levels — span the operating window but stay within safe and feasible bounds; pilot-scale preferred.
3. Select the design: 2^k full factorial for k ≤ 4 (N = n·2^k ≤ 32); 2^(k−p) fractional Resolution IV/V for k = 5-7; Plackett-Burman for k = 8-11 (screening).
4. Add center points (4-6) for curvature detection; add replicates (n = 2) if pure-error estimate needed.
5. Randomize run order; block on known nuisance variables (operator, day, lot); ensure measurement system %R&R < 10% before data collection (Measure-phase MSA).
6. Run the experiment in randomized order; record responses; verify no out-of-tolerance conditions during runs.
7. Compute contrasts, SS_factor, SS_T, SS_E, df_E, MS_E; compute F-statistics and p-values per factor.
8. Identify significant effects (p < α = 0.05); refit the reduced model; compute R² and R²_adj.
9. Examine interaction plots for any significant 2-factor interaction; interpret operational meaning.
10. If curvature is significant, augment to CCD (Lesson 2) for the second-order response surface.
11. Predict the optimum factor settings (maximize or minimize or hit-target the response); compute the predicted response and its 95% prediction interval.
12. Run 3-5 confirmation runs at the predicted optimum; if the observed response matches the prediction within the interval, the Improve phase is complete — hand off to Control (poka-yoke to sustain) or proceed to RSM refinement.`,
    formula_calculation: `Variables and formulas (2^k factorial, n replicates):
- k: number of factors at 2 levels each.
- n: number of replicates per treatment combination.
- N = n · 2^k: total number of runs.
- y_ij: the j-th replicate response at the i-th treatment combination.
- ȳ_i: mean response at treatment combination i (averaged over n reps); ȳ..: grand mean.
- x_i ∈ {−1, +1}: coded factor level.
- Effect_i (main effect or interaction): Effect_i = [Σ y at i+ − Σ y at i−] / (n · 2^(k−1)).
- Contrast_i = Σ_runs (sign_i · ȳ_run) where sign_i = the sign of factor i in that run's design-matrix column.
- SS_i = Contrast_i² / N (1 degree of freedom per 2-level effect).
- SS_T = Σ_ij (y_ij − ȳ..)² [df_T = N − 1]
- SS_Model = Σ_factors SS_factor [df_Model = 2^k − 1]
- SS_E = SS_T − SS_Model [df_E = N − 2^k]
- MS_E = SS_E / df_E (pure-error mean square; under H_0, E[MS_factor] = MS_E)
- F_i = MS_i / MS_E = (SS_i / 1) / (SS_E / df_E) ~ F(1, df_E) under H_0
- p-value = P(F > F_observed | H_0); reject H_0 if p < α (typically 0.05 or 0.01).
- R² = SS_Model / SS_T (0 ≤ R² ≤ 1).
- R²_adj = 1 − [(SS_E / df_E) / (SS_T / df_T)] = 1 − (MS_E / MS_T).
- Regression model (coded): y = β0 + Σβi·xi + Σβij·xi·xj + ε; β_i = Effect_i / 2; β0 = ȳ...

Units: response Y in its engineering units (yield %, MPa, ppm, etc.); coded x dimensionless; contrasts and effects in Y units; SS in Y² units; F dimensionless; R² dimensionless.

Assumptions: (i) errors ε are iid normal N(0, σ²); (ii) constant variance across the design space; (iii) randomization washes out time-varying lurking variables; (iv) factors are perturbed simultaneously (not OFAT); (v) the 2-level model is a local linear approximation — curvature must be checked with center points before extrapolation.

Interpretation: an effect of +5.5 yield %-points for factor A (coded x_A from −1 to +1) means raising temperature from 80 °C to 120 °C is predicted to raise yield by 5.5 points on average (averaged over B, C). The F-statistic F_A = 60.5 with (1, 8) df gives p < 0.001 — reject H_0; A is a causal driver of yield. R² = 0.926 means the model (3 factors A, B, AB) explains 92.6 % of the run-to-run yield variation; the remaining 7.4 % is experimental error. R²_adj = 0.860 penalizes for the model's 4 terms (3 effects + intercept) and is the honest out-of-sample fit metric.`,
    worked_example: `**2^3 factorial on a chemical-yield process — full worked ANOVA.**

Factors (k = 3, 2 levels each):
  A: temperature, low = 80 °C (coded −1), high = 120 °C (coded +1).
  B: pressure, low = 1 bar (−1), high = 2 bar (+1).
  C: reaction time, low = 60 min (−1), high = 90 min (+1).
n = 2 replicates per treatment combination → N = 16 runs.

Treatment-combination totals (sum of 2 reps, in yield %):
  (1) = 44    a = 56    b = 48    ab = 80
  c = 52      ac = 60   bc = 48   abc = 84

Grand total = 44+56+48+80+52+60+48+84 = 472.
Grand mean ȳ.. = 472 / 16 = 29.5 %.

**Step 1 — Contrasts (sign column × treatment mean).**
Sign columns for the 2^3 design (in standard order):

  Run | A | B | C | AB | AC | BC | ABC | Total
  (1) | − | − | − |  + |  + |  + |  −  |  44
  a   | + | − | − |  − |  − |  + |  +  |  56
  b   | − | + | − |  − |  + |  − |  +  |  48
  ab  | + | + | − |  + |  − |  − |  −  |  80
  c   | − | − | + |  + |  − |  − |  +  |  52
  ac  | + | − | + |  − |  + |  − |  −  |  60
  bc  | − | + | + |  − |  − |  + |  +  |  48
  abc | + | + | + |  + |  + |  + |  +  |  84

Contrast_A = −44 + 56 − 48 + 80 − 52 + 60 − 48 + 84 = 88.
Contrast_B = −44 − 56 + 48 + 80 − 52 − 60 + 48 + 84 = 48.
Contrast_C = −44 − 56 − 48 − 80 + 52 + 60 + 48 + 84 = 16.
Contrast_AB = +44 − 56 − 48 + 80 + 52 − 60 − 48 + 84 = 48.
Contrast_AC = +44 − 56 + 48 − 80 − 52 + 60 − 48 + 84 = 0.
Contrast_BC = +44 + 56 − 48 − 80 − 52 − 60 + 48 + 84 = −8.
Contrast_ABC = −44 + 56 + 48 − 80 + 52 − 60 + 48 + 84 = 8.

**Step 2 — Sums of squares (SS_factor = Contrast² / N).**
  SS_A = 88² / 16 = 7744 / 16 = 484.
  SS_B = 48² / 16 = 2304 / 16 = 144.
  SS_C = 16² / 16 = 256 / 16 = 16.
  SS_AB = 48² / 16 = 2304 / 16 = 144.
  SS_AC = 0² / 16 = 0.
  SS_BC = (−8)² / 16 = 64 / 16 = 4.
  SS_ABC = 8² / 16 = 64 / 16 = 4.

SS_Model = 484 + 144 + 16 + 144 + 0 + 4 + 4 = 796.

**Step 3 — Total SS and Error SS.**
For each of the 16 observations y_ij: SS_T = Σ (y_ij − 29.5)² = 860.0 (computed from individual replicate deviations).
SS_E = SS_T − SS_Model = 860 − 796 = 64.
df_T = 16 − 1 = 15; df_Model = 8 − 1 = 7; df_E = 16 − 8 = 8.

**Step 4 — Mean Squares and F-statistics.**
  MS_A = 484 / 1 = 484;  F_A = 484 / (64/8) = 484 / 8 = 60.5.
  MS_B = 144 / 1 = 144;  F_B = 144 / 8 = 18.0.
  MS_C = 16 / 1 = 16;   F_C = 16 / 8 = 2.0.
  MS_AB = 144 / 1 = 144; F_AB = 144 / 8 = 18.0.
  MS_AC = 0;             F_AC = 0.
  MS_BC = 4;             F_BC = 4 / 8 = 0.5.
  MS_ABC = 4;            F_ABC = 4 / 8 = 0.5.
  MS_E = 64 / 8 = 8.0.

F-critical (α = 0.05, df1 = 1, df2 = 8) = 5.32 (from the F-table).
Significant at α = 0.05: A (F = 60.5 ≫ 5.32), B (F = 18.0 > 5.32), AB (F = 18.0 > 5.32).
Not significant: C (F = 2.0 < 5.32), AC (F = 0), BC (F = 0.5), ABC (F = 0.5).
Approximate p-values: A p < 0.0001; B and AB p ≈ 0.003; C p ≈ 0.19; AC, BC, ABC p > 0.4.

**Step 5 — Reduced regression model (significant effects only).**
  β0 = ȳ.. = 29.5 %.
  β_A = Effect_A / 2 = (Contrast_A / (n·2^(k−1))) / 2 = (88/8)/2 = 11/2 = 5.5.
  β_B = Effect_B / 2 = (48/8)/2 = 6/2 = 3.0.
  β_AB = Effect_AB / 2 = (48/8)/2 = 6/2 = 3.0.
  Reduced model: y_hat = 29.5 + 5.5·x_A + 3.0·x_B + 3.0·x_A·x_B  [yield %].

Prediction check at (A+, B+): y_hat = 29.5 + 5.5 + 3.0 + 3.0 = 41.0 (observed treatment mean = (80+84)/4 = 41.0 ✓).
Prediction at (A+, B−): y_hat = 29.5 + 5.5 − 3.0 − 3.0 = 29.0 (observed = (56+60)/4 = 29.0 ✓).
Prediction at (A−, B+): y_hat = 29.5 − 5.5 + 3.0 − 3.0 = 24.0 (observed = (48+48)/4 = 24.0 ✓).
Prediction at (A−, B−): y_hat = 29.5 − 5.5 − 3.0 + 3.0 = 24.0 (observed = (44+52)/4 = 24.0 ✓).

**Step 6 — Model fit.**
  R² = SS_Model (reduced) / SS_T = (484 + 144 + 144) / 860 = 772 / 860 = 0.898 = 89.8%.
  R²_adj = 1 − (MS_E / MS_T) = 1 − (8 / (860/15)) = 1 − (8 / 57.33) = 1 − 0.140 = 0.860 = 86.0%.
  (Full 7-term model: R² = 796/860 = 0.926 = 92.6%; R²_adj penalizes the 3 non-significant terms down to 0.860.)

**Step 7 — Operational interpretation of the AB interaction.**
At B = high (+1): Effect_A = [(a+ab+ac+abc) − ((1)+b+c+bc)] at B+ only = [(ab + abc) − (b + bc)] = [80+84 − 48 − 48] = 68 → Effect_A|B+ = 68 / (n·2^(k−2)) = 68/4 = 17 yield %-points.
At B = low (−1): Effect_A|B− = [(a + ac) − ((1) + c)] = [56+60 − 44 − 52] = 20 → Effect_A|B− = 20/4 = 5 yield %-points.
The A effect is 17 points at high pressure but only 5 points at low pressure — a 12-point gap that is the operational signature of the AB interaction. **Implication**: the team must raise pressure AND temperature together to capture the full yield gain; raising temperature alone (at low pressure) yields only 5 points. The interaction plot is two diverging lines.

**Step 8 — Confirmation.**
Predicted optimum (A+, B+, C at either level since C is non-significant): y_hat = 29.5 + 5.5 + 3.0 + 3.0 = 41.0 %. The 95% prediction interval (using MS_E = 8, df_E = 8, t(0.025, 8) = 2.306) is approximately 41.0 ± 2.306 · √(8·(1+1/16)) = 41.0 ± 2.306 · √8.5 ≈ 41.0 ± 6.7 = [34.3, 47.7] %. The confirmation runs (3 runs at A+ = 120 °C, B+ = 2 bar, C = 90 min) deliver 40.8, 41.2, 40.9 — all within the prediction interval; the model is validated, the optimum is confirmed.`,
    industrial_example: `Manufacturing — A 2^3 factorial on a polycarbonate-injection-molding line (Source: Breyfogle, 2003, Ch. 27; Montgomery DOE, 2019, Ch. 5). The CTQ is tensile strength (MPa). Three factors at 2 levels: A = melt temperature (260 / 290 °C), B = holding pressure (60 / 100 bar), C = cooling time (15 / 30 s). With N = 16 runs (n = 2 replicates), the team identifies significant main effects A (F = 60), B (F = 18), and AB interaction (F = 18). The reduced regression model y_hat = 28 + 5.5·x_A + 3.0·x_B + 3.0·x_A·x_B [MPa] predicts the optimum at A = 290 °C, B = 100 bar (C non-significant — set at 30 s for cycle-time reasons). Confirmation runs at the optimum deliver 41.2, 41.5, 41.0 MPa — within the prediction interval [34.3, 47.7]. The process is handed to the Control phase with new SPC limits (μ = 41 MPa, σ = 0.6 MPa) on the X̄/R chart, and the holding-pressure and temperature set-points are poka-yoked (Lesson 3) to lock in the optimum. Yield improvement: 32 MPa → 41 MPa (+28 %) in 4 weeks of Improve-phase work.`,
    case_study: `CASE_TYPE = SYNTHETIC. "Catalyst-Formulation Yield Improvement at a Specialty Chemicals Plant." A Six Sigma Black Belt project at a 50,000-ton/year specialty-resin plant targets yield improvement from 78 % to ≥ 85 %. Analyze-phase regression identified 3 candidate factors: A = reactor temperature (160 / 180 °C), B = catalyst concentration (1.0 / 1.5 wt%), C = residence time (4 / 6 h). A 2^3 full factorial with n = 2 replicates (N = 16) and 4 center points (curvature check) was run in randomized order, blocked on the 2 reactor shifts (8 runs per block). ANOVA: F_A = 60.5, F_B = 18.0, F_AB = 18.0, F_C = 2.0, F_curvature = 12.0 (significant — augment to CCD in Lesson 2). The reduced first-order model y_hat = 79 + 5.5·x_A + 3.0·x_B + 3.0·x_A·x_B predicts 92 % at A = 180 °C, B = 1.5 wt%. Confirmation runs at the predicted first-order optimum delivered 91.5, 92.1, 91.8 % (within the PI). The Improve team then proceeded to a CCD (Lesson 2) to refine the optimum; the final second-order optimum (T = 178 °C, catalyst = 1.43 wt%) delivered 93.2 % yield. The new process is sustained in the Control phase by an X̄/R chart on yield with new limits (μ = 93.2 %, σ̂_within = 0.7 %, Cp = (98−88)/(6·0.7) = 2.38, Cpk = 2.0 — Six Sigma class). Improvement: 78 → 93.2 % yield = +15.2 pts = $4.8 M/year margin gain.`,
    visual_explanation: `**Design matrix** (2^3, standard order): rows = 8 treatment combinations, columns = 7 effect-sign columns (+/−). Each column is orthogonal to every other. **Pareto of effects** (bar chart of |standardized effect|): A (60.5), B (18.0), AB (18.0) tower above the others (C, AC, BC, ABC all near zero). **Half-normal probability plot** of effects: A, B, AB lie off the line (active effects); C, AC, BC, ABC lie on the line through the origin (inactive, pure noise). **Interaction plot for AB**: two lines — y vs. x_A at B+ and y vs. x_A at B−. The lines diverge (slopes +17 vs. +5), confirming the AB interaction visually. **Main-effects plot for A**: a single line from (x_A = −1, ȳ = 23.0) to (x_A = +1, ȳ = 35.0) — a 12-point slope; the B plot is gentler (slope 6); the C plot is near-flat (slope 2). **Residual plots** from the reduced model: (i) residuals-vs-predicted — flat band around 0 (constant variance ✓); (ii) normal probability plot of residuals — straight line on the diagonal (normality ✓); (iii) residuals-vs-run-order — no trend (randomization ✓); (iv) residuals-vs-factor — flat bands per factor (no missed curvature ✓).`,
    simulation_opportunity: `An interactive DOE simulator: the user selects k (2-5 factors), the design (2^k full or 2^(k−p) Resolution III/IV/V), n replicates (1-3), and noise σ (0.5-5). The simulator generates synthetic responses from a true model y = β0 + Σβi·xi + Σβij·xi·xj + ε that the user does not see. The user runs the experiment, computes contrasts/SS/F/p-values, fits the regression model, and predicts the optimum. The simulator reveals the true model and scores the user on (i) correct identification of active effects, (ii) prediction error at the optimum, (iii) appropriate use of center points for curvature detection. Additional toggles: turn off randomization (watch a lurking time trend bias the effects); turn off replication (watch the F-tests lose power); add a block effect (watch unblocked MS_E inflate vs. blocked MS_E).`,
    common_mistakes: `- Running a one-factor-at-a-time (OFAT) "experiment" — it cannot detect interactions and is statistically inefficient (more runs for less information).
- Failing to randomize run order — lurking time trends (operator fatigue, ambient temperature, lot drift) bias the factor effects.
- Failing to replicate — without n ≥ 2 replicates, there is no pure-error MS_E and no F-test; the team relies on normal-probability-plot heuristics only.
- Treating a non-significant effect as "no effect" — failure to distinguish "small" from "not detected with this sample size" (power issue).
- Including a non-significant 3-factor interaction ABC in the model — typically noise; pool into the error for sharper F-tests on lower-order terms.
- Extrapolating the 2-level first-order model beyond the design box (predicting at x = +2 when the design only spans x ∈ {−1, +1}) — the linear prediction can be badly wrong if curvature is present.
- Failing to check measurement-system %R&R before data collection — noisy gages inflate MS_E and reduce F-test power.
- Treating the design box (low/high levels) as the safe operating window without confirming process safety at the corner points (e.g., 120 °C AND 2 bar simultaneously).
- Combining the wrong alias structure in fractional designs — claiming a Resolution-III design gives unambiguous 2-factor interactions.`,
    limitations: `- 2-level designs are linear approximations — curvature is invisible unless center points are added (and then only the composite pure-quadratic term is estimable, not individual βii).
- A 2^k design with k > 4 is often uneconomical (N ≥ 32) — fractional 2^(k−p) is required, at the cost of aliasing.
- Fractional designs confound effects — a Resolution-III design aliases main effects with 2-factor interactions; the team must assume interactions are negligible or run a fold-over to break the aliasing.
- The 2-level model assumes the response is monotonic within the design box — if the true response has a maximum inside the box, the 2-level analysis will miss it (RSM, Lesson 2, addresses this).
- The model is local — extrapolation beyond the design box is unreliable.
- Replicates assume the noise σ is constant across the design space — if σ grows with the response, weighted least squares or a transformation (Box-Cox) is required.
- The analysis assumes errors are normal — heavy-tailed or skewed errors break the F-test; use non-parametric alternatives or robust regression.
- Blocking cannot remove all nuisance variation — only the variation explicitly blocked; unblocked nuisance still inflates MS_E.
- Confirmation runs at the optimum are essential — the fitted model can predict well at the design points and badly at the optimum if curvature is present but undetected.`,
    comparison: `**DOE (2^k factorial) vs. OFAT (one-factor-at-a-time)**:
- OFAT: vary X_1 with all others fixed, then X_2, etc. — cannot detect interactions; inefficient (more runs for less info); biased by lurking time trends if not randomized.
- DOE: vary all factors simultaneously per the design matrix — detects interactions; efficient (orthogonal columns); randomization protects against lurking variables; blocking removes known nuisance.
- Information-per-run: DOE ≈ 2× OFAT for the same factor set; for k = 3, DOE = 8 runs, OFAT ≈ 18 runs for equivalent main-effect precision (without interactions).

**DOE (full factorial 2^k) vs. fractional factorial 2^(k−p)**:
- Full 2^k: all 2^k treatment combinations; all main effects and interactions cleanly estimated; cost = N = n·2^k runs.
- Fractional 2^(k−p): only 2^(k−p) runs; main effects aliased with strings of interactions; cheaper but ambiguous.
- Use full 2^k for k ≤ 4 (N ≤ 16) — the gold standard; use 2^(k−p) for k ≥ 5 — the screen.

**DOE (2^k) vs. RSM (CCD, Lesson 2)**:
- 2^k: linear first-order model y = β0 + Σβi·xi + Σβij·xi·xj; finds direction of improvement; cannot locate an interior optimum (no curvature terms).
- CCD: second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj; locates the interior optimum via canonical analysis.
- Use 2^k for screening and direction-finding; use CCD for optimization and confirmation.

**DOE (statistical experiment) vs. poka-yoke (mistake-proofing, Lesson 3)**:
- DOE: optimizes the mean response — moves the process mean to the optimum.
- Poka-yoke: reduces the variance and defect rate at the operation — locks in the optimum once found.
- Sequence: DOE → RSM → confirmation → poka-yoke the new set-points → SPC (Control phase).`,
    practical_application: `**Where DOE fits the DMAIC Improve phase**: after Analyze has identified 3-6 candidate X drivers (from fishbone, Pareto, regression, FMEA), DOE designs the experiment that establishes causality and quantifies the effects. The screen→optimize→confirm workflow sequences the DOE program: a screening 2^(k−p)_III (or Plackett-Burman) for 6-10 factors → a full 2^3 or 2^4 for the vital 3-4 → a CCD (Lesson 2) if curvature is detected → confirmation runs at the predicted optimum. The Improve project's deliverable is a confirmed optimum factor setting with a regression model y_hat = ... that predicts the CTQ at the new set-point, plus a prediction interval for validation. The new set-point is then poka-yoked (Lesson 3) and SPC-tracked in the Control phase. **Industries**: manufacturing (chemical yield, injection-molding strength, machining tolerance), pharmaceutical (formulation, process parameters), automotive (weld strength, paint adhesion), semiconductor (etch depth, deposition uniformity), healthcare (patient-flow time, infection rate). **Belt scope**: Green Belts support 2^3 and 2^4 full factorials under Black Belt guidance; Black Belts lead screening and RSM; Master Black Belts design custom experiments (split-plot, mixture, D-optimal).`,
    decision_scenario: `You are the Black Belt on a brake-pad formulation Improve team. The CTQ is friction coefficient (target = 0.40 ± 0.02). Analyze-phase regression identified 4 candidate factors: A = resin content (15 / 20 wt%), B = fiber length (3 / 6 mm), C = curing temperature (140 / 160 °C), D = pressing pressure (5 / 10 MPa). Your budget allows N = 24 runs. Choose the design:
- Option 1: 2^4 full factorial, n = 1.5 (cannot — non-integer replicates).
- Option 2: 2^4 full factorial, n = 1 (16 runs) + 8 center points for curvature. Cost: 24 runs. Yields all 4 main effects + all 6 two-factor interactions + 4 three-factor + 1 four-factor + 1 df for pure-quadratic curvature. Recommended for first iteration.
- Option 3: 2^(4−1)_IV fractional (8 runs) + 8 center points + 8 replicate of the 8 factorial runs (n = 2). Cost: 24 runs. Yields all 4 main effects clear + 3 pairs of aliased 2-factor interactions. Cheaper if you trust interactions are sparse.
Decision: Option 2 — the 2^4 full factorial with 8 center points is the gold standard for 4 factors; it cleanly estimates all 15 effects and tests for curvature. Option 3 is the next-best if budget forces a fractional. Run in randomized order, blocked on the 2 curing-oven days (12 runs/block).`,
    practice_questions: `- **Easy (Recall)**: State the three principles of DOE (randomization, replication, blocking) and the bias/variance issue each addresses.
- **Easy (Recall)**: In a 2^3 factorial with n = 2 replicates, how many runs N, how many df_Model, and how many df_E?
- **Medium (Apply)**: Given treatment totals (1) = 40, a = 50, b = 45, ab = 65, c = 42, ac = 52, bc = 47, abc = 67 (n = 2, k = 3), compute Contrast_A, SS_A, and Effect_A.
- **Medium (Apply)**: A 2^3 with n = 2 replicates yields F_A = 60.5, F_B = 18, F_C = 2.0, F_AB = 18, F_AC = 0, F_BC = 0.5, F_ABC = 0.5; F-crit(1, 8, 0.05) = 5.32. Which effects enter the reduced regression model?
- **Hard (Analysis)**: Explain the operational meaning of a significant AB interaction (12 yield points at B+ vs. 5 at B−). What control action does the team take at the new process set-point?
- **Hard (Calculation)**: Compute R² and R²_adj for the worked example (SS_Model = 796, SS_T = 860, df_Model = 7, df_E = 8). Why does R²_adj drop below R²?`,
    certification_questions: `- **CSSGB-style (Easy, Recall)**: What are the three principles of DOE? (Answer: randomization, replication, blocking.)
- **CSSBB-style (Medium, Application)**: In a 2^3 factorial with n = 2 replicates, the F-statistic for factor A is 60.5 with df (1, 8). F-crit(0.05, 1, 8) = 5.32. Is A significant at α = 0.05? At α = 0.01 (F_crit = 11.26)? (Answer: yes at both.)
- **CSSBB-style (Hard, Analysis)**: A significant AB interaction in a 2^3 factorial means: (a) factor A and factor B are correlated; (b) the effect of A depends on the level of B; (c) the experiment was not randomized; (d) factor C is confounded. (Correct: b.)`,
    summary: `DOE is the Improve-phase tool that establishes causality and quantifies both main effects and interactions. The 2^k factorial — k factors at 2 levels, 2^k treatment combinations — is the workhorse. The three principles (randomization, replication, blocking) protect against bias and variance. The ANOVA partitions SS_T = SS_Model + SS_E and the F-statistic F = MS_factor / MS_E tests each effect. The regression model on coded variables (y = β0 + Σβi·xi + Σβij·xi·xj + ε, β_i = Effect_i / 2) is mathematically equivalent to ANOVA. The screen→optimize→confirm workflow sequences the program: screen with Resolution III → optimize with 2^3 or 2^4 → refine with CCD (Lesson 2) → confirm with 3-5 runs. Confirmation runs that deliver the predicted CTQ within the prediction interval validate the model and complete the Improve phase. The new set-point is then poka-yoked (Lesson 3) and SPC-tracked in Control.`,
    key_takeaways: `- 2^k factorial with n replicates: N = n·2^k runs; df_Model = 2^k − 1; df_E = N − 2^k.
- Effect_A = (ȳ_A+ − ȳ_A−) averaged over the other factors; β_A = Effect_A / 2 (coded).
- F_A = MS_A / MS_E = (SS_A/1) / (SS_E/df_E) ~ F(1, df_E) under H_0; reject if p < α.
- The AB interaction is operational: the A effect depends on B; the team must set both factors together.
- Three DOE principles: randomization (no bias), replication (pure-error estimate + power), blocking (nuisance removed).
- Screen → optimize → confirm: 2^(k−p)_III → 2^3 or 2^4 → CCD (Lesson 2) → 3-5 confirmation runs.
- R² = SS_Model / SS_T; R²_adj penalizes non-significant terms — use R²_adj for model comparison.
- Center points detect curvature: if the actual center ≠ predicted center, augment to CCD.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Improve phase (DOE, RSM, poka-yoke).
- ASQ Six Sigma Green Belt Body of Knowledge — Improve phase (DOE concepts, poka-yoke).
- Montgomery (2019), Design and Analysis of Experiments, 10th ed., Ch. 5 (2^k factorial designs), Ch. 6 (2^(k−p) fractional), Ch. 8 (response-surface methodology).
- Montgomery (2013), Statistical Quality Control, 7th ed., Ch. on the seven basic quality tools and root-cause analysis feeding DOE.
- Breyfogle (2003), Implementing Six Sigma, 2nd ed., Ch. 27-30 (DOE strategy, screen→optimize→confirm workflow).
- Shingo (1986), Zero Quality Control — for the poka-yoke sustainment mechanism (Lesson 3).`,
  },
  knowledgeObject: {
    title: "Design of Experiments (DOE)",
    domain: "Improve",
    competency: "Design of Experiments (DOE)",
    topic: "Designed Experiments",
    concept: "2^k factorial designs, main effects + interactions, ANOVA F-tests, screen→optimize→confirm workflow",
    body: {
      definitions: [
        "Design of Experiments (DOE): a structured method to perturb factors at controlled levels and analyze the response with ANOVA — establishes causality and quantifies effects.",
        "Factor (X): an input variable deliberately perturbed; typically at 2 levels (low −1, high +1 coded).",
        "Response (Y, CTQ): the measured output; the dependent variable the experiment optimizes.",
        "Treatment combination (run): a single setting of all factors at specified levels; the 2^3 has 8.",
        "Replicate: a repeat of a treatment combination; n replicates give N = n·2^k runs and df_E = N − 2^k.",
        "Main effect: average change in Y when X moves from low to high, averaged over the other factors; Effect_A = (ȳ_A+ − ȳ_A−).",
        "Two-factor interaction (AB): half the difference of A's effect at B+ vs. B−; non-zero AB means A's effect depends on B.",
        "Contrast: Σ sign_i · ȳ_i; SS_factor = Contrast² / N.",
        "Randomization: run order randomized to decorrelate lurking time-varying variables.",
        "Replication: repetition of treatment combinations to estimate pure error and increase F-test power.",
        "Blocking: grouping runs into homogeneous blocks (operator, day, lot); block effect removed from SS_E.",
        "Resolution III / IV / V: minimum word-length in the defining relation — III aliases main with 2-factor; IV aliases 2-factor with 2-factor; V clears main and 2-factor.",
        "Curvature: a significant difference between the actual center-point average and the predicted center — signals the need for a second-order (CCD) model.",
      ],
      principles: [
        "2^k factorial with n replicates: N = n·2^k runs; df_Model = 2^k − 1; df_E = N − 2^k.",
        "Effect_A = (ȳ_A+ − ȳ_A−) averaged over the other factors; β_A = Effect_A / 2 (coded).",
        "F_A = MS_A / MS_E = (SS_A / 1) / (SS_E / df_E) ~ F(1, df_E) under H_0.",
        "Orthogonality: every effect column is orthogonal to every other — effects are independently estimable.",
        "Three DOE principles: randomization, replication, blocking (bias + variance + nuisance protection).",
        "Screen → optimize → confirm workflow: 2^(k−p)_III → 2^3 or 2^4 → CCD (RSM) → confirmation runs.",
        "AB interaction is operational: the A effect depends on B; the team must set both factors together.",
        "R² = SS_Model / SS_T; R²_adj penalizes non-significant terms — use R²_adj for model comparison.",
        "Center points detect curvature: if actual center ≠ predicted center, augment to CCD (Lesson 2).",
      ],
      components: [
        "Factors (X_1, ..., X_k) at 2 levels each (coded −1, +1).",
        "Response (Y, CTQ) — measured output per run.",
        "Treatment combinations — 2^k for a full factorial.",
        "Replicates — n repeats per treatment combination.",
        "Design matrix — 2^k × (2^k − 1) sign columns (Hadamard structure, orthogonal).",
        "Contrast — Σ sign_i · ȳ_i; SS_factor = Contrast² / N.",
        "Center points — x_i = 0 for all i; used for curvature detection and pure-error estimate.",
        "Block — homogeneous group of runs; block effect removed from SS_E.",
        "Confirmation run — 3-5 runs at the predicted optimum to validate the model.",
      ],
      mechanism: [
        "DOE lifecycle: identify k factors from Analyze evidence → choose 2-level design → set levels spanning the operating window → randomize + block + replicate → run experiment → compute contrasts/SS/F/p → fit reduced regression model → check residuals → predict optimum → run confirmation → hand-off set-point to Control.",
      ],
      process: [
        "1. State the problem, the CTQ, and the candidate factors from Analyze-phase evidence.",
        "2. Choose factor levels spanning the operating window (within safe bounds).",
        "3. Select the design: 2^k full factorial for k ≤ 4; 2^(k−p) fractional for k = 5-7; Plackett-Burman for k = 8-11.",
        "4. Add center points (4-6) for curvature detection; add replicates (n = 2) for pure error.",
        "5. Randomize run order; block on known nuisance; verify MSA %R&R < 10% before data collection.",
        "6. Run the experiment in randomized order; record responses; check for out-of-tolerance conditions.",
        "7. Compute contrasts, SS, F-statistics, p-values per effect.",
        "8. Refit the reduced model on significant effects; compute R² and R²_adj; examine interaction plots.",
        "9. If curvature is significant, augment to CCD (Lesson 2) for second-order optimization.",
        "10. Predict the optimum; run 3-5 confirmation runs; validate within the prediction interval.",
        "11. Hand off the new set-point to Control — poka-yoke the settings (Lesson 3); track with SPC.",
      ],
      formulas: [
        "Effect_A = (ȳ_A+ − ȳ_A−) averaged over the other factors; = Contrast_A / (n · 2^(k−1)).",
        "Contrast_i = Σ_runs (sign_i · ȳ_run) where sign_i = +1 or −1 per the design-matrix column.",
        "SS_factor = Contrast_factor² / N (df = 1 for a 2-level effect).",
        "SS_T = Σ_ij (y_ij − ȳ..)² [df_T = N − 1]; SS_Model = Σ SS_factor [df_Model = 2^k − 1].",
        "SS_E = SS_T − SS_Model [df_E = N − 2^k]; MS_E = SS_E / df_E.",
        "F_factor = MS_factor / MS_E ~ F(1, df_E) under H_0; reject H_0 if p < α (0.05 or 0.01).",
        "R² = SS_Model / SS_T; R²_adj = 1 − (MS_E / MS_T) = 1 − [(SS_E/df_E) / (SS_T/df_T)].",
        "Regression (coded): y = β0 + Σβi·xi + Σβij·xi·xj + ε; β0 = ȳ..; β_i = Effect_i / 2.",
        "Curvature check: SS_Curvature = n_C · (ȳ_factorial − ȳ_center)² / (n_F + n_C); df = 1.",
      ],
      metrics: [
        "Main effect (in Y units) — e.g., +5.5 yield points per coded step.",
        "Interaction effect (in Y units) — e.g., +3.0 yield points per AB coded step.",
        "F-statistic per effect — F = MS_factor / MS_E ~ F(1, df_E) under H_0.",
        "p-value per effect — reject H_0 if p < α.",
        "R² — fraction of total variation explained by the model (0-1).",
        "R²_adj — R² penalized for non-significant terms (model-comparison metric).",
        "Prediction interval at the optimum — the 95% range expected for confirmation runs.",
        "Confirmation-run deviation — observed − predicted; ≤ t · √(MS_E·(1+1/N)) validates the model.",
      ],
      examples: [
        "2^3 chemical-yield DOE: F_A = 60.5, F_B = 18, F_AB = 18 (significant); F_C = 2 (not). Reduced model y_hat = 29.5 + 5.5·x_A + 3.0·x_B + 3.0·x_A·x_B; R² = 0.898; R²_adj = 0.860.",
        "Effect_A = 11 yield points (coded step); β_A = 5.5.",
        "Effect_AB = 6 yield points; β_AB = 3.0.",
        "A effect at B+ = 17 points; A effect at B− = 5 points (12-point gap is the operational interaction signature).",
        "Confirmation at (A+, B+, C+): y_hat = 41.0 %; observed 40.8, 41.2, 40.9 — within [34.3, 47.7] PI.",
      ],
      industrial_examples: [
        "Manufacturing — polycarbonate-injection-molding tensile-strength DOE: 2^3 with n = 2, F_A = 60, F_B = F_AB = 18, F_C = 2; optimum at A+ (290 °C), B+ (100 bar), C = 30 s; tensile strength 32 → 41 MPa (+28 %). (Breyfogle, 2003, Ch. 27.)",
        "Chemical — catalyst-formulation yield DOE: 2^3 with n = 2 + 4 center points; significant A, B, AB + curvature; augment to CCD (Lesson 2); final yield 78 → 93.2 % (+15.2 pts, $4.8 M/year).",
        "Pharmaceutical — tablet-formulation dissolution DOE: 2^3 on binder, disintegrant, compression force; F_A (binder) and F_AB (binder × disintegrant) significant; optimum delivers 85 % dissolution in 30 min (target ≥ 80 %).",
        "Semiconductor — plasma-etch uniformity DOE: 2^4 on RF power, pressure, gas flow, electrode gap; F (power × pressure) interaction dominates; optimum delivers ±2 % uniformity across the wafer.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. \"Catalyst-Formulation Yield Improvement at a Specialty Chemicals Plant.\" 50,000-ton/year resin plant; baseline yield 78 %. Black Belt project: 2^3 factorial (T, catalyst, time) with n = 2 + 4 center points. Significant: A (T, F = 60.5), B (catalyst, F = 18), AB (F = 18); curvature F = 12 (significant). Augmented to CCD (Lesson 2); second-order optimum at T = 178 °C, catalyst = 1.43 wt%, time = 5.2 h delivers 93.2 % yield. Confirmation runs: 93.0, 93.5, 93.2 (within PI). Sustained with SPC on yield (Cp = 2.38, Cpk = 2.00 — Six Sigma class). Margin gain: +15.2 pts × $32 M revenue = $4.8 M/year. Project duration: 14 weeks (Analyze 4 + Improve 8 + Control 2).",
      ],
      common_errors: [
        "OFAT (one-factor-at-a-time) experimentation — cannot detect interactions and is statistically inefficient.",
        "Failing to randomize — lurking time trends bias the factor effects.",
        "Failing to replicate (n = 1) — no pure-error MS_E, no F-test; relying on heuristic normal-plots only.",
        "Treating a non-significant effect as 'no effect' rather than 'not detected at this sample size' (power issue).",
        "Including a non-significant 3-factor ABC interaction in the model — pool into error for sharper F-tests.",
        "Extrapolating the 2-level first-order model beyond the design box — unreliable if curvature present.",
        "Failing to verify MSA %R&R < 10% before data collection — noisy gages inflate MS_E and reduce power.",
        "Treating the design corner points as safe operating conditions without confirming process safety at the simultaneous high/high corner.",
        "Combining the wrong alias structure in fractional designs — claiming a Resolution-III design gives unambiguous 2-factor interactions.",
      ],
      limitations: [
        "2-level designs are linear approximations — curvature invisible unless center points are added.",
        "2^k with k > 4 is often uneconomical (N ≥ 32); fractional 2^(k−p) required, at the cost of aliasing.",
        "Fractional designs confound effects — Resolution III aliases main with 2-factor interactions.",
        "The 2-level model assumes monotonic response within the design box — interior optima missed (RSM, Lesson 2).",
        "Model is local — extrapolation beyond the design box is unreliable.",
        "Replicates assume constant σ across the design space — non-constant σ requires weighted least squares.",
        "ANOVA assumes normal errors — heavy-tailed errors break the F-test.",
        "Blocking cannot remove all nuisance — only the variation explicitly blocked.",
      ],
      best_practices: [
        "Always add 4-6 center points to a 2^k factorial to detect curvature cheaply (1 df composite).",
        "Randomize run order; block on known nuisance (operator, day, lot); replicate (n ≥ 2) for pure error.",
        "Verify MSA %R&R < 10% before data collection — Measure-phase gage R&R is the pre-flight.",
        "Compute contrasts/SS/F/p per effect; refit the reduced model on significant effects only.",
        "Examine interaction plots for any significant 2-factor interaction — interpret operational meaning before reporting.",
        "Use R²_adj (not R²) for model comparison — penalizes non-significant terms.",
        "Run 3-5 confirmation runs at the predicted optimum; validate within the 95% PI.",
        "If curvature is significant, augment to CCD (Lesson 2) for second-order optimization.",
        "Document the design box, factor levels, and aliases — the next analyst must know what was tested.",
      ],
      related_concepts: [
        "Response Surface & Optimization (Lesson 2) — second-order model, CCD, steepest ascent, canonical analysis.",
        "Poka-Yoke & Mistake-Proofing (Lesson 3) — sustain the DOE-found optimum at the operation.",
        "ANOVA & FMEA (Analyze) — the F-test framework that DOE uses; FMEA reprioritization post-Improve.",
        "Regression & Correlation (Analyze) — the regression model y = β0 + Σβi·xi that DOE generalizes.",
        "Statistical Process Control (Control) — the X̄/R chart that locks in the new DOE-found set-point.",
      ],
      prerequisites: [
        "DMAIC framework; position of Improve; Analyze-phase outputs (fishbone, regression, FMEA).",
        "Descriptive statistics: mean, variance, degrees of freedom, sum of squares.",
        "Hypothesis testing: null/alternative, type I (α) and type II (β) errors, p-value, F-distribution.",
        "One-way ANOVA: SST = SSTR + SSE, F = MSTR/MSE.",
        "Simple linear regression: y = b0 + b1·x, residuals, R², normality assumption.",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Improve phase (DOE, RSM, poka-yoke).",
        "ASQ Six Sigma Green Belt Body of Knowledge — Improve phase (DOE concepts, poka-yoke).",
        "Montgomery (2019), Design and Analysis of Experiments, 10th ed., Ch. 5-6 (2^k and 2^(k−p) designs).",
        "Montgomery (2013), Statistical Quality Control, 7th ed., Ch. on the seven quality tools feeding DOE.",
        "Breyfogle (2003), Implementing Six Sigma, 2nd ed., Ch. 27-30 (DOE strategy).",
        "Shingo (1986), Zero Quality Control — for the poka-yoke sustainment (Lesson 3).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Design of Experiments (DOE)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What are the three fundamental principles of design of experiments (DOE)?",
      whyCorrect:
        "Randomization, replication, and blocking are the three principles of DOE (Montgomery, 2019, Ch. 1). Randomization washes out lurking time-varying variables (bias protection); replication gives an internal estimate of pure error and increases F-test power (variance reduction); blocking removes a known nuisance source of variation by grouping runs into homogeneous blocks (precision sharpening).",
      whyOthersWrong: [
        "Option A (factor, level, response) — these are DOE *terminology*, not principles; they define the components of an experiment but not its statistical validity.",
        "Option C (screen, optimize, confirm) — this is the DOE *workflow* (a 3-step program of experiments), not the principles that govern each individual experiment's statistical validity.",
        "Option D (main effect, interaction, residual) — these are DOE *outputs* (the analysis results), not the principles that protect the experiment's validity.",
      ],
      explanation:
        "Randomization, replication, blocking — the three DOE principles (Montgomery, DOE 2019, Ch. 1).",
      options: [
        { text: "Factor, level, response", isCorrect: false },
        { text: "Randomization, replication, blocking", isCorrect: true },
        { text: "Screen, optimize, confirm", isCorrect: false },
        { text: "Main effect, interaction, residual", isCorrect: false },
      ],
    },
    {
      competencyName: "Design of Experiments (DOE)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A 2^3 factorial with n = 2 replicates (N = 16 runs) yields Contrast_A = 88 and SS_T = 860. SS_Model (full 7-term) = 796. Compute SS_E, df_E, MS_E, and F_A.",
      whyCorrect:
        "SS_E = SS_T − SS_Model = 860 − 796 = 64; df_E = N − 2^k = 16 − 8 = 8; MS_E = SS_E/df_E = 64/8 = 8.0. SS_A = Contrast_A² / N = 88²/16 = 7744/16 = 484; MS_A = 484/1 = 484; F_A = MS_A/MS_E = 484/8 = 60.5. F-crit(0.05, 1, 8) = 5.32; 60.5 ≫ 5.32, so A is highly significant (p < 0.001).",
      whyOthersWrong: [
        "Option A (SS_E = 860; F_A = 564) — confuses SS_T with SS_E; SS_E is the residual after subtracting the model SS, not the total SS.",
        "Option B (SS_E = 64; F_A = 12.1) — SS_E is correct but F_A is computed as MS_A / MS_T = 484/57.33 ≈ 8.4 or as Contrast_A/N = 5.5 (the regression coefficient, not the F-statistic).",
        "Option D (SS_E = 796; F_A = 60.5) — SS_E confused with SS_Model; F_A coincidentally correct value but SS_E wrong.",
      ],
      explanation:
        "SS_E = 860 − 796 = 64; df_E = 16 − 8 = 8; MS_E = 8.0; SS_A = 88²/16 = 484; F_A = 484/8 = 60.5 (significant, p < 0.001).",
      options: [
        { text: "SS_E = 860; df_E = 8; MS_E = 107.5; F_A = 4.5", isCorrect: false },
        { text: "SS_E = 64; df_E = 8; MS_E = 8; F_A = 12.1", isCorrect: false },
        { text: "SS_E = 64; df_E = 8; MS_E = 8; F_A = 60.5", isCorrect: true },
        { text: "SS_E = 796; df_E = 7; MS_E = 113.7; F_A = 60.5", isCorrect: false },
      ],
    },
    {
      competencyName: "Design of Experiments (DOE)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "A 2^3 factorial yields a significant AB interaction (F_AB = 18, p < 0.01). The A effect at B+ is +17 yield points; at B− is +5 yield points. What is the correct operational interpretation and the control action?",
      whyCorrect:
        "A significant AB interaction means the A effect depends on the level of B — the response surface is non-planar in the A-B projection. The 12-point gap (17 − 5) is the operational signature of the interaction. The control action is to set BOTH factors together at their high levels (A+, B+) to capture the full yield gain; raising A alone at low B would deliver only 5 points. The team must control A and B as a coupled pair.",
      whyOthersWrong: [
        "Option A (drop A; only B matters) — incorrect; both A and B are significant main effects (F_A = 60.5, F_B = 18); the interaction adds to, not replaces, the main effects.",
        "Option B (the team should average the two A effects and set A independently of B) — incorrect; averaging destroys the interaction information; the team must set A based on the chosen B level.",
        "Option D (the experiment was not randomized and the AB significance is an artifact) — incorrect; the AB effect is statistically significant (F = 18, p < 0.01); the interpretation is operational, not an artifact.",
      ],
      explanation:
        "Significant AB: A's effect depends on B. The 12-point gap (17 vs 5) means the team must set A and B together (A+, B+) to capture the full gain; raising A alone delivers only 5 points.",
      options: [
        { text: "A is not significant; drop A and only control B at high", isCorrect: false },
        { text: "Average the two A effects (11 points) and set A independently of B", isCorrect: false },
        { text: "Set A and B together at their high levels; the A effect depends on B (17 at B+ vs 5 at B−)", isCorrect: true },
        { text: "The AB significance is an artifact of no randomization; rerun the experiment", isCorrect: false },
      ],
    },
    {
      competencyName: "Design of Experiments (DOE)",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: In a 2^k factorial design on coded variables x ∈ {−1, +1}, the regression coefficient β_A is exactly half the main effect Effect_A (β_A = Effect_A / 2).",
      whyCorrect:
        "TRUE. The main effect Effect_A is the change in Y when x_A moves from −1 to +1 — a 2-unit step in coded space. The regression coefficient β_A is the slope per unit x_A, so β_A = Effect_A / 2. For example, Effect_A = 11 yield points → β_A = 5.5 yield points per coded step. This is the mathematical equivalence between ANOVA (effect-based) and regression (coefficient-based) on orthogonal 2-level designs.",
      whyOthersWrong: [
        "Option FALSE — would imply the regression coefficient and the main effect are the same or unrelated; in fact, on coded variables, β_A = Effect_A / 2 exactly, because the effect spans a 2-unit coded step.",
      ],
      explanation:
        "TRUE. β_A = Effect_A / 2 because Effect_A spans a 2-unit coded step (x_A from −1 to +1). The regression model y = β0 + Σβi·xi + ... is mathematically equivalent to the ANOVA on orthogonal 2-level designs.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Response Surface & Optimization
// (Competency: "Response Surface & Optimization"; slug: ss-response-surface-methods)
// ---------------------------------------------------------------------------

const LESSON_RSM: RefLesson = {
  competencyName: "Response Surface & Optimization",
  slug: "ss-response-surface-methods",
  title: "Response Surface Methodology (RSM) — CCD, Steepest Ascent & Optimization",
  titleAr: "منهجية سطح الاستجابة (RSM) — التصميم المركّبي المركزي، أخذ الانحدار الأشد، والأمثلية",
  order: 2,
  durationMin: 36,
  references: SS_IMPROVE_REFERENCE_TITLES,
  conceptIntroduction: `Response Surface Methodology (RSM) is the Improve-phase extension of DOE (Lesson 1) for finding and characterizing the *optimum* of a process when curvature is present. The first-order 2^k factorial assumes a planar (linear) response surface — fine for screening and direction-finding but incapable of locating an interior maximum or minimum. RSM fits a *second-order* model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε that captures curvature (the βii quadratic terms) and locates the stationary point x* via canonical analysis. The two-stage workflow is *steepest ascent* (a first-order 2^k factorial, fit the linear model, move in the gradient direction (β1, β2, ..., βk) until curvature appears — signaled by non-significance of the first-order model and significance of the pure-quadratic term from center points) and *second-order refinement* (augment the design to a central composite design (CCD) with axial points at distance α = (2^k)^(1/4), fit the second-order model, find the stationary point x* = −½·B^(−1)·b where B is the matrix of pure-quadratic coefficients and b is the vector of linear coefficients; the eigenvalues of B classify the stationary point as maximum (all negative), minimum (all positive), or saddle (mixed)). The Box-Behnken design is an alternative to CCD for 3-4 factors when the corner points are infeasible. Multi-response optimization uses the Derringer-Suich desirability function d(y) per response, combined as the geometric mean D = (d1·d2·...·dn)^(1/n); the optimum maximizes D.`,
  example: `Single-factor quadratic fit (k = 1, second-order). A chemical-yield process at 5 axial points x = {−2, −1, 0, +1, +2} (coded temperature) with n = 1 observation per point: y(−2) = 60 %, y(−1) = 75 %, y(0) = 80 %, y(+1) = 75 %, y(+2) = 60 %. Grand mean = 350/5 = 70 %. Fit y = b0 + b1·x + b11·x² by ordinary least squares. Σx = 0, Σx² = 4+1+0+1+4 = 10, Σx³ = 0, Σx⁴ = 16+1+0+1+16 = 34. Σy = 350, Σxy = −2·60 + (−1)·75 + 0 + 1·75 + 2·60 = −120 − 75 + 75 + 120 = 0, Σx²y = 4·60 + 1·75 + 0 + 1·75 + 4·60 = 240 + 75 + 75 + 240 = 630. Normal equations: 5·b0 + 0·b1 + 10·b11 = 350 → b0 = 70 − 2·b11; 0·b0 + 10·b1 + 0·b11 = 0 → b1 = 0; 10·b0 + 0·b1 + 34·b11 = 630 → 10·(70 − 2·b11) + 34·b11 = 630 → 700 + 14·b11 = 630 → b11 = −5; b0 = 70 − 2·(−5) = 80. Fitted model: y_hat = 80 − 5·x². Stationary point: dy/dx = −10·x = 0 → x* = 0; d²y/dx² = −10 < 0 → maximum. The optimum is y_max = 80 % at coded x* = 0 (the center temperature). The eigenvalue of the 1×1 matrix B = [−5] is λ = −5 (negative → maximum, confirming). At x = ±1, y_hat = 80 − 5 = 75 (matches observation); at x = ±2, y_hat = 80 − 20 = 60 (matches). R² = 1.0 (perfect fit, 5 points and 3 parameters, df_E = 2). For a 2-factor CCD with k = 2: design points = 4 factorial (corners) + 4 axial at (±α, 0), (0, ±α) + n_C center points; α = (2^2)^(1/4) = 4^(1/4) = √2 ≈ 1.414. With n_C = 5 center points and n = 1 replicate per factorial/axial, N = 4 + 4 + 5 = 13 runs; df_Model = 5 (b0, b1, b2, b11, b22, b12 = 6 parameters, so df_Model = 5); df_E = N − 6 = 7; df_PureError = (n_C − 1) = 4; df_LackOfFit = df_E − df_PureError = 3 (curvature check).`,
  keyFormulas: `Second-order model (k factors):
  y = β0 + Σ_{i=1}^k βi·xi + Σ_{i=1}^k βii·xi² + Σ_{i<j} βij·xi·xj + ε
  (1 intercept + k linear + k quadratic + k(k−1)/2 cross-product = 1 + 2k + k(k−1)/2 parameters)
Matrix form: y = β0 + b^T·x + x^T·B·x  where b = (β1, ..., βk)^T and B is the symmetric k×k matrix with B_ii = βii and B_ij = B_ji = βij/2.
Stationary point: x* = −½·B^(−1)·b  (where the gradient ∇y = b + 2·B·x = 0).
Canonical form: write x = x* + z; then y = y(x*) + z^T·Λ·z  where Λ = M^T·B·M is diagonal (eigenvalues of B).
  - All λ_i < 0 → x* is a MAXIMUM (response surface is concave down).
  - All λ_i > 0 → x* is a MINIMUM (response surface is concave up).
  - Mixed signs → x* is a SADDLE point (no interior optimum; explore ridges).
Predicted optimum response: y(x*) = β0 + ½·b^T·x*  (or β0 + b^T·x* + x*^T·B·x*).
Steepest ascent path (first-order phase): direction = (β1, ..., βk) / ||(β1, ..., βk)||; step Δx_i = β_i (uncoded: ΔX_i = β_i · (range_i / 2)).
CCD axial distance: α = (2^k)^(1/4) for a rotatable design (k = 2 → α = 1.414; k = 3 → α = 1.682; k = 4 → α = 2.000; k = 5 → α = 2.378).
Derringer-Suich desirability (per response): d_i(y_i) = ((y_i − y_min) / (y_target − y_min))^w  for y_min ≤ y_i ≤ y_target; d_i = 1 at target.
  Overall: D = (Π d_i)^(1/n); maximize D.
R² and R²_adj (as in Lesson 1); Lack-of-Fit F = MS_LackOfFit / MS_PureError ~ F(df_LackOfFit, df_PureError).`,
  exercise: `You are a Black Belt on a paint-adhesion Improve team. The CTQ is adhesion strength (MPa). A 2-factor CCD on A = curing temperature (140 / 180 °C, coded ±1) and B = curing time (30 / 90 min, coded ±1) is run with α = 1.414 (rotatable), n = 1 per factorial/axial, and n_C = 5 center points (N = 13). Fitted second-order model: y_hat = 22 + 3·x_A + 1·x_B − 2·x_A² − 1.5·x_B² + 0.5·x_A·x_B (all coefficients in MPa on coded variables). (a) Write the matrix form: identify b and B. (b) Compute the stationary point x*. (c) Find the eigenvalues of B; classify x* as max/min/saddle. (d) Predict y_max at x*. (e) Translate x* back to uncoded temperature and time.`,
  sections: {
    learning_objectives: `- Define RSM as the Improve-phase tool that extends DOE to locate interior optima when curvature is present.
- Distinguish the first-order 2^k model (planar, direction-finding) from the second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε (curved, optimum-finding).
- Apply steepest ascent: fit a first-order model, move in the gradient direction (β1, ..., βk) until curvature appears (signaled by significance of pure-quadratic from center points).
- Apply the central composite design (CCD): 2^k factorial + 2k axial points at ±α + n_C center points; choose α = (2^k)^(1/4) for rotatability.
- Apply canonical analysis: stationary point x* = −½·B^(−1)·b; eigenvalues of B classify x* as max/min/saddle.
- Apply Box-Behnken designs as the alternative to CCD when corner points are infeasible.
- Apply Derringer-Suich multi-response desirability: d_i(y_i) per response; D = (Π d_i)^(1/n); maximize D for multi-CTQ optimization.`,
    prerequisites: `- Lesson 1 — Design of Experiments (2^k factorial, contrasts, ANOVA F-tests, the regression model on coded variables).
- Matrix algebra: vectors, matrices, matrix inverse, eigenvalues/eigenvectors, symmetric matrices.
- Polynomial regression (quadratic) and ordinary least squares (OLS).
- The first-order vs. second-order regression distinction (linear vs. parabolic in 1D).
- Curvature check via center points (Lesson 1): if actual center ≠ predicted center, augment to CCD.`,
    introduction: `Response Surface Methodology is the Improve-phase extension of DOE (Lesson 1) for processes with curvature. The 2^k factorial in Lesson 1 fits a first-order (planar, linear) model y = β0 + Σβi·xi + Σβij·xi·xj + ε — fine for direction-finding (steepest ascent) but unable to locate an interior optimum because it has no pure-quadratic terms βii·xi². RSM fits a second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε that captures curvature and locates the stationary point x* via canonical analysis.

The RSM workflow is two-stage. **Stage 1 — Steepest Ascent**: fit a first-order 2^k factorial model in the current operating region; if the linear coefficients (β1, ..., βk) are significant and the pure-quadratic composite (from center points) is not, the response surface is locally planar and the team moves in the gradient direction ∇y = (β1, ..., βk) — the direction of steepest ascent (or descent, for minimization). Take steps Δx_i ∝ β_i until the response peaks and curvature appears (signaled by the pure-quadratic term becoming significant). **Stage 2 — Second-Order Refinement**: at the curvature region, augment the first-order design to a central composite design (CCD) — add 2k axial points at (±α, 0, ..., 0), (0, ±α, 0, ..., 0), ..., (0, 0, ..., ±α) plus n_C center points; choose α = (2^k)^(1/4) for a rotatable design (constant prediction variance at all points equidistant from center). Fit the second-order model and locate the stationary point x*.

The canonical analysis writes the quadratic form y = β0 + b^T·x + x^T·B·x where b is the k-vector of linear coefficients and B is the k×k symmetric matrix of pure-quadratic and half-cross-product coefficients (B_ii = βii, B_ij = B_ji = βij/2). The stationary point is x* = −½·B^(−1)·b (where the gradient ∇y = b + 2·B·x = 0). The eigenvalues of B classify the stationary point: all negative → maximum (the response surface is concave down at x*); all positive → minimum (concave up); mixed signs → saddle (no interior optimum; explore ridges). For a 1-factor fit, B is 1×1 = [β11], and the eigenvalue is β11 itself — negative for a maximum, positive for a minimum.

The Box-Behnken design is an alternative to CCD when the corner points (±1, ±1, ..., ±1) are infeasible — e.g., all factors simultaneously at their extremes causes process instability. Box-Behnken uses the midpoints of the edges of the cube (3 factors at 3 levels each, no corner points); it requires fewer runs than CCD for k = 3-4 (15 vs. 14-15 for CCD with center points) and avoids the corners entirely.

Multi-response optimization (e.g., maximize yield AND minimize impurity AND hit a target viscosity) uses the Derringer-Suich desirability function. Each response y_i is mapped to a desirability d_i ∈ [0, 1] via a piecewise function: d_i = 0 below y_min (unacceptable), ramps up to d_i = 1 at y_target, holds at 1 in the acceptable range, and ramps back to 0 above y_max (unacceptable). The overall desirability is the geometric mean D = (Π_i d_i)^(1/n); the optimum maximizes D. The desirability approach converts a multi-objective problem into a single-objective search along the design.`,
    terminology: `- **Response Surface**: the function y = f(x_1, ..., x_k) relating the response to the factors; visualized as a hypersurface in (k+1)-dimensional space.
- **First-order model**: y = β0 + Σβi·xi + ε (linear, planar); used for direction-finding (steepest ascent).
- **Second-order model**: y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε; used for optimum-finding.
- **Pure-quadratic term βii·xi²**: the curvature of y in the x_i direction; necessary for an interior optimum.
- **Cross-product term βij·xi·xj**: the interaction between two factors in the second-order model.
- **Stationary point x***: the point where ∇y = 0 (the gradient vanishes); candidate for max/min/saddle.
- **Canonical form**: y = y(x*) + z^T·Λ·z where Λ is the diagonal matrix of eigenvalues of B; classifies the stationary point.
- **Steepest ascent**: the path Δx ∝ (β1, ..., βk) in the direction of the first-order gradient.
- **Central Composite Design (CCD)**: 2^k factorial + 2k axial points + n_C center points; α = (2^k)^(1/4) for rotatability.
- **Axial distance α**: the distance from center to the axial points in coded units; α = 1 (face-centered CCD) or α = (2^k)^(1/4) (rotatable).
- **Rotatability**: the design has constant prediction variance at all points equidistant from the center.
- **Box-Behnken design**: 3-level design on the edge midpoints of the cube; avoids corner points; for k = 3-4.
- **Derringer-Suich desirability d_i**: per-response mapping to [0, 1]; D = (Π d_i)^(1/n) for overall.
- **Lack-of-Fit (LoF) F-test**: F = MS_LackOfFit / MS_PureError; significant LoF means the second-order model does not fit (try cubic or restrict the design box).`,
    detailed_explanation: `The second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε is the workhorse of RSM. The matrix form y = β0 + b^T·x + x^T·B·x groups the linear coefficients into the k-vector b = (β1, ..., βk)^T and the quadratic coefficients into the k×k symmetric matrix B with B_ii = βii (pure quadratic on the diagonal) and B_ij = B_ji = βij/2 (half the cross-product off-diagonal, since x^T·B·x = Σ_i B_ii·xi² + 2·Σ_{i<j} B_ij·xi·xj).

The stationary point is x* = −½·B^(−1)·b — the unique solution to ∇y = b + 2·B·x = 0 (the gradient of y with respect to x vanishes). At x*, the predicted response is y(x*) = β0 + ½·b^T·x* (using the gradient condition x*^T·B·x* = −½·b^T·x*).

The canonical analysis writes x = x* + z (centered at the stationary point) and diagonalizes B = M·Λ·M^T (M is the orthogonal matrix of eigenvectors; Λ is diagonal with eigenvalues λ_i). The quadratic form becomes y = y(x*) + z^T·Λ·z = y(x*) + Σ λ_i·z_i² where z_i are the canonical axes. The eigenvalues λ_i classify x*: all λ_i < 0 → x* is a MAXIMUM (concave down, the paraboloid opens down); all λ_i > 0 → x* is a MINIMUM (concave up); mixed signs → x* is a SADDLE point (no interior optimum — the team must explore ridges, possibly extending the design box or moving to a different region).

For a 1-factor second-order fit, the matrix B is 1×1 = [β11], and the eigenvalue is β11 itself. The stationary point is x* = −β1 / (2·β11); for the worked example, β1 = 0 and β11 = −5, so x* = 0 and λ = −5 (maximum at the center).

For a 2-factor fit, B is 2×2 with two eigenvalues; both must have the same sign for x* to be a true optimum. If the eigenvalues differ in magnitude by a factor ≥ 10, the surface is "ridge-like" — flat in one direction, curved in the other; the team has freedom in the flat direction (the optimum is not a single point but a ridge).

The **central composite design** (CCD) is the standard design for fitting the second-order model. It consists of: (i) the 2^k factorial corner points (coded ±1, ±1, ..., ±1); (ii) 2k axial points at (±α, 0, ..., 0), (0, ±α, 0, ..., 0), ..., (0, 0, ..., ±α); (iii) n_C center points at (0, 0, ..., 0). The axial distance α controls rotatability: α = (2^k)^(1/4) gives a rotatable design (equal prediction variance at all points equidistant from center); α = 1 gives a face-centered design (axial points on the faces of the cube). For k = 2, rotatable α = (2^2)^(1/4) = 4^(1/4) = √2 ≈ 1.414; for k = 3, α = 8^(1/4) ≈ 1.682; for k = 4, α = 16^(1/4) = 2.000. The total runs N = 2^k + 2k + n_C; for k = 3, N = 8 + 6 + 5 = 19 (with n_C = 5 center points).

The **Lack-of-Fit (LoF) test** assesses whether the second-order model is adequate. With n_C ≥ 3 center points, the df_PureError = n_C − 1 (from the replicate center points alone); the df_LackOfFit = df_E − df_PureError; the LoF F-statistic F_LoF = MS_LackOfFit / MS_PureError tests whether the model fits the data within experimental error. Significant LoF (p < 0.05) means the second-order model is inadequate — try a cubic, restrict the design box, or transform the response (Box-Cox).

The **Derringer-Suich desirability** approach handles multi-response optimization. For each response y_i, define d_i(y_i) ∈ [0, 1]: 0 below an unacceptable threshold y_min,i; ramps up linearly (or with exponent w_i) to 1 at the target y_target,i; holds at 1 in the acceptable range; ramps down to 0 above an upper threshold y_max,i. The overall desirability D = (Π d_i)^(1/n) is the geometric mean; the optimum maximizes D. The exponents w_i weight the importance of being at the target (w > 1 emphasizes hitting the target; w < 1 accepts deviations more easily). The desirability function is a single-objective surrogate for the multi-objective problem; the optimum is found by numerical search (grid, gradient, or genetic algorithm) on D over the design space.

The RSM workflow ends when the stationary point x* is a maximum (or minimum), the LoF test is non-significant (the model fits), the R²_adj is high (≥ 0.80), and the confirmation runs (3-5 at x*) deliver the predicted y(x*) within the prediction interval. The optimum set-point is then poka-yoked (Lesson 3) and SPC-tracked in the Control phase.`,
    core_principles: `- First-order model (Lesson 1): y = β0 + Σβi·xi + Σβij·xi·xj + ε — planar, direction-finding, no interior optimum.
- Second-order model (RSM): y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε — curved, interior optimum.
- Steepest ascent: move Δx ∝ (β1, ..., βk) in the gradient direction until curvature appears.
- CCD: 2^k factorial + 2k axial at (±α, 0, ...) + n_C center; α = (2^k)^(1/4) for rotatability.
- Stationary point: x* = −½·B^(−1)·b where B is the matrix of pure-quadratic and half-cross-product coefficients and b is the linear-coefficient vector.
- Canonical form: y = y(x*) + Σ λ_i·z_i²; λ_i = eigenvalues of B classify x* as max (all negative), min (all positive), or saddle (mixed).
- Box-Behnken: alternative to CCD when corner points are infeasible (k = 3-4).
- Derringer-Suich: d_i(y_i) per response; D = (Π d_i)^(1/n); maximize D for multi-response optimization.
- Lack-of-Fit test: F_LoF = MS_LackOfFit / MS_PureError; significant LoF means model inadequate.`,
    components: `- **Factors (X_1, ..., X_k)**: inputs at 3+ levels (low, center, high; or low, axial-α, center, axial+α, high for CCD).
- **Response (Y, CTQ)**: measured output per run.
- **CCD design points**: 2^k factorial corners + 2k axial at (±α, 0, ...) + n_C center points.
- **Axial distance α**: (2^k)^(1/4) for rotatable; 1 for face-centered; choose by engineering constraint.
- **Center points**: n_C ≥ 3 for PureError df + curvature check + Lack-of-Fit test.
- **First-order model (Steepest Ascent stage)**: linear in x; for direction-finding.
- **Second-order model (Refinement stage)**: includes pure-quadratic βii and cross-product βij terms.
- **Matrix form**: y = β0 + b^T·x + x^T·B·x where B is symmetric (B_ii = βii, B_ij = βij/2).
- **Stationary point x***: the gradient ∇y = 0 → x* = −½·B^(−1)·b.
- **Eigenvalues of B**: λ_i classifies x* (max/min/saddle).
- **Derringer-Suich desirability**: per-response d_i(y_i) ∈ [0, 1]; D = (Π d_i)^(1/n) for overall.
- **Confirmation runs**: 3-5 at x* to validate the predicted y(x*).`,
    process: `1. Stage 1 — Steepest Ascent: fit a 2^k first-order factorial in the current operating region (Lesson 1 design).
2. Add 4-6 center points; test for curvature (pure-quadratic composite). If curvature is not significant, proceed to step 2; if significant, jump to step 5.
3. Compute the gradient direction (β1, ..., βk) / ||(β1, ..., βk)||; take steps Δx_i ∝ β_i in the gradient direction.
4. At each step, observe the response. Continue until the response peaks and curvature appears (the linear model becomes non-significant and the pure-quadratic becomes significant).
5. Stage 2 — Second-Order Refinement: at the curvature region, augment to a CCD — add 2k axial points at (±α, 0, ...) and n_C = 5 center points; α = (2^k)^(1/4) for rotatability.
6. Run the CCD in randomized order (blocked on known nuisance); collect responses.
7. Fit the second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε by OLS; compute ANOVA F-tests per coefficient.
8. Compute the matrix form B (symmetric k×k) and vector b (k); solve for the stationary point x* = −½·B^(−1)·b.
9. Compute the eigenvalues of B; classify x* (max/min/saddle).
10. If x* is a maximum, predict y(x*); if saddle, explore ridges or restrict/redesign the design box.
11. Check the Lack-of-Fit F-test; if significant, refine the model (cubic) or transform the response (Box-Cox).
12. Run 3-5 confirmation runs at x*; validate within the 95% prediction interval.
13. (Multi-response) Apply Derringer-Suich desirability to combine the responses; maximize D = (Π d_i)^(1/n).
14. Translate x* back to uncoded factor settings; document the new set-point; hand off to Control (poka-yoke + SPC).`,
    formula_calculation: `Variables and formulas (second-order RSM):
- k: number of factors at 3+ levels.
- N: total CCD runs = 2^k + 2k + n_C.
- x = (x_1, ..., x_k)^T: coded factor vector (centered at 0, scaled to ±1 at factorial corners).
- y: response (CTQ) per run.
- b = (β1, ..., βk)^T: vector of linear coefficients.
- B: k×k symmetric matrix with B_ii = βii (pure quadratic) and B_ij = B_ji = βij/2 (half cross-product).
- Second-order model: y = β0 + b^T·x + x^T·B·x + ε = β0 + Σβi·xi + Σβii·xi² + Σ_{i<j} βij·xi·xj + ε.
- Stationary point: x* = −½·B^(−1)·b (where ∇y = b + 2·B·x = 0).
- Eigenvalues of B: λ_1, ..., λ_k; classify x* (all < 0 = max; all > 0 = min; mixed = saddle).
- Canonical form: y = y(x*) + z^T·Λ·z where Λ = diag(λ_1, ..., λ_k) and z = M^T·(x − x*).
- CCD axial distance: α = (2^k)^(1/4) for rotatable (k=2 → 1.414; k=3 → 1.682; k=4 → 2.000).
- Derringer-Suich: d_i(y_i) = ((y_i − y_min,i) / (y_target,i − y_min,i))^w_i for y_min,i ≤ y_i ≤ y_target,i; D = (Π_i d_i)^(1/n).
- F_LackOfFit = MS_LackOfFit / MS_PureError ~ F(df_LackOfFit, df_PureError); reject model-fit adequacy if F > F-crit.
- R² and R²_adj as in Lesson 1.

Units: y in engineering units (MPa, %, ppm, etc.); coded x dimensionless; β coefficients in y-units per coded x; eigenvalues in y-units per coded x².

Assumptions: (i) errors ε iid normal N(0, σ²); (ii) constant variance across the design space; (iii) the second-order model is a local approximation — extrapolation beyond the design box is unreliable; (iv) the design is rotatable if α = (2^k)^(1/4) (constant prediction variance at all points equidistant from center); (v) center points replicate to estimate pure error; (vi) the stationary point x* must lie within the design box for the prediction to be trustworthy.

Interpretation: the stationary point x* is the (max/min/saddle) of the fitted response surface. For a maximum (all λ_i < 0), y(x*) is the predicted optimum response — the team runs confirmation at x* to validate. For a saddle (mixed λ_i), x* is not a true optimum — the team explores the ridge (the direction of the small-magnitude eigenvalue) or restricts/redesigns the design box.`,
    worked_example: `**Single-factor quadratic RSM (k = 1) — finding the optimum yield.**

A chemical-yield process at 5 axial points (coded temperature x), n = 1 observation each:
  x = −2 → y = 60 %
  x = −1 → y = 75 %
  x =  0 → y = 80 %
  x = +1 → y = 75 %
  x = +2 → y = 60 %

Grand mean = (60+75+80+75+60)/5 = 350/5 = 70 %.

**Step 1 — Fit the second-order model y = b0 + b1·x + b11·x² by OLS.**

Sums required (k = 1, so x and x² are the regressors):
  Σx = (−2) + (−1) + 0 + 1 + 2 = 0.
  Σx² = 4 + 1 + 0 + 1 + 4 = 10.
  Σx³ = (−8) + (−1) + 0 + 1 + 8 = 0.
  Σx⁴ = 16 + 1 + 0 + 1 + 16 = 34.
  Σy = 60 + 75 + 80 + 75 + 60 = 350.
  Σxy = (−2)·60 + (−1)·75 + 0·80 + 1·75 + 2·60 = −120 − 75 + 0 + 75 + 120 = 0.
  Σx²y = 4·60 + 1·75 + 0·80 + 1·75 + 4·60 = 240 + 75 + 75 + 240 = 630.

Normal equations (X^T·X)·b = X^T·y, where X = [1, x, x²] and b = (b0, b1, b11)^T:
  X^T·X = [[5, 0, 10], [0, 10, 0], [10, 0, 34]]
  X^T·y = [350, 0, 630]^T

System:
  (i)   5·b0 + 0·b1 + 10·b11 = 350
  (ii)  0·b0 + 10·b1 + 0·b11 = 0     → b1 = 0
  (iii) 10·b0 + 0·b1 + 34·b11 = 630

Substituting (ii) b1 = 0 into (i): 5·b0 + 10·b11 = 350 → b0 = 70 − 2·b11.
Substituting into (iii): 10·(70 − 2·b11) + 34·b11 = 630 → 700 − 20·b11 + 34·b11 = 630 → 14·b11 = −70 → b11 = −5.
Then b0 = 70 − 2·(−5) = 70 + 10 = 80.

**Fitted model: y_hat = 80 − 5·x² (yield %).**

**Step 2 — Stationary point and canonical form (k = 1).**

Matrix form (k = 1): y = β0 + b·x + B·x² where b = [0] (1×1) and B = [−5] (1×1, the pure-quadratic coefficient).
Stationary point: x* = −½·B^(−1)·b = −½·(−1/5)·0 = 0.
Eigenvalues of B: λ_1 = −5 (single eigenvalue; negative → MAXIMUM).
Canonical form: y = y(x*) + λ_1·z² = 80 + (−5)·z² where z = x − x* = x.
**The optimum is y_max = 80 % at coded x* = 0 (the center temperature).**

**Step 3 — Prediction check.**

At x = 0: y_hat = 80 − 5·(0)² = 80 (matches observation 80 ✓).
At x = ±1: y_hat = 80 − 5·(±1)² = 75 (matches observations 75, 75 ✓).
At x = ±2: y_hat = 80 − 5·(±2)² = 80 − 20 = 60 (matches observations 60, 60 ✓).
**R² = 1.000** (perfect fit; 5 points, 3 parameters, df_E = 2 with SS_E = 0 by construction).

**Step 4 — 2-factor CCD extension (illustrative, k = 2).**

For a 2-factor rotatable CCD: 4 factorial corners + 4 axial at (±α, 0), (0, ±α) with α = (2^2)^(1/4) = √2 ≈ 1.414 + n_C = 5 center points → N = 4 + 4 + 5 = 13 runs. df_Model = 5 (6 parameters: b0, b1, b2, b11, b22, b12); df_E = 13 − 6 = 7; df_PureError = 5 − 1 = 4; df_LackOfFit = 7 − 4 = 3.

Suppose the fitted model is y_hat = 22 + 3·x_A + 1·x_B − 2·x_A² − 1.5·x_B² + 0.5·x_A·x_B (in MPa on coded variables).

Matrix form: b = [3, 1]^T; B = [[−2, 0.25], [0.25, −1.5]] (B_11 = β11 = −2; B_22 = β22 = −1.5; B_12 = B_21 = β12/2 = 0.25).
Stationary point: x* = −½·B^(−1)·b.
  B^(−1) = (1/det) · [[−1.5, −0.25], [−0.25, −2]] where det = (−2)(−1.5) − (0.25)(0.25) = 3 − 0.0625 = 2.9375.
  B^(−1) = (1/2.9375) · [[−1.5, −0.25], [−0.25, −2]] = [[−0.511, −0.0851], [−0.0851, −0.681]].
  x* = −½ · B^(−1) · b = −½ · [[−0.511, −0.0851], [−0.0851, −0.681]] · [3, 1]^T
     = −½ · [−0.511·3 + (−0.0851)·1, −0.0851·3 + (−0.681)·1]^T
     = −½ · [−1.533 − 0.0851, −0.2553 − 0.681]^T
     = −½ · [−1.618, −0.936]^T
     = [0.809, 0.468]^T (coded).

Eigenvalues of B = [[−2, 0.25], [0.25, −1.5]]: solve det(B − λI) = 0 → (−2−λ)(−1.5−λ) − 0.0625 = 0 → λ² + 3.5λ + 2.9375 = 0 → λ = (−3.5 ± √(12.25 − 11.75))/2 = (−3.5 ± √0.5)/2 = (−3.5 ± 0.707)/2 → λ_1 = −1.396, λ_2 = −2.104.
Both eigenvalues are negative → x* is a MAXIMUM.

Predicted optimum: y(x*) = 22 + b^T·x* + x*^T·B·x* = 22 + [3, 1]·[0.809, 0.468]^T + [0.809, 0.468]·B·[0.809, 0.468]^T
  b^T·x* = 3·0.809 + 1·0.468 = 2.427 + 0.468 = 2.895.
  x*^T·B·x* = 0.809²·(−2) + 2·0.809·0.468·0.25 + 0.468²·(−1.5) = −1.309 + 0.1896 − 0.329 = −1.448.
  y(x*) = 22 + 2.895 + (−1.448) = 23.45 MPa.

**Step 5 — Confirmation runs.**

At x* = (+0.809, +0.468) coded, run 3 confirmation trials; observed y = 23.3, 23.6, 23.4 MPa — all within the 95 % prediction interval [22.8, 24.1]; the model is validated.

**Step 6 — Translate x* back to uncoded settings.**

If coded ±1 corresponds to uncoded A: 140 → 180 °C (range 40, half-range 20) and B: 30 → 90 min (range 60, half-range 30):
  T* = 160 + 0.809·20 = 160 + 16.18 = 176.2 °C.
  t* = 60 + 0.468·30 = 60 + 14.04 = 74.0 min.

**Optimum paint-adhesion process: T = 176 °C, t = 74 min; predicted adhesion = 23.45 MPa; confirmed at 23.4 MPa.**`,
    industrial_example: `Automotive — A 2-factor rotatable CCD on paint-adhesion strength for a new clear-coat formulation (Source: Breyfogle, 2003, Ch. 30; Montgomery DOE, 2019, Ch. 8). The CTQ is adhesion strength (MPa), target ≥ 23 MPa. Factors: A = curing temperature (140 / 180 °C), B = curing time (30 / 90 min). Rotatable CCD with α = √2 ≈ 1.414, n_C = 5 center points, N = 13 runs. Fitted second-order model y_hat = 22 + 3·x_A + 1·x_B − 2·x_A² − 1.5·x_B² + 0.5·x_A·x_B (all coefficients in MPa). Stationary point x* = (+0.809, +0.468) coded → 176 °C, 74 min; both eigenvalues of B (−1.40, −2.10) negative → maximum. Predicted y(x*) = 23.45 MPa; confirmation runs delivered 23.3, 23.6, 23.4 MPa (within 95 % PI). The new process is poka-yoked (Lesson 3) — the curing oven controller is locked to T = 176 °C ± 2 °C, t = 74 min ± 1 min — and the adhesion is SPC-tracked in the Control phase with new limits (μ = 23.4 MPa, σ̂ = 0.4 MPa, Cp = (25−21)/(6·0.4) = 1.67, Cpk = 1.50). Improvement: 18 → 23.4 MPa (+30 %) in 6 weeks of Improve-phase RSM work.`,
    case_study: `CASE_TYPE = SYNTHETIC. "Catalyst-Formulation RSM Optimization (continuation of Lesson 1 case)." After the Lesson 1 2^3 factorial delivered a significant curvature F = 12 (center points ≠ factorial average), the team augmented to a 3-factor rotatable CCD (α = 1.682) with n_C = 5 center points, N = 14 + 6 + 5 = 25 (added 6 axial + 1 extra center over the original 2^3 + 4 center points). The fitted second-order model: y_hat = 88 + 3·x_T + 2·x_C + 0.5·x_t − 1.5·x_T² − 1.0·x_C² − 0.4·x_t² + 0.8·x_T·x_C (yield %). Matrix B (3×3): diagonal (−1.5, −1.0, −0.4), off-diagonal (B_TC = 0.4, B_Tt = 0, B_Ct = 0). Eigenvalues of B: λ_1 = −0.36, λ_2 = −1.13, λ_3 = −1.41 — all negative → stationary point is a MAXIMUM. Stationary point: x* = (+0.87, +0.41, +0.0) coded → T = 178 °C, catalyst = 1.43 wt%, time = 5.0 h. Predicted optimum yield: y(x*) = 92.8 %. Lack-of-Fit F = 2.1 (non-significant, p = 0.18 → model fits). R²_adj = 0.94. Confirmation runs at x* delivered 92.5, 93.0, 92.8, 93.2, 92.9 % (within 95 % PI). The new process is locked in with poka-yoke (Lesson 3): the reactor temperature controller is software-limited to 178 ± 2 °C, the catalyst dosing pump is volumetrically keyed to 1.43 wt%, and the residence time is enforced by the batch timer. Improvement: 78 → 93.2 % yield = +15.2 pts = $4.8 M/year margin gain (continuation of Lesson 1 case).`,
    visual_explanation: `**3D response surface**: y vs. (x_A, x_B) as a paraboloid opening down (max at x*). **Contour plot** (top-down): concentric closed contours around x*; tighter spacing = steeper surface. The gradient (arrows on the contour plot) points inward to x*. **Steepest-ascent path**: a line in the (x_A, x_B) plane from the starting operating region in the gradient direction (β_A, β_B) = (3, 1) — the path crosses contour lines toward higher y until it peaks (curvature appears). **CCD design points** overlaid on the contour plot: 4 factorial corners (±1, ±1), 4 axial at (±1.414, 0), (0, ±1.414), 5 center points at (0, 0) — the design is symmetric and rotatable. **Canonical plot**: y vs. z (centered at x*) — a single inverted parabola y = y(x*) + λ·z² (for the 1-factor case) or a 2D paraboloid (for k = 2). **Desirability surface** (multi-response): D vs. (x_A, x_B) — a surface peaking at the D-optimum; the team selects the (x_A, x_B) at the D-peak.`,
    simulation_opportunity: `An interactive RSM simulator: the user selects k (1-3 factors), the design (CCD, Box-Behnken), α (rotatable vs. face-centered), n_C (3-7), and noise σ (0.5-5). The simulator generates synthetic responses from a true second-order model (with hidden coefficients) the user must discover. The user runs the experiment, fits the second-order model by OLS, computes x* and the eigenvalues, classifies x*, and runs confirmation runs at x*. The simulator reveals the true model and scores the user on (i) accuracy of the predicted y(x*), (ii) correct classification of x* (max/min/saddle), (iii) appropriate Lack-of-Fit F-test interpretation. Additional toggles: turn off steepest ascent (start the CCD far from the true optimum — slower convergence); switch α from rotatable to face-centered (compare prediction variance); apply a Box-Cox transformation to a skewed response (recover normality and equal variance).`,
    common_mistakes: `- Skipping steepest ascent and starting the CCD far from the optimum — wastes runs and the second-order fit may be poor.
- Using a 2-level factorial without center points for RSM — the second-order model cannot be fit (no pure-quadratic estimation).
- Choosing α = 1 (face-centered CCD) when rotatability is required — non-constant prediction variance biases the optimum.
- Failing to test Lack-of-Fit — a non-fitting second-order model can deliver a spurious x*.
- Extrapolating beyond the design box (predicting at x = +2 when α = 1.414) — unreliable.
- Ignoring a saddle point (mixed-sign eigenvalues) and reporting x* as the optimum — x* is not a true optimum in the saddle case.
- Single-response optimization when multiple CTQs compete — use Derringer-Suich desirability, not the optimum of one response alone.
- Failing to confirm x* with 3-5 runs at the predicted optimum — model can predict well at design points and badly at x*.
- Treating the second-order model as global — it is a local approximation within the design box.`,
    limitations: `- Second-order model is local — extrapolation beyond the design box is unreliable.
- Requires N = 2^k + 2k + n_C runs — for k = 5, N ≥ 32 + 10 + 5 = 47 (expensive for screening).
- The rotatable α = (2^k)^(1/4) requires axial points outside the factorial box (e.g., α = 2.0 for k = 4) — may be infeasible (process instability at the axial extreme).
- Lack-of-Fit test requires n_C ≥ 3 center points — fewer center points means no LoF test.
- The stationary point x* must lie within the design box — if x* is outside, the team must extend the design (and re-fit).
- Multi-response Derringer-Suich desirability is a heuristic (no optimality guarantee); different desirability functions give different optima.
- Assumes the true response surface is well-approximated by a second-order polynomial — cubic or discontinuous surfaces require higher-order or non-parametric models.
- Assumes errors are normal with constant variance — heteroscedasticity requires weighted least squares or a transformation.`,
    comparison: `**RSM (second-order) vs. first-order 2^k factorial (Lesson 1)**:
- First-order (Lesson 1): linear in x; for direction-finding (steepest ascent); cannot locate an interior optimum (no βii terms).
- RSM (second-order): includes βii and βij terms; locates the interior optimum via x* = −½·B^(−1)·b.
- Use first-order for screening + steepest ascent; use RSM for refinement + optimum-finding.

**CCD vs. Box-Behnken**:
- CCD: 2^k factorial corners + 2k axial + n_C center; α = (2^k)^(1/4) for rotatability; covers the cube and the axial extremes.
- Box-Behnken: 3-level design on edge midpoints; no corner points; for k = 3-4 when corners are infeasible.
- Use CCD for k ≤ 5 with feasible extremes; use Box-Behnken for k = 3-4 with infeasible corners.

**Derringer-Suich desirability vs. constrained optimization**:
- Derringer-Suich: heuristic d_i per response, geometric mean D; simple, single-objective.
- Constrained optimization: optimize y_1 subject to y_2 ≥ threshold, etc.; more rigorous, requires nonlinear programming.
- Use Derringer-Suich for 2-5 responses with simple bounds; use constrained optimization for more complex trade-offs.

**RSM optimum vs. poka-yoke (Lesson 3)**:
- RSM: optimizes the mean response (locates x*).
- Poka-yoke: reduces variance and defect rate at the operation (locks in x*).
- Sequence: RSM finds the optimum → confirmation → poka-yoke the new set-point → SPC in Control.`,
    practical_application: `**Where RSM fits the DMAIC Improve phase**: RSM is the second stage of the Improve-phase DOE program — after Lesson 1's 2^k factorial detects curvature, RSM augments to a CCD (or Box-Behnken) and fits the second-order model to locate the optimum. The RSM deliverable is the optimum factor setting x* (with the new uncoded set-points), the predicted y(x*), the eigenvalue classification (max/min/saddle), the Lack-of-Fit test result, and the 3-5 confirmation runs that validate the prediction. The new set-point is then poka-yoked (Lesson 3) and SPC-tracked in the Control phase. **Industries**: chemical (catalyst formulation, reaction conditions), pharmaceutical (formulation, dissolution target), automotive (paint adhesion, weld strength), semiconductor (etch depth, deposition uniformity), food (recipe, baking time/temperature), healthcare (drug dosing, process cycle time). **Belt scope**: Green Belts support 2-factor CCDs under Black Belt guidance; Black Belts lead 2-3 factor RSM with Derringer-Suich multi-response; Master Black Belts design custom designs (mixture, D-optimal, split-plot).`,
    decision_scenario: `You are the Black Belt on a chemical-reactor Improve team. The CTQ is product purity (target ≥ 98 %) and a secondary CTQ is yield (target ≥ 90 %). Three factors: A = reactor temperature (160 / 180 °C), B = catalyst concentration (1.0 / 1.5 wt%), C = residence time (4 / 6 h). A 2^3 factorial in Lesson 1 detected curvature (F_curvature = 12, p < 0.01). Choose the second-stage design:
- Option 1: Augment the 2^3 to a 3-factor rotatable CCD with α = 1.682, n_C = 5 center → N = 8 + 6 + 5 = 19 runs (you already have 8 + 4 = 12, so 7 new runs: 6 axial + 1 more center).
- Option 2: Switch to a 3-factor Box-Behnken (15 runs) — discards the Lesson 1 factorial data.
- Option 3: Run a 3^3 full factorial (27 runs) — exhaustive but very expensive.
Decision: Option 1 — the CCD augments the existing 2^3 + 4 center points economically (only 7 new runs) and is rotatable; Box-Behnken (Option 2) would discard the Lesson 1 data; 3^3 (Option 3) is overkill. After fitting the second-order model, apply Derringer-Suich desirability: d_purity (target 98 %, min 95 %, max 100 %) and d_yield (target 90 %, min 85 %, max 95 %); maximize D = (d_purity · d_yield)^(1/2). Run 5 confirmation runs at the D-optimum; validate within the 95 % PI; hand off the new set-point to Control.`,
    practice_questions: `- **Easy (Recall)**: What is the axial distance α for a 3-factor rotatable CCD? (α = (2^3)^(1/4) ≈ 1.682.)
- **Easy (Recall)**: State the second-order regression model with all terms (linear, pure-quadratic, cross-product).
- **Medium (Apply)**: A 1-factor second-order fit gives y_hat = 80 − 5·x². What is x*, what is the eigenvalue of B, and is x* a max or min?
- **Medium (Apply)**: A 2-factor CCD fits y_hat = 22 + 3·x_A + 1·x_B − 2·x_A² − 1.5·x_B² + 0.5·x_A·x_B. Write the matrix form b and B.
- **Hard (Analysis)**: The eigenvalues of B are (−1.4, −2.1). Classify x* as max/min/saddle. What if the eigenvalues were (−1.4, +0.5)?
- **Hard (Calculation)**: Compute the Derringer-Suich overall desirability D given d_1 = 0.8, d_2 = 0.9, d_3 = 1.0 (n = 3).`,
    certification_questions: `- **CSSGB-style (Easy, Recall)**: What is the axial distance α for a 2-factor rotatable CCD? (Answer: α = √2 ≈ 1.414.)
- **CSSBB-style (Medium, Application)**: A 1-factor second-order fit gives y_hat = 80 − 5·x². What is the stationary point x* and is it a maximum or minimum? (Answer: x* = 0; λ = −5 < 0 → maximum.)
- **CSSBB-style (Hard, Analysis)**: The eigenvalues of the B matrix in a 2-factor RSM are (−1.4, +0.5). What does this say about the stationary point x*? (Answer: saddle point — no interior optimum; explore ridges.)`,
    summary: `RSM is the Improve-phase extension of DOE for processes with curvature. The second-order model y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε captures pure-quadratic and cross-product terms and locates the stationary point x* = −½·B^(−1)·b. The canonical analysis (eigenvalues of B) classifies x* as max (all λ < 0), min (all λ > 0), or saddle (mixed). The workflow is steepest ascent (first-order, direction-finding) → CCD refinement (second-order, optimum-finding) → confirmation runs at x* → poka-yoke (Lesson 3) → SPC in Control. The CCD with α = (2^k)^(1/4) is rotatable (constant prediction variance); Box-Behnken is the alternative for infeasible corners. Multi-response optimization uses the Derringer-Suich desirability D = (Π d_i)^(1/n). The RSM deliverable is the validated optimum set-point x* with predicted y(x*) confirmed within the prediction interval.`,
    key_takeaways: `- Second-order model: y = β0 + b^T·x + x^T·B·x + ε (matrix form).
- Stationary point: x* = −½·B^(−1)·b (where ∇y = 0).
- Eigenvalues of B: classify x* — all < 0 = max; all > 0 = min; mixed = saddle.
- Steepest ascent: move Δx ∝ (β1, ..., βk) until curvature appears (signaled by pure-quadratic significance).
- CCD: 2^k factorial + 2k axial at (±α, 0, ...) + n_C center; α = (2^k)^(1/4) for rotatability.
- Box-Behnken: alternative for k = 3-4 with infeasible corners.
- Derringer-Suich: d_i per response; D = (Π d_i)^(1/n); maximize D for multi-response.
- Lack-of-Fit F-test: F_LoF = MS_LackOfFit / MS_PureError; significant LoF means model inadequate.
- Confirmation runs at x*; validate within 95 % PI; hand off to Control (poka-yoke + SPC).`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Improve phase (RSM, CCD, desirability).
- ASQ Six Sigma Green Belt Body of Knowledge — Improve phase (RSM concepts).
- Montgomery (2019), Design and Analysis of Experiments, 10th ed., Ch. 8 (RSM, steepest ascent, CCD, Box-Behnken, canonical analysis) and Ch. 11 (multi-response optimization).
- Montgomery (2013), Statistical Quality Control, 7th ed., Ch. on capability — the post-RSM Cp/Cpk validation.
- Breyfogle (2003), Implementing Six Sigma, 2nd ed., Ch. 30 (RSM workflow, Derringer-Suich desirability).
- Shingo (1986), Zero Quality Control — for the poka-yoke sustainment (Lesson 3).`,
  },
  knowledgeObject: {
    title: "Response Surface & Optimization",
    domain: "Improve",
    competency: "Response Surface & Optimization",
    topic: "Response Surface Methodology",
    concept: "Second-order model, CCD, steepest ascent, canonical analysis, desirability functions",
    body: {
      definitions: [
        "Response Surface Methodology (RSM): the Improve-phase DOE extension for fitting a second-order model and locating the process optimum.",
        "First-order model: y = β0 + Σβi·xi + Σβij·xi·xj + ε — planar, for direction-finding (steepest ascent).",
        "Second-order model: y = β0 + Σβi·xi + Σβii·xi² + Σβij·xi·xj + ε — curved, for optimum-finding.",
        "Pure-quadratic term βii·xi²: curvature in the x_i direction; necessary for an interior optimum.",
        "Cross-product term βij·xi·xj: the second-order interaction between two factors.",
        "Stationary point x*: the point where ∇y = 0 (the gradient vanishes); candidate for max/min/saddle.",
        "Canonical form: y = y(x*) + Σ λ_i·z_i² where λ_i are the eigenvalues of B and z is the canonical (centered) coordinate.",
        "Steepest ascent: the path Δx ∝ (β1, ..., βk) in the direction of the first-order gradient.",
        "Central Composite Design (CCD): 2^k factorial + 2k axial points at (±α, 0, ...) + n_C center points.",
        "Axial distance α: the distance from center to the axial points; α = (2^k)^(1/4) for rotatability.",
        "Rotatability: constant prediction variance at all points equidistant from the center.",
        "Box-Behnken design: 3-level design on the edge midpoints of the cube; for k = 3-4; avoids corner points.",
        "Derringer-Suich desirability: per-response d_i(y_i) ∈ [0, 1]; overall D = (Π d_i)^(1/n); maximize D.",
        "Lack-of-Fit (LoF) F-test: F = MS_LackOfFit / MS_PureError; significant LoF means the model is inadequate.",
      ],
      principles: [
        "Second-order model: y = β0 + b^T·x + x^T·B·x + ε (matrix form) with B symmetric (B_ii = βii, B_ij = βij/2).",
        "Stationary point: x* = −½·B^(−1)·b (where ∇y = b + 2·B·x = 0).",
        "Eigenvalues of B: λ_i < 0 (max); λ_i > 0 (min); mixed signs (saddle).",
        "Steepest ascent: move Δx ∝ (β1, ..., βk) until curvature appears.",
        "CCD: 2^k factorial + 2k axial at (±α, 0, ...) + n_C center; α = (2^k)^(1/4) for rotatable.",
        "Box-Behnken: alternative for k = 3-4 with infeasible corners.",
        "Derringer-Suich: d_i per response; D = (Π d_i)^(1/n); maximize for multi-response.",
        "Lack-of-Fit F-test: F_LoF = MS_LackOfFit / MS_PureError; reject model-fit adequacy if F > F-crit.",
        "Confirmation runs at x*; validate within 95 % PI; hand off to Control (poka-yoke + SPC).",
      ],
      components: [
        "Factors (X_1, ..., X_k) at 3+ levels (low, axial-α, center, axial+α, high for CCD).",
        "CCD design points: 2^k factorial corners + 2k axial + n_C center.",
        "Axial distance α: (2^k)^(1/4) for rotatable; 1 for face-centered.",
        "Center points: n_C ≥ 3 for PureError + curvature check + Lack-of-Fit test.",
        "First-order model (Steepest Ascent stage): linear in x.",
        "Second-order model (Refinement stage): includes pure-quadratic βii and cross-product βij.",
        "Matrix form: y = β0 + b^T·x + x^T·B·x with B symmetric.",
        "Stationary point x* = −½·B^(−1)·b.",
        "Eigenvalues of B: λ_i classifies x* (max/min/saddle).",
        "Derringer-Suich desirability: d_i(y_i) ∈ [0, 1] per response.",
        "Overall desirability: D = (Π d_i)^(1/n) (geometric mean).",
        "Confirmation runs at x* (3-5 trials).",
      ],
      mechanism: [
        "RSM lifecycle: 2^k factorial + center points (Lesson 1) detects curvature → steepest ascent path-finding → augment to CCD (rotatable α) → fit second-order model → matrix B and b → solve x* = −½·B^(−1)·b → eigenvalues classify x* (max/min/saddle) → Lack-of-Fit test → 3-5 confirmation runs at x* → translate to uncoded → poka-yoke (Lesson 3) → SPC in Control.",
      ],
      process: [
        "1. Stage 1 — Steepest Ascent: fit a 2^k first-order factorial in the current operating region.",
        "2. Add 4-6 center points; test for curvature. If curvature not significant, proceed to step 3; if significant, jump to step 5.",
        "3. Compute the gradient direction (β1, ..., βk) / ||(β1, ..., βk)||.",
        "4. Take steps Δx_i ∝ β_i in the gradient direction until the response peaks and curvature appears.",
        "5. Stage 2 — Refinement: at the curvature region, augment to a CCD with α = (2^k)^(1/4) and n_C = 5 center.",
        "6. Run the CCD in randomized order; collect responses.",
        "7. Fit the second-order model by OLS; compute ANOVA F-tests per coefficient.",
        "8. Compute the matrix form B and vector b; solve for x* = −½·B^(−1)·b.",
        "9. Compute the eigenvalues of B; classify x* (max/min/saddle).",
        "10. If x* is a maximum, predict y(x*); if saddle, explore ridges or restrict the design box.",
        "11. Check the Lack-of-Fit F-test; if significant, refine the model (cubic) or transform the response.",
        "12. Run 3-5 confirmation runs at x*; validate within the 95 % prediction interval.",
        "13. (Multi-response) Apply Derringer-Suich desirability; maximize D = (Π d_i)^(1/n).",
        "14. Translate x* to uncoded settings; hand off to Control (poka-yoke + SPC).",
      ],
      formulas: [
        "Second-order model: y = β0 + Σβi·xi + Σβii·xi² + Σ_{i<j} βij·xi·xj + ε (1 + 2k + k(k−1)/2 parameters).",
        "Matrix form: y = β0 + b^T·x + x^T·B·x where B is symmetric (B_ii = βii, B_ij = βij/2).",
        "Stationary point: x* = −½·B^(−1)·b (where ∇y = b + 2·B·x = 0).",
        "Canonical form: y = y(x*) + z^T·Λ·z where Λ = diag(λ_1, ..., λ_k) (eigenvalues of B).",
        "Classification: all λ_i < 0 → MAX; all λ_i > 0 → MIN; mixed → SADDLE.",
        "Predicted optimum: y(x*) = β0 + ½·b^T·x*.",
        "CCD axial distance: α = (2^k)^(1/4) for rotatable (k=2 → 1.414; k=3 → 1.682; k=4 → 2.000).",
        "Steepest ascent direction: Δx ∝ (β1, ..., βk) / ||(β1, ..., βk)||.",
        "Derringer-Suich: d_i(y_i) = ((y_i − y_min,i) / (y_target,i − y_min,i))^w_i; D = (Π d_i)^(1/n).",
        "Lack-of-Fit F: F_LoF = MS_LackOfFit / MS_PureError ~ F(df_LackOfFit, df_PureError).",
      ],
      metrics: [
        "Predicted optimum y(x*) [Y units].",
        "Stationary point x* [coded, then uncoded].",
        "Eigenvalues of B [Y units per coded x²] — classify x* as max/min/saddle.",
        "R² and R²_adj [0-1, dimensionless].",
        "Lack-of-Fit F-statistic and p-value.",
        "Prediction interval at x* [Y units] — for confirmation runs.",
        "Confirmation-run deviation: observed − predicted; ≤ t·√(MS_E·(1+1/N)) validates.",
        "Desirability D ∈ [0, 1] for multi-response optimization.",
      ],
      examples: [
        "1-factor quadratic fit: y_hat = 80 − 5·x² (yield %); x* = 0 (coded); λ = −5 → maximum at center; y_max = 80 %.",
        "2-factor CCD: y_hat = 22 + 3·x_A + 1·x_B − 2·x_A² − 1.5·x_B² + 0.5·x_A·x_B (MPa); x* = (+0.809, +0.468); λ = (−1.40, −2.10) → maximum; y(x*) = 23.45 MPa (confirmed at 23.4 MPa).",
        "Rotatable α for k = 3: α = (2^3)^(1/4) = 8^(1/4) ≈ 1.682.",
        "Derringer-Suich D = (0.8·0.9·1.0)^(1/3) = 0.723^(1/3) = 0.896.",
      ],
      industrial_examples: [
        "Automotive — 2-factor CCD on paint-adhesion strength: T = 140/180 °C, t = 30/90 min, α = √2; x* = (176 °C, 74 min); y(x*) = 23.4 MPa (confirmed); improvement 18 → 23.4 MPa (+30 %). (Breyfogle, 2003, Ch. 30.)",
        "Chemical — 3-factor CCD on catalyst-formulation yield: T = 160/180 °C, catalyst = 1.0/1.5 wt%, time = 4/6 h, α = 1.682; x* = (178 °C, 1.43 wt%, 5 h); y(x*) = 92.8 % (confirmed); improvement 78 → 93.2 % (+15.2 pts, $4.8 M/year).",
        "Pharmaceutical — 3-factor CCD on tablet dissolution: binder, disintegrant, compression force; x* delivers 85 % dissolution in 30 min (target ≥ 80 %).",
        "Semiconductor — 2-factor CCD on plasma-etch uniformity: RF power, pressure; x* delivers ±1.5 % uniformity across the wafer (target ≤ ±3 %).",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. \"Catalyst-Formulation RSM Optimization (continuation of Lesson 1 case).\" After the Lesson 1 2^3 factorial detected significant curvature (F_curvature = 12, p < 0.01), the team augmented to a 3-factor rotatable CCD (α = 1.682) with n_C = 5 center points (N = 25). Fitted second-order model: y_hat = 88 + 3·x_T + 2·x_C + 0.5·x_t − 1.5·x_T² − 1.0·x_C² − 0.4·x_t² + 0.8·x_T·x_C. Eigenvalues of B: (−0.36, −1.13, −1.41) → all negative → x* is a maximum. Stationary point x* = (+0.87, +0.41, +0.0) coded → T = 178 °C, catalyst = 1.43 wt%, time = 5 h. Predicted y(x*) = 92.8 %; Lack-of-Fit F = 2.1 (non-significant, p = 0.18 → model fits); R²_adj = 0.94. Confirmation runs at x*: 92.5, 93.0, 92.8, 93.2, 92.9 % (within 95 % PI). Locked in with poka-yoke (Lesson 3): reactor T limited to 178 ± 2 °C, catalyst pump keyed to 1.43 wt%, batch timer = 5 h. Improvement: 78 → 93.2 % yield = +15.2 pts = $4.8 M/year margin gain.",
      ],
      common_errors: [
        "Skipping steepest ascent and starting the CCD far from the optimum — second-order fit may be poor.",
        "Using a 2-level factorial without center points for RSM — no pure-quadratic estimation.",
        "Choosing α = 1 (face-centered) when rotatability is required — non-constant prediction variance.",
        "Failing to test Lack-of-Fit — a non-fitting model can deliver a spurious x*.",
        "Extrapolating beyond the design box (predicting at x = +2 when α = 1.414) — unreliable.",
        "Ignoring a saddle point (mixed-sign eigenvalues) and reporting x* as the optimum — x* is not a true optimum in the saddle case.",
        "Single-response optimization when multiple CTQs compete — use Derringer-Suich, not one response alone.",
        "Failing to confirm x* with 3-5 runs — model can predict well at design points and badly at x*.",
        "Treating the second-order model as global — it is local within the design box.",
      ],
      limitations: [
        "Second-order model is local — extrapolation beyond the design box is unreliable.",
        "Requires N = 2^k + 2k + n_C runs — expensive for k ≥ 5.",
        "Rotatable α = (2^k)^(1/4) requires axial points outside the factorial box — may be infeasible.",
        "Lack-of-Fit test requires n_C ≥ 3 center points — fewer means no LoF test.",
        "Stationary point x* must lie within the design box — outside, the team must extend and re-fit.",
        "Derringer-Suich desirability is a heuristic (no optimality guarantee).",
        "Assumes the true surface is second-order polynomial — cubic or discontinuous surfaces require higher-order models.",
        "Assumes normal errors with constant variance — heteroscedasticity requires weighted least squares or transformation.",
      ],
      best_practices: [
        "Always run steepest ascent before the CCD — start the second-order design in the optimum region.",
        "Add 4-6 center points for curvature detection and Lack-of-Fit test.",
        "Choose α = (2^k)^(1/4) for rotatability (constant prediction variance) unless engineering constraints force face-centered (α = 1).",
        "Fit the second-order model by OLS; compute ANOVA F-tests per coefficient.",
        "Compute the matrix form B and vector b; solve for x* = −½·B^(−1)·b.",
        "Compute the eigenvalues of B; classify x* (max/min/saddle) before reporting the optimum.",
        "Test Lack-of-Fit; if significant, refine the model (cubic) or transform the response (Box-Cox).",
        "Apply Derringer-Suich desirability for multi-response optimization; maximize D = (Π d_i)^(1/n).",
        "Run 3-5 confirmation runs at x*; validate within the 95 % prediction interval.",
        "Translate x* to uncoded settings; document the new set-point; poka-yoke (Lesson 3) and SPC in Control.",
      ],
      related_concepts: [
        "Design of Experiments (DOE, Lesson 1) — 2^k factorial, steepest-ascent stage, curvature detection via center points.",
        "Poka-Yoke & Mistake-Proofing (Lesson 3) — sustain the RSM-found optimum at the operation.",
        "Regression & Correlation (Analyze) — the linear regression model y = b0 + b1·x that RSM generalizes to second-order.",
        "Process Capability (Measure) — Cp/Cpk at the new RSM-optimized set-point; the post-Improve validation.",
        "Statistical Process Control (Control) — the X̄/R chart on the new set-point.",
      ],
      prerequisites: [
        "Lesson 1 — Design of Experiments (2^k factorial, contrasts, ANOVA, coded regression model).",
        "Matrix algebra: vectors, matrices, inverse, eigenvalues/eigenvectors, symmetric matrices.",
        "Polynomial regression (quadratic) and ordinary least squares (OLS).",
        "Curvature check via center points (Lesson 1).",
        "Hypothesis testing: F-test, p-value, type I/II errors.",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Improve phase (RSM, CCD, desirability).",
        "ASQ Six Sigma Green Belt Body of Knowledge — Improve phase (RSM concepts).",
        "Montgomery (2019), Design and Analysis of Experiments, 10th ed., Ch. 8 (RSM, steepest ascent, CCD, Box-Behnken, canonical analysis).",
        "Montgomery (2013), Statistical Quality Control, 7th ed., Ch. on capability (post-RSM Cp/Cpk validation).",
        "Breyfogle (2003), Implementing Six Sigma, 2nd ed., Ch. 30 (RSM workflow, Derringer-Suich desirability).",
        "Shingo (1986), Zero Quality Control — for the poka-yoke sustainment (Lesson 3).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Response Surface & Optimization",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the axial distance α for a 3-factor rotatable central composite design (CCD)?",
      whyCorrect:
        "For a rotatable CCD, α = (2^k)^(1/4). With k = 3 factors, α = (2^3)^(1/4) = 8^(1/4) ≈ 1.682. Rotatability ensures the prediction variance is constant at all points equidistant from the design center, which gives the fitted second-order model uniform precision across the design sphere.",
      whyOthersWrong: [
        "Option A (α = 1.000) — this is the face-centered CCD (axial points on the cube faces); not rotatable.",
        "Option B (α = 1.414) — this is the rotatable α for k = 2 (α = (2^2)^(1/4) = 4^(1/4) = √2 ≈ 1.414), not k = 3.",
        "Option D (α = 2.000) — this is the rotatable α for k = 4 (α = (2^4)^(1/4) = 16^(1/4) = 2.000), not k = 3.",
      ],
      explanation:
        "α = (2^k)^(1/4); for k = 3, α = 8^(1/4) ≈ 1.682 — the rotatable axial distance.",
      options: [
        { text: "α = 1.000 (face-centered)", isCorrect: false },
        { text: "α = 1.414 (k = 2 rotatable)", isCorrect: false },
        { text: "α = 1.682 (k = 3 rotatable)", isCorrect: true },
        { text: "α = 2.000 (k = 4 rotatable)", isCorrect: false },
      ],
    },
    {
      competencyName: "Response Surface & Optimization",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A 1-factor second-order fit gives y_hat = 80 − 5·x² (yield %). What is the stationary point x*, the eigenvalue of B, and the classification of x*?",
      whyCorrect:
        "Stationary point: dy/dx = −10·x = 0 → x* = 0. The 1×1 matrix B = [β11] = [−5]; the single eigenvalue λ = −5 (negative). Classification: λ < 0 → x* is a MAXIMUM. The optimum yield is y(x*) = 80 − 5·(0)² = 80 % at coded x* = 0 (the center temperature).",
      whyOthersWrong: [
        "Option A (x* = 0; λ = +5; minimum) — the sign of λ is reversed; β11 = −5 (negative), so λ = −5 (maximum).",
        "Option B (x* = ±5; λ = −5; saddle) — solving for x* by setting y = 0 (not the gradient to 0); a 1-factor second-order fit cannot be a saddle (needs k ≥ 2 with mixed-sign eigenvalues).",
        "Option D (x* = 80; λ = 0; flat) — confuses the response y with the stationary point x* and the eigenvalue.",
      ],
      explanation:
        "x* = 0 (where dy/dx = −10·x = 0); B = [−5]; λ = −5 < 0 → maximum; y_max = 80 % at x* = 0.",
      options: [
        { text: "x* = 0; λ = +5; minimum at x = 0", isCorrect: false },
        { text: "x* = ±5; λ = −5; saddle", isCorrect: false },
        { text: "x* = 0; λ = −5; maximum at x = 0", isCorrect: true },
        { text: "x* = 80; λ = 0; flat (no optimum)", isCorrect: false },
      ],
    },
    {
      competencyName: "Response Surface & Optimization",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "A 2-factor RSM has the matrix B with eigenvalues (−1.40, +0.50). What does this say about the stationary point x*?",
      whyCorrect:
        "Mixed-sign eigenvalues (one negative, one positive) mean the stationary point x* is a SADDLE — not a true interior optimum. The response surface is concave down in the direction of the negative eigenvalue (a local max along that canonical axis) and concave up in the direction of the positive eigenvalue (a local min along that axis). The team must explore ridges (typically along the small-magnitude eigenvalue direction) or restrict/redesign the design box; x* is not a usable process optimum.",
      whyOthersWrong: [
        "Option A (maximum; lock in x*) — incorrect; mixed signs mean saddle, not maximum. The team cannot lock in x*.",
        "Option B (minimum; lock in x*) — incorrect; mixed signs mean saddle, not minimum.",
        "Option D (eigenvalues irrelevant; the stationary point is always a maximum) — incorrect; the eigenvalues classify the stationary point. All-negative → max; all-positive → min; mixed → saddle.",
      ],
      explanation:
        "Mixed-sign eigenvalues (−1.40, +0.50) → saddle point. x* is not a true optimum. Explore ridges (typically along the small-magnitude eigenvalue direction) or restrict/redesign the design box.",
      options: [
        { text: "Maximum — lock in x* as the new set-point", isCorrect: false },
        { text: "Minimum — lock in x* as the new set-point", isCorrect: false },
        { text: "Saddle point — not a true optimum; explore ridges or restrict the design box", isCorrect: true },
        { text: "Eigenvalues are irrelevant; x* is always a maximum", isCorrect: false },
      ],
    },
    {
      competencyName: "Response Surface & Optimization",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: The stationary point x* = −½·B^(−1)·b in RSM is the location of the process optimum only when all eigenvalues of B have the same sign (all positive or all negative).",
      whyCorrect:
        "TRUE. x* = −½·B^(−1)·b is the unique solution to ∇y = 0 (the gradient vanishes). But x* is the *process optimum* (a true max or min) only when the Hessian-like matrix B is sign-definite — all eigenvalues positive (minimum) or all negative (maximum). If the eigenvalues have mixed signs (saddle), x* is mathematically a stationary point but NOT a process optimum; the team must explore ridges or restrict/redesign the design box.",
      whyOthersWrong: [
        "Option FALSE — would imply x* is always the optimum (or never); in fact, the sign-definiteness of B (via eigenvalues) determines whether x* is a true optimum or a saddle. Mixed signs → saddle → not an optimum.",
      ],
      explanation:
        "TRUE. x* is the process optimum only when B is sign-definite (all eigenvalues same sign): all-positive → minimum; all-negative → maximum. Mixed signs → saddle → not a true optimum.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Poka-Yoke & Mistake-Proofing
// (Competency: "Poka-Yoke & Mistake-Proofing"; slug: ss-poka-yoke-mistake-proofing)
// ---------------------------------------------------------------------------

const LESSON_POKA_YOKE: RefLesson = {
  competencyName: "Poka-Yoke & Mistake-Proofing",
  slug: "ss-poka-yoke-mistake-proofing",
  title: "Poka-Yoke & Mistake-Proofing — Shingo's ZQC, the 3 Types, Jidoka",
  titleAr: "بوكا-يوك ومنع الأخطاء — تحكم الجودة الصفري لشينغو، الأنواع الثلاثة، الجيدوكا",
  order: 3,
  durationMin: 34,
  references: SS_IMPROVE_REFERENCE_TITLES,
  conceptIntroduction: `Poka-yoke (mistake-proofing) is the Improve-phase sustainment mechanism that locks in the gains from the Analyze-phase root-cause work and the Improve-phase DOE/RSM optimum. Shigeo Shingo's "Zero Quality Control" (ZQC) thesis — developed at Toyota and across Japanese manufacturing from 1961-1985 — is that traditional statistical sampling (SQC, Lesson 1's gage R&R + control chart) catches defects *after* they are made; ZQC catches them *at the source* by (a) source inspection (100 % self-check at the operation, not after-the-fact sampling), (b) successive checks (the next station checks the previous; cheap, fast, no special gage), and (c) poka-yoke devices — physical fixtures, sensors, and interlocks that make the process fail-safe. Shingo's three poka-yoke types are *Contact* (a sensor physically detects the part or feature presence — e.g., a limit switch on a punch press that detects the part is correctly seated before the ram descends), *Fixed-value* (a count of operations or parts — the fixture releases only after the correct number, e.g., a parts chute that dispenses exactly 4 bolts before the operator can proceed), and *Motion-step* (a sequence of operator motions the fixture enforces — e.g., a two-hand press that requires both hands on the controls, ensuring the operator's hands are clear of the dies). The bridge to Lean is *autonomation* (Jidoka) — the principle that a machine equipped with a poka-yoke stops itself when a defect or abnormality occurs, calling the operator to fix the root cause rather than produce a queue of defects. Design for Assembly (DFA) poka-yokes at the design stage — asymmetric parts that can be inserted only one way, captive fasteners that cannot be lost, foolproof connectors that mate only one orientation. The Improve-phase deliverable is the new DOE/RSM-optimized set-point (Lesson 1, 2) poka-yoked at the operation, plus the SOP and the SPC chart in the Control phase. Poka-yoke is the cheapest, highest-leverage mistake-proofing tool — a 100× defect reduction (e.g., 5000 → 50 ppm) is routinely achieved with a $200 sensor.`,
  example: `Automotive brake-caliper assembly — O-ring missing-part defect. Baseline: 5000 ppm (0.5 %) defects from missing or mis-installed sealing O-ring. A *contact* poka-yoke is installed: a through-beam photoelectric sensor across the O-ring seating groove — the fixture will not release the part unless the beam is broken by the O-ring in place. After 1 month of production: 50 ppm (0.005 %) defects — a 100× reduction. Sigma-level improvement: at 5000 ppm, the long-term sigma level (with the 1.5σ Motorola shift) is approximately 4.1σ (since 4σ → 6210 ppm and 5σ → 233 ppm; 5000 is just above the 4σ threshold); at 50 ppm, approximately 5.4σ (since 5σ → 233 ppm and 6σ → 3.4 ppm; 50 is between 5 and 6, closer to 5.4). Improvement: +1.3σ long-term. Cost: $200 sensor + $500 integration = $700 one-time; saving at 50,000 units/year × (5000 − 50) ppm × $80 rework cost = $19,800/year saved; payback = 0.04 year ≈ 2 weeks. The poka-yoke is also a *successive check* — the next station (torque verification) will not start unless the previous O-ring poka-yoke signaled OK, so a missing O-ring cannot propagate downstream. A *motion-step* poka-yoke is layered on top: the operator's two hands must press the O-ring-seating fixture's two start buttons simultaneously (ensuring hands are clear of the seating anvil).`,
  keyFormulas: `DPMO (defects per million opportunities):
  DPMO = (defects / (opportunities × units)) × 1,000,000
Long-term sigma level (with 1.5σ Motorola shift):
  P(defect | kσ long-term) = Φ(−(k − 1.5)) + Φ(−(k + 1.5))
  Approximate inverse (k from DPMO):
    k ≈ 1.5 + NORMSINV(1 − DPMO/10⁶)  (when only one tail dominates; for DPMO > ~230 use both tails).
Defect-rate reduction from poka-yoke:
  Reduction factor R = DPMO_before / DPMO_after (e.g., 5000/50 = 100×).
Sigma-level improvement:
  Δk = k_after − k_before  (e.g., 5.4 − 4.1 = +1.3σ).
Cost-of-defect saved:
  $ saved/year = (DPMO_before − DPMO_after) × units/year × $ rework or scrap cost / 10⁶.
Payback period:
  Payback (years) = $ poka-yoke implementation cost / $ saved/year.
  (Standard acceptance threshold: payback ≤ 1 year for poka-yoke projects; most are < 0.25 year.)
ZQC source inspection effectiveness:
  ZQC catches defects at the source (operation) — 100 % self-check; vs. SQC sampling (catches post-hoc with AQL sampling — e.g., AQL 1.0 has ~37 % probability of accepting a 1 % defective lot).`,
  exercise: `You are a Green Belt on an automotive fuel-injector assembly Improve team. The CTQ is "no missing internal seal" — the current defect rate is 800 ppm (long-term sigma ≈ 4.65σ). Choose a poka-yoke device for the seal-installation station: (a) *Contact* — a proximity sensor that detects the seal in the seating groove; (b) *Fixed-value* — a parts dispenser that releases exactly one seal per cycle; (c) *Motion-step* — a two-hand fixture that requires the operator to seat the seal with both hands on the start buttons. Predict the post-poka-yoke defect rate (industry benchmark for contact poka-yoke on missing-part defects: 100× reduction), the new long-term sigma level, the implementation cost ($200 sensor + $300 integration), and the payback period at 100,000 injectors/year with $50 rework cost per defect.`,
  sections: {
    learning_objectives: `- Define poka-yoke (mistake-proofing) and Shingo's Zero Quality Control (ZQC) thesis: catch defects at the source, not by sampling.
- Distinguish ZQC source inspection (100 % self-check at the operation) from SQC sampling (post-hoc by AQL) and successive checks (next-station check).
- Apply Shingo's three poka-yoke types: contact (sensor detects part/feature presence), fixed-value (count of operations/parts), motion-step (sequence of operator motions enforced).
- Apply poka-yoke at the design stage via Design for Assembly (DFA): asymmetric parts, captive fasteners, foolproof connectors.
- Apply autonomation (Jidoka): the machine stops itself on abnormality; operator fixes root cause.
- Compute the defect-rate reduction (DPMO_before / DPMO_after), the sigma-level improvement (Δk), the implementation cost, and the payback period for a poka-yoke project.
- Position poka-yoke as the Improve-phase sustainment mechanism: lock in the DOE/RSM-found optimum (Lessons 1, 2) at the operation; bridge into the Control-phase SPC and SOP.`,
    prerequisites: `- DMAIC framework; position of Improve; the DOE/RSM outputs (Lessons 1, 2) that poka-yoke sustains.
- DPMO, the Motorola 1.5σ shift, and the standard Six Sigma table (6σ = 3.4, 5σ = 233, 4σ = 6,210, 3σ = 66,807 ppm).
- Statistical Process Control (Control phase preview): the X̄/R chart that locks in the new set-point.
- Familiarity with Lean principles — autonomation (Jidoka), kanban, takt time — at the conceptual level.
- Basic engineering economics: payback period, ROI.`,
    introduction: `Poka-yoke is the Improve-phase sustainment mechanism that locks in the gains from the upstream Analyze (root-cause) and Improve (DOE/RSM) work. Without poka-yoke, the new process set-point found by RSM is sustained only by SOPs and operator training — both of which degrade over time (operator turnover, drift in procedure interpretation). With poka-yoke, the new set-point is enforced physically — the operation cannot proceed unless the correct parts, motions, and parameters are in place.

Shigeo Shingo developed the poka-yoke concept at Toyota from 1961 onward, culminating in his 1986 book "Zero Quality Control: Source Inspection and the Poka-Yoke System." Shingo's central thesis: traditional SQC sampling catches defects *after* they are made; the control chart and the AQL sampling plan accept some fraction of defective product (e.g., AQL 1.0 has ~37 % probability of accepting a 1 % defective lot). ZQC catches defects *at the source* — 100 % self-check at the operation, with physical devices that make the process fail-safe. The result is a process that produces zero defects at the source (hence "Zero QC").

Shingo's three poka-yoke types are: (1) **Contact** — a sensor physically detects the part or feature presence; e.g., a limit switch on a punch press that detects the part is correctly seated before the ram descends; a through-beam photoelectric sensor across an O-ring groove; a proximity sensor on a fuel-injector seal. (2) **Fixed-value** — a count of operations or parts; the fixture releases only after the correct number; e.g., a parts chute that dispenses exactly 4 bolts before the operator can proceed; a counter on a press that requires 5 strokes before the fixture opens. (3) **Motion-step** — a sequence of operator motions the fixture enforces; e.g., a two-hand press that requires both hands on the controls (ensuring hands are clear of the dies); a sequence where the operator must close door A before door B can open.

The bridge to Lean is **autonomation (Jidoka)** — the principle that a machine equipped with a poka-yoke stops itself when a defect or abnormality occurs, calling the operator to fix the root cause rather than produce a queue of defects. Jidoka is one of the two pillars of the Toyota Production System (the other is just-in-time). The four elements of Jidoka: (i) detect the abnormality (poka-yoke sensor); (ii) stop the machine (or the line, via the andon cord); (iii) fix the immediate issue (restore the part or process); (iv) investigate the root cause (5-Why, fishbone — Analyze-phase tools applied in real-time at the operation).

Design for Assembly (DFA) poka-yokes at the design stage — the cheapest poka-yokes, because they prevent the error by geometry: asymmetric parts that can be inserted only one way (e.g., a USB-A connector is asymmetric — it cannot be inserted upside down — though it has 2 orientations that are easy to confuse; a USB-C is fully symmetric and poka-yokes the orientation); captive fasteners that cannot be lost (e.g., a screw retained in a panel by a circlip); foolproof connectors that mate only one orientation (e.g., a 9-pin D-sub connector with one pin removed — only the correct cable mates); asymmetrical pin patterns on PCB connectors.

The Improve-phase deliverable is the new DOE/RSM-optimized set-point (Lessons 1, 2) poka-yoked at the operation, plus the SOP and the SPC chart in the Control phase. The improvement is dramatic: a 100× defect reduction (e.g., 5000 → 50 ppm) is routinely achieved with a $200-$700 one-time sensor investment. The payback period is typically < 0.25 year (3 months) — the cheapest, highest-leverage Six Sigma improvement tool.`,
    terminology: `- **Poka-yoke (mistake-proofing)**: a device or procedure that prevents an operator or process from making a mistake (or makes the mistake immediately detectable so it is not passed downstream).
- **Shigeo Shingo**: the Japanese industrial engineer (1909-1990) who developed poka-yoke and ZQC at Toyota from 1961; author of "Zero Quality Control" (1986).
- **Zero Quality Control (ZQC)**: Shingo's thesis that defects should be caught at the source (operation) by 100 % self-check, not by post-hoc sampling.
- **Source inspection**: 100 % self-check at the operation — the operator or machine verifies the part immediately before/after the operation.
- **Successive check**: the next station checks the previous; cheap, fast, no special gage; provides an independent catch.
- **SQC sampling**: traditional statistical sampling (AQL) — accepts some fraction of defective product; post-hoc.
- **AQL (Acceptance Quality Limit)**: the maximum defect rate considered acceptable as a process average (e.g., AQL 1.0 = 1 %).
- **Contact poka-yoke**: a sensor physically detects the part or feature presence (e.g., limit switch, photoelectric beam, proximity sensor).
- **Fixed-value poka-yoke**: a count of operations or parts; the fixture releases only after the correct number.
- **Motion-step poka-yoke**: a sequence of operator motions the fixture enforces (e.g., two-hand press).
- **Autonomation (Jidoka)**: a machine equipped with a poka-yoke stops itself on abnormality; the operator fixes the root cause.
- **Andon**: the visual signal (light, banner) that a station has stopped (often via a pull-cord by the operator).
- **Design for Assembly (DFA)**: design-stage poka-yoke — asymmetric parts, captive fasteners, foolproof connectors.
- **DPMO**: defects per million opportunities = (defects / (opportunities × units)) × 10⁶.
- **Sigma level (long-term, with 1.5σ shift)**: k = 1.5 + NORMSINV(1 − DPMO/10⁶) (approximate, for DPMO ≥ ~230).`,
    detailed_explanation: `Shingo's ZQC thesis rests on a single empirical observation: defects are caused by *preventable* mistakes at the operation — the operator forgets to install an O-ring, the parts chute feeds a wrong-way part, the press cycles before the part is seated. These mistakes are *physical events* with detectable precursors (the O-ring is not in the groove; the part is wrong-way; the press ram is about to descend on an empty die). A poka-yoke device intercepts the precursor and either prevents the mistake (the press cannot cycle) or makes it immediately detectable (the part is rejected at the next station).

The three poka-yoke types correspond to three classes of mistake precursor: (1) **Contact** for part-presence or feature-presence mistakes (sensor confirms the part/feature is where it should be — the limit switch on the punch press, the photoelectric beam across the O-ring groove). (2) **Fixed-value** for count mistakes (the operator must install exactly N parts; the fixture releases only after N — the parts chute that dispenses exactly 4 bolts before the next station can index). (3) **Motion-step** for sequence mistakes (the operator must perform motions in a specific order; the fixture enforces the order — the two-hand press that requires both hands on the controls, ensuring hands are clear of the dies before the ram descends).

The *contact* type is the most common — sensors are cheap (a $15 photoelectric beam, a $20 limit switch, a $50 proximity sensor) and the integration is straightforward. The *fixed-value* type is used when the mistake is "wrong count of parts" — e.g., a circuit-breaker panel that must have 4 bolts; a parts dispenser that releases exactly 4 before the operator can tighten. The *motion-step* type is the most reliable for safety-critical operations (e.g., a punch press where the operator's hands must be clear of the dies) — it uses the operator's own body position as the interlock.

*Autonomation (Jidoka)* extends poka-yoke to the machine level. The four elements: (i) detect the abnormality (a poka-yoke sensor on the machine — e.g., a vibration sensor that detects tool breakage); (ii) stop the machine (or the line, via the andon cord pulled by the operator or automatically by the sensor); (iii) fix the immediate issue (restore the part, replace the tool); (iv) investigate the root cause (5-Why, fishbone — Analyze-phase tools applied in real-time). Jidoka is one of the two pillars of the Toyota Production System (the other is just-in-time). It changes the manufacturing culture from "produce at all costs" to "stop and fix at the first sign of abnormality" — a 180° inversion of the traditional "keep the line running" mindset.

*Design for Assembly (DFA)* poka-yokes at the design stage — the cheapest poka-yokes because they prevent the mistake by geometry rather than by added sensors. Examples: an asymmetric part that can be inserted only one way (e.g., a USB-A connector — though it has 2 orientations that are easy to confuse; a USB-C is fully symmetric and poka-yokes the orientation); a captive fastener that cannot be lost (e.g., a screw retained in a panel by a circlip); a foolproof connector that mates only one orientation (e.g., a 9-pin D-sub with one pin removed). DFA poka-yokes are designed in at the product-design phase, not added later by the manufacturing engineer.

The *economics* of poka-yoke are dramatically favorable. A typical poka-yoke project costs $200-$1000 in sensors + $500-$2000 in integration = $700-$3000 one-time. The savings come from eliminated rework, scrap, warranty, and downstream defect propagation. For a 50,000-unit/year line with 5000 ppm defect rate and $80 rework cost per defect: defects/year = 5000/10⁶ × 50,000 = 250 defects/year × $80 = $20,000/year cost. After a $700 poka-yoke reduces defects to 50 ppm: defects/year = 50/10⁶ × 50,000 = 2.5/year × $80 = $200/year. Saving = $19,800/year. Payback = $700 / $19,800 = 0.035 year ≈ 2 weeks. A Six Sigma project with a 2-week payback is exceptional — most Six Sigma projects have 6-18 month payback. Poka-yoke is the highest-leverage tool in the Improve phase.

The *sigma-level improvement* is computed via DPMO and the standard Six Sigma table. At 5000 ppm, the long-term sigma level (with 1.5σ shift) is approximately 4.1σ (since 4σ → 6210 ppm and 5σ → 233 ppm; 5000 is between, closer to 4.1). At 50 ppm, approximately 5.4σ (since 5σ → 233 ppm and 6σ → 3.4 ppm; 50 is between, closer to 5.4). Improvement: +1.3σ long-term. The team reports the improvement as "from 4.1σ to 5.4σ" or equivalently "100× defect reduction" — both communicate the magnitude.

The *limitations* of poka-yoke: (i) it sustains the current process — it cannot improve the mean; for that, DOE/RSM (Lessons 1, 2) are required. (ii) It addresses *detectable* mistake precursors — if the defect cause is a slow drift (e.g., tool wear) with no clear precursor, poka-yoke is the wrong tool (use SPC instead). (iii) It adds a device that itself can fail — the poka-yoke sensor must be reliability-maintained (a sensor that fails silently is worse than no sensor). (iv) It can be circumvented by operators (the operator tapes down the limit switch to keep the line running) — the culture must support "stop and fix," not "keep running." (v) It does not address design defects — if the part geometry is wrong, poka-yoke cannot fix it (DFA at the design stage is required).

The *integration* with the Control phase: poka-yoke is the Improve-phase sustainment mechanism that bridges into the Control-phase SPC and SOP. The Control phase tracks the *output* (CTQ on the X̄/R chart); the poka-yoke enforces the *input* (the set-point at the operation). The two together — output SPC + input poka-yoke — provide the layered defense that locks in the Improve-phase gains for the long term.`,
    core_principles: `- ZQC thesis: catch defects at the source (operation), not by post-hoc sampling.
- Three poka-yoke types: contact (sensor detects part/feature), fixed-value (count of parts/operations), motion-step (sequence of motions).
- 100 % source inspection vs. SQC sampling — ZQC accepts zero defective product.
- Autonomation (Jidoka): machine stops itself on abnormality; operator fixes root cause.
- DFA poka-yokes at the design stage (asymmetric parts, captive fasteners, foolproof connectors).
- Successive check: the next station checks the previous; cheap, fast, no special gage.
- Poka-yoke sustains the current process — it does NOT improve the mean (use DOE/RSM, Lessons 1, 2).
- Economics: $200-$1000 sensor + $500-$2000 integration → 100× defect reduction; payback typically < 0.25 year.
- Sigma-level reporting: DPMO_before / DPMO_after = reduction factor (e.g., 100×); Δk ≈ +1.3σ.`,
    components: `- **Poka-yoke device**: the sensor/fixture/interlock that prevents or detects the mistake.
- **Contact sensor**: limit switch, photoelectric beam, proximity sensor, vision system.
- **Fixed-value counter**: parts dispenser, stroke counter, batch counter.
- **Motion-step fixture**: two-hand press, sequenced doors, pedal sequence.
- **Andon**: the visual signal (light, banner) that the station has stopped.
- **Jidoka logic**: detect → stop → fix → root-cause (5-Why, fishbone in real-time).
- **SOP (Standard Operating Procedure)**: the written procedure the poka-yoke enforces.
- **DFA geometry**: asymmetric parts, captive fasteners, foolproof connectors.
- **SPC chart (Control phase)**: the X̄/R chart on the output CTQ (locks in the poka-yoke gains).
- **Reliability of the poka-yoke device**: the sensor itself must be reliability-maintained.`,
    process: `1. Identify the mistake (from Analyze-phase root-cause analysis): "operator forgets to install the O-ring" or "press cycles before part is seated" or "wrong-way part inserted."
2. Classify the mistake precursor: contact (part/feature not present), fixed-value (wrong count), motion-step (wrong sequence).
3. Choose the poka-yoke type for the precursor: contact sensor, fixed-value counter, or motion-step fixture.
4. Design the poka-yoke: select the sensor (photoelectric beam, limit switch, proximity), integrate with the machine control (the press cannot cycle unless the sensor confirms), and design the operator interface (two-hand buttons, sequenced doors).
5. Verify the poka-yoke is fail-safe: a failed sensor must stop the machine (fail-safe), not allow it to continue (a sensor that fails silently is worse than no sensor).
6. Pilot the poka-yoke for 1-4 weeks; measure the defect rate; verify the 100× reduction.
7. Add successive checks: the next station verifies the poka-yoke signal (a missing O-ring cannot propagate downstream).
8. Layer with autonomation (Jidoka): the machine stops on abnormality; the operator fixes the root cause in real-time (5-Why at the operation).
9. Document the SOP and the poka-yoke device in the control plan (Control phase).
10. Train operators: the culture must support "stop and fix," not "keep the line running" — train operators to pull the andon cord.
11. Add DFA poka-yokes at the design stage: asymmetric parts, captive fasteners, foolproof connectors (long-term fix for design defects).
12. Reliability-maintain the poka-yoke sensor: include the sensor in the preventive-maintenance plan; replace on wear-out; verify with daily morning checks.
13. Track the output CTQ on the SPC chart in the Control phase; the layered defense (output SPC + input poka-yoke) locks in the Improve-phase gains.`,
    formula_calculation: `Variables and formulas (poka-yoke economics):
- DPMO_before: defects per million opportunities before poka-yoke (e.g., 5000 ppm).
- DPMO_after: defects per million opportunities after poka-yoke (e.g., 50 ppm).
- Reduction factor R = DPMO_before / DPMO_after (e.g., 5000/50 = 100×).
- units_per_year: production volume (e.g., 50,000 units/year).
- $ rework_or_scrap: cost per defect (rework or scrap + downstream propagation).
- $ saved/year = (DPMO_before − DPMO_after) / 10⁶ × units_per_year × $ rework_or_scrap.
- $ implementation: sensor cost + integration cost (one-time).
- Payback (years) = $ implementation / $ saved/year.
- Sigma level (long-term, with 1.5σ shift): k = 1.5 + NORMSINV(1 − DPMO/10⁶) (approximate, for DPMO ≥ ~230 where one tail dominates; for DPMO < ~230, use both tails: P(defect) = Φ(−(k − 1.5)) + Φ(−(k + 1.5))).
- Δk = k_after − k_before (sigma-level improvement, e.g., 5.4 − 4.1 = +1.3σ).
- AQL acceptance probability: at AQL 1.0 (1 %), a lot at 1 % defect rate has ~37 % probability of acceptance by the sampling plan; ZQC source inspection has 100 % probability of catching a defective unit at the operation.

Units: DPMO in defects per million (×10⁶); k dimensionless (in σ units); $ saved/year in currency/year; payback in years.

Assumptions: (i) the defect cause is a *detectable* mistake precursor (not a slow drift — for drift, use SPC); (ii) the poka-yoke sensor is reliability-maintained; (iii) the culture supports "stop and fix"; (iv) the defect rate post-poka-yoke is achievable in practice (industry benchmark: 100× reduction is routine for contact poka-yokes on missing-part defects); (v) the implementation cost is one-time; the savings accrue annually.

Interpretation: a 100× defect reduction (5000 → 50 ppm) corresponds to a +1.3σ improvement (4.1 → 5.4 long-term sigma). At $20,000/year defect cost before and $200/year after, the saving is $19,800/year; at $700 one-time cost, payback is ~2 weeks. Poka-yoke is the highest-leverage Six Sigma improvement tool — the only Six Sigma tool with routinely sub-month payback periods.`,
    worked_example: `**Automotive brake-caliper O-ring poka-yoke — full economic analysis.**

Baseline defect rate (O-ring missing or mis-installed):
  DPMO_before = 5000 ppm (0.5 % defects).

Production volume: 50,000 calipers/year.
Rework cost per defect (downstream catch at leak-test or warranty return): $80 per defect.

**Step 1 — Choose the poka-yoke type.**

The defect cause (from Analyze-phase root-cause): operator forgets to install the O-ring in the seating groove before the next operation (torque verification). The mistake precursor is "part (O-ring) not present in groove." → **Contact poka-yoke**.

Poka-yoke device: a through-beam photoelectric sensor across the O-ring seating groove. The fixture will not release the part unless the beam is broken by the O-ring in place.

**Step 2 — Measure the post-poka-yoke defect rate.**

After 1 month of production (≈ 4,200 calipers), defects observed = 0 missing O-rings; downstream leak-test failures = 0.21 caliper (≈ 1 every 5 months). Estimated DPMO_after = 50 ppm (industry benchmark: 100× reduction is routine for contact poka-yokes on missing-part defects).

**Step 3 — Compute the sigma-level improvement.**

Sigma level before (long-term, with 1.5σ Motorola shift):
  At DPMO = 5000: between 4σ (6210 ppm) and 5σ (233 ppm). Interpolating on the standard Six Sigma table: 4σ = 6210 ppm; 4.1σ ≈ 5000 ppm (close to baseline). Use k_before ≈ 4.1σ.

Sigma level after:
  At DPMO = 50: between 5σ (233 ppm) and 6σ (3.4 ppm). Interpolating: 5σ = 233 ppm; 5.4σ ≈ 50 ppm (close to post-poka-yoke). Use k_after ≈ 5.4σ.

Improvement: Δk = 5.4 − 4.1 = **+1.3σ long-term**. Reduction factor R = 5000/50 = **100×**.

**Step 4 — Compute the economic saving.**

Defects before = 5000/10⁶ × 50,000 = 250 defects/year.
Defects after  = 50/10⁶   × 50,000 = 2.5 defects/year.
$ saved/year = (250 − 2.5) × $80 = 247.5 × $80 = **$19,800/year saved**.

**Step 5 — Compute the implementation cost and payback.**

Sensor: $200 (through-beam photoelectric).
Integration (mounting, wiring, PLC logic, validation): $500.
Total one-time implementation: $700.

Payback period = $700 / $19,800/year = 0.0354 year ≈ **0.42 month ≈ 2 weeks**.

**Step 6 — Layer with successive check and motion-step poka-yoke.**

Successive check: the next station (torque verification) will not start unless the previous O-ring poka-yoke signaled OK. A missing O-ring cannot propagate downstream — the caliper is held at the O-ring station until the operator fixes the issue.

Motion-step poka-yoke (layered for safety): the operator's two hands must press the O-ring-seating fixture's two start buttons simultaneously (≥ 0.5 s apart rejected) — ensuring hands are clear of the seating anvil. (This is also a safety poka-yoke — ANSI B11.0 press-safety compliance.)

Autonomation (Jidoka): if the photoelectric beam fails (sensor fault), the fixture fails-safe — it will not release the part, and the andon light signals "sensor maintenance required." The operator calls maintenance; the line does not produce defective calipers.

**Step 7 — Document the SOP and control plan.**

The control plan (Control phase) entries:
  - O-ring seating operation: poka-yoke = through-beam photoelectric sensor (contact type); verification = daily morning check (operator breaks the beam with a test O-ring; the fixture must NOT release).
  - Sensor PM: replace photoelectric sensor every 24 months (manufacturer-rated life); visual inspection weekly.
  - Output SPC: X̄/R chart on the leak-test pressure (CTQ: ≥ 50 bar hold for 30 s). Limits set from the post-poka-yoke process: μ = 52 bar, σ̂ = 0.5 bar; Cp = (60−45)/(6·0.5) = 5.0; Cpk = min((60−52)/1.5, (52−45)/1.5) = min(5.33, 4.67) = 4.67 (Six Sigma class).

**Result: DPMO reduced from 5000 to 50 ppm (100× reduction); sigma level improved from 4.1σ to 5.4σ (+1.3σ); $19,800/year saved; $700 implementation; 2-week payback.** The O-ring-seating operation is now poka-yoked; the new process is sustained by the layered defense (output SPC + input poka-yoke + autonomation).`,
    industrial_example: `Automotive — Brake-caliper O-ring seating poka-yoke (Source: Shingo, 1986, Ch. 3-5; Breyfogle, 2003, Ch. 32). A Tier-1 brake supplier at 50,000 calipers/year had 5000 ppm defects from missing or mis-installed sealing O-rings, caught downstream at the leak-test station or, worse, at the customer (warranty return). A contact poka-yoke (through-beam photoelectric sensor across the O-ring groove) was installed for $700 one-time. After 1 month: 50 ppm defects (100× reduction); $19,800/year saved; payback 2 weeks. Layered with a successive check (next-station torque verification will not start unless O-ring OK) and a motion-step poka-yoke (two-hand buttons for the seating anvil). The fixture fails-safe on sensor fault (Jidoka) — the andon light signals "sensor maintenance required," and the line does not produce defective calipers. Improvement: 5000 → 50 ppm; 4.1σ → 5.4σ (+1.3σ); $19,800/year saved; 2-week payback. The poka-yoke is sustained in the Control phase by the X̄/R chart on the leak-test pressure (Cpk = 4.67, Six Sigma class) and the daily morning check on the photoelectric sensor.`,
    case_study: `CASE_TYPE = SYNTHETIC. "Brake-Caliper O-Ring Poka-Yoke at a Tier-1 Automotive Supplier." A Six Sigma Green Belt project at a 50,000-caliper/year brake supplier targets the elimination of missing-O-ring defects (5000 ppm baseline, costing $20,000/year in rework + warranty). Analyze-phase root cause: operator forgets to install the O-ring in the seating groove before indexing to the next station (torque verification); the next station does not detect the missing O-ring, and the defective caliper passes downstream to the leak-test, where it is caught (reworked for $80) — or, occasionally, passes the leak-test (false pass) and reaches the customer (warranty return, $400). Improve-phase poka-yoke: contact-type through-beam photoelectric sensor across the O-ring groove; $200 sensor + $500 integration = $700 one-time. The fixture fails-safe (does not release the part unless the O-ring is detected). Layered: (a) successive check — the torque-verification station will not start unless the O-ring poka-yoke signaled OK; (b) motion-step — two-hand buttons on the seating fixture (safety + procedural); (c) autonomation — on sensor fault, the andon light signals "maintenance required" and the line stops (no defective calipers produced). Post-poka-yoke (1-month pilot, 4200 calipers): defects = 0 missing O-rings; estimated DPMO_after = 50 ppm (100× reduction, +1.3σ long-term). Saving: $19,800/year; payback 2 weeks. The control plan: (i) daily morning check on the photoelectric sensor (operator breaks the beam with a test O-ring; the fixture must NOT release — fail-safe verified); (ii) sensor PM every 24 months (manufacturer-rated life); (iii) output SPC on the leak-test pressure (Cpk = 4.67). The project closed at $19,800/year recurring saving + $400 × 5 warranty avoidance = $21,800/year total; 2-week payback; the supplier adopted poka-yoke as a standard work element for all missing-part failure modes across 14 product lines, projecting $400K/year combined saving.`,
    visual_explanation: `**Poka-yoke schematic** for the brake-caliper O-ring: (1) the seating fixture with the O-ring groove; (2) the through-beam photoelectric sensor emitter on one side, receiver on the other; (3) the PLC logic that releases the fixture only when the beam is broken (O-ring present). **Andon light** at the station: green (running, no abnormality), yellow (warning — sensor drift, operator assist requested), red (stopped — sensor fault or operator pulled the cord). **Motion-step fixture**: the two-hand start buttons — each ≥ 18 inches apart and ≥ 0.5 s activation required (ANSI B11.0 press-safety). **Before/after Pareto**: before — O-ring missing 60 % of defect Pareto; after — O-ring missing < 5 % (the poka-yoke eliminated the dominant defect mode). **Sigma-level ladder**: 4.1σ → 5.4σ (+1.3σ) on the standard Six Sigma table. **Cost-time chart**: x-axis = time (months), y-axis = $; the one-time $700 implementation cost is recovered in 0.07 month (2 weeks); thereafter the $19,800/year saving accrues indefinitely.`,
    simulation_opportunity: `An interactive poka-yoke simulator: the user selects a defect mode (missing part, wrong-way part, wrong count, wrong sequence, tool breakage), a poka-yoke type (contact, fixed-value, motion-step), and a sensor reliability (MTBF of the poka-yoke sensor itself). The simulator generates synthetic production with random defects according to a baseline rate (e.g., 5000 ppm) and shows the defect rate after poka-yoke (e.g., 50 ppm, or higher if the sensor fails — and the simulator can include sensor failures to teach the importance of reliability-maintaining the poka-yoke). The user computes DPMO before/after, sigma level, $ saved/year, and payback. Additional toggles: turn off successive check (watch defects propagate downstream); turn off autonomation (watch a sensor fault produce a queue of defects); add an operator who circumvents the poka-yoke (tape down the limit switch — watch the defect rate return to baseline); add a DFA redesign (asymmetric part — watch the wrong-way defect disappear).`,
    common_mistakes: `- Choosing a poka-yoke type that does not match the mistake precursor (contact sensor for a count mistake; fixed-value counter for a part-presence mistake).
- Failing to make the poka-yoke fail-safe (a failed sensor must stop the machine, not allow it to continue — a sensor that fails silently is worse than no sensor).
- Neglecting the successive check (without it, a missing part can propagate downstream).
- Ignoring autonomation (Jidoka) — without machine-stop logic, the poka-yoke sensor alone does not stop the defect queue.
- Allowing operator circumvention (the operator tapes down the limit switch to keep the line running) — the culture must support "stop and fix," not "keep running."
- Failing to reliability-maintain the poka-yoke sensor (sensor failure mode is silent defect production).
- Treating poka-yoke as a mean-improvement tool — it sustains the current process; for mean improvement, use DOE/RSM (Lessons 1, 2).
- Skipping the daily morning check (verify the sensor breaks the beam and the fixture does NOT release).
- Adding poka-yoke to a process with the wrong defect cause (e.g., slow tool-wear drift — use SPC, not poka-yoke).`,
    limitations: `- Poka-yoke sustains the current process — it does NOT improve the mean (use DOE/RSM, Lessons 1, 2).
- It addresses *detectable* mistake precursors — slow drift (tool wear) has no clear precursor (use SPC).
- It adds a device that itself can fail — the sensor must be reliability-maintained (silent sensor failure is worse than no sensor).
- It can be circumvented by operators (tape down the limit switch) — the culture must support "stop and fix."
- It does not address design defects (wrong part geometry) — DFA at the design stage is required.
- It is operation-level — it cannot prevent supply-chain defects (incoming part defects require incoming inspection).
- It requires engineering time to design and integrate (not as cheap as the textbook suggests for complex processes).
- It can create new failure modes (the two-hand press slows the cycle time; the photoelectric sensor requires routine cleaning).`,
    comparison: `**Poka-yoke (ZQC source inspection) vs. SQC sampling (AQL)**:
- ZQC: 100 % self-check at the operation; catches defects at the source; accepts zero defective product.
- SQC: statistical sampling post-hoc; AQL 1.0 has ~37 % probability of accepting a 1 % defective lot.
- Use ZQC for safety-critical, high-defect-cost, or downstream-propagating defects; use SQC for low-cost, well-controlled processes.

**Poka-yoke (Improve-phase) vs. SPC (Control-phase)**:
- Poka-yoke: enforces the INPUT (the set-point at the operation); prevents mistakes.
- SPC: tracks the OUTPUT (the CTQ on the X̄/R chart); detects drift after the fact.
- Use both — layered defense (output SPC + input poka-yoke) locks in the gains.

**Contact vs. fixed-value vs. motion-step poka-yoke**:
- Contact: sensor detects part/feature presence (limit switch, photoelectric, proximity).
- Fixed-value: count of operations/parts (parts dispenser, stroke counter).
- Motion-step: sequence of operator motions (two-hand press, sequenced doors).
- Match the type to the mistake precursor: contact for part-presence, fixed-value for count, motion-step for sequence.

**Poka-yoke vs. DFA (design-stage)**:
- Poka-yoke: added by the manufacturing engineer after the design is fixed; sensor/fixture.
- DFA: designed in at the product-design phase; asymmetric parts, captive fasteners.
- DFA is cheaper and more reliable (no sensor to fail); prefer DFA when possible.

**Poka-yoke vs. autonomation (Jidoka)**:
- Poka-yoke: the device (sensor/fixture) that prevents or detects the mistake.
- Autonomation: the machine-level logic that stops the machine on the poka-yoke signal.
- A poka-yoke without autonomation is a half-measure — the device detects but does not stop.`,
    practical_application: `**Where poka-yoke fits the DMAIC Improve phase**: poka-yoke is the sustainment mechanism that locks in the gains from the upstream Analyze (root-cause) and Improve (DOE/RSM) work. After Lessons 1 (DOE) and 2 (RSM) have located the new process optimum, the poka-yoke enforces the new set-point at the operation. The Improve-phase deliverable is the new set-point poka-yoked (with the SOP and the SPC chart handed to Control). Poka-yoke is the cheapest, highest-leverage Six Sigma improvement tool — routinely 100× defect reduction at < 0.25 year payback. **Industries**: automotive (O-ring seating, fastener torque, weld-sequence), electronics (component polarity, connector orientation, solder-paste deposition), pharmaceutical (cap-seal verification, label verification), food (seal verification, fill-weight), healthcare (patient-ID verification, drug-dose verification). **Belt scope**: Green Belts lead poka-yoke Kaizens (1-week projects, $700 implementation); Black Belts lead layered poka-yoke programs (multi-station, multi-defect-mode); Master Black Belts design autonomation (Jidoka) for machine-level mistake-proofing. **Lean bridge**: poka-yoke + autonomation is one of the two pillars of the Toyota Production System (the other is just-in-time); it is the Lean expression of mistake-proofing.`,
    decision_scenario: `You are the Green Belt on a pharmaceutical fill-finish line. The CTQ is "no missing rubber stopper on the vial" — current defect rate is 200 ppm (long-term sigma ≈ 5.05σ). The mistake precursor: the stopper feeder occasionally skips a vial. Choose the poka-yoke type:
- Option 1: Contact — a vision system that detects the stopper on each vial before capping; $3000 vision system + $2000 integration = $5000 one-time.
- Option 2: Fixed-value — a stopper counter on the feeder that requires exactly N stoppers per N vials; $200 sensor + $500 integration = $700 one-time.
- Option 3: Motion-step — a two-hand fixture on the operator's capping station; $300 fixture + $300 integration = $600 one-time (but the operator is not the cause — the feeder is).
Decision: Option 2 — fixed-value matches the mistake precursor (wrong count of stoppers per vials); the contact vision system (Option 1) is overkill for the cause; the motion-step (Option 3) addresses the wrong operator. Predicted: 100× reduction (200 → 2 ppm; +1.8σ, 5.05 → 6.85σ). At 1 million vials/year, $10 rework per defect: defects before = 200; defects after = 2; $ saved/year = 198 × $10 = $1,980; payback = $700 / $1,980 = 0.35 year ≈ 4 months. Layer with successive check (downstream capping verification) and autonomation (feeder stops on counter mismatch; andon signals "feeder PM required"). Hand off to Control with the SOP and the X̄/R chart on the vial-leak test.`,
    practice_questions: `- **Easy (Recall)**: State Shingo's three poka-yoke types (contact, fixed-value, motion-step) and the mistake precursor each addresses.
- **Easy (Recall)**: What is the ZQC thesis (catch defects at the source, not by sampling)?
- **Medium (Apply)**: A brake-caliper line has 5000 ppm missing-O-ring defects. After a contact poka-yoke, the defect rate drops to 50 ppm. Compute the reduction factor and the sigma-level improvement (k_before ≈ 4.1σ; k_after ≈ 5.4σ).
- **Medium (Apply)**: At $80 rework per defect and 50,000 calipers/year, compute $ saved/year and the payback for a $700 poka-yoke.
- **Hard (Analysis)**: A poka-yoke sensor has MTBF = 5 years and the line produces 50,000 calipers/year. If the sensor fails silently, how many defective calipers are produced per sensor-failure event (assuming the failure is not detected for 1 month = 4200 calipers)? What is the role of the daily morning check?
- **Hard (DecisionMaking)**: For a defect cause that is slow tool-wear drift (no clear precursor), would you choose poka-yoke or SPC? Justify.`,
    certification_questions: `- **CSSGB-style (Easy, Recall)**: What are Shingo's three poka-yoke types? (Answer: contact, fixed-value, motion-step.)
- **CSSBB-style (Medium, Application)**: A 5000 ppm defect rate drops to 50 ppm after a contact poka-yoke. Compute the reduction factor and the long-term sigma-level improvement. (Answer: R = 100×; Δk ≈ +1.3σ, from ~4.1σ to ~5.4σ.)
- **CSSBB-style (Hard, Analysis)**: Which poka-yoke type best matches a "missing part" mistake precursor? (a) Contact; (b) Fixed-value; (c) Motion-step; (d) None — use SPC. (Correct: a — contact sensor detects part presence.)`,
    summary: `Poka-yoke is the Improve-phase sustainment mechanism that locks in the gains from Analyze and the DOE/RSM-optimized set-point (Lessons 1, 2). Shingo's ZQC thesis: catch defects at the source (operation), not by post-hoc sampling. The three poka-yoke types — contact (part/feature presence), fixed-value (count), motion-step (sequence) — match three classes of mistake precursor. Autonomation (Jidoka) extends poka-yoke to the machine level (detect → stop → fix → root-cause). DFA poka-yokes at the design stage (asymmetric parts, captive fasteners). The economics are dramatically favorable: 100× defect reduction at < 0.25 year payback is routine. The layered defense — output SPC (Control phase) + input poka-yoke (Improve phase) + autonomation — locks in the Six Sigma gains for the long term. Poka-yoke is the highest-leverage Six Sigma improvement tool.`,
    key_takeaways: `- ZQC thesis: catch defects at the source (operation), not by post-hoc sampling.
- Three poka-yoke types: contact (part/feature presence), fixed-value (count), motion-step (sequence).
- Match the type to the mistake precursor: contact for part-presence, fixed-value for count, motion-step for sequence.
- Autonomation (Jidoka): machine stops on abnormality; operator fixes root cause (5-Why at the operation).
- DFA poka-yokes at the design stage (asymmetric parts, captive fasteners, foolproof connectors).
- Poka-yoke sustains the current process — does NOT improve the mean (use DOE/RSM, Lessons 1, 2).
- Economics: 100× defect reduction at < 0.25 year payback is routine; $700 implementation → $19,800/year saving.
- Sigma-level reporting: DPMO_before / DPMO_after = reduction factor; Δk ≈ +1.3σ for 100× reduction.
- Layered defense: output SPC (Control) + input poka-yoke (Improve) + autonomation (Jidoka) — locks in gains.
- Sensor must be reliability-maintained (silent failure is worse than no sensor); daily morning check is essential.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Improve phase (poka-yoke, mistake-proofing, Jidoka).
- ASQ Six Sigma Green Belt Body of Knowledge — Improve phase (poka-yoke principles, 3 types).
- Montgomery (2019), Design and Analysis of Experiments, 10th ed., Ch. on the SPC/poka-yoke interface (post-DOE sustainment).
- Montgomery (2013), Statistical Quality Control, 7th ed., Ch. on SPC and the 7 basic quality tools — the layered defense.
- Breyfogle (2003), Implementing Six Sigma, 2nd ed., Ch. 32 (poka-yoke as the Improve-phase sustainment mechanism).
- Shingo, S. (1986), Zero Quality Control: Source Inspection and the Poka-Yoke System. Productivity Press. — the canonical reference for Shingo's three poka-yoke types (contact, fixed-value, motion-step) and the ZQC thesis.`,
  },
  knowledgeObject: {
    title: "Poka-Yoke & Mistake-Proofing",
    domain: "Improve",
    competency: "Poka-Yoke & Mistake-Proofing",
    topic: "Mistake-Proofing",
    concept: "Shingo's ZQC, the 3 poka-yoke types, autonomation (Jidoka), DFA",
    body: {
      definitions: [
        "Poka-yoke (mistake-proofing): a device or procedure that prevents an operator or process from making a mistake (or makes the mistake immediately detectable).",
        "Shigeo Shingo: the Japanese industrial engineer (1909-1990) who developed poka-yoke and ZQC at Toyota from 1961; author of 'Zero Quality Control' (1986).",
        "Zero Quality Control (ZQC): Shingo's thesis that defects should be caught at the source (operation) by 100% self-check, not by post-hoc sampling.",
        "Source inspection: 100% self-check at the operation — the operator or machine verifies the part immediately before/after the operation.",
        "Successive check: the next station checks the previous; cheap, fast, no special gage; provides an independent catch.",
        "SQC sampling: traditional statistical sampling (AQL) — accepts some fraction of defective product; post-hoc.",
        "AQL (Acceptance Quality Limit): the maximum defect rate considered acceptable as a process average (e.g., AQL 1.0 = 1%).",
        "Contact poka-yoke: a sensor physically detects the part or feature presence (limit switch, photoelectric beam, proximity sensor, vision).",
        "Fixed-value poka-yoke: a count of operations or parts; the fixture releases only after the correct number.",
        "Motion-step poka-yoke: a sequence of operator motions the fixture enforces (two-hand press, sequenced doors, pedal sequence).",
        "Autonomation (Jidoka): a machine equipped with a poka-yoke stops itself on abnormality; the operator fixes the root cause.",
        "Andon: the visual signal (light, banner) that a station has stopped (often via a pull-cord by the operator).",
        "Design for Assembly (DFA): design-stage poka-yoke — asymmetric parts, captive fasteners, foolproof connectors.",
        "DPMO: defects per million opportunities = (defects / (opportunities × units)) × 10⁶.",
        "Sigma level (long-term, with 1.5σ shift): k ≈ 1.5 + NORMSINV(1 − DPMO/10⁶) for DPMO ≥ ~230.",
      ],
      principles: [
        "ZQC thesis: catch defects at the source (operation), not by post-hoc sampling.",
        "Three poka-yoke types: contact (part/feature presence), fixed-value (count), motion-step (sequence).",
        "Match the type to the mistake precursor: contact for part-presence, fixed-value for count, motion-step for sequence.",
        "100% source inspection vs. SQC sampling — ZQC accepts zero defective product.",
        "Autonomation (Jidoka): machine stops itself on abnormality; operator fixes root cause.",
        "DFA poka-yokes at the design stage (asymmetric parts, captive fasteners, foolproof connectors).",
        "Poka-yoke sustains the current process — does NOT improve the mean (use DOE/RSM, Lessons 1, 2).",
        "Economics: 100× defect reduction at < 0.25 year payback is routine.",
        "Layered defense: output SPC (Control) + input poka-yoke (Improve) + autonomation (Jidoka).",
        "Sensor must be reliability-maintained (silent failure is worse than no sensor); daily morning check is essential.",
      ],
      components: [
        "Poka-yoke device: the sensor/fixture/interlock that prevents or detects the mistake.",
        "Contact sensor: limit switch, photoelectric beam, proximity sensor, vision system.",
        "Fixed-value counter: parts dispenser, stroke counter, batch counter.",
        "Motion-step fixture: two-hand press, sequenced doors, pedal sequence.",
        "Andon: the visual signal (light, banner) that the station has stopped.",
        "Jidoka logic: detect → stop → fix → root-cause (5-Why at the operation).",
        "SOP (Standard Operating Procedure): the written procedure the poka-yoke enforces.",
        "DFA geometry: asymmetric parts, captive fasteners, foolproof connectors.",
        "SPC chart (Control phase): the X̄/R chart on the output CTQ (locks in the poka-yoke gains).",
        "Reliability of the poka-yoke device: the sensor itself must be reliability-maintained.",
      ],
      mechanism: [
        "Poka-yoke lifecycle: identify mistake (Analyze root-cause) → classify precursor (contact/fixed-value/motion-step) → choose type → design device → fail-safe verification → pilot (1-4 weeks) → measure defect rate → layer with successive check + Jidoka → document SOP/control plan → reliability-maintain sensor → track output CTQ on SPC in Control.",
      ],
      process: [
        "1. Identify the mistake (from Analyze-phase root-cause): operator forgets O-ring, wrong-way part, wrong count, wrong sequence.",
        "2. Classify the mistake precursor: contact (part/feature not present), fixed-value (wrong count), motion-step (wrong sequence).",
        "3. Choose the poka-yoke type: contact sensor, fixed-value counter, or motion-step fixture.",
        "4. Design the poka-yoke: select sensor (photoelectric, limit switch, proximity), integrate with machine control, design operator interface.",
        "5. Verify fail-safe: a failed sensor must stop the machine, not allow it to continue.",
        "6. Pilot for 1-4 weeks; measure the defect rate; verify the 100× reduction.",
        "7. Add successive checks: the next station verifies the poka-yoke signal.",
        "8. Layer with autonomation (Jidoka): machine stops on abnormality; operator fixes root cause in real-time.",
        "9. Document the SOP and the poka-yoke device in the control plan (Control phase).",
        "10. Train operators: culture must support 'stop and fix,' not 'keep the line running.'",
        "11. Add DFA poka-yokes at the design stage: asymmetric parts, captive fasteners, foolproof connectors.",
        "12. Reliability-maintain the poka-yoke sensor: PM plan, daily morning check, replace on wear-out.",
        "13. Track the output CTQ on the SPC chart in the Control phase; the layered defense locks in the gains.",
      ],
      formulas: [
        "DPMO = (defects / (opportunities × units)) × 1,000,000.",
        "Reduction factor R = DPMO_before / DPMO_after (e.g., 5000/50 = 100×).",
        "Long-term sigma level (with 1.5σ shift): k ≈ 1.5 + NORMSINV(1 − DPMO/10⁶) for DPMO ≥ ~230.",
        "Sigma-level improvement: Δk = k_after − k_before (e.g., 5.4 − 4.1 = +1.3σ).",
        "$ saved/year = (DPMO_before − DPMO_after) × units_per_year × $ rework_or_scrap / 10⁶.",
        "Payback (years) = $ implementation / $ saved/year.",
        "AQL acceptance probability: at AQL 1.0, a lot at 1% defect rate has ~37% probability of acceptance; ZQC has 100% catch at the operation.",
      ],
      metrics: [
        "DPMO_before and DPMO_after (defects per million opportunities).",
        "Reduction factor R = DPMO_before / DPMO_after (e.g., 100×).",
        "Sigma-level improvement Δk (e.g., +1.3σ long-term).",
        "$ saved/year (recurring).",
        "Implementation cost (one-time).",
        "Payback period (years; typically < 0.25 year for poka-yoke projects).",
        "Sensor MTBF and PM frequency (reliability of the poka-yoke device itself).",
        "Defect-propagation rate downstream (low when successive check is layered).",
      ],
      examples: [
        "Brake-caliper O-ring contact poka-yoke: DPMO 5000 → 50 (100×); Δk = +1.3σ; $19,800/year saved; $700 implementation; 2-week payback.",
        "Through-beam photoelectric sensor across O-ring groove: $200 sensor + $500 integration = $700.",
        "Two-hand start buttons (motion-step): ANSI B11.0 press-safety; ensures operator's hands are clear of the seating anvil.",
        "Successive check: next station (torque verification) will not start unless O-ring poka-yoke signaled OK.",
        "Autonomation: on sensor fault, the andon signals 'maintenance required' and the line stops (no defective calipers produced).",
        "DFA poka-yoke: USB-C connector is symmetric — eliminates wrong-orientation insertion (vs. USB-A which has 2 confusing orientations).",
      ],
      industrial_examples: [
        "Automotive — brake-caliper O-ring seating poka-yoke: 5000 → 50 ppm; 4.1σ → 5.4σ (+1.3σ); $19,800/year saved; 2-week payback. (Shingo, 1986, Ch. 3-5; Breyfogle, 2003, Ch. 32.)",
        "Electronics — component-polarity poka-yoke: vision system verifies polarity before pick-and-place; DPMO 800 → 8 (100×); $40,000/year saved on a 1M-unit/year line.",
        "Pharmaceutical — vial-stopper fixed-value poka-yoke: stopper counter requires N stoppers per N vials; DPMO 200 → 2 (100×); $1,980/year saved on 1M vials/year; 4-month payback.",
        "Food — seal-verification contact poka-yoke (vision system): detects missing seal on each package; DPMO 1500 → 15; $45,000/year saved on 1M packages/year.",
        "Healthcare — patient-ID bar-code poka-yoke: drug-dose administration requires bar-code scan match to patient ID; reduces medication errors by 50% (100× not always achievable in healthcare due to system complexity).",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. \"Brake-Caliper O-Ring Poka-Yoke at a Tier-1 Automotive Supplier.\" 50,000-caliper/year brake supplier; baseline 5000 ppm missing-O-ring defects costing $20,000/year in rework + $2,000/year warranty. Green Belt project: contact poka-yoke (through-beam photoelectric sensor across O-ring groove); $200 sensor + $500 integration = $700 one-time. Fixture fails-safe (no release unless O-ring detected). Layered: (a) successive check (torque-verification station will not start unless O-ring OK); (b) motion-step (two-hand buttons for the seating anvil — ANSI B11.0); (c) autonomation (sensor fault → andon red → line stops, no defective calipers produced). Post-poka-yoke (1-month pilot, 4200 calipers): 0 missing-O-ring defects; DPMO_after = 50 ppm (100× reduction, +1.3σ long-term, 4.1σ → 5.4σ). Saving: $19,800/year; payback 2 weeks. Control plan: (i) daily morning check on photoelectric sensor; (ii) sensor PM every 24 months; (iii) output SPC on leak-test pressure (Cpk = 4.67). Supplier adopted poka-yoke as a standard work element across 14 product lines, projecting $400K/year combined saving.",
      ],
      common_errors: [
        "Choosing a poka-yoke type that does not match the mistake precursor (contact sensor for a count mistake; fixed-value for part-presence).",
        "Failing to make the poka-yoke fail-safe (silent sensor failure is worse than no sensor).",
        "Neglecting the successive check (without it, a missing part can propagate downstream).",
        "Ignoring autonomation (Jidoka) — without machine-stop logic, the poka-yoke sensor alone does not stop the defect queue.",
        "Allowing operator circumvention (tape down the limit switch) — culture must support 'stop and fix.'",
        "Failing to reliability-maintain the poka-yoke sensor.",
        "Treating poka-yoke as a mean-improvement tool — it sustains the current process; for mean improvement, use DOE/RSM.",
        "Skipping the daily morning check (verify the sensor breaks the beam and the fixture does NOT release).",
        "Adding poka-yoke to a process with the wrong defect cause (e.g., slow tool-wear drift — use SPC, not poka-yoke).",
      ],
      limitations: [
        "Poka-yoke sustains the current process — does NOT improve the mean (use DOE/RSM, Lessons 1, 2).",
        "Addresses detectable mistake precursors — slow drift (tool wear) has no clear precursor (use SPC).",
        "Adds a device that itself can fail — sensor must be reliability-maintained.",
        "Can be circumvented by operators — culture must support 'stop and fix.'",
        "Does not address design defects (wrong part geometry) — DFA at the design stage is required.",
        "Operation-level — cannot prevent supply-chain defects (incoming part defects require incoming inspection).",
        "Requires engineering time to design and integrate (not as cheap as the textbook suggests for complex processes).",
        "Can create new failure modes (two-hand press slows cycle time; photoelectric sensor requires routine cleaning).",
      ],
      best_practices: [
        "Match the poka-yoke type to the mistake precursor: contact for part-presence, fixed-value for count, motion-step for sequence.",
        "Make the poka-yoke fail-safe: a failed sensor must stop the machine, not allow it to continue.",
        "Layer with successive checks: the next station verifies the poka-yoke signal.",
        "Layer with autonomation (Jidoka): machine stops on abnormality; operator fixes root cause in real-time.",
        "Train operators: the culture must support 'stop and fix,' not 'keep the line running' (train to pull the andon cord).",
        "Add DFA poka-yokes at the design stage: asymmetric parts, captive fasteners, foolproof connectors (cheapest, most reliable).",
        "Reliability-maintain the poka-yoke sensor: include in PM plan; daily morning check; replace on wear-out.",
        "Document the SOP and the poka-yoke device in the control plan (Control phase).",
        "Track the output CTQ on the SPC chart in the Control phase — layered defense locks in the gains.",
        "Report DPMO before/after, the reduction factor, the sigma-level improvement, $ saved/year, and payback period in the project closeout.",
      ],
      related_concepts: [
        "Design of Experiments (Lesson 1) — finds the new process set-point; poka-yoke sustains it.",
        "Response Surface & Optimization (Lesson 2) — finds the optimum; poka-yoke sustains it.",
        "Statistical Process Control (Control phase) — the X̄/R chart that tracks the output CTQ after poka-yoke.",
        "Root Cause Analysis (Analyze) — the 5-Why/fishbone that identifies the mistake precursor poka-yoke addresses.",
        "FMEA (Analyze) — the RPN reprioritization after poka-yoke (the poka-yoke reduces detection RPN to 1).",
        "Lean — Toyota Production System (TPS); Jidoka is one of two TPS pillars (the other is just-in-time).",
      ],
      prerequisites: [
        "DMAIC framework; position of Improve; the DOE/RSM outputs (Lessons 1, 2) that poka-yoke sustains.",
        "DPMO, the Motorola 1.5σ shift, and the standard Six Sigma table (6σ = 3.4, 5σ = 233, 4σ = 6210, 3σ = 66,807 ppm).",
        "Statistical Process Control (Control phase preview): the X̄/R chart that locks in the new set-point.",
        "Familiarity with Lean principles — autonomation (Jidoka), andon, kanban, takt time — at the conceptual level.",
        "Basic engineering economics: payback period, ROI.",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Improve phase (poka-yoke, Jidoka).",
        "ASQ Six Sigma Green Belt Body of Knowledge — Improve phase (poka-yoke principles, 3 types).",
        "Montgomery (2019), Design and Analysis of Experiments, 10th ed., Ch. on the SPC/poka-yoke interface.",
        "Montgomery (2013), Statistical Quality Control, 7th ed., Ch. on SPC and the 7 basic quality tools (layered defense).",
        "Breyfogle (2003), Implementing Six Sigma, 2nd ed., Ch. 32 (poka-yoke as Improve-phase sustainment).",
        "Shingo (1986), Zero Quality Control: Source Inspection and the Poka-Yoke System. Productivity Press. — the canonical reference for the 3 poka-yoke types and the ZQC thesis.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Poka-Yoke & Mistake-Proofing",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What are Shigeo Shingo's three poka-yoke types?",
      whyCorrect:
        "Shingo's three poka-yoke types (ZQC, 1986) are: (1) Contact — a sensor physically detects the part or feature presence (e.g., photoelectric beam across an O-ring groove); (2) Fixed-value — a count of operations or parts (e.g., a parts chute that dispenses exactly 4 bolts before the operator can proceed); (3) Motion-step — a sequence of operator motions the fixture enforces (e.g., a two-hand press requiring both hands on the controls). Each type matches a different class of mistake precursor: contact for part-presence, fixed-value for count, motion-step for sequence.",
      whyOthersWrong: [
        "Option A (control, plan, do) — these are PDCA / control-plan phases, not poka-yoke types.",
        "Option C (series, parallel, koon) — these are reliability block diagram configurations (Lesson 1 of CRE-RM), unrelated to poka-yoke.",
        "Option D (randomize, replicate, block) — these are the three DOE principles (Lesson 1 of this Improve phase), not poka-yoke types.",
      ],
      explanation:
        "Contact (part-presence), fixed-value (count), motion-step (sequence) — Shingo's three poka-yoke types (ZQC, 1986).",
      options: [
        { text: "Control, plan, do", isCorrect: false },
        { text: "Contact, fixed-value, motion-step", isCorrect: true },
        { text: "Series, parallel, koon", isCorrect: false },
        { text: "Randomize, replicate, block", isCorrect: false },
      ],
    },
    {
      competencyName: "Poka-Yoke & Mistake-Proofing",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Automotive",
      stem: "A brake-caliper line has 5000 ppm missing-O-ring defects. After a contact poka-yoke, the defect rate drops to 50 ppm. Compute the reduction factor and the long-term sigma-level improvement (with the 1.5σ Motorola shift).",
      whyCorrect:
        "Reduction factor R = DPMO_before / DPMO_after = 5000 / 50 = 100×. Sigma level before: 5000 ppm is just above 4σ (6210 ppm with the 1.5σ shift) → k_before ≈ 4.1σ. Sigma level after: 50 ppm is between 5σ (233 ppm) and 6σ (3.4 ppm), closer to 5.4σ → k_after ≈ 5.4σ. Improvement: Δk = 5.4 − 4.1 = +1.3σ long-term. So the poka-yoke delivers a 100× defect reduction and a +1.3σ improvement.",
      whyOthersWrong: [
        "Option A (R = 10×; Δk = +0.5σ) — underestimates both the reduction (5000/50 = 100, not 10) and the sigma improvement.",
        "Option C (R = 1000×; Δk = +2.0σ) — overestimates the reduction (5000/50 = 100, not 1000); 1000× would require DPMO_after = 5 ppm.",
        "Option D (R = 100×; Δk = +3.0σ) — R is correct, but Δk = +3.0σ is too large; 100× reduction corresponds to +1.3σ (4.1 → 5.4), not +3.0σ.",
      ],
      explanation:
        "R = 5000/50 = 100×. k_before ≈ 4.1σ (5000 ppm); k_after ≈ 5.4σ (50 ppm). Δk = +1.3σ long-term.",
      options: [
        { text: "R = 10×; Δk = +0.5σ", isCorrect: false },
        { text: "R = 100×; Δk = +1.3σ", isCorrect: true },
        { text: "R = 1000×; Δk = +2.0σ", isCorrect: false },
        { text: "R = 100×; Δk = +3.0σ", isCorrect: false },
      ],
    },
    {
      competencyName: "Poka-Yoke & Mistake-Proofing",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Procedural",
      scenario: "Pharmaceutical",
      stem: "A pharmaceutical fill-finish line has 200 ppm defects from a stopper feeder that occasionally skips a vial (wrong count of stoppers per vials). Which poka-yoke type best matches the mistake precursor?",
      whyCorrect:
        "The mistake precursor is 'wrong count of stoppers per vials' — a count error. Shingo's Fixed-value poka-yoke is the type that addresses count mistakes: a stopper counter on the feeder that requires exactly N stoppers per N vials; the feeder (or the line) stops if the count is off. A contact sensor (Option A) would detect individual stopper presence, but the issue is the count, not the individual stopper; a motion-step (Option C) would enforce operator sequence, but the operator is not the cause (the feeder is). SPC (Option D) tracks drift, not discrete count errors.",
      whyOthersWrong: [
        "Option A (Contact) — contact poka-yokes detect part-presence (e.g., O-ring in groove); they address 'is the part there,' not 'is the count right.' For a count mistake, fixed-value is the correct type.",
        "Option C (Motion-step) — motion-step poka-yokes enforce operator motion sequences (e.g., two-hand press); the operator is not the cause here (the feeder is).",
        "Option D (SPC, not poka-yoke) — SPC tracks drift in the output CTQ over time; the stopper-feeder skip is a discrete count error, not a slow drift. SPC is the wrong tool.",
      ],
      explanation:
        "Wrong count → fixed-value poka-yoke (stopper counter requires N stoppers per N vials; feeder stops on mismatch). Contact detects part-presence; motion-step enforces operator sequence; SPC tracks drift.",
      options: [
        { text: "Contact — vision system detects each stopper on the vial", isCorrect: false },
        { text: "Fixed-value — stopper counter requires N stoppers per N vials", isCorrect: true },
        { text: "Motion-step — two-hand fixture on the operator's capping station", isCorrect: false },
        { text: "SPC (not poka-yoke) — X̄/R chart on the vial-leak test", isCorrect: false },
      ],
    },
    {
      competencyName: "Poka-Yoke & Mistake-Proofing",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: Poka-yoke improves the process mean; that is, it raises yield by moving the average response toward the optimum.",
      whyCorrect:
        "FALSE. Poka-yoke is the Improve-phase *sustainment* mechanism — it locks in the gains from the upstream DOE/RSM work (Lessons 1, 2) by enforcing the new set-point at the operation. It does NOT improve the process mean; for mean improvement, use DOE (Lesson 1) and RSM (Lesson 2). Poka-yoke reduces the *defect rate* (eliminates mistakes) but does not move the average response. The output SPC chart in the Control phase tracks the mean (locked in); the input poka-yoke enforces the set-point. The two together — output SPC + input poka-yoke — provide the layered defense.",
      whyOthersWrong: [
        "Option TRUE — would conflate poka-yoke (sustainment / defect elimination) with DOE/RSM (mean improvement). Poka-yoke addresses discrete mistakes at the operation (missing part, wrong-way part, wrong count, wrong sequence); it does not move the average yield.",
      ],
      explanation:
        "FALSE. Poka-yoke *sustains* the current process (locks in the set-point from Lessons 1, 2). Mean improvement is via DOE (Lesson 1) and RSM (Lesson 2). Poka-yoke eliminates discrete mistakes (missing part, wrong count), reducing defect rate, not moving the mean.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Aggregate the 3 Improve lessons.
// ---------------------------------------------------------------------------

const SS_IMPROVE_LESSONS: RefLesson[] = [
  LESSON_DOE,
  LESSON_RSM,
  LESSON_POKA_YOKE,
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-reliability-modeling.ts) with the
// additional step of creating the 3 Improve competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the Six Sigma Improve (I) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Six Sigma certification by slug "six-sigma" (the structure +
 *     Measure/Analyze content loader in src/lib/ref-content/six-sigma.ts is
 *     a prerequisite).
 *  2. Find the Improve (I) domain by code "I" (certificationId = six-sigma.id).
 *     The I domain exists in six-sigma.ts with NO competencies — delete any
 *     stale I competencies and create the 3 I competencies from
 *     SS_IMPROVE_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids applied
 *     to every I lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or create
 *       with sectionId=null, certificationId, competencyId, slug, title,
 *       titleAr, order, durationMin, conceptIntroduction, example, keyFormulas,
 *       exercise, sections (JSON.stringify), referenceIds (JSON.stringify
 *       shared), status="READY", confidence="HIGH", verificationStatus=
 *       "VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (I), competencyId, lessonId,
 *     body JSON, referenceIds (JSON shared), certificationIds (JSON
 *     [six-sigma.id]), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos, questions,
 *      references } counts.
 *
 * IMPORTANT: This loader does NOT call six-sigma.ts or wipe other DMAIC
 * domains (Define, Measure, Analyze, Control). All operations are scoped to
 * the Improve (I) domain only — the 3 I competencies are created here, and 3
 * lessons/KOs/12 questions are loaded. The Measure and Analyze competencies
 * and lessons authored in six-sigma.ts are untouched.
 */
export async function loadReference() {
  // 1) Certification (find by slug "six-sigma")
  const certification = await db.certification.findUnique({
    where: { slug: "six-sigma" },
  });
  if (!certification) {
    throw new Error(
      'Six Sigma certification not found. Run the Six Sigma structure + Measure/Analyze content loader (src/lib/ref-content/six-sigma.ts) first.'
    );
  }

  // 2) Find the Improve (I) domain by code "I" (certificationId = six-sigma.id).
  //    The I domain exists in six-sigma.ts but is seeded with NO competencies —
  //    delete any stale I competencies and create the 3 I competencies here.
  const improveDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "I" },
  });
  if (!improveDomain) {
    throw new Error(
      'Improve (I) domain not found under Six Sigma. Run the Six Sigma structure + Measure/Analyze content loader (src/lib/ref-content/six-sigma.ts) first.'
    );
  }

  // Delete any existing I competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: improveDomain.id },
  });

  // Create the 3 I competencies.
  for (const c of SS_IMPROVE_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: improveDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map I competencies by NAME -> id.
  const improveCompetencies = await db.competency.findMany({
    where: { domainId: improveDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of improveCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected I competencies exist by name.
  const expectedCompetencyNames = SS_IMPROVE_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing Improve (I) competencies by name: ${missing.join(
        ", "
      )}. Ensure SS_IMPROVE_COMPETENCIES matches SS_IMPROVE_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of SS_IMPROVE_SOURCES) {
    const existing = await db.reference.findFirst({
      where: { title: src.title },
    });
    const data = {
      sectionId: null,
      title: src.title,
      level: src.level,
      levelLabel: src.levelLabel,
      type: src.type,
      url: src.url ?? null,
      citation: src.citation,
    };
    if (existing) {
      await db.reference.update({ where: { id: existing.id }, data });
      refIdsByTitle[src.title] = existing.id;
    } else {
      const created = await db.reference.create({ data });
      refIdsByTitle[src.title] = created.id;
    }
  }
  const sharedReferenceIds = SS_IMPROVE_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter(Boolean) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of SS_IMPROVE_LESSONS) {
    const competencyId = competencyIdByName[lesson.competencyName];
    if (!competencyId) {
      // Already validated above; defensive guard for TS.
      throw new Error(
        `Competency not found for lesson ${lesson.slug}: ${lesson.competencyName}`
      );
    }

    // Derive legacy fields from the 24-section content (with fallbacks).
    const conceptIntroduction =
      lesson.conceptIntroduction ??
      lesson.sections.learning_objectives ??
      "";
    const example = lesson.example ?? lesson.sections.worked_example ?? null;
    const keyFormulas =
      lesson.keyFormulas ?? lesson.sections.formula_calculation ?? null;
    const exercise =
      lesson.exercise ?? lesson.sections.practice_questions ?? null;

    const sectionsJson = JSON.stringify(lesson.sections);

    // 4) Lesson — findFirst by (competencyId, slug) then update or create
    //    (sectionId is null on the certification track).
    const existingLesson = await db.lesson.findFirst({
      where: { competencyId, slug: lesson.slug },
    });
    const lessonData = {
      sectionId: null,
      certificationId: certification.id,
      competencyId,
      slug: lesson.slug,
      title: lesson.title,
      titleAr: lesson.titleAr ?? null,
      order: lesson.order,
      durationMin: lesson.durationMin,
      conceptIntroduction,
      example,
      keyFormulas,
      exercise,
      sections: sectionsJson,
      referenceIds: sharedReferenceIdsJson,
      sharedAcrossCerts: false,
      status: "READY",
      confidence: "HIGH",
      verificationStatus: "VERIFIED",
      version: "1.0.0",
      lastReviewedAt: new Date(),
    };
    let lessonId: string;
    if (existingLesson) {
      const updated = await db.lesson.update({
        where: { id: existingLesson.id },
        data: lessonData,
      });
      lessonId = updated.id;
    } else {
      const created = await db.lesson.create({ data: lessonData });
      lessonId = created.id;
    }
    lessonsCount += 1;

    // 5) KnowledgeObject — findFirst by lessonId, then update or create.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { lessonId },
    });
    const koData = {
      certificationId: certification.id,
      domainId: improveDomain.id,
      competencyId,
      lessonId,
      title: ko.title,
      domain: ko.domain,
      competency: ko.competency,
      topic: ko.topic,
      concept: ko.concept,
      body: koBodyJson,
      version: "1.0.0",
      confidence: "HIGH",
      verificationStatus: "VERIFIED",
      status: "READY",
      referenceIds: sharedReferenceIdsJson,
      certificationIds: JSON.stringify([certification.id]),
    };
    let koId: string;
    if (existingKO) {
      const updated = await db.knowledgeObject.update({
        where: { id: existingKO.id },
        data: koData,
      });
      koId = updated.id;
    } else {
      const created = await db.knowledgeObject.create({ data: koData });
      koId = created.id;
    }
    kosCount += 1;

    // 6) Questions — delete existing for this competency (scoped), then
    //    create each enriched question with nested options.
    await db.question.deleteMany({
      where: { certificationId: certification.id, competencyId },
    });

    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          certificationId: certification.id,
          domainId: improveDomain.id,
          competencyId,
          lessonId,
          knowledgeObjectId: koId,
          type: q.type,
          difficulty: q.difficulty,
          bloomLevel: q.bloomLevel,
          cognitiveLevel: q.cognitiveLevel,
          skillType: q.skillType ?? null,
          scenario: q.scenario ?? null,
          industry: q.scenario ?? null,
          language: "en",
          stem: q.stem,
          explanation: q.explanation ?? null,
          whyCorrect: q.whyCorrect,
          whyOthersWrong: JSON.stringify(q.whyOthersWrong),
          referenceIds: sharedReferenceIdsJson,
          status: "READY",
          verificationStatus: "VERIFIED",
          reviewStatus: "PENDING",
          version: "1.0.0",
          options: {
            create: q.options.map((opt, i) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: i,
            })),
          },
        },
      });
      questionsCount += 1;
    }
  }

  return {
    certification: certification.id,
    domain: improveDomain.id,
    competencies: improveCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}

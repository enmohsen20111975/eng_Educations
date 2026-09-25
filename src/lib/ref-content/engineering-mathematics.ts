/**
 * Engineering Mathematics — Gold-standard reference dataset (Task ID 9).
 *
 * Section slug: "engineering-mathematics"
 * Lessons (4): calculus-differentiation · linear-algebra · differential-equations · probability-statistics
 *
 * Each lesson ships the full 24-section data-collector template (spec §9), a
 * Knowledge Object body (spec §7, KO_FIELDS), and 5 enriched questions
 * (whyCorrect + whyOthersWrong + cognitiveLevel + KO link). Total: 20 questions.
 *
 * Source hierarchy (spec §5): LEVEL 6 — University / Academic Publications.
 * References cite REAL, widely-known undergraduate textbooks:
 *   - Stewart, Calculus: Early Transcendentals (8th ed., 2015)
 *   - Strang, Introduction to Linear Algebra (6th ed., 2023)
 *   - Boyce & DiPrima, Elementary Differential Equations and Boundary Value Problems (11th ed., 2017)
 *   - Walpole, Myers, Myers & Ye, Probability & Statistics for Engineers & Scientists (9th ed., 2016)
 *   - Kreyszig, Advanced Engineering Mathematics (10th ed., 2011)
 *   - MIT OpenCourseWare 18.01/18.02/18.06 (academic course material)
 *
 * Originality: examples, case studies, decision scenarios and questions are
 * reworded and engineered for this platform (no exam-dump copy); textbook
 * results are summarized/cited, not reproduced.
 *
 * Lifecycle: every record is upserted as status="READY", confidence="HIGH",
 * verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 */

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RefQuestion {
  lessonSlug: string;
  type: "MultipleChoice" | "TrueFalse";
  difficulty: "Easy" | "Medium" | "Hard";
  bloomLevel: "Remember" | "Understand" | "Apply" | "Analyze";
  cognitiveLevel: string; // Recall|Understanding|Application|Analysis|Evaluation|Calculation|Scenario|DecisionMaking
  skillType?: string;
  stem: string;
  explanation?: string;
  whyCorrect: string;
  whyOthersWrong: string[];
  options: { text: string; isCorrect: boolean }[];
}

export interface RefLesson {
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
  /** The 24-section template, keyed by spec §9 ids; values are markdown-ish strings or "NOT_APPLICABLE". */
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
  type: string; // BOOK|STANDARD|HANDBOOK|PAPER|WEBSITE|...
  url?: string;
  citation: string;
}

// ---------------------------------------------------------------------------
// Sources (LEVEL 6 — University / Academic Publications)
// ---------------------------------------------------------------------------

export const ENGINEERING_MATHEMATICS_SOURCES: RefSource[] = [
  {
    title: "Stewart — Calculus: Early Transcendentals (8th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Stewart, J. (2015). Calculus: Early Transcendentals (8th ed.). Cengage Learning. ISBN 978-1-285-74155-0. Chapters 2–4 (limits, derivatives, applications).",
  },
  {
    title: "Strang — Introduction to Linear Algebra (6th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Strang, G. (2023). Introduction to Linear Algebra (6th ed.). Wellesley-Cambridge Press. ISBN 978-1-7331469-1-3. Chapters 1–3 (vectors, matrices, determinants), Chapter 6 (eigenvalues).",
  },
  {
    title:
      "Boyce & DiPrima — Elementary Differential Equations and Boundary Value Problems (11th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Boyce, W. E. & DiPrima, R. C. (2017). Elementary Differential Equations and Boundary Value Problems (11th ed.). Wiley. ISBN 978-1-119-32063-0. Chapters 1–2 (first-order), Chapter 3 (second-order linear), Chapter 6 (Laplace transform).",
  },
  {
    title:
      "Walpole, Myers, Myers & Ye — Probability & Statistics for Engineers & Scientists (9th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Walpole, R. E., Myers, R. H., Myers, S. L. & Ye, K. (2016). Probability & Statistics for Engineers & Scientists (9th ed.). Pearson. ISBN 978-0-321-62911-1. Chapters 2–3 (probability), 4–5 (random variables), 8 (estimation).",
  },
  {
    title: "Kreyszig — Advanced Engineering Mathematics (10th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Kreyszig, E. (2011). Advanced Engineering Mathematics (10th ed.). Wiley. ISBN 978-0-470-45836-5. Chapters 1–2 (ODEs), 6 (Laplace), 7–8 (linear algebra), 22–24 (probability & statistics).",
  },
  {
    title: "MIT OpenCourseWare — Mathematics for Engineers (18.01 / 18.02 / 18.06)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "WEBSITE",
    url: "https://ocw.mit.edu/search/?d=Engineering%20%28course%2018%29",
    citation:
      "MIT OpenCourseWare. Course 18 (Mathematics): 18.01 Single Variable Calculus; 18.02 Multivariable Calculus; 18.06 Linear Algebra. Free lecture notes, problem sets and exams. Massachusetts Institute of Technology. Accessed 2024.",
  },
];

// ---------------------------------------------------------------------------
// Lesson 1 — Calculus & Differentiation
// ---------------------------------------------------------------------------

const LESSON_CALCULUS: RefLesson = {
  slug: "calculus-differentiation",
  title: "Calculus & Differentiation",
  titleAr: "التفاضل وحساب التفاضل",
  order: 1,
  durationMin: 22,
  references: [
    "Stewart — Calculus: Early Transcendentals (8th ed.)",
    "Kreyszig — Advanced Engineering Mathematics (10th ed.)",
    "MIT OpenCourseWare — Mathematics for Engineers (18.01 / 18.02 / 18.06)",
  ],
  conceptIntroduction: `The derivative \`dy/dx\` is the instantaneous rate of change of \`y\` with respect to \`x\`.
Key rules: power rule \`d/dx[xⁿ] = n·xⁿ⁻¹\`, product rule \`(uv)′ = u′v + uv′\`, quotient rule \`(u/v)′ = (u′v − uv′)/v²\`, chain rule \`d/dx[f(g(x))] = f′(g(x))·g′(x)\`.
Maxima/minima occur where \`f′(x) = 0\`; classify with the second-derivative test: \`f″ > 0\` ⇒ min, \`f″ < 0\` ⇒ max.`,
  example: `Find the dimensions that minimize the surface area of a 1-L cylindrical can.
Volume constraint \`V = π r² h = 1000 cm³\` ⇒ \`h = 1000/(π r²)\`.
Surface area \`S = 2π r² + 2π r h = 2π r² + 2000/r\`.
\`S′(r) = 4π r − 2000/r² = 0  ⇒  r³ = 500/π  ⇒  r ≈ 5.42 cm\`.
\`h = 1000/(π·5.42²) ≈ 10.84 cm\`  ⇒  \`h = 2r\` (the calculus optimum).
\`S″(r) = 4π + 4000/r³ > 0\` ⇒ minimum confirmed.`,
  keyFormulas: `(uv)′ = u′v + uv′
(u/v)′ = (u′v − uv′)/v²
Chain: d/dx[f(g)] = f′(g)·g′
Power: d/dx[xⁿ] = n·xⁿ⁻¹
Taylor: f(x) = Σ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ`,
  exercise: `Use the chain rule to differentiate \`f(x) = sin(3x² − 1)\` and evaluate \`f′(0)\`. (Hint: outer derivative is cos, inner derivative is 6x.)`,
  sections: {
    learning_objectives: `- Define the derivative as the limit of the difference quotient and interpret it as an instantaneous rate of change.
- Apply the power, product, quotient, and chain rules to differentiate elementary functions.
- Use implicit differentiation to find \`dy/dx\` for relations not solved for \`y\`.
- Locate and classify critical points using the first- and second-derivative tests.
- Construct Taylor polynomial approximations of a function about a point and use them for linearization.`,
    prerequisites: `- Algebraic manipulation: factoring, completing the square, rationalizing.
- Properties of exponentials, logarithms, and trigonometric functions.
- The concept of a limit (informal ε-δ) and the limit laws.
- Continuity and the Intermediate Value Theorem.`,
    introduction: `Calculus is the mathematics of change. Whereas algebra describes static relationships, calculus lets engineers reason about instantaneous rates, accumulating quantities, and the local behavior of smooth functions.

Differentiation is the half of calculus concerned with rates of change: the slope of a curve, velocity from position, marginal cost from total cost, sensitivity of an output to a parameter.

In engineering practice, derivatives appear whenever a system changes smoothly over time, space, voltage, temperature, or any other continuous variable. Optimization (find the best design), stability (is this equilibrium attracting?), and sensitivity analysis (which input matters most?) all start with a derivative.`,
    terminology: `- **Derivative**: \`f′(x) = lim[h→0] [f(x+h) − f(x)]/h\`; the slope of the tangent line at \`x\`.
- **Difference quotient**: the slope of a secant line \`[f(x+h) − f(x)]/h\` *before* the limit is taken.
- **Critical point**: an \`x\` where \`f′(x) = 0\` or \`f′(x)\` does not exist.
- **Inflection point**: an \`x\` where \`f″(x)\` changes sign (concavity flips).
- **Higher-order derivative**: \`f⁽ⁿ⁾(x)\`; \`f″\` is the derivative of \`f′\`.
- **Taylor series**: \`T_n(x) = Σ_{k=0}^{n} f⁽ᵏ⁾(a)/k! · (x−a)ᵏ\` — a polynomial approximating \`f\` near \`a\`.
- **Implicit differentiation**: differentiating both sides of \`F(x, y) = 0\` while treating \`y\` as a function of \`x\`.`,
    detailed_explanation: `The formal definition \`f′(x) = lim[h→0] (f(x+h) − f(x))/h\` generalizes the slope of a secant to the slope of a tangent. **Geometric interpretation**: \`f′(x_0)\` is the slope of the tangent line to \`y = f(x)\` at \`x = x_0\`. **Physical interpretation**: if \`x\` is time and \`f\` is position, \`f′(x)\` is the instantaneous velocity.

The rules of differentiation compose algebraically:
- **Linearity**: \`(a·f + b·g)′ = a·f′ + b·g′\`.
- **Product**: \`(u·v)′ = u′v + u·v′\`.
- **Quotient**: \`(u/v)′ = (u′v − u·v′)/v²\`.
- **Chain**: \`[f(g(x))]′ = f′(g(x))·g′(x)\`.

Most derivatives an engineer meets are applications of these rules with a small library: \`d/dx[xⁿ] = n·xⁿ⁻¹\`, \`d/dx[eˣ] = eˣ\`, \`d/dx[ln x] = 1/x\`, \`d/dx[sin x] = cos x\`, \`d/dx[cos x] = −sin x\`.

**Implicit differentiation** handles equations like \`x² + y² = r²\` where \`y\` is not isolated. Differentiating both sides w.r.t. \`x\`: \`2x + 2y·y′ = 0 ⇒ y′ = −x/y\`. This is essential for related-rates and curve-sketching problems.

Higher derivatives describe concavity and acceleration. \`f″(x) > 0\` means concave up (holds water); \`f″(x) < 0\` means concave down. Combined with \`f′ = 0\`, the sign of \`f″\` classifies extrema.

**Taylor's theorem** truncates to a polynomial that locally matches \`f\` to as many derivatives as terms used: \`f(x) ≈ f(a) + f′(a)(x−a) + f″(a)/2·(x−a)² + …\` Engineers use the one-term form \`f(x) ≈ f(a) + f′(a)(x−a)\` for **linearization** around an operating point — the basis of small-signal analysis in electronics and of linear control.`,
    core_principles: `- **Locality**: the derivative describes behavior *near* a point, not globally.
- **Linearity**: differentiation is a linear operator on the vector space of differentiable functions.
- **Composition**: the chain rule is the engine that builds complex derivatives from simple ones.
- **Optimization**: extrema of smooth functions on open intervals occur at critical points (where \`f′ = 0\` or \`f′\` is undefined).`,
    components: `- The difference quotient \`lim[h→0]\`.
- Algebraic rules: power, product, quotient, chain.
- Special functions: polynomial, exponential, logarithmic, trigonometric.
- Higher derivatives and the second-derivative test.
- Taylor/Maclaurin series expansion.`,
    process: `1. **Identify structure** of \`f(x)\`: polynomial? product? quotient? composite? implicit?
2. **Select the appropriate rule** (or a combination via the chain rule).
3. **Differentiate term-by-term**, simplifying where useful.
4. For optimization: solve \`f′(x) = 0\` to find critical points, then test the sign of \`f″\` (or sign change of \`f′\`).
5. For linearization: evaluate \`f\` and \`f′\` at the operating point \`a\` and form the Taylor polynomial.`,
    formula_calculation: `- **Power rule**: \`d/dx[xⁿ] = n·xⁿ⁻¹\`. Units: if \`x\` is in metres, the derivative has units of \`xⁿ⁻¹\` per metre.
- **Product rule**: \`(u·v)′ = u′v + u·v′\`.
- **Quotient rule**: \`(u/v)′ = (u′v − u·v′)/v²\` (requires \`v ≠ 0\`).
- **Chain rule**: \`d/dx[f(g(x))] = f′(g(x))·g′(x)\`.
- **Implicit differentiation**: for \`F(x, y) = 0\`, \`y′ = −(∂F/∂x)/(∂F/∂y)\`.
- **Second-derivative test**: if \`f′(c) = 0\` then \`f″(c) < 0 ⇒\` local max; \`f″(c) > 0 ⇒\` local min; \`f″(c) = 0 ⇒\` inconclusive.
- **Taylor polynomial (about \`a\`)**: \`T_n(x) = Σ_{k=0}^{n} f⁽ᵏ⁾(a)/k! · (x−a)ᵏ\`.`,
    worked_example: `**Problem.** A manufacturer must produce a 1-litre cylindrical metal can. Find the radius \`r\` and height \`h\` that minimize the total surface area (and hence the material used).

**Step 1 — Constraints.** Volume \`V = π r² h = 1000 cm³\` (1 L = 1000 cm³).
**Step 2 — Objective.** Surface area \`S = 2π r²\` (two ends) \`+ 2π r h\` (side).
**Step 3 — Eliminate \`h\`.** \`h = 1000/(π r²)\`, so \`S(r) = 2π r² + 2π r · 1000/(π r²) = 2π r² + 2000/r\`.
**Step 4 — Differentiate.** \`S′(r) = 4π r − 2000/r²\`.
**Step 5 — Set \`S′(r) = 0\`.** \`4π r = 2000/r² ⇒ r³ = 2000/(4π) = 500/π\` ⇒ \`r = (500/π)^(1/3)\`.
**Step 6 — Numerics.** \`r ≈ (159.155)^(1/3) ≈ 5.42 cm\`.
**Step 7 — Find \`h\`.** \`h = 1000/(π · 5.42²) ≈ 1000/92.30 ≈ 10.84 cm\` (note \`h ≈ 2r\`).
**Step 8 — Verify minimum.** \`S″(r) = 4π + 4000/r³ > 0\` for \`r > 0\` ⇒ \`S\` is concave up ⇒ minimum confirmed.

**Result.** \`r ≈ 5.42 cm\`, \`h ≈ 10.84 cm\`, total area \`≈ 553.7 cm²\`. A cylinder with height equal to its diameter uses the least material.`,
    industrial_example: `**Manufacturing — sheet-metal container design.** Real can makers (beverage cans, food tins) trade material cost against manufacturability. The calculus optimum (\`h = 2r\`) is the starting point; it is then adjusted for stacking strength, label wrap area, lid-seaming tolerance, and ergonomic grip.

**Power & Utilities — marginal heat rate.** The fuel input \`F(P)\` of a thermal generator as a function of output power \`P\` is smooth and convex; the marginal heat rate \`dF/dP\` is the quantity that economic-dispatch software uses to decide which generators to load next as demand rises.

**Construction — slope stability.** The factor of safety of a soil slope is a smooth function of the water-table height; the critical water table at which the safety drops below 1 is found by setting the derivative to zero.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A small solar inverter has an output-power curve \`P(t) = P_max · sin(π t / T)\` for \`t ∈ [0, T]\`, where \`T = 12\` h of daylight. The control system must (a) compute the instantaneous rate of change of output at \`t = 3\` h (mid-morning), and (b) identify the time of peak output.

(a) \`P′(t) = (π P_max/T) · cos(π t/T)\`. At \`t = 3\` h: \`P′(3) = (π P_max/12) · cos(π/4) = (π P_max/12) · (√2/2) ≈ 0.185 P_max\` per hour.

(b) Peak where \`P′(t) = 0\` ⇒ \`cos(π t/T) = 0\` ⇒ \`π t/T = π/2\` ⇒ \`t = T/2 = 6\` h (solar noon). The peak is intuitive but the derivative machinery confirms it generally.`,
    visual_explanation: `- **Tangent-line sketch**: draw \`f(x) = x²\` on \`[−1, 2]\`; at \`x = 1\` the tangent has slope \`f′(1) = 2\`.
- **Secant-to-tangent**: as the second point slides toward \`(1, 1)\`, the secant slope tends to 2.
- **Sign chart for \`f′\` and \`f″\`**: \`+\`/\`0\`/\`−\` markers locate maxima, minima, and inflection points.
- **Cylinder diagram**: radius \`r\` and height \`h\` annotated with the constraint \`V = 1 L\` and the objective \`S\`.`,
    simulation_opportunity: "NOT_APPLICABLE",
    common_mistakes: `- **Forgetting the chain rule** on composite functions, e.g. writing \`d/dx[sin 2x] = cos 2x\` instead of \`2·cos 2x\`.
- **Applying the product rule where the quotient rule is required** (or vice-versa).
- **Treating \`d/dx\` as a fraction** and "cancelling differentials" incorrectly; valid manipulations need actual differential forms.
- **Conflating critical points with extrema**: a critical point is *necessary* but not *sufficient*. The endpoints of a closed interval must also be checked.
- **Mixing units**: differentiating a quantity without ensuring \`x\` and \`f(x)\` carry consistent units — the derivative inherits units of \`[output]/[input]\`.
- **Ignoring higher-order behavior**: concluding "max" from \`f′ = 0\` alone without checking \`f″\` or the sign change of \`f′\`.`,
    limitations: `- The derivative exists only where the function is locally linear (smooth). At cusps, jumps, or vertical tangents, \`f′(x)\` may fail to exist.
- Optimization via derivatives finds **local** extrema; global optima on a closed interval also require endpoint comparison.
- Linearization (one-term Taylor) is accurate only near the operating point; large excursions violate the small-signal assumption.`,
    comparison: `- **Differentiation vs. integration**: differentiation decomposes (rate of change); integration accumulates (area under the curve); the Fundamental Theorem of Calculus makes them inverse operations.
- **Analytic vs. numerical differentiation**: closed-form rules give exact derivatives; the finite-difference approximation \`[f(x+h) − f(x)]/h\` has truncation error \`O(h)\` and round-off error \`~ε/h\`.
- **Implicit vs. explicit differentiation**: explicit is simpler but unavailable when \`y\` cannot be isolated.`,
    practical_application: `- **Sensitivity analysis**: \`∂y/∂xᵢ\` tells the engineer how much a model output changes per unit change in input \`i\`.
- **Linearization for control**: replace a nonlinear plant \`y = f(u)\` by \`Δy ≈ f′(u₀)·Δu\` around an operating point.
- **Curve fitting and regression**: least-squares minimization is solved by setting the derivatives of the residual sum to zero (the "normal equations").`,
    decision_scenario: `You are sizing a rectangular beam of fixed cross-section area \`A = b·h\`. The bending stiffness is proportional to the second moment of area \`I = b·h³/12\`. To maximize stiffness for a given amount of material, what aspect ratio \`h/b\` should you choose?

Let \`h = A/b\`, so \`I(b) = b·(A/b)³/12 = A³/(12 b²)\`. Then \`I′(b) = −A³/(6 b³) < 0\` for all \`b > 0\`; \`I\` is strictly decreasing in \`b\`, so make \`b\` as small as physically possible and \`h\` as large as possible — i.e. orient the section vertically (deep, narrow beam). This is exactly why floor joists are tall and thin: the calculus makes the geometry obvious.`,
    practice_questions: `- Differentiate \`f(x) = (3x² + 1)⁵\` using the chain rule. *(Answer: \`30x·(3x² + 1)⁴\`.)*
- Find all critical points of \`f(x) = x³ − 3x + 2\` and classify as maxima/minima. *(Answer: \`f′ = 3x² − 3 = 0 ⇒ x = ±1\`; \`f″(1) = 6 > 0\` ⇒ min at \`x=1, f=0\`; \`f″(−1) = −6 < 0\` ⇒ max at \`x=−1, f=4\`.)*
- Use implicit differentiation to find \`dy/dx\` for \`x²y + xy² = 0\`.
- Compute the third-order Taylor polynomial of \`f(x) = eˣ\` about \`a = 0\`. *(Answer: \`T₃(x) = 1 + x + x²/2 + x³/6\`.)*
- A manufacturer's cost is \`C(x) = 200 + 50x − 0.1x²\` for \`x\` units. Find the marginal cost at \`x = 100\`. *(Answer: \`C′(100) = 50 − 0.2·100 = 30\` per unit.)*`,
    certification_questions: `The NCEES **FE (Fundamentals of Engineering)** exam tests single-variable differentiation, related rates, optimization, and linearization under the Mathematics section. Sample FE-style prompts:

(a) Find the maximum of \`f(x) = −x³ + 3x² + 1\` on \`[0, 3]\`. (\`f′ = −3x² + 6x = 3x(2 − x)\`; critical \`x = 0, 2\`; \`f(0)=1, f(2)=5, f(3)=1\` ⇒ max value \`5\` at \`x=2\`.)

(b) A 10-ft ladder slides down a wall at \`1\` ft/s. Find the rate at which the bottom moves when the ladder is \`5\` ft from the wall (related rates).

The questions in this lesson's question bank are aligned to these FE competencies.`,
    summary: `The derivative is the local rate of change. Master five rules — power, product, quotient, chain, implicit — and most engineering functions yield. **Critical points + second-derivative test** identify extrema; for closed intervals, also compare endpoints. **Taylor polynomials** linearize smooth models around operating points, enabling small-signal analysis and Newton's iteration for root-finding.`,
    key_takeaways: `- \`d/dx[f(g(x))] = f′(g(x))·g′(x)\` — the chain rule is the most-tested rule in practice.
- Optimization on an open interval: solve \`f′ = 0\`, then classify with \`f″\`.
- Linear approximation: \`f(x) ≈ f(a) + f′(a)·(x−a)\`.
- Units of \`f′\` are \`[units of f]/[units of x]\`.`,
    references: `- Stewart, J. (2015). *Calculus: Early Transcendentals* (8th ed.). Cengage Learning. Chapters 2–4.
- Kreyszig, E. (2011). *Advanced Engineering Mathematics* (10th ed.). Wiley. Sections 1.5–1.7 (Taylor series, Newton's method).
- MIT OpenCourseWare 18.01 — Single Variable Calculus (free course material).`,
  },
  knowledgeObject: {
    title: "Derivative as instantaneous rate of change",
    domain: "Engineering Mathematics",
    competency: "Differentiate elementary functions; locate and classify extrema; linearize smooth models.",
    topic: "Single-variable differential calculus",
    concept: "Derivative",
    body: {
      definitions: [
        "Derivative: f′(x) = lim[h→0] [f(x+h) − f(x)]/h — slope of tangent at x.",
        "Difference quotient: [f(x+h) − f(x)]/h — secant slope before the limit.",
        "Critical point: x where f′(x) = 0 or f′(x) does not exist.",
        "Inflection point: x where f″(x) changes sign.",
        "Taylor polynomial: T_n(x) = Σ_{k=0..n} f⁽ᵏ⁾(a)/k! · (x−a)ᵏ.",
      ],
      principles: [
        "Linearity: (af + bg)′ = af′ + bg′.",
        "Chain composition: [f(g(x))]′ = f′(g(x))·g′(x).",
        "Optimization: extrema of smooth functions on open intervals occur at critical points.",
        "Locality: derivative describes behavior near a point, not globally.",
      ],
      components: [
        "Algebraic rules: power, product, quotient, chain.",
        "Special functions: polynomial, exponential, logarithmic, trigonometric.",
        "Implicit differentiation via the chain rule on F(x, y) = 0.",
        "Second-derivative test for classifying extrema.",
        "Taylor/Maclaurin series for linearization.",
      ],
      mechanism: [
        "Differentiation is the linear operator mapping a smooth function f to its slope function f′.",
        "The chain rule composes derivatives of nested functions.",
        "Setting f′(x) = 0 converts an optimization problem into a root-finding problem.",
      ],
      process: [
        "Identify the structure of f (polynomial, product, quotient, composite, implicit).",
        "Select the appropriate rule(s); apply term-by-term; simplify.",
        "For optimization: solve f′ = 0 and classify with f″ or sign change of f′.",
        "For linearization: evaluate f and f′ at the operating point a and form T_1(x) = f(a) + f′(a)·(x−a).",
      ],
      formulas: [
        "Power rule: d/dx[xⁿ] = n·xⁿ⁻¹.",
        "Product rule: (uv)′ = u′v + uv′.",
        "Quotient rule: (u/v)′ = (u′v − uv′)/v².",
        "Chain rule: d/dx[f(g(x))] = f′(g(x))·g′(x).",
        "Implicit: y′ = −(∂F/∂x)/(∂F/∂y) for F(x, y) = 0.",
        "Second-derivative test: f′(c) = 0, f″(c) > 0 ⇒ min; f″(c) < 0 ⇒ max.",
        "Taylor polynomial: T_n(x) = Σ_{k=0..n} f⁽ᵏ⁾(a)/k! · (x−a)ᵏ.",
      ],
      metrics: [
        "Order of accuracy of forward difference: O(h) truncation, round-off ~ε/h.",
        "Tangent-slope units: [units of f]/[units of x].",
        "Taylor remainder bound: |R_n(x)| ≤ M·|x−a|^(n+1)/(n+1)!, M = sup |f⁽ⁿ⁺¹⁾|.",
      ],
      examples: [
        "Cylinder optimization (r ≈ 5.42 cm, h ≈ 10.84 cm for 1-L can) — see worked_example.",
        "Beam-stiffness aspect ratio: maximize I = b·h³/12 with b·h = A ⇒ make h as large as possible.",
      ],
      industrial_examples: [
        "Manufacturing: sheet-metal container design (calculus optimum h = 2r, then adjusted for stacking/seaming).",
        "Power & Utilities: marginal heat rate dF/dP drives economic dispatch.",
        "Construction: slope stability — critical water-table height found via dFoS/dh = 0.",
      ],
      case_studies: [
        "SYNTHETIC solar-inverter output curve P(t) = P_max·sin(π t/T); peak at t = T/2 confirmed via P′(t) = 0.",
      ],
      common_errors: [
        "Missing the chain rule on composite functions (most common student error).",
        "Conflating critical points with extrema — endpoints and sign changes are also needed.",
        "Mixing units of the derivative.",
        "Linearizing too far from the operating point.",
      ],
      limitations: [
        "Derivative exists only where the function is locally smooth.",
        "Local extrema found via f′ = 0; global extrema require endpoint comparison.",
        "Linearization (one-term Taylor) is accurate only near the operating point.",
      ],
      best_practices: [
        "Identify the function structure before choosing a rule.",
        "Track units through every differentiation step.",
        "Verify the second-derivative sign before concluding max/min.",
        "Linearize only within a region where the residual is acceptable.",
      ],
      related_concepts: [
        "Integration (inverse operation, Fundamental Theorem of Calculus).",
        "Limits and continuity (precursor).",
        "Numerical analysis (finite-difference approximations).",
        "Optimization (gradient-based methods).",
      ],
      prerequisites: [
        "Algebra: factoring, completing the square, rationalizing.",
        "Properties of exponentials, logarithms, and trig functions.",
        "Informal ε-δ limits and the limit laws.",
        "Continuity and the Intermediate Value Theorem.",
      ],
      references: [
        "Stewart, J. (2015). Calculus: Early Transcendentals (8th ed.). Cengage Learning.",
        "Kreyszig, E. (2011). Advanced Engineering Mathematics (10th ed.). Wiley.",
        "MIT OpenCourseWare 18.01 — Single Variable Calculus.",
      ],
    },
  },
  questions: [
    {
      lessonSlug: "calculus-differentiation",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the geometric interpretation of the derivative f′(x₀)?",
      explanation:
        "The derivative f′(x₀) equals the slope of the tangent line to y = f(x) at x = x₀; it is the limit of secant slopes as the second point approaches (x₀, f(x₀)).",
      whyCorrect:
        "f′(x₀) is the slope of the tangent line at x = x₀ — the instantaneous rate of change of f at that point.",
      whyOthersWrong: [
        "“Slope of the secant through (0,0)” describes the difference quotient before the limit is taken, not the derivative.",
        "“y-intercept of the curve” is f(0), a value of the function, not its rate of change.",
        "“Area under the curve from 0 to x₀” describes the definite integral, the inverse operation of the derivative.",
      ],
      options: [
        { text: "The slope of the tangent line at x = x₀", isCorrect: true },
        { text: "The slope of the secant through (0,0) and (x₀, f(x₀))", isCorrect: false },
        { text: "The y-intercept of the curve", isCorrect: false },
        { text: "The area under the curve from 0 to x₀", isCorrect: false },
      ],
    },
    {
      lessonSlug: "calculus-differentiation",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "Compute d/dx[sin(3x² − 1)] at x = 1.",
      explanation:
        "By the chain rule, f′(x) = cos(3x² − 1) · 6x. At x = 1, f′(1) = 6·cos(2). Since cos(2 rad) ≈ −0.4161, f′(1) ≈ 6·(−0.4161) ≈ −2.50.",
      whyCorrect:
        "6·cos(2) ≈ −2.50 — the chain rule gives f′(x) = cos(3x²−1)·6x, and at x = 1 that is 6·cos(2) ≈ −2.4966.",
      whyOthersWrong: [
        "−0.42 ≈ cos(2) alone — the inner derivative 6x was forgotten (chain rule applied incompletely).",
        "2.50 has the correct magnitude but the wrong sign (cos 2 rad is negative, not positive).",
        "6.00 treats cos(2) as if it were 1, ignoring the outer derivative entirely.",
      ],
      options: [
        { text: "−2.50", isCorrect: true },
        { text: "−0.42", isCorrect: false },
        { text: "2.50", isCorrect: false },
        { text: "6.00", isCorrect: false },
      ],
    },
    {
      lessonSlug: "calculus-differentiation",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "If f′(c) = 0 and f″(c) < 0, then f has a local minimum at x = c.",
      explanation:
        "The second-derivative test states that if f′(c) = 0 and f″(c) < 0, the function is concave down at c, which corresponds to a local MAXIMUM, not a minimum.",
      whyCorrect:
        "False — f″(c) < 0 means concave down, so the stationary point at c is a local maximum, not a local minimum.",
      whyOthersWrong: [
        "True is wrong because the stated conditions describe a local maximum (concave-down), the opposite of a minimum.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
    {
      lessonSlug: "calculus-differentiation",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem:
        "A 1-litre cylindrical can is to use the minimum amount of sheet metal. At the calculus optimum, the ratio h/(2r) (height to diameter) is approximately:",
      explanation:
        "Minimizing S(r) = 2π r² + 2000/r yields r = (500/π)^(1/3) ≈ 5.42 cm and h = 1000/(π r²) ≈ 10.84 cm, so h = 2r and the ratio h/(2r) = 1.",
      whyCorrect:
        "h/(2r) ≈ 1.00 — the calculus optimum gives h = 2r (height equals diameter), so the ratio is exactly 1.",
      whyOthersWrong: [
        "0.50 corresponds to h = r (a can as tall as its radius — too short and wide, more material).",
        "2.00 corresponds to h = 4r (a tall, thin can — also not optimal).",
        "1.50 corresponds to h = 3r — between the optimum and a tall can, not minimum material.",
      ],
      options: [
        { text: "1.00", isCorrect: true },
        { text: "0.50", isCorrect: false },
        { text: "2.00", isCorrect: false },
        { text: "1.50", isCorrect: false },
      ],
    },
    {
      lessonSlug: "calculus-differentiation",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which rule is used to differentiate a composition f(g(x))?",
      explanation:
        "The chain rule states d/dx[f(g(x))] = f′(g(x))·g′(x) and is the standard tool for composite functions.",
      whyCorrect:
        "Chain rule — it explicitly handles compositions: d/dx[f(g(x))] = f′(g(x))·g′(x).",
      whyOthersWrong: [
        "Product rule handles f·g, not f(g(x)).",
        "Quotient rule handles f/g, not composition.",
        "Power rule handles xⁿ alone, not nested functions.",
      ],
      options: [
        { text: "Chain rule", isCorrect: true },
        { text: "Product rule", isCorrect: false },
        { text: "Quotient rule", isCorrect: false },
        { text: "Power rule", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Linear Algebra
// ---------------------------------------------------------------------------

const LESSON_LINEAR_ALGEBRA: RefLesson = {
  slug: "linear-algebra",
  title: "Linear Algebra",
  titleAr: "الجبر الخطي",
  order: 2,
  durationMin: 20,
  references: [
    "Strang — Introduction to Linear Algebra (6th ed.)",
    "Kreyszig — Advanced Engineering Mathematics (10th ed.)",
    "MIT OpenCourseWare — Mathematics for Engineers (18.01 / 18.02 / 18.06)",
  ],
  conceptIntroduction: `A matrix \`A\` of size \`m×n\` maps vectors from \`ℝⁿ\` to \`ℝᵐ\` via \`y = A·x\`.
The determinant \`|A|\` is zero ⟺ \`A\` is singular (non-invertible).
Eigenvalues \`λ\` and eigenvectors \`v\` satisfy \`A·v = λ·v\`; the eigenvalues sum to the trace and multiply to the determinant.
Gaussian elimination solves \`A·x = b\` by reducing \`[A | b]\` to row-echelon form and back-substituting.`,
  example: `Solve \`2x + y − z = 5\`, \`x − 3y + 2z = −4\`, \`x + 2y + 3z = 11\` by Gaussian elimination.
Reduce \`[A|b]\` to row-echelon form ⇒ \`z = 5/4\`, \`y = 11/4\`, \`x = 7/4\`.
Verify: \`2(7/4) + 11/4 − 5/4 = 14/4 + 6/4 = 20/4 = 5 ✓\`.`,
  keyFormulas: `det([[a,b],[c,d]]) = ad − bc
A·B = Σ_k a_ik·b_kj
A⁻¹ = adj(A)/det(A)
A·v = λ·v ⇒ det(A − λI) = 0
Tr(A) = Σ λᵢ ,  det(A) = Π λᵢ`,
  exercise: `Compute the determinant and the inverse of \`[[2, 5], [1, 3]]\`. (det = 1; inverse = [[3, −5], [−1, 2]].)`,
  sections: {
    learning_objectives: `- Solve systems of linear equations using Gaussian elimination and matrix inverses.
- Compute determinants of 2×2 and 3×3 matrices and interpret singularity.
- Find eigenvalues and eigenvectors of a square matrix and explain their geometric meaning.
- Apply linear transformations to vectors and represent them as matrices.
- Use matrix methods in engineering applications (trusses, circuits, state estimation).`,
    prerequisites: `- High-school algebra: solving linear equations in 2–3 unknowns.
- Vectors in 2-D and 3-D (addition, scalar multiplication, dot product).
- Basic trigonometry.
- Comfort with summation notation \`Σ\`.`,
    introduction: `Linear algebra is the mathematics of linear relationships. Where calculus models smooth change, linear algebra models simultaneous linear constraints — the natural language of static equilibrium, circuit analysis, network flow, and linear regression.

The central object is the **matrix**, a rectangular array of coefficients. A single matrix equation \`A·x = b\` replaces an entire system of equations.

Engineering pay-off: nearly every numerical simulation (FEA, CFD, state estimation, signal processing, machine learning) reduces at its core to solving large linear systems \`A·x = b\`, often with thousands or millions of unknowns.`,
    terminology: `- **Matrix**: an \`m×n\` array \`A = [aᵢⱼ]\` with \`m\` rows and \`n\` columns.
- **Vector**: a \`1×n\` (row) or \`n×1\` (column) array; an element of the vector space \`ℝⁿ\`.
- **Square matrix**: \`m = n\`. **Identity \`I\`**: diagonal ones, zero elsewhere.
- **Determinant**: scalar \`|A|\` for a square matrix; \`|A| = 0\` ⟺ \`A\` is singular (non-invertible).
- **Inverse \`A⁻¹\`**: the matrix with \`A·A⁻¹ = A⁻¹·A = I\`; exists iff \`|A| ≠ 0\`.
- **Eigenvalues / eigenvectors**: scalars \`λ\` and non-zero vectors \`v\` satisfying \`A·v = λ·v\`.
- **Rank**: number of linearly independent rows/columns. **Null space**: \`{x : A·x = 0}\`.`,
    detailed_explanation: `A linear system of \`m\` equations in \`n\` unknowns is written compactly as \`A·x = b\`, where \`A\` is \`m×n\`, \`x\` is \`n×1\`, \`b\` is \`m×1\`. Solving means finding \`x\`.

**Gaussian elimination** transforms the augmented matrix \`[A | b]\` to row-echelon form using three operations: (i) row swap, (ii) scale a row by a non-zero constant, (iii) add a multiple of one row to another. **Back-substitution** then yields \`x\`. With partial pivoting (swap rows so the largest-magnitude pivot is used) the method is numerically stable.

For square \`A\` with \`|A| ≠ 0\`, \`x = A⁻¹·b\` is the unique solution. **Cramer's rule** gives each \`xᵢ = |Aᵢ|/|A|\` where \`Aᵢ\` replaces column \`i\` of \`A\` with \`b\` — elegant but \`O(n!)\`, never used numerically.

The **eigen-decomposition** \`A = V·Λ·V⁻¹\` reveals the geometry: \`A\` acts on each eigenvector \`vᵢ\` by simply scaling it by \`λᵢ\`. **Symmetric matrices** have real eigenvalues and orthogonal eigenvectors — the foundation of principal component analysis (PCA) and the spectral theorem.

A **linear transformation** is a function \`T: ℝⁿ → ℝᵐ\` preserving linear combinations: \`T(u + v) = T(u) + T(v)\` and \`T(c·u) = c·T(u)\`. Every linear transformation has a unique matrix representation in a chosen basis; composition of transformations ↔ matrix multiplication.`,
    core_principles: `- **Linearity**: \`T(u + v) = T(u) + T(v)\` and \`T(c·u) = c·T(u)\`.
- **Invertibility**: a square matrix is invertible iff its rows (and columns) are linearly independent iff \`|A| ≠ 0\`.
- **Spectral theorem**: real symmetric matrices are diagonalizable by an orthogonal matrix.
- **Rank–nullity**: \`rank(A) + nullity(A) = n\`.`,
    components: `- Vectors and vector spaces.
- Matrices: square, rectangular, diagonal, symmetric, identity.
- Determinant, inverse, rank, null space.
- Eigenvalues and eigenvectors.
- Linear transformations and their matrix representations.`,
    process: `1. Write the system as \`A·x = b\`.
2. Decide whether \`A\` is square and non-singular (compute \`|A|\`).
3. If yes, solve by Gaussian elimination (preferred numerically) or \`x = A⁻¹·b\` (conceptual).
4. For eigen-problems: form \`A − λI\` and solve \`det(A − λI) = 0\` for \`λ\`; for each \`λ\` solve \`(A − λI)·v = 0\` for \`v\`.
5. Verify by substituting back into the original equations.`,
    formula_calculation: `- **2×2 determinant**: \`|[[a,b],[c,d]]| = ad − bc\`.
- **3×3 determinant**: \`|[[a,b,c],[d,e,f],[g,h,i]]| = a(ei − fh) − b(di − fg) + c(dh − eg)\`.
- **Matrix product**: \`(AB)ᵢⱼ = Σ_k aᵢₖ·bₖⱼ\`.
- **2×2 inverse**: \`A⁻¹ = (1/|A|)·[[d, −b], [−c, a]]\` for \`A = [[a,b],[c,d]]\`.
- **Eigenvalue equation**: \`A·v = λ·v\` ⟺ \`det(A − λI) = 0\`.
- **Trace and determinant**: \`tr(A) = Σ λᵢ\` and \`|A| = Π λᵢ\`.`,
    worked_example: `**Problem.** A structural-analysis package produces the 3-equation system (joint forces in kN):

\`2x + y − z = 5\`   (Eq 1)
\`x − 3y + 2z = −4\` (Eq 2)
\`x + 2y + 3z = 11\` (Eq 3)

Solve by Gaussian elimination with partial pivoting.

**Step 1 — Augmented matrix \`[A | b]\`:**
\`\`\`
[ 2  1 −1 |  5]
[ 1 −3  2 | −4]
[ 1  2  3 | 11]
\`\`\`

**Step 2 — Pivot:** swap \`R1 ↔ R3\` to put a 1 in position (1,1):
\`\`\`
[ 1  2  3 | 11]
[ 1 −3  2 | −4]
[ 2  1 −1 |  5]
\`\`\`

**Step 3 — Eliminate below pivot:** \`R2 ← R2 − R1\`, \`R3 ← R3 − 2·R1\`:
\`\`\`
[ 1   2   3 |  11]
[ 0  −5  −1 | −15]
[ 0  −3  −7 | −17]
\`\`\`

**Step 4 — Pivot (2,2) = 1:** \`R2 ← R2/(−5)\`:
\`\`\`
[ 1   2    3 |  11]
[ 0   1  1/5 |   3]
[ 0  −3   −7 | −17]
\`\`\`

**Step 5 — Eliminate below:** \`R3 ← R3 + 3·R2\`:
\`\`\`
[ 1   2     3 |  11]
[ 0   1   1/5 |   3]
[ 0   0  −32/5|  −8]
\`\`\`

**Step 6 — Pivot (3,3) = 1:** \`R3 ← R3·(−5/32)\`:
\`\`\`
[ 1   2    3 |  11]
[ 0   1  1/5 |   3]
[ 0   0    1 | 5/4]
\`\`\`

**Step 7 — Back-substitution:**
- From \`R3\`: \`z = 5/4\`.
- From \`R2\`: \`y + (1/5)(5/4) = 3 ⇒ y = 3 − 1/4 = 11/4\`.
- From \`R1\`: \`x + 2(11/4) + 3(5/4) = 11 ⇒ x = 11 − 22/4 − 15/4 = 44/4 − 37/4 = 7/4\`.

**Result.** \`x = 7/4 = 1.75\`, \`y = 11/4 = 2.75\`, \`z = 5/4 = 1.25\`. Verify Eq 1: \`2(1.75) + 2.75 − 1.25 = 3.5 + 1.5 = 5 ✓\`.`,
    industrial_example: `**Construction — truss analysis.** The method of joints produces a linear system \`A·x = b\` where \`A\` encodes the truss geometry, \`x\` are member forces, and \`b\` are external loads. Each joint gives 2 equations (\`ΣFx = 0\`, \`ΣFy = 0\`); \`n\` joints yield a sparse, banded \`A\` that is solved once per load case.

**Power — state estimation.** The power-system state vector \`x\` (bus voltage magnitudes and angles) is recovered from noisy measurements \`z\` by solving the weighted least-squares normal equation \`Aᵀ R⁻¹ A · x = Aᵀ R⁻¹ z\`, derived entirely from linear-algebra normal equations.

**IT — PageRank.** Google's PageRank solves the stationary distribution of a Markov chain by finding the dominant eigenvector of the link matrix.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A small 3-bus power system has the per-unit admittance matrix
\`Y = [[3, −1, −1], [−1, 3, −1], [−1, −1, 3]]\`. The current injection is \`I = [4, 0, 0]ᵀ\` (per-unit). Find the bus voltages \`V\` solving \`Y·V = I\`.

**Eigenstructure (sanity check).** \`Y\` is symmetric and each row sums to \`1\`, so \`[1, 1, 1]ᵀ\` is an eigenvector with eigenvalue \`1\`. By symmetry the other two eigenvalues coincide; using \`tr(Y) = 9 = 1 + λ + λ\` they are both \`4\`. All eigenvalues are positive, so \`Y\` is positive-definite and the solution is unique.

**Direct solution by inspection.** Try \`V = [2, 1, 1]ᵀ\`:
- Row 1: \`3·2 − 1·1 − 1·1 = 6 − 1 − 1 = 4 ✓\`
- Row 2: \`−1·2 + 3·1 − 1·1 = −2 + 3 − 1 = 0 ✓\`
- Row 3: \`−1·2 − 1·1 + 3·1 = −2 − 1 + 3 = 0 ✓\`

**Result.** \`V = [2, 1, 1]ᵀ\` per-unit — bus 1 holds voltage 2.0 pu while the others sit at 1.0 pu under this injection. The eigenstructure (positive-definite) guarantees uniqueness.`,
    visual_explanation: `- **Vector arrows**: \`u + v\` tip-to-tail; scalar multiplication stretches/compresses.
- **Matrix as linear transformation**: unit square → parallelogram under \`A = [[2, 1], [1, 2]]\`; area scales by \`|det A| = 3\`.
- **Eigen-arrows**: \`A\` acts on its eigenvectors by pure stretching; non-eigenvectors get rotated/sheared.
- **s-plane sketch**: eigenvalues of a system matrix plotted — left half-plane = stable, right half-plane = unstable.`,
    simulation_opportunity: "NOT_APPLICABLE",
    common_mistakes: `- **Sign error in the determinant** expansion (cofactor signs alternate \`+, −, +\`).
- **Assuming \`A·B = B·A\`** — matrix multiplication is *not* commutative in general.
- **Using \`A⁻¹\` without checking \`|A| ≠ 0\`** — a singular matrix has no inverse.
- **Treating row-echelon form as the inverse**: Gaussian elimination gives the *solution* \`x\`, not \`A⁻¹\` (unless augmented with \`I\` and reduced to reduced row-echelon form).
- **Confusing eigenvalues with diagonal entries** — they coincide only for triangular matrices.
- **Solving normal equations \`AᵀA·x = Aᵀb\`** numerically squares the condition number; prefer QR factorization.`,
    limitations: `- Linear models assume linearity — many physical systems are nonlinear.
- Floating-point: Gaussian elimination without pivoting is numerically unstable for ill-conditioned matrices.
- Large systems require sparse iterative solvers (CG, GMRES); direct inversion is infeasible above ~10⁴ unknowns.`,
    comparison: `- **Direct vs. iterative solvers**: direct (Gaussian elimination, LU) gives exact answers in \`O(n³)\`; iterative (Jacobi, Gauss-Seidel, CG) approximates in \`O(k·n²)\` and wins for large sparse systems.
- **Matrix inversion vs. solving**: production numerical code never forms \`A⁻¹\` explicitly; it solves \`A·x = b\` by LU.
- **Eigenvalues vs. singular values**: eigenvalues are for square matrices; singular values (SVD) generalize to rectangular.`,
    practical_application: `- Truss analysis (Construction).
- Circuit nodal analysis (Electrical/Power).
- Least-squares regression (any engineering test data).
- Principal component analysis for dimensionality reduction (signal processing, ML).`,
    decision_scenario: `A structural engineer must analyze a truss with 12 joints and 26 members. They can either (a) solve the 24×24 linear system \`A·x = b\` by direct inversion, or (b) use sparse iterative CG. When is each preferred?

- **Direct inversion**: \`O(n³) = O(13,824)\` flops, memory \`O(n²) = 576\` numbers — trivially cheap here. Use direct.
- **Iterative CG**: preferred when \`n > 10⁴\` (FEA meshes), where \`O(n³)\` becomes prohibitive and the sparsity pattern lets CG converge in \`k ≪ n\` iterations.

**Decision rule**: choose based on size and sparsity — for small dense systems direct methods win; for large sparse systems iterative methods win.`,
    practice_questions: `- Compute the determinant and the inverse of \`[[2, 5], [1, 3]]\`. *(Answer: det = 1; inverse = [[3, −5], [−1, 2]].)*
- Solve by Gaussian elimination: \`x + 2y + z = 8\`, \`2x + y − z = 5\`, \`3x + y + 2z = 11\`. *(Answer: \`x = 2, y = 7/3, z = 4/3\`.)*
- Find the eigenvalues and eigenvectors of \`A = [[2, 1], [1, 2]]\`. *(Answer: λ = 3, 1; v₃ ∝ [1,1], v₁ ∝ [1,−1].)*
- Show that the columns of \`B = [[1,2,3],[4,5,6],[7,8,9]]\` are linearly dependent. *(Hint: \`|B| = 0\`.)*
- A 2×2 matrix has eigenvalues 3 and 5. What are its trace and determinant? *(Answer: tr = 8, det = 15.)*`,
    certification_questions: `The NCEES **FE exam** tests linear algebra in the Mathematics section: matrix operations, systems of linear equations, determinants, eigenvalues, and complex-vector operations.

Sample FE-style prompt: given \`A = [[4, 1], [2, 3]]\`, compute its eigenvalues and the trace. (Characteristic: \`(4−λ)(3−λ) − 2 = 0 ⇒ λ² − 7λ + 10 = 0 ⇒ λ = 2, 5\`. Trace = 7 = sum of eigenvalues.)

The questions in this lesson's question bank are aligned to these FE competencies.`,
    summary: `Linear algebra expresses simultaneous linear constraints compactly as \`A·x = b\`. **Gaussian elimination** solves any consistent system; square non-singular systems have a unique solution \`x = A⁻¹·b\`. **Eigenvalues** reveal how \`A\` scales its eigenvectors; symmetric matrices have real eigenvalues and orthogonal eigenvectors.`,
    key_takeaways: `- \`|A| = 0\` ⟺ \`A\` is singular ⟺ no unique solution to \`A·x = b\`.
- Matrix multiplication is non-commutative: \`A·B ≠ B·A\` in general.
- Eigenvalues of a symmetric matrix are real, sum to the trace, and multiply to the determinant.
- Production numerical code never forms \`A⁻¹\`; it solves \`A·x = b\` directly.`,
    references: `- Strang, G. (2023). *Introduction to Linear Algebra* (6th ed.). Wellesley-Cambridge Press. Chapters 1–3, 6.
- Kreyszig, E. (2011). *Advanced Engineering Mathematics* (10th ed.). Wiley. Chapters 7–8.
- MIT OpenCourseWare 18.06 — Linear Algebra (free course material).`,
  },
  knowledgeObject: {
    title: "Linear systems, matrices, and eigenvalues",
    domain: "Engineering Mathematics",
    competency:
      "Solve A·x = b by Gaussian elimination; compute determinants; find eigenvalues and eigenvectors.",
    topic: "Linear algebra",
    concept: "Matrix and eigenvalue",
    body: {
      definitions: [
        "Matrix: m×n array A = [aᵢⱼ] mapping ℝⁿ → ℝᵐ via y = A·x.",
        "Determinant: scalar |A| for a square matrix; |A| = 0 ⟺ singular.",
        "Inverse A⁻¹: matrix with A·A⁻¹ = A⁻¹·A = I; exists iff |A| ≠ 0.",
        "Eigenvalue/eigenvector: A·v = λ·v with v ≠ 0.",
        "Rank: number of linearly independent rows/columns.",
      ],
      principles: [
        "Linearity: T(u + v) = T(u) + T(v), T(c·u) = c·T(u).",
        "Invertibility ⟺ linearly independent rows/columns ⟺ |A| ≠ 0.",
        "Spectral theorem: real symmetric matrices are orthogonally diagonalizable with real eigenvalues.",
        "Rank–nullity: rank(A) + nullity(A) = n.",
      ],
      components: [
        "Vectors and vector spaces.",
        "Matrices (square, symmetric, diagonal, identity).",
        "Determinant, inverse, rank, null space.",
        "Eigenvalues and eigenvectors; eigendecomposition A = V·Λ·V⁻¹.",
        "Linear transformations and their matrix representations.",
      ],
      mechanism: [
        "Matrix-vector multiplication applies a linear transformation to a vector.",
        "Gaussian elimination reduces [A|b] to row-echelon form; back-substitution yields x.",
        "Eigendecomposition reveals pure scaling directions of A.",
      ],
      process: [
        "Write the system as A·x = b.",
        "Check |A|: if non-zero, unique solution exists.",
        "Solve by Gaussian elimination (preferred) or x = A⁻¹·b (conceptual).",
        "For eigen-problems: solve det(A − λI) = 0 for λ, then (A − λI)·v = 0 for v.",
        "Verify by substituting into the original equations.",
      ],
      formulas: [
        "2×2 determinant: |[[a,b],[c,d]]| = ad − bc.",
        "3×3 determinant: a(ei−fh) − b(di−fg) + c(dh−eg).",
        "Matrix product: (AB)ᵢⱼ = Σ_k aᵢₖ·bₖⱼ.",
        "2×2 inverse: A⁻¹ = (1/|A|)·[[d,−b],[−c,a]].",
        "Eigenvalue equation: det(A − λI) = 0.",
        "tr(A) = Σ λᵢ, |A| = Π λᵢ.",
      ],
      metrics: [
        "Condition number κ(A) = σ_max/σ_min (large ⇒ ill-conditioned).",
        "Rank, sparsity pattern, fill-in for sparse solvers.",
        "FLOPs: Gaussian elimination O(n³).",
      ],
      examples: [
        "3×3 truss system solved by Gaussian elimination: x = 7/4, y = 11/4, z = 5/4.",
        "Eigenvalues of [[4,1],[2,3]] are 5 and 2 (sum 7 = trace).",
      ],
      industrial_examples: [
        "Construction: truss analysis via the method of joints — a sparse linear system.",
        "Power: weighted least-squares state estimation solves normal equations.",
        "IT: PageRank is the dominant eigenvector of the link matrix.",
      ],
      case_studies: [
        "SYNTHETIC 3-bus power-flow: Y = [[3,−1,−1],[−1,3,−1],[−1,−1,3]], I = [4,0,0]ᵀ ⇒ V = [2,1,1]ᵀ pu. Eigenvalues of Y: 1 (vector [1,1,1]) and 4 (double).",
      ],
      common_errors: [
        "Assuming matrix multiplication is commutative.",
        "Attempting to invert a singular matrix without checking |A| ≠ 0.",
        "Conflating eigenvalues with diagonal entries (true only for triangular matrices).",
        "Solving normal equations AᵀA·x = Aᵀb squares the condition number.",
      ],
      limitations: [
        "Linear models assume linearity — most physical systems are at least mildly nonlinear.",
        "Gaussian elimination without pivoting is unstable for ill-conditioned matrices.",
        "Direct inversion is infeasible above ~10⁴ unknowns; sparse iterative solvers are required.",
      ],
      best_practices: [
        "Never form A⁻¹ explicitly — solve A·x = b by LU or QR.",
        "Always use partial pivoting in Gaussian elimination.",
        "Check conditioning before trusting a numerical solution.",
        "Exploit symmetry and sparsity; use specialized solvers (Cholesky, CG, GMRES).",
      ],
      related_concepts: [
        "Calculus (Jacobian as matrix of partial derivatives).",
        "Differential equations (eigenvalues of system matrix ⇒ stability).",
        "Probability (covariance matrix; PCA).",
        "Numerical analysis (LU, QR, SVD decompositions).",
      ],
      prerequisites: [
        "High-school algebra: solving 2–3 unknown linear systems.",
        "2-D and 3-D vectors (addition, dot product).",
        "Basic trigonometry and summation notation.",
      ],
      references: [
        "Strang, G. (2023). Introduction to Linear Algebra (6th ed.). Wellesley-Cambridge Press.",
        "Kreyszig, E. (2011). Advanced Engineering Mathematics (10th ed.). Wiley.",
        "MIT OpenCourseWare 18.06 — Linear Algebra.",
      ],
    },
  },
  questions: [
    {
      lessonSlug: "linear-algebra",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "A square matrix A is invertible if and only if:",
      explanation:
        "A square matrix is invertible exactly when its determinant is non-zero, which is equivalent to its rows (and columns) being linearly independent.",
      whyCorrect:
        "|A| ≠ 0 — the determinant is non-zero iff A is non-singular iff A⁻¹ exists.",
      whyOthersWrong: [
        "|A| = 0 is the opposite condition — it signals a singular (non-invertible) matrix.",
        "A being symmetric is unrelated to invertibility (a symmetric matrix can still be singular).",
        "All entries being non-zero is neither necessary nor sufficient: [[1,1],[1,1]] has all non-zero entries but |A| = 0.",
      ],
      options: [
        { text: "det(A) ≠ 0", isCorrect: true },
        { text: "det(A) = 0", isCorrect: false },
        { text: "A is symmetric", isCorrect: false },
        { text: "All entries of A are non-zero", isCorrect: false },
      ],
    },
    {
      lessonSlug: "linear-algebra",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "Compute det([[4, 1], [2, 3]]).",
      explanation:
        "For a 2×2 matrix [[a,b],[c,d]], det = ad − bc. Here det = 4·3 − 1·2 = 12 − 2 = 10.",
      whyCorrect: "4·3 − 1·2 = 12 − 2 = 10 — direct application of the 2×2 determinant formula.",
      whyOthersWrong: [
        "8 is the product 4·2 (a sign-flipped or wrong-term pairing).",
        "9 is the product of the diagonal-then-anti-diagonal mis-pairing (1·9 = 9 is fabricated).",
        "14 is the trace 4 + 3 + 2 + 1 = 10 mis-summed; trace is 4 + 3 = 7, not the determinant.",
      ],
      options: [
        { text: "10", isCorrect: true },
        { text: "8", isCorrect: false },
        { text: "9", isCorrect: false },
        { text: "14", isCorrect: false },
      ],
    },
    {
      lessonSlug: "linear-algebra",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "Find the eigenvalues of A = [[4, 1], [2, 3]].",
      explanation:
        "The characteristic equation is det(A − λI) = (4−λ)(3−λ) − 2·1 = λ² − 7λ + 10 = (λ−5)(λ−2) = 0. So λ = 5 and λ = 2. Check: trace 4 + 3 = 7 = 5 + 2 ✓.",
      whyCorrect:
        "λ = 5, 2 — solving (4−λ)(3−λ) − 2 = 0 gives λ² − 7λ + 10 = 0 ⇒ (λ−5)(λ−2) = 0.",
      whyOthersWrong: [
        "λ = 5, −2 has a sign error in one root.",
        "λ = 4, 3 just reads off the diagonal entries — this only works for triangular matrices, not general square matrices.",
        "λ = 7, 10 are the trace and determinant, not the eigenvalues themselves.",
      ],
      options: [
        { text: "λ = 5 and λ = 2", isCorrect: true },
        { text: "λ = 5 and λ = −2", isCorrect: false },
        { text: "λ = 4 and λ = 3", isCorrect: false },
        { text: "λ = 7 and λ = 10", isCorrect: false },
      ],
    },
    {
      lessonSlug: "linear-algebra",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "For any two square matrices A and B of the same size, A·B = B·A.",
      explanation:
        "Matrix multiplication is non-commutative in general. For example, [[0,1],[0,0]]·[[0,0],[1,0]] = [[1,0],[0,0]] but the reversed product is [[0,0],[0,1]].",
      whyCorrect:
        "False — matrix multiplication is non-commutative; A·B and B·A can differ in both value and dimensions.",
      whyOthersWrong: [
        "True is wrong because counterexamples (e.g. [[0,1],[0,0]] · [[0,0],[1,0]]) show A·B ≠ B·A in general.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
    {
      lessonSlug: "linear-algebra",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      stem: "The trace of an n×n matrix equals:",
      explanation:
        "From the characteristic polynomial λⁿ − tr(A)·λⁿ⁻¹ + … + (−1)ⁿ·det(A), the sum of the eigenvalues (with multiplicity) is the trace. For example, [[4,1],[2,3]] has trace 7 and eigenvalues 5, 2 (sum 7).",
      whyCorrect:
        "The sum of the eigenvalues — this identity comes from the characteristic polynomial: tr(A) = Σ λᵢ.",
      whyOthersWrong: [
        "The product of the eigenvalues equals the determinant, not the trace.",
        "The determinant is the product of eigenvalues, not the trace.",
        "The rank is the number of non-zero singular values, unrelated to the trace.",
      ],
      options: [
        { text: "The sum of its eigenvalues", isCorrect: true },
        { text: "The product of its eigenvalues", isCorrect: false },
        { text: "The determinant", isCorrect: false },
        { text: "The rank", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Differential Equations
// ---------------------------------------------------------------------------

const LESSON_DIFFERENTIAL_EQUATIONS: RefLesson = {
  slug: "differential-equations",
  title: "Differential Equations",
  titleAr: "المعادلات التفاضلية",
  order: 3,
  durationMin: 24,
  references: [
    "Boyce & DiPrima — Elementary Differential Equations and Boundary Value Problems (11th ed.)",
    "Kreyszig — Advanced Engineering Mathematics (10th ed.)",
    "MIT OpenCourseWare — Mathematics for Engineers (18.01 / 18.02 / 18.06)",
  ],
  conceptIntroduction: `First-order linear ODE: \`dy/dx + P(x)y = Q(x)\`, solved by the integrating factor \`μ = e^∫P dx\`.
Second-order linear constant-coefficient: \`ay″ + by′ + cy = 0\`; solve the characteristic equation \`ar² + br + c = 0\`.
Laplace transforms convert ODEs in \`t\` to algebraic equations in \`s\` and incorporate initial conditions automatically.`,
  example: `Solve \`y″ − 5y′ + 6y = 0\`.
Characteristic: \`r² − 5r + 6 = 0  ⇒  r = 2, 3\`.
\`y(x) = C₁·e²ˣ + C₂·e³ˣ\`.`,
  keyFormulas: `μ(x) = e^∫P dx
ar² + br + c = 0
L{f′} = sF − f(0)
L{f″} = s²F − sf(0) − f′(0)
τ = RC ,  ωₙ = √(k/m) ,  ζ = c/(2√(mk))`,
  exercise: `Solve \`y′ + 2y = eˣ\` using an integrating factor. (Answer: \`y = eˣ/3 + C·e⁻²ˣ\`.)`,
  sections: {
    learning_objectives: `- Classify ODEs by order, linearity, and homogeneity.
- Solve first-order linear ODEs using the integrating-factor method.
- Solve second-order linear constant-coefficient homogeneous ODEs via the characteristic equation.
- Apply the Laplace transform to convert initial-value problems into algebraic equations.
- Model simple engineering systems (RC circuit, spring-mass-damper, mixing tank) with ODEs.`,
    prerequisites: `- Single-variable differentiation and integration.
- Complex numbers (for oscillatory roots of the characteristic equation).
- Partial fractions (for inverse Laplace transforms).
- The chain rule and substitution in integration.`,
    introduction: `A differential equation relates an unknown function to its derivatives. It is the natural language of any system whose rate of change depends on its current state — essentially every engineered dynamic system.

**Classification**: order (highest derivative present), linearity (linear in \`y\` and its derivatives), homogeneity (zero or non-zero forcing term).

Engineering pay-off: an RC circuit, a spring-mass-damper, a tank being filled, a population, an epidemic, an economy — all are first modeled as ODEs.`,
    terminology: `- **Ordinary differential equation (ODE)**: derivatives with respect to one independent variable.
- **Partial differential equation (PDE)**: derivatives with respect to multiple variables (heat, wave).
- **Order**: highest derivative present.
- **Linear / homogeneous**: linear in \`y, y′, y″, …\` with no forcing (homogeneous) or with forcing (non-homogeneous).
- **Initial value problem (IVP)**: ODE + initial conditions.
- **Integrating factor** \`μ(x) = e^∫P dx\` for \`y′ + P(x)·y = Q(x)\`.
- **Characteristic equation**: \`ar² + br + c = 0\` for \`ay″ + by′ + cy = 0\`.
- **Laplace transform**: \`L{f(t)}(s) = ∫₀^∞ e^(−st)·f(t) dt\`.`,
    detailed_explanation: `**First-order linear ODE** \`y′ + P(x)·y = Q(x)\`. Multiply through by \`μ(x) = e^∫P dx\`. The product rule makes the left side \`d/dx[μ·y]\`: \`μ·y′ + μ·P·y = μ·Q ⇒ d/dx[μ·y] = μ·Q\`. Integrate both sides: \`μ·y = ∫μ·Q dx + C\`.

**Separable ODE** \`dy/dx = f(x)·g(y)\` separates as \`dy/g(y) = f(x)·dx\`; integrate both sides. Useful for population growth, radioactive decay, and unforced mixing problems.

**Second-order linear constant-coefficient homogeneous** \`ay″ + by′ + cy = 0\`. Substitute \`y = e^(rx)\` to obtain the characteristic equation \`ar² + br + c = 0\` with three cases:
- **Distinct real roots** \`r₁, r₂\`: \`y = C₁·e^(r₁x) + C₂·e^(r₂x)\`.
- **Repeated root** \`r\`: \`y = (C₁ + C₂·x)·e^(rx)\`.
- **Complex conjugate** \`α ± βi\`: \`y = e^(αx)·(C₁·cos βx + C₂·sin βx)\` (oscillation).

**Laplace transform**: \`L{y′} = sY(s) − y(0)\`, \`L{y″} = s²Y(s) − s·y(0) − y′(0)\`. Differentiation in \`t\` becomes multiplication by \`s\` in the Laplace domain; an IVP converts to an algebra equation in \`Y(s)\`, which is then inverse-transformed by partial fractions and a transform-pair table.

**Engineering applications**: RC circuit (\`Q′ + Q/(RC) = V_s/(RC)\`), spring-mass-damper (\`m·y″ + c·y′ + k·y = F(t)\`), mixing tank (\`V·y′ = inflow − outflow\`), thermal (\`C·dT/dt = (T_amb − T)/R + P_in\`).`,
    core_principles: `- **Linearity and superposition**: if \`y₁\` and \`y₂\` solve a linear homogeneous ODE, so does \`C₁·y₁ + C₂·y₂\`.
- **Initial conditions** fix the arbitrary constants and select a single solution.
- **Characteristic equation** reduces a differential equation to an algebraic equation.
- **Laplace transform** reduces an ODE IVP to an algebraic equation in \`s\`.`,
    components: `- Order, linearity, homogeneity classification.
- Integrating factor for first-order linear ODEs.
- Separation of variables for separable equations.
- Characteristic equation for second-order linear constant-coefficient ODEs.
- Laplace transform pairs and tables; partial fractions for inverse transforms.`,
    process: `1. **Classify** the ODE (order, linear?, homogeneous?).
2. **First-order linear**: compute \`μ = e^∫P dx\`, multiply, integrate.
3. **Separable**: separate variables, integrate both sides.
4. **Second-order linear constant-coefficient**: form the characteristic equation, solve for \`r\`, write the general solution, apply initial conditions.
5. **Laplace**: transform the ODE + ICs algebraically, solve for \`Y(s)\`, partial-fraction, inverse-transform.`,
    formula_calculation: `- **Integrating factor**: \`μ(x) = e^∫P(x) dx\`.
- **First-order linear solution**: \`y(x) = (1/μ(x))·[∫μ(x)·Q(x) dx + C]\`.
- **Characteristic equation**: \`ar² + br + c = 0 ⇒ r = (−b ± √(b² − 4ac))/(2a)\`.
- **Laplace pairs**: \`L{1} = 1/s\`; \`L{e^(−at)} = 1/(s+a)\`; \`L{sin(ωt)} = ω/(s²+ω²)\`; \`L{cos(ωt)} = s/(s²+ω²)\`.
- **Derivative rules**: \`L{y′} = sY − y(0)\`; \`L{y″} = s²Y − s·y(0) − y′(0)\`.
- **Time constants**: \`τ = RC\` (first-order); \`ωₙ = √(k/m)\` and \`ζ = c/(2√(mk))\` (second-order).`,
    worked_example: `**Problem.** An RC circuit (\`R = 1 kΩ\`, \`C = 100 μF\`) is connected to a 5 V DC source at \`t = 0\`. The capacitor is initially uncharged. Find the capacitor voltage \`v(t)\`.

**Step 1 — Model.** KVL gives \`R·C·dv/dt + v = V_s\`, with \`V_s = 5\` V.
**Step 2 — Substitute values.** \`R = 1000\` Ω, \`C = 100·10⁻⁶\` F = \`10⁻⁴\` F. \`R·C = 1000 × 10⁻⁴ = 0.1\` s.
  Equation: \`0.1·dv/dt + v = 5\`, with \`v(0) = 0\`.
**Step 3 — Standard form.** \`dv/dt + 10·v = 50\` (divide by 0.1).
**Step 4 — Integrating factor.** \`μ = e^∫10 dt = e^(10t)\`.
**Step 5 — Multiply.** \`e^(10t)·dv/dt + 10·e^(10t)·v = 50·e^(10t)\`, i.e. \`d/dt[e^(10t)·v] = 50·e^(10t)\`.
**Step 6 — Integrate.** \`e^(10t)·v = 5·e^(10t) + C\`.
**Step 7 — Solve for \`v\`.** \`v(t) = 5 + C·e^(−10t)\`.
**Step 8 — Apply IC \`v(0) = 0\`.** \`0 = 5 + C ⇒ C = −5\`.
**Step 9 — Final solution.** \`v(t) = 5·(1 − e^(−10t))\` V.
**Step 10 — Time constant.** \`τ = R·C = 0.1\` s; \`v\` reaches 63.2% of 5 V (≈ 3.16 V) at \`t = 0.1\` s and 99% of 5 V (≈ 4.95 V) at \`t = 5τ = 0.5\` s.

**Result.** \`v(t) = 5·(1 − e^(−10t))\` V, with \`τ = R·C = 0.1\` s.`,
    industrial_example: `**Power & Utilities — RC snubber circuits** protect power-electronic switches (IGBTs, SCRs) by limiting \`dV/dt\` during switching transients; the charging dynamics are governed by an RC ODE.

**Manufacturing — first-order thermal model of a furnace**: \`C·dT/dt = (T_amb − T)/R + P_in\`, where \`R\` is the thermal resistance (K/W) and \`C\` is the heat capacity (J/K). The time constant \`τ = R·C\` sets the warm-up time.

**Construction — vibrating footbridges** are modeled as second-order spring-mass-damper systems; the characteristic equation classifies the response as overdamped, critically damped, or oscillatory (underdamped).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A 1000-kg elevator cab is supported by a spring (\`k = 40\` kN/m) and a damper (\`c\`). The engineer wants the system to be critically damped so the cab returns to equilibrium without overshoot after a 1 m step displacement.

**Model.** \`m·y″ + c·y′ + k·y = 0\` with \`m = 1000\` kg, \`k = 40 000\` N/m.
**Characteristic equation.** \`m·r² + c·r + k = 0 ⇒ r = (−c ± √(c² − 4·m·k))/(2m)\`.
**Critical damping condition.** \`c² = 4·m·k\` ⇒ \`c = 2·√(m·k) = 2·√(1000·40000) = 2·6324.6 ≈ 12 649\` N·s/m ≈ \`12.6\` kN·s/m.
**Result.** With \`c = 12.6\` kN·s/m the roots coincide: \`r = −c/(2m) = −6.32\` s⁻¹. The response \`y(t) = (C₁ + C₂·t)·e^(−6.32 t)\` returns to zero without oscillation — the fastest non-oscillatory return, exactly the design goal for a measuring instrument or elevator cab.`,
    visual_explanation: `- **Time-domain plot**: exponential growth/decay vs. oscillatory (underdamped) response — illustrating the three characteristic-equation cases.
- **s-plane**: roots of the characteristic equation plotted; left half-plane = stable (decays), imaginary axis = oscillation, right half-plane = unstable (grows).
- **Laplace as a "domain swap"**: t-domain ODE ↔ s-domain algebra; initial conditions enter naturally as the \`−y(0)\` and \`−y′(0)\` terms in the derivative rule.`,
    simulation_opportunity: "NOT_APPLICABLE",
    common_mistakes: `- **Forgetting initial conditions**, leaving arbitrary constants in the "final" answer.
- **Mis-classifying**: treating a nonlinear ODE with linear methods.
- **Sign errors** in the integrating factor or characteristic equation.
- **Wrong Laplace transform pair**; forgetting the \`y(0)\` and \`y′(0)\` terms in \`L{y′}\` and \`L{y″}\`.
- **Confusing homogeneous and particular solutions** for non-homogeneous ODEs.
- **Mixing units** (e.g. kN vs N, ms vs s, kg vs g).`,
    limitations: `- Linear constant-coefficient ODEs cover many but not all systems; nonlinear PDEs (Navier-Stokes) require numerical methods.
- Closed-form solutions exist only for special classes; arbitrary forcing functions need convolution or numerical integration.
- Laplace transforms assume the system is LTI (linear time-invariant) and that the input is causal (zero for \`t < 0\`).`,
    comparison: `- **Time-domain vs. Laplace-domain**: the time domain shows the actual response; the Laplace domain reveals poles/zeros and stability in one diagram.
- **First-order vs. second-order**: first-order systems track inputs with one time constant; second-order systems add a natural frequency and damping ratio, enabling oscillation/overshoot.
- **Analytical vs. numerical**: closed-form solutions give insight; Runge-Kutta gives arbitrary accuracy on arbitrary nonlinear ODEs but no insight.`,
    practical_application: `- RC/RL circuit step response (Electrical).
- Spring-mass-damper (Mechanical, vibration isolation).
- Mixing tanks (Chemical).
- Population and disease models (compartmental SIR).`,
    decision_scenario: `A structural engineer designing a 10-kg accelerometer must choose damping for the seismic mass (\`m = 10\` g, \`k = 200\` N/m). The customer requires the device to settle to within 2% of steady state in less than 0.5 s after a step input. Three damping values are proposed:

- (a) \`c = 0.5\` N·s/m (underdamped — oscillatory).
- (b) \`c = 2.83\` N·s/m (critically damped; \`c = 2·√(m·k) = 2·√(0.01·200) = 2·√2 ≈ 2.83\`).
- (c) \`c = 10\` N·s/m (overdamped — slow).

**Decision**: choose (b) critical damping — it returns to steady state in minimum time without overshoot, the standard choice for measuring instruments. The 2% settling time of a critically damped second-order system is approximately \`t_s ≈ 5/(ζ·ωₙ)\` with \`ωₙ = √(k/m) = √(200/0.01) = √20 000 = 141\` rad/s and \`ζ = 1\`; thus \`t_s ≈ 5/141 ≈ 0.035\` s, well under the 0.5 s requirement.`,
    practice_questions: `- Solve \`y′ + 2y = eˣ\` using an integrating factor. *(Answer: \`y = eˣ/3 + C·e⁻²ˣ\`.)*
- Find the general solution of \`y″ + 4y′ + 4y = 0\`. *(Answer: \`r² + 4r + 4 = 0 ⇒ (r+2)² = 0 ⇒ y = (C₁ + C₂·x)·e⁻²ˣ\`.)*
- Solve \`y″ + y = 0\` with \`y(0) = 0\`, \`y′(0) = 1\`. *(Answer: \`y = sin x\`.)*
- Use the Laplace transform to solve \`y′ + y = 1\` with \`y(0) = 0\`. *(Answer: \`y = 1 − e⁻ᵗ\`.)*
- A 2-kg mass on a spring (\`k = 50\` N/m) with damping \`c = 10\` N·s/m is displaced and released. Classify the response. *(Answer: \`ωₙ = 5\`, \`ζ = 10/(2·√100) = 0.5\` ⇒ underdamped, oscillates with decay.)*`,
    certification_questions: `The NCEES **FE exam** Mathematics section tests first-order ODEs (separable, integrating factor), second-order linear constant-coefficient homogeneous ODEs (characteristic equation), and the Laplace transform.

Sample FE-style prompt: solve \`y″ − 5y′ + 6y = 0\`. (Characteristic \`r² − 5r + 6 = 0 ⇒ r = 2, 3\` ⇒ \`y = C₁·e²ˣ + C₂·e³ˣ\`.)

The questions in this lesson's question bank are aligned to these FE competencies.`,
    summary: `**Classify** (order, linear, homogeneous) before choosing a method. **First-order linear**: multiply by integrating factor and integrate. **Second-order constant-coefficient**: the characteristic equation's roots fix the form. **Laplace transforms** convert IVPs to algebra; poles in the left half-plane ⇒ stable response.`,
    key_takeaways: `- \`μ = e^∫P dx\` is the integrating factor for \`y′ + P(x)·y = Q(x)\`.
- Characteristic-equation roots: distinct real ⇒ two exponentials; repeated ⇒ exponential × linear; complex ⇒ exponential × sinusoid.
- \`L{y′} = sY − y(0)\`; \`L{y″} = s²Y − s·y(0) − y′(0)\`.
- Stability ⟺ all characteristic roots have negative real parts.`,
    references: `- Boyce, W. E. & DiPrima, R. C. (2017). *Elementary Differential Equations and Boundary Value Problems* (11th ed.). Wiley. Chapters 1–2, 3, 6.
- Kreyszig, E. (2011). *Advanced Engineering Mathematics* (10th ed.). Wiley. Chapters 1–2, 6.
- MIT OpenCourseWare 18.03 — Differential Equations (free course material).`,
  },
  knowledgeObject: {
    title: "First- and second-order ODEs and the Laplace transform",
    domain: "Engineering Mathematics",
    competency:
      "Classify, solve first- and second-order linear ODEs, and apply the Laplace transform to IVPs.",
    topic: "Ordinary differential equations",
    concept: "ODE IVP",
    body: {
      definitions: [
        "ODE: equation relating an unknown function and its derivatives with respect to one variable.",
        "Order: highest derivative present.",
        "Linear/homogeneous: linear in y, y′, y″, … with zero (homogeneous) or non-zero (forced) RHS.",
        "IVP: ODE + initial conditions.",
        "Integrating factor μ = e^∫P dx for y′ + P·y = Q.",
        "Laplace transform: L{f}(s) = ∫₀^∞ e^(−st)·f(t) dt.",
      ],
      principles: [
        "Superposition: for linear homogeneous ODEs, C₁·y₁ + C₂·y₂ is also a solution.",
        "Initial conditions select one solution out of the general family.",
        "Characteristic equation reduces a linear constant-coefficient ODE to an algebra problem.",
        "Laplace transforms map differentiation in t to multiplication by s in the s-domain.",
      ],
      components: [
        "ODE classification (order, linear, homogeneous).",
        "Integrating factor method for first-order linear.",
        "Separation of variables for separable ODEs.",
        "Characteristic equation for second-order linear constant-coefficient.",
        "Laplace transform pairs and tables; partial-fraction inversion.",
      ],
      mechanism: [
        "For first-order linear: μ·(y′ + P·y) = d/dt[μ·y] turns the LHS into an exact derivative.",
        "For second-order linear constant-coefficient: substitute y = e^(rx) to obtain the characteristic polynomial.",
        "Laplace transforms algebraically incorporate initial conditions via the derivative rule.",
      ],
      process: [
        "Classify the ODE.",
        "First-order linear: compute μ, multiply, integrate, apply IC.",
        "Separable: separate variables, integrate both sides, apply IC.",
        "Second-order linear constant-coefficient: form char. eqn, find roots, write general solution, apply ICs.",
        "Laplace: transform ODE + ICs, solve for Y(s), partial-fraction, inverse-transform.",
      ],
      formulas: [
        "μ(x) = e^∫P(x) dx.",
        "First-order linear solution: y = (1/μ)·(∫μ·Q dx + C).",
        "Characteristic: ar² + br + c = 0 ⇒ r = (−b ± √(b² − 4ac))/(2a).",
        "L{y′} = sY − y(0); L{y″} = s²Y − s·y(0) − y′(0).",
        "Laplace pairs: L{1}=1/s, L{e^(−at)}=1/(s+a), L{sin ωt}=ω/(s²+ω²), L{cos ωt}=s/(s²+ω²).",
        "τ = RC; ωₙ = √(k/m); ζ = c/(2√(mk)).",
      ],
      metrics: [
        "Time constant τ = RC for first-order circuits.",
        "Natural frequency ωₙ = √(k/m) rad/s for second-order systems.",
        "Damping ratio ζ = c/(2√(mk)) — ζ < 1 underdamped, ζ = 1 critical, ζ > 1 overdamped.",
        "Settling time (2%): t_s ≈ 4/(ζ·ωₙ) for underdamped second-order systems.",
      ],
      examples: [
        "RC charging: v(t) = 5·(1 − e^(−10t)) V with τ = 0.1 s.",
        "y″ − 5y′ + 6y = 0 ⇒ y = C₁·e²ˣ + C₂·e³ˣ.",
      ],
      industrial_examples: [
        "Power: RC snubber circuits limit dV/dt across power-electronic switches.",
        "Manufacturing: first-order furnace thermal model with τ = R·C.",
        "Construction: footbridge vibration modeled as a second-order system; char. eqn classifies the response.",
      ],
      case_studies: [
        "SYNTHETIC 1000-kg elevator cab critically damped with c = 2·√(mk) ≈ 12.6 kN·s/m, root r = −6.32 s⁻¹.",
      ],
      common_errors: [
        "Forgetting to apply initial conditions, leaving arbitrary constants in the final answer.",
        "Mis-classifying a nonlinear ODE as linear.",
        "Sign errors in the integrating factor or characteristic equation.",
        "Using the wrong Laplace transform pair or omitting y(0), y′(0) in the derivative rule.",
        "Mixing units (kN vs N, ms vs s).",
      ],
      limitations: [
        "Linear constant-coefficient ODEs cover many but not all systems.",
        "Closed-form solutions exist only for special forcing functions.",
        "Laplace transforms apply only to LTI, causal systems.",
      ],
      best_practices: [
        "Classify before solving.",
        "Apply initial conditions as soon as the general solution is found.",
        "Sanity-check stability from the characteristic roots (Re(r) < 0 ⇒ stable).",
        "Verify the final answer by substituting into the original ODE.",
      ],
      related_concepts: [
        "Linear algebra (eigenvalues of the system matrix ⇒ stability).",
        "Laplace vs. Fourier transforms (steady-state vs. transient).",
        "Numerical methods (Euler, Runge-Kutta) for nonlinear ODEs.",
      ],
      prerequisites: [
        "Single-variable differentiation and integration.",
        "Complex numbers (for oscillatory characteristic roots).",
        "Partial fractions (for inverse Laplace).",
      ],
      references: [
        "Boyce, W. E. & DiPrima, R. C. (2017). Elementary Differential Equations and Boundary Value Problems (11th ed.). Wiley.",
        "Kreyszig, E. (2011). Advanced Engineering Mathematics (10th ed.). Wiley.",
        "MIT OpenCourseWare 18.03 — Differential Equations.",
      ],
    },
  },
  questions: [
    {
      lessonSlug: "differential-equations",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "The integrating factor for y′ + P(x)·y = Q(x) is:",
      explanation:
        "Multiplying through by μ(x) = e^∫P dx makes the left-hand side the derivative of μ·y: d/dx[μ·y] = μ·Q, which can then be integrated directly.",
      whyCorrect:
        "μ = e^∫P dx — this factor makes the left side an exact derivative (d/dx[μ·y] = μ·Q).",
      whyOthersWrong: [
        "μ = e^P forgets the integration in the exponent.",
        "μ = ∫P dx is the antiderivative itself, not its exponential.",
        "μ = ln P is dimensionally wrong and doesn't yield the exact-derivative property.",
      ],
      options: [
        { text: "μ = e^(∫P dx)", isCorrect: true },
        { text: "μ = e^P", isCorrect: false },
        { text: "μ = ∫P dx", isCorrect: false },
        { text: "μ = ln P", isCorrect: false },
      ],
    },
    {
      lessonSlug: "differential-equations",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "The general solution of y″ − 5y′ + 6y = 0 is:",
      explanation:
        "The characteristic equation r² − 5r + 6 = (r − 2)(r − 3) = 0 has distinct real roots r = 2, 3, giving the general solution y = C₁·e²ˣ + C₂·e³ˣ.",
      whyCorrect:
        "y = C₁·e²ˣ + C₂·e³ˣ — the characteristic equation (r−2)(r−3) = 0 yields distinct real roots 2 and 3.",
      whyOthersWrong: [
        "y = C₁·e²ˣ + C₂·e⁻³ˣ has the wrong sign on the second root (the characteristic root is +3, not −3).",
        "y = (C₁ + C₂·x)·e²ˣ is the repeated-root form, which would apply only if the discriminant were 0 (it isn't).",
        "y = C₁·cos 2x + C₂·sin 2x is the complex-roots form, but the roots here are real (discriminant 25 − 24 = 1 > 0).",
      ],
      options: [
        { text: "y = C₁·e²ˣ + C₂·e³ˣ", isCorrect: true },
        { text: "y = C₁·e²ˣ + C₂·e⁻³ˣ", isCorrect: false },
        { text: "y = (C₁ + C₂·x)·e²ˣ", isCorrect: false },
        { text: "y = C₁·cos(2x) + C₂·sin(2x)", isCorrect: false },
      ],
    },
    {
      lessonSlug: "differential-equations",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem:
        "If all roots of the characteristic equation have negative real parts, the homogeneous ODE's response is stable.",
      explanation:
        "Each root r contributes a term e^(rt); if Re(r) < 0, every term decays to zero as t → ∞, so the response is asymptotically stable. This is the basis of linear-system stability theory.",
      whyCorrect:
        "True — solutions are linear combinations of e^(rt); Re(r) < 0 ⇒ each term decays, so y(t) → 0 as t → ∞, which is the definition of asymptotic stability.",
      whyOthersWrong: [
        "False is wrong because the stability criterion for linear ODEs is precisely that all characteristic roots lie in the open left half of the complex plane.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
    {
      lessonSlug: "differential-equations",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem:
        "An RC circuit (R = 1 kΩ, C = 100 μF) is stepped from 0 V to 5 V at t = 0. What is the time constant τ?",
      explanation:
        "The first-order time constant of an RC circuit is τ = R·C = 1000 Ω × 100 × 10⁻⁶ F = 1000 × 10⁻⁴ s = 0.1 s.",
      whyCorrect:
        "0.1 s — τ = R·C = 1000 × 100 × 10⁻⁶ = 0.1 s.",
      whyOthersWrong: [
        "0.01 s is off by a factor of 10 (likely a unit slip: 1000 × 100 × 10⁻⁶ = 0.1, not 0.01).",
        "1 s forgets to convert μF to F (would give 1000 × 100 = 100,000).",
        "10 s treats C as 10 mF (or R as 100 kΩ), mis-converting units.",
      ],
      options: [
        { text: "0.1 s", isCorrect: true },
        { text: "0.01 s", isCorrect: false },
        { text: "1 s", isCorrect: false },
        { text: "10 s", isCorrect: false },
      ],
    },
    {
      lessonSlug: "differential-equations",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "In Laplace-transform notation, L{y′} equals:",
      explanation:
        "By integration by parts, L{y′} = s·Y(s) − y(0), where Y(s) = L{y}. The initial condition y(0) appears automatically — this is the key advantage of the Laplace method for IVPs.",
      whyCorrect:
        "s·Y(s) − y(0) — the derivative rule, with the initial condition entering automatically.",
      whyOthersWrong: [
        "s²·Y(s) − y(0) is the rule for L{y″} with y′(0) = 0 — wrong derivative order.",
        "Y(s)/s is the rule for the integral of y, not its derivative.",
        "s·Y(s) omits the −y(0) initial-condition term, which is essential for IVPs.",
      ],
      options: [
        { text: "s·Y(s) − y(0)", isCorrect: true },
        { text: "s²·Y(s) − y(0)", isCorrect: false },
        { text: "Y(s)/s", isCorrect: false },
        { text: "s·Y(s)", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Probability & Statistics
// ---------------------------------------------------------------------------

const LESSON_PROBABILITY_STATISTICS: RefLesson = {
  slug: "probability-statistics",
  title: "Probability & Statistics",
  titleAr: "الاحتمالات والإحصاء",
  order: 4,
  durationMin: 22,
  references: [
    "Walpole, Myers, Myers & Ye — Probability & Statistics for Engineers & Scientists (9th ed.)",
    "Kreyszig — Advanced Engineering Mathematics (10th ed.)",
    "MIT OpenCourseWare — Mathematics for Engineers (18.01 / 18.02 / 18.06)",
  ],
  conceptIntroduction: `Probability axioms: \`0 ≤ P(A) ≤ 1\`, \`P(S) = 1\`, and \`P(A ∪ B) = P(A) + P(B) − P(A ∩ B)\`.
Conditional probability: \`P(A | B) = P(A ∩ B)/P(B)\`. Bayes' theorem: \`P(A | B) = P(B | A)·P(A)/P(B)\`.
The normal distribution \`N(μ, σ²)\` has PDF \`f(x) = (1/(σ·√(2π)))·e^(−(x−μ)²/(2σ²))\`.
The 95% confidence interval for a population mean (known σ) is \`x̄ ± 1.96·σ/√n\`.`,
  example: `Two fair dice are rolled. P(sum = 7)?
Favorable pairs: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6.
P = 6/36 = 1/6.`,
  keyFormulas: `P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
P(A | B) = P(A ∩ B)/P(B)
E[X] = Σ x·P(x)
Var(X) = E[X²] − (E[X])²
95% CI for μ: x̄ ± 1.96·σ/√n`,
  exercise: `If \`X ~ N(0, 1)\`, compute \`P(X > 1.96)\` using the standard normal table. (Answer: ≈ 0.025.)`,
  sections: {
    learning_objectives: `- State the probability axioms and apply them to compute event probabilities.
- Use conditional probability and Bayes' theorem for inference.
- Compute expectation, variance, and standard deviation for common distributions.
- Apply the normal distribution and the Central Limit Theorem to engineering inference.
- Construct and interpret a confidence interval for a population mean.`,
    prerequisites: `- Combinatorics (permutations, combinations).
- Single-variable calculus (for continuous densities).
- Summation and integral notation.
- Basic algebra and the properties of exponents and logarithms.`,
    introduction: `Probability quantifies uncertainty; statistics reasons from data about uncertain quantities. Engineers need both to design experiments, monitor processes, and make decisions under noise.

Probability provides the **forward** model: given a process, what data are expected? Statistics is the **inverse**: given observed data, what can we say about the process?

Engineering pay-off: quality control (Six Sigma), reliability engineering (MTBF), signal detection (radar/sonar), and A/B testing all rest on probability-statistics foundations.`,
    terminology: `- **Sample space** \`S\`; **event** \`A ⊆ S\`; **probability** \`P(A) ∈ [0, 1]\`.
- **Conditional probability** \`P(A | B) = P(A ∩ B)/P(B)\`.
- **Independent events**: \`P(A ∩ B) = P(A)·P(B)\`.
- **Random variable (RV)**: a function \`X: S → ℝ\`; discrete (PMF) or continuous (PDF).
- **Expectation** \`E[X] = Σ x·P(x)\` (discrete) or \`∫ x·f(x) dx\` (continuous).
- **Variance** \`Var(X) = E[(X − μ)²] = E[X²] − (E[X])²\`.
- **Normal distribution** \`N(μ, σ²)\`: PDF \`f(x) = (1/(σ·√(2π)))·e^(−(x−μ)²/(2σ²))\`.
- **Central Limit Theorem (CLT)**: sample mean of \`n\` i.i.d. RVs approaches \`N(μ, σ²/n)\` as \`n\` grows.
- **Confidence interval (CI)**: an interval constructed from data that contains the true parameter with a stated probability (e.g. 95%).`,
    detailed_explanation: `**Probability axioms (Kolmogorov)**: (i) \`0 ≤ P(A) ≤ 1\`; (ii) \`P(S) = 1\`; (iii) for disjoint \`Aᵢ\`, \`P(∪ Aᵢ) = Σ P(Aᵢ)\`. From these, \`P(A ∪ B) = P(A) + P(B) − P(A ∩ B)\` and \`P(Aᶜ) = 1 − P(A)\`.

**Conditional probability**: \`P(A | B) = P(A ∩ B)/P(B)\`. **Bayes' theorem** inverts conditioning: \`P(A | B) = P(B | A)·P(A)/P(B)\` — the workhorse of inference (medical testing, fault diagnosis, spam filtering).

**Independence**: \`A ⊥ B\` iff \`P(A ∩ B) = P(A)·P(B)\`. Independence is strong — mutually exclusive events (\`P(A ∩ B) = 0\`) are not independent unless one has probability zero.

**Discrete RVs**: binomial \`B(n, p)\` models successes in \`n\` Bernoulli trials; Poisson(\`λ\`) models rare events in time/space with rate \`λ\`.

**Continuous RVs**: normal \`N(μ, σ²)\` for sums/averages (CLT); exponential(\`λ\`) for waiting times; uniform on \`[a, b]\`.

**Expectation and variance** are linear in scaling: \`E[a·X + b] = a·E[X] + b\`; \`Var(a·X + b) = a²·Var(X)\`. The variance of a sum of independent RVs equals the sum of variances.

**CLT**: for i.i.d. \`Xᵢ\` with mean \`μ\` and variance \`σ²\`, the sample mean \`x̄ₙ ≈ N(μ, σ²/n)\` for large \`n\`. This justifies the 95% rule \`x̄ ± 1.96·σ/√n\` for the population mean.

**Confidence interval for the mean (known σ)**: \`x̄ ± z_{α/2}·σ/√n\`. For 95% confidence, \`z_{0.025} = 1.96\`.`,
    core_principles: `- Probability is additive over disjoint events; inclusion-exclusion handles overlapping events.
- **Bayes' theorem**: inference is the inversion of conditional probability; prior × likelihood / evidence = posterior.
- **Independence** factorizes joint probabilities.
- **CLT**: averaging any i.i.d. process produces a normal distribution in the limit.`,
    components: `- Axioms, conditional probability, independence.
- Discrete RVs (binomial, Poisson); continuous RVs (normal, exponential, uniform).
- Expectation, variance, standard deviation.
- Sampling distribution of the mean; CLT.
- Confidence intervals; \`z\` and \`t\` distributions.`,
    process: `1. Identify the random experiment, sample space, and events of interest.
2. Choose a probability model (uniform, binomial, Poisson, normal, etc.).
3. Compute the probability or expectation using axioms, Bayes, or distribution formulas.
4. For inference: summarize data with \`x̄\`, \`s\`; check CLT assumptions; construct a CI at the desired confidence level.`,
    formula_calculation: `- **Addition rule**: \`P(A ∪ B) = P(A) + P(B) − P(A ∩ B)\`.
- **Conditional**: \`P(A | B) = P(A ∩ B)/P(B)\`.
- **Bayes**: \`P(A | B) = P(B | A)·P(A)/P(B)\`.
- **Expectation**: \`E[X] = Σ x·p(x)\` (discrete), \`∫ x·f(x) dx\` (continuous).
- **Variance**: \`Var(X) = E[X²] − (E[X])²\`.
- **Normal PDF**: \`f(x) = (1/(σ·√(2π)))·e^(−(x−μ)²/(2σ²))\`.
- **Standardize**: \`Z = (X − μ)/σ\`.
- **95% CI for μ (known σ)**: \`x̄ ± 1.96·σ/√n\`.`,
    worked_example: `**Problem.** A production line fills 500-mL bottles. A quality engineer samples \`n = 25\` bottles and finds a sample mean \`x̄ = 498.2\` mL with a process standard deviation \`σ = 4.0\` mL (known from long-run data). Construct a 95% CI for the population mean fill volume.

**Step 1 — Choose level.** A 95% CI uses \`z_{0.025} = 1.96\`.
**Step 2 — Standard error.** \`SE = σ/√n = 4.0/√25 = 4.0/5 = 0.8\` mL.
**Step 3 — Margin of error.** \`ME = 1.96·SE = 1.96 × 0.8 = 1.568\` mL.
**Step 4 — Confidence interval.** \`(x̄ − ME, x̄ + ME) = (498.2 − 1.568, 498.2 + 1.568) = (496.63, 499.77)\` mL.
**Step 5 — Interpretation.** We are 95% confident that the true mean fill volume lies between 496.6 mL and 499.8 mL. Since the upper bound (499.8 mL) is below the 500 mL label, the line is systematically underfilling and should be adjusted upward.

**Result.** 95% CI for μ ≈ (496.6 mL, 499.8 mL) — the process is underfilling relative to the 500 mL label.`,
    industrial_example: `**Manufacturing — Statistical Process Control (SPC).** X̄-R charts monitor a process mean; the control limits are \`x̄ ± 3·σ/√n\`, a direct application of the normal distribution and CLT. A point outside the limits is a statistical signal that the process has shifted.

**Container Terminal — Poisson arrivals.** Ship arrivals at a terminal are commonly modeled as Poisson with rate \`λ\`; the expected number of arrivals in \`t\` hours is \`λ·t\`, and the inter-arrival times are exponential with mean \`1/λ\`.

**Power — reliability engineering.** The exponential and Weibull distributions model time-to-failure of generators and switches; for the exponential, \`MTBF = 1/λ\`.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A bin-failure sensor at a chemical plant has a false-positive rate of 5% (\`P(test⁺ | no failure) = 0.05\`) and a true-positive rate of 99% (\`P(test⁺ | failure) = 0.99\`). Failures are rare: the prior \`P(failure) = 0.001\`. What is \`P(failure | test⁺)\`?

**Step 1 — Bayes.** \`P(failure | test⁺) = P(test⁺ | failure)·P(failure) / P(test⁺)\`.

**Step 2 — Total probability for \`P(test⁺)\`.**
\`P(test⁺) = P(test⁺ | failure)·P(failure) + P(test⁺ | no failure)·P(no failure)\`
\`         = 0.99·0.001 + 0.05·0.999\`
\`         = 0.00099 + 0.04995\`
\`         = 0.05094\`.

**Step 3 — Posterior.**
\`P(failure | test⁺) = 0.00099 / 0.05094 ≈ 0.0194 ≈ 1.94%\`.

**Interpretation.** Even with a positive test, the probability of an actual failure is only ~2% — because failures are so rare, most positives are false positives. The engineer must plan a confirmatory test, not act on the alarm alone.`,
    visual_explanation: `- **Venn diagram** for \`P(A ∪ B) = P(A) + P(B) − P(A ∩ B)\` — the overlap is subtracted once to avoid double-counting.
- **Normal curve**: \`μ ± σ\` covers ~68%; \`μ ± 2σ\` covers ~95%; \`μ ± 3σ\` covers ~99.7% (the "68–95–99.7 rule").
- **CLT illustration**: histograms of sample means from any parent distribution converge to a bell shape as \`n\` grows.`,
    simulation_opportunity: "NOT_APPLICABLE",
    common_mistakes: `- **Confusing \`P(A | B)\` with \`P(B | A)\`** — the base-rate fallacy, exemplified by the case study.
- **Treating "independent" and "mutually exclusive" as the same** (they are opposite conditions unless one event has probability 0).
- **Using \`σ/√n\` where \`σ\` is appropriate, or vice-versa** — standard deviation of individual measurements vs. standard error of the mean.
- **Mis-stating CI interpretation**: a 95% CI does *not* mean "95% of samples lie in this interval"; it means the procedure captures the true mean 95% of the time.
- **Applying normal-based formulas to highly skewed data** without checking.
- **Reporting \`x̄\` without a measure of uncertainty** (CI or standard error).`,
    limitations: `- CLT applies to averages of independent or weakly-dependent RVs; strong dependence can break it.
- Normal distribution is a poor model for heavy-tailed phenomena (financial returns, extreme floods).
- Confidence intervals are frequentist; Bayesian credible intervals differ in interpretation.
- Rare-event probabilities are hard to estimate from limited data (the sparse-data problem).`,
    comparison: `- **Frequentist vs. Bayesian**: frequentists treat parameters as fixed and use long-run coverage; Bayesians treat parameters as random and use posterior probability.
- **Mean vs. median**: the mean is sensitive to outliers; the median is robust. Choose based on data shape.
- **σ vs. s**: \`σ\` is the population standard deviation (rarely known); \`s\` is the sample estimate.`,
    practical_application: `- SPC charts in manufacturing (control limits \`x̄ ± 3σ/√n\`).
- Reliability engineering (MTBF, failure rates).
- A/B testing in product design.
- Risk analysis (\`P(overflow)\`, \`P(structural failure)\`).`,
    decision_scenario: `A maintenance engineer must decide whether to inspect a pump. Historical data show 1% of pumps of this type fail per month. A vibration test has sensitivity 0.95 (catches 95% of failing pumps) and specificity 0.90 (90% of healthy pumps test negative). The test costs \`$100\`; an undetected failure costs \`$5000\`; a false-alarm inspection costs \`$300\`. Should the engineer test before inspecting?

- \`P(fail) = 0.01\`, \`P(no fail) = 0.99\`.
- \`P(test⁺ | fail) = 0.95\`; \`P(test⁺ | no fail) = 1 − 0.90 = 0.10\`.
- \`P(test⁺) = 0.95·0.01 + 0.10·0.99 = 0.0095 + 0.099 = 0.1085\`.
- \`P(fail | test⁺) = 0.0095 / 0.1085 ≈ 8.76%\`; \`P(no fail | test⁺) ≈ 91.24%\`.
- **Expected cost of acting on a positive test** = \`$100 + $300 + 0.0876·$5000 ≈ $100 + $300 + $438 = $838\`.
- **Expected cost of skipping the test and inspecting directly** = \`$300 + 0.01·$5000 ≈ $300 + $50 = $350\`.

**Decision.** Skip the vibration test and inspect directly — the false-positive rate is too high relative to the low failure prior, making the test more expensive than its savings.`,
    practice_questions: `- A bag has 4 red and 6 blue marbles. Two are drawn without replacement. Find \`P(both red)\`. *(Answer: (4/10)(3/9) = 12/90 = 2/15.)*
- A machine makes parts with 5% defective. In a sample of 20, find the expected number of defectives and the standard deviation. *(Answer: \`X ~ B(20, 0.05)\`; \`E[X] = 1\`; \`SD ≈ √0.95 ≈ 0.97\`.)*
- A thermometer reading is \`N(μ = 20, σ² = 0.25)\`. Find \`P(X > 21)\`. *(Answer: \`Z = 2\`, \`P ≈ 0.0228\`.)*
- Bulb lifetimes are exponential with mean 1000 h. Find \`P(X > 1500)\`. *(Answer: \`e^(−1.5) ≈ 0.223\`.)*
- A sample of 16 has \`x̄ = 50\` and \`s = 8\`. Construct a 95% CI for \`μ\` (use \`t\` with \`df = 15\`, \`t_{0.025,15} = 2.131\`). *(Answer: \`50 ± 2.131·8/4 = 50 ± 4.26\` ⇒ (45.74, 54.26).)*`,
    certification_questions: `The NCEES **FE exam** Mathematics section tests probability axioms, conditional probability, Bayes' theorem, mean/variance, the normal distribution, and confidence intervals.

Sample FE-style prompt: two fair dice are rolled; compute \`P(sum = 7)\`. (Favorable pairs: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 of 36 ⇒ \`P = 1/6\`.)

The questions in this lesson's question bank are aligned to these FE competencies.`,
    summary: `**Probability axioms**: \`0 ≤ P ≤ 1\`, \`P(S) = 1\`, additivity over disjoint events. **Bayes' theorem** inverts conditioning: posterior ∝ likelihood × prior. The normal distribution and CLT underpin most engineering inference: \`μ ± 1.96σ\` captures 95% of a normal population, and \`x̄ ± 1.96·σ/√n\` is the 95% CI for \`μ\`. Always report uncertainty (CI or \`s\`) alongside point estimates.`,
    key_takeaways: `- \`P(A | B) ≠ P(B | A)\`; the base-rate fallacy is the most common error in probabilistic reasoning.
- For independent events, joint probability factorizes: \`P(A ∩ B) = P(A)·P(B)\`.
- CLT: sample mean ≈ \`N(μ, σ²/n)\` for large \`n\`; the standard error shrinks as \`1/√n\`.
- A 95% CI for \`μ\` (known \`σ\`) is \`x̄ ± 1.96·σ/√n\`.`,
    references: `- Walpole, R. E., Myers, R. H., Myers, S. L. & Ye, K. (2016). *Probability & Statistics for Engineers & Scientists* (9th ed.). Pearson. Chapters 2–3, 4–5, 8.
- Kreyszig, E. (2011). *Advanced Engineering Mathematics* (10th ed.). Wiley. Chapters 22–24.
- MIT OpenCourseWare — Probability and Statistics (free course material).`,
  },
  knowledgeObject: {
    title: "Probability, Bayes, and statistical estimation",
    domain: "Engineering Mathematics",
    competency:
      "Apply probability axioms, Bayes' theorem, and the normal distribution / CLT to engineering inference.",
    topic: "Probability and statistics",
    concept: "Random variable and confidence interval",
    body: {
      definitions: [
        "Probability P(A) ∈ [0,1] assigns a degree of belief to event A ⊆ sample space S.",
        "Conditional probability P(A | B) = P(A ∩ B)/P(B).",
        "Independent events: P(A ∩ B) = P(A)·P(B).",
        "Random variable X: S → ℝ; discrete (PMF) or continuous (PDF).",
        "Expectation E[X] = Σ x·p(x) (discrete) or ∫ x·f(x) dx (continuous).",
        "Variance Var(X) = E[X²] − (E[X])².",
        "Normal N(μ, σ²); standardization Z = (X − μ)/σ.",
        "Confidence interval: procedure that captures the true parameter with stated long-run probability.",
      ],
      principles: [
        "Kolmogorov axioms: 0 ≤ P ≤ 1, P(S) = 1, additivity over disjoint events.",
        "Bayes' theorem: P(A | B) = P(B | A)·P(A)/P(B) — inference as inverse conditioning.",
        "Independence factorizes joint probabilities.",
        "CLT: sample mean of i.i.d. RVs converges in distribution to N(μ, σ²/n).",
      ],
      components: [
        "Axioms, conditional probability, independence.",
        "Discrete RVs: binomial B(n, p), Poisson(λ).",
        "Continuous RVs: normal N(μ, σ²), exponential(λ), uniform[a, b].",
        "Expectation, variance, standard deviation.",
        "Sampling distribution of the mean; CLT.",
        "Confidence intervals; z and t distributions.",
      ],
      mechanism: [
        "Probability is the forward model (process → data); statistics is the inverse (data → process).",
        "Bayes inverts conditional probability via the law of total probability.",
        "CLT ensures the sample mean inherits a normal distribution for large n.",
      ],
      process: [
        "Identify the experiment, sample space, and events of interest.",
        "Choose a probability model (uniform, binomial, Poisson, normal, etc.).",
        "Compute probability or expectation via axioms, Bayes, or distribution formulas.",
        "For inference: summarize data with x̄ and s; check CLT assumptions; construct a CI.",
      ],
      formulas: [
        "P(A ∪ B) = P(A) + P(B) − P(A ∩ B).",
        "P(A | B) = P(A ∩ B)/P(B).",
        "Bayes: P(A | B) = P(B | A)·P(A)/P(B).",
        "E[X] = Σ x·p(x) or ∫ x·f(x) dx.",
        "Var(X) = E[X²] − (E[X])².",
        "Normal PDF: f(x) = (1/(σ·√(2π)))·e^(−(x−μ)²/(2σ²)).",
        "Z = (X − μ)/σ.",
        "95% CI for μ (known σ): x̄ ± 1.96·σ/√n.",
      ],
      metrics: [
        "P(event) ∈ [0,1].",
        "E[X] (units of X), Var(X) (units²), SD = √Var.",
        "Standard error of the mean: σ/√n.",
        "CI half-width: z_{α/2}·σ/√n.",
      ],
      examples: [
        "Two dice: P(sum = 7) = 6/36 = 1/6.",
        "95% CI for bottle fill: (496.6, 499.8) mL on n = 25, σ = 4.0, x̄ = 498.2.",
      ],
      industrial_examples: [
        "Manufacturing: SPC control limits x̄ ± 3·σ/√n on X̄-R charts.",
        "Container Terminal: Poisson(λ) ship arrivals, exponential inter-arrival times.",
        "Power: MTBF = 1/λ for exponential time-to-failure of generators.",
      ],
      case_studies: [
        "SYNTHETIC bin-failure sensor: with P(failure)=0.001, P(test⁺|fail)=0.99, P(test⁺|no fail)=0.05 ⇒ posterior P(failure|test⁺) ≈ 1.94% (the base-rate fallacy in action).",
      ],
      common_errors: [
        "Base-rate fallacy: confusing P(A|B) with P(B|A).",
        "Treating independence and mutual exclusivity as the same.",
        "Using σ where σ/√n (standard error) is needed, or vice-versa.",
        "Mis-stating CI interpretation as '95% of samples lie in this interval'.",
        "Reporting x̄ without a measure of uncertainty.",
      ],
      limitations: [
        "CLT requires independent or weakly-dependent RVs; strong dependence can break it.",
        "Normal distribution is a poor model for heavy-tailed phenomena.",
        "Rare-event probabilities are hard to estimate from limited data.",
      ],
      best_practices: [
        "Always report uncertainty (CI or standard error) alongside point estimates.",
        "Check the distributional assumptions before applying normal-based formulas.",
        "Sanity-check base rates before interpreting a posterior.",
        "Prefer confidence intervals to single point estimates.",
      ],
      related_concepts: [
        "Calculus (integration over continuous densities).",
        "Linear algebra (covariance matrices; PCA).",
        "Optimization (maximum-likelihood estimation).",
        "Differential equations (Markov chains and compartmental models).",
      ],
      prerequisites: [
        "Combinatorics (permutations, combinations).",
        "Single-variable calculus.",
        "Summation and integral notation.",
        "Properties of exponents and logarithms.",
      ],
      references: [
        "Walpole, R. E., Myers, R. H., Myers, S. L. & Ye, K. (2016). Probability & Statistics for Engineers & Scientists (9th ed.). Pearson.",
        "Kreyszig, E. (2011). Advanced Engineering Mathematics (10th ed.). Wiley.",
        "MIT OpenCourseWare — Probability and Statistics.",
      ],
    },
  },
  questions: [
    {
      lessonSlug: "probability-statistics",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "For any event A in a sample space, P(A) is bounded by:",
      explanation:
        "One of the three Kolmogorov axioms states that 0 ≤ P(A) ≤ 1 for any event A, with P(∅) = 0 and P(S) = 1.",
      whyCorrect:
        "0 ≤ P(A) ≤ 1 — the non-negativity and upper-bound axiom of probability.",
      whyOthersWrong: [
        "−1 ≤ P(A) ≤ 1 is the range of a correlation coefficient, not a probability.",
        "0 ≤ P(A) ≤ ∞ omits the upper bound of 1 — probabilities cannot exceed 1.",
        "−∞ < P(A) < ∞ is the range of a real number, with no probabilistic meaning.",
      ],
      options: [
        { text: "0 ≤ P(A) ≤ 1", isCorrect: true },
        { text: "−1 ≤ P(A) ≤ 1", isCorrect: false },
        { text: "0 ≤ P(A) ≤ ∞", isCorrect: false },
        { text: "−∞ < P(A) < ∞", isCorrect: false },
      ],
    },
    {
      lessonSlug: "probability-statistics",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "Two fair dice are rolled. What is P(sum = 7)?",
      explanation:
        "Of the 36 equally likely outcomes, the favorable pairs summing to 7 are (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — 6 in total. So P = 6/36 = 1/6.",
      whyCorrect:
        "1/6 — six favorable pairs out of 36 equally likely outcomes give P = 6/36 = 1/6.",
      whyOthersWrong: [
        "1/12 would be 3 favorable outcomes (e.g. only the three ascending pairs) — undercounting by half.",
        "1/9 ≈ 4/36 corresponds to a different sum (e.g. sum = 4 has 3 favorable outcomes, not 7).",
        "5/36 is the probability of sum = 8 (or sum = 6) — close distractor but not the answer for sum = 7.",
      ],
      options: [
        { text: "1/6", isCorrect: true },
        { text: "1/12", isCorrect: false },
        { text: "1/9", isCorrect: false },
        { text: "5/36", isCorrect: false },
      ],
    },
    {
      lessonSlug: "probability-statistics",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      stem: "If events A and B are independent, then P(A ∩ B) = P(A)·P(B).",
      explanation:
        "Independence is *defined* by the factorization of the joint probability: A ⊥ B ⟺ P(A ∩ B) = P(A)·P(B). The condition is both necessary and sufficient (provided neither event has probability 0).",
      whyCorrect:
        "True — independence is precisely the condition that the joint probability factorizes as the product of the marginals.",
      whyOthersWrong: [
        "False is wrong because the factorization P(A ∩ B) = P(A)·P(B) is the very definition of independence.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
    {
      lessonSlug: "probability-statistics",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "If X ~ N(0, 1), what is P(|X| > 1.96)?",
      explanation:
        "By symmetry, P(|X| > 1.96) = 2·P(X > 1.96) = 2·(1 − Φ(1.96)) = 2·0.025 = 0.05. This is the source of the 1.96 constant in 95% confidence intervals.",
      whyCorrect:
        "0.05 — the standard normal has 2.5% in each tail beyond |Z| = 1.96, so the two-tailed probability is 2·0.025 = 0.05.",
      whyOthersWrong: [
        "0.10 would be the two-tailed probability at |Z| = 1.645 (90% CI), not 1.96.",
        "0.32 is roughly P(|Z| > 1), not P(|Z| > 1.96).",
        "0.95 is P(|Z| ≤ 1.96), the complement of the correct answer.",
      ],
      options: [
        { text: "0.05", isCorrect: true },
        { text: "0.10", isCorrect: false },
        { text: "0.32", isCorrect: false },
        { text: "0.95", isCorrect: false },
      ],
    },
    {
      lessonSlug: "probability-statistics",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem:
        "A sample of n = 25 has x̄ = 10 and known σ = 4. The 95% confidence interval for μ is approximately:",
      explanation:
        "Standard error SE = σ/√n = 4/√25 = 0.8. Margin of error ME = 1.96·0.8 = 1.568. The 95% CI is (10 − 1.568, 10 + 1.568) ≈ (8.43, 11.57).",
      whyCorrect:
        "(8.43, 11.57) — using x̄ ± 1.96·σ/√n = 10 ± 1.568 ⇒ (8.43, 11.57).",
      whyOthersWrong: [
        "(9.20, 10.80) uses x̄ ± 1·SE — the 68% CI (one σ), not the 95% CI.",
        "(6.16, 13.84) uses x̄ ± 1.96·σ (treating σ as the SE) — forgetting the √n in the denominator.",
        "(8.04, 11.96) uses x̄ ± 1.96·σ/√n with σ = 5 (or some other arithmetic slip) instead of σ = 4.",
      ],
      options: [
        { text: "(8.43, 11.57)", isCorrect: true },
        { text: "(9.20, 10.80)", isCorrect: false },
        { text: "(6.16, 13.84)", isCorrect: false },
        { text: "(8.04, 11.96)", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public lesson array
// ---------------------------------------------------------------------------

export const ENGINEERING_MATHEMATICS_LESSONS: RefLesson[] = [
  LESSON_CALCULUS,
  LESSON_LINEAR_ALGEBRA,
  LESSON_DIFFERENTIAL_EQUATIONS,
  LESSON_PROBABILITY_STATISTICS,
];

// ---------------------------------------------------------------------------
// Loader — writes the dataset into the database
// ---------------------------------------------------------------------------

/**
 * Upsert the Engineering Mathematics reference dataset into the database.
 * Idempotent: safe to call repeatedly. Returns the number of records written.
 *
 * Flow:
 *  1. Look up the section by slug "engineering-mathematics".
 *  2. Upsert References by (sectionId, title) → map title → id.
 *  3. Delete all existing Questions for this section (to be re-created below).
 *  4. For each lesson:
 *     - Upsert Lesson by (sectionId, slug), set sections JSON, referenceIds,
 *       legacy fields, lifecycle metadata (READY / HIGH / VERIFIED / 1.0.0).
 *     - Find-or-create the KnowledgeObject by (sectionId, lessonId, title),
 *       set body JSON and lifecycle metadata.
 *     - Create each enriched Question with nested options, link to KO, set
 *       whyCorrect, whyOthersWrong (JSON), referenceIds (JSON), lifecycle.
 *  5. Return counts.
 */
export async function loadReference() {
  // 1) Section
  const section = await db.section.findUnique({
    where: { slug: "engineering-mathematics" },
  });
  if (!section) {
    throw new Error("section engineering-mathematics not found");
  }

  // 2) References — findFirst by (sectionId, title), then update or create.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of ENGINEERING_MATHEMATICS_SOURCES) {
    const existing = await db.reference.findFirst({
      where: { sectionId: section.id, title: src.title },
    });
    const data = {
      sectionId: section.id,
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
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 3) Delete all existing questions for this section (re-created below).
  await db.question.deleteMany({ where: { sectionId: section.id } });

  // 4) Lessons, KOs, Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of ENGINEERING_MATHEMATICS_LESSONS) {
    const referenceIds = (lesson.references ?? [])
      .map((t) => refIdsByTitle[t])
      .filter(Boolean) as string[];
    const referenceIdsJson = JSON.stringify(referenceIds);

    // Derive legacy fields from the 24-section content (with explicit fallbacks).
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

    const lessonRow = await db.lesson.upsert({
      where: { sectionId_slug: { sectionId: section.id, slug: lesson.slug } },
      create: {
        sectionId: section.id,
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
        referenceIds: referenceIdsJson,
        status: "READY",
        confidence: "HIGH",
        verificationStatus: "VERIFIED",
        version: "1.0.0",
        lastReviewedAt: new Date(),
      },
      update: {
        title: lesson.title,
        titleAr: lesson.titleAr ?? null,
        order: lesson.order,
        durationMin: lesson.durationMin,
        conceptIntroduction,
        example,
        keyFormulas,
        exercise,
        sections: sectionsJson,
        referenceIds: referenceIdsJson,
        status: "READY",
        confidence: "HIGH",
        verificationStatus: "VERIFIED",
        version: "1.0.0",
        lastReviewedAt: new Date(),
      },
    });
    lessonsCount += 1;

    // KnowledgeObject — no unique constraint on (sectionId, lessonId, title),
    // so findFirst then create-or-update.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { sectionId: section.id, lessonId: lessonRow.id, title: ko.title },
    });
    let koId: string;
    if (existingKO) {
      const updated = await db.knowledgeObject.update({
        where: { id: existingKO.id },
        data: {
          domain: ko.domain,
          competency: ko.competency,
          topic: ko.topic,
          concept: ko.concept,
          body: koBodyJson,
          version: "1.0.0",
          confidence: "HIGH",
          verificationStatus: "VERIFIED",
          status: "READY",
          referenceIds: referenceIdsJson,
        },
      });
      koId = updated.id;
    } else {
      const created = await db.knowledgeObject.create({
        data: {
          sectionId: section.id,
          lessonId: lessonRow.id,
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
          referenceIds: referenceIdsJson,
        },
      });
      koId = created.id;
    }
    kosCount += 1;

    // Questions — created fresh (we deleted the old set above).
    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          sectionId: section.id,
          lessonId: lessonRow.id,
          type: q.type,
          difficulty: q.difficulty,
          bloomLevel: q.bloomLevel,
          cognitiveLevel: q.cognitiveLevel,
          skillType: q.skillType ?? null,
          stem: q.stem,
          explanation: q.explanation ?? null,
          whyCorrect: q.whyCorrect,
          whyOthersWrong: JSON.stringify(q.whyOthersWrong),
          referenceIds: referenceIdsJson,
          knowledgeObjectId: koId,
          status: "READY",
          verificationStatus: "VERIFIED",
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
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}

/**
 * Engineer's Educations — Seed Data
 * =================================
 * Self-contained TypeScript module exporting:
 *   - SeedSection / SeedLesson / SeedQuestion interfaces
 *   - SEED_SECTIONS: 23 engineering sections, each with 3–5 lessons and ≥12 questions
 *   - SEED_MATRIX_TARGETS: documented Generation Matrix targets per (color, difficulty, type)
 *   - runSeed(opts?: { reset?: boolean }): idempotent Prisma upsert runner
 *
 * Dataset summary (what runSeed produces when seeded on a fresh DB):
 *   - Sections:        23
 *   - Lessons:         92   (4 per section)
 *   - Questions:       299  (13 per section, mixed MC/TF × Easy/Med/Hard × 4 Bloom levels)
 *   - Matrix cells:    552  (23 sections × 3 difficulty × 4 Bloom × 2 type = 552 target rows)
 *
 * Generation Matrix target rationale:
 *   Per section we record 24 cells (3 difficulties × 4 Bloom levels × 2 question types).
 *   Per-cell targetCount:
 *     MultipleChoice:  Easy=25, Medium=20, Hard=15   → 60 MC targets
 *     TrueFalse:        Easy=10, Medium=8,  Hard=6    → 24 TF targets
 *   Section baseline (sum of targets) = 60 + 24 = 84 questions per section.
 *   23 sections × 84 = 1,932 baseline question bank target.
 *   The platform's stretch goal is ~5,000 questions; this seed ships ~299 starter
 *   questions and the matrix documents the path to the full target.
 *
 * Usage: imported by an API route at /api/admin/seed (server route, NOT 'use server').
 *   import { runSeed, SEED_SECTIONS } from '@/lib/seed-data';
 */

import { db } from '@/lib/db';

// ============================================================
// Types
// ============================================================

export type QuestionType = 'MultipleChoice' | 'TrueFalse';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze';

export interface SeedOption {
  text: string;
  isCorrect: boolean;
}

export interface SeedQuestion {
  /** Optional: slug of the lesson within this section that the question maps to. */
  lessonSlug?: string;
  type: QuestionType;
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  skillType?: string; // "Conceptual" | "Numerical" | "Definitional" | ...
  stem: string;
  explanation?: string;
  options: SeedOption[];
}

export interface SeedLesson {
  slug: string;
  title: string;
  titleAr?: string;
  order: number;
  conceptIntroduction: string;
  example?: string;
  keyFormulas?: string;
  exercise?: string;
  durationMin: number;
}

export interface SeedSection {
  slug: string;
  title: string;
  titleAr?: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  lessons: SeedLesson[];
  questions: SeedQuestion[];
}

// ============================================================
// Matrix target constants (used by runSeed + exported for UI)
// ============================================================

/** targetCount keyed by `${difficulty}:${type}` */
export const SEED_MATRIX_TARGETS: Record<string, number> = {
  'Easy:MultipleChoice': 25,
  'Medium:MultipleChoice': 20,
  'Hard:MultipleChoice': 15,
  'Easy:TrueFalse': 10,
  'Medium:TrueFalse': 8,
  'Hard:TrueFalse': 6,
};

// ============================================================
// SEED_SECTIONS — 23 engineering disciplines
// ============================================================

export const SEED_SECTIONS: SeedSection[] = [
  // ----------------------------------------------------------
  // 1. Engineering Mathematics
  // ----------------------------------------------------------
  {
    slug: 'engineering-mathematics',
    title: 'Engineering Mathematics',
    titleAr: 'الرياضيات الهندسية',
    description: 'Calculus, linear algebra, differential equations and probability — the quantitative backbone of every engineering discipline.',
    icon: 'Calculator',
    color: 'emerald',
    order: 1,
    lessons: [
      {
        slug: 'calculus-differentiation',
        title: 'Calculus & Differentiation',
        titleAr: 'التفاضل وحساب التفاضل',
        order: 1,
        conceptIntroduction: '- The derivative `dy/dx` is the instantaneous rate of change of `y` with respect to `x`.\n- Key rules: power rule `d/dx[xⁿ] = n·xⁿ⁻¹`, product rule `(uv)′ = u′v + uv′`, chain rule `d/dx[f(g(x))] = f′(g(x))·g′(x)`.\n- Maxima/minima occur where `f′(x)=0`; use the second-derivative test to classify.',
        example: 'Find the maximum of `f(x) = -x² + 4x + 5`.\n`f′(x) = -2x + 4 = 0  →  x = 2`.\n`f″(x) = -2 < 0` ⇒ maximum at `x=2`.\n`f(2) = -4 + 8 + 5 = 9`.',
        keyFormulas: '(uv)′ = u′v + uv′\n(u/v)′ = (u′v − uv′)/v²\nChain: d/dx[f(g)] = f′(g)·g′\nTaylor: f(x) = Σ fⁿ(a)/n! · (x−a)ⁿ',
        exercise: 'Use the chain rule to differentiate `f(x) = sin(3x² − 1)` and find `f′(0)`.',
        durationMin: 20,
      },
      {
        slug: 'linear-algebra',
        title: 'Linear Algebra',
        titleAr: 'الجبر الخطي',
        order: 2,
        conceptIntroduction: '- A matrix `A` of size `m×n` maps vectors from `ℝⁿ` to `ℝᵐ`.\n- The determinant `|A|` is zero ⟺ `A` is singular (non-invertible).\n- Eigenvalues `λ` satisfy `A·v = λ·v`; eigenvalues sum to the trace and multiply to the determinant.',
        example: 'Find eigenvalues of `A = [[4,1],[2,3]]`.\n`det(A − λI) = (4−λ)(3−λ) − 2 = λ² − 7λ + 10 = 0`.\n`λ = (7 ± 3)/2 = 5, 2`.',
        keyFormulas: 'det([[a,b],[c,d]]) = ad − bc\nA⁻¹ = adj(A)/det(A)\nAx = λx ⇒ det(A − λI) = 0\nTr(A) = Σ aᵢᵢ',
        exercise: 'Compute the determinant and the inverse of `[[2,5],[1,3]]`.',
        durationMin: 18,
      },
      {
        slug: 'differential-equations',
        title: 'Differential Equations',
        titleAr: 'المعادلات التفاضلية',
        order: 3,
        conceptIntroduction: '- First-order linear ODE: `dy/dx + P(x)y = Q(x)`, solved by the integrating factor `μ = e^∫P dx`.\n- Second-order linear with constant coefficients: `ay″ + by′ + cy = 0`; solve `ar² + br + c = 0`.\n- Laplace transforms convert ODEs in `t` to algebraic equations in `s`.',
        example: 'Solve `y″ − 5y′ + 6y = 0`.\nCharacteristic: `r² − 5r + 6 = 0  ⇒  r = 2, 3`.\n`y(x) = C₁·e²ˣ + C₂·e³ˣ`.',
        keyFormulas: 'μ(x) = e^∫P dx\nar² + br + c = 0\nL{f′} = sF − f(0)\nL{f″} = s²F − sf(0) − f′(0)',
        exercise: 'Solve `y′ + 2y = eˣ` using an integrating factor.',
        durationMin: 22,
      },
      {
        slug: 'probability-statistics',
        title: 'Probability & Statistics',
        titleAr: 'الاحتمالات والإحصاء',
        order: 4,
        conceptIntroduction: '- Probability axioms: `0 ≤ P(A) ≤ 1`, `P(S)=1`, and `P(A∪B)=P(A)+P(B)−P(A∩B)`.\n- Conditional probability: `P(A|B) = P(A∩B)/P(B)`.\n- The normal distribution `N(μ,σ²)` has PDF `f(x) = (1/σ√2π)·e^(−(x−μ)²/2σ²)`.',
        example: 'A fair die is rolled. P(sum of two dice = 7)?\nFavorable pairs: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6.\nP = 6/36 = 1/6.',
        keyFormulas: 'P(A∪B) = P(A)+P(B)−P(A∩B)\nP(A|B) = P(A∩B)/P(B)\nE[X] = Σ x·P(x)\nVar(X) = E[X²] − (E[X])²',
        exercise: 'If X ~ N(0,1), compute P(X > 1.96) using the standard normal table.',
        durationMin: 15,
      },
    ],
    questions: [
      { lessonSlug: 'calculus-differentiation', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Which rule is used to differentiate a composition f(g(x))?', explanation: 'The chain rule differentiates composite functions: d/dx[f(g(x))] = f′(g(x))·g′(x).', options: [ { text: 'Product rule', isCorrect: false }, { text: 'Chain rule', isCorrect: true }, { text: 'Quotient rule', isCorrect: false }, { text: 'Power rule', isCorrect: false } ] },
      { lessonSlug: 'calculus-differentiation', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Understand', skillType: 'Numerical', stem: 'What is d/dx[x³]?', explanation: 'By the power rule, d/dx[xⁿ] = n·xⁿ⁻¹, so d/dx[x³] = 3x².', options: [ { text: '3x²', isCorrect: true }, { text: 'x²', isCorrect: false }, { text: '3x', isCorrect: false }, { text: 'x⁴/4', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Conceptual', stem: 'The derivative of a constant is zero.', explanation: 'A constant has no rate of change, so d/dx[c] = 0.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'calculus-differentiation', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Find the critical point of f(x) = x² − 4x + 3.', explanation: 'f′(x) = 2x − 4 = 0 ⇒ x = 2. f″=2>0 ⇒ minimum at x=2.', options: [ { text: 'x = 1', isCorrect: false }, { text: 'x = 2', isCorrect: true }, { text: 'x = 3', isCorrect: false }, { text: 'x = 4', isCorrect: false } ] },
      { lessonSlug: 'linear-algebra', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Compute det([[3,1],[1,3]]).', explanation: 'det = 3·3 − 1·1 = 9 − 1 = 8.', options: [ { text: '6', isCorrect: false }, { text: '8', isCorrect: true }, { text: '9', isCorrect: false }, { text: '10', isCorrect: false } ] },
      { lessonSlug: 'linear-algebra', type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A square matrix is invertible if and only if its determinant is non-zero.', explanation: 'det(A) ≠ 0 ⟺ A is non-singular ⟺ A⁻¹ exists.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'linear-algebra', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Numerical', stem: 'The trace of [[4,1],[2,3]] equals the sum of its eigenvalues. What is that sum?', explanation: 'Trace = 4+3 = 7; eigenvalues are 5 and 2, which sum to 7.', options: [ { text: '5', isCorrect: false }, { text: '6', isCorrect: false }, { text: '7', isCorrect: true }, { text: '12', isCorrect: false } ] },
      { lessonSlug: 'differential-equations', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'The general solution of y″ − 5y′ + 6y = 0 is:', explanation: 'Characteristic roots r=2,3 ⇒ y = C₁e²ˣ + C₂e³ˣ.', options: [ { text: 'y = C₁e²ˣ + C₂e³ˣ', isCorrect: true }, { text: 'y = C₁e²ˣ + C₂e⁻³ˣ', isCorrect: false }, { text: 'y = (C₁+C₂x)e²ˣ', isCorrect: false }, { text: 'y = C₁ cos(2x) + C₂ sin(2x)', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The integrating factor for dy/dx + P(x)y = Q(x) is e^∫P dx.', explanation: 'Multiplying the ODE by μ = e^∫P dx turns the left side into d/dx[μ·y].', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'probability-statistics', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'For any event A in a sample space, P(A) is bounded by:', explanation: 'Probability axioms require 0 ≤ P(A) ≤ 1.', options: [ { text: '−1 ≤ P(A) ≤ 1', isCorrect: false }, { text: '0 ≤ P(A) ≤ 1', isCorrect: true }, { text: '0 ≤ P(A) ≤ ∞', isCorrect: false }, { text: '−∞ < P(A) < ∞', isCorrect: false } ] },
      { lessonSlug: 'probability-statistics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Two fair dice are rolled. What is P(sum = 7)?', explanation: 'Six favorable outcomes out of 36 ⇒ 6/36 = 1/6.', options: [ { text: '1/12', isCorrect: false }, { text: '1/9', isCorrect: false }, { text: '1/6', isCorrect: true }, { text: '5/36', isCorrect: false } ] },
      { lessonSlug: 'probability-statistics', type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'For independent events A and B, P(A∩B) = P(A)·P(B).', explanation: 'Independence is precisely the condition that joint probability factorises.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Numerical', stem: 'If X ~ N(0,1), P(|X| > 1.96) ≈ ?', explanation: 'P(|Z|>1.96) = 2·(1−Φ(1.96)) ≈ 2·0.025 = 0.05.', options: [ { text: '0.05', isCorrect: true }, { text: '0.10', isCorrect: false }, { text: '0.32', isCorrect: false }, { text: '0.95', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 2. Engineering Physics
  // ----------------------------------------------------------
  {
    slug: 'engineering-physics',
    title: 'Engineering Physics',
    titleAr: 'الفيزياء الهندسية',
    description: 'Classical mechanics, electromagnetism, waves and an introduction to modern physics for engineers.',
    icon: 'Atom',
    color: 'cyan',
    order: 2,
    lessons: [
      {
        slug: 'mechanics-kinematics',
        title: 'Mechanics & Kinematics',
        titleAr: 'الميكانيكا والحركة',
        order: 1,
        conceptIntroduction: '- Newton’s second law: `F = m·a` relates net force to acceleration.\n- Kinematic equations for constant acceleration: `v = u + at`, `s = ut + ½at²`, `v² = u² + 2as`.\n- Projectile motion: horizontal and vertical motions are independent.',
        example: 'A ball is thrown horizontally at 10 m/s from a 20 m cliff. Time to fall?\n`20 = ½·g·t² ⇒ t = √(2·20/9.81) ≈ 2.02 s`.',
        keyFormulas: 'F = ma\nv = u + at\ns = ut + ½at²\nv² = u² + 2as',
        exercise: 'A car accelerates from rest at 2 m/s² for 5 s. Find its final velocity and distance covered.',
        durationMin: 18,
      },
      {
        slug: 'electromagnetism',
        title: 'Electromagnetism',
        titleAr: 'الكهرومغناطيسية',
        order: 2,
        conceptIntroduction: '- Coulomb’s law: `F = k·q₁·q₂/r²` with `k ≈ 9×10⁹ N·m²/C²`.\n- Gauss’s law: `∮E·dA = Q/ε₀`.\n- Faraday’s law: `EMF = −dΦ/dt` relates changing flux to induced EMF.',
        example: 'Force between two 1 μC charges 1 m apart?\n`F = 9×10⁹ × (10⁻⁶)² / 1² = 9×10⁻³ N` (repulsive).',
        keyFormulas: 'F = k·q₁q₂/r²\n∮E·dA = Q/ε₀\nEMF = −dΦ/dt\nF = qvB (Lorentz)',
        exercise: 'A 0.5 T magnetic field acts perpendicular to a 2 m wire carrying 5 A. Find the force.',
        durationMin: 20,
      },
      {
        slug: 'waves-oscillations',
        title: 'Waves & Oscillations',
        titleAr: 'الموجات والتذبذبات',
        order: 3,
        conceptIntroduction: '- Simple harmonic motion: `x = A·cos(ωt + φ)`, with `ω = √(k/m)` for a spring.\n- Wave equation: `v = f·λ`.\n- Energy of an oscillator: `E = ½k·A²`.',
        example: 'A 0.5 kg mass on a spring (k=200 N/m) oscillates. Find period T.\n`T = 2π√(m/k) = 2π√(0.5/200) ≈ 0.314 s`.',
        keyFormulas: 'x = A·cos(ωt+φ)\nω = √(k/m)\nT = 2π√(m/k)\nv = fλ',
        exercise: 'A wave has frequency 50 Hz and wavelength 6 m. Find its speed.',
        durationMin: 16,
      },
      {
        slug: 'modern-physics',
        title: 'Modern Physics',
        titleAr: 'الفيزياء الحديثة',
        order: 4,
        conceptIntroduction: '- Photon energy: `E = h·f`, with `h ≈ 6.63×10⁻³⁴ J·s`.\n- Mass–energy equivalence: `E = m·c²`.\n- de Broglie wavelength: `λ = h/p`.',
        example: 'Energy of a photon of frequency 5×10¹⁴ Hz?\n`E = 6.63×10⁻³⁴ × 5×10¹⁴ ≈ 3.3×10⁻¹⁹ J ≈ 2.07 eV`.',
        keyFormulas: 'E = hf\nE = mc²\nλ = h/p\nKE = (m − m₀)c²',
        exercise: 'Compute the de Broglie wavelength of an electron moving at 10⁶ m/s.',
        durationMin: 20,
      },
    ],
    questions: [
      { lessonSlug: 'mechanics-kinematics', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Newton’s second law states:', explanation: 'F = m·a — net force equals mass times acceleration.', options: [ { text: 'F = ma', isCorrect: true }, { text: 'F = mv', isCorrect: false }, { text: 'F = m/a', isCorrect: false }, { text: 'F = a/m', isCorrect: false } ] },
      { lessonSlug: 'mechanics-kinematics', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 2 kg object accelerates at 3 m/s². Net force?', explanation: 'F = ma = 2×3 = 6 N.', options: [ { text: '1.5 N', isCorrect: false }, { text: '5 N', isCorrect: false }, { text: '6 N', isCorrect: true }, { text: '9 N', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In projectile motion (no air drag), the horizontal velocity component is constant.', explanation: 'Gravity acts only vertically, so horizontal velocity is unchanged.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'mechanics-kinematics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A body starts from rest and accelerates at 2 m/s² for 5 s. Final velocity?', explanation: 'v = u + at = 0 + 2×5 = 10 m/s.', options: [ { text: '5 m/s', isCorrect: false }, { text: '7 m/s', isCorrect: false }, { text: '10 m/s', isCorrect: true }, { text: '25 m/s', isCorrect: false } ] },
      { lessonSlug: 'electromagnetism', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Two 1 μC charges are 1 m apart. Force? (k = 9×10⁹)', explanation: 'F = 9×10⁹ × (10⁻⁶)² / 1² = 9×10⁻³ N.', options: [ { text: '9×10⁻³ N', isCorrect: true }, { text: '9×10⁻⁶ N', isCorrect: false }, { text: '9×10⁻⁹ N', isCorrect: false }, { text: '9 N', isCorrect: false } ] },
      { lessonSlug: 'electromagnetism', type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Faraday’s law states EMF = −dΦ/dt.', explanation: 'A changing magnetic flux through a loop induces an EMF.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'Gauss’s law in integral form is:', explanation: '∮E·dA = Q/ε₀ relates the electric flux through a closed surface to the enclosed charge.', options: [ { text: '∮E·dA = Q/ε₀', isCorrect: true }, { text: '∮B·dA = 0', isCorrect: false }, { text: '∮E·dl = −dΦ/dt', isCorrect: false }, { text: '∮B·dl = μ₀I', isCorrect: false } ] },
      { lessonSlug: 'waves-oscillations', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The relationship between wave speed, frequency, and wavelength is:', explanation: 'Wave speed = frequency × wavelength, i.e. v = fλ.', options: [ { text: 'v = f/λ', isCorrect: false }, { text: 'v = fλ', isCorrect: true }, { text: 'v = λ/f', isCorrect: false }, { text: 'v = f + λ', isCorrect: false } ] },
      { lessonSlug: 'waves-oscillations', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 0.5 kg mass on k=200 N/m spring. Period T?', explanation: 'T = 2π√(m/k) = 2π√(0.5/200) ≈ 0.314 s.', options: [ { text: '0.10 s', isCorrect: false }, { text: '0.31 s', isCorrect: true }, { text: '1.0 s', isCorrect: false }, { text: '6.28 s', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A spring oscillator’s total energy equals ½kA².', explanation: 'The maximum spring energy ½kA² equals the total mechanical energy (no friction).', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'modern-physics', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Energy of a photon of frequency 5×10¹⁴ Hz? (h=6.63×10⁻³⁴)', explanation: 'E = hf = 6.63×10⁻³⁴ × 5×10¹⁴ ≈ 3.3×10⁻¹⁹ J.', options: [ { text: '3.3×10⁻¹⁹ J', isCorrect: true }, { text: '3.3×10⁻²⁸ J', isCorrect: false }, { text: '3.3×10⁻⁴ J', isCorrect: false }, { text: '3.3×10⁻¹⁰ J', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The de Broglie wavelength is given by:', explanation: 'λ = h/p relates particle momentum to its wave-like wavelength.', options: [ { text: 'λ = h/p', isCorrect: true }, { text: 'λ = hp', isCorrect: false }, { text: 'λ = p/h', isCorrect: false }, { text: 'λ = c/f', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Einstein’s mass–energy equivalence is E = mc².', explanation: 'The relation E = mc² equates mass to a quantity of energy.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 3. Engineering Chemistry
  // ----------------------------------------------------------
  {
    slug: 'engineering-chemistry',
    title: 'Engineering Chemistry',
    titleAr: 'الكيمياء الهندسية',
    description: 'Atomic structure, bonding, chemical thermodynamics, electrochemistry and engineering materials.',
    icon: 'FlaskConical',
    color: 'lime',
    order: 3,
    lessons: [
      {
        slug: 'atomic-structure-bonding',
        title: 'Atomic Structure & Bonding',
        titleAr: 'التركيب الذري والروابط',
        order: 1,
        conceptIntroduction: '- Electrons occupy orbitals described by quantum numbers (n, l, m, s).\n- Ionic bonds transfer electrons; covalent bonds share electrons.\n- Electronegativity difference predicts bond polarity.',
        example: 'NaCl: Na (1 valence e⁻) donates to Cl (7 valence e⁻) → ionic bond with Na⁺ and Cl⁻.',
        keyFormulas: 'E = −13.6/n² eV (H-atom)\nΔEN > 1.7 ⇒ ionic\nLewis: octet rule\nBond order = (bonding−antibonding)/2',
        exercise: 'Draw the Lewis structure of H₂O and identify its bond angle (~104.5°).',
        durationMin: 16,
      },
      {
        slug: 'chemical-thermodynamics',
        title: 'Chemical Thermodynamics',
        titleAr: 'الديناميكا الحرارية الكيميائية',
        order: 2,
        conceptIntroduction: '- First law: ΔU = q + w (energy is conserved).\n- Gibbs free energy: ΔG = ΔH − TΔS; spontaneity requires ΔG < 0.\n- Hess’s law: ΔH_rxn is path-independent.',
        example: 'If ΔH = −100 kJ and ΔS = +50 J/K at 300 K, ΔG?\n`ΔG = −100 − 300×0.05 = −115 kJ` (spontaneous).',
        keyFormulas: 'ΔU = q + w\nΔG = ΔH − TΔS\nΔG° = −RT ln K\nq = m·c·ΔT',
        exercise: 'Compute ΔG for a reaction with ΔH = −50 kJ, ΔS = −100 J/K at 300 K and comment on spontaneity.',
        durationMin: 18,
      },
      {
        slug: 'electrochemistry',
        title: 'Electrochemistry',
        titleAr: 'الكيمياء الكهربائية',
        order: 3,
        conceptIntroduction: '- Nernst equation: `E = E° − (RT/nF)·ln Q`.\n- Galvanic cells convert chemical energy to electrical energy.\n- Standard reduction potentials let us rank oxidizing/reducing strength.',
        example: 'Cell Zn|Zn²⁺(1M)||Cu²⁺(1M)|Cu has E° = 1.10 V. At 25°C with Q=0.01, E?\n`E = 1.10 − (0.0591/2)·log(0.01) ≈ 1.10 + 0.0591 = 1.159 V`.',
        keyFormulas: 'E = E° − (RT/nF)·ln Q\nΔG° = −nFE°\nFaraday: F = 96485 C/mol\nm = (M·I·t)/(n·F)',
        exercise: 'Calculate the mass of copper deposited when 5 A flows for 1 hour through Cu²⁺ solution.',
        durationMin: 20,
      },
      {
        slug: 'polymers-materials',
        title: 'Polymers & Materials',
        titleAr: 'البوليمرات والمواد',
        order: 4,
        conceptIntroduction: '- Polymers form by addition (chain) or condensation (step) polymerization.\n- Thermoplastics soften on heating; thermosets do not.\n- Crystallinity, Tg and Tm govern mechanical behaviour.',
        example: 'Nylon-6,6 forms by condensation of hexamethylenediamine and adipic acid, eliminating water.',
        keyFormulas: 'DP = M_polymer/M_monomer\nX_n = 1/(1−p) (Flory)\nTg < Tm\nσ = E·ε (elastic)',
        exercise: 'Classify PVC and Bakelite as thermoplastic or thermoset and explain the structural reason.',
        durationMin: 15,
      },
    ],
    questions: [
      { lessonSlug: 'atomic-structure-bonding', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A covalent bond is formed by:', explanation: 'Covalent bonds form by the sharing of electron pairs between atoms.', options: [ { text: 'Electron transfer', isCorrect: false }, { text: 'Electron sharing', isCorrect: true }, { text: 'Proton transfer', isCorrect: false }, { text: 'Ion attraction only', isCorrect: false } ] },
      { lessonSlug: 'atomic-structure-bonding', type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A large electronegativity difference (>1.7) favours ionic bonding.', explanation: 'Large ΔEN leads to electron transfer, characteristic of ionic bonds.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'chemical-thermodynamics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'If ΔH=−100 kJ, ΔS=+50 J/K, T=300 K, ΔG = ?', explanation: 'ΔG = ΔH − TΔS = −100 − 300×0.05 = −115 kJ.', options: [ { text: '−115 kJ', isCorrect: true }, { text: '+115 kJ', isCorrect: false }, { text: '−85 kJ', isCorrect: false }, { text: '+85 kJ', isCorrect: false } ] },
      { lessonSlug: 'chemical-thermodynamics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A reaction is spontaneous when:', explanation: 'Spontaneity requires ΔG < 0.', options: [ { text: 'ΔG < 0', isCorrect: true }, { text: 'ΔG > 0', isCorrect: false }, { text: 'ΔH > 0', isCorrect: false }, { text: 'ΔS < 0', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Hess’s law states that ΔH_rxn is independent of the reaction path.', explanation: 'Because enthalpy is a state function, total ΔH depends only on initial/final states.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'electrochemistry', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Standard cell Zn|Cu has E°=1.10 V. Find E at Q=0.01, n=2, 25°C.', explanation: 'E = E° − (0.0591/2)·log Q = 1.10 − 0.0296·(−2) ≈ 1.16 V.', options: [ { text: '0.50 V', isCorrect: false }, { text: '1.04 V', isCorrect: false }, { text: '1.16 V', isCorrect: true }, { text: '1.50 V', isCorrect: false } ] },
      { lessonSlug: 'electrochemistry', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Nernst equation relates cell potential to:', explanation: 'E = E° − (RT/nF)·ln Q shows how reactant/product concentrations (via Q) shift E.', options: [ { text: 'Temperature only', isCorrect: false }, { text: 'Pressure only', isCorrect: false }, { text: 'Reaction quotient Q', isCorrect: true }, { text: 'Volume only', isCorrect: false } ] },
      { lessonSlug: 'electrochemistry', type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'One Faraday equals approximately 96 485 coulombs per mole of electrons.', explanation: 'F = e·N_A ≈ 96 485 C/mol.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'polymers-materials', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Thermoplastics differ from thermosets because thermoplastics:', explanation: 'Thermoplastics can be repeatedly softened and reshaped; thermosets set permanently.', options: [ { text: 'Cannot be melted', isCorrect: false }, { text: 'Soften on reheating', isCorrect: true }, { text: 'Are always crystalline', isCorrect: false }, { text: 'Are always amorphous', isCorrect: false } ] },
      { lessonSlug: 'polymers-materials', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Nylon-6,6 is formed by which polymerization mechanism?', explanation: 'Nylon-6,6 forms by condensation of diamine + diacid, releasing water.', options: [ { text: 'Free-radical addition', isCorrect: false }, { text: 'Condensation', isCorrect: true }, { text: 'Ziegler-Natta coordination', isCorrect: false }, { text: 'Copolymerization only', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'A polymer with a higher degree of crystallinity generally has a higher tensile strength.', explanation: 'Crystalline regions pack chains tightly, increasing strength and stiffness.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Conceptual', stem: 'The glass transition temperature Tg marks the change from:', explanation: 'Below Tg a polymer is glassy and brittle; above Tg it becomes rubbery.', options: [ { text: 'Solid to gas', isCorrect: false }, { text: 'Glassy to rubbery', isCorrect: true }, { text: 'Crystalline to liquid', isCorrect: false }, { text: 'Liquid to solid', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'In the hydrogen atom, electron energy levels are given by E = −13.6/n² eV.', explanation: 'Bohr’s formula gives energy of level n as −13.6/n² eV.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 4. Thermodynamics
  // ----------------------------------------------------------
  {
    slug: 'thermodynamics',
    title: 'Thermodynamics',
    titleAr: 'الديناميكا الحرارية',
    description: 'Laws of thermodynamics, properties of pure substances, and analysis of power and refrigeration cycles.',
    icon: 'Thermometer',
    color: 'orange',
    order: 4,
    lessons: [
      {
        slug: 'first-law',
        title: 'First Law of Thermodynamics',
        titleAr: 'القانون الأول للديناميكا الحرارية',
        order: 1,
        conceptIntroduction: '- Energy conservation: `ΔU = Q − W` (closed system, sign convention W by system).\n- For an ideal gas, internal energy `U` depends only on temperature.\n- Enthalpy `H = U + pV`; for steady-flow, `Q̇ − Ẇ = ṁ·Δh`.',
        example: 'A gas expands doing 200 J of work while 500 J of heat is added. ΔU?\n`ΔU = 500 − 200 = 300 J`.',
        keyFormulas: 'ΔU = Q − W\nH = U + pV\nCp − Cv = R\nW = ∫p dV (reversible)',
        exercise: 'For an ideal gas heated at constant volume, find ΔU if 1 kJ of heat is added.',
        durationMin: 18,
      },
      {
        slug: 'second-law-entropy',
        title: 'Second Law & Entropy',
        titleAr: 'القانون الثاني والإنتروبيا',
        order: 2,
        conceptIntroduction: '- Heat flows spontaneously from hot to cold; never the reverse unaided.\n- Entropy change: `dS = δQ_rev/T`.\n- Carnot efficiency: `η = 1 − T_L/T_H`.',
        example: 'A Carnot engine between 600 K and 300 K. η?\n`η = 1 − 300/600 = 0.5` (50%).',
        keyFormulas: 'dS = δQ_rev/T\nη_Carnot = 1 − T_L/T_H\nCOP_R = T_L/(T_H−T_L)\nΔS_universe ≥ 0',
        exercise: 'Compute the COP of a refrigerator operating between 250 K and 300 K.',
        durationMin: 20,
      },
      {
        slug: 'pure-substances',
        title: 'Properties of Pure Substances',
        titleAr: 'خصائص المواد النقية',
        order: 3,
        conceptIntroduction: '- Phase-change region (saturation) connects compressed liquid to superheated vapour.\n- Quality `x = m_vapour/(m_total)` defines the mixture state.\n- Steam tables give `v, u, h, s` as functions of `T` or `p`.',
        example: 'A wet vapour has h = h_f + x·h_fg. If h_f=419 kJ/kg, h_fg=2257 kJ/kg, x=0.5 → h ≈ 1547 kJ/kg.',
        keyFormulas: 'x = m_v/m_total\nh = h_f + x·h_fg\nv = v_f + x·v_fg\np_sat = f(T)',
        exercise: 'Use steam tables to find the saturation temperature at p = 100 kPa.',
        durationMin: 16,
      },
      {
        slug: 'thermo-cycles',
        title: 'Thermodynamic Cycles',
        titleAr: 'الدورات الديناميكية الحرارية',
        order: 4,
        conceptIntroduction: '- Rankine cycle: pump → boiler → turbine → condenser (steam power).\n- Otto cycle: spark-ignition petrol engine; constant-volume heat addition.\n- Brayton cycle: gas turbine; constant-pressure heat addition.',
        example: 'Otto cycle with r=8, γ=1.4 → ideal η = 1 − 1/r^(γ−1) = 1 − 1/8^0.4 ≈ 0.565.',
        keyFormulas: 'η_Otto = 1 − 1/r^(γ−1)\nη_Diesel = 1 − (1/r^(γ−1))·(r_c^γ−1)/(γ(r_c−1))\nη_Rankine ≈ (W_turb − W_pump)/Q_in\nη_Brayton = 1 − 1/r_p^((γ−1)/γ)',
        exercise: 'Compute the ideal Otto cycle efficiency for compression ratio 10 (γ=1.4).',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'first-law', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The first law of thermodynamics is a statement of:', explanation: 'The first law is energy conservation: ΔU = Q − W for a closed system.', options: [ { text: 'Energy conservation', isCorrect: true }, { text: 'Entropy increase', isCorrect: false }, { text: 'Momentum conservation', isCorrect: false }, { text: 'Mass conservation', isCorrect: false } ] },
      { lessonSlug: 'first-law', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A gas does 200 J of work while 500 J of heat is added. ΔU?', explanation: 'ΔU = Q − W = 500 − 200 = 300 J.', options: [ { text: '100 J', isCorrect: false }, { text: '300 J', isCorrect: true }, { text: '500 J', isCorrect: false }, { text: '700 J', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'For an ideal gas, internal energy depends only on temperature.', explanation: 'Joule’s law: U(T) only, since intermolecular forces are negligible.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'second-law-entropy', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Carnot efficiency between 600 K and 300 K?', explanation: 'η = 1 − T_L/T_H = 1 − 300/600 = 0.5 (50%).', options: [ { text: '25%', isCorrect: false }, { text: '50%', isCorrect: true }, { text: '67%', isCorrect: false }, { text: '75%', isCorrect: false } ] },
      { lessonSlug: 'second-law-entropy', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'COP of a refrigerator between 250 K and 300 K?', explanation: 'COP_R = T_L/(T_H−T_L) = 250/50 = 5.', options: [ { text: '2', isCorrect: false }, { text: '5', isCorrect: true }, { text: '6', isCorrect: false }, { text: '0.5', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The total entropy of the universe tends to increase for any real process.', explanation: 'Second law: ΔS_universe ≥ 0, with equality only for reversible processes.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'pure-substances', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A wet vapour with h_f=419, h_fg=2257 kJ/kg, x=0.5. Enthalpy?', explanation: 'h = h_f + x·h_fg = 419 + 0.5·2257 ≈ 1547.5 kJ/kg.', options: [ { text: '1138 kJ/kg', isCorrect: false }, { text: '1547 kJ/kg', isCorrect: true }, { text: '2676 kJ/kg', isCorrect: false }, { text: '419 kJ/kg', isCorrect: false } ] },
      { lessonSlug: 'pure-substances', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Quality x is defined as:', explanation: 'x = m_vapour / m_total in a saturated liquid–vapour mixture.', options: [ { text: 'm_liquid/m_total', isCorrect: false }, { text: 'm_vapour/m_total', isCorrect: true }, { text: 'm_total/m_vapour', isCorrect: false }, { text: 'p_vapour/p_total', isCorrect: false } ] },
      { lessonSlug: 'thermo-cycles', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Ideal Otto efficiency at r=8, γ=1.4?', explanation: 'η = 1 − 1/r^(γ−1) = 1 − 1/8^0.4 ≈ 0.565 (56.5%).', options: [ { text: '42.6%', isCorrect: false }, { text: '56.5%', isCorrect: true }, { text: '65.0%', isCorrect: false }, { text: '75.0%', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Brayton cycle describes a:', explanation: 'Brayton (Joule) cycle models gas turbines with constant-pressure heat addition.', options: [ { text: 'Steam power plant', isCorrect: false }, { text: 'Gas turbine', isCorrect: true }, { text: 'Petrol engine', isCorrect: false }, { text: 'Refrigerator', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The Rankine cycle uses a pump, boiler, turbine and condenser.', explanation: 'These four components form the basic Rankine steam cycle.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'For fixed T_H and T_L, no engine can exceed the Carnot efficiency because:', explanation: 'Carnot is the reversible limit; any irreversibility lowers efficiency below η_Carnot.', options: [ { text: 'Carnot is the reversible limit', isCorrect: true }, { text: 'Friction is unavoidable', isCorrect: false }, { text: 'Heat losses dominate', isCorrect: false }, { text: 'Working fluid limits it', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Enthalpy is defined as H = U + pV.', explanation: 'H combines internal energy with the flow-work term pV.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 5. Fluid Mechanics
  // ----------------------------------------------------------
  {
    slug: 'fluid-mechanics',
    title: 'Fluid Mechanics',
    titleAr: 'ميكانيكا الموائع',
    description: 'Statics, kinematics, control-volume analysis and dimensional analysis of fluid flow.',
    icon: 'Waves',
    color: 'sky',
    order: 5,
    lessons: [
      {
        slug: 'fluid-statics',
        title: 'Fluid Properties & Statics',
        titleAr: 'خصائص الموائع والسكون',
        order: 1,
        conceptIntroduction: '- Pressure at depth: `p = p₀ + ρ·g·h`.\n- Buoyancy (Archimedes): `F_B = ρ·g·V_displaced`.\n- Continuum properties: density ρ, viscosity μ, surface tension σ.',
        example: 'Pressure at 10 m depth in water (ρ=1000, g=9.81)?\n`p = 0 + 1000·9.81·10 = 98 100 Pa`.',
        keyFormulas: 'p = p₀ + ρgh\nF_B = ρ·g·V\nRe = ρvD/μ\nμ_dyn = ν·ρ',
        exercise: 'Compute the buoyant force on a 0.01 m³ block fully submerged in water.',
        durationMin: 16,
      },
      {
        slug: 'fluid-kinematics',
        title: 'Fluid Kinematics',
        titleAr: 'كينماتيكا الموائع',
        order: 2,
        conceptIntroduction: '- Lagrangian vs Eulerian descriptions.\n- Material derivative: `Dφ/Dt = ∂φ/∂t + v·∇φ`.\n- Streamlines, pathlines and streaklines coincide in steady flow.',
        example: 'For velocity field u=2x, v=−2y, acceleration ax = u·∂u/∂x = 2x·2 = 4x.',
        keyFormulas: 'Dφ/Dt = ∂φ/∂t + v·∇φ\n∇·v = 0 (incompressible)\nStreamline: dx/u = dy/v',
        exercise: 'For u = 3x, v = −3y, find the acceleration component a_x at (1,1).',
        durationMin: 18,
      },
      {
        slug: 'control-volume',
        title: 'Control Volume Analysis',
        titleAr: 'تحليل حجم التحكم',
        order: 3,
        conceptIntroduction: '- Continuity (steady, incompressible): `A₁V₁ = A₂V₂`.\n- Bernoulli (ideal, incompressible): `p + ½ρV² + ρgz = const` along a streamline.\n- Momentum equation: `ΣF = ṁ·(V_out − V_in)`.',
        example: 'Water flows at 2 m/s through a 0.05 m² pipe contracting to 0.02 m². V₂?\n`V₂ = A₁V₁/A₂ = 0.05·2/0.02 = 5 m/s`.',
        keyFormulas: 'A₁V₁ = A₂V₂\np + ½ρV² + ρgz = const\nΣF = ṁ·ΔV\nP = ρgQH (pump)',
        exercise: 'Apply Bernoulli to find the pressure drop when water speeds up from 2 m/s to 5 m/s in a horizontal pipe.',
        durationMin: 20,
      },
      {
        slug: 'dimensional-analysis',
        title: 'Dimensional Analysis & Similitude',
        titleAr: 'التحليل البُعدي والمماثلة',
        order: 4,
        conceptIntroduction: '- Buckingham Pi theorem: k − n dimensionless groups.\n- Reynolds number `Re = ρvL/μ` governs viscous flows.\n- Dynamic similarity requires matching of all relevant π-groups.',
        example: 'A 1/10 ship model in a tow tank must match Froude number `Fr = v/√(gL)` to predict full-scale drag.',
        keyFormulas: 'Re = ρvL/μ\nFr = v/√(gL)\nMa = v/c\nWeber = ρv²L/σ',
        exercise: 'Compute Re for water (ρ=1000, μ=10⁻³) at v=1 m/s in a D=0.05 m pipe.',
        durationMin: 17,
      },
    ],
    questions: [
      { lessonSlug: 'fluid-statics', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Pressure at 10 m depth in water (ρ=1000, g=9.81)?', explanation: 'p = ρgh = 1000·9.81·10 = 98 100 Pa ≈ 98.1 kPa.', options: [ { text: '9.81 kPa', isCorrect: false }, { text: '98.1 kPa', isCorrect: true }, { text: '981 kPa', isCorrect: false }, { text: '9.81 MPa', isCorrect: false } ] },
      { lessonSlug: 'fluid-statics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Buoyant force on 0.01 m³ fully submerged in water (ρ=1000, g=9.81)?', explanation: 'F_B = ρgV = 1000·9.81·0.01 = 98.1 N.', options: [ { text: '9.81 N', isCorrect: false }, { text: '98.1 N', isCorrect: true }, { text: '981 N', isCorrect: false }, { text: '0.0981 N', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Reynolds number Re = ρvL/μ.', explanation: 'Re = inertial/viscous = ρvL/μ.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'control-volume', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A₁=0.05 m², V₁=2 m/s, A₂=0.02 m². V₂?', explanation: 'A₁V₁ = A₂V₂ ⇒ 0.05·2 = 0.02·V₂ ⇒ V₂ = 5 m/s.', options: [ { text: '2 m/s', isCorrect: false }, { text: '5 m/s', isCorrect: true }, { text: '8 m/s', isCorrect: false }, { text: '0.8 m/s', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Bernoulli pressure drop, water V₁=2, V₂=5 m/s, horizontal pipe, ρ=1000?', explanation: 'Δp = ½ρ(V₂²−V₁²) = 0.5·1000·(25−4) = 10 500 Pa.', options: [ { text: '2 100 Pa', isCorrect: false }, { text: '10 500 Pa', isCorrect: true }, { text: '21 000 Pa', isCorrect: false }, { text: '12 500 Pa', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Bernoulli’s equation assumes steady, incompressible, inviscid flow along a streamline.', explanation: 'These are the classical assumptions behind Bernoulli’s equation.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'The material derivative Dφ/Dt equals:', explanation: 'Dφ/Dt = ∂φ/∂t + v·∇φ combines local and convective rates of change.', options: [ { text: '∂φ/∂t only', isCorrect: false }, { text: 'v·∇φ only', isCorrect: false }, { text: '∂φ/∂t + v·∇φ', isCorrect: true }, { text: '∂φ/∂x only', isCorrect: false } ] },
      { lessonSlug: 'dimensional-analysis', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Re for water (ρ=1000, μ=10⁻³) at v=1 m/s, D=0.05 m?', explanation: 'Re = ρvD/μ = 1000·1·0.05/0.001 = 50 000.', options: [ { text: '50', isCorrect: false }, { text: '500', isCorrect: false }, { text: '50 000', isCorrect: true }, { text: '5 000 000', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Froude number Fr is given by:', explanation: 'Fr = v/√(gL) is the ratio of inertial to gravity forces.', options: [ { text: 'v/√(gL)', isCorrect: true }, { text: 'ρvL/μ', isCorrect: false }, { text: 'v/c', isCorrect: false }, { text: 'ρv²L/σ', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In steady flow, streamlines and pathlines coincide.', explanation: 'For steady flow the velocity field is time-invariant, so streamlines = pathlines = streaklines.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Kinematic viscosity ν is related to dynamic viscosity μ by:', explanation: 'ν = μ/ρ.', options: [ { text: 'ν = μ·ρ', isCorrect: false }, { text: 'ν = μ/ρ', isCorrect: true }, { text: 'ν = ρ/μ', isCorrect: false }, { text: 'ν = μ + ρ', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'Dynamic similarity between model and prototype requires:', explanation: 'Matching all relevant π-groups (Re, Fr, etc.) ensures dynamic similarity.', options: [ { text: 'Same material only', isCorrect: false }, { text: 'Same geometric scale only', isCorrect: false }, { text: 'Matching of all relevant dimensionless groups', isCorrect: true }, { text: 'Same velocity only', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The Buckingham Pi theorem states that k − n dimensionless groups can be formed from k variables involving n fundamental dimensions.', explanation: 'Yes: (k − n) independent Π groups span the dimensionless solution space.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 6. Mechanics of Materials
  // ----------------------------------------------------------
  {
    slug: 'mechanics-of-materials',
    title: 'Mechanics of Materials',
    titleAr: 'ميكانيكا المواد',
    description: 'Stress, strain, torsion, bending and stability of deformable bodies under load.',
    icon: 'Layers',
    color: 'violet',
    order: 6,
    lessons: [
      {
        slug: 'stress-strain',
        title: 'Stress & Strain',
        titleAr: 'الإجهاد والانفعال',
        order: 1,
        conceptIntroduction: '- Normal stress `σ = F/A`, normal strain `ε = ΔL/L`.\n- Hooke’s law (1-D): `σ = E·ε` with `E` Young’s modulus.\n- Lateral strain gives Poisson’s ratio `ν = −ε_lat/ε_axial`.',
        example: 'A steel rod (E=200 GPa) of L=1 m carries stress 100 MPa. Strain?\n`ε = σ/E = 100×10⁶/200×10⁹ = 5×10⁻⁴`. Elongation = 0.5 mm.',
        keyFormulas: 'σ = F/A\nε = ΔL/L\nσ = E·ε\nν = −ε_lat/ε_axial\nG = E/[2(1+ν)]',
        exercise: 'Compute lateral strain for ν=0.3 when axial strain = 0.001.',
        durationMin: 18,
      },
      {
        slug: 'torsion',
        title: 'Torsion of Circular Shafts',
        titleAr: 'اللي للمحاور الدائرية',
        order: 2,
        conceptIntroduction: '- Shear stress in a circular shaft: `τ = T·r/J`.\n- Polar moment `J = π·d⁴/32` for a solid shaft.\n- Angle of twist: `φ = T·L/(G·J)`.',
        example: 'A solid shaft d=50 mm, T=1 kN·m. J = π·0.05⁴/32 ≈ 6.14×10⁻⁷ m⁴. τ_max = T·r/J = 1000·0.025/6.14×10⁻⁷ ≈ 40.7 MPa.',
        keyFormulas: 'τ = T·r/J\nJ_solid = πd⁴/32\nφ = TL/(GJ)\nP = T·ω',
        exercise: 'Find the angle of twist for T=500 N·m, L=2 m, G=80 GPa, J=4×10⁻⁷ m⁴.',
        durationMin: 18,
      },
      {
        slug: 'beam-bending',
        title: 'Bending of Beams',
        titleAr: 'انحناء الكمرات',
        order: 3,
        conceptIntroduction: '- Flexure formula: `σ = M·c/I` (Euler–Bernoulli beam).\n- For a rectangular section `I = b·h³/12`.\n- Shear in beams: `τ = V·Q/(I·b)`.',
        example: 'A beam (b=50 mm, h=100 mm) takes M=2 kN·m. I = 50·100³/12 ≈ 4.17×10⁻⁶ m⁴. σ_max = M·c/I = 2000·0.05/4.17×10⁻⁶ ≈ 24 MPa.',
        keyFormulas: 'σ = M·c/I\nI_rect = bh³/12\nτ = V·Q/(I·b)\nEI·d²y/dx² = M(x)',
        exercise: 'A simply supported beam of span L carries central load P. Find the max bending moment.',
        durationMin: 20,
      },
      {
        slug: 'combined-loads-buckling',
        title: 'Combined Loads & Buckling',
        titleAr: 'الأحمال المركبة والانبعاج',
        order: 4,
        conceptIntroduction: '- Principal stresses from Mohr’s circle.\n- Combined stresses via superposition.\n- Euler buckling load: `P_cr = π²·E·I/L²` for a pinned–pinned column.',
        example: 'Column L=3 m, E=200 GPa, I=4×10⁻⁶ m⁴ → P_cr = π²·200×10⁹·4×10⁻⁶/9 ≈ 877 kN.',
        keyFormulas: 'σ_1,2 = (σx+σy)/2 ± √[((σx−σy)/2)² + τxy²]\nR = √[((σx−σy)/2)² + τxy²]\nP_cr = π²EI/L²\nσ_cr = π²E/(L/k)²',
        exercise: 'Compute the Euler buckling load for a column with E=70 GPa, I=2×10⁻⁶ m⁴, L=2.5 m.',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'stress-strain', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Normal stress σ is defined as:', explanation: 'σ = F/A — force per unit area normal to the section.', options: [ { text: 'F/A', isCorrect: true }, { text: 'A/F', isCorrect: false }, { text: 'F·A', isCorrect: false }, { text: 'F·L', isCorrect: false } ] },
      { lessonSlug: 'stress-strain', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Steel rod, E=200 GPa, σ=100 MPa. Strain?', explanation: 'ε = σ/E = 100×10⁶/200×10⁹ = 5×10⁻⁴.', options: [ { text: '5×10⁻⁴', isCorrect: true }, { text: '5×10⁻³', isCorrect: false }, { text: '2×10⁻⁴', isCorrect: false }, { text: '5×10⁻⁶', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Hooke’s law in one dimension states σ = E·ε.', explanation: 'Within the elastic limit, stress is proportional to strain with constant E.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'torsion', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Solid shaft d=50 mm, T=1 kN·m. τ_max? (J=πd⁴/32)', explanation: 'J ≈ 6.14×10⁻⁷ m⁴, τ = T·r/J = 1000·0.025/6.14×10⁻⁷ ≈ 40.7 MPa.', options: [ { text: '10.2 MPa', isCorrect: false }, { text: '20.4 MPa', isCorrect: false }, { text: '40.7 MPa', isCorrect: true }, { text: '81.5 MPa', isCorrect: false } ] },
      { lessonSlug: 'torsion', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Polar moment of a solid circular shaft is:', explanation: 'J = πd⁴/32 for a solid shaft.', options: [ { text: 'πd⁴/32', isCorrect: true }, { text: 'πd⁴/64', isCorrect: false }, { text: 'πd³/16', isCorrect: false }, { text: 'πd²/4', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The angle of twist in a shaft is directly proportional to its length L.', explanation: 'φ = TL/(GJ) is linear in L for fixed T, G, J.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'beam-bending', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Beam b=50, h=100 mm, M=2 kN·m. σ_max? (I=bh³/12)', explanation: 'I ≈ 4.17×10⁻⁶ m⁴, σ = M·c/I = 2000·0.05/4.17×10⁻⁶ ≈ 24 MPa.', options: [ { text: '12 MPa', isCorrect: false }, { text: '24 MPa', isCorrect: true }, { text: '48 MPa', isCorrect: false }, { text: '6 MPa', isCorrect: false } ] },
      { lessonSlug: 'beam-bending', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The flexure formula for beam stress is:', explanation: 'σ = M·c/I relates bending moment to extreme-fibre stress.', options: [ { text: 'σ = M·c/I', isCorrect: true }, { text: 'σ = V·Q/(I·b)', isCorrect: false }, { text: 'σ = T·r/J', isCorrect: false }, { text: 'σ = F/A', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In Euler–Bernoulli beam theory, plane sections remain plane and normal to the neutral axis after bending.', explanation: 'This is the fundamental kinematic assumption of Euler–Bernoulli theory.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'combined-loads-buckling', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Euler load, E=200 GPa, I=4×10⁻⁶ m⁴, L=3 m (pinned–pinned)?', explanation: 'P_cr = π²EI/L² = π²·200×10⁹·4×10⁻⁶/9 ≈ 877 kN.', options: [ { text: '87.7 kN', isCorrect: false }, { text: '438 kN', isCorrect: false }, { text: '877 kN', isCorrect: true }, { text: '1754 kN', isCorrect: false } ] },
      { lessonSlug: 'combined-loads-buckling', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Euler buckling load for a pinned–pinned column is:', explanation: 'P_cr = π²EI/L² for the pinned–pinned end-condition.', options: [ { text: 'P_cr = π²EI/L²', isCorrect: true }, { text: 'P_cr = π²EI/(4L²)', isCorrect: false }, { text: 'P_cr = 2π²EI/L²', isCorrect: false }, { text: 'P_cr = EI/L²', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Poisson’s ratio ν = −ε_lateral/ε_axial.', explanation: 'The negative sign captures the fact that axial tension causes lateral contraction.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'On Mohr’s circle, the radius equals:', explanation: 'R = √[((σx−σy)/2)² + τxy²] = max in-plane shear stress.', options: [ { text: '(σx+σy)/2', isCorrect: false }, { text: '√[((σx−σy)/2)² + τxy²]', isCorrect: true }, { text: 'σx·σy', isCorrect: false }, { text: 'τxy only', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 7. Engineering Mechanics (Statics & Dynamics)
  // ----------------------------------------------------------
  {
    slug: 'engineering-mechanics',
    title: 'Engineering Mechanics (Statics & Dynamics)',
    titleAr: 'الميكانيكا الهندسية (السكون والحركة)',
    description: 'Equilibrium of forces, particle and rigid-body dynamics, and work–energy methods.',
    icon: 'Move3d',
    color: 'teal',
    order: 7,
    lessons: [
      {
        slug: 'statics-equilibrium',
        title: 'Statics & Equilibrium',
        titleAr: 'السكون والتوازن',
        order: 1,
        conceptIntroduction: '- Equilibrium requires `ΣF = 0` and `ΣM = 0`.\n- Free-body diagrams isolate the body and show all external forces.\n- Friction: `f ≤ μ_s·N` (static) and `f_k = μ_k·N` (kinetic).',
        example: 'A 10 kg box on a horizontal surface (μ_s=0.3). Max static friction?\n`f_max = μ_s·N = 0.3·10·9.81 = 29.4 N`.',
        keyFormulas: 'ΣF = 0, ΣM = 0\nf_s ≤ μ_s·N\nf_k = μ_k·N\nM = F·d',
        exercise: 'A ladder leans against a smooth wall; draw the FBD and solve for the wall reaction.',
        durationMin: 18,
      },
      {
        slug: 'particle-dynamics',
        title: 'Particle Dynamics',
        titleAr: 'ديناميكا الجسيم',
        order: 2,
        conceptIntroduction: '- Newton’s second law `F = m·a` for a particle.\n- Rectilinear motion with constant a: `v² = u² + 2as`.\n- Projectile range (level ground): `R = v₀²·sin(2θ)/g`.',
        example: 'Projectile at 20 m/s, 45°: R = 400·1/9.81 ≈ 40.8 m.',
        keyFormulas: 'F = ma\nv² = u² + 2as\nR = v₀²·sin(2θ)/g\nH = v₀²·sin²θ/(2g)',
        exercise: 'Find the launch angle that maximises range on level ground (neglecting air drag).',
        durationMin: 16,
      },
      {
        slug: 'rigid-body-dynamics',
        title: 'Rigid Body Dynamics',
        titleAr: 'ديناميكا الجسم الصلب',
        order: 3,
        conceptIntroduction: '- Angular momentum: `H = I·ω`.\n- Moment of inertia of a body about axis through CM: tabulated; parallel-axis theorem `I = I_cm + m·d²`.\n- Rotational analogue of Newton II: `ΣM = I·α`.',
        example: 'A solid cylinder (m=5 kg, r=0.2 m) about its central axis: I = ½·5·0.04 = 0.1 kg·m².',
        keyFormulas: 'ΣM = I·α\nH = I·ω\nI = I_cm + m·d²\nKE_rot = ½I·ω²',
        exercise: 'Use the parallel-axis theorem to find I of a rod about one end (I_cm = mL²/12).',
        durationMin: 20,
      },
      {
        slug: 'work-energy-impulse',
        title: 'Work-Energy & Impulse-Momentum',
        titleAr: 'الشغل-الطاقة والاندفاع-الزخم',
        order: 4,
        conceptIntroduction: '- Work–energy theorem: `W = ΔKE = ½m·v² − ½m·u²`.\n- Impulse–momentum: `J = ∫F dt = Δp`.\n- Conservation of (linear) momentum in absence of external forces.',
        example: 'A 0.15 kg ball at 40 m/s struck back at 30 m/s. Impulse? `J = m·Δv = 0.15·(−30−40) = −10.5 N·s`.',
        keyFormulas: 'W = ΔKE\nKE = ½mv²\nJ = Δp = m·Δv\np = m·v',
        exercise: 'A 2 kg block sliding at 4 m/s is stopped by friction (μ_k=0.2). Find the stopping distance.',
        durationMin: 18,
      },
    ],
    questions: [
      { lessonSlug: 'statics-equilibrium', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'For a body in static equilibrium:', explanation: 'Both ΣF = 0 and ΣM = 0 must hold for static equilibrium.', options: [ { text: 'ΣF = 0 only', isCorrect: false }, { text: 'ΣM = 0 only', isCorrect: false }, { text: 'ΣF = 0 and ΣM = 0', isCorrect: true }, { text: 'ΣF = ΣM', isCorrect: false } ] },
      { lessonSlug: 'statics-equilibrium', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 10 kg box, μ_s=0.3, on horizontal floor. Max static friction?', explanation: 'f_max = μ_s·N = 0.3·10·9.81 = 29.4 N.', options: [ { text: '9.81 N', isCorrect: false }, { text: '29.4 N', isCorrect: true }, { text: '98.1 N', isCorrect: false }, { text: '3 N', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A free-body diagram shows all forces acting on an isolated body.', explanation: 'FBDs isolate the body and display every external force and moment acting on it.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'particle-dynamics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Projectile range at v₀=20 m/s, θ=45°, g=9.81?', explanation: 'R = v₀²·sin(2θ)/g = 400·1/9.81 ≈ 40.8 m.', options: [ { text: '20.4 m', isCorrect: false }, { text: '40.8 m', isCorrect: true }, { text: '81.6 m', isCorrect: false }, { text: '10.2 m', isCorrect: false } ] },
      { lessonSlug: 'particle-dynamics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'On level ground (no air drag), the launch angle that maximises range is:', explanation: 'Range ∝ sin(2θ), maximised when 2θ = 90° → θ = 45°.', options: [ { text: '30°', isCorrect: false }, { text: '45°', isCorrect: true }, { text: '60°', isCorrect: false }, { text: '90°', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Newton’s second law for a particle is F = m·a.', explanation: 'Net force equals mass times acceleration.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'rigid-body-dynamics', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Solid cylinder m=5 kg, r=0.2 m about its central axis. I?', explanation: 'I = ½m·r² = ½·5·0.04 = 0.1 kg·m².', options: [ { text: '0.05 kg·m²', isCorrect: false }, { text: '0.10 kg·m²', isCorrect: true }, { text: '0.20 kg·m²', isCorrect: false }, { text: '1.00 kg·m²', isCorrect: false } ] },
      { lessonSlug: 'rigid-body-dynamics', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The parallel-axis theorem states:', explanation: 'I = I_cm + m·d² gives I about an axis parallel to a centroidal axis a distance d away.', options: [ { text: 'I = I_cm + m·d²', isCorrect: true }, { text: 'I = I_cm − m·d²', isCorrect: false }, { text: 'I = I_cm·d²', isCorrect: false }, { text: 'I = m·d²', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The rotational analogue of Newton’s second law is ΣM = I·α.', explanation: 'Net torque equals moment of inertia times angular acceleration.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'work-energy-impulse', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 0.15 kg ball at 40 m/s struck back at 30 m/s. Magnitude of impulse?', explanation: '|J| = m·|Δv| = 0.15·70 = 10.5 N·s.', options: [ { text: '1.5 N·s', isCorrect: false }, { text: '6.0 N·s', isCorrect: false }, { text: '10.5 N·s', isCorrect: true }, { text: '15.0 N·s', isCorrect: false } ] },
      { lessonSlug: 'work-energy-impulse', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The work–energy theorem states:', explanation: 'W_net = ΔKE — the net work equals the change in kinetic energy.', options: [ { text: 'W = ΔKE', isCorrect: true }, { text: 'W = Δp', isCorrect: false }, { text: 'W = F·t', isCorrect: false }, { text: 'W = m·v', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Linear momentum is conserved when the net external force on a system is zero.', explanation: 'With no external impulse, total linear momentum is constant.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 2 kg block at 4 m/s stopped by μ_k=0.2 on a horizontal surface. Stopping distance?', explanation: '½mv² = μ_k·m·g·d ⇒ d = v²/(2·μ_k·g) = 16/(2·0.2·9.81) ≈ 4.08 m.', options: [ { text: '2.04 m', isCorrect: false }, { text: '4.08 m', isCorrect: true }, { text: '8.16 m', isCorrect: false }, { text: '1.02 m', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 8. Electrical Circuits
  // ----------------------------------------------------------
  {
    slug: 'electrical-circuits',
    title: 'Electrical Circuits',
    titleAr: 'الدوائر الكهربائية',
    description: 'DC and AC circuit analysis, network theorems and transient response of first-order circuits.',
    icon: 'Zap',
    color: 'amber',
    order: 8,
    lessons: [
      {
        slug: 'dc-circuits',
        title: 'DC Circuit Analysis',
        titleAr: 'تحليل الدوائر المستمرة',
        order: 1,
        conceptIntroduction: '- Ohm’s law: `V = I·R`.\n- Kirchhoff’s voltage law (KVL): ΣV around a loop = 0.\n- Kirchhoff’s current law (KCL): ΣI at a node = 0.\n- Series resistors: `R = R₁ + R₂`; parallel: `1/R = 1/R₁ + 1/R₂`.',
        example: '12 V across two series resistors 4 Ω and 2 Ω. Current?\n`I = 12/6 = 2 A`.',
        keyFormulas: 'V = IR\nKVL: ΣV_loop = 0\nKCL: ΣI_node = 0\nR_series = ΣRᵢ\nR_parallel = (1/R₁+1/R₂)⁻¹',
        exercise: 'Find the equivalent resistance of 6 Ω and 3 Ω in parallel.',
        durationMin: 18,
      },
      {
        slug: 'network-theorems',
        title: 'Network Theorems',
        titleAr: 'نظريات الشبكات',
        order: 2,
        conceptIntroduction: '- Thevenin: any linear two-terminal network = V_th in series with R_th.\n- Norton: same network = I_N in parallel with R_N (= R_th).\n- Superposition: response = sum of responses to sources taken one at a time.',
        example: 'A 10 V source with internal 2 Ω drives a 3 Ω load. V_load = 10·3/(2+3) = 6 V.',
        keyFormulas: 'V_th = V_open\nR_th = V_th/I_sc\nI_N = I_sc\nR_N = R_th',
        exercise: 'Find the Thevenin equivalent of a 12 V source in series with 4 Ω and 6 Ω across the 6 Ω terminals.',
        durationMin: 20,
      },
      {
        slug: 'ac-steady-state',
        title: 'AC Steady-State Analysis',
        titleAr: 'تحليل التيار المتردد المستقر',
        order: 3,
        conceptIntroduction: '- Sinusoidal source: `v(t) = V_m·cos(ωt + φ)`, phasor `V = V_m∠φ`.\n- Impedance: `Z_R = R`, `Z_L = jωL`, `Z_C = 1/(jωC)`.\n- RMS value of a sinusoid: `V_rms = V_m/√2`.',
        example: 'A 100∠0 V source drives Z = 8 + j6 Ω. I = V/Z = 100/10∠36.9° = 10∠−36.9° A.',
        keyFormulas: 'Z_R = R; Z_L = jωL; Z_C = 1/(jωC)\n|Z| = √(R²+X²)\nV_rms = V_m/√2\nP = V_rms·I_rms·cos φ',
        exercise: 'Compute the rms current for a 230 V (rms) source driving a 10 Ω resistor.',
        durationMin: 18,
      },
      {
        slug: 'transients',
        title: 'Transients in First-Order Circuits',
        titleAr: 'الاستجابات العابرة',
        order: 4,
        conceptIntroduction: '- RC charging: `v_C(t) = V·(1 − e^(−t/τ))`, τ = RC.\n- RL de-energising: `i_L(t) = I₀·e^(−t/τ)`, τ = L/R.\n- The time constant τ governs the rate of exponential approach to steady state.',
        example: 'RC with R=1 kΩ, C=1 μF → τ = 1 ms. After 1 ms, v_C reaches 63.2% of V.',
        keyFormulas: 'τ_RC = RC\nτ_RL = L/R\nv_C(t) = V(1 − e^(−t/τ))\ni_L(t) = I₀·e^(−t/τ)',
        exercise: 'Find v_C at t=2 ms for V=10 V, R=1 kΩ, C=1 μF.',
        durationMin: 17,
      },
    ],
    questions: [
      { lessonSlug: 'dc-circuits', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Ohm’s law is:', explanation: 'V = I·R relates voltage, current and resistance.', options: [ { text: 'V = IR', isCorrect: true }, { text: 'P = VI', isCorrect: false }, { text: 'V = I/R', isCorrect: false }, { text: 'V = R/I', isCorrect: false } ] },
      { lessonSlug: 'dc-circuits', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: '12 V source across 4 Ω and 2 Ω in series. Current?', explanation: 'R_total = 6 Ω ⇒ I = 12/6 = 2 A.', options: [ { text: '1 A', isCorrect: false }, { text: '2 A', isCorrect: true }, { text: '3 A', isCorrect: false }, { text: '6 A', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'KCL states the algebraic sum of currents entering a node is zero.', explanation: 'KCL expresses charge conservation at a node.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'dc-circuits', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Two resistors 6 Ω and 3 Ω in parallel. R_eq?', explanation: 'R_eq = 6·3/(6+3) = 18/9 = 2 Ω.', options: [ { text: '2 Ω', isCorrect: true }, { text: '3 Ω', isCorrect: false }, { text: '9 Ω', isCorrect: false }, { text: '0.5 Ω', isCorrect: false } ] },
      { lessonSlug: 'network-theorems', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The Thevenin equivalent of a linear two-terminal network is:', explanation: 'A voltage source V_th in series with a resistor R_th.', options: [ { text: 'V_th in series with R_th', isCorrect: true }, { text: 'I_N in parallel with R_N', isCorrect: false }, { text: 'A single resistor', isCorrect: false }, { text: 'Two sources in series', isCorrect: false } ] },
      { lessonSlug: 'network-theorems', type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Superposition allows linear circuits’ responses to be summed when sources are applied one at a time.', explanation: 'Linearity guarantees response additivity.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'V=100∠0 V, Z=8+j6 Ω. |I|?', explanation: '|Z|=10, |I| = |V|/|Z| = 10 A.', options: [ { text: '5 A', isCorrect: false }, { text: '10 A', isCorrect: true }, { text: '12 A', isCorrect: false }, { text: '100 A', isCorrect: false } ] },
      { lessonSlug: 'ac-steady-state', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The impedance of an inductor is:', explanation: 'Z_L = jωL — purely inductive (positive imaginary).', options: [ { text: 'jωL', isCorrect: true }, { text: '1/(jωC)', isCorrect: false }, { text: 'R', isCorrect: false }, { text: 'ωL', isCorrect: false } ] },
      { lessonSlug: 'ac-steady-state', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'V_m = 170 V (peak). V_rms?', explanation: 'V_rms = V_m/√2 = 170/1.414 ≈ 120 V.', options: [ { text: '85 V', isCorrect: false }, { text: '120 V', isCorrect: true }, { text: '170 V', isCorrect: false }, { text: '240 V', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The RMS value of a sinusoid equals its peak divided by √2.', explanation: 'V_rms = V_m/√2 for a pure sinusoid.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'transients', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'R=1 kΩ, C=1 μF. Time constant τ?', explanation: 'τ = RC = 1000·10⁻⁶ = 1 ms.', options: [ { text: '1 μs', isCorrect: false }, { text: '1 ms', isCorrect: true }, { text: '10 ms', isCorrect: false }, { text: '1 s', isCorrect: false } ] },
      { lessonSlug: 'transients', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'RC, V=10 V, τ=1 ms. v_C at t=1 ms (one τ)?', explanation: 'v_C = V(1 − e⁻¹) ≈ 10·0.632 = 6.32 V.', options: [ { text: '3.68 V', isCorrect: false }, { text: '6.32 V', isCorrect: true }, { text: '8.65 V', isCorrect: false }, { text: '10.0 V', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The time constant of an RL circuit is τ = L/R.', explanation: 'τ = L/R sets the rate of exponential decay for RL circuits.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 9. Electronics
  // ----------------------------------------------------------
  {
    slug: 'electronics',
    title: 'Electronics',
    titleAr: 'الإلكترونيات',
    description: 'Semiconductor devices, operational amplifiers, small-signal models and feedback oscillator circuits.',
    icon: 'Cpu',
    color: 'fuchsia',
    order: 9,
    lessons: [
      {
        slug: 'semiconductor-devices',
        title: 'Semiconductor Devices',
        titleAr: 'أشباه الموصلات',
        order: 1,
        conceptIntroduction: '- Diode I–V (Shockley): `I = I_s·(e^(qV/kT) − 1)`.\n- BJT in active mode: `I_C = β·I_B`.\n- MOSFET (saturation): `I_D = ½·k·(V_GS − V_th)²`.',
        example: 'Diode at V=0.7 V, I_s=10⁻¹² A, nT≈26 mV → I ≈ 10⁻¹²·(e^(0.7/0.026) − 1) ≈ 0.5 mA.',
        keyFormulas: 'I = I_s(e^(qV/ηkT) − 1)\nI_C = β·I_B\nI_D = ½k(V_GS − V_th)²\nkT/q ≈ 26 mV',
        exercise: 'Estimate the saturation current of a MOSFET with k=0.5 mA/V², V_GS=3 V, V_th=1 V.',
        durationMin: 20,
      },
      {
        slug: 'op-amps',
        title: 'Operational Amplifiers',
        titleAr: 'المكبرات التشغيلية',
        order: 2,
        conceptIntroduction: '- Ideal op-amp: infinite gain, infinite input impedance, zero output impedance.\n- Virtual short: V₊ = V₋ (negative feedback).\n- Inverting gain: `A_v = −R_f/R_in`; non-inverting: `A_v = 1 + R_f/R_in`.',
        example: 'Inverting amp with R_f=100 kΩ, R_in=10 kΩ → A_v = −10.',
        keyFormulas: 'A_v(inv) = −R_f/R_in\nA_v(non-inv) = 1 + R_f/R_in\nV₊ = V₋ (virtual short)\nI_in = 0',
        exercise: 'Design a non-inverting amplifier with gain 11, choosing R_f and R_in.',
        durationMin: 18,
      },
      {
        slug: 'small-signal-analysis',
        title: 'Small-Signal Analysis',
        titleAr: 'تحليل الإشارة الصغيرة',
        order: 3,
        conceptIntroduction: '- Linearise the device about a DC operating (Q) point.\n- BJT hybrid-π: r_π = β·V_T/I_C, g_m = I_C/V_T.\n- Midband small-signal models ignore coupling/bypass capacitors and internal capacitances.',
        example: 'BJT at I_C=1 mA → g_m = 1 mA/26 mV ≈ 0.0385 S, r_π (β=100) ≈ 2.6 kΩ.',
        keyFormulas: 'g_m = I_C/V_T\nr_π = β/g_m\nr_o = V_A/I_C\nA_v = −g_m·R_C',
        exercise: 'Compute r_π for a BJT at I_C=2 mA, β=120.',
        durationMin: 20,
      },
      {
        slug: 'feedback-oscillators',
        title: 'Feedback & Oscillators',
        titleAr: 'التغذية الراجعة والمذبذبات',
        order: 4,
        conceptIntroduction: '- Barkhausen: loop gain |Aβ| = 1 and phase(Aβ) = 0° (or 360°).\n- Wien-bridge oscillator frequency: `f = 1/(2πRC)`.\n- Positive feedback sustains oscillation; negative feedback stabilises gain.',
        example: 'Wien-bridge with R=10 kΩ, C=10 nF → f = 1/(2π·10⁴·10⁻⁸) ≈ 1.59 kHz.',
        keyFormulas: 'Barkhausen: |Aβ|=1, ∠Aβ=0°\nf_Wien = 1/(2πRC)\nA = A/(1+Aβ) (negative feedback)\nσ from noise ⇒ sustained oscillation',
        exercise: 'Find C needed for a Wien-bridge to oscillate at 1 kHz with R=16 kΩ.',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'semiconductor-devices', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'In a forward-biased silicon diode the typical voltage drop is about:', explanation: 'Silicon diodes drop ≈ 0.6–0.7 V in forward conduction.', options: [ { text: '0.2 V', isCorrect: false }, { text: '0.7 V', isCorrect: true }, { text: '1.5 V', isCorrect: false }, { text: '3.3 V', isCorrect: false } ] },
      { lessonSlug: 'semiconductor-devices', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Definitional', stem: 'The Shockley diode equation is:', explanation: 'I = I_s·(e^(qV/ηkT) − 1) describes the diode I–V curve.', options: [ { text: 'I = I_s·(e^(qV/ηkT) − 1)', isCorrect: true }, { text: 'I = V/R', isCorrect: false }, { text: 'I = I_s·V', isCorrect: false }, { text: 'I = β·I_B', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'In a BJT active region, I_C = β·I_B.', explanation: 'Active-mode collector current equals beta times base current.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'op-amps', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Inverting op-amp with R_f=100 kΩ, R_in=10 kΩ. Gain?', explanation: 'A_v = −R_f/R_in = −10.', options: [ { text: '−1', isCorrect: false }, { text: '−10', isCorrect: true }, { text: '+10', isCorrect: false }, { text: '+100', isCorrect: false } ] },
      { lessonSlug: 'op-amps', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Non-inverting op-amp, R_f=10 kΩ, R_in=1 kΩ. Gain?', explanation: 'A_v = 1 + R_f/R_in = 1 + 10 = 11.', options: [ { text: '1', isCorrect: false }, { text: '11', isCorrect: true }, { text: '10', isCorrect: false }, { text: '21', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In an ideal op-amp with negative feedback, the input terminals are at the same voltage (virtual short).', explanation: 'The huge open-loop gain plus negative feedback forces V₊ ≈ V₋.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'small-signal-analysis', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'BJT I_C=1 mA, β=100. r_π? (V_T=26 mV)', explanation: 'g_m = I_C/V_T ≈ 0.0385 S, r_π = β/g_m = 100/0.0385 ≈ 2.6 kΩ.', options: [ { text: '260 Ω', isCorrect: false }, { text: '2.6 kΩ', isCorrect: true }, { text: '26 kΩ', isCorrect: false }, { text: '1.0 kΩ', isCorrect: false } ] },
      { lessonSlug: 'small-signal-analysis', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The transconductance g_m of a BJT equals:', explanation: 'g_m = I_C/V_T at the operating point.', options: [ { text: 'g_m = I_C/V_T', isCorrect: true }, { text: 'g_m = β·I_B', isCorrect: false }, { text: 'g_m = V_T/I_C', isCorrect: false }, { text: 'g_m = I_C·V_T', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Small-signal analysis linearises a nonlinear device about its DC operating (Q) point.', explanation: 'The Taylor expansion about Q keeps only the first-order (linear) term.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'feedback-oscillators', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Barkhausen criterion for oscillation requires:', explanation: 'Loop gain |Aβ|=1 and ∠Aβ = 0° (or 360°).', options: [ { text: '|Aβ|=1, ∠Aβ=0°', isCorrect: true }, { text: '|Aβ|=0', isCorrect: false }, { text: '|Aβ|≫1', isCorrect: false }, { text: '∠Aβ=90°', isCorrect: false } ] },
      { lessonSlug: 'feedback-oscillators', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Wien-bridge, R=10 kΩ, C=10 nF. Frequency?', explanation: 'f = 1/(2πRC) = 1/(2π·10⁴·10⁻⁸) ≈ 1591 Hz ≈ 1.59 kHz.', options: [ { text: '159 Hz', isCorrect: false }, { text: '1.59 kHz', isCorrect: true }, { text: '15.9 kHz', isCorrect: false }, { text: '159 kHz', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'Negative feedback in an amplifier primarily:', explanation: 'It trades gain for linearity, bandwidth and stability.', options: [ { text: 'Increases gain indefinitely', isCorrect: false }, { text: 'Improves stability and linearity at the cost of gain', isCorrect: true }, { text: 'Eliminates all noise', isCorrect: false }, { text: 'Adds distortion', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'An ideal op-amp has infinite input impedance and zero output impedance.', explanation: 'These idealisations force input currents to zero and the output to drive any load.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 10. Digital Logic Design
  // ----------------------------------------------------------
  {
    slug: 'digital-logic-design',
    title: 'Digital Logic Design',
    titleAr: 'تصميم المنطق الرقمي',
    description: 'Boolean algebra, combinational and sequential logic, finite-state machines and memory.',
    icon: 'Binary',
    color: 'indigo',
    order: 10,
    lessons: [
      {
        slug: 'boolean-algebra',
        title: 'Boolean Algebra & Logic Gates',
        titleAr: 'الجبر البولياني والبوابات المنطقية',
        order: 1,
        conceptIntroduction: '- De Morgan: `!(A·B) = !A + !B` and `!(A+B) = !A·!B`.\n- NAND and NOR are functionally complete (universal) gates.\n- Sum-of-products (SOP) and product-of-sums (POS) canonical forms.',
        example: 'Simplify `A·B + A·!B`. `A·(B+!B) = A·1 = A`.',
        keyFormulas: 'A+1=1, A+0=A, A·A=A\nA·(B+C) = AB+AC\n!(A·B)=!A+!B\nNAND complete: NOT = NAND(A,A)',
        exercise: 'Implement XOR using only NAND gates.',
        durationMin: 18,
      },
      {
        slug: 'combinational-logic',
        title: 'Combinational Logic',
        titleAr: 'المنطق التركيبي',
        order: 2,
        conceptIntroduction: '- Karnaugh maps reduce 3/4-variable functions to minimal SOP.\n- Adders: half adder (S=A⊕B, C=A·B); full adder adds carry-in.\n- Multiplexer selects one of 2ⁿ inputs by n select lines; decoder does the reverse.',
        example: 'Full adder sum: S = A⊕B⊕C_in; carry: C_out = (A·B) + C_in·(A⊕B).',
        keyFormulas: 'Half: S=A⊕B, C=A·B\nFull: S=A⊕B⊕Cin, Cout=AB+Cin(A⊕B)\nMUX: Y = Σ m_i·(select code i)\nDeMorgan: !A·!B = !(A+B)',
        exercise: 'Use a 4-variable K-map to minimise the function F=Σm(0,2,5,7,8,10,13,15).',
        durationMin: 20,
      },
      {
        slug: 'sequential-logic',
        title: 'Sequential Logic',
        titleAr: 'المنطق التسلسلي',
        order: 3,
        conceptIntroduction: '- Flip-flops (SR, JK, D, T) store one bit; D-FF is edge-triggered.\n- Registers store n-bit data; counters advance through a state sequence.\n- Asynchronous (ripple) counters cascade FFs; synchronous counters use a common clock.\n- Setup/hold times constrain the clock relative to data.',
        example: '4-bit ripple up-counter: counts 0→15 and wraps. Mod-n counter resets at n.',
        keyFormulas: 'D-FF: Q_next = D\nT-FF: Q_next = Q ⊕ T\nJK: 11 ⇒ toggle\nf_max ≈ 1/(t_pd + t_setup)',
        exercise: 'Design a mod-10 (decade) counter using D flip-flops.',
        durationMin: 22,
      },
      {
        slug: 'state-machines-memories',
        title: 'State Machines & Memory',
        titleAr: 'آلات الحالة والذاكرة',
        order: 4,
        conceptIntroduction: '- Mealy FSM: output depends on state and input; Moore: output depends on state only.\n- State diagram → state table → next-state/output logic (K-map minimise).\n- Memory hierarchy: ROM (combinational), SRAM (fast, volatile), DRAM (dense, refresh).',
        example: 'A 3-state Moore sequence detector for "101": states S0,S1,S2; output=1 only in S2.',
        keyFormulas: '#FF = ⌈log2 #states⌉\nMealy: y=f(s,x)\nMoore: y=f(s)\nSRAM cell: 6T; DRAM cell: 1T1C',
        exercise: 'Design a Mealy FSM that detects the sequence "1101" overlapping.',
        durationMin: 20,
      },
    ],
    questions: [
      { lessonSlug: 'boolean-algebra', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Simplify A·B + A·!B.', explanation: 'Factor: A·(B+!B) = A·1 = A.', options: [ { text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }, { text: 'A·B', isCorrect: false }, { text: '!A', isCorrect: false } ] },
      { lessonSlug: 'boolean-algebra', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'De Morgan’s law states !(A·B) = ?', explanation: 'The complement of a product equals the sum of complements.', options: [ { text: '!A·!B', isCorrect: false }, { text: '!A+!B', isCorrect: true }, { text: 'A+B', isCorrect: false }, { text: 'A·B', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'NAND is a functionally complete (universal) gate.', explanation: 'Any Boolean function can be built using only NAND gates.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'combinational-logic', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A full adder’s carry-out Cout is:', explanation: 'Cout = A·B + Cin·(A⊕B).', options: [ { text: 'A·B + Cin·(A⊕B)', isCorrect: true }, { text: 'A⊕B', isCorrect: false }, { text: 'A+B+Cin', isCorrect: false }, { text: 'A·B·Cin', isCorrect: false } ] },
      { lessonSlug: 'combinational-logic', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 4:1 MUX uses how many select lines?', explanation: '2ⁿ inputs need n select lines; 2² = 4 ⇒ 2 selects.', options: [ { text: '1', isCorrect: false }, { text: '2', isCorrect: true }, { text: '4', isCorrect: false }, { text: '8', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A decoder performs the inverse function of a multiplexer.', explanation: 'A decoder activates one of 2ⁿ outputs from an n-bit code; a MUX does the opposite selection.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'sequential-logic', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'For a D flip-flop the next state Q_next equals:', explanation: 'A D-FF simply latches D on the clock edge: Q_next = D.', options: [ { text: 'D', isCorrect: true }, { text: 'Q', isCorrect: false }, { text: '!D', isCorrect: false }, { text: 'Q⊕D', isCorrect: false } ] },
      { lessonSlug: 'sequential-logic', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 4-bit binary ripple up-counter counts modulo:', explanation: 'A 4-bit counter wraps every 2⁴ = 16 states (mod-16).', options: [ { text: '8', isCorrect: false }, { text: '10', isCorrect: false }, { text: '16', isCorrect: true }, { text: '4', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In an asynchronous (ripple) counter all flip-flops share a common clock.', explanation: 'Ripple counters clock each FF from the previous FF’s output; synchronous ones share the clock.', options: [ { text: 'False', isCorrect: true }, { text: 'True', isCorrect: false } ] },
      { lessonSlug: 'state-machines-memories', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In a Moore machine the output depends on:', explanation: 'Moore output is a function of state only.', options: [ { text: 'Inputs only', isCorrect: false }, { text: 'State only', isCorrect: true }, { text: 'State and inputs', isCorrect: false }, { text: 'Clock only', isCorrect: false } ] },
      { lessonSlug: 'state-machines-memories', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'How many flip-flops are needed for a 13-state FSM?', explanation: '#FF = ⌈log2 13⌉ = 4.', options: [ { text: '3', isCorrect: false }, { text: '4', isCorrect: true }, { text: '5', isCorrect: false }, { text: '13', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'DRAM requires periodic refreshing because its cell stores charge on a capacitor that leaks.', explanation: 'A 1T1C DRAM cell leaks charge and must be refreshed; SRAM uses cross-coupled inverters.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A 4-to-16 decoder has how many output lines?', explanation: '2⁴ = 16 outputs (one active per input code).', options: [ { text: '4', isCorrect: false }, { text: '8', isCorrect: false }, { text: '16', isCorrect: true }, { text: '32', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 11. Control Systems
  // ----------------------------------------------------------
  {
    slug: 'control-systems',
    title: 'Control Systems',
    titleAr: 'أنظمة التحكم',
    description: 'Transfer functions, time and frequency response, stability and PID controller design.',
    icon: 'SlidersHorizontal',
    color: 'teal',
    order: 11,
    lessons: [
      {
        slug: 'transfer-functions',
        title: 'Transfer Functions & Block Diagrams',
        titleAr: 'دوال التحويل والمخططات الكتلية',
        order: 1,
        conceptIntroduction: '- Laplace transform converts LTI ODEs into algebraic form: `G(s) = Y(s)/X(s)`.\n- Block diagrams reduce via series, parallel and feedback rules.\n- Closed-loop transfer: `T(s) = G(s)/(1 + G(s)H(s))`.',
        example: 'Open-loop G=K/(s(s+1)), H=1. T(s) = K/[s² + s + K].',
        keyFormulas: 'L{f′} = sF − f(0)\nSeries: G₁·G₂\nFeedback: T = G/(1+GH)\nError: E = R − H·Y',
        exercise: 'Reduce a two-loop block diagram to a single transfer function.',
        durationMin: 20,
      },
      {
        slug: 'time-response-stability',
        title: 'Time Response & Stability',
        titleAr: 'الاستجابة الزمنية والاستقرار',
        order: 2,
        conceptIntroduction: '- Second-order system: ω_n, ζ; settling time ≈ 4/(ζω_n); %OS = e^(−πζ/√(1−ζ²))·100%.\n- Stability: all poles in the open LHP (continuous time).\n- Routh–Hurwitz test: necessary and sufficient for polynomial stability.',
        example: 'ζ=0.5 → %OS ≈ e^(−π·0.5/0.866)·100% ≈ 16.3%.',
        keyFormulas: 'ω_d = ω_n√(1−ζ²)\nT_s ≈ 4/(ζω_n) (2%)\n%OS = 100·e^(−πζ/√(1−ζ²))\nStable ⟺ poles in LHP',
        exercise: 'Find the natural frequency and damping ratio of T(s)=9/(s²+2s+9).',
        durationMin: 22,
      },
      {
        slug: 'root-locus-bode',
        title: 'Root Locus & Frequency Response',
        titleAr: 'مخطط الجذور والاستجابة الترددية',
        order: 3,
        conceptIntroduction: '- Root locus: poles of T(s) = KG(s)/(1+KG(s)H(s)) traced vs K.\n- Bode magnitude (dB) = 20 log|G(jω)|, phase = ∠G(jω).\n- Gain margin and phase margin quantify relative stability.',
        example: 'G(s)=1/[s(s+1)]: gain margin ∞, phase margin ≈ −180° + tan⁻¹(ω at |G|=1) gives PM.',
        keyFormulas: '1 + KG(s)H(s) = 0 (locus eqn)\n|G|_dB = 20log|G(jω)|\nGM = 1/|G(jω_π)|\nPM = 180° + ∠G(jω_gc)',
        exercise: 'Sketch the Bode asymptotes for G(s) = 100/[s(s+10)].',
        durationMin: 22,
      },
      {
        slug: 'pid-controllers',
        title: 'PID Controllers',
        titleAr: 'متحكمات PID',
        order: 4,
        conceptIntroduction: '- PID: `u(t) = K_p·e + K_i·∫e dt + K_d·de/dt`.\n- Ziegler–Nichols tuning uses ultimate gain K_u and period P_u.\n- Integral eliminates steady-state error; derivative improves damping.',
        example: 'Ziegler–Nichols PID: K_p = 0.6 K_u, K_i = 1.2 K_u/P_u, K_d = 0.075 K_u·P_u.',
        keyFormulas: 'u = K_p·e + K_i·∫e + K_d·de/dt\nU(s)/E(s) = K_p + K_i/s + K_d·s\nK_p = 0.6K_u (ZN)\ne_ss(type1) = 0 (with I)',
        exercise: 'Tune a PID for a plant with K_u=8 and P_u=2 s using Ziegler–Nichols.',
        durationMin: 20,
      },
    ],
    questions: [
      { lessonSlug: 'transfer-functions', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The closed-loop transfer with G forward and H feedback is:', explanation: 'T(s) = G(s)/(1+G(s)H(s)) for negative feedback.', options: [ { text: 'G/(1+GH)', isCorrect: true }, { text: 'G·H', isCorrect: false }, { text: 'G/(1−GH)', isCorrect: false }, { text: 'G+H', isCorrect: false } ] },
      { lessonSlug: 'transfer-functions', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'G=K/[s(s+1)], H=1. T(s)?', explanation: 'T = G/(1+G) = K/[s²+s+K].', options: [ { text: 'K/(s²+s+K)', isCorrect: true }, { text: 'K/(s²−s+K)', isCorrect: false }, { text: 'K/(s(s+1)−K)', isCorrect: false }, { text: 'K·(s+1)/s', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'L{f′(t)} = sF(s) − f(0).', explanation: 'The Laplace transform of a derivative introduces the s multiplier and the initial-condition term.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'time-response-stability', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'T(s)=9/(s²+2s+9). Damping ratio ζ?', explanation: 'Compare to ω_n²=9, 2ζω_n=2 ⇒ ζ=2/(2·3)=1/3.', options: [ { text: '0.20', isCorrect: false }, { text: '0.33', isCorrect: true }, { text: '0.50', isCorrect: false }, { text: '0.70', isCorrect: false } ] },
      { lessonSlug: 'time-response-stability', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'ζ=0.5. %OS?', explanation: '%OS = 100·e^(−π·0.5/√(1−0.25)) = 100·e^(−1.814) ≈ 16.3%.', options: [ { text: '6%', isCorrect: false }, { text: '16.3%', isCorrect: true }, { text: '30%', isCorrect: false }, { text: '50%', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A continuous-time LTI system is stable if and only if all poles lie in the left half-plane.', explanation: 'Poles with negative real parts produce decaying natural modes.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'root-locus-bode', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Bode magnitude in decibels is defined as:', explanation: 'M_dB = 20·log₁₀|G(jω)|.', options: [ { text: '20·log|G(jω)|', isCorrect: true }, { text: '10·log|G(jω)|', isCorrect: false }, { text: 'ln|G(jω)|', isCorrect: false }, { text: '|G(jω)|', isCorrect: false } ] },
      { lessonSlug: 'root-locus-bode', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Gain margin is measured at the frequency where the phase equals:', explanation: 'GM is evaluated at the phase crossover (∠G = −180°).', options: [ { text: '0°', isCorrect: false }, { text: '−90°', isCorrect: false }, { text: '−180°', isCorrect: true }, { text: '+180°', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The root locus plots the closed-loop poles as a parameter (typically K) varies from 0 to ∞.', explanation: 'That is the definition of the (negative-feedback) root locus.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'pid-controllers', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A PID controller transfer function is:', explanation: 'C(s) = K_p + K_i/s + K_d·s.', options: [ { text: 'K_p + K_i/s + K_d·s', isCorrect: true }, { text: 'K_p·s + K_i + K_d', isCorrect: false }, { text: 'K_p·K_i·K_d', isCorrect: false }, { text: 'K_p/(s+K_i·s²)', isCorrect: false } ] },
      { lessonSlug: 'pid-controllers', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Integral action in a controller primarily:', explanation: 'Integral action drives the steady-state error to zero for step inputs.', options: [ { text: 'Adds damping', isCorrect: false }, { text: 'Eliminates steady-state error', isCorrect: true }, { text: 'Speeds up the response', isCorrect: false }, { text: 'Reduces overshoot', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'ZN PID tuning: K_u=8, P_u=2 s. K_p?', explanation: 'K_p = 0.6·K_u = 0.6·8 = 4.8.', options: [ { text: '1.6', isCorrect: false }, { text: '4.8', isCorrect: true }, { text: '8', isCorrect: false }, { text: '9.6', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Derivative action in a PID controller tends to improve damping and reduce overshoot.', explanation: 'D acts on the rate of change of error, opposing fast swings.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 12. Materials Science
  // ----------------------------------------------------------
  {
    slug: 'materials-science',
    title: 'Materials Science',
    titleAr: 'علم المواد',
    description: 'Crystal structures, defects, phase diagrams, heat treatment, and mechanical/physical properties.',
    icon: 'Gem',
    color: 'cyan',
    order: 12,
    lessons: [
      {
        slug: 'crystal-structure-defects',
        title: 'Crystal Structure & Defects',
        titleAr: 'التركيب البلوري والعيوب',
        order: 1,
        conceptIntroduction: '- Common lattices: SC, BCC (e.g. Fe α), FCC (e.g. Cu, Al) and HCP (e.g. Ti α).\n- Miller indices `(h k l)` denote crystallographic planes.\n- Point defects: vacancies, interstitials, substitutional atoms; line defects: edge & screw dislocations.',
        example: 'FCC has 4 atoms/unit cell and APF ≈ 0.74; BCC has 2 atoms/cell and APF ≈ 0.68.',
        keyFormulas: 'a_FCC = 2R√2\na_BCC = 4R/√3\nAPF = (atoms·V_atom)/V_cell\nρ = (atoms·M)/(N_A·a³)',
        exercise: 'Calculate the theoretical density of Cu (FCC, a=0.361 nm, M=63.55).',
        durationMin: 20,
      },
      {
        slug: 'phase-diagrams-heat-treatment',
        title: 'Phase Diagrams & Heat Treatment',
        titleAr: 'المخططات الطورية والمعالجة الحرارية',
        order: 2,
        conceptIntroduction: '- Binary phase diagrams (e.g. Fe–C) show liquidus, solidus, eutectic and eutectoid.\n- Lever rule gives phase fractions at a given T and composition.\n- Heat treatment: anneal (soften), quench (harden), temper (toughen).',
        example: 'At a eutectoid 0.77 wt% C, austenite → pearlite (α+Fe₃C) on slow cooling.',
        keyFormulas: 'Lever: w_L = (c−c_S)/(c_L−c_S)\nEutectoid 727 °C, 0.77% C\nPearlite = α + Fe₃C\nTtt ⇒ martensite (bct)',
        exercise: 'Use the lever rule to compute phase fractions for a 40 wt% alloy at a T between liquidus and solidus.',
        durationMin: 22,
      },
      {
        slug: 'mechanical-properties-strengthening',
        title: 'Mechanical Properties & Strengthening',
        titleAr: 'الخصائص الميكانيكية والتقوية',
        order: 3,
        conceptIntroduction: '- Tensile test: engineering stress σ = F/A₀, engineering strain ε = ΔL/L₀.\n- Strengthening mechanisms: solid-solution, grain-size (Hall–Petch), strain (work) hardening, precipitation.\n- Hardness (Brinell/Rockwell/Vickers) approximates strength.',
        example: 'Hall–Petch: σ_y = σ₀ + k·d^(−1/2); smaller grains ⇒ stronger.',
        keyFormulas: 'σ = F/A₀\nε = ΔL/L₀\nσ_y = σ₀ + k/√d (Hall–Petch)\nH ≈ 3·σ_y',
        exercise: 'Estimate the yield stress increase when grain size drops from 100 μm to 10 μm (k=0.5 MPa·√m).',
        durationMin: 18,
      },
      {
        slug: 'electrical-magnetic-properties',
        title: 'Electrical & Magnetic Properties',
        titleAr: 'الخصائص الكهربائية والمغناطيسية',
        order: 4,
        conceptIntroduction: '- Conductivity σ_e = n·e·μ (carriers times mobility).\n- Band gap distinguishes conductors, semiconductors and insulators.\n- Ferromagnetism arises from aligned spins; Curie temperature destroys it.',
        example: 'Copper σ_e ≈ 5.96×10⁷ S/m; silicon ~ 4×10⁻⁴ S/m (intrinsic).',
        keyFormulas: 'σ_e = n·e·μ\nρ = 1/σ_e\nB = μ₀(H+M)\nT > T_C ⇒ paramagnetic',
        exercise: 'Explain why silicon’s conductivity rises with temperature while copper’s falls slightly.',
        durationMin: 18,
      },
    ],
    questions: [
      { lessonSlug: 'crystal-structure-defects', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'BCC unit cell contains how many atoms?', explanation: '8 corners × 1/8 + 1 body centre = 2 atoms per BCC cell.', options: [ { text: '1', isCorrect: false }, { text: '2', isCorrect: true }, { text: '4', isCorrect: false }, { text: '6', isCorrect: false } ] },
      { lessonSlug: 'crystal-structure-defects', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'FCC lattice has how many atoms per unit cell?', explanation: '8 corners × 1/8 + 6 faces × 1/2 = 4 atoms per FCC cell.', options: [ { text: '2', isCorrect: false }, { text: '4', isCorrect: true }, { text: '6', isCorrect: false }, { text: '8', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A screw dislocation has its Burgers vector parallel to the dislocation line.', explanation: 'For edge, b ⊥ line; for screw, b ∥ line.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'phase-diagrams-heat-treatment', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'At the eutectoid point in the Fe–C system, austenite transforms to:', explanation: 'Austenite (γ) → pearlite (α + Fe₃C) at 0.77% C, 727 °C.', options: [ { text: 'Martensite', isCorrect: false }, { text: 'Pearlite', isCorrect: true }, { text: 'Cementite only', isCorrect: false }, { text: 'Ferrite only', isCorrect: false } ] },
      { lessonSlug: 'phase-diagrams-heat-treatment', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Eutectoid composition in Fe–C (wt% C) is approximately:', explanation: 'Eutectoid: 0.77 wt% C.', options: [ { text: '0.02', isCorrect: false }, { text: '0.77', isCorrect: true }, { text: '4.30', isCorrect: false }, { text: '6.67', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Quenching steel from austenite typically produces martensite (a hard, brittle phase).', explanation: 'Rapid cooling suppresses diffusion, trapping carbon in a bct martensite lattice.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'mechanical-properties-strengthening', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Hall–Petch relation is:', explanation: 'σ_y = σ₀ + k/√d links yield stress to grain size.', options: [ { text: 'σ_y = σ₀ + k/√d', isCorrect: true }, { text: 'σ_y = σ₀ + k·d', isCorrect: false }, { text: 'σ_y = k·d²', isCorrect: false }, { text: 'σ_y = σ₀·d', isCorrect: false } ] },
      { lessonSlug: 'mechanical-properties-strengthening', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Reducing grain size generally:', explanation: 'Smaller grains raise strength (Hall–Petch) and toughness.', options: [ { text: 'Lowers strength', isCorrect: false }, { text: 'Raises strength', isCorrect: true }, { text: 'Has no effect', isCorrect: false }, { text: 'Lowers hardness', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Engineering stress is defined as force divided by the original cross-sectional area.', explanation: 'σ_eng = F/A₀ uses the undeformed area; true stress uses the instantaneous area.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'electrical-magnetic-properties', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Electrical conductivity is given by:', explanation: 'σ_e = n·e·μ = charge-carrier density × charge × mobility.', options: [ { text: 'n·e·μ', isCorrect: true }, { text: 'n/e·μ', isCorrect: false }, { text: 'e/μ', isCorrect: false }, { text: 'μ/e·n', isCorrect: false } ] },
      { lessonSlug: 'electrical-magnetic-properties', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Above the Curie temperature a ferromagnet becomes:', explanation: 'Above T_C thermal energy destroys the aligned-spin order ⇒ paramagnetic.', options: [ { text: 'Ferromagnetic', isCorrect: false }, { text: 'Paramagnetic', isCorrect: true }, { text: 'Diamagnetic', isCorrect: false }, { text: 'Superconducting', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'For intrinsic semiconductors, conductivity increases with temperature.', explanation: 'More carriers are thermally excited across the band gap, outweighing mobility loss.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'APF of FCC is approximately:', explanation: 'FCC packing factor ≈ 0.74 (the densest lattice).', options: [ { text: '0.52', isCorrect: false }, { text: '0.68', isCorrect: false }, { text: '0.74', isCorrect: true }, { text: '0.90', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 13. Mechanical Engineering Design
  // ----------------------------------------------------------
  {
    slug: 'mechanical-engineering-design',
    title: 'Mechanical Engineering Design',
    titleAr: 'التصميم الميكانيكي الهندسي',
    description: 'Failure theories, fatigue, fastened joints and shaft/key/coupling design.',
    icon: 'Wrench',
    color: 'orange',
    order: 13,
    lessons: [
      {
        slug: 'failure-theories',
        title: 'Design Philosophy & Failure Theories',
        titleAr: 'فلسفة التصميم ونظريات الانهيار',
        order: 1,
        conceptIntroduction: '- Factor of safety `n = S/f` (strength over stress).\n- Ductile: von Mises (distortion energy); maximum shear (Tresca).\n- Brittle: Rankine (max normal), Mohr, modified Mohr.\n- Coulomb–Mohr for materials with different tensile/compressive strengths.',
        example: 'A steel shaft with σ1=120 MPa, σ2=60 MPa. σ_vm = √(120² + 60² − 120·60) ≈ 104 MPa.',
        keyFormulas: 'σ_vm = √(((σ1−σ2)² + (σ2−σ3)² + (σ3−σ1)²)/2)\nTresca: τ_max = (σ1−σ3)/2 ≤ S_y/2n\nRankine: σ1 ≤ S_ut/n\nn = S_y / σ_vm',
        exercise: 'Find the von Mises stress for σ1=80, σ2=20, σ3=0 MPa.',
        durationMin: 20,
      },
      {
        slug: 'fatigue-endurance',
        title: 'Fatigue & Endurance',
        titleAr: 'الكلال ومقاومة الكلال',
        order: 2,
        conceptIntroduction: '- Fatigue failure from repeated cyclic loading below the static strength.\n- S–N curve; endurance limit S_e for steels (~0.5·S_ut).\n- Endurance modifying factors (Marin): surface, size, load, temperature, reliability.\n- Goodman / Soderberg / Gerber lines define safe design under mean+alternating stress.',
        example: 'A polished steel (S_ut=800 MPa) has S_e′ ≈ 400 MPa; applying surface/size factors gives S_e ≈ 270 MPa.',
        keyFormulas: "S_e' ≈ 0.5·S_ut (steel)\nS_e = S_e'·k_surf·k_size·k_load·k_temp\nGoodman: σ_a/S_e + σ_m/S_ut = 1/n\nSoderberg: σ_a/S_e + σ_m/S_y = 1/n",
        exercise: 'Use the Goodman line to compute the safety factor for σ_a=150 MPa, σ_m=200 MPa, S_e=300, S_ut=600.',
        durationMin: 22,
      },
      {
        slug: 'joints',
        title: 'Welded & Bolted Joints',
        titleAr: 'الوصلات الملحومة والمثبتة',
        order: 3,
        conceptIntroduction: '- Bolts: preload F_i, external load P, joint constant C = k_b/(k_b+k_c).\n- Thread stress: σ_t = F/A_t; shear on bolt = F/A_s.\n- Fillet weld throat area A_w = 0.707·h·L; shear τ = F/A_w.',
        example: 'Bolt with F_i=20 kN, P=10 kN, C=0.3 ⇒ bolt load = 20 + 0.3·10 = 23 kN.',
        keyFormulas: 'C = k_b/(k_b+k_c)\nF_b = F_i + C·P\nF_c = F_i − (1−C)·P\nA_w = 0.707·h·L (fillet)',
        exercise: 'Calculate the throat area of a 6 mm fillet weld, length 50 mm.',
        durationMin: 20,
      },
      {
        slug: 'shafts-keys-couplings',
        title: 'Shafts, Keys & Couplings',
        titleAr: 'الأعمدة والمفاتيح والوصلات',
        order: 4,
        conceptIntroduction: '- Shafts under torsion + bending: design diameter from combined σ, τ.\n- Keys transmit torque between shaft and hub; shear and crushing checks.\n- Couplings accommodate misalignment (rigid / flexible / universal).',
        example: 'd³ ≥ (16·n·√(M²+T²))/(π·S_y) for a solid shaft in combined loading.',
        keyFormulas: 'd³ ≥ 16/(π·S_y) · √((K_f·M)² + (K_fs·T)²) · n\nF = T/r (key shear)\nτ_key = F/(w·L)',
        exercise: 'Design a key for T=500 N·m, r=25 mm, allowable shear 40 MPa (key width 8 mm).',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'failure-theories', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Factor of safety n is defined as:', explanation: 'n = S/f = strength (capability) divided by applied stress.', options: [ { text: 'S/f', isCorrect: true }, { text: 'f/S', isCorrect: false }, { text: 'S·f', isCorrect: false }, { text: 'S+f', isCorrect: false } ] },
      { lessonSlug: 'failure-theories', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'For ductile materials the most accurate failure theory is:', explanation: 'von Mises (distortion energy) matches ductile yielding best.', options: [ { text: 'Rankine', isCorrect: false }, { text: 'von Mises', isCorrect: true }, { text: 'Coulomb–Mohr', isCorrect: false }, { text: 'Modified Mohr', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The Tresca criterion uses the maximum shear stress.', explanation: 'Tresca predicts yield when τ_max = (σ1−σ3)/2 reaches S_y/2.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'failure-theories', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'σ1=120, σ2=60 MPa (plane stress). σ_vm?', explanation: 'σ_vm = √(120² + 60² − 120·60) = √(14400+3600−7200) = √10800 ≈ 104 MPa.', options: [ { text: '60 MPa', isCorrect: false }, { text: '104 MPa', isCorrect: true }, { text: '120 MPa', isCorrect: false }, { text: '180 MPa', isCorrect: false } ] },
      { lessonSlug: 'fatigue-endurance', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'For steels the endurance limit is approximately:', explanation: "S_e' ≈ 0.5·S_ut for steels with S_ut ≤ 1400 MPa.", options: [ { text: '0.2·S_ut', isCorrect: false }, { text: '0.5·S_ut', isCorrect: true }, { text: '0.8·S_ut', isCorrect: false }, { text: '1.0·S_ut', isCorrect: false } ] },
      { lessonSlug: 'fatigue-endurance', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Goodman line is:', explanation: 'σ_a/S_e + σ_m/S_ut = 1/n defines a safe fatigue boundary.', options: [ { text: 'σ_a/S_e + σ_m/S_ut = 1/n', isCorrect: true }, { text: 'σ_a + σ_m = S_ut', isCorrect: false }, { text: 'σ_a·σ_m = S_e·S_ut', isCorrect: false }, { text: 'σ_a = S_e', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Fatigue failure can occur at stresses below the ultimate tensile strength.', explanation: 'Repeated cyclic loading produces failure well below S_ut.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'joints', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The joint constant C in a bolted joint is:', explanation: 'C = k_b/(k_b+k_c) — the fraction of external load carried by the bolt.', options: [ { text: 'k_b/(k_b+k_c)', isCorrect: true }, { text: 'k_c/(k_b+k_c)', isCorrect: false }, { text: 'k_b·k_c', isCorrect: false }, { text: 'k_b/k_c', isCorrect: false } ] },
      { lessonSlug: 'joints', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Fillet weld throat area for h=6 mm, L=50 mm?', explanation: 'A_w = 0.707·6·50 ≈ 212 mm².', options: [ { text: '150 mm²', isCorrect: false }, { text: '212 mm²', isCorrect: true }, { text: '300 mm²', isCorrect: false }, { text: '424 mm²', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A flexible coupling can accommodate some shaft misalignment.', explanation: 'Flexible couplings (e.g. jaw, gear) absorb angular/axial/parallel offsets.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'shafts-keys-couplings', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The basic design equation for a solid shaft under combined bending and torsion is:', explanation: 'd³ ≥ (16·n·√(M²+T²))/(π·S_y).', options: [ { text: 'd³ = 16/(π·S_y)·√(M²+T²)·n', isCorrect: true }, { text: 'd = T/J', isCorrect: false }, { text: 'd = M·c/I', isCorrect: false }, { text: 'd = π·r²', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'T=500 N·m, r=25 mm. Key force F?', explanation: 'F = T/r = 500/0.025 = 20 000 N = 20 kN.', options: [ { text: '2 kN', isCorrect: false }, { text: '20 kN', isCorrect: true }, { text: '50 kN', isCorrect: false }, { text: '500 kN', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A key transmits torque between a shaft and a hub.', explanation: 'Keys seat in matching keyways on shaft and hub to transmit torque.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 14. Machine Design
  // ----------------------------------------------------------
  {
    slug: 'machine-design',
    title: 'Machine Design',
    titleAr: 'تصميم الآلات',
    description: 'Gears, bearings, springs and clutches/brakes — design and selection of machine elements.',
    icon: 'Settings2',
    color: 'rose',
    order: 14,
    lessons: [
      {
        slug: 'gears-gear-trains',
        title: 'Gears & Gear Trains',
        titleAr: 'التروس وقاطرات التروس',
        order: 1,
        conceptIntroduction: '- Spur gear: `m = d/N` (mm), `v = πdN/60` (m/s), transmitted power `P = F_t·v`.\n- Gear ratio `i = N_driven/N_driver = ω_driver/ω_driven`.\n- Lewis bending: `F_t = σ·b·Y·m`; AGMA refines with geometry + dynamic factors.',
        example: 'Gear pair 18T→54T ⇒ i = 3. Driver 1500 rpm ⇒ driven 500 rpm.',
        keyFormulas: 'm = d/N\nP = F_t·v\ni = N2/N1 = ω1/ω2\nF_t = σ·b·Y·m (Lewis)',
        exercise: 'A spur gear transmits 5 kW at 4 m/s; find the tangential force F_t.',
        durationMin: 22,
      },
      {
        slug: 'bearings',
        title: 'Bearings (Rolling & Sliding)',
        titleAr: 'المحامل (الدحرجة والانزلاق)',
        order: 2,
        conceptIntroduction: '- Rolling bearings: ball, cylindrical, taper, spherical; rated by L₁₀ life.\n- `L₁₀ = (C/P)^p` revs, p=3 (ball), 10/3 (roller); C = basic dynamic load rating.\n- Journal (sliding) bearings rely on hydrodynamic lubrication — Petroff’s law.',
        example: 'C=10 kN, P=2 kN, ball ⇒ L₁₀ = (5)³ = 125 million revs.',
        keyFormulas: 'L₁₀ = (C/P)^p\nL₁₀h = L₁₀·10⁶/(60·n)\np=3 ball, p=10/3 roller\nf = μ·N (Petroff)',
        exercise: 'Compute L₁₀ hours for a ball bearing with C=12 kN, P=3 kN, n=1500 rpm.',
        durationMin: 20,
      },
      {
        slug: 'springs',
        title: 'Springs',
        titleAr: 'النوابض',
        order: 3,
        conceptIntroduction: '- Helical spring deflection: `δ = 8·F·D³·N / (G·d⁴)`.\n- Shear stress with curvature (Wahl): `τ = K_w·8·F·D/(π·d³)`.\n- Spring rate: `k = F/δ = G·d⁴/(8·D³·N)`.',
        example: 'Spring D=20 mm, d=3 mm, N=10, G=80 GPa → k = 80×10⁹·81/(8·8000·10) ≈ 101 250 N/m = 101 N/mm.',
        keyFormulas: 'δ = 8·F·D³·N/(G·d⁴)\nτ = K_w·8·F·D/(π·d³)\nk = G·d⁴/(8·D³·N)\nK_w = (4C−1)/(4C−2) + 0.615/C',
        exercise: 'Find the spring rate for D=15 mm, d=2 mm, N=8, G=80 GPa.',
        durationMin: 20,
      },
      {
        slug: 'clutches-brakes',
        title: 'Clutches & Brakes',
        titleAr: 'المقابض والمكابح',
        order: 4,
        conceptIntroduction: '- Plate (disc) clutch torque: `T = μ·W·R_m·n` (uniform wear).\n- Cone clutch adds `1/sin α` factor.\n- Energy dissipated during braking: `E = ½I·(ω₁²−ω₂²)`.',
        example: 'Disc clutch μ=0.3, W=2 kN, R_m=0.1 m, n=2 ⇒ T = 0.3·2000·0.1·2 = 120 N·m.',
        keyFormulas: 'T = μ·W·R_m·n (uniform wear)\nE_brake = ½I(ω₁²−ω₂²)\np_rate = T·ω (power)\nμ wet ≈ 0.05–0.10',
        exercise: 'Compute the braking torque for a disc brake μ=0.35, W=1 kN, R_m=0.15 m, n=2.',
        durationMin: 18,
      },
    ],
    questions: [
      { lessonSlug: 'gears-gear-trains', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Gear module m is defined as:', explanation: 'm = d/N (pitch diameter / number of teeth).', options: [ { text: 'd/N', isCorrect: true }, { text: 'N/d', isCorrect: false }, { text: 'd·N', isCorrect: false }, { text: 'N−d', isCorrect: false } ] },
      { lessonSlug: 'gears-gear-trains', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Gear pair 18T → 54T. Driver at 1500 rpm. Driven rpm?', explanation: 'i = 54/18 = 3 ⇒ driven = 1500/3 = 500 rpm.', options: [ { text: '250 rpm', isCorrect: false }, { text: '500 rpm', isCorrect: true }, { text: '750 rpm', isCorrect: false }, { text: '4500 rpm', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Power transmitted by a gear equals tangential force times pitch-line velocity.', explanation: 'P = F_t·v.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'bearings', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The L₁₀ bearing life equation is:', explanation: 'L₁₀ = (C/P)^p millions of revs.', options: [ { text: '(C/P)^p', isCorrect: true }, { text: '(P/C)^p', isCorrect: false }, { text: 'C·P', isCorrect: false }, { text: 'C/P', isCorrect: false } ] },
      { lessonSlug: 'bearings', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Ball bearing C=10 kN, P=2 kN. L₁₀ (million revs)?', explanation: 'L₁₀ = (10/2)³ = 125 million revs.', options: [ { text: '5', isCorrect: false }, { text: '25', isCorrect: false }, { text: '125', isCorrect: true }, { text: '1000', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'For ball bearings the L₁₀ life exponent p equals:', explanation: 'p = 3 for ball bearings; p = 10/3 for roller bearings.', options: [ { text: '2', isCorrect: false }, { text: '3', isCorrect: true }, { text: '10/3', isCorrect: false }, { text: '4', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Hydrodynamic journal bearings rely on a self-generated oil film to carry load.', explanation: 'A rotating shaft pumps oil into the wedge, building pressure to support the load.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'springs', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Helical compression spring deflection δ is given by:', explanation: 'δ = 8·F·D³·N/(G·d⁴).', options: [ { text: '8·F·D³·N/(G·d⁴)', isCorrect: true }, { text: 'G·d⁴/(8·F·D³·N)', isCorrect: false }, { text: 'F·L³/(3·E·I)', isCorrect: false }, { text: 'F·D·N', isCorrect: false } ] },
      { lessonSlug: 'springs', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Spring k: D=20 mm, d=3 mm, N=10, G=80 GPa. k (N/mm)?', explanation: 'k = G·d⁴/(8·D³·N) = 80×10³·81/(8·8000·10) ≈ 101 N/mm.', options: [ { text: '10 N/mm', isCorrect: false }, { text: '50 N/mm', isCorrect: false }, { text: '101 N/mm', isCorrect: true }, { text: '810 N/mm', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The Wahl factor corrects the spring shear stress for curvature and direct shear.', explanation: 'K_w accounts for the additional stress concentration in the helix.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'clutches-brakes', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Disc clutch μ=0.3, W=2 kN, R_m=0.1 m, n=2. Torque?', explanation: 'T = μ·W·R_m·n = 0.3·2000·0.1·2 = 120 N·m.', options: [ { text: '60 N·m', isCorrect: false }, { text: '120 N·m', isCorrect: true }, { text: '240 N·m', isCorrect: false }, { text: '12 N·m', isCorrect: false } ] },
      { lessonSlug: 'clutches-brakes', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The braking energy absorbed from a rotating inertia is:', explanation: 'E = ½·I·(ω₁² − ω₂²) is the rotational KE change.', options: [ { text: '½·I·(ω₁²−ω₂²)', isCorrect: true }, { text: 'I·(ω₁−ω₂)', isCorrect: false }, { text: '½·m·v²', isCorrect: false }, { text: 'T·R', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A clutch transmits torque by friction between contact surfaces.', explanation: 'Friction at the interface transmits torque between driver and driven members.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 15. Heat Transfer
  // ----------------------------------------------------------
  {
    slug: 'heat-transfer',
    title: 'Heat Transfer',
    titleAr: 'انتقال الحرارة',
    description: 'Conduction, convection, radiation and the analysis of heat exchangers.',
    icon: 'Flame',
    color: 'red',
    order: 15,
    lessons: [
      {
        slug: 'conduction',
        title: 'Conduction',
        titleAr: 'التوصيل الحراري',
        order: 1,
        conceptIntroduction: '- Fourier’s law: `q″ = −k·dT/dx`.\n- Plane wall: `Q = k·A·ΔT/L`; cylinder: `Q = 2π·k·L·ΔT/ln(r₂/r₁)`.\n- Thermal resistance: `R = L/(kA)`; resistances in series add.',
        example: 'A 0.1 m wall, k=0.5 W/mK, A=2 m², ΔT=20 K → Q = 0.5·2·20/0.1 = 200 W.',
        keyFormulas: 'q″ = −k·dT/dx\nQ = kAΔT/L (plane wall)\nR = L/(kA)\nQ_cyl = 2πkLΔT/ln(r₂/r₁)',
        exercise: 'Find the heat rate through a 5 cm insulation, k=0.04 W/mK, A=1 m², ΔT=15 K.',
        durationMin: 18,
      },
      {
        slug: 'convection',
        title: 'Convection',
        titleAr: 'الحمل الحراري',
        order: 2,
        conceptIntroduction: '- Newton’s law of cooling: `q″ = h·(T_s − T_∞)`.\n- Forced convection correlations (Dittus–Boelter for tube flow).\n- Natural convection depends on Grashof and Prandtl numbers.',
        example: 'h=10 W/m²K, A=2 m², ΔT=20 K → Q = 10·2·20 = 400 W.',
        keyFormulas: 'q″ = h·(T_s − T_∞)\nNu = h·L/k\nRe = ρvD/μ\nPr = μc_p/k',
        exercise: 'Estimate h given Nu=100, L=0.5 m, k=0.03 W/mK.',
        durationMin: 20,
      },
      {
        slug: 'radiation',
        title: 'Radiation',
        titleAr: 'الإشعاع الحراري',
        order: 3,
        conceptIntroduction: '- Stefan–Boltzmann: `q″ = ε·σ·T⁴`, σ = 5.67×10⁻⁸ W/m²K⁴.\n- Net radiation between two grey surfaces uses view factors.\n- Kirchhoff: at equilibrium, absorptivity = emissivity.',
        example: 'Blackbody at 1000 K → q″ = 5.67×10⁻⁸·1000⁴ ≈ 56.7 kW/m².',
        keyFormulas: 'q″ = ε·σ·T⁴\nσ = 5.67×10⁻⁸ W/m²K⁴\nQ_12 = σA₁F₁₂(T₁⁴−T₂⁴)\nα = ε (Kirchhoff)',
        exercise: 'Compute radiative heat flux from a surface ε=0.8 at 500 K to surroundings at 300 K.',
        durationMin: 18,
      },
      {
        slug: 'heat-exchangers',
        title: 'Heat Exchangers',
        titleAr: 'المبادلات الحرارية',
        order: 4,
        conceptIntroduction: '- LMTD for parallel/counter flow: `Q = U·A·LMTD`, `LMTD = (ΔT₁−ΔT₂)/ln(ΔT₁/ΔT₂)`.\n- ε–NTU method preferred when exit temps are unknown.\n- NTU = U·A/C_min; effectiveness depends on NTU and flow arrangement.',
        example: 'Parallel flow, ΔT₁=100, ΔT₂=20 → LMTD = (100−20)/ln(100/20) ≈ 49.7 K.',
        keyFormulas: 'Q = U·A·LMTD\nLMTD = (ΔT₁−ΔT₂)/ln(ΔT₁/ΔT₂)\nNTU = U·A/C_min\nε = f(NTU, C_r, flow)',
        exercise: 'Compute LMTD for counter flow with ΔT₁=80, ΔT₂=30.',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'conduction', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Fourier’s law of conduction is:', explanation: 'q″ = −k·dT/dx — heat flux ∝ temperature gradient.', options: [ { text: 'q″ = −k·dT/dx', isCorrect: true }, { text: 'q″ = h·ΔT', isCorrect: false }, { text: 'q″ = ε·σ·T⁴', isCorrect: false }, { text: 'q″ = k·T', isCorrect: false } ] },
      { lessonSlug: 'conduction', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Plane wall k=0.5, A=2, ΔT=20 K, L=0.1. Q?', explanation: 'Q = kAΔT/L = 0.5·2·20/0.1 = 200 W.', options: [ { text: '50 W', isCorrect: false }, { text: '100 W', isCorrect: false }, { text: '200 W', isCorrect: true }, { text: '400 W', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Thermal resistance R for a plane wall equals L/(kA).', explanation: 'R = L/(kA) — resistance ∝ thickness, ∝ 1/(kA).', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'convection', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Newton’s law of cooling is:', explanation: 'q″ = h·(T_s − T_∞).', options: [ { text: 'q″ = h·(T_s−T_∞)', isCorrect: true }, { text: 'q″ = k·ΔT/L', isCorrect: false }, { text: 'q″ = εσT⁴', isCorrect: false }, { text: 'q″ = mcΔT', isCorrect: false } ] },
      { lessonSlug: 'convection', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'h=10, A=2 m², ΔT=20 K. Q?', explanation: 'Q = h·A·ΔT = 10·2·20 = 400 W.', options: [ { text: '100 W', isCorrect: false }, { text: '200 W', isCorrect: false }, { text: '400 W', isCorrect: true }, { text: '800 W', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The Nusselt number Nu = h·L/k is a dimensionless heat-transfer coefficient.', explanation: 'Nu compares convective to conductive heat transfer at the same length scale.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'radiation', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Blackbody at 1000 K. q″? (σ=5.67×10⁻⁸)', explanation: 'q″ = σ·T⁴ = 5.67×10⁻⁸·10¹² ≈ 56.7 kW/m².', options: [ { text: '5.67 kW/m²', isCorrect: false }, { text: '56.7 kW/m²', isCorrect: true }, { text: '567 kW/m²', isCorrect: false }, { text: '5.67 W/m²', isCorrect: false } ] },
      { lessonSlug: 'radiation', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Stefan–Boltzmann constant equals:', explanation: 'σ = 5.67×10⁻⁸ W/m²K⁴.', options: [ { text: '5.67×10⁻⁸ W/m²K⁴', isCorrect: true }, { text: '5.67×10⁻⁶', isCorrect: false }, { text: '1.38×10⁻²³', isCorrect: false }, { text: '6.63×10⁻³⁴', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Kirchhoff’s law states that at thermal equilibrium a body’s absorptivity equals its emissivity.', explanation: 'At equilibrium α = ε for each wavelength and direction.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'heat-exchangers', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Parallel flow, ΔT₁=100, ΔT₂=20. LMTD?', explanation: 'LMTD = (100−20)/ln(100/20) = 80/ln5 ≈ 49.7 K.', options: [ { text: '20 K', isCorrect: false }, { text: '49.7 K', isCorrect: true }, { text: '60 K', isCorrect: false }, { text: '100 K', isCorrect: false } ] },
      { lessonSlug: 'heat-exchangers', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The NTU in heat-exchanger analysis equals:', explanation: 'NTU = U·A/C_min.', options: [ { text: 'U·A/C_min', isCorrect: true }, { text: 'C_min·A/U', isCorrect: false }, { text: 'U·C_min/A', isCorrect: false }, { text: 'A/C_min', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Counter-flow heat exchangers generally outperform parallel-flow ones for the same U, A, and fluids.', explanation: 'Counter flow maintains a more uniform ΔT and a higher LMTD, so it is more effective.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Analyze', skillType: 'Conceptual', stem: 'For a series thermal-resistance network, the overall resistance is the:', explanation: 'Series resistances add: R_total = ΣR_i.', options: [ { text: 'Sum of resistances', isCorrect: true }, { text: 'Product', isCorrect: false }, { text: 'Inverse of the sum', isCorrect: false }, { text: 'Smallest R only', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 16. Mechanical Vibrations
  // ----------------------------------------------------------
  {
    slug: 'mechanical-vibrations',
    title: 'Mechanical Vibrations',
    titleAr: 'الاهتزازات الميكانيكية',
    description: 'Single and multi-DOF free/forced vibrations, damping, and resonance.',
    icon: 'Activity',
    color: 'violet',
    order: 16,
    lessons: [
      {
        slug: 'single-dof-free',
        title: 'Single-DOF Free Vibration',
        titleAr: 'الاهتزاز الحر وحيد الدرجة',
        order: 1,
        conceptIntroduction: '- Spring–mass equation: `m·x″ + c·x′ + k·x = 0`.\n- Natural frequency: `ω_n = √(k/m)`.\n- Damping ratio: `ζ = c/(2·√(k·m))`.',
        example: 'm=1 kg, k=100 N/m → ω_n = 10 rad/s; f_n = 10/(2π) ≈ 1.59 Hz.',
        keyFormulas: 'ω_n = √(k/m)\nf_n = ω_n/(2π)\nζ = c/(2√(k·m))\nω_d = ω_n√(1−ζ²)',
        exercise: 'Find the natural frequency of a 5 kg mass on k=200 N/m.',
        durationMin: 16,
      },
      {
        slug: 'forced-resonance',
        title: 'Forced Vibration & Resonance',
        titleAr: 'الاهتزاز القسري والرنين',
        order: 2,
        conceptIntroduction: '- Harmonic forcing: `m·x″ + c·x′ + k·x = F₀·cos(ωt)`.\n- Magnification factor `M = X/(F₀/k)` peaks near ω = ω_n (resonance).\n- Vibration isolation: transmissibility T = √(1+(2ζr)²)/√((1−r²)²+(2ζr)²).',
        example: 'At resonance (r=1), M = 1/(2ζ); for ζ=0.05 ⇒ M = 10.',
        keyFormulas: 'X = (F₀/k)/√((1−r²)² + (2ζr)²)\nr = ω/ω_n\nTR = √(1+(2ζr)²)/√((1−r²)²+(2ζr)²)\nM_resonance = 1/(2ζ)',
        exercise: 'Compute the magnification at r=1, ζ=0.1.',
        durationMin: 20,
      },
      {
        slug: 'damping',
        title: 'Damping',
        titleAr: 'التخميد',
        order: 3,
        conceptIntroduction: '- Three damping regimes: underdamped (ζ<1), critically damped (ζ=1), overdamped (ζ>1).\n- Logarithmic decrement: `δ = ln(x_n/x_{n+1}) = 2πζ/√(1−ζ²)`.\n- Damping comes from material hysteresis, friction, fluid drag.',
        example: 'Two successive peaks 5 mm and 3 mm → δ = ln(5/3) ≈ 0.51.',
        keyFormulas: 'ζ<1 underdamped; ζ=1 critical; ζ>1 overdamped\nδ = 2πζ/√(1−ζ²)\nζ ≈ δ/(2π) (small ζ)\nx(t) = e^(−ζω_n·t)·cos(ω_d·t)',
        exercise: 'Two peaks 8 mm and 5 mm. Estimate δ and ζ.',
        durationMin: 18,
      },
      {
        slug: 'multi-dof-continuous',
        title: 'Multi-DOF & Continuous Systems',
        titleAr: 'الأنظمة متعددة الدرجات والمستمرة',
        order: 4,
        conceptIntroduction: '- n-DOF systems: eigenvalue problem `(K − ω²M)·φ = 0` gives modes.\n- Continuous beams: Euler–Bernoulli PDE `EI·y⁗ + ρA·ÿ = 0`.\n- Mode superposition expresses response as Σ modal contributions.',
        example: 'Two-DOF system yields two natural frequencies; lower = fundamental.',
        keyFormulas: '(K − ω²M)φ = 0\nEI·y⁗ + ρA·ÿ = 0\nω_n (simply supported beam) = (nπ/L)²·√(EI/ρA)\nx = Σ qᵢ(t)·φᵢ',
        exercise: 'For a simply supported uniform beam, find the fundamental natural frequency (ω₁).',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'single-dof-free', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The natural frequency of a spring–mass system is:', explanation: 'ω_n = √(k/m) (rad/s).', options: [ { text: '√(k/m)', isCorrect: true }, { text: '√(m/k)', isCorrect: false }, { text: 'k/m', isCorrect: false }, { text: 'm·k', isCorrect: false } ] },
      { lessonSlug: 'single-dof-free', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'm=1 kg, k=100 N/m. ω_n?', explanation: 'ω_n = √(100/1) = 10 rad/s.', options: [ { text: '1 rad/s', isCorrect: false }, { text: '10 rad/s', isCorrect: true }, { text: '100 rad/s', isCorrect: false }, { text: '0.1 rad/s', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The damping ratio ζ = c/(2·√(k·m)).', explanation: 'ζ compares actual damping to critical damping c_cr = 2√(k·m).', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'forced-resonance', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Resonance occurs when the forcing frequency ω is approximately:', explanation: 'Peak response occurs near ω = ω_n (r ≈ 1).', options: [ { text: '2·ω_n', isCorrect: false }, { text: 'ω_n', isCorrect: true }, { text: '0', isCorrect: false }, { text: '∞', isCorrect: false } ] },
      { lessonSlug: 'forced-resonance', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Magnification at resonance (r=1), ζ=0.05?', explanation: 'M = 1/(2ζ) = 1/(0.1) = 10.', options: [ { text: '5', isCorrect: false }, { text: '10', isCorrect: true }, { text: '20', isCorrect: false }, { text: '0.05', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Vibration isolation is effective only above the resonant frequency (r > √2).', explanation: 'For r > √2 the transmissibility drops below 1 — isolation region.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'damping', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Two peaks 5 and 3 mm. Logarithmic decrement δ?', explanation: 'δ = ln(5/3) ≈ 0.51.', options: [ { text: '0.10', isCorrect: false }, { text: '0.51', isCorrect: true }, { text: '0.67', isCorrect: false }, { text: '1.67', isCorrect: false } ] },
      { lessonSlug: 'damping', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A system with damping ratio ζ=1 is:', explanation: 'ζ = 1 is the critical-damping boundary.', options: [ { text: 'Underdamped', isCorrect: false }, { text: 'Critically damped', isCorrect: true }, { text: 'Overdamped', isCorrect: false }, { text: 'Undamped', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Logarithmic decrement can be used to estimate the damping ratio of an underdamped system.', explanation: 'From measured peak amplitudes one obtains δ and hence ζ = δ/(2π) for small ζ.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'multi-dof-continuous', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The natural frequencies of an n-DOF system are found from:', explanation: 'The generalised eigenvalue problem (K − ω²M)φ = 0 yields ω and the modes φ.', options: [ { text: '(K − ω²M)φ = 0', isCorrect: true }, { text: 'm·x″ + k·x = 0 only', isCorrect: false }, { text: 'F = m·a', isCorrect: false }, { text: 'ω = √(k/m)', isCorrect: false } ] },
      { lessonSlug: 'multi-dof-continuous', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Euler–Bernoulli beam free vibration PDE is:', explanation: 'EI·y⁗ + ρA·ÿ = 0 governs lateral beam vibrations.', options: [ { text: 'EI·y⁗ + ρA·ÿ = 0', isCorrect: true }, { text: 'EI·y″ = M', isCorrect: false }, { text: 'm·x″ + k·x = 0', isCorrect: false }, { text: 'EI·y = 0', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Mode superposition expresses the response as:', explanation: 'The system response = Σ of modal contributions qᵢ(t)·φᵢ.', options: [ { text: 'Σ qᵢ·φᵢ', isCorrect: true }, { text: 'A single cosine', isCorrect: false }, { text: 'Only the highest mode', isCorrect: false }, { text: 'A constant', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A higher number of degrees of freedom yields more natural frequencies (modes).', explanation: 'An n-DOF system has n natural frequencies and n mode shapes.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 17. Surveying
  // ----------------------------------------------------------
  {
    slug: 'surveying',
    title: 'Surveying',
    titleAr: 'علم المساحة',
    description: 'Linear and angular measurements, leveling, theodolites, tacheometry and modern surveying.',
    icon: 'Ruler',
    color: 'amber',
    order: 17,
    lessons: [
      {
        slug: 'linear-angular-measurements',
        title: 'Linear & Angular Measurements',
        titleAr: 'القياسات الخطية والزاوية',
        order: 1,
        conceptIntroduction: '- Chain/tape for distance; corrections for sag, temperature, tension, slope.\n- Compass: magnetic bearing; WCB and RB systems.\n- Theodolite measures horizontal and vertical angles by repetition/reiteration.',
        example: 'A 30 m tape at 30°C (standardised at 20°C) reads 30 m. Correction per length = α·ΔT·L = 12×10⁻⁶·10·30 = 0.0036 m.',
        keyFormulas: 'D = L·cos θ (slope)\nC_temp = α·(T−T_s)·L\nWCB bearing = angle from north\nRB ↔ WCB conversion',
        exercise: 'Compute the slope correction for a 50 m line on a 5° slope.',
        durationMin: 18,
      },
      {
        slug: 'leveling',
        title: 'Leveling',
        titleAr: 'المسح المسطح',
        order: 2,
        conceptIntroduction: '- Datum: MSL; reduced level (RL) = back-sight + height of instrument − fore-sight.\n- Methods: profile (longitudinal) and cross-sectioning; rise and fall or HI method.\n- Closure error ≤ ±12√k mm for ordinary leveling.',
        example: 'BS=1.250 on BM 100.000 ⇒ HI=101.250; FS=2.100 on next TP ⇒ RL = 99.150.',
        keyFormulas: 'RL = HI − FS\nHI = known RL + BS\nRise = BS − FS\nAllowable error ≈ ±12√k mm',
        exercise: 'Compute the RL of a point given BS=1.5 on RL 50.00 and FS=0.9.',
        durationMin: 16,
      },
      {
        slug: 'theodolites-tacheometry',
        title: 'Theodolites & Tacheometry',
        titleAr: 'الثيودوليت والتاخيومتر',
        order: 3,
        conceptIntroduction: '- Transit theodolite: vertical axis, trunnion axis, line of collimation; least count 20″.\n- Tacheometric (stadia) formula: `D = K·S + C` with K≈100, C≈0.\n- Horizontal/vertical angle errors removed by face-left/face-right observation.',
        example: 'Staff intercept S=1.0 m, K=100 ⇒ horizontal distance D ≈ 100 m.',
        keyFormulas: 'D = K·S + C (stadia)\nK = f/i ≈ 100\nLeast count 20″\n2-traverse adjustment',
        exercise: 'Find the horizontal distance for S=0.5 m, vertical angle 10°, K=100, C=0.',
        durationMin: 20,
      },
      {
        slug: 'gps-modern-surveying',
        title: 'GPS & Modern Surveying',
        titleAr: 'نظام GPS والمسح الحديث',
        order: 4,
        conceptIntroduction: '- Total stations integrate EDM + theodolite + data logging.\n- GPS satellites triangulate by time-of-arrival of signals; carrier-phase for cm accuracy.\n- GIS layers map features, attributes and topology.',
        example: 'RTK-GPS uses a base + rover to achieve ~1 cm accuracy in seconds.',
        keyFormulas: 'Range ρ = c·Δt\nRTK accuracy ~1 cm\nWGS-84 ellipsoid\nLeast squares adjustment',
        exercise: 'Explain the difference between code-based and carrier-phase GPS accuracy.',
        durationMin: 18,
      },
    ],
    questions: [
      { lessonSlug: 'linear-angular-measurements', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The slope correction to a measured distance L on slope θ reduces it by approximately:', explanation: 'Slope distance D = L·cos θ; correction ≈ −L·(1 − cos θ).', options: [ { text: 'L·cos θ', isCorrect: true }, { text: 'L·sin θ', isCorrect: false }, { text: 'L·tan θ', isCorrect: false }, { text: 'L·θ', isCorrect: false } ] },
      { lessonSlug: 'linear-angular-measurements', type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Tape corrections account for temperature, pull, sag and slope.', explanation: 'These are the standard systematic-error corrections applied to steel tapes.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A whole-circle bearing (WCB) is measured from:', explanation: 'WCB is the angle measured clockwise from the north direction.', options: [ { text: 'North, clockwise', isCorrect: true }, { text: 'South, clockwise', isCorrect: false }, { text: 'East, anti-clockwise', isCorrect: false }, { text: 'West, clockwise', isCorrect: false } ] },
      { lessonSlug: 'leveling', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'HI=101.250, FS=2.100. RL?', explanation: 'RL = HI − FS = 101.250 − 2.100 = 99.150.', options: [ { text: '99.150', isCorrect: true }, { text: '103.350', isCorrect: false }, { text: '100.000', isCorrect: false }, { text: '101.250', isCorrect: false } ] },
      { lessonSlug: 'leveling', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The height-of-instrument method gives the RL of a point as:', explanation: 'RL = HI − FS.', options: [ { text: 'HI − FS', isCorrect: true }, { text: 'HI + FS', isCorrect: false }, { text: 'BS − FS', isCorrect: false }, { text: 'BS + FS', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In leveling, the rise-and-fall method and the HI method give identical reduced levels.', explanation: 'They are algebraically equivalent accounting for the same instrument moves.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'theodolites-tacheometry', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Stadia intercept S=1.0 m, K=100, C=0. Horizontal distance?', explanation: 'D = K·S + C = 100·1.0 = 100 m.', options: [ { text: '1 m', isCorrect: false }, { text: '10 m', isCorrect: false }, { text: '100 m', isCorrect: true }, { text: '1000 m', isCorrect: false } ] },
      { lessonSlug: 'theodolites-tacheometry', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The tacheometric stadia formula is:', explanation: 'D = K·S + C with K≈100.', options: [ { text: 'D = K·S + C', isCorrect: true }, { text: 'D = S/K', isCorrect: false }, { text: 'D = K/S', isCorrect: false }, { text: 'D = K + S + C', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Face-left and face-right observations eliminate instrumental errors of a theodolite.', explanation: 'Averaging both faces removes errors from non-verticality and collimation axis defects.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'gps-modern-surveying', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A total station integrates which instruments?', explanation: 'EDM + theodolite + data-logger forms a total station.', options: [ { text: 'EDM + theodolite + data logger', isCorrect: true }, { text: 'GPS + compass', isCorrect: false }, { text: 'Camera + laser', isCorrect: false }, { text: 'Levels only', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'RTK-GPS achieves cm-level accuracy primarily by:', explanation: 'Carrier-phase differential observations between base and rover yield centimetre accuracy.', options: [ { text: 'Carrier-phase differential measurement', isCorrect: true }, { text: 'More satellites only', isCorrect: false }, { text: 'Longer integration time only', isCorrect: false }, { text: 'Higher power only', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'GPS positioning uses trilateration from measured ranges to satellites.', explanation: 'Knowing satellite positions, the receiver solves for its location via ranges ρ = c·Δt.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Closure error of 24 mm over a 4 km leveling loop. Allowable (±12√k mm)?', explanation: 'Allowable = ±12√4 = ±24 mm; the 24 mm error is at the limit.', options: [ { text: '±12 mm', isCorrect: false }, { text: '±24 mm', isCorrect: true }, { text: '±48 mm', isCorrect: false }, { text: '±6 mm', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 18. Structural Analysis
  // ----------------------------------------------------------
  {
    slug: 'structural-analysis',
    title: 'Structural Analysis',
    titleAr: 'تحليل المنشآت',
    description: 'Truss and beam analysis, influence lines and an introduction to matrix methods.',
    icon: 'Building2',
    color: 'sky',
    order: 18,
    lessons: [
      {
        slug: 'determinacy-trusses',
        title: 'Determinacy & Trusses',
        titleAr: 'التحديد والروافد',
        order: 1,
        conceptIntroduction: '- Determinacy: m + r = 2j (planar truss) ⇒ statically determinate.\n- Method of joints: ΣF_x = 0, ΣF_y = 0 at each node.\n- Method of sections: cut three members and apply equilibrium.',
        example: 'A simple truss of 7 members, 5 joints, 3 reactions → m+r = 10 = 2j = 10 ⇒ determinate.',
        keyFormulas: 'm + r = 2j (planar, determinate)\nStability: m + r ≥ 2j\nMethod of joints: ΣF=0 at node\nMethod of sections: 3 unknowns',
        exercise: 'Using the method of joints, find the force in each member of a king-post truss.',
        durationMin: 20,
      },
      {
        slug: 'beams-shear-moment',
        title: 'Beams & Shear/Moment Diagrams',
        titleAr: 'الكمرات ومخططات القص والعزم',
        order: 2,
        conceptIntroduction: '- Relationships: `dV/dx = −w`, `dM/dx = V`.\n- Maximum moment occurs where shear is zero.\n- Simply supported beam, central point load P: M_max = PL/4.',
        example: 'Beam span L=4 m, P=10 kN at centre ⇒ M_max = 10·4/4 = 10 kN·m.',
        keyFormulas: 'dV/dx = −w\ndM/dx = V\nM_max at V=0\nSimply sup.: δ_centre = PL³/(48EI)',
        exercise: 'Sketch the SFD and BMD for a simply supported beam with a udl of w over span L.',
        durationMin: 22,
      },
      {
        slug: 'influence-lines',
        title: 'Influence Lines',
        titleAr: 'خطوط التأثير',
        order: 3,
        conceptIntroduction: '- An influence line shows the variation of a response function as a unit load moves across the structure.\n- Müller–Breslau principle: the IL shape equals the deflected shape under a unit displacement.\n- For statically determinate structures, ILs are straight-line segments.',
        example: 'IL for a simply supported beam’s mid-span moment is a triangle peaking at L/4.',
        keyFormulas: 'IL = response vs moving unit load\nMüller–Breslau principle\nTriangle peak ⇒ max effect\nIL ⇒ envelope for design',
        exercise: 'Construct the influence line for the reaction at the left support of a simply supported beam.',
        durationMin: 20,
      },
      {
        slug: 'matrix-stiffness',
        title: 'Matrix Methods (Stiffness)',
        titleAr: 'طرق المصفوفات (الصلابة)',
        order: 4,
        conceptIntroduction: '- Discretise the structure into elements with stiffness matrix k_e.\n- Assemble global K, apply boundary conditions, solve `K·U = P`.\n- Member forces recovered from `F = k_e·u_e`.',
        example: 'A 2-node truss element stiffness k = (EA/L)·[[1,−1],[−1,1]].',
        keyFormulas: 'K·U = P\nk_e (truss) = (EA/L)·[[1,−1],[−1,1]]\nF_member = k_e·u_e\nBoundary ⇒ fix DOF',
        exercise: 'Assemble the global stiffness matrix for a 2-bar pin-jointed truss and solve for the nodal displacement.',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'determinacy-trusses', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'A planar truss has m=7 members, j=5 joints, r=3 reactions. Determinate?', explanation: 'm+r = 10 = 2j = 10 ⇒ statically determinate.', options: [ { text: 'Determinate', isCorrect: true }, { text: 'Indeterminate', isCorrect: false }, { text: 'Unstable', isCorrect: false }, { text: 'Cannot tell', isCorrect: false } ] },
      { lessonSlug: 'determinacy-trusses', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The condition for a planar truss to be statically determinate is:', explanation: 'm + r = 2j.', options: [ { text: 'm + r = 2j', isCorrect: true }, { text: 'm = j', isCorrect: false }, { text: 'm = 2j', isCorrect: false }, { text: 'm + r = 3j', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The method of sections is preferred when forces in only a few specific members are required.', explanation: 'A single cut can isolate up to three unknown member forces for quick equilibrium.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'beams-shear-moment', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The differential relationship between shear and load is:', explanation: 'dV/dx = −w (load intensity).', options: [ { text: 'dV/dx = −w', isCorrect: true }, { text: 'dV/dx = w', isCorrect: false }, { text: 'dV/dx = M', isCorrect: false }, { text: 'dV/dx = V', isCorrect: false } ] },
      { lessonSlug: 'beams-shear-moment', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Simply supported beam, L=4 m, central P=10 kN. M_max?', explanation: 'M_max = PL/4 = 10·4/4 = 10 kN·m.', options: [ { text: '5 kN·m', isCorrect: false }, { text: '10 kN·m', isCorrect: true }, { text: '20 kN·m', isCorrect: false }, { text: '40 kN·m', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In a beam, the maximum bending moment occurs where the shear force is zero.', explanation: 'Since dM/dx = V, the moment peaks where V crosses zero.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'influence-lines', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Müller–Breslau principle states that the influence line shape equals:', explanation: 'The deflected shape under a unit displacement of the released constraint.', options: [ { text: 'The deflected shape under a unit displacement', isCorrect: true }, { text: 'The bending moment diagram', isCorrect: false }, { text: 'The shear diagram', isCorrect: false }, { text: 'The load pattern', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'For statically determinate structures, influence lines are straight-line segments.', explanation: 'Determinacy yields piecewise linear response to a moving unit load.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'matrix-stiffness', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The matrix stiffness method solves:', explanation: 'K·U = P relates global displacements to applied loads.', options: [ { text: 'K·U = P', isCorrect: true }, { text: 'P·U = K', isCorrect: false }, { text: 'U = K·P', isCorrect: false }, { text: 'K = P·U', isCorrect: false } ] },
      { lessonSlug: 'matrix-stiffness', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The truss-element stiffness matrix is:', explanation: 'k_e = (EA/L)·[[1,−1],[−1,1]].', options: [ { text: '(EA/L)·[[1,−1],[−1,1]]', isCorrect: true }, { text: '(EI/L³)·[…]', isCorrect: false }, { text: 'EA·L', isCorrect: false }, { text: 'EA/(L²)', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In the direct stiffness method, element matrices are assembled into the global matrix by:', explanation: 'Element DOFs are mapped to global DOFs and the entries are summed.', options: [ { text: 'Direct assembly (mapping DOFs)', isCorrect: true }, { text: 'Matrix multiplication only', isCorrect: false }, { text: 'Differentiation', isCorrect: false }, { text: 'Division', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Boundary conditions (supports) must be applied before solving K·U = P.', explanation: 'Unsupported systems are singular; supports remove DOFs and make K invertible.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Central deflection of a simply supported beam under central P, span L, EI: δ = ?', explanation: 'δ = PL³/(48EI).', options: [ { text: 'PL³/(48EI)', isCorrect: true }, { text: 'PL³/(3EI)', isCorrect: false }, { text: 'PL²/(8EI)', isCorrect: false }, { text: 'PL³/(192EI)', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 19. Geotechnical Engineering
  // ----------------------------------------------------------
  {
    slug: 'geotechnical-engineering',
    title: 'Geotechnical Engineering',
    titleAr: 'الهندسة الجيوتقنية',
    description: 'Soil classification, effective stress, seepage, compaction, consolidation and shear strength.',
    icon: 'Mountain',
    color: 'orange',
    order: 19,
    lessons: [
      {
        slug: 'soil-properties-classification',
        title: 'Soil Properties & Classification',
        titleAr: 'خصائص وتصنيف التربة',
        order: 1,
        conceptIntroduction: '- Phase relations: void ratio `e = V_v/V_s`, porosity `n = V_v/V`, saturation `S`.\n- Specific gravity G_s; unit weight γ; water content w.\n- USCS classifies soils by grain size and plasticity (CL, ML, CH, SP…).',
        example: 'A saturated soil has γ_sat = 20 kN/m³, G_s = 2.7; find γ_w = 9.81 and γ′ = γ_sat − γ_w = 10.19 kN/m³.',
        keyFormulas: 'e = V_v/V_s\nn = V_v/V\nS = V_w/V_v\nγ_sat = ((G_s+e)·γ_w)/(1+e)',
        exercise: 'Given e=0.6, G_s=2.7, S=1, compute γ_sat (γ_w=9.81).',
        durationMin: 18,
      },
      {
        slug: 'effective-stress-seepage',
        title: 'Effective Stress & Seepage',
        titleAr: 'الإجهاد الفعلي والترشيح',
        order: 2,
        conceptIntroduction: '- Terzaghi’s principle: `σ′ = σ − u`.\n- Darcy’s law: `q = k·i·A`, seepage velocity `v = k·i`.\n- Quick condition when `i_cr = γ′/γ_w` is exceeded (boiling sand).',
        example: 'A soil with γ′=10 kN/m³ has critical hydraulic gradient i_cr = γ′/γ_w = 10/9.81 ≈ 1.02.',
        keyFormulas: "σ' = σ − u\nq = k·i·A\nv = k·i\ni_cr = γ'/γ_w",
        exercise: 'Compute the effective stress at 5 m depth in a saturated soil (γ_sat=20 kN/m³, γ_w=9.81).',
        durationMin: 20,
      },
      {
        slug: 'compaction-consolidation',
        title: 'Compaction & Consolidation',
        titleAr: 'الدمك والتثبت',
        order: 3,
        conceptIntroduction: '- Proctor compaction: optimum moisture content (OMC) for max dry unit weight.\n- Terzaghi 1-D consolidation: `U = function(T_v)`, c_v = k/(m_v·γ_w).\n- Settlement `S = (c_c·H/(1+e₀))·log(σ′/σ₀′)` for normally consolidated clay.',
        example: 'A 5 m clay layer, c_c=0.3, e₀=1.0, σ′ doubles ⇒ S = (0.3·5/2)·log2 ≈ 0.375 m.',
        keyFormulas: 'γ_d,max at OMC\nS = (c_c·H/(1+e₀))·log(σ′/σ₀′)\nc_v = k/(m_v·γ_w)\nU = f(T_v)',
        exercise: 'Estimate the consolidation settlement of a 4 m clay when σ′ rises from 100 to 200 kPa (c_c=0.25, e₀=1.1).',
        durationMin: 22,
      },
      {
        slug: 'shear-strength-earth-pressure',
        title: 'Shear Strength & Earth Pressure',
        titleAr: 'مقاومة القص وضغط التربة',
        order: 4,
        conceptIntroduction: '- Mohr–Coulomb: `τ = c + σ′·tan φ`.\n- Active earth pressure `K_a = tan²(45°−φ/2)`; passive `K_p = tan²(45°+φ/2)`.\n- Rankine active force `P_a = ½·K_a·γ·H²` for a smooth vertical wall.',
        example: 'φ=30° ⇒ K_a = tan²45° = 0.333; for H=5 m, γ=18 kN/m³ ⇒ P_a = 0.5·0.333·18·25 = 75 kN/m.',
        keyFormulas: 'τ = c + σ′·tan φ\nK_a = tan²(45°−φ/2)\nK_p = tan²(45°+φ/2)\nP_a = ½·K_a·γ·H²',
        exercise: 'Find the Rankine active force for H=6 m, φ=30°, γ=18 kN/m³.',
        durationMin: 22,
      },
    ],
    questions: [
      { lessonSlug: 'soil-properties-classification', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Void ratio e is defined as:', explanation: 'e = V_v/V_s — volume of voids divided by volume of solids.', options: [ { text: 'V_v/V_s', isCorrect: true }, { text: 'V_s/V_v', isCorrect: false }, { text: 'V_w/V_s', isCorrect: false }, { text: 'V_v/V_total', isCorrect: false } ] },
      { lessonSlug: 'soil-properties-classification', type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Porosity n and void ratio e are related by n = e/(1+e).', explanation: 'n = V_v/V = e/(1+e) follows from V = V_s + V_v = V_s(1+e).', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'In the USCS, CH denotes:', explanation: 'CH = inorganic clay of high plasticity.', options: [ { text: 'High-plasticity clay', isCorrect: true }, { text: 'Low-plasticity silt', isCorrect: false }, { text: 'Well-graded sand', isCorrect: false }, { text: 'Organic silt', isCorrect: false } ] },
      { lessonSlug: 'effective-stress-seepage', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Terzaghi’s effective stress equation is:', explanation: "σ' = σ − u (total stress minus pore pressure).", options: [ { text: "σ' = σ − u", isCorrect: true }, { text: "σ' = σ + u", isCorrect: false }, { text: "σ' = u", isCorrect: false }, { text: "σ' = σ·u", isCorrect: false } ] },
      { lessonSlug: 'effective-stress-seepage', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Darcy’s law for seepage velocity v is:', explanation: 'v = k·i — discharge velocity equals permeability times hydraulic gradient.', options: [ { text: 'v = k·i', isCorrect: true }, { text: 'v = k/i', isCorrect: false }, { text: 'v = i/k', isCorrect: false }, { text: 'v = k·i²', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Quick condition (boiling sand) occurs when the upward seepage gradient exceeds the critical hydraulic gradient.', explanation: 'When i > i_cr = γ′/γ_w the effective stress drops to zero, the soil “boils”.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'compaction-consolidation', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'On a Proctor compaction curve the optimum moisture content corresponds to:', explanation: 'OMC gives the maximum dry unit weight (γ_d,max).', options: [ { text: 'Maximum dry unit weight', isCorrect: true }, { text: 'Zero air voids', isCorrect: false }, { text: 'Full saturation', isCorrect: false }, { text: 'Maximum moisture', isCorrect: false } ] },
      { lessonSlug: 'compaction-consolidation', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Consolidation settlement of normally consolidated clay is:', explanation: "S = (c_c·H/(1+e₀))·log(σ′/σ₀′).", options: [ { text: "(c_c·H/(1+e₀))·log(σ′/σ₀′)", isCorrect: true }, { text: 'c_c·H', isCorrect: false }, { text: 'H·σ′', isCorrect: false }, { text: 'c_c·log H', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Compaction is a rapid process reducing air voids; consolidation is a slow time-dependent process expelling water.', explanation: 'Compaction is immediate (mechanical), consolidation is time-dependent (drainage).', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'shear-strength-earth-pressure', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Mohr–Coulomb failure criterion is:', explanation: 'τ = c + σ′·tan φ.', options: [ { text: "τ = c + σ′·tan φ", isCorrect: true }, { text: "τ = c − σ′·tan φ", isCorrect: false }, { text: "τ = c·σ′", isCorrect: false }, { text: "τ = σ′/c", isCorrect: false } ] },
      { lessonSlug: 'shear-strength-earth-pressure', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'φ=30°. Rankine K_a?', explanation: 'K_a = tan²(45°−φ/2) = tan²30° = (1/√3)² = 1/3 ≈ 0.333.', options: [ { text: '0.25', isCorrect: false }, { text: '0.333', isCorrect: true }, { text: '0.50', isCorrect: false }, { text: '3.0', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Passive earth pressure exceeds active earth pressure for the same soil and wall.', explanation: 'K_p > 1 > K_a; passive resistance is much greater than active thrust.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'H=5 m, K_a=1/3, γ=18 kN/m³. Rankine active force per metre?', explanation: 'P_a = ½·K_a·γ·H² = 0.5·0.333·18·25 = 75 kN/m.', options: [ { text: '37.5 kN/m', isCorrect: false }, { text: '75 kN/m', isCorrect: true }, { text: '150 kN/m', isCorrect: false }, { text: '225 kN/m', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 20. Transportation Engineering
  // ----------------------------------------------------------
  {
    slug: 'transportation-engineering',
    title: 'Transportation Engineering',
    titleAr: 'هندسة النقل',
    description: 'Highway geometric design, pavement design, traffic flow and rail/airport engineering.',
    icon: 'Car',
    color: 'emerald',
    order: 20,
    lessons: [
      {
        slug: 'highway-geometric-design',
        title: 'Highway Geometric Design',
        titleAr: 'التصميم الهندسي للطرق',
        order: 1,
        conceptIntroduction: '- Stopping sight distance: `SSD = 0.278·V·t + V²/(2·g·(f±G))` (metric, V in km/h).\n- Superelevation `e + f = V²/(g·R)` for horizontal curves.\n- Design speed governs radius, SSD, transition length.',
        example: 'V=80 km/h, f=0.35, R=200 m, no G ⇒ e = V²/(gR) = 80²/(9.81·200·3.6²) ≈ 0.252 (25.2%).',
        keyFormulas: 'SSD = 0.278·V·t + V²/(254(f±G))\ne + f = V²/(g·R)\nR = V²/(g(e+f))\nTransition L_s ∝ V³/(R)',
        exercise: 'Compute the SSD for V=80 km/h, t=2.5 s, f=0.35, G=0.',
        durationMin: 20,
      },
      {
        slug: 'pavement-design',
        title: 'Pavement Design',
        titleAr: 'تصميم الرصف',
        order: 2,
        conceptIntroduction: '- Flexible pavements: layered (surface, base, subbase, subgrade); empirical AASHTO or mechanistic-empirical.\n- Rigid pavements: PCC slab; design by Westergaard stresses.\n- Equivalent axle load factor (EALF) converts mixed traffic to standard axle repetitions.',
        example: 'A 4th-power law: 1 truck axle (80 kN) ≈ 4⁴ = 256 passenger-car equivalents.',
        keyFormulas: 'ESAL = Σ (Wᵢ·EALFᵢ)\nSN = a₁D₁ + a₂D₂m₂ + …\nW_80 ∝ (18 kip)\nCBR-based thickness charts',
        exercise: 'Estimate the ESAL of 1000 trucks (each = 1 ESAL) and 5000 cars (each = 0.0002 ESAL).',
        durationMin: 22,
      },
      {
        slug: 'traffic-engineering',
        title: 'Traffic Engineering',
        titleAr: 'هندسة المرور',
        order: 3,
        conceptIntroduction: '- Traffic flow: q = k·v (vehicles/h, density, speed).\n- Greenshields model: v = v_f·(1 − k/k_j).\n- Webster’s signal timing: cycle C = (1.5L + 5)/(1 − Y), where L = lost time, Y = critical flow ratios.',
        example: 'A road v_f=80 km/h, k_j=100 veh/km. Max flow q_max = v_f·k_j/4 = 80·100/4 = 2000 veh/h.',
        keyFormulas: 'q = k·v\nv = v_f(1 − k/k_j)\nq_max = v_f·k_j/4\nC = (1.5L + 5)/(1 − Y)',
        exercise: 'Use Greenshields to compute q_max for v_f=100 km/h, k_j=125 veh/km.',
        durationMin: 20,
      },
      {
        slug: 'railways-airports',
        title: 'Railways & Airports',
        titleAr: 'السكك الحديدية والمطارات',
        order: 4,
        conceptIntroduction: '- Rail: gauge (standard 1435 mm), coning of wheels, sleeper spacing; turnouts and crossings.\n- Airport components: runway, taxiway, apron; runway length governed by take-off distance and altitude/temperature corrections.\n- Harbour and port layout complement multimodal transport.',
        example: 'Runway length correction for elevation ≈ 7% per 300 m rise above MSL (ICAO rule of thumb).',
        keyFormulas: 'Gauge = 1435 mm standard\nRunway length corr. ≈ 7%/300 m\nSleeper spacing ≈ 0.6–0.7 m\nCant e = G·V²/(g·R)',
        exercise: 'Calculate the equilibrium cant for a 1435 mm gauge, V=80 km/h, R=1000 m.',
        durationMin: 18,
      },
    ],
    questions: [
      { lessonSlug: 'highway-geometric-design', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Stopping sight distance depends on:', explanation: 'SSD depends on speed, perception-reaction time and friction.', options: [ { text: 'Speed, perception-reaction time, friction', isCorrect: true }, { text: 'Only the gradient', isCorrect: false }, { text: 'Only the design vehicle length', isCorrect: false }, { text: 'Only the pavement type', isCorrect: false } ] },
      { lessonSlug: 'highway-geometric-design', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'For horizontal curves, superelevation e + f equals:', explanation: 'e + f = V²/(g·R) balances centripetal acceleration.', options: [ { text: 'V²/(g·R)', isCorrect: true }, { text: 'V·R/g', isCorrect: false }, { text: 'g·R/V²', isCorrect: false }, { text: 'V·g/R', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Higher design speed requires longer sight distance and larger curve radius.', explanation: 'Higher speed raises SSD and R, both for safety.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'pavement-design', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A flexible pavement is characterised by:', explanation: 'Layered flexible structure (surface + base + subbase) distributing loads.', options: [ { text: 'Layered flexible structure', isCorrect: true }, { text: 'Single rigid slab', isCorrect: false }, { text: 'Continuous steel deck', isCorrect: false }, { text: 'Soil-only surface', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'AASHTO’s 4th-power law converts axle loads using the ratio:', explanation: 'Damage ∝ (load/standard)⁴.', options: [ { text: '(P/P_std)⁴', isCorrect: true }, { text: '(P/P_std)²', isCorrect: false }, { text: '(P/P_std)', isCorrect: false }, { text: '(P/P_std)³', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Rigid pavements are designed by Westergaard analysis of stresses in the PCC slab.', explanation: 'Westergaard computed edge/interior/corner stresses in concrete slabs.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'traffic-engineering', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The fundamental traffic-flow relation is:', explanation: 'q = k·v (flow = density × speed).', options: [ { text: 'q = k·v', isCorrect: true }, { text: 'q = k + v', isCorrect: false }, { text: 'q = k/v', isCorrect: false }, { text: 'q = v/k', isCorrect: false } ] },
      { lessonSlug: 'traffic-engineering', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Greenshields: v_f=80 km/h, k_j=100 veh/km. q_max?', explanation: 'q_max = v_f·k_j/4 = 80·100/4 = 2000 veh/h.', options: [ { text: '1000 veh/h', isCorrect: false }, { text: '2000 veh/h', isCorrect: true }, { text: '4000 veh/h', isCorrect: false }, { text: '800 veh/h', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'In Greenshields model, speed decreases linearly with traffic density.', explanation: 'v = v_f·(1 − k/k_j) is linear in k.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'railways-airports', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The standard railway gauge is:', explanation: 'Standard gauge = 1435 mm.', options: [ { text: '1000 mm', isCorrect: false }, { text: '1435 mm', isCorrect: true }, { text: '1676 mm', isCorrect: false }, { text: '762 mm', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Runway length corrections account primarily for:', explanation: 'Elevation and temperature reduce air density, lengthening take-off distance.', options: [ { text: 'Elevation and temperature', isCorrect: true }, { text: 'Pavement colour only', isCorrect: false }, { text: 'Number of passengers only', isCorrect: false }, { text: 'Taxiway length', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Cant (superelevation) on a railway curve balances the centrifugal force on the moving train.', explanation: 'e = G·V²/(g·R) raises the outer rail to counter centrifugal acceleration.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Webster signal cycle: L=4 s lost, Y=0.5. C?', explanation: 'C = (1.5·4 + 5)/(1 − 0.5) = 11/0.5 = 22 s (typical illustrative; in practice larger).', options: [ { text: '11 s', isCorrect: false }, { text: '22 s', isCorrect: true }, { text: '44 s', isCorrect: false }, { text: '88 s', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 21. Environmental Engineering
  // ----------------------------------------------------------
  {
    slug: 'environmental-engineering',
    title: 'Environmental Engineering',
    titleAr: 'الهندسة البيئية',
    description: 'Water and wastewater treatment, air pollution control and solid-waste management.',
    icon: 'Leaf',
    color: 'lime',
    order: 21,
    lessons: [
      {
        slug: 'water-treatment',
        title: 'Water Treatment',
        titleAr: 'معالجة المياه',
        order: 1,
        conceptIntroduction: '- Treatment train: screening → coagulation/flocculation → sedimentation → filtration → disinfection.\n- Chlorine demand: dose = demand + residual.\n- Ct value governs disinfection (concentration × contact time).',
        example: '5 mg/L chlorine demand, 0.2 mg/L residual ⇒ dose = 5.2 mg/L.',
        keyFormulas: 'Dose = demand + residual\nCt = C·t (disinfection)\nv_o = Q/A (sediment)\nv_s ≥ overflow rate',
        exercise: 'Size a sedimentation tank for Q=0.1 m³/s with overflow rate 25 m/d.',
        durationMin: 18,
      },
      {
        slug: 'wastewater-treatment',
        title: 'Wastewater Treatment',
        titleAr: 'معالجة مياه الصرف',
        order: 2,
        conceptIntroduction: '- BOD5 ≈ 0.68·BOD_u; COD ≥ BOD.\n- Activated sludge: F/M ratio, MLSS, SRT, return ratio R.\n- Trickling filters and anaerobic digestion complement aerobic processes.',
        example: 'F/M = 0.3 (low-rate plant) and MLSS = 2500 mg/L typical.',
        keyFormulas: 'BOD5 ≈ 0.68·BOD_u\nF/M = Q·S/(V·X)\nSRT = V·X/(Q_w·X_r + Q_e·X_e)\nθ_c = solids retention time',
        exercise: 'Compute the F/M ratio for Q=1000 m³/d, S=200 mg/L, V=500 m³, X=3000 mg/L.',
        durationMin: 20,
      },
      {
        slug: 'air-pollution-control',
        title: 'Air Pollution Control',
        titleAr: 'مكافحة تلوث الهواء',
        order: 3,
        conceptIntroduction: '- Particulate control: gravity settlers, cyclones, ESP, baghouses.\n- ESP migration velocity: w; collection efficiency Deutsch–Anderson η = 1 − e^(−A·w/Q).\n- Gaseous control: absorption (scrubbers), adsorption (activated carbon), catalytic converters.',
        example: 'ESP efficiency 99% typical for coal fly ash.',
        keyFormulas: 'η_ESP = 1 − e^(−A·w/Q)\nΔP_cyclone ≈ k·ρ·v²/2\nA/C ratio (baghouse)\nHAPs controlled by RTO',
        exercise: 'Estimate ESP efficiency given A·w/Q = 4.6 ⇒ η = 1 − e^(−4.6) ≈ 99%.',
        durationMin: 20,
      },
      {
        slug: 'solid-waste-management',
        title: 'Solid Waste Management',
        titleAr: 'إدارة النفايات الصلبة',
        order: 4,
        conceptIntroduction: '- Hierarchy: reduce → reuse → recycle → recover → dispose.\n- Landfill design: liner, leachate collection, gas (CH₄/CO₂) recovery.\n- Incineration reduces volume ~90%; energy recovery via waste-to-energy.',
        example: 'A typical landfill gas is ~50–60% CH₄, captured for energy.',
        keyFormulas: 'Waste-to-energy ~ 600 kWh/t\nLandfill gas CH₄ ~ 50%\nRecycling rate = m_recycled/m_total\nLeachate = Q_in + Q_gen − Q_out',
        exercise: 'Estimate the electrical energy from a 100 t/day WTE plant (assume 600 kWh/t).',
        durationMin: 16,
      },
    ],
    questions: [
      { lessonSlug: 'water-treatment', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The conventional water-treatment train order is:', explanation: 'Screening → coagulation/flocculation → sedimentation → filtration → disinfection.', options: [ { text: 'Coag → sed → filt → disinfect', isCorrect: true }, { text: 'Disinfect → coag → filt', isCorrect: false }, { text: 'Filt → sed → coag', isCorrect: false }, { text: 'Sed → disinfect only', isCorrect: false } ] },
      { lessonSlug: 'water-treatment', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Chlorine demand=5 mg/L, residual=0.2 mg/L. Dose?', explanation: 'Dose = demand + residual = 5.2 mg/L.', options: [ { text: '4.8 mg/L', isCorrect: false }, { text: '5.0 mg/L', isCorrect: false }, { text: '5.2 mg/L', isCorrect: true }, { text: '25 mg/L', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The Ct value (concentration × contact time) governs disinfection effectiveness.', explanation: 'Higher Ct gives higher inactivation of pathogens.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'wastewater-treatment', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'BOD5 is approximately:', explanation: 'BOD5 ≈ 0.68·BOD_u (the 5-day BOD is ~68% of ultimate).', options: [ { text: '0.68·BOD_u', isCorrect: true }, { text: '2·BOD_u', isCorrect: false }, { text: 'BOD_u/10', isCorrect: false }, { text: 'BOD_u', isCorrect: false } ] },
      { lessonSlug: 'wastewater-treatment', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The activated-sludge F/M ratio is:', explanation: 'F/M = Q·S/(V·X).', options: [ { text: 'Q·S/(V·X)', isCorrect: true }, { text: 'V·X/(Q·S)', isCorrect: false }, { text: 'Q/V', isCorrect: false }, { text: 'S/X', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'COD is generally greater than or equal to BOD for the same wastewater.', explanation: 'COD oxidises more (non-biodegradable included) than BOD.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'air-pollution-control', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Deutsch–Anderson ESP efficiency is:', explanation: 'η = 1 − e^(−A·w/Q).', options: [ { text: '1 − e^(−A·w/Q)', isCorrect: true }, { text: 'e^(−A·w/Q)', isCorrect: false }, { text: 'A·w/Q', isCorrect: false }, { text: '1 − Q/(A·w)', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A cyclone separator removes particulates primarily by:', explanation: 'Centrifugal force throws heavier particles to the wall.', options: [ { text: 'Centrifugal force', isCorrect: true }, { text: 'Electrostatic attraction', isCorrect: false }, { text: 'Chemical reaction', isCorrect: false }, { text: 'Gravity alone', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Baghouses collect particulates using fabric filters.', explanation: 'Baghouses are fabric-filter particulate collectors.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'solid-waste-management', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The solid-waste management hierarchy ranks first:', explanation: 'Source reduction (reduce) is at the top of the hierarchy.', options: [ { text: 'Reduce', isCorrect: true }, { text: 'Landfilling', isCorrect: false }, { text: 'Incineration', isCorrect: false }, { text: 'Recycling only', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A modern sanitary landfill typically includes:', explanation: 'Liner, leachate collection, daily cover, and gas recovery systems.', options: [ { text: 'Liner, leachate collection, gas recovery', isCorrect: true }, { text: 'Open dumping only', isCorrect: false }, { text: 'No liners', isCorrect: false }, { text: 'Incineration chambers', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Incineration can reduce the volume of solid waste by approximately 90%.', explanation: 'Mass burning can cut volume by ~90%, with energy recovery.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'WTE plant at 600 kWh/t. Energy from 100 t/day?', explanation: '100 × 600 = 60 000 kWh/day.', options: [ { text: '6 000 kWh/d', isCorrect: false }, { text: '60 000 kWh/d', isCorrect: true }, { text: '600 000 kWh/d', isCorrect: false }, { text: '600 kWh/d', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 22. Hydraulics & Hydrology
  // ----------------------------------------------------------
  {
    slug: 'hydraulics-and-hydrology',
    title: 'Hydraulics & Hydrology',
    titleAr: 'الهيدروليكا والهيدرولوجيا',
    description: 'Pipe and open-channel flow, hydrologic analysis and major hydraulic structures.',
    icon: 'Droplets',
    color: 'sky',
    order: 22,
    lessons: [
      {
        slug: 'pipe-flow-minor-losses',
        title: 'Pipe Flow & Minor Losses',
        titleAr: 'تدفق الأنابيب والخسائر الصغيرة',
        order: 1,
        conceptIntroduction: '- Darcy–Weisbach: `h_f = f·(L/D)·(V²/2g)`.\n- Hazen–Williams: `V = 0.849·C·R^0.63·S^0.54`.\n- Minor losses: `h_m = K·(V²/2g)` for valves, bends, expansions.',
        example: 'For f=0.02, L=100 m, D=0.1 m, V=2 m/s ⇒ h_f = 0.02·1000·0.204 ≈ 4.08 m.',
        keyFormulas: 'h_f = f·(L/D)·(V²/2g)\nRe = ρVD/μ; f = Moody\nHazen–Williams: V=0.849·C·R^0.63·S^0.54\nh_m = K·(V²/2g)',
        exercise: 'Compute h_f for L=200 m, D=0.05 m, f=0.025, V=1.5 m/s.',
        durationMin: 20,
      },
      {
        slug: 'open-channel-flow',
        title: 'Open Channel Flow',
        titleAr: 'التدفق في القنوات المفتوحة',
        order: 2,
        conceptIntroduction: '- Manning’s equation: `Q = (1/n)·A·R^(2/3)·S^(1/2)` (SI).\n- Critical flow: Fr = 1; subcritical Fr<1; supercritical Fr>1.\n- Specific energy E = y + V²/(2g); minimum at critical depth.',
        example: 'Rectangular channel, b=2 m, y=1 m, n=0.013, S=0.001, Q = (1/0.013)·2·(2/4)^(2/3)·√0.001 ≈ 2.43 m³/s.',
        keyFormulas: 'Q = (1/n)·A·R^(2/3)·S^(1/2)\nFr = V/√(g·y)\nE = y + V²/(2g)\ny_c = (q²/g)^(1/3)',
        exercise: 'Find the critical depth for a rectangular channel with q=2 m²/s.',
        durationMin: 22,
      },
      {
        slug: 'hydrology-hydrographs',
        title: 'Hydrology & Hydrographs',
        titleAr: 'الهيدرولوجيا والهيدروغراف',
        order: 3,
        conceptIntroduction: '- Rainfall–runoff: rational method `Q_p = C·i·A` (small catchments).\n- Unit hydrograph: 1 cm runoff for unit duration; convolution yields storm hydrograph.\n- Return period T; risk R = 1 − (1 − 1/T)^n over n years.',
        example: '100-year flood (T=100) ⇒ annual exceedance probability 1%.',
        keyFormulas: 'Q_p = C·i·A\nP = 1/T\nR_n = 1 − (1 − 1/T)^n\nSCS-CN: Q = (P−0.2S)²/(P+0.8S)',
        exercise: 'Compute the risk over a 10-year period for a 50-year flood (T=50).',
        durationMin: 22,
      },
      {
        slug: 'hydraulic-structures',
        title: 'Hydraulic Structures (Dams & Pumps)',
        titleAr: 'المنشآت الهيدروليكية (السدود والمضخات)',
        order: 4,
        conceptIntroduction: '- Weir discharge: `Q = C_d·b·√(2g)·H^(3/2)` (sharp-crested).\n- Turbine/pump specific speed; affinity laws: Q∝N, H∝N², P∝N³.\n- Cavitation when local pressure drops below vapour pressure.',
        example: 'Sharp weir, b=2 m, H=0.3 m, C_d=0.6 ⇒ Q ≈ 0.6·2·√(2g)·0.3^(3/2) ≈ 0.524 m³/s.',
        keyFormulas: 'Q_weir = C_d·b·√(2g)·H^(3/2)\nAffinity laws: Q∝N, H∝N², P∝N³\nNPSH ≥ NPSH_required\nσ = (NPSH)/H',
        exercise: 'Compute the discharge over a sharp-crested weir for b=1.5 m, H=0.4 m, C_d=0.62.',
        durationMin: 20,
      },
    ],
    questions: [
      { lessonSlug: 'pipe-flow-minor-losses', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The Darcy–Weisbach head loss equation is:', explanation: 'h_f = f·(L/D)·(V²/2g).', options: [ { text: 'f·(L/D)·(V²/2g)', isCorrect: true }, { text: 'f·L·D/V²', isCorrect: false }, { text: 'f·V²·D/L', isCorrect: false }, { text: 'f·L/D', isCorrect: false } ] },
      { lessonSlug: 'pipe-flow-minor-losses', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'f=0.02, L=100 m, D=0.1 m, V=2 m/s. h_f? (g=9.81)', explanation: 'h_f = 0.02·(100/0.1)·(4/19.62) = 0.02·1000·0.204 ≈ 4.08 m.', options: [ { text: '0.41 m', isCorrect: false }, { text: '4.08 m', isCorrect: true }, { text: '40.8 m', isCorrect: false }, { text: '0.02 m', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Minor losses are expressed as h_m = K·(V²/2g).', explanation: 'K is the loss coefficient for fittings/valves.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'open-channel-flow', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Manning’s equation (SI) is:', explanation: 'Q = (1/n)·A·R^(2/3)·S^(1/2).', options: [ { text: 'Q = (1/n)·A·R^(2/3)·S^(1/2)', isCorrect: true }, { text: 'Q = n·A·R·S', isCorrect: false }, { text: 'Q = A·√(g·R·S)', isCorrect: false }, { text: 'Q = A·V', isCorrect: false } ] },
      { lessonSlug: 'open-channel-flow', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Critical flow occurs when the Froude number equals:', explanation: 'Fr = 1 marks critical flow.', options: [ { text: '1', isCorrect: true }, { text: '0', isCorrect: false }, { text: '0.5', isCorrect: false }, { text: '∞', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Specific energy E = y + V²/(2g) reaches its minimum at critical depth.', explanation: 'The E–y curve has its minimum at the critical depth.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'hydrology-hydrographs', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The rational method for peak runoff is:', explanation: 'Q_p = C·i·A (small urban catchments).', options: [ { text: 'Q_p = C·i·A', isCorrect: true }, { text: 'Q_p = A/i', isCorrect: false }, { text: 'Q_p = C·A²', isCorrect: false }, { text: 'Q_p = i/A', isCorrect: false } ] },
      { lessonSlug: 'hydrology-hydrographs', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'T=100 yr. Annual exceedance probability?', explanation: 'P = 1/T = 1/100 = 0.01 (1%).', options: [ { text: '0.001', isCorrect: false }, { text: '0.01', isCorrect: true }, { text: '0.10', isCorrect: false }, { text: '1.0', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A unit hydrograph is the runoff hydrograph resulting from 1 unit of effective rainfall of unit duration.', explanation: 'That is the definition of a unit hydrograph.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'hydraulic-structures', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'A sharp-crested weir discharge is:', explanation: 'Q = C_d·b·√(2g)·H^(3/2).', options: [ { text: 'C_d·b·√(2g)·H^(3/2)', isCorrect: true }, { text: 'C_d·b·H²', isCorrect: false }, { text: 'b·H·V', isCorrect: false }, { text: 'C_d·b·g', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The pump affinity laws state that flow rate Q scales as:', explanation: 'Q ∝ N (pump speed).', options: [ { text: 'N', isCorrect: true }, { text: 'N²', isCorrect: false }, { text: 'N³', isCorrect: false }, { text: '1/N', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Hard', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Cavitation occurs when the local fluid pressure falls below the vapour pressure.', explanation: 'Pressure below vapour pressure forms vapour bubbles that collapse, damaging surfaces.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'Sharp weir, b=2 m, H=0.3 m, C_d=0.6. Q? (g=9.81)', explanation: 'Q ≈ 0.6·2·√(19.62)·0.3^1.5 ≈ 0.6·2·4.43·0.1643 ≈ 0.524 m³/s.', options: [ { text: '0.0524 m³/s', isCorrect: false }, { text: '0.524 m³/s', isCorrect: true }, { text: '5.24 m³/s', isCorrect: false }, { text: '52.4 m³/s', isCorrect: false } ] },
    ],
  },

  // ----------------------------------------------------------
  // 23. Engineering Economics & Management
  // ----------------------------------------------------------
  {
    slug: 'engineering-economics-management',
    title: 'Engineering Economics & Management',
    titleAr: 'الاقتصاد الهندسي والإدارة',
    description: 'Time value of money, project appraisal, PERT/CPM and inventory/decision analysis.',
    icon: 'TrendingUp',
    color: 'teal',
    order: 23,
    lessons: [
      {
        slug: 'time-value-money',
        title: 'Time Value of Money',
        titleAr: 'القيمة الزمنية للنقود',
        order: 1,
        conceptIntroduction: '- Compound amount: `F = P(1+i)ⁿ`.\n- Present worth: `P = F/(1+i)ⁿ`.\n- Uniform-series capital recovery: `A = P·i·(1+i)ⁿ/[(1+i)ⁿ − 1]`.',
        example: 'P=1000, i=10%, n=3 → F = 1000·1.1³ = 1331.',
        keyFormulas: 'F = P(1+i)ⁿ\nP = F/(1+i)ⁿ\nA = P·i(1+i)ⁿ/[(1+i)ⁿ − 1]\nP/A = [(1+i)ⁿ − 1]/[i(1+i)ⁿ]',
        exercise: 'Find the future value of 5000 invested at 8% for 5 years (compounded annually).',
        durationMin: 18,
      },
      {
        slug: 'cash-flow-irr-bc',
        title: 'Cash Flow & IRR / B–C',
        titleAr: 'التدفق النقدي وIRR و B-C',
        order: 2,
        conceptIntroduction: '- NPV = Σ CFₜ/(1+i)ᵗ − I₀; accept project if NPV>0.\n- IRR: discount rate making NPV=0; accept if IRR ≥ MARR.\n- Benefit–Cost ratio B/C = PV(benefits)/PV(costs); accept if ≥ 1.',
        example: 'Project CF: −100, +60, +60, i=10% → NPV ≈ −100 + 54.55 + 49.59 = +4.14 (>0).',
        keyFormulas: 'NPV = Σ CFₜ/(1+i)ᵗ − I₀\nIRR: NPV = 0\nB/C = PV(benefits)/PV(costs)\nPayback = years to recover I',
        exercise: 'Compute the IRR for CFs −100, +50, +60 (use trial-and-error).',
        durationMin: 20,
      },
      {
        slug: 'project-management-pert-cpm',
        title: 'Project Management (PERT/CPM)',
        titleAr: 'إدارة المشروعات (PERT/CPM)',
        order: 3,
        conceptIntroduction: '- Network (AON/AOA); critical path = longest path; slack = LF − ES − d.\n- PERT expected time t_e = (t_o + 4t_m + t_p)/6; variance σ² = ((t_p − t_o)/6)².\n- Crashing shortens duration at added cost; choose lowest cost-slope critical activities.',
        example: 'PERT: t_o=4, t_m=6, t_p=14 ⇒ t_e = (4+24+14)/6 = 7; σ = (14−4)/6 ≈ 1.67.',
        keyFormulas: 't_e = (t_o + 4t_m + t_p)/6\nσ² = ((t_p − t_o)/6)²\nCP = longest path\nCrash slope = Δcost/Δtime',
        exercise: 'Draw the network for activities A→B→C with durations 3, 4, 2 and find the project duration.',
        durationMin: 22,
      },
      {
        slug: 'inventory-decision-analysis',
        title: 'Inventory & Decision Analysis',
        titleAr: 'تحليل المخزون والقرار',
        order: 4,
        conceptIntroduction: '- EOQ: `Q* = √(2·D·S/H)`.\n- Reorder point ROP = d·L (demand × lead time).\n- Decision trees with EMV; choose the branch with highest expected monetary value.',
        example: 'D=1000/yr, S=$50/order, H=$5/unit/yr ⇒ EOQ = √(2·1000·50/5) = √20 000 ≈ 141 units.',
        keyFormulas: 'EOQ = √(2DS/H)\nROP = d·L\nEMV = Σ pᵢ·Vᵢ\nTC(Q) = (D/Q)·S + (Q/2)·H',
        exercise: 'Compute EOQ for D=5000/yr, S=$20, H=$2/unit/yr.',
        durationMin: 18,
      },
    ],
    questions: [
      { lessonSlug: 'time-value-money', type: 'MultipleChoice', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The compound-amount factor (F/P, i, n) is:', explanation: 'F = P·(1+i)ⁿ.', options: [ { text: '(1+i)ⁿ', isCorrect: true }, { text: '1/(1+i)ⁿ', isCorrect: false }, { text: '(1+i)·n', isCorrect: false }, { text: 'i·n', isCorrect: false } ] },
      { lessonSlug: 'time-value-money', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'P=1000, i=10%, n=3. F?', explanation: 'F = 1000·1.1³ = 1331.', options: [ { text: '1100', isCorrect: false }, { text: '1300', isCorrect: false }, { text: '1331', isCorrect: true }, { text: '1500', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Easy', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'Present value P = F/(1+i)ⁿ.', explanation: 'Discounting the future value to today at rate i.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'cash-flow-irr-bc', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'NPV is computed as:', explanation: 'NPV = Σ CFₜ/(1+i)ᵗ − I₀.', options: [ { text: 'Σ CFₜ/(1+i)ᵗ − I₀', isCorrect: true }, { text: 'Σ CFₜ − I₀', isCorrect: false }, { text: 'I₀ − Σ CFₜ', isCorrect: false }, { text: 'Σ CFₜ·(1+i)ᵗ', isCorrect: false } ] },
      { lessonSlug: 'cash-flow-irr-bc', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'A project is acceptable when NPV:', explanation: 'Positive NPV means benefits exceed costs at the discount rate.', options: [ { text: '> 0', isCorrect: true }, { text: '< 0', isCorrect: false }, { text: '= 0', isCorrect: false }, { text: '≤ I₀', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The internal rate of return (IRR) is the discount rate that makes NPV = 0.', explanation: 'IRR is defined by NPV(IRR) = 0.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'project-management-pert-cpm', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'PERT expected time t_e is:', explanation: 't_e = (t_o + 4t_m + t_p)/6.', options: [ { text: '(t_o + 4t_m + t_p)/6', isCorrect: true }, { text: '(t_o + t_p)/2', isCorrect: false }, { text: 't_m', isCorrect: false }, { text: '(t_o + 2t_m + t_p)/4', isCorrect: false } ] },
      { lessonSlug: 'project-management-pert-cpm', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'PERT: t_o=4, t_m=6, t_p=14. t_e?', explanation: 't_e = (4 + 24 + 14)/6 = 42/6 = 7.', options: [ { text: '6', isCorrect: false }, { text: '7', isCorrect: true }, { text: '9', isCorrect: false }, { text: '14', isCorrect: false } ] },
      { type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The critical path in a CPM network is the:', explanation: 'The longest path through the network defines the project duration.', options: [ { text: 'Longest path through the network', isCorrect: true }, { text: 'Shortest path', isCorrect: false }, { text: 'Path with most activities', isCorrect: false }, { text: 'Path with least cost', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'Slack (float) is the time an activity can slip without delaying the project.', explanation: 'Slack = LF − ES − d for the activity.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
      { lessonSlug: 'inventory-decision-analysis', type: 'MultipleChoice', difficulty: 'Medium', bloomLevel: 'Remember', skillType: 'Definitional', stem: 'The economic order quantity (EOQ) is:', explanation: 'EOQ = √(2·D·S/H).', options: [ { text: '√(2DS/H)', isCorrect: true }, { text: '√(2DH/S)', isCorrect: false }, { text: 'D·S/H', isCorrect: false }, { text: '2·D·S/H', isCorrect: false } ] },
      { lessonSlug: 'inventory-decision-analysis', type: 'MultipleChoice', difficulty: 'Hard', bloomLevel: 'Apply', skillType: 'Numerical', stem: 'D=1000/yr, S=$50, H=$5/yr. EOQ?', explanation: 'EOQ = √(2·1000·50/5) = √20 000 ≈ 141.', options: [ { text: '50', isCorrect: false }, { text: '100', isCorrect: false }, { text: '141', isCorrect: true }, { text: '500', isCorrect: false } ] },
      { type: 'TrueFalse', difficulty: 'Medium', bloomLevel: 'Understand', skillType: 'Conceptual', stem: 'The reorder point equals demand during lead time (assuming no safety stock).', explanation: 'ROP = d·L (demand × lead time) when no safety stock is carried.', options: [ { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false } ] },
    ],
  },

];

// ============================================================
// runSeed — Prisma upsert runner
// ============================================================
//
// Idempotent: safe to call repeatedly. With { reset: true } it wipes the
// question/lesson/section/matrix tables (respecting FK order) and re-inserts.
// Without reset it upserts sections & lessons and creates questions only if
// missing (dedupe by sectionId + stem), and upserts matrix cells.
//
// Returns final inserted counts.

export async function runSeed(opts?: {
  reset?: boolean;
}): Promise<{ sections: number; lessons: number; questions: number; cells: number }> {
  const reset = opts?.reset ?? false;
  let sections = 0;
  let lessons = 0;
  let questions = 0;
  let cells = 0;

  // 1) Optional hard reset — delete in FK-respecting order (children first).
  if (reset) {
    await db.quizAnswer.deleteMany();
    await db.quizAttempt.deleteMany();
    await db.questionOption.deleteMany();
    await db.question.deleteMany();
    await db.lesson.deleteMany();
    await db.generationMatrixCell.deleteMany();
    await db.section.deleteMany();
  }

  // 2) Sections → Lessons → Questions → Matrix cells
  for (const s of SEED_SECTIONS) {
    const section = await db.section.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        title: s.title,
        titleAr: s.titleAr,
        description: s.description,
        icon: s.icon,
        color: s.color,
        order: s.order,
      },
      update: {
        title: s.title,
        titleAr: s.titleAr,
        description: s.description,
        icon: s.icon,
        color: s.color,
        order: s.order,
      },
    });
    sections++;

    // 2a) Lessons — upsert by composite key (sectionId, slug)
    for (const l of s.lessons) {
      await db.lesson.upsert({
        where: { sectionId_slug: { sectionId: section.id, slug: l.slug } },
        create: {
          sectionId: section.id,
          slug: l.slug,
          title: l.title,
          titleAr: l.titleAr,
          order: l.order,
          conceptIntroduction: l.conceptIntroduction,
          example: l.example,
          keyFormulas: l.keyFormulas,
          exercise: l.exercise,
          durationMin: l.durationMin,
        },
        update: {
          title: l.title,
          titleAr: l.titleAr,
          order: l.order,
          conceptIntroduction: l.conceptIntroduction,
          example: l.example,
          keyFormulas: l.keyFormulas,
          exercise: l.exercise,
          durationMin: l.durationMin,
        },
      });
      lessons++;
    }

    // 2b) Questions — create-with-nested-options. On reset we wiped, so create
    // is safe. Without reset we dedupe by (sectionId + stem) first.
    for (const q of s.questions) {
      // Resolve optional lesson link (lookup by sectionId + lessonSlug).
      let lessonId: string | null = null;
      if (q.lessonSlug) {
        const lesson = await db.lesson.findUnique({
          where: { sectionId_slug: { sectionId: section.id, slug: q.lessonSlug } },
          select: { id: true },
        });
        lessonId = lesson?.id ?? null;
      }

      if (reset) {
        await db.question.create({
          data: {
            sectionId: section.id,
            lessonId,
            type: q.type,
            difficulty: q.difficulty,
            bloomLevel: q.bloomLevel,
            skillType: q.skillType,
            stem: q.stem,
            explanation: q.explanation,
            options: {
              create: q.options.map((o, i) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: i,
              })),
            },
          },
        });
        questions++;
      } else {
        const existing = await db.question.findFirst({
          where: { sectionId: section.id, stem: q.stem },
          select: { id: true },
        });
        if (!existing) {
          await db.question.create({
            data: {
              sectionId: section.id,
              lessonId,
              type: q.type,
              difficulty: q.difficulty,
              bloomLevel: q.bloomLevel,
              skillType: q.skillType,
              stem: q.stem,
              explanation: q.explanation,
              options: {
                create: q.options.map((o, i) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                  order: i,
                })),
              },
            },
          });
          questions++;
        }
      }
    }

    // 2c) Generation Matrix cells: 3 difficulty × 4 Bloom × 2 type = 24 per
    // section. Upsert targetCount from SEED_MATRIX_TARGETS.
    const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
    const blooms: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze'];
    const types: QuestionType[] = ['MultipleChoice', 'TrueFalse'];
    for (const d of difficulties) {
      for (const b of blooms) {
        for (const t of types) {
          const target = SEED_MATRIX_TARGETS[`${d}:${t}`] ?? 20;
          await db.generationMatrixCell.upsert({
            where: {
              sectionId_difficulty_bloomLevel_type: {
                sectionId: section.id,
                difficulty: d,
                bloomLevel: b,
                type: t,
              },
            },
            create: {
              sectionId: section.id,
              difficulty: d,
              bloomLevel: b,
              type: t,
              targetCount: target,
            },
            update: {
              targetCount: target,
            },
          });
          cells++;
        }
      }
    }
  }

  return { sections, lessons, questions, cells };
}

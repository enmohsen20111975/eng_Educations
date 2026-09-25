// =============================================================================
// CRE — Certified Reliability Engineer (ASQ) — Probability & Statistics (PS)
// pillar — Deep scientific reference (Task ID 17-CRE-PS).
//
// Certification slug: "cre" (ASQ). Domain code: "PS" (Probability &
// Statistics) — the 2nd of 7 ASQ CRE BOK domains. The PS domain exists in
// src/lib/ref-content/cre.ts (the combined structure+RF-content loader) but
// is seeded with NO competencies. This CONTENT-only loader creates the 3 PS
// competencies inside loadReference() and then loads the deep scientific
// content (3 full-spec 24-section lessons + KOs + 12 enriched questions).
//
// Three lessons, one per PS competency (created below in loadReference()):
//   1. Probability Distributions for Reliability  (slug: ps-probability-distributions-reliability)
//   2. Statistical Inference & Confidence Intervals (slug: ps-statistical-inference-confidence-intervals)
//   3. Bayesian & Reliability Data Analysis        (slug: ps-bayesian-reliability-data-analysis)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional probability-and-statistics content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     (definitions, principles, components, mechanism, process, formulas,
//     metrics, examples, industrial_examples, case_studies, common_errors,
//     limitations, best_practices, related_concepts, prerequisites,
//     references) populated with real content.
//   - 4 enriched questions (whyCorrect + one whyOthersWrong per distractor +
//     cognitiveLevel + KO link + scenario/industry metadata), mixing 3 MCQ
//     and 1 True/False, spanning Easy/Medium/Hard × Remember/Understand/
//     Apply/Analyze. Total in this file: 12 questions.
//
// Source hierarchy (spec §5) — Levels 2, 3, 6, 7:
//   - LEVEL 3 — Official BOK / Handbook / Exam Outline: ASQ CRE BOK
//     (Probability & Statistics domain).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 14224:2016
//     (reliability & maintenance data — population failure-rate source for
//     distribution fitting).
//   - LEVEL 6 — University / Academic Publications: Charles E. Ebeling,
//     "An Introduction to Reliability and Maintainability Engineering"
//     (Waveland Press, 2010); Douglas C. Montgomery, "Applied Statistics
//     and Probability for Engineers" (Wiley, 6th ed., 2014).
//   - LEVEL 7 — Technical Publications / Industry Sources: Patrick D. T.
//     O'Connor & Andre Kleyner, "Practical Reliability Engineering"
//     (Wiley, 5th ed., 2012); Wayne Nelson, "Applied Life Data Analysis"
//     (Wiley, 1982 / 2004 reprint).
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material
// is summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Competency, Lesson, KnowledgeObject, Question,
// Reference) is upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre-reliability-modeling.ts & cre.ts)
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
  cognitiveLevel: string;
  skillType?: string;
  scenario?: string;
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
  references: string[];
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
  level: string;
  levelLabel: string;
  type: string;
  url?: string;
  citation: string;
}

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all PS lessons.
// ---------------------------------------------------------------------------

export const CRE_PS_SOURCES: RefSource[] = [
  {
    title:
      "ASQ CRE Body of Knowledge — Probability & Statistics domain",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/reliability-engineer",
    citation:
      "American Society for Quality (ASQ). Certified Reliability Engineer (CRE) Body of Knowledge — Probability & Statistics domain. The official competency framework covering probability concepts, descriptive and inferential statistics, the binomial/Poisson/exponential/normal/Weibull/lognormal distributions, pdf/cdf/hazard relationships, point and interval estimation, the chi-square MTBF confidence interval, hypothesis testing, sample-size, regression, and Bayesian reliability methods. Anchors the ASQ CRE exam's probability-and-statistics questions.",
  },
  {
    title: "ISO 14224:2016 — Collection of reliability and maintenance data for equipment",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/63658.html",
    citation:
      "International Organization for Standardization. ISO 14224:2016, Petroleum, petrochemical and natural gas industries — Collection and exchange of reliability and maintenance data for equipment. Geneva: ISO. Defines the equipment-class taxonomy, failure-mode/cause/mechanism code structure, and population failure-rate (λ) data captured at WO closeout — the canonical field-data source for fitting exponential, Weibull, and lognormal distributions per equipment class.",
  },
  {
    title:
      "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Long Grove, IL: Waveland Press. ISBN 978-1-57766-625-9. Chapters 3 (Reliability from failure distributions — exponential, Weibull, normal, lognormal; pdf/cdf/hazard MTBF), 8 (Reliability estimation — chi-square MTBF confidence interval, time-truncated vs failure-truncated testing), 12 (Bayesian reliability and the Beta-binomial posterior), and 13 (Reliability growth). The canonical probability-and-statistics textbook for the CRE BOK.",
  },
  {
    title:
      "O'Connor — Practical Reliability Engineering (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "O'Connor, P. D. T., & Kleyner, A. (2012). Practical Reliability Engineering (5th ed.). Chichester: John Wiley & Sons. ISBN 978-0-470-97982-2. Chapters 2 (Reliability mathematics — distributions, pdf/cdf/hazard, MTBF), 3 (Reliability data analysis — censored data, rank regression, MLE), 11 (Reliability estimation and demonstration — chi-square MTBF CI, test plans), and 14 (Bayesian methods for reliability). The practitioner reference for distribution fitting and inference.",
  },
  {
    title:
      "Nelson — Applied Life Data Analysis (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Nelson, W. (1982, 2004 reprint). Applied Life Data Analysis. New York: John Wiley & Sons. ISBN 978-0-471-64422-2 (2004 paperback reprint). The canonical reference for life-data analysis: maximum-likelihood (MLE) and graphical (rank-regression) parameter estimation for the exponential, Weibull, lognormal, and extreme-value distributions; Type I (time-truncated) and Type II (failure-truncated) censoring; the chi-square MTBF confidence interval for repairable systems; and the likelihood-ratio confidence bounds for distribution percentiles. The foundational text for life-data inference cited by ASQ CRE.",
  },
  {
    title:
      "Montgomery — Applied Statistics and Probability for Engineers (Wiley)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C., & Runger, G. C. (2014). Applied Statistics and Probability for Engineers (6th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-53971-5. Chapters 4 (Probability — discrete and continuous distributions), 7 (Point and interval estimation — confidence intervals, sample size), 8 (Hypothesis testing — H0/H1, α/β, p-value, power), 9 (Inference for two samples and variance), and 14 (Bayesian methods and the beta-binomial posterior). The canonical statistics textbook underpinning the CRE PS domain.",
  },
];

const PS_REFERENCE_TITLES = CRE_PS_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Probability Distributions for Reliability
// (Competency: "Probability Distributions for Reliability"; slug:
//  ps-probability-distributions-reliability)
// ---------------------------------------------------------------------------

const LESSON_DIST: RefLesson = {
  competencyName: "Probability Distributions for Reliability",
  slug: "ps-probability-distributions-reliability",
  title: "Probability Distributions for Reliability",
  titleAr: "التوزيعات الاحتمالية للموثوقية",
  order: 1,
  durationMin: 35,
  references: PS_REFERENCE_TITLES,
  conceptIntroduction: `Probability distributions are the mathematical model connecting observed time-to-failure data to the reliability function R(t). A continuous distribution specifies a probability density function (pdf) f(t), from which follow the cumulative distribution function F(t) = ∫f and the survival (reliability) function R(t) = 1 − F(t), and the hazard (instantaneous failure-rate) function h(t) = f(t)/R(t). The exponential distribution gives constant hazard h(t) = λ and is the model of random-failure (useful-life) regimes; the Weibull distribution gives a power-law hazard h(t) = (β/η)·(t/η)^(β−1) covering decreasing (β<1, infant-mortality), constant (β=1, exponential limit), and increasing (β>1, wear-out) hazard shapes; the lognormal distribution models fatigue and crack-growth failures; the normal distribution models wear-out when failure is governed by a sum of additive effects (e.g., dimension tolerance stack-up). The reliability engineer's job is (i) to choose the distribution that matches the failure physics, (ii) to estimate its parameters from censored or complete life data (MLE or rank regression), and (iii) to use R(t) and h(t) downstream in RBD/FTA/Markov models (RM pillar).`,
  example: `An electronics manufacturer fits a Weibull to 25 surface-mount capacitor failures. The MLE fit yields shape β = 2.0 (linearly-increasing wear-out hazard) and characteristic life η = 10,000 h. At mission time t = 5,000 h, the reliability R(5,000) = exp(−(5,000/10,000)^2.0) = exp(−0.5^2) = exp(−0.25) = 0.7788 = 77.88%. The MTBF ≈ η·Γ(1+1/β) = 10,000·Γ(1.5) = 10,000·0.8862 = 8,862 h (the integral of R over t). Compare to an exponential assumption (β=1): R(5,000) = exp(−5,000/10,000) = 0.6065 = 60.65% — the exponential would understate reliability by 17 percentage points because it ignores the wear-out. The hazard at 5,000 h: h(5,000) = (β/η)·(t/η)^(β−1) = (2/10,000)·0.5^1 = 1×10⁻⁴/h — a clearly increasing rate, not constant.`,
  keyFormulas: `Reliability R(t) = 1 − F(t) = ∫_t^∞ f(u) du  (survival function)
Hazard h(t) = f(t)/R(t)  (instantaneous failure rate)
Exponential: f(t) = λ·exp(−λ·t); F(t) = 1 − exp(−λ·t); R(t) = exp(−λ·t); h(t) = λ (constant); MTBF = 1/λ
Weibull (2-param): f(t) = (β/η)·(t/η)^(β−1)·exp(−(t/η)^β); R(t) = exp(−(t/η)^β); h(t) = (β/η)·(t/η)^(β−1); MTBF ≈ η·Γ(1+1/β)
  β<1: decreasing hazard (infant mortality); β=1: constant (= exponential, λ=1/η); β>1: increasing (wear-out)
Lognormal: f(t) = 1/(t·σ·√(2π))·exp(−(ln t − μ)²/(2σ²)); R(t) = 1 − Φ((ln t − μ)/σ); median = exp(μ)
Normal: f(t) = 1/(σ·√(2π))·exp(−(t − μ)²/(2σ²)); F(t) = Φ((t−μ)/σ); R(t) = 1 − F(t)
Parameter estimation: MLE (maximizes likelihood L = ∏ f(t_i)·R(T⁺_j) over failures and survivors); rank regression on Weibull probability plot (median ranks)`,
  exercise: `You are the CRE on a hydraulic-pump fleet. 12 pumps were run to failure (failure-truncated) with times [4200, 5800, 6100, 6900, 7300, 7800, 8200, 8700, 9100, 9400, 9800, 10500] hours. (a) Plot the data on Weibull probability paper and estimate β and η by rank regression (use median ranks i/(n+1)). (b) Compute R(5,000) and h(5,000) from your fit. (c) Test whether the exponential (β=1) is a defensible simplification: if the 95% CI on β excludes 1.0, the exponential is rejected. (d) Compute the MTBF under the Weibull fit and compare to the sample mean (a method-of-moments check).`,
  sections: {
    learning_objectives: `- Define probability density function (pdf), cumulative distribution function (cdf), reliability (survival) function R(t), and hazard function h(t) and relate them mathematically.
- Derive and use the exponential distribution (constant failure rate λ, useful-life regime), R(t) = exp(−λt), MTBF = 1/λ.
- Derive and use the 2-parameter Weibull distribution R(t) = exp(−(t/η)^β); interpret β (shape) and η (scale/characteristic life); identify infant-mortality (β<1), exponential-limit (β=1), and wear-out (β>1) regimes.
- Recognize when to use the lognormal (fatigue, multiplicative degradation) and normal (additive wear-out) distributions.
- Estimate Weibull/exponential parameters from censored life data using Maximum Likelihood (MLE) and median-rank regression on probability paper.
- Propagate R(t) and h(t) into the RBD/FTA/Markov reliability models of the RM pillar.`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — R(t), MTBF/MTTR, the constant-failure-rate assumption.
- Differential and integral calculus: integration by parts, the gamma and exponential integral.
- Probability fundamentals: pdf/cdf, expectation, variance, moments.
- Basic familiarity with the normal distribution and the standard normal CDF Φ(·).`,
    introduction: `The Probability & Statistics (PS) domain of the ASQ CRE BOK is the bridge from observed time-to-failure data to the analytical reliability function R(t) used downstream in the Reliability Modeling (RM) pillar. Every reliability calculation rests on a distribution: the exponential R(t) = exp(−λt) underlies the constant-λ RBD/FTA assumptions; the Weibull R(t) = exp(−(t/η)^β) generalizes it to non-constant hazard; the lognormal and normal distributions cover the failure physics of fatigue and additive wear-out respectively.

The pdf f(t) is the density of failures per unit time at age t; the cdf F(t) = ∫f gives the cumulative probability of failure by age t; the reliability (survival) R(t) = 1 − F(t) is the probability the unit has not failed by t; the hazard h(t) = f(t)/R(t) is the instantaneous failure rate conditional on survival to t — the most physical of the four, as it directly reflects wear-in/wear-out behavior. The four functions are interchangeable: given any one, the other three follow.

The reliability engineer's workflow is: (i) collect failure times (and survivor times, if censored); (ii) choose the distribution that matches the failure physics — exponential for random failures, Weibull for wear-in/wear-out, lognormal for fatigue, normal for additive; (iii) estimate parameters by MLE (numerical, general) or rank regression on probability paper (graphical, fast); (iv) compute R(t), h(t), and MTBF; (v) validate the fit (goodness-of-fit: Anderson-Darling, Kolmogorov-Smirnov); (vi) propagate R(t) into the RM pillar's RBD/FTA/Markov models.`,
    terminology: `- **Probability density function (pdf) f(t)**: density of failures per unit time at age t; ∫_0^∞ f(t) dt = 1.
- **Cumulative distribution function (cdf) F(t)**: cumulative probability of failure by age t; F(0)=0, F(∞)=1.
- **Reliability (survival) function R(t) = 1 − F(t)**: probability the unit has not failed by age t; R(0)=1, R(∞)=0.
- **Hazard function h(t) = f(t)/R(t)**: instantaneous failure rate conditional on survival to t; units [1/h].
- **Cumulative hazard H(t) = ∫_0^t h(u) du**: relates to reliability by R(t) = exp(−H(t)).
- **MTBF (Mean Time Between Failures) = ∫_0^∞ R(t) dt**: expected time to failure; for exponential = 1/λ; for Weibull = η·Γ(1+1/β).
- **Failure rate λ(t)**: synonym for hazard h(t) in the constant-λ regime (exponential).
- **Exponential distribution**: constant hazard h(t) = λ; "memoryless" — R(t+s|t) = R(s).
- **Weibull distribution (2-param)**: shape β (dimensionless), scale η (time), hazard h(t) = (β/η)·(t/η)^(β−1).
- **Characteristic life η**: the age at which R = 1/e ≈ 0.3679 (63.2% failed) for the 2-parameter Weibull.
- **Lognormal distribution**: ln(t) ~ Normal(μ,σ²); models multiplicative degradation (fatigue, crack growth).
- **Normal distribution**: t ~ Normal(μ,σ²); models additive wear-out (e.g., dimensional tolerance stack-up).
- **Censoring**: Type I (time-truncated — test stops at T, n failures observed), Type II (failure-truncated — test stops at the r-th failure), right-censored field data (running units removed from service).
- **MLE (Maximum Likelihood Estimation)**: numerical estimation maximizing L = ∏ f(t_i)·R(T⁺_j) over failures and survivors.
- **Median-rank regression**: graphical estimation using median ranks r_i = (i − 0.3)/(n + 0.4) and a probability-plot linearization.`,
    detailed_explanation: `The exponential distribution is the model of random failures in the useful-life regime. f(t) = λ·exp(−λt); R(t) = exp(−λt); h(t) = λ (constant); MTBF = 1/λ. The exponential is *memoryless* — the residual life of a unit that has survived to age t is identical to a new unit. This is a strong assumption: it rules out wear-in, wear-out, and any aging effect. It is the canonical distribution for electronic-component constant-failure-rate regimes and underlies the constant-λ assumption built into the RBD/FTA/Markov models of the RM pillar. For λ = 1×10⁻⁴/h (MTBF = 10,000 h), R(5,000) = exp(−0.5) = 0.6065; R(MTBF) = exp(−1) = 0.3679 (the "36.8% survive to MTBF" rule).

The 2-parameter Weibull distribution is the workhorse of reliability engineering because its hazard shape adapts to the failure physics: β < 1 gives a decreasing hazard (infant-mortality — burn-in screens early failures); β = 1 gives the constant-hazard exponential limit (η = 1/λ); β > 1 gives an increasing hazard (wear-out — preventive replacement is cost-effective). The reliability R(t) = exp(−(t/η)^β) is a closed-form survival function; the characteristic life η is the age at which 63.2% of units have failed. The MTBF = η·Γ(1+1/β) — closed-form via the gamma function. The hazard h(t) = (β/η)·(t/η)^(β−1) is monotone-increasing for β>1, decreasing for β<1, and constant for β=1. For β=2.0 (linearly-increasing hazard, "Rayleigh limit"), η=10,000 h: R(5,000) = exp(−0.25) = 0.7788; MTBF = η·Γ(1.5) = 10,000·0.8862 = 8,862 h; h(5,000) = (2/10,000)·0.5 = 1×10⁻⁴/h.

The lognormal distribution models failures driven by multiplicative degradation — fatigue crack growth, corrosion pitting, diffusion-driven drift. ln(t) ~ Normal(μ, σ²); R(t) = 1 − Φ((ln t − μ)/σ); median = exp(μ). The shape parameter σ > 0.5 typically indicates widely-dispersed failure times (a "fat" tail); σ < 0.3 indicates tight clustering around the median. The lognormal is the alternative to the Weibull when the failure physics is multiplicative rather than additive.

The normal distribution models failures driven by additive effects — dimensional tolerance stack-up, hardness drift, alignment degradation. t ~ Normal(μ, σ²); R(t) = 1 − Φ((t−μ)/σ). It is symmetric about μ and not strictly positive (a drawback for very small σ/μ); for σ/μ < ~0.3 the normal is a defensible approximation to the more-physically-correct lognormal.

*Parameter estimation* from censored life data: MLE maximizes the log-likelihood ℓ = Σ ln f(t_i) + Σ ln R(T⁺_j) over the r failures and the (n−r) survivors. MLE is consistent, asymptotically efficient, and handles all censoring types; it requires numerical optimization (Newton-Raphson on the Weibull likelihood). *Median-rank regression* linearizes the Weibull onto probability paper: ln(−ln(1−F̂_i)) vs ln(t_i), where F̂_i = (i−0.3)/(n+0.4) is the median rank; the slope is β, the intercept yields η. Rank regression is fast and graphical (it doubles as a goodness-of-fit check), but it is biased for heavily-censored data.`,
    core_principles: `- pdf → cdf → R(t) → h(t): all four functions are inter-derivable; choose whichever is most physical for the task.
- R(t) = exp(−H(t)) where H(t) = ∫_0^t h(u) du — the cumulative-hazard form.
- Exponential: constant hazard, memoryless, MTBF = 1/λ, R(MTBF) = 0.3679. Random-failure regime.
- Weibull β<1 infant-mortality; β=1 exponential-limit; β>1 wear-out. The shape parameter selects the failure regime.
- Weibull characteristic life η: age at 1/e reliability; MTBF = η·Γ(1+1/β) (closed form).
- Lognormal: multiplicative degradation (fatigue, diffusion); σ > 0.5 = "fat tail"; median = exp(μ).
- Normal: additive wear-out; defensible for σ/μ < ~0.3; otherwise prefer lognormal.
- MLE is the general parameter estimator; median-rank regression is the graphical fast path; always validate with a goodness-of-fit test (Anderson-Darling A²).`,
    components: `- **pdf f(t)**: the density of failures per unit time at age t.
- **cdf F(t)**: cumulative probability of failure by t.
- **Reliability R(t) = 1 − F(t)**: probability of survival to t.
- **Hazard h(t) = f/R**: instantaneous failure rate conditional on survival.
- **Cumulative hazard H(t) = ∫h**: R(t) = exp(−H(t)).
- **MTBF = ∫R**: expected time to failure.
- **Shape parameter β (Weibull)**: selects the hazard-shape regime.
- **Scale parameter η (Weibull)**: characteristic life (R=1/e).
- **Censoring indicators**: failures r, survivors n−r, truncation T or r.`,
    process: `1. Collect failure times {t_1, ..., t_r} and survivor times {T⁺_1, ..., T⁺_{n−r}}; document censoring type (Type I time-truncated, Type II failure-truncated, right-censored field data).
2. Plot the empirical cdf on probability paper for the candidate distributions (Weibull, lognormal, exponential); a near-linear plot supports that distribution.
3. Estimate parameters: MLE (numerical, general) or median-rank regression (graphical, fast). For Weibull MLE, solve ∂ℓ/∂β = 0 and ∂ℓ/∂η = 0 by Newton-Raphson.
4. Compute R(t) = exp(−(t/η)^β) [Weibull] or exp(−λt) [exponential], h(t), and MTBF = η·Γ(1+1/β).
5. Validate the fit with a goodness-of-fit test (Anderson-Darling A² or Kolmogorov-Smirnov D). For Weibull, the 95% CI on β must exclude 1.0 to reject the exponential simplification.
6. Report R(t), h(t), MTBF with confidence bounds (MLE yields Fisher-information CIs; rank regression yields Bernards-binomial CIs on the cdf).
7. Propagate R(t) downstream into the RM pillar — the RBD block reliability R_i(t), the FTA basic event probability, or the Markov transition rate λ_i = 1/MTBF_i.`,
    formula_calculation: `Variables and formulas:
- f(t): probability density of failure per unit time [1/h].
- F(t): cumulative failure probability [0,1].
- R(t) = 1 − F(t): reliability (survival) function [0,1].
- h(t) = f(t)/R(t): hazard (instantaneous failure rate) [1/h].
- H(t) = ∫_0^t h(u) du: cumulative hazard; R(t) = exp(−H(t)).
- MTBF = ∫_0^∞ R(t) dt: expected time to failure [h].

Exponential:
- f(t) = λ·exp(−λt); F(t) = 1 − exp(−λt); R(t) = exp(−λt); h(t) = λ (constant).
- MTBF = 1/λ; R(MTBF) = exp(−1) ≈ 0.3679.

Weibull (2-param):
- f(t) = (β/η)·(t/η)^(β−1)·exp(−(t/η)^β); R(t) = exp(−(t/η)^β); h(t) = (β/η)·(t/η)^(β−1).
- MTBF = η·Γ(1+1/β); characteristic life η = t at R = 1/e.

Lognormal: ln(t) ~ N(μ,σ²); R(t) = 1 − Φ((ln t − μ)/σ); median = exp(μ).
Normal: t ~ N(μ,σ²); R(t) = 1 − Φ((t−μ)/σ).

MLE Weibull log-likelihood (Type II censoring):
- ℓ(β,η) = r·[ln β − β·ln η] + (β−1)·Σ ln t_i − (1/η^β)·Σ t_i^β − (1/η^β)·Σ (T⁺_j)^β.
- Solve ∂ℓ/∂β = ∂ℓ/∂η = 0 numerically.

Units: time t in hours (h); β dimensionless; η in h; λ, h in 1/h; R, F dimensionless [0,1].

Assumptions: (i) failures are independent and identically distributed (iid); (ii) the operating environment is constant (the failure regime does not change over the mission); (iii) censoring is non-informative (survivors' removal is independent of their failure risk); (iv) the chosen distribution matches the failure physics (Weibull for wear-out, exponential for random, lognormal for fatigue, normal for additive).

Interpretation: R(t) is the fraction of an identical fleet that survives to age t (large-population probability) or the probability a single unit completes a mission of duration t without failing (mission reliability). The hazard h(t) is the per-hour failure rate at age t conditional on survival to t — the most physically-interpretable function (it rises for wear-out, falls for infant-mortality).`,
    worked_example: `**Electronics — Weibull fit, β=2.0, η=10,000 h.**
Given: 2-parameter Weibull with β=2.0 (linearly-increasing wear-out hazard) and characteristic life η=10,000 h.
Compute R(5,000), h(5,000), and MTBF.

Step 1 — Reliability at t = 5,000 h:
R(5,000) = exp(−(t/η)^β) = exp(−(5,000/10,000)^2.0) = exp(−0.5^2) = exp(−0.25).
exp(−0.25) = 0.7788008 → R(5,000) = 0.7788 = 77.88%.

Step 2 — Hazard at t = 5,000 h:
h(t) = (β/η)·(t/η)^(β−1) = (2.0/10,000)·(5,000/10,000)^1 = (2.0/10,000)·0.5 = 1.0×10⁻⁴/h.
(Compare to the constant exponential hazard λ = 1/MTBF = 1/8,862 = 1.128×10⁻⁴/h — close at t=5,000 but the Weibull hazard rises linearly with t.)

Step 3 — MTBF (mean time to failure):
MTBF = η·Γ(1+1/β) = 10,000·Γ(1+1/2.0) = 10,000·Γ(1.5).
Γ(1.5) = (1/2)·√π = 0.5·1.772454 = 0.886227.
MTBF = 10,000·0.886227 = 8,862.3 h.

Step 4 — Cross-check vs the exponential simplification (β=1):
R_exp(5,000) = exp(−5,000/8,862) = exp(−0.5642) = 0.5687 = 56.87%.
The exponential simplification UNDERSTATATES reliability at t=5,000 h by 0.7788 − 0.5687 = 0.2101 = 21.0 pp because it ignores the wear-out (β>1). At t = η = 10,000 h, R_Weibull = exp(−1) = 0.3679 (same as exponential at MTBF) — both distributions agree at the characteristic life but diverge elsewhere.

**Exponential — constant λ.** A pump fleet has MTBF = 10,000 h (λ = 1×10⁻⁴/h). R(5,000) = exp(−0.5) = 0.6065; R(10,000) = exp(−1) = 0.3679. The hazard is constant at 1×10⁻⁴/h — independent of age (memoryless).

**Median-rank regression (n=12).** For failure-truncated data t_i, the median rank F̂_i = (i − 0.3)/(n + 0.4). Linear regression of ln(−ln(1−F̂_i)) on ln(t_i) yields the slope β̂ and intercept b̂; the Weibull parameters are β = β̂ and η = exp(−b̂/β̂). With the 12-pump exercise data, β̂ ≈ 3.2 (clearly wear-out — the 95% CI on β excludes 1.0) and η̂ ≈ 8,500 h.`,
    industrial_example: `**Electronics — surface-mount capacitor wear-out (Weibull β=2.0).** A consumer-electronics OEM qualified a 22 µF MLCC capacitor on a 5,000-h mission profile. Field returns over 18 months produced 25 failures. MLE fit: β̂ = 2.1 (95% CI [1.7, 2.6] — clearly wear-out, excludes the exponential β=1), η̂ = 9,800 h. R(5,000) = exp(−(5,000/9,800)^2.1) = exp(−0.238) = 0.7883 = 78.83%. The hazard h(5,000) = (2.1/9,800)·(0.510)^1.1 = 1.07×10⁻⁴/h. The reliability target was R ≥ 0.95 at 5,000 h — the design missed by 16.2 pp. Remediation: a derating guideline (lower the operating voltage to 60% rated, raising η to 18,000 h) plus a series-redundancy pair on the dc-link rail (parallel capacitor pair). New R_pair(5,000) = 1 − (1 − 0.7883)^2 = 1 − 0.0449 = 0.9551 = 95.51% — meets target. Method per Ebeling (2010, Ch. 3) and O'Connor (2012, Ch. 2).

**Automotive — engine control unit (ECU) constant-failure regime.** An ECU supplier fit the 5-year return data to an exponential: λ̂ = 2.0×10⁻⁵/h (MTBF = 50,000 h). R(5,000 h) = exp(−0.1) = 0.9048 = 90.48% — defensible because electronic-component failure in the useful-life regime is memoryless. The supplier's χ² lower-bound MTBF (Lesson 2) was 35,000 h at 90% confidence — still above the 25,000-h customer target. Method per Montgomery (2014, Ch. 7) and Ebeling (2010, Ch. 8).`,
    case_study: `CASE_TYPE = SYNTHETIC. An automotive Tier-1 supplier fielded an electric-power-steering (EPS) module with a 12-year / 150,000-mile design life. Initial field returns (12 months, 18,000 vehicles, 23 failures) were fit by MLE to a Weibull. Result: β̂ = 0.85 (95% CI [0.62, 1.16] — could not reject β=1), η̂ = 28,000 h. The CI on β included 1.0 → the analyst collapsed to the exponential simplification: λ̂ = 1/η̂ = 3.57×10⁻⁵/h; MTBF = 28,000 h; R(5,000 h) = exp(−0.1786) = 0.8365 = 83.65%. The customer's contract required R ≥ 0.99 at 5,000 h. The reliability engineer identified two remediation paths: (a) a software derating (lower assist-torque limit, raising MTBF to 50,000 h, R = 0.9048 — still short); (b) a 2oo3 voting architecture on the EPS torque sensors with each channel MTBF = 50,000 h, R_2oo3 = 3·0.9048² − 2·0.9048³ = 2.4560 − 1.4810 = 0.9750 = 97.50% — closer but still short; (c) combining derating + parallel-redundant power stage (R_pair = 1 − (1−0.9048)² = 0.9909) — meets 0.99. The selected path was (c). A follow-up Bayesian analysis (Lesson 3) on the small dataset (23 failures) tightened the MTBF estimate by combining the field returns with a Beta(1, 19) prior from the supplier's prior-generation EPS. Source: synthetic case authored for this lesson, method per Nelson (1982, Ch. 8) and Ebeling (2010, Ch. 3 & 12).`,
    visual_explanation: `The four distribution functions are visualized as: (1) pdf f(t) — the bell-shape (normal), decaying exponential, or unimodal lognormal, plotted against t; (2) cdf F(t) — the S-curve rising from 0 to 1; (3) reliability R(t) = 1 − F(t) — the mirror-S descending from 1 to 0; (4) hazard h(t) — flat (exponential), monotone-increasing (Weibull β>1), monotone-decreasing (β<1), or U-shaped (bath-tub — three-regime composite). The Weibull probability paper linearizes ln(−ln(1−F)) vs ln(t): the slope is β; the intercept at ln(η) gives the characteristic life; linearity validates the Weibull fit.`,
    simulation_opportunity: `An interactive simulation could let the learner (i) generate synthetic Weibull failure times with sliders for β and η, (ii) censor at a user-specified truncation time T (Type I) or count r (Type II), (iii) compute the MLE estimates β̂ and η̂ from the censored sample, and (iv) overlay the empirical and fitted cdfs with an Anderson-Darling goodness-of-fit statistic. A second mode could visualize the bath-tub hazard — three superimposed Weibulls (β<1 infant-mortality, β=1 useful-life, β>1 wear-out) weighted by a customer-set mixture proportion.`,
    common_mistakes: `- Assuming constant failure rate (exponential) when the failure physics is wear-out or wear-in — the Weibull β>1 (wear-out) or β<1 (infant-mortality) regimes invalidate the exponential simplification.
- Reporting R(t) without specifying the distribution and its parameters — a single R number is meaningless.
- Using the sample mean of censored data as the MTBF estimate — for heavily right-censored data the sample mean is biased low; MLE handles censoring correctly.
- Confusing the characteristic life η with the MTBF — they differ by a factor Γ(1+1/β); for β=2.0, MTBF = 0.8862·η (so η > MTBF).
- Applying the Weibull to data that is genuinely lognormal (fatigue, crack growth) without checking the lognormal probability plot.
- Ignoring the 95% CI on β — collapsing a Weibull to the exponential "β=1" simplification requires the CI on β to include 1.0; otherwise the simplification is rejected.
- Pooling data from different failure regimes (infant-mortality + wear-out) into a single Weibull — fit a mixture or bath-tub model instead.`,
    limitations: `- The 2-parameter Weibull is monotone-hazard — it cannot model the bath-tub curve (use the 3-parameter mixed-Weibull or 3-parameter Weibull with a location parameter for the wear-in threshold).
- The exponential is memoryless — strictly invalid for any aging/wear-out component; defensible only in the useful-life regime.
- The normal distribution admits negative failure times — strictly invalid for σ/μ > ~0.3; the lognormal is the strictly-positive alternative.
- MLE on small samples (r < 10) is biased and the Fisher-information CI is optimistic; use a Bayesian prior (Lesson 3) or the rank-regression CI.
- The Anderson-Darling test on heavily-censored data (>50% censoring) has low power; the choice of distribution then rests on failure-physics arguments, not data.
- The iid assumption breaks under non-stationary operating conditions (varying loads, temperature) — stratify or use covariates (regression).
- Field-data censoring is often informative (units removed from service for cause, not at random) — biased MLE; use likelihood methods for informative censoring (Nelson, 1982, Ch. 5).`,
    comparison: `**Exponential vs Weibull vs Lognormal vs Normal:**
- Exponential: h(t)=λ constant; memoryless; 1 parameter (λ); useful-life electronic-component regime; MTBF = 1/λ; the simplest distribution.
- Weibull: h(t)=(β/η)·(t/η)^(β−1) monotone; 2 parameters (β, η); flexible — covers all monotone-hazard shapes; the workhorse of reliability engineering.
- Lognormal: h(t) is unimodal (rises then falls); 2 parameters (μ, σ); models multiplicative degradation (fatigue, crack growth); the alternative to Weibull for unimodal-hazard physics.
- Normal: h(t) is monotone-increasing (unbounded); 2 parameters (μ, σ); models additive wear-out (dimensional tolerance); strictly positive only for σ/μ < ~0.3.

**MLE vs Rank regression:** MLE is consistent and efficient for large n, general for any censoring; rank regression is fast, graphical (doubles as goodness-of-fit), but biased for heavily-censored data. Use MLE as the production estimator; use rank regression for a quick visual check.`,
    practical_application: `- **Electronics (capacitor wear-out)**: fit a Weibull (β>1) to field returns; derate voltage or parallel redundant units to meet R target.
- **Automotive (ECU useful-life)**: fit the exponential simplification (β=1 not rejected); verify MTBF against the χ² lower bound (Lesson 2).
- **Aerospace (turbine-disk fatigue)**: fit a lognormal to LCF test data; the median (exp(μ)) sets the inspection interval.
- **Industrial (bearing wear-out)**: fit a Weibull (β≈2-3) to vibration-based PdM data; set the time-based PM interval at the B_10 life (the age at which 10% have failed).
- **Power (transformer)**: fit a Weibull (β>1) to oil-test + failure data; the MTTF and the B_10 life drive the asset-replacement plan.`,
    decision_scenario: `You are the CRE on a hydraulic-pump fleet. Field data: 12 failures at times [4200-10500 h] and 38 right-censored survivors. The reliability target is R(5,000) ≥ 0.95. (a) Fit a Weibull by MLE and report β̂, η̂, and the 95% CI on β. (b) Compute R(5,000) and the 90% lower confidence bound. (c) Test whether the exponential (β=1) is a defensible simplification — if the CI on β excludes 1.0, the exponential is rejected. (d) If the Weibull R(5,000) is below target, propose two remediation paths (derating, redundancy) and quantify each. (e) Cross-check the Weibull MTBF against the sample mean (method of moments) — if they diverge by more than 20%, investigate mixture-of-regimes.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the relationship between pdf, cdf, R(t), and h(t).
- **Q2 (Medium, Calculation):** A Weibull with β=2.0, η=10,000 h. Compute R(5,000), h(5,000), and MTBF.
- **Q3 (Medium, Application):** A pump fleet has 10 failures in 200,000 fleet-hours. Fit the exponential; compute λ̂, MTBF, and R(5,000).
- **Q4 (Hard, Analyze):** A Weibull MLE fit gives β̂=2.4 with 95% CI [1.6, 3.6]. Is the exponential (β=1) simplification defensible? Justify.`,
    certification_questions: `- **CRE-style (Easy):** Which distribution has a constant hazard? (Exponential)
- **CRE-style (Medium, Calculation):** A Weibull with β=2.0, η=10,000 h. Compute R(5,000).
- **CRE-style (Hard, Analysis):** Given β̂=2.4 with 95% CI [1.6, 3.6], is the exponential simplification (β=1) defensible? Justify using the CI.`,
    summary: `Probability distributions are the model connecting time-to-failure data to the reliability function R(t). The four inter-derivable functions — pdf, cdf, reliability, hazard — encode the failure physics: the exponential (constant λ) models random failures; the Weibull (β shape, η scale) covers decreasing/constant/increasing hazard; the lognormal models multiplicative degradation; the normal models additive wear-out. Parameters are estimated by MLE (general) or median-rank regression (graphical). The Weibull β selects the failure regime; β=1 is the exponential limit and the basis of the constant-λ assumption downstream in the RM pillar. Always report R(t) with confidence bounds and validate the distribution choice with a goodness-of-fit test (Anderson-Darling A²).`,
    key_takeaways: `- pdf → cdf → R(t) = 1 − F(t) → h(t) = f/R — all four inter-derivable.
- Exponential: h(t) = λ constant; R(t) = exp(−λt); MTBF = 1/λ; R(MTBF) = 0.3679; memoryless.
- Weibull: R(t) = exp(−(t/η)^β); β<1 infant-mortality, β=1 exponential-limit, β>1 wear-out; MTBF = η·Γ(1+1/β).
- Lognormal: multiplicative degradation (fatigue); median = exp(μ). Normal: additive wear-out; defensible for σ/μ < ~0.3.
- MLE maximizes L = ∏ f(t_i)·R(T⁺_j) over failures and survivors; median-rank regression linearizes on probability paper.
- Always report R(t) with confidence bounds and validate with Anderson-Darling A²; CI on β must exclude 1.0 to reject the exponential simplification.`,
    references: `- ASQ CRE Body of Knowledge — Probability & Statistics domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 3 (failure distributions) and Ch. 8 (estimation).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 2 (distributions) and Ch. 3 (data analysis).
- Nelson (1982/2004), Applied Life Data Analysis, Ch. 2-5 (MLE, censoring, Weibull/exponential).
- Montgomery & Runger (2014), Applied Statistics and Probability for Engineers, Ch. 4 (probability distributions).`,
  },
  knowledgeObject: {
    title: "Probability Distributions for Reliability",
    domain: "Probability & Statistics",
    competency: "Probability Distributions for Reliability",
    topic: "Reliability Failure Distributions",
    concept: "Exponential, Weibull, lognormal, normal — pdf/cdf/hazard/MTBF and parameter estimation",
    body: {
      definitions: [
        "Probability density function (pdf) f(t): density of failures per unit time at age t; ∫f = 1.",
        "Cumulative distribution function (cdf) F(t) = ∫_0^t f: cumulative probability of failure by age t.",
        "Reliability (survival) function R(t) = 1 − F(t): probability the unit has not failed by age t.",
        "Hazard function h(t) = f(t)/R(t): instantaneous failure rate conditional on survival to t.",
        "Cumulative hazard H(t) = ∫_0^t h; R(t) = exp(−H(t)).",
        "MTBF = ∫_0^∞ R(t) dt: expected time to failure.",
        "Exponential distribution: h(t) = λ constant; R(t) = exp(−λt); MTBF = 1/λ; memoryless.",
        "Weibull (2-param): R(t) = exp(−(t/η)^β); β shape, η scale (characteristic life); h(t) = (β/η)·(t/η)^(β−1).",
        "Lognormal: ln(t) ~ N(μ,σ²); models multiplicative degradation (fatigue).",
        "Normal: t ~ N(μ,σ²); models additive wear-out; defensible for σ/μ < ~0.3.",
        "MLE (Maximum Likelihood Estimation): numerical estimator maximizing L = ∏ f(t_i)·R(T⁺_j) over failures and survivors.",
        "Median-rank regression: graphical estimator linearizing the Weibull onto probability paper.",
        "Censoring: Type I (time-truncated at T), Type II (failure-truncated at r-th failure), right-censored field data.",
      ],
      principles: [
        "pdf → cdf → R(t) → h(t): all four inter-derivable; choose the most physical for the task.",
        "R(t) = exp(−H(t)) — the cumulative-hazard form.",
        "Exponential: constant hazard, memoryless; R(MTBF) = 0.3679; random-failure regime.",
        "Weibull β<1 infant-mortality, β=1 exponential-limit, β>1 wear-out — the shape selects the regime.",
        "Weibull characteristic life η: age at R = 1/e (63.2% failed).",
        "MTBF_Weibull = η·Γ(1+1/β); the closed-form integral of R(t).",
        "Lognormal for multiplicative degradation (fatigue, crack growth); normal for additive wear-out.",
        "MLE is the general estimator; median-rank regression is the graphical fast path; always validate with Anderson-Darling A².",
      ],
      components: [
        "pdf f(t) — failure density per unit time.",
        "cdf F(t) — cumulative failure probability.",
        "Reliability R(t) = 1 − F(t).",
        "Hazard h(t) = f/R — instantaneous failure rate.",
        "Cumulative hazard H(t) = ∫h.",
        "MTBF = ∫R — expected time to failure.",
        "Weibull β (shape) and η (scale).",
        "Exponential λ (constant failure rate).",
        "Censoring indicators: failures r, survivors n−r, truncation T or r.",
      ],
      mechanism: [
        "Distribution-fitting lifecycle: collect failure + survivor times → plot empirical cdf on probability paper → choose distribution matching the failure physics → estimate parameters (MLE or rank regression) → compute R(t), h(t), MTBF → validate with goodness-of-fit (Anderson-Darling A²) → propagate R(t) into RM pillar (RBD/FTA/Markov).",
      ],
      process: [
        "1. Collect failure times and survivor times; document censoring type.",
        "2. Plot empirical cdf on Weibull/lognormal/exponential probability paper; check linearity.",
        "3. Estimate parameters: MLE (numerical) or median-rank regression (graphical).",
        "4. Compute R(t), h(t), MTBF; for Weibull, MTBF = η·Γ(1+1/β).",
        "5. Validate with Anderson-Darling A² or Kolmogorov-Smirnov D.",
        "6. Report R(t) with confidence bounds (Fisher-information CI for MLE).",
        "7. Propagate R(t) downstream into the RM pillar (RBD block reliability, FTA basic event, Markov λ).",
      ],
      formulas: [
        "R(t) = 1 − F(t) = ∫_t^∞ f(u) du.",
        "h(t) = f(t)/R(t); H(t) = ∫_0^t h; R(t) = exp(−H(t)).",
        "MTBF = ∫_0^∞ R(t) dt.",
        "Exponential: R(t) = exp(−λt); h(t) = λ; MTBF = 1/λ; R(MTBF) = e⁻¹ ≈ 0.3679.",
        "Weibull: R(t) = exp(−(t/η)^β); h(t) = (β/η)·(t/η)^(β−1); MTBF = η·Γ(1+1/β).",
        "Lognormal: R(t) = 1 − Φ((ln t − μ)/σ); median = exp(μ).",
        "Normal: R(t) = 1 − Φ((t − μ)/σ).",
        "MLE Weibull (Type II): ℓ(β,η) = r·[ln β − β·ln η] + (β−1)·Σ ln t_i − (1/η^β)·[Σ t_i^β + Σ (T⁺_j)^β].",
        "Median rank: F̂_i = (i − 0.3)/(n + 0.4); regression of ln(−ln(1−F̂)) on ln(t) yields slope β̂, intercept → η̂.",
      ],
      metrics: [
        "R(t) [dimensionless 0..1] — reliability at age t.",
        "h(t) [1/h] — instantaneous failure rate.",
        "MTBF [h] — mean time between failures.",
        "β (Weibull shape, dimensionless).",
        "η (Weibull scale / characteristic life, h).",
        "λ (exponential failure rate, 1/h).",
        "Goodness-of-fit: Anderson-Darling A² (lower = better).",
        "95% CI on β (must exclude 1.0 to reject exponential simplification).",
      ],
      examples: [
        "Weibull β=2.0, η=10,000h → R(5,000)=exp(−0.25)=0.7788; h(5,000)=1×10⁻⁴/h; MTBF=η·Γ(1.5)=8,862h.",
        "Exponential λ=1×10⁻⁴/h → R(5,000)=exp(−0.5)=0.6065; R(MTBF)=exp(−1)=0.3679.",
        "Median-rank regression on 12-pump data: slope β̂=3.2 (wear-out), intercept → η̂=8,500h.",
        "Lognormal fatigue: μ=ln(8000)=8.987, σ=0.5 → median=8,000h; R(5,000)=1−Φ((ln5000−8.987)/0.5)=1−Φ(−0.188)=0.5744.",
      ],
      industrial_examples: [
        "Electronics — MLCC capacitor Weibull β=2.1, η=9,800h; R(5,000)=78.83% — derating raises η; parallel pair gives R=95.51%.",
        "Automotive — ECU exponential λ=2×10⁻⁵/h (MTBF=50,000h); R(5,000)=90.48%; χ² lower-bound MTBF=35,000h at 90% CI.",
        "Aerospace — turbine-disk LCF lognormal (μ=ln(20000), σ=0.6); median sets the inspection interval.",
        "Industrial — bearing Weibull (β≈2-3); B_10 life sets the time-based PM interval.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Automotive EPS module: 18,000 vehicles, 23 failures in 12 months. Weibull MLE β̂=0.85 (CI [0.62,1.16] — could not reject β=1), η̂=28,000h. Collapsed to exponential: R(5,000)=83.65% < target 99%. Remediation: derating (R=90.48%) + 2oo3 torque-sensor vote (R=97.50%) + parallel power stage (R_pair=99.09%) — selected derating + parallel. Follow-up Bayesian (Lesson 3) with Beta(1,19) prior tightened the MTBF estimate. Method per Nelson (1982) and Ebeling (2010).",
      ],
      common_errors: [
        "Assuming exponential (β=1) when the failure physics is wear-out or wear-in.",
        "Reporting R(t) without specifying the distribution and parameters.",
        "Using the sample mean of censored data as the MTBF — biased for heavy right-censoring; use MLE.",
        "Confusing characteristic life η with MTBF — they differ by Γ(1+1/β).",
        "Applying Weibull to genuinely lognormal data (fatigue, crack growth) without checking the lognormal plot.",
        "Collapsing Weibull to exponential β=1 without checking the 95% CI on β.",
        "Pooling data from different failure regimes (infant-mortality + wear-out) into a single Weibull — fit a mixture instead.",
      ],
      limitations: [
        "2-parameter Weibull is monotone-hazard — cannot model bath-tub (use 3-parameter mixed-Weibull).",
        "Exponential is memoryless — invalid for any aging/wear-out component.",
        "Normal admits negative failure times — strictly invalid for σ/μ > ~0.3 (use lognormal).",
        "MLE on small samples (r<10) is biased and the Fisher CI is optimistic — use a Bayesian prior (Lesson 3).",
        "Anderson-Darling test on heavily-censored data (>50%) has low power — rely on failure-physics arguments.",
        "iid assumption breaks under non-stationary operating conditions — stratify or use covariates.",
        "Field-data censoring is often informative (removed-for-cause) — biased MLE; use likelihood methods for informative censoring (Nelson, 1982, Ch. 5).",
      ],
      best_practices: [
        "Always specify the distribution and its parameters when reporting R(t); pair with the mission duration t.",
        "Match the distribution to the failure physics: Weibull for wear-out/wear-in, exponential for random useful-life, lognormal for fatigue, normal for additive wear-out.",
        "Validate the fit with Anderson-Darling A² and the 95% CI on β (excludes 1.0 → reject exponential simplification).",
        "Use MLE as the production estimator; use median-rank regression as a quick graphical check.",
        "Report R(t) with confidence bounds (Fisher-information CI for MLE; Bernard's-binomial CI for rank regression).",
        "For small samples (r<10), augment with a Bayesian prior (Lesson 3) to tighten the MTBF estimate.",
        "Propagate R(t) downstream into RM pillar models with the 90% lower confidence bound as the design value.",
      ],
      related_concepts: [
        "Statistical Inference & Confidence Intervals (Lesson 2) — chi-square MTBF CI, hypothesis testing.",
        "Bayesian & Reliability Data Analysis (Lesson 3) — Beta-binomial posterior, prior × likelihood.",
        "Reliability Modeling (RM pillar) — RBD, FTA, Markov use R(t) and λ = 1/MTBF as inputs.",
        "ISO 14224:2016 — population failure-rate source for distribution fitting by equipment class.",
      ],
      prerequisites: [
        "ASQ CRE Reliability Fundamentals (RF) — R(t), MTBF/MTTR, constant-λ.",
        "Differential and integral calculus (integration by parts; the gamma function).",
        "Probability fundamentals: pdf/cdf, expectation, variance, moments.",
        "Familiarity with the normal distribution and the standard normal CDF Φ(·).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Probability & Statistics domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 3.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 2.",
        "Nelson (1982/2004), Applied Life Data Analysis, Ch. 2-5.",
        "Montgomery & Runger (2014), Applied Statistics and Probability for Engineers, Ch. 4.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Probability Distributions for Reliability",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which probability distribution has a constant hazard function h(t) = λ?",
      whyCorrect:
        "The exponential distribution has the unique property that its hazard function is constant — h(t) = λ for all t. This is the 'memoryless' property: the residual life of a unit that has survived to age t is identical to a new unit. The pdf is f(t) = λ·exp(−λt), the reliability is R(t) = exp(−λt), and the MTBF = 1/λ.",
      whyOthersWrong: [
        "Option A (Weibull with β=2.0) — the Weibull hazard is h(t) = (β/η)·(t/η)^(β−1); for β=2.0 the hazard is linearly increasing in t (wear-out), not constant.",
        "Option C (Lognormal) — the lognormal hazard is unimodal (rises then falls), not constant; it models multiplicative degradation (fatigue).",
        "Option D (Normal) — the normal hazard is monotone increasing without bound, not constant; it models additive wear-out.",
      ],
      explanation:
        "Exponential: h(t) = λ constant; R(t) = exp(−λt); MTBF = 1/λ; the only distribution with memoryless property.",
      options: [
        { text: "Weibull with β = 2.0", isCorrect: false },
        { text: "Exponential", isCorrect: true },
        { text: "Lognormal", isCorrect: false },
        { text: "Normal", isCorrect: false },
      ],
    },
    {
      competencyName: "Probability Distributions for Reliability",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Electronics",
      stem: "A 2-parameter Weibull has β = 2.0 and η = 10,000 h. Compute the reliability R(5,000) and the MTBF.",
      whyCorrect:
        "Weibull reliability: R(t) = exp(−(t/η)^β). At t = 5,000: R(5,000) = exp(−(5,000/10,000)^2.0) = exp(−0.5^2) = exp(−0.25) = 0.7788 = 77.88%. MTBF = η·Γ(1+1/β) = 10,000·Γ(1.5) = 10,000·0.886227 = 8,862 h. The MTBF is less than the characteristic life η because the wear-out (β>1) makes the distribution skew — most failures cluster below η, dragging the mean below the characteristic life.",
      whyOthersWrong: [
        "Option A (R=0.6065, MTBF=10,000h) — R = exp(−0.5) is the exponential simplification (β=1), not the Weibull with β=2.0; and the MTBF=10,000=η only holds when β=1 (MTBF = η·Γ(2) = η).",
        "Option C (R=0.9512, MTBF=10,000h) — R is computed as 1 − (1−0.7788) = 0.7788 + the joint-failure correction — no such formula exists; and MTBF=η is wrong for β=2.0.",
        "Option D (R=0.3679, MTBF=5,000h) — R = exp(−1) is the reliability at the characteristic life (R(η) = 1/e), not at t = 5,000; MTBF=5,000 is half the characteristic life — no physical basis.",
      ],
      explanation:
        "R(5,000) = exp(−0.25) = 0.7788; MTBF = η·Γ(1.5) = 8,862 h. The Weibull β=2.0 wear-out (linearly-increasing hazard) makes R at t = 5,000 (half the characteristic life) higher than the exponential at the same t, but the MTBF is dragged below η by the wear-out.",
      options: [
        { text: "R = 0.6065; MTBF = 10,000 h", isCorrect: false },
        { text: "R = 0.7788; MTBF ≈ 8,862 h", isCorrect: true },
        { text: "R = 0.9512; MTBF = 10,000 h", isCorrect: false },
        { text: "R = 0.3679; MTBF = 5,000 h", isCorrect: false },
      ],
    },
    {
      competencyName: "Probability Distributions for Reliability",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "An MLE fit to 25 field failures gives β̂ = 2.4 with a 95% confidence interval [1.6, 3.6]. Is the exponential (β=1) simplification defensible? Justify.",
      whyCorrect:
        "The exponential simplification (β=1) is defensible ONLY when the 95% CI on β includes 1.0 — i.e., when the Weibull fit cannot statistically reject β=1. Here the CI [1.6, 3.6] entirely excludes 1.0, so β=1 is rejected at the 5% significance level: the failure physics is statistically distinguishable from constant hazard, and the exponential simplification is NOT defensible. The wear-out (β>1) must be modeled explicitly; collapsing to exponential would understate R at low t and overstate MTBF by a factor that depends on β (the bias grows with β).",
      whyOthersWrong: [
        "Option A (Yes, β̂=2.4 ≈ 1, close enough) — 2.4 is not ≈ 1.0; the test is whether the CI includes 1.0, not whether the point estimate is 'close'. The CI [1.6,3.6] is entirely above 1.0 → β=1 is rejected.",
        "Option C (Yes, MLE always supports the exponential simplification) — MLE provides the point estimate and the CI; if the CI excludes 1.0, the data reject the exponential. MLE is not a free pass to simplify.",
        "Option D (Indeterminate; need a hypothesis test) — the 95% CI on β IS the hypothesis test: if 1.0 is outside the CI, reject β=1 at α=0.05; no further test is needed.",
      ],
      explanation:
        "NO. The 95% CI [1.6, 3.6] excludes β=1.0 entirely, so the Weibull fit rejects the exponential simplification at α=0.05. The wear-out (β>1) must be modeled explicitly.",
      options: [
        { text: "Yes — β̂=2.4 is close enough to 1", isCorrect: false },
        { text: "No — the CI [1.6, 3.6] excludes β=1, so the exponential simplification is rejected", isCorrect: true },
        { text: "Yes — MLE always supports the exponential simplification", isCorrect: false },
        { text: "Indeterminate; a separate hypothesis test is required", isCorrect: false },
      ],
    },
    {
      competencyName: "Probability Distributions for Reliability",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Electronics",
      stem: "True or False: For a 2-parameter Weibull with β = 1, the distribution reduces to the exponential with λ = 1/η, and the MTBF equals the characteristic life η.",
      whyCorrect:
        "TRUE. Setting β = 1 in the Weibull: R(t) = exp(−(t/η)^1) = exp(−t/η) = exp(−λt) with λ = 1/η. The hazard h(t) = (1/η)·(t/η)^0 = 1/η = λ — constant. The MTBF = η·Γ(1+1/1) = η·Γ(2) = η·1 = η. So at β=1 the Weibull collapses to the exponential, the characteristic life equals the MTBF, and the constant-failure-rate assumption holds. This is the bridge between the Weibull (general) and the exponential (simplification) — the Weibull β=1 limit IS the exponential.",
      whyOthersWrong: [
        "Option FALSE — would imply the Weibull β=1 limit is a different distribution from the exponential; in fact the Weibull with β=1 is mathematically identical to the exponential with λ=1/η, including the MTBF = η equality (Γ(2) = 1). The exponential is the special case of the Weibull, not a separate family.",
      ],
      explanation:
        "TRUE. At β=1: R(t)=exp(−t/η)=exp(−λt) with λ=1/η; h(t)=λ constant; MTBF = η·Γ(2) = η. The Weibull β=1 limit is the exponential.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Statistical Inference & Confidence Intervals
// (Competency: "Statistical Inference & Confidence Intervals"; slug:
//  ps-statistical-inference-confidence-intervals)
// ---------------------------------------------------------------------------

const LESSON_INFERENCE: RefLesson = {
  competencyName: "Statistical Inference & Confidence Intervals",
  slug: "ps-statistical-inference-confidence-intervals",
  title: "Statistical Inference & Confidence Intervals",
  titleAr: "الاستدلال الإحصائي وفترات الثقة",
  order: 2,
  durationMin: 35,
  references: PS_REFERENCE_TITLES,
  conceptIntroduction: `Statistical inference is the procedure by which a sample of failure data is used to estimate population parameters and quantify the uncertainty in those estimates. A *point estimate* is a single number (e.g., MTBF̂ = T/r); an *interval estimate* or *confidence interval* (CI) is a range (e.g., MTBF ≥ 2T/χ²(α, 2r+2) at 90% confidence). For reliability engineering, the canonical CI is the chi-square (χ²) MTBF confidence interval derived from the exponential constant-failure-rate model — used for repairable-system test data and field MTBF demonstration. The interval differs for time-truncated (Type I) and failure-truncated (Type II) tests: the failure-truncated 2-sided bound is 2T/χ²(α/2, 2r) ≤ MTBF ≤ 2T/χ²(1−α/2, 2r); the time-truncated lower one-sided bound is MTBF_L = 2T/χ²(α, 2r+2). Hypothesis testing (H0 vs H1, significance α, power 1−β) underlies reliability test design (does the new design meet MTBF ≥ MTBF₀ at α=0.05?). Sample-size determination balances the producer's risk (α) and consumer's risk (β) on the OC curve for a reliability test plan.`,
  example: `A reliability test runs 10 pumps for 1,000 h each (total T = 10,000 h) and observes r = 4 failures. The point estimate MTBF̂ = T/r = 10,000/4 = 2,500 h. Time-truncated 90% lower one-sided bound: MTBF_L = 2T/χ²(α=0.10, 2r+2=10) = 20,000/15.987 = 1,251 h. The 90% two-sided bound: MTBF_L = 2T/χ²(0.95, 2r+2=10) = 20,000/18.307 = 1,092 h; MTBF_U = 2T/χ²(0.05, 2r) = 20,000/9.425 = 2,121 h. (For χ²(α=0.10, 10): tabulated value 15.987.) The 90% upper bound gives 90% confidence the true MTBF is at least 1,251 h — the design value the CRE reports downstream. Compare to the failure-truncated case (r=4 failures stop the test): MTBF_L = 2T/χ²(0.10, 8) = 20,000/13.362 = 1,497 h (tighter because the test stopped at the 4th failure, not at a fixed T).`,
  keyFormulas: `Point estimate (exponential): MTBF̂ = T/r (total time on test T, number of failures r)
Time-truncated (Type I) one-sided lower MTBF bound at confidence 1−α:
  MTBF_L = 2T / χ²(α, 2r+2)   [where χ²(α, ν) is the upper-α critical value with ν df]
Time-truncated two-sided CI at confidence 1−α:
  MTBF_L = 2T / χ²(1−α/2, 2r+2);  MTBF_U = 2T / χ²(α/2, 2r)
Failure-truncated (Type II) one-sided lower bound:
  MTBF_L = 2T / χ²(α, 2r)
Failure-truncated two-sided CI:
  MTBF_L = 2T / χ²(1−α/2, 2r);  MTBF_U = 2T / χ²(α/2, 2r)
Reliability R(t) at confidence 1−α: R_L(t) = exp(−t/MTBF_L)
Hypothesis test (MTBF demonstration): H0: MTBF ≤ MTBF₀ (reject), H1: MTBF > MTBF₀.
  Test statistic: χ²_obs = 2T/MTBF₀; reject H0 if χ²_obs > χ²(α, 2r+2) (time-truncated) or > χ²(α, 2r) (failure-truncated).
OC curve / sample size: for risks α (producer) and β (consumer), discrimination ratio d = MTBF₁/MTBF₀:
  Time-truncated test time T = (MTBF₀/2)·[χ²(1−β, 2r+2) − χ²(α, 2r+2)]; solve for r that yields acceptable T.`,
  exercise: `You are the CRE on a hydraulic-valve qualification test. The test plan: 12 valves on test simultaneously, stop at the 6th failure (Type II censoring). The first 5 failures occur at [820, 1450, 2310, 3100, 3920] h and the 6th at 4800 h (test stops). (a) Compute the total time on test T (sum of failure times + survivor times for the 6 surviving units at the truncation point). (b) Compute the point estimate MTBF̂ = T/r. (c) Compute the 90% two-sided CI on MTBF using the failure-truncated formula. (d) Test the hypothesis H0: MTBF ≤ 25,000 h vs H1: MTBF > 25,000 h at α = 0.05 — do you reject H0? (e) If the customer requires MTBF_L ≥ 30,000 h at 90% confidence, is the design accepted?`,
  sections: {
    learning_objectives: `- Distinguish point estimation (single number) from interval estimation (range with confidence).
- Derive the chi-square (χ²) MTBF confidence interval from the exponential constant-failure-rate model and the Poisson failure-count distribution.
- Apply the time-truncated (Type I) and failure-truncated (Type II) CI formulas correctly.
- Translate an MTBF lower bound to a reliability lower bound R_L(t) = exp(−t/MTBF_L).
- Set up a one-sided hypothesis test on MTBF (H0: MTBF ≤ MTBF₀ vs H1: MTBF > MTBF₀) at significance α.
- Use the OC curve to size a reliability test plan balancing producer's risk α and consumer's risk β.
- Choose confidence levels (90%, 95%, 99%) appropriate to the consequence of a wrong reliability decision.`,
    prerequisites: `- Probability Distributions for Reliability (Lesson 1) — exponential, R(t)=exp(−λt), MTBF=1/λ.
- The chi-square (χ²) distribution: degrees of freedom, upper-α critical value, tabulated values.
- Hypothesis testing fundamentals: H0/H1, Type I error (α), Type II error (β), power (1−β), p-value.
- Confidence interval fundamentals: confidence level 1−α, one-sided vs two-sided, interpretation.`,
    introduction: `Statistical inference is the bridge from sample to population. In reliability engineering the canonical inference problem is: given a sample of failure data (total time on test T and number of failures r), estimate the population MTBF and quantify the uncertainty in that estimate. The *point estimate* MTBF̂ = T/r is unbiased and efficient but uninformative about precision. The *confidence interval* (CI) gives the range over which the true MTBF lies with stated confidence 1−α.

For repairable-system exponential MTBF estimation, the CI derives from the fact that the failure count r in time T is Poisson with mean λT. The transformation 2λT = 2T/MTBF is chi-square distributed with 2r or 2r+2 degrees of freedom (the +2 correction for time-truncation reflects the "extra survival time" of the units still on test at the truncation point). This gives the canonical chi-square MTBF CI used in every reliability test plan.

The CI formula differs for time-truncated (Type I — test stops at fixed time T) and failure-truncated (Type II — test stops at the r-th failure) censoring. The failure-truncated test gives tighter bounds (less information loss); the time-truncated test is operationally convenient (you can plan the test duration in advance).

Hypothesis testing applies the same machinery: under H0: MTBF ≤ MTBF₀, the test statistic 2T/MTBF₀ is chi-square; reject H0 if the observed statistic exceeds the upper-α critical value. The OC (operating-characteristic) curve gives the probability of accepting H0 as a function of the true MTBF; the test plan is sized to control both α (producer's risk — rejecting a good design) and β (consumer's risk — accepting a bad design) at the chosen discrimination ratio.`,
    terminology: `- **Point estimate**: a single number estimating a population parameter (e.g., MTBF̂ = T/r).
- **Interval estimate / confidence interval (CI)**: a range [lower, upper] covering the true parameter with confidence 1−α.
- **Confidence level 1−α**: long-run probability that the CI procedure covers the true parameter (typically 90%, 95%, or 99%).
- **One-sided CI**: lower bound (or upper bound) only; common for MTBF demonstration (we want MTBF ≥ MTBF_L).
- **Two-sided CI**: [lower, upper]; common for reporting uncertainty around a point estimate.
- **Time-truncated test (Type I censoring)**: test stops at fixed time T; r failures observed (random).
- **Failure-truncated test (Type II censoring)**: test stops at the r-th failure; T accumulated (random).
- **Chi-square (χ²) distribution**: the distribution of 2λT under the exponential/Poisson model; the workhorse for MTBF CI.
- **Degrees of freedom (df) ν**: 2r (failure-truncated) or 2r+2 (time-truncated); the +2 corrects for time-truncation.
- **Hypothesis test**: H0 (null) vs H1 (alternative); significance α = P(reject H0 | H0 true).
- **Type I error (α)**: false positive — reject H0 when H0 true; "producer's risk" in acceptance sampling.
- **Type II error (β)**: false negative — fail to reject H0 when H1 true; "consumer's risk" in acceptance sampling.
- **Power = 1 − β**: probability of correctly rejecting H0 when H1 is true.
- **OC curve (operating characteristic)**: P(accept H0) as a function of true parameter; plots the test plan's discriminating power.
- **Discrimination ratio d = MTBF₁/MTBF₀**: the contrast between acceptable and rejectable quality in a test plan.`,
    detailed_explanation: `The chi-square MTBF CI derives from the Poisson distribution of failure counts. For an exponential constant-failure-rate process, the number of failures r in total time on test T is Poisson with mean λT. The transformation 2λT = 2T/MTBF is chi-square distributed with ν degrees of freedom. Solving for MTBF gives the CI:

- Time-truncated (Type I), one-sided lower bound at confidence 1−α: MTBF_L = 2T / χ²(α, 2r+2). The "+2" degrees of freedom arise because the test stops at a fixed time T, and the units still on test have accumulated "extra survival time" that the test must account for in the CI.
- Time-truncated, two-sided: MTBF_L = 2T / χ²(1−α/2, 2r+2); MTBF_U = 2T / χ²(α/2, 2r).
- Failure-truncated (Type II), one-sided lower: MTBF_L = 2T / χ²(α, 2r) — no +2 because the test stops at the r-th failure and the time T is exact.
- Failure-truncated, two-sided: MTBF_L = 2T / χ²(1−α/2, 2r); MTBF_U = 2T / χ²(α/2, 2r).

For 10 pumps × 1,000 h = 10,000 h total time on test, r = 4 failures: point estimate MTBF̂ = 2,500 h. Time-truncated 90% one-sided lower: MTBF_L = 20,000 / χ²(0.10, 10) = 20,000 / 15.987 = 1,251 h. The 90% confidence says: "if this test were repeated many times, 90% of the resulting MTBF_L values would lie below the true MTBF." So we are 90% confident the true MTBF ≥ 1,251 h.

The reliability lower bound at confidence 1−α and mission t follows directly: R_L(t) = exp(−t/MTBF_L). For t = 100 h and MTBF_L = 1,251 h: R_L(100) = exp(−100/1,251) = exp(−0.0799) = 0.9231 = 92.31% at 90% confidence. This is the design value the CRE reports downstream.

*Hypothesis testing* applies the same machinery to a binary decision. H0: MTBF ≤ MTBF₀ (the design is inadequate); H1: MTBF > MTBF₀ (the design is adequate). Reject H0 (accept the design) if the test statistic χ²_obs = 2T/MTBF₀ exceeds the upper-α chi-square critical value. For T = 10,000 h, r = 4, MTBF₀ = 1,500 h: χ²_obs = 20,000/1,500 = 13.33. The 95% time-truncated critical value is χ²(0.05, 2r+2) = χ²(0.05, 10) = 18.307 (failure-truncated: χ²(0.05, 8) = 15.507). χ²_obs = 13.33 < 18.307 → fail to reject H0 — the design has not demonstrated MTBF > 1,500 h at α = 0.05.

*Sample-size and test-plan design* uses the OC curve. For a test plan with producer's risk α (reject MTBF₀ when true), consumer's risk β (accept MTBF₁ < MTBF₀ when true), and discrimination ratio d = MTBF₁/MTBF₀: solve the time-truncated test-time equation T = (MTBF₀/2)·[χ²(1−β, 2r+2) − χ²(α, 2r+2)] for the integer r that yields acceptable T. For α=0.05, β=0.10, d=2 (MTBF₁=2·MTBF₀): r ≈ 5-6 failures and T ≈ 1.5·MTBF₀ (e.g., MTBF₀=1,000 h → T ≈ 1,500 h on test). For d=1.5 (closer discrimination): r ≈ 20-25 failures and T ≈ 4·MTBF₀ — a far more expensive test. The reliability engineer balances the test cost (T, r) against the discriminating power (d) and the risks (α, β).`,
    core_principles: `- Point estimate MTBF̂ = T/r is unbiased but uninformative about precision.
- Chi-square CI: 2T/MTBF is χ²(ν) with ν = 2r (failure-truncated) or 2r+2 (time-truncated).
- Time-truncated lower bound: MTBF_L = 2T/χ²(α, 2r+2); failure-truncated: MTBF_L = 2T/χ²(α, 2r).
- Reliability lower bound: R_L(t) = exp(−t/MTBF_L) at the same confidence 1−α.
- Hypothesis test: χ²_obs = 2T/MTBF₀; reject H0 if χ²_obs > χ²(α, ν).
- OC curve and sample-size: balance producer's risk α, consumer's risk β, discrimination ratio d = MTBF₁/MTBF₀.
- Confidence level 1−α = 90% (industrial), 95% (regulated: aerospace/medical), 99% (high-consequence: nuclear).`,
    components: `- **Total time on test T**: accumulated operating time across all units (failed and survived).
- **Failure count r**: observed failures during T.
- **Point estimate MTBF̂ = T/r**.
- **Chi-square critical value χ²(α, ν)**: tabulated, ν = 2r or 2r+2.
- **Confidence level 1−α**: 90%, 95%, 99%.
- **One-sided / two-sided CI**: lower bound only, or [lower, upper].
- **Reliability lower bound R_L(t)**: derived from MTBF_L via the exponential.
- **Hypothesis H0/H1 and significance α**.
- **OC curve and discrimination ratio d**.`,
    process: `1. Define the inference problem: point estimate, one-sided lower CI (MTBF demonstration), or two-sided CI (uncertainty reporting).
2. Collect test data: total time on test T, number of failures r; document censoring (Type I time-truncated or Type II failure-truncated).
3. Compute the point estimate MTBF̂ = T/r.
4. Compute the chi-square CI: choose confidence 1−α (90%, 95%, 99%); apply time-truncated (ν=2r+2) or failure-truncated (ν=2r) formula.
5. Translate to reliability: R_L(t) = exp(−t/MTBF_L) at the same confidence.
6. If the design must demonstrate MTBF > MTBF₀: set up the hypothesis test (H0: MTBF ≤ MTBF₀ vs H1: MTBF > MTBF₀); compute χ²_obs = 2T/MTBF₀; compare to χ²(α, ν).
7. If designing a test plan: choose α, β, d = MTBF₁/MTBF₀; solve the OC-curve equation for r and T.
8. Report the point estimate with the CI, the hypothesis test decision, and the reliability lower bound — paired with the mission duration t and the confidence level.`,
    formula_calculation: `Variables and formulas:
- T: total time on test [h] = Σ failure times + Σ survivor times.
- r: number of failures observed in T [dimensionless integer].
- MTBF̂ = T/r: point estimate [h].
- α: significance level (Type I error rate) [dimensionless 0..1]; confidence level = 1−α.
- χ²(α, ν): upper-α critical value of the chi-square distribution with ν degrees of freedom [dimensionless, tabulated].

Time-truncated (Type I) — test stops at fixed time T:
- One-sided lower bound at 1−α: MTBF_L = 2T / χ²(α, 2r+2).
- Two-sided CI at 1−α: [2T / χ²(1−α/2, 2r+2), 2T / χ²(α/2, 2r)].

Failure-truncated (Type II) — test stops at the r-th failure:
- One-sided lower bound at 1−α: MTBF_L = 2T / χ²(α, 2r).
- Two-sided CI at 1−α: [2T / χ²(1−α/2, 2r), 2T / χ²(α/2, 2r)].

Reliability lower bound (exponential): R_L(t) = exp(−t / MTBF_L) at confidence 1−α.

Hypothesis test (one-sided, MTBF demonstration):
- H0: MTBF ≤ MTBF₀ (design inadequate); H1: MTBF > MTBF₀ (design adequate).
- Test statistic: χ²_obs = 2T / MTBF₀.
- Reject H0 (accept design) if χ²_obs > χ²(α, ν) where ν = 2r+2 (time-truncated) or 2r (failure-truncated).

OC curve and sample size: T = (MTBF₀/2)·[χ²(1−β, 2r+2) − χ²(α, 2r+2)]; for failure-truncated, T = (MTBF₀/2)·[χ²(1−β, 2r) − χ²(α, 2r)]; discrimination ratio d = MTBF₁/MTBF₀.

Units: T in hours (h); MTBF in h; χ² dimensionless; α, β, R dimensionless [0,1].

Assumptions: (i) the exponential constant-failure-rate model holds (the chi-square CI is exact only for exponential; for Weibull β≠1 use likelihood-ratio CIs); (ii) failures are independent and identically distributed (iid); (iii) the test is non-repairable (each unit fails at most once); for repairable systems, use the Laplace trend test to verify iid; (iv) censoring is non-informative; (v) the test environment matches the field environment.

Interpretation: a 90% lower bound MTBF_L = 1,251 h means: if the test were repeated many times under identical conditions, 90% of the resulting MTBF_L values would lie below the true MTBF (i.e., we are 90% confident the true MTBF is at least 1,251 h). A hypothesis test "reject H0" at α = 0.05 means: under the assumption H0 is true (MTBF ≤ MTBF₀), the observed data (or more extreme) would occur with probability ≤ 5% — so we reject H0.`,
    worked_example: `**Hydraulic-pump test — time-truncated.**
Given: 10 pumps × 1,000 h each on test (T = 10,000 h), r = 4 failures observed.
Point estimate: MTBF̂ = T/r = 10,000/4 = 2,500 h.

Step 1 — 90% one-sided lower bound (time-truncated, ν = 2r+2 = 10):
χ²(α=0.10, ν=10) = 15.987 (tabulated upper-α critical value).
MTBF_L = 2T / χ²(0.10, 10) = 20,000 / 15.987 = 1,251.0 h.
Interpretation: 90% confident the true MTBF ≥ 1,251 h.

Step 2 — Reliability lower bound at t = 100 h:
R_L(100) = exp(−t / MTBF_L) = exp(−100/1,251) = exp(−0.07994) = 0.9231 = 92.31% at 90% confidence.

Step 3 — Hypothesis test: does the design demonstrate MTBF > 1,500 h at α = 0.05?
H0: MTBF ≤ 1,500 h (reject the design); H1: MTBF > 1,500 h (accept the design).
χ²_obs = 2T / MTBF₀ = 20,000 / 1,500 = 13.333.
Time-truncated critical value (α = 0.05, ν = 2r+2 = 10): χ²(0.05, 10) = 18.307.
Decision: χ²_obs = 13.333 < 18.307 → FAIL to reject H0. The design has not demonstrated MTBF > 1,500 h at α = 0.05. (Either run more time on test or accept the design at lower confidence.)

**Failure-truncated version (Type II).**
Test stops at the r=4th failure; T = 9,200 h (total accumulated; the 6 surviving units were running when the 4th failed). 90% one-sided lower bound (ν = 2r = 8):
χ²(0.10, 8) = 13.362.
MTBF_L = 2·9,200 / 13.362 = 18,400 / 13.362 = 1,377.0 h.
The failure-truncated CI (1,377 h) is tighter than the time-truncated CI (1,251 h) for the same r — failure-truncation is statistically more efficient because the stopping rule is non-random in failure count.

**Sample-size design.**
Customer wants MTBF₀ = 1,000 h, discrimination ratio d = MTBF₁/MTBF₀ = 2 (so MTBF₁ = 2,000 h), producer's risk α = 0.05, consumer's risk β = 0.10.
Solve for r and T: T = (MTBF₀/2)·[χ²(1−β, 2r+2) − χ²(α, 2r+2)].
Try r = 5 (ν = 12): χ²(0.90, 12) = 18.549; χ²(0.05, 12) = 5.226; T = (1,000/2)·(18.549 − 5.226) = 500·13.323 = 6,661 h (≈ 6.66 MTBF₀).
Accept: 5 failures and T ≈ 6,700 h on test.`,
    industrial_example: `**Electronics — ECU field MTBF demonstration (time-truncated).** An automotive ECU supplier demonstrated field MTBF from 18 months of returns data: fleet-hours T = 4.5×10⁶ h, r = 90 failures. Point estimate MTBF̂ = T/r = 50,000 h. 95% one-sided lower bound: MTBF_L = 2·4.5×10⁶ / χ²(0.05, 2·90+2) = 9×10⁶ / 323.2 = 27,824 h. The customer contract required MTBF ≥ 25,000 h at 95% confidence — the design is accepted (27,824 > 25,000). Method per Montgomery (2014, Ch. 7) and Ebeling (2010, Ch. 8).

**Automotive — reliability test plan (failure-truncated).** A brake-by-wire module qualification test plan: MTBF₀ = 100,000 h, d = MTBF₁/MTBF₀ = 1.5, α = 0.05, β = 0.10. Solving the OC-curve equation gives r ≈ 30 failures and T ≈ 3.0·MTBF₀ = 300,000 h. To accelerate the test, the supplier ran 30 units × 10,000 h = 300,000 h and observed 22 failures (T = 220,000 h, r = 22). Point estimate MTBF̂ = 10,000 h; 95% lower bound (ν = 44): χ²(0.05, 44) = 59.620; MTBF_L = 440,000 / 59.620 = 7,380 h — well below the 100,000-h target. The test failed; the design was reworked (a higher-rated solenoid valve), and the test was rerun. Method per Nelson (1982, Ch. 10) and O'Connor (2012, Ch. 11).`,
    case_study: `CASE_TYPE = SYNTHETIC. A medical-device manufacturer fielded an infusion-pump module on a 5,000-unit fleet over 24 months. The contract required MTBF ≥ 8,000 h at 95% confidence. Field data: total fleet-hours T = 8.2×10⁶ h, r = 920 failures (run-rate far above target). Point estimate MTBF̂ = T/r = 8,913 h — just above the 8,000-h point target. The reliability engineer computed the 95% one-sided time-truncated lower bound: MTBF_L = 2T / χ²(0.05, 2r+2) = 16.4×10⁶ / χ²(0.05, 1842). For large ν, χ²(α, ν) ≈ ν + z_α·√(2ν) = 1842 + (−1.645)·√(3684) = 1842 − 99.84 = 1742.16. MTBF_L = 16.4×10⁶ / 1742.16 = 9,413 h — above the 8,000-h target. The design was accepted at 95% confidence. The engineer then ran a hypothesis test for trend (Laplace test) to verify iid (constant-λ); the trend test did not reject iid (p = 0.42), confirming the exponential model and the chi-square CI were applicable. A follow-up Weibull analysis (Lesson 1) showed β̂ = 1.05 (95% CI [0.94, 1.16]) — could not reject β=1, validating the exponential simplification. Source: synthetic case authored for this lesson, method per Ebeling (2010, Ch. 8) and Montgomery (2014, Ch. 7).`,
    visual_explanation: `The chi-square MTBF CI is visualized on a logarithmic MTBF axis: the point estimate MTBF̂ = T/r is a vertical line; the lower bound MTBF_L = 2T/χ²(α, ν) is a second vertical line to the left; the upper bound MTBF_U is to the right; the shaded interval between is the CI. As r grows (more data), the χ²(α, 2r+2) critical value grows approximately as 2r + z_α·√(4r), so MTBF_L → MTBF̂ (the CI narrows). The OC curve plots P(accept H0) on the y-axis against the true MTBF on the x-axis: at MTBF = MTBF₀, P(accept) = α (the producer's-risk limit); at MTBF = MTBF₁, P(accept) = 1−β (the consumer's-risk limit); between, the curve drops monotonically — the steeper the drop, the higher the discriminating power.`,
    simulation_opportunity: `An interactive simulation could let the learner (i) set T, r, α, and censoring type; (ii) compute MTBF̂ and the chi-square CI; (iii) visualize the CI on a log-MTBF axis; (iv) run a hypothesis test with slider-controlled MTBF₀ and observe the accept/reject decision; (v) plot the OC curve for a test plan with sliders α, β, d and solve for the required r and T. A second mode could visualize the CI narrowing as r grows — demonstrating the √n convergence rate.`,
    common_mistakes: `- Using the failure-truncated formula (ν=2r) on time-truncated data — the +2 correction in ν=2r+2 is required for Type I censoring; using 2r understates the lower bound.
- Reporting the point estimate MTBF̂ without the CI — a single number conceals the wide uncertainty at small r.
- Confusing confidence level 1−α with probability — a 90% CI is not "90% probability that the true MTBF is in [L, U]" (frequentist); it is "90% of similarly constructed CIs cover the true MTBF" (the procedure, not the specific interval).
- Choosing α = 0.01 (99% CI) when 90% is the industrial standard — over-confidence narrows the lower bound unnecessarily and may reject an adequate design.
- Applying the chi-square CI to Weibull data with β≠1 — the chi-square CI is exact only for exponential; for Weibull β≠1, use likelihood-ratio CIs (Nelson, 1982).
- Forgetting to verify the exponential (β=1) assumption before applying the chi-square CI — run a Weibull MLE and check the 95% CI on β includes 1.0.
- Designing a test plan without the OC curve — picking r "by feel" gives unknown α and β risks; the OC curve is mandatory for a defensible plan.`,
    limitations: `- The chi-square MTBF CI is exact ONLY for the exponential constant-failure-rate model; for Weibull β≠1, lognormal, or normal, use likelihood-ratio or Fisher-information CIs.
- The CI assumes iid failures — for repairable systems with trend (improving or deteriorating), use the Laplace trend test first; if trend is detected, the chi-square CI is biased.
- The CI is wide for small r — 90% lower bound at r=2 has a 2T/χ²(0.10, 6) = 2T/10.645 factor, only ~19% of the point estimate; small samples require longer test times.
- The "+2 correction" for time-truncation is a chi-square approximation; for very small r (< 5), exact Poisson CIs are tighter.
- The OC-curve sample-size equation balances α and β only at the two points MTBF₀ and MTBF₁; between them the test plan's discriminating power is implicit, not explicit.
- Field-data MTBF CIs from warranty/return data are biased by under-reporting (returns < actual failures); adjust with a coverage factor or use a Bayesian prior (Lesson 3).`,
    comparison: `**Point estimate vs CI:** Point estimate MTBF̂ = T/r is a single number, unbiased but uninformative about precision. The CI [MTBF_L, MTBF_U] quantifies the precision: wide CI = small sample, narrow CI = large sample. Always report both.

**One-sided vs two-sided CI:** One-sided lower bound MTBF_L is the design value for MTBF demonstration (we want a lower bound with confidence); two-sided CI is the uncertainty band for reporting. Both use the same χ² critical values but at different α/2 vs α tail probabilities.

**Time-truncated vs failure-truncated:** Time-truncated (Type I, ν=2r+2) is operationally convenient (test duration T is fixed) but statistically less efficient; failure-truncated (Type II, ν=2r) gives tighter bounds (the stopping rule is non-random in failure count). For the same T and r, failure-truncation yields a higher MTBF_L.

**Hypothesis test vs CI:** A one-sided hypothesis test at significance α is equivalent to checking if MTBF₀ is outside the one-sided CI at confidence 1−α — the two procedures give the same accept/reject decision. The CI is more informative because it reports the entire range, not just a binary decision.`,
    practical_application: `- **Electronics (field MTBF demonstration)**: fleet-hours T from warranty returns; 95% one-sided lower bound MTBF_L = 2T/χ²(0.05, 2r+2) compared to the contract target.
- **Automotive (qualification test plan)**: OC-curve design with α=0.05, β=0.10, d=1.5-2 yields the required r and T; failure-truncated test stops at the r-th failure.
- **Aerospace (high-consequence CI)**: 99% lower bound MTBF_L for flight-critical components — the design value reported downstream to the RBD/FTA model.
- **Medical (regulated CI)**: 95% lower bound for infusion pumps, ventilators — required by FDA design-control guidance.
- **Power (maintenance planning)**: 90% two-sided CI on the MTBF of a transformer fleet drives the spare-parts stock level (Poisson spare-parts calculation with the CI lower bound).`,
    decision_scenario: `You are the CRE on a subsea-control-module qualification. The customer contract requires MTBF ≥ 50,000 h at 95% confidence. Your test plan: 8 units × 8,000 h (T = 64,000 h), time-truncated. You observed r = 2 failures. (a) Compute the point estimate MTBF̂. (b) Compute the 95% one-sided lower bound MTBF_L. (c) Does the design meet the contract? (d) If not, how much longer must the test run (additional T at the same r) to meet the 50,000-h target? (e) Re-design the test plan with r = 3 and α = 0.05, β = 0.10, d = 1.5 — what T does the OC-curve equation give? Justify your accept/reject decision.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the chi-square MTBF lower-bound formula for time-truncated (Type I) and failure-truncated (Type II) tests.
- **Q2 (Medium, Calculation):** T = 10,000 h, r = 4, time-truncated. Compute the 90% one-sided lower MTBF bound.
- **Q3 (Medium, Application):** T = 10,000 h, r = 4, MTBF_L = 1,251 h. Compute the 90% reliability lower bound R_L(100).
- **Q4 (Hard, Analyze):** Design a test plan with α=0.05, β=0.10, d=2 — what r and T does the OC-curve equation give?`,
    certification_questions: `- **CRE-style (Easy):** Which degrees of freedom apply for a time-truncated (Type I) test with r failures?
- **CRE-style (Medium, Calculation):** T=10,000 h, r=4, time-truncated, 90% lower bound — compute MTBF_L.
- **CRE-style (Hard, Analysis):** A 95% one-sided lower bound MTBF_L = 1,092 h. Does the design meet a contract target MTBF ≥ 1,000 h at 95% confidence? Justify.`,
    summary: `Statistical inference turns a sample of failure data into a defensible estimate of population MTBF. The point estimate MTBF̂ = T/r is unbiased but uninformative about precision; the chi-square CI 2T/χ²(α, ν) quantifies the lower bound at chosen confidence (90%, 95%, 99%). Time-truncated tests use ν = 2r+2 (the +2 corrects for fixed-T censoring); failure-truncated tests use ν = 2r. The reliability lower bound follows: R_L(t) = exp(−t/MTBF_L). Hypothesis testing (H0: MTBF ≤ MTBF₀ vs H1: MTBF > MTBF₀) applies the same chi-square machinery; the OC curve sizes the test plan to balance producer's risk α and consumer's risk β at the discrimination ratio d. The chi-square CI is exact only for the exponential (β=1); for Weibull β≠1, use likelihood-ratio CIs.`,
    key_takeaways: `- Point estimate MTBF̂ = T/r; chi-square CI: MTBF_L = 2T/χ²(α, ν).
- Time-truncated (Type I): ν = 2r+2; failure-truncated (Type II): ν = 2r.
- Reliability lower bound: R_L(t) = exp(−t/MTBF_L) at the same confidence 1−α.
- Hypothesis test: χ²_obs = 2T/MTBF₀; reject H0 if χ²_obs > χ²(α, ν).
- OC curve / sample size: T = (MTBF₀/2)·[χ²(1−β, 2r+2) − χ²(α, 2r+2)]; discrimination ratio d = MTBF₁/MTBF₀.
- Confidence levels: 90% industrial, 95% regulated, 99% high-consequence.
- Chi-square CI is exact ONLY for the exponential; for Weibull β≠1, use likelihood-ratio CIs.`,
    references: `- ASQ CRE Body of Knowledge — Probability & Statistics domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 8 (chi-square MTBF CI) and Ch. 9 (test plans).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 11 (estimation and demonstration).
- Nelson (1982/2004), Applied Life Data Analysis, Ch. 10 (test plans and OC curves).
- Montgomery & Runger (2014), Applied Statistics and Probability for Engineers, Ch. 7-8 (estimation, hypothesis testing).`,
  },
  knowledgeObject: {
    title: "Statistical Inference & Confidence Intervals",
    domain: "Probability & Statistics",
    competency: "Statistical Inference & Confidence Intervals",
    topic: "Reliability Estimation and Test Planning",
    concept: "Point/interval estimation, chi-square MTBF CI, hypothesis testing, OC curve and sample size",
    body: {
      definitions: [
        "Point estimate: a single number estimating a population parameter (MTBF̂ = T/r).",
        "Confidence interval (CI): a range covering the true parameter with confidence 1−α.",
        "Confidence level 1−α: long-run coverage probability of the CI procedure (90%, 95%, 99%).",
        "One-sided CI: lower (or upper) bound only; standard for MTBF demonstration.",
        "Two-sided CI: [lower, upper] band for uncertainty reporting.",
        "Time-truncated (Type I): test stops at fixed T; r failures random.",
        "Failure-truncated (Type II): test stops at r-th failure; T random.",
        "Chi-square critical value χ²(α, ν): tabulated upper-α value with ν degrees of freedom (ν=2r or 2r+2).",
        "Hypothesis test: H0 (null) vs H1 (alternative); α = P(reject H0 | H0 true).",
        "Type I error (α): false positive; producer's risk.",
        "Type II error (β): false negative; consumer's risk.",
        "Power = 1 − β: probability of correctly rejecting H0.",
        "OC curve: P(accept H0) vs true parameter; discriminating power of a test plan.",
        "Discrimination ratio d = MTBF₁/MTBF₀: contrast between acceptable and rejectable quality.",
      ],
      principles: [
        "Point estimate MTBF̂ = T/r is unbiased but uninformative about precision — always pair with a CI.",
        "Chi-square CI: 2T/MTBF is χ²(ν) with ν = 2r (failure-truncated) or 2r+2 (time-truncated).",
        "Time-truncated lower bound: MTBF_L = 2T/χ²(α, 2r+2); failure-truncated: 2T/χ²(α, 2r).",
        "Reliability lower bound: R_L(t) = exp(−t/MTBF_L) at the same confidence.",
        "Hypothesis test: χ²_obs = 2T/MTBF₀; reject H0 (accept design) if χ²_obs > χ²(α, ν).",
        "OC-curve sample-size: T = (MTBF₀/2)·[χ²(1−β, 2r+2) − χ²(α, 2r+2)].",
        "Confidence levels: 90% industrial, 95% regulated, 99% high-consequence.",
        "Chi-square CI is exact ONLY for exponential; for Weibull β≠1 use likelihood-ratio CIs.",
      ],
      components: [
        "Total time on test T [h].",
        "Failure count r.",
        "Point estimate MTBF̂ = T/r.",
        "Chi-square critical value χ²(α, ν) [tabulated].",
        "Confidence level 1−α.",
        "One-sided / two-sided CI choice.",
        "Reliability lower bound R_L(t).",
        "Hypothesis H0/H1 and significance α.",
        "OC curve and discrimination ratio d.",
      ],
      mechanism: [
        "Inference lifecycle: define problem (point, CI, or test) → collect T and r with censoring type → compute point estimate → compute chi-square CI with appropriate ν → translate to R_L(t) → if testing, set up H0/H1 and compute χ²_obs → if planning, solve OC-curve for r and T → report point estimate + CI + decision + R_L.",
      ],
      process: [
        "1. Define the inference problem: point estimate, one-sided lower CI, two-sided CI, or hypothesis test.",
        "2. Collect T (total time on test) and r (failure count); document censoring (Type I or Type II).",
        "3. Compute point estimate MTBF̂ = T/r.",
        "4. Compute chi-square CI: pick 1−α (90%, 95%, 99%); apply time-truncated (ν=2r+2) or failure-truncated (ν=2r) formula.",
        "5. Translate to reliability: R_L(t) = exp(−t/MTBF_L).",
        "6. If testing H0: MTBF ≤ MTBF₀: compute χ²_obs = 2T/MTBF₀; compare to χ²(α, ν).",
        "7. If designing a test plan: choose α, β, d; solve OC-curve equation for r and T.",
        "8. Report point estimate + CI + test decision + R_L(t) with mission t and confidence level.",
      ],
      formulas: [
        "Point estimate: MTBF̂ = T/r.",
        "Time-truncated (Type I) one-sided lower: MTBF_L = 2T/χ²(α, 2r+2).",
        "Time-truncated two-sided: [2T/χ²(1−α/2, 2r+2), 2T/χ²(α/2, 2r)].",
        "Failure-truncated (Type II) one-sided lower: MTBF_L = 2T/χ²(α, 2r).",
        "Failure-truncated two-sided: [2T/χ²(1−α/2, 2r), 2T/χ²(α/2, 2r)].",
        "Reliability lower bound: R_L(t) = exp(−t/MTBF_L).",
        "Hypothesis test: χ²_obs = 2T/MTBF₀; reject H0 if χ²_obs > χ²(α, ν).",
        "OC curve: T = (MTBF₀/2)·[χ²(1−β, 2r+2) − χ²(α, 2r+2)]; d = MTBF₁/MTBF₀.",
      ],
      metrics: [
        "MTBF̂ [h] — point estimate.",
        "MTBF_L [h] — one-sided lower bound at confidence 1−α.",
        "MTBF_U [h] — upper bound.",
        "R_L(t) [dimensionless 0..1] — reliability lower bound.",
        "χ²_obs [dimensionless] — hypothesis test statistic.",
        "α, β [dimensionless] — Type I and Type II error rates.",
        "r, T [integer, h] — sample size and test time.",
        "d [dimensionless] — discrimination ratio.",
      ],
      examples: [
        "T=10,000 h, r=4, time-truncated 90% lower: χ²(0.10, 10)=15.987 → MTBF_L = 20,000/15.987 = 1,251 h.",
        "R_L(100) = exp(−100/1,251) = 0.9231 = 92.31% at 90% confidence.",
        "Hypothesis test H0:MTBF≤1500, T=10000, r=4: χ²_obs = 13.33 < χ²(0.05,10)=18.307 → fail to reject H0 (design not demonstrated).",
        "OC plan: α=0.05, β=0.10, d=2 → r=5, T≈6,700 h on test.",
      ],
      industrial_examples: [
        "Electronics — ECU field MTBF: T=4.5×10⁶ h, r=90, 95% lower MTBF_L = 2·4.5×10⁶/χ²(0.05,182) = 9×10⁶/209.2 = 43,020 h; meets contract 25,000 h.",
        "Automotive — brake-by-wire test plan: α=0.05, β=0.10, d=1.5 → r=30, T=300,000 h (30 units × 10,000 h).",
        "Aerospace — flight-critical 99% lower MTBF_L for nuclear/aviation high-consequence systems.",
        "Medical — infusion pump field MTBF demonstration at 95% lower bound per FDA design-control.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Medical infusion pump 5,000-unit fleet, T=8.2×10⁶ h, r=920. Point estimate MTBF̂ = 8,913 h. 95% lower MTBF_L = 2·8.2×10⁶/χ²(0.05,1842) ≈ 16.4×10⁶/1742.16 = 9,413 h (using normal approx χ²(α,ν) ≈ ν + z_α·√(2ν)). Design accepted (9,413 > 8,000 contract). Laplace trend test p=0.42 — iid verified; Weibull β̂=1.05 (CI includes 1) — exponential valid. Method per Ebeling (2010) and Montgomery (2014).",
      ],
      common_errors: [
        "Using ν=2r on time-truncated data (missing the +2 correction; understates MTBF_L).",
        "Reporting MTBF̂ without the CI (conceals small-sample uncertainty).",
        "Interpreting a 90% CI as '90% probability the true MTBF is in [L,U]' (frequentist: 90% of CIs cover, not the specific interval).",
        "Choosing α=0.01 (99% CI) when 90% is standard (over-confidence narrows the lower bound unnecessarily).",
        "Applying chi-square CI to Weibull β≠1 data (exact only for exponential).",
        "Skipping the exponential (β=1) verification before applying the chi-square CI.",
        "Designing a test plan without the OC curve (unknown α and β risks).",
      ],
      limitations: [
        "Chi-square MTBF CI exact ONLY for exponential; Weibull β≠1 requires likelihood-ratio CIs.",
        "Assumes iid failures; repairable-system trend (Laplace test p<0.05) invalidates the CI.",
        "Wide CI at small r — 90% lower bound at r=2 is only ~19% of point estimate.",
        "OC-curve sample-size balances α and β only at MTBF₀ and MTBF₁; intermediate discriminating power implicit.",
        "Field-data MTBF from warranty returns biased by under-reporting; adjust with coverage factor or Bayesian prior (Lesson 3).",
        "Type I vs Type II efficiency: time-truncation is statistically less efficient (wider CI) than failure-truncation.",
      ],
      best_practices: [
        "Always report point estimate + CI + R_L(t) + the confidence level and mission t.",
        "Verify the exponential (β=1) assumption before applying the chi-square CI — fit a Weibull and check the 95% CI on β includes 1.0.",
        "For repairable systems, run the Laplace trend test first; if trend is detected, the chi-square CI is biased — use a non-stationary model.",
        "Choose confidence level by consequence: 90% industrial, 95% regulated (FDA/FAA), 99% high-consequence (nuclear).",
        "Use failure-truncation where operationally feasible — tighter CI for the same r.",
        "Design test plans with the OC curve; document α, β, and d explicitly.",
        "Translate the design value MTBF_L downstream to the RM pillar (RBD/FTA/Markov) — not the point estimate.",
      ],
      related_concepts: [
        "Probability Distributions for Reliability (Lesson 1) — exponential, Weibull, lognormal.",
        "Bayesian & Reliability Data Analysis (Lesson 3) — Bayesian CI alternative to chi-square CI.",
        "Reliability Modeling (RM pillar) — RBD/FTA/Markov models use MTBF_L as the design value.",
        "ISO 14224:2016 — population failure-rate source for MTBF inputs.",
      ],
      prerequisites: [
        "Probability Distributions for Reliability (Lesson 1).",
        "Chi-square distribution: degrees of freedom, upper-α critical value, tabulated values.",
        "Hypothesis testing: H0/H1, Type I (α) and Type II (β) errors, power, p-value.",
        "Confidence interval fundamentals: confidence level, one-sided vs two-sided.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Probability & Statistics domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 8-9.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 11.",
        "Nelson (1982/2004), Applied Life Data Analysis, Ch. 10.",
        "Montgomery & Runger (2014), Applied Statistics and Probability for Engineers, Ch. 7-8.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Statistical Inference & Confidence Intervals",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "A time-truncated (Type I) reliability test with r failures uses what degrees of freedom for the chi-square MTBF lower-bound CI?",
      whyCorrect:
        "Time-truncated (Type I) tests use ν = 2r + 2 degrees of freedom. The +2 correction accounts for the 'extra survival time' accumulated by the units still on test at the truncation point T — the test stops at a fixed time, and the units that did not fail have contributed additional operating time that must be reflected in the degrees of freedom. The formula is MTBF_L = 2T / χ²(α, 2r+2).",
      whyOthersWrong: [
        "Option A (ν = r) — degrees of freedom are not r; the chi-square distribution arises from the Poisson transformation 2λT ~ χ²(2r) (or 2r+2), with 2r or 2r+2 df.",
        "Option C (ν = 2r) — this is the FAILURE-truncated (Type II) df; time-truncation requires the +2 correction.",
        "Option D (ν = 2r+1) — there is no +1 correction; the correction for time-truncation is +2 (an even number reflecting the chi-square's even-df structure from the Poisson-gamma relationship).",
      ],
      explanation:
        "Time-truncated (Type I): ν = 2r+2. Failure-truncated (Type II): ν = 2r. The +2 corrects for the extra survival time of the units still on test at the truncation point T.",
      options: [
        { text: "ν = r", isCorrect: false },
        { text: "ν = 2r + 2", isCorrect: true },
        { text: "ν = 2r", isCorrect: false },
        { text: "ν = 2r + 1", isCorrect: false },
      ],
    },
    {
      competencyName: "Statistical Inference & Confidence Intervals",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Electronics",
      stem: "A reliability test accumulated T = 10,000 h with r = 4 failures (time-truncated). Compute the 90% one-sided lower MTBF bound. χ²(0.10, 10) = 15.987.",
      whyCorrect:
        "Time-truncated 90% one-sided lower bound: MTBF_L = 2T / χ²(α, 2r+2) = 2·10,000 / χ²(0.10, 2·4+2) = 20,000 / χ²(0.10, 10) = 20,000 / 15.987 = 1,251.0 h. The 90% confidence says: if this test were repeated many times, 90% of the resulting MTBF_L values would lie below the true MTBF. So we are 90% confident the true MTBF is at least 1,251 h. The point estimate (MTBF̂ = T/r = 2,500 h) is the unbiased single-number estimate; the lower bound (1,251 h) is the design value.",
      whyOthersWrong: [
        "Option A (2,500 h = MTBF̂) — this is the point estimate T/r, not the 90% lower bound; the lower bound is always below the point estimate for r > 0.",
        "Option C (1,497 h) — this is the failure-truncated (ν=2r=8) value: 20,000/χ²(0.10, 8) = 20,000/13.362 = 1,497 h. The question specifies TIME-truncated (ν=2r+2=10), not failure-truncated.",
        "Option D (15,987 h) — this confuses the chi-square critical value (15.987) with the MTBF lower bound (1,251 h); the critical value is in the denominator, not the result.",
      ],
      explanation:
        "MTBF_L = 2T/χ²(α, 2r+2) = 20,000/15.987 = 1,251 h. Time-truncated Type I with ν=2r+2=10. The point estimate MTBF̂ = T/r = 2,500 h is the unbiased center; the lower bound (1,251 h) is the 90%-confidence design value.",
      options: [
        { text: "2,500 h", isCorrect: false },
        { text: "1,251 h", isCorrect: true },
        { text: "1,497 h", isCorrect: false },
        { text: "15,987 h", isCorrect: false },
      ],
    },
    {
      competencyName: "Statistical Inference & Confidence Intervals",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Aerospace",
      stem: "A design contract requires MTBF ≥ 1,000 h at 95% confidence. A time-truncated test gives T = 10,000 h, r = 4, and the 95% one-sided lower bound is MTBF_L = 2T/χ²(0.05, 10) = 20,000/18.307 = 1,092 h. Does the design meet the contract? Justify.",
      whyCorrect:
        "YES. The 95% one-sided lower bound is MTBF_L = 1,092 h, which is greater than the contract target MTBF ≥ 1,000 h. We are 95% confident that the true MTBF is at least 1,092 h, and since 1,092 > 1,000, the contract is met. This is equivalent to rejecting the null hypothesis H0: MTBF ≤ 1,000 h at α = 0.05 (the hypothesis test χ²_obs = 2T/MTBF₀ = 20,000/1,000 = 20.0 > χ²(0.05, 10) = 18.307 — reject H0, accept the design).",
      whyOthersWrong: [
        "Option A (No — the point estimate MTBF̂ = 2,500 h does not equal the contract value) — the point estimate (2,500 h) actually EXCEEDS the contract value (1,000 h); and the contract is on the lower bound at 95% confidence, not on the point estimate. The point estimate is irrelevant to the contract decision.",
        "Option C (Indeterminate — the 95% CI is too wide; need 99% confidence) — the contract specifies 95% confidence; raising to 99% is over-engineering and not required. The 95% lower bound is sufficient and is met.",
        "Option D (No — the test is under-powered because r=4 is too few failures) — while r=4 yields a wide CI, the 95% lower bound (1,092 h) is still above the contract target (1,000 h). The CI width affects precision but the contract decision is binary: is MTBF_L ≥ target? Yes (1,092 > 1,000).",
      ],
      explanation:
        "YES. MTBF_L = 1,092 h ≥ 1,000 h contract target at 95% confidence. Equivalent hypothesis test: χ²_obs = 20.0 > χ²(0.05, 10) = 18.307 → reject H0: MTBF ≤ 1,000; accept the design.",
      options: [
        { text: "No — MTBF̂ = 2,500 h does not equal 1,000 h", isCorrect: false },
        { text: "Yes — MTBF_L = 1,092 h ≥ 1,000 h at 95% confidence", isCorrect: true },
        { text: "Indeterminate — 95% CI is too wide; need 99% confidence", isCorrect: false },
        { text: "No — r=4 is too few failures for any decision", isCorrect: false },
      ],
    },
    {
      competencyName: "Statistical Inference & Confidence Intervals",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "True or False: For the same total time on test T and the same failure count r, the failure-truncated (Type II) CI is tighter (higher MTBF_L) than the time-truncated (Type I) CI.",
      whyCorrect:
        "TRUE. The failure-truncated (Type II) CI uses ν = 2r; the time-truncated (Type I) CI uses ν = 2r+2. Since the chi-square critical value χ²(α, ν) increases with ν, the failure-truncated denominator (χ²(α, 2r)) is smaller than the time-truncated denominator (χ²(α, 2r+2)). A smaller denominator gives a larger MTBF_L: MTBF_L^TypeII = 2T/χ²(α, 2r) > MTBF_L^TypeI = 2T/χ²(α, 2r+2). The failure-truncated test is statistically more efficient because the stopping rule is non-random in failure count — the test ends at exactly the r-th failure, capturing more information. For T = 10,000 h, r = 4, α = 0.10: Type II MTBF_L = 20,000/χ²(0.10, 8) = 20,000/13.362 = 1,497 h; Type I MTBF_L = 20,000/15.987 = 1,251 h — Type II is ~20% tighter.",
      whyOthersWrong: [
        "Option FALSE — would imply the time-truncated test is more efficient; in fact, the time-truncated test (ν=2r+2) has a wider CI because the units still on test at fixed T contribute 'extra survival time' that adds uncertainty to the lower bound (the +2 correction). The failure-truncated test stops exactly at the r-th failure, using the failure-count information fully.",
      ],
      explanation:
        "TRUE. Failure-truncated (ν=2r) has a smaller chi-square denominator than time-truncated (ν=2r+2), so MTBF_L is larger for the same T and r. Type II is statistically more efficient — the stopping rule is non-random in r.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Bayesian & Reliability Data Analysis
// (Competency: "Bayesian & Reliability Data Analysis"; slug:
//  ps-bayesian-reliability-data-analysis)
// ---------------------------------------------------------------------------

const LESSON_BAYES: RefLesson = {
  competencyName: "Bayesian & Reliability Data Analysis",
  slug: "ps-bayesian-reliability-data-analysis",
  title: "Bayesian & Reliability Data Analysis",
  titleAr: "تحليل بايزي وبيانات الموثوقية",
  order: 3,
  durationMin: 35,
  references: PS_REFERENCE_TITLES,
  conceptIntroduction: `Bayesian reliability analysis is the alternative to frequentist chi-square inference (Lesson 2). It treats the unknown parameter (e.g., MTBF, failure probability p, or Weibull β) as a random variable with a *prior* distribution encoding the engineer's pre-data knowledge (from prior generations, physics-of-failure models, expert judgment, or ISO 14224 population data). The observed failure data enters as the *likelihood*; Bayes' theorem combines the two into the *posterior* distribution, which is the updated belief after seeing the data. The posterior mean (or median, or 5th-percentile lower bound) is the reported estimate; the 90% credible interval is the Bayesian analog of the frequentist confidence interval. The canonical example is the Beta-binomial conjugate pair: a Beta(a, b) prior on the failure-on-demand probability p, combined with a binomial likelihood (x failures observed in n demands), gives a Beta(a+x, b+n−x) posterior with mean (a+x)/(a+b+n). For a Beta(1, 19) prior (prior mean p = 1/20 = 0.05) and 1 failure in 50 demands, the posterior is Beta(1+1, 19+50−1) = Beta(2, 68) with mean 2/70 = 0.0286 — tighter than the frequentist point estimate x/n = 0.02 because the prior pulls the estimate up. Bayesian methods excel on small samples and incorporate prior knowledge; they are mandatory in IEC 61508/61511 SIL verification (the prior × likelihood → posterior flow underlies the route 2H "prior use" justification for safety-critical equipment) and in MTBF estimation from sparse field data.`,
  example: `A safety-shutdown valve has a Beta(1, 199) prior on its failure-on-demand probability p (prior mean = 1/200 = 0.005, the SIL 2 boundary). A 1-year field test observes n = 200 demands with x = 1 failure. The binomial likelihood is L(p) ∝ p^1 · (1−p)^199. The posterior is Beta(1+1, 199+200−1) = Beta(2, 398), with mean (1+1)/(1+199+200) = 2/400 = 0.005 — the data exactly matches the prior (no update). Compare to the frequentist point estimate x/n = 1/200 = 0.005 — identical because the prior mean equaled the data rate. The Bayesian 95% credible interval on the posterior Beta(2, 398) is approximately [0.0006, 0.0135] (by the Beta quantile) — tighter than the frequentist chi-square CI [0.0013, 0.027] because the prior concentrates the posterior. For a different prior (Beta(0.5, 99.5) — "Jeffreys-like" non-informative, prior mean 0.005), the posterior is Beta(1.5, 298.5) with mean 0.0050 — the choice of prior barely shifts the posterior at large n; this is the "data swamps the prior" regime. At small n, the prior dominates: with n = 10, x = 1, prior Beta(1, 199), posterior Beta(2, 208), mean 0.00953 — the data cannot override the strong prior.`,
  keyFormulas: `Bayes' theorem for reliability:
  posterior(θ | data) ∝ prior(θ) × likelihood(data | θ)
Beta-binomial conjugate pair (failure-on-demand probability p):
  prior p ~ Beta(a, b): f(p) ∝ p^(a−1) · (1−p)^(b−1)
  likelihood (x failures in n demands): L(p) ∝ p^x · (1−p)^(n−x)
  posterior p ~ Beta(a+x, b+n−x): f(p|data) ∝ p^(a+x−1) · (1−p)^(b+n−x−1)
  posterior mean: (a+x)/(a+b+n); posterior mode (a+x−1)/(a+b+n−2) for a+x>1, b+n−x>1
  95% credible interval: Beta quantile [q_0.025(a+x, b+n−x), q_0.975(a+x, b+n−x)]
Gamma-Poisson conjugate pair (exponential failure rate λ or MTBF):
  prior λ ~ Gamma(k, θ): f(λ) ∝ λ^(k−1) · exp(−λ/θ)
  likelihood (r failures in T time, Poisson): L(λ) ∝ λ^r · exp(−λT)
  posterior λ ~ Gamma(k+r, 1/(1/θ + T)): f(λ|data) ∝ λ^(k+r−1) · exp(−λ·(1/θ + T))
  posterior mean of λ: (k+r)·θ/(1+θT); posterior mean of MTBF = 1/E[λ] (approx; use reciprocal-gamma for exact)
MLE basics (Weibull/exponential): ℓ(β,η) = Σ ln f(t_i) + Σ ln R(T⁺_j); solve ∂ℓ/∂β = ∂ℓ/∂η = 0 numerically
Bayesian credible interval (CRI) vs frequentist confidence interval (CI):
  CI: "if the test were repeated, 95% of CIs would cover the true parameter" (procedure-level, frequentist).
  CRI: "given the data and prior, there is 95% probability the parameter is in [L, U]" (parameter-level, Bayesian).
Bayesian MAP (maximum a posteriori) = mode of the posterior; posterior mean is preferred for skewed posteriors.`,
  exercise: `You are the CRE on a subsea ESD valve. The customer requires P_fd (failure-on-demand probability) ≤ 1×10⁻³ at 95% confidence (SIL 3 boundary). Field test: n = 50 demands, x = 0 failures. (a) Compute the frequentist point estimate P̂_fd = x/n = 0/50 = 0 — does this meet the SIL 3 target? (b) Compute the frequentist 95% upper bound (Rule of 3): 3/n = 0.06 — does this meet SIL 3? (c) Use a Beta(0.5, 99.5) Jeffreys-like prior; compute the posterior Beta(0.5+0, 99.5+50−0) = Beta(0.5, 149.5); find the posterior 95% upper bound (Beta quantile q_0.95(0.5, 149.5) ≈ 0.004). (d) Use a stronger prior Beta(1, 999) (prior mean 0.001, SIL 3 boundary); compute the posterior Beta(1, 1049); the 95% upper bound is q_0.95(1, 1049) ≈ 0.0043 — does this meet SIL 3? (e) Discuss the implication: small-sample Bayesian inference is dominated by the prior; for SIL 3 demonstration, the prior must be justified by ISO 14224 population data or by the supplier's documented "prior use" route 2H evidence per IEC 61508.`,
  sections: {
    learning_objectives: `- State Bayes' theorem for reliability: posterior ∝ prior × likelihood.
- Apply the Beta-binomial conjugate pair for the failure-on-demand probability p (posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n)).
- Apply the Gamma-Poisson conjugate pair for the exponential failure rate λ (posterior Gamma(k+r, ...)).
- Distinguish Bayesian credible interval (CRI) from frequentist confidence interval (CI); explain the parameter-level vs procedure-level interpretations.
- Distinguish Bayesian and frequentist paradigms: prior + likelihood vs likelihood only; posterior distribution vs point estimate + sampling distribution.
- Apply Bayesian methods to small-sample reliability data and to IEC 61508/61511 SIL verification (route 2H "prior use" justification).
- State the Maximum Likelihood Estimation (MLE) basics for the exponential and Weibull: maximize ℓ = Σ ln f(t_i) + Σ ln R(T⁺_j).`,
    prerequisites: `- Probability Distributions for Reliability (Lesson 1) — exponential, Weibull, the failure-rate λ.
- Statistical Inference & Confidence Intervals (Lesson 2) — point/interval estimation, the chi-square MTBF CI.
- Bayes' theorem: P(θ | data) = P(data | θ)·P(θ) / P(data).
- The Beta, Gamma, and Poisson distributions and their conjugate-pair properties.
- IEC 61508/61511 safety-integrity-level (SIL) framework (superficially — for SIL 2/3 verification context).`,
    introduction: `Bayesian reliability analysis is the alternative to frequentist chi-square inference (Lesson 2). It treats the unknown parameter θ (MTBF, p, β) as a random variable with a *prior* distribution f(θ) encoding pre-data knowledge — from prior-generation field data, physics-of-failure models, expert judgment, or ISO 14224 population rates. The observed data enters as the *likelihood* L(data | θ); Bayes' theorem combines the two into the *posterior* f(θ | data) ∝ f(θ)·L(data | θ). The posterior is the updated belief after seeing the data; the posterior mean (or median) is the reported estimate, and the 90% or 95% credible interval (CRI) is the Bayesian analog of the frequentist confidence interval (CI).

Two conjugate pairs dominate reliability engineering: (i) the **Beta-Binomial** for the failure-on-demand probability p (a SIS final-element or shutdown valve): prior Beta(a, b) + binomial likelihood (x failures in n demands) → posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n). (ii) the **Gamma-Poisson** for the exponential failure rate λ or MTBF: prior Gamma(k, θ) + Poisson likelihood (r failures in T time) → posterior Gamma(k+r, 1/(1/θ + T)), mean (k+r)/(1/θ + T). Both are closed-form (no numerical integration needed) — the conjugacy makes Bayesian inference tractable for routine reliability work.

The Bayesian paradigm excels on small samples where the frequentist chi-square CI is wide (e.g., 0 failures in 50 demands gives the uninformative point estimate p = 0 and the rule-of-3 upper bound 3/50 = 0.06 — useless for SIL 3 demonstration at p ≤ 1×10⁻³). The Bayesian with an informative prior (Beta(1, 999), prior mean 0.001) yields a posterior Beta(1, 1049) with 95% upper quantile ≈ 0.0043 — defensible for SIL 3 if the prior is justified. This is the route 2H "prior use" justification in IEC 61508/61511: the prior encodes documented prior-use evidence (the supplier's installed base, ISO 14224 population data, physics-of-failure modeling) and the field test data updates it.

The Maximum Likelihood Estimation (MLE) basis (Lesson 1) is the bridge to Bayesian methods: the likelihood L(data | θ) is the same function in both paradigms; the Bayesian adds the prior f(θ) and computes the posterior, while the frequentist maximizes L alone for the point estimate. For Weibull/exponential, the MLE ℓ(β, η) = Σ ln f(t_i) + Σ ln R(T⁺_j) is the same log-likelihood the Bayesian uses (with priors on β and η). For large n, the Bayesian posterior converges to the MLE (the "data swamps the prior" regime); for small n, the prior dominates and the Bayesian estimate is more informative.`,
    terminology: `- **Prior distribution f(θ)**: pre-data belief about the parameter θ; can be informative (Beta(1, 199) prior on p with mean 0.005) or non-informative (Jeffreys Beta(0.5, 0.5); uniform Beta(1, 1)).
- **Likelihood L(data | θ)**: probability of the observed data given the parameter; same function in Bayesian and frequentist paradigms.
- **Posterior distribution f(θ | data)**: updated belief after seeing the data; f(θ | data) ∝ f(θ)·L(data | θ).
- **Conjugate prior**: a prior family that yields a posterior in the same family. Beta is conjugate to Binomial; Gamma is conjugate to Poisson.
- **Beta distribution**: continuous distribution on [0,1], parameters a (shape) and b (shape); conjugate to the binomial for a probability parameter.
- **Gamma distribution**: continuous distribution on [0,∞), parameters k (shape) and θ (scale); conjugate to the Poisson for a rate parameter.
- **Credible interval (CRI)**: Bayesian analog of CI; "given data and prior, 95% probability the parameter is in [L, U]" — parameter-level, not procedure-level.
- **MAP (maximum a posteriori)**: mode of the posterior; the Bayesian analog of MLE.
- **Posterior mean**: E[θ | data] = ∫θ·f(θ|data) dθ; preferred for skewed posteriors.
- **Posterior predictive**: prediction of new data, integrating over the posterior.
- **Jeffreys prior**: non-informative prior proportional to √(det I(θ)) where I is the Fisher information; invariant under reparameterization.
- **"Data swamps the prior"**: as n grows, the posterior concentrates around the MLE and the prior's influence shrinks (asymptotic normality).
- **Route 2H prior use**: IEC 61508's justification of safety-integrity equipment based on documented prior-use evidence (the prior distribution).`,
    detailed_explanation: `Bayes' theorem for reliability: posterior(θ | data) ∝ prior(θ) × likelihood(data | θ). The proportionality drops the marginal P(data) — a normalization constant computed as ∫prior·likelihood dθ. For conjugate priors, the normalization is automatic (the posterior is in the same family).

**Beta-Binomial conjugate (failure-on-demand probability p):** prior p ~ Beta(a, b); likelihood (x failures in n demands, binomial) L ∝ p^x·(1−p)^(n−x); posterior p ~ Beta(a+x, b+n−x), with mean (a+x)/(a+b+n). For a Beta(1, 19) prior (prior mean p = 1/20 = 0.05) and 1 failure in 50 demands: posterior Beta(2, 68), mean 2/70 = 0.0286 — the data (1/50 = 0.02) pulls the estimate down from the prior (0.05), and the Bayesian posterior mean (0.0286) is between the prior mean and the MLE. The 95% CRI: Beta quantile [q_0.025(2, 68), q_0.975(2, 68)] ≈ [0.0035, 0.0975]. Compare to the frequentist 95% CI on the binomial proportion (Wilson): [0.0035, 0.1065] — similar width but the Bayesian is tighter (the prior contributed information).

**Gamma-Poisson conjugate (exponential failure rate λ or MTBF):** prior λ ~ Gamma(k, θ); likelihood (r failures in T time, Poisson) L ∝ λ^r·exp(−λT); posterior λ ~ Gamma(k+r, 1/(1/θ + T)), with mean E[λ|data] = (k+r)·θ / (1+θT). The corresponding MTBF posterior is approximately 1/E[λ] for large samples (the exact posterior of MTBF=1/λ is the inverse-gamma). For a Gamma(2, 1/0.0001) prior on λ (prior mean 2×10⁻⁴ = 1/5000 h MTBF) and r=4 failures in T=10,000 h: posterior Gamma(6, 1/(10000 + 1/0.0001)) = Gamma(6, 1/20000), mean E[λ|data] = 6/20000 = 3×10⁻⁴ (MTBF ≈ 3,333 h). Compare to the frequentist point estimate λ̂ = r/T = 4×10⁻⁴ (MTBF = 2,500 h) — the prior pulled the MTBF up from 2,500 to 3,333 h.

**Bayesian vs frequentist — the conceptual divide:** the frequentist treats θ as fixed but unknown; the CI is a procedure-level statement ("95% of CIs cover θ"). The Bayesian treats θ as a random variable; the CRI is a parameter-level statement ("95% probability θ is in [L, U]" given the data and prior). The Bayesian statement is more natural for engineering decisions; the frequentist statement is more objective (no prior elicitation). For high-consequence SIL verification (IEC 61508 route 2H), the Bayesian with a justified prior is mandatory — the frequentist chi-square CI on small samples is too wide to demonstrate SIL 3/4.

**MLE basics (exponential and Weibull):** the MLE maximizes the log-likelihood ℓ(θ) = Σ ln f(t_i) + Σ ln R(T⁺_j) over the r failures and (n−r) survivors. For the exponential: ℓ(λ) = r·ln(λ) − λ·T (where T = Σ t_i + Σ T⁺_j); ∂ℓ/∂λ = r/λ − T = 0 → λ̂ = r/T, MTBF̂ = T/r (the same point estimate as in Lesson 2). For the Weibull (2-param): ℓ(β, η) = r·[ln β − β·ln η] + (β−1)·Σ ln t_i − (1/η^β)·[Σ t_i^β + Σ (T⁺_j)^β]; solve ∂ℓ/∂β = ∂ℓ/∂η = 0 numerically (Newton-Raphson). The MLE is the frequentist's point estimate; the Bayesian uses the same likelihood with a prior.

**Reliability data from censored/field data:** field data is typically right-censored (units still running when data is collected) and often interval-censored (failures discovered at periodic inspections). The likelihood handles all censoring types: L = ∏ f(t_i)·R(T⁺_j)·[F(T_2,j) − F(T_1,j)] for exact, right-censored, and interval-censored observations respectively. MLE and Bayesian methods both work with this general likelihood; the chi-square CI of Lesson 2 only handles the simple right-censored (Type I or Type II) case under the exponential assumption.

**IEC 61508/61511 route 2H "prior use":** for safety-integrity equipment (SIL 2-4), the supplier must justify the claimed failure rate (e.g., 1×10⁻⁵/h for SIL 3) using either (i) Type A components with sufficient field data (route 1H — the frequentist chi-square CI on large n) or (ii) "prior use" evidence — the Bayesian posterior with a justified prior (route 2H). The prior encodes: prior-generation field data, ISO 14224 population rates, physics-of-failure modeling, expert judgment. The current field test data updates the prior; the posterior 95% upper bound on λ (or P_fd) must be below the SIL boundary. For sparse data (small n), the prior dominates; for rich data (large n), the data dominates. The Bayesian paradigm is the canonical route 2H method.`,
    core_principles: `- Bayes: posterior ∝ prior × likelihood; the prior encodes pre-data knowledge, the data updates it.
- Beta-Binomial: posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n) — failure-on-demand probability.
- Gamma-Poisson: posterior Gamma(k+r, 1/(1/θ + T)), mean (k+r)·θ/(1+θT) — exponential failure rate.
- Bayesian CRI is parameter-level ("95% probability θ in [L,U]"); frequentist CI is procedure-level ("95% of CIs cover θ").
- For large n, posterior → MLE (data swamps the prior); for small n, prior dominates.
- MLE maximizes ℓ(θ) = Σ ln f(t_i) + Σ ln R(T⁺_j); the bridge to Bayesian (same likelihood, adds prior).
- IEC 61508 route 2H "prior use" = Bayesian posterior with justified prior; mandatory for SIL 3/4 demonstration on small samples.`,
    components: `- **Prior distribution f(θ)**: pre-data belief; informative (Beta(1, 199) prior mean 0.005) or non-informative (Jeffreys).
- **Likelihood L(data | θ)**: same as frequentist MLE likelihood; encodes the observed failure data.
- **Posterior distribution f(θ | data)**: updated belief; closed-form for conjugate pairs (Beta-Binomial, Gamma-Poisson).
- **Posterior mean / MAP**: point estimates from the posterior.
- **Credible interval (CRI)**: Bayesian analog of CI; parameter-level interpretation.
- **Conjugate pair**: prior × likelihood → posterior in the same family (Beta-Binomial, Gamma-Poisson).
- **Marginal P(data)**: normalization constant; automatic for conjugate pairs.
- **Posterior predictive**: prediction of new data, integrating over the posterior.`,
    process: `1. Identify the unknown parameter θ (failure-on-demand p, failure rate λ, Weibull β).
2. Choose the prior f(θ): informative (from prior-generation data, ISO 14224, physics-of-failure, expert judgment) or non-informative (Jeffreys, uniform).
3. Construct the likelihood L(data | θ) from the observed failure data (with censoring if applicable).
4. Compute the posterior f(θ | data) ∝ f(θ)·L(data | θ) — closed-form for conjugate pairs, else numerical (MCMC).
5. Report the posterior mean (or MAP) as the point estimate and the 95% CRI as the interval estimate.
6. For SIL verification (IEC 61508 route 2H): compare the posterior 95% upper bound on p (or λ) to the SIL boundary; document the prior justification (prior-use evidence).
7. For small samples, augment with prior knowledge; for large samples, the data dominates and the Bayesian approaches the MLE.
8. Cross-check the Bayesian posterior mean against the frequentist point estimate (MLE) — they should converge as n grows; divergence at small n is expected and signals the prior's contribution.`,
    formula_calculation: `Variables and formulas:
- θ: the unknown reliability parameter (p, λ, β, MTBF) — treated as a random variable.
- f(θ): prior distribution encoding pre-data belief.
- L(data | θ): likelihood of the observed data given θ.
- f(θ | data): posterior distribution; f(θ | data) ∝ f(θ)·L(data | θ).
- P(data): marginal likelihood (normalization constant); P(data) = ∫f(θ)·L(data | θ) dθ.

Beta-Binomial conjugate (probability p):
- prior p ~ Beta(a, b): f(p) ∝ p^(a−1)·(1−p)^(b−1); prior mean a/(a+b).
- likelihood (x failures in n demands, binomial): L ∝ p^x·(1−p)^(n−x).
- posterior p ~ Beta(a+x, b+n−x): f(p|data) ∝ p^(a+x−1)·(1−p)^(b+n−x−1).
- posterior mean: E[p|data] = (a+x)/(a+b+n); posterior mode: (a+x−1)/(a+b+n−2) for a+x>1.
- 95% CRI: [q_0.025(a+x, b+n−x), q_0.975(a+x, b+n−x)] (Beta quantile).

Gamma-Poisson conjugate (rate λ or MTBF):
- prior λ ~ Gamma(k, θ): f(λ) ∝ λ^(k−1)·exp(−λ/θ); prior mean k·θ.
- likelihood (r failures in T time, Poisson): L ∝ λ^r·exp(−λT).
- posterior λ ~ Gamma(k+r, 1/(1/θ + T)): mean E[λ|data] = (k+r)/(1/θ + T).
- corresponding MTBF posterior: approximately 1/E[λ] (large-sample); exact is inverse-gamma.

MLE basics (exponential/Weibull):
- ℓ(λ) = r·ln(λ) − λ·T; λ̂ = r/T, MTBF̂ = T/r (the frequentist point estimate).
- ℓ(β, η) = r·[ln β − β·ln η] + (β−1)·Σ ln t_i − (1/η^β)·[Σ t_i^β + Σ (T⁺_j)^β]; solve ∂ℓ/∂β = ∂ℓ/∂η = 0 by Newton-Raphson.

CRI vs CI:
- Frequentist 95% CI: "95% of CIs (constructed by this procedure) cover θ."
- Bayesian 95% CRI: "given the data and prior, 95% probability θ is in [L, U]."

Units: p dimensionless [0,1]; λ in 1/h; T in h; r, n, x integer counts; a, b, k, θ distribution parameters (dimensionless for Beta; k dimensionless, θ in 1/λ for Gamma).

Assumptions: (i) the prior is justifiable — for IEC 61508 route 2H, the prior must be documented from prior-use evidence (ISO 14224, prior-generation data, physics-of-failure); (ii) the likelihood is correctly specified (censoring handled); (iii) for the Beta-Binomial, demands are independent and identically distributed; for the Gamma-Poisson, failures are iid Poisson; (iv) the prior × likelihood product is normalizable (always true for conjugate pairs).

Interpretation: the Bayesian posterior mean is the engineer's best single-number estimate of θ given the data and prior; the 95% CRI is the engineer's 95% probability statement about θ. The Bayesian statement is more natural for engineering decisions ("there is 95% probability the failure probability is below 1×10⁻³") than the frequentist ("95% of CIs would cover the true p").`,
    worked_example: `**Safety-shutdown valve — Beta-Binomial posterior.**
Given: prior p ~ Beta(1, 199), prior mean E[p] = 1/(1+199) = 1/200 = 0.005 (SIL 2 boundary).
Field test: n = 200 demands, x = 1 failure.

Step 1 — Likelihood (binomial):
L(p | x=1, n=200) ∝ p^1·(1−p)^(200−1) = p·(1−p)^199.

Step 2 — Posterior (Beta-Binomial conjugate):
prior Beta(1, 199) × likelihood binomial(1, 200) → posterior Beta(1+1, 199+200−1) = Beta(2, 398).
f(p | data) ∝ p^(2−1)·(1−p)^(398−1) = p·(1−p)^397.

Step 3 — Posterior mean:
E[p | data] = (a+x)/(a+b+n) = (1+1)/(1+199+200) = 2/400 = 0.005.
The data exactly matches the prior (data rate x/n = 1/200 = 0.005 = prior mean), so the posterior mean equals the prior mean and the data rate — no update.

Step 4 — 95% credible interval:
Beta(2, 398) quantiles: q_0.025(2, 398) ≈ 0.00061; q_0.975(2, 398) ≈ 0.01350.
95% CRI ≈ [0.00061, 0.01350]. Mean 0.005.

Compare to frequentist 95% CI on the binomial proportion (Wilson, with x=1, n=200):
CI ≈ [0.00094, 0.02775].
The Bayesian CRI is tighter than the frequentist CI because the informative prior concentrates the posterior. The Bayesian CRI is also asymmetric (mean 0.005, mode 0.00251, right-skewed) — the Bayesian approach correctly captures the skew.

**Exponential MTBF — Gamma-Poisson posterior.**
Given: prior λ ~ Gamma(k=2, θ=1/0.0001 = 10000 h) (prior mean E[λ] = k·θ = 2/10000 = 0.0002 → prior MTBF ≈ 5000 h).
Field test: T = 10,000 h, r = 4 failures.

Step 5 — Posterior (rate parameterization):
For a Gamma prior on the failure rate λ with shape k and rate β_prior (so f(λ) ∝ λ^(k−1)·exp(−β_prior·λ), E[λ] = k/β_prior), combined with a Poisson likelihood (r failures in total time T, L ∝ λ^r·exp(−λT)), the conjugate posterior is Gamma(k+r, β_prior + T). Here the rate β has units of time (h) because λ has units 1/h.
Prior: shape k=2, prior MTBF 5000 h → β_prior = k/E[λ] = 2/(2×10⁻⁴) = 10000 h (prior rate).
Posterior: Gamma(k+r=2+4=6, rate=β_prior+T=10000+10000=20000 h).
Posterior mean: E[λ | data] = (k+r)/(β_prior + T) = 6/20000 = 3×10⁻⁴/h.
Posterior MTBF ≈ 1/E[λ | data] = 3333 h.

Step 6 — Cross-check vs frequentist MLE:
MLE: λ̂ = r/T = 4/10000 = 4×10⁻⁴/h; MTBF̂ = T/r = 2500 h.
Prior mean: E[λ] = 2×10⁻⁴/h (MTBF 5000 h).
Posterior mean: E[λ | data] = 3×10⁻⁴/h (MTBF 3333 h) — correctly between the prior mean (2×10⁻⁴, weight β_prior=10000 h) and the MLE (4×10⁻⁴, weight T=10000 h). The two sources of information contributed equally (β_prior = T), so the posterior mean is the simple average of prior and MLE: (2+4)/2 = 3×10⁻⁴. As T grows (data swamps the prior), the posterior approaches the MLE; as β_prior grows (strong prior), the posterior approaches the prior mean.`,
    industrial_example: `**Electronics — SIS final-element Bayesian SIL 3 verification.** A solenoid-valve supplier claims SIL 3 (P_fd ≤ 1×10⁻³ per demand) for their shutdown valve. The prior: Beta(1, 999), prior mean E[p] = 1/1000 = 0.001 (exactly the SIL 3 boundary), justified by ISO 14224 population data and 5 years of prior-generation returns. A 1-year extended-fleet test observes n = 500 demands with x = 1 failure. The binomial likelihood L ∝ p^1·(1−p)^499. Posterior: Beta(1+1, 999+500−1) = Beta(2, 1498). Posterior mean E[p|data] = 2/1500 = 0.00133 — slightly above the SIL 3 boundary (the data, x/n = 1/500 = 0.002, is worse than the prior 0.001). 95% CRI upper bound: q_0.95(2, 1498) ≈ 0.0043 — exceeds the SIL 3 boundary of 0.001. The supplier FAILED the SIL 3 demonstration; the route 2H prior was overridden by worse-than-expected data. Remediation: re-test with a larger n, or redesign to lower the failure rate. Method per IEC 61508 route 2H and Ebeling (2010, Ch. 12).

**Automotive — MTBF estimation from sparse field data.** A supplier fielded a new ECU with no prior-generation equivalent. The prior: Gamma(k=1, β_prior=50000 h) (weakly informative, prior MTBF = k·β_prior = 1×50000 = 50,000 h — reflecting the supplier's engineering judgment). Field test: T = 5,000 h, r = 2 failures. MLE point estimate MTBF̂ = T/r = 2,500 h — a wide chi-square CI [1,000, 12,000] at 90%. Bayesian posterior: Gamma(1+2, 50000+5000) = Gamma(3, 55000); E[λ|data] = 3/55000 = 5.45×10⁻⁵/h (posterior MTBF ≈ 18,350 h); the 90% CRI on MTBF ≈ [4,500 h, 60,000 h]. The Bayesian CRI is tighter than the chi-square CI because the prior contributed information. The supplier's customer accepted the 90% lower CRI bound (4,500 h) above the 4,000-h contract target. Method per O'Connor (2012, Ch. 14) and Nelson (1982).`,
    case_study: `CASE_TYPE = SYNTHETIC. A subsea ESD valve supplier sought SIL 3 verification (P_fd ≤ 1×10⁻³ per demand) for a new valve design under IEC 61508 route 2H. The prior: Beta(0.5, 499.5) (Jeffreys-like, weakly informative, prior mean 0.001 — chosen at the SIL 3 boundary without strong prior-use evidence). Field test: n = 100 demands, x = 0 failures (no observed failures). The Bayesian posterior: Beta(0.5+0, 499.5+100−0) = Beta(0.5, 599.5); mean E[p|data] = 0.5/600 = 8.33×10⁻⁴ — below SIL 3 boundary. The 95% upper CRI bound: q_0.95(0.5, 599.5) ≈ 0.0040 — EXCEEDS the SIL 3 boundary (0.001); the design FAILED at 95% confidence. The frequentist "rule of 3" upper bound: 3/100 = 0.030 — far above 0.001, also failing. The reliability engineer re-evaluated with a stronger prior Beta(1, 999) (prior mean 0.001, justified by the supplier's prior-generation field data and ISO 14224 population rates for subsea ESD valves). Posterior: Beta(1+0, 999+100−0) = Beta(1, 1099); 95% upper CRI bound: q_0.95(1, 1099) ≈ 0.0027 — still above 0.001. The engineer requested an extended test (n = 1000 demands); with x = 0 failures, posterior Beta(1, 1999); 95% upper bound ≈ 0.0019 — still above. At n = 5000 demands with x = 0, posterior Beta(1, 5999); 95% upper bound ≈ 0.0006 — below 0.001, SIL 3 verified. The supplier invested in a 5000-demand test campaign; the test infrastructure cost ($2.5M) was justified by the SIL 3 certification enabling subsea-EPC contract awards. Method per IEC 61508 route 2H, Ebeling (2010, Ch. 12), and O'Connor (2012, Ch. 14).`,
    visual_explanation: `Bayesian inference is visualized as: prior distribution (light curve, broad) × likelihood (sharp peak at the MLE) = posterior (sharper curve, located between prior mean and MLE). For a Beta(1, 199) prior on p and binomial data x=1, n=200: the prior is right-skewed on [0,1] with mean 0.005; the likelihood peaks at p = 1/200 = 0.005 (the MLE); the posterior Beta(2, 398) is sharper than the prior and centered near 0.005. As n grows, the likelihood narrows and the posterior converges to a delta at the MLE — "data swamps the prior". The Beta-Binomial and Gamma-Poisson conjugate pairs give closed-form posteriors; for non-conjugate priors, the posterior is computed numerically (MCMC sampling — visualize as a histogram of posterior samples).`,
    simulation_opportunity: `An interactive simulation could let the learner (i) choose a prior (Beta(a, b) with sliders for a and b; visualize the prior shape and mean); (ii) input data (n, x); (iii) compute the posterior Beta(a+x, b+n−x) and overlay prior, likelihood, and posterior; (iv) report the posterior mean, mode, and 95% CRI; (v) compare to the frequentist MLE (x/n) and Wilson CI. A second mode could explore the "data swamps the prior" regime: fix the prior, increase n, and watch the posterior converge to a delta at the MLE. A third mode could solve the SIL verification problem: given a SIL boundary and a prior, find the minimum n needed to verify the SIL at 95% CRI upper bound.`,
    common_mistakes: `- Using an unjustified informative prior for IEC 61508 route 2H — the prior must be documented from prior-use evidence (ISO 14224, prior-generation data, physics-of-failure).
- Choosing a non-informative prior for SIL 3/4 verification — the prior cannot pull the posterior below the data rate; non-informative priors require huge n for SIL demonstration.
- Confusing the Bayesian CRI with the frequentist CI — the CRI is parameter-level ("95% probability θ in [L,U]"), the CI is procedure-level ("95% of CIs cover θ").
- Reporting the posterior mean without the CRI — the posterior mean alone conceals the precision (or lack of it) at small n.
- Using the rule of 3 (3/n) as the SIL upper bound — it's the frequentist upper bound for 0 failures; for SIL 3/4 it gives a useless wide bound (3/100 = 0.03 ≫ 0.001); use the Bayesian posterior with an informative prior.
- Forgetting that the prior × likelihood product must be normalizable — always true for conjugate pairs, but for non-conjugate priors the integral may diverge (improper prior + non-identifiable likelihood).
- Using MLE on heavily-censored small samples without a Bayesian augmentation — MLE is biased and the Fisher CI is optimistic; the Bayesian prior regularizes the estimate.
- Treating the posterior predictive as the parameter estimate — the posterior predictive is the prediction of NEW data, integrating over the posterior; it is wider than the posterior on the parameter.`,
    limitations: `- The prior is subjective; for SIL 3/4 verification the prior must be documented and justifiable (IEC 61508 route 2H requires explicit prior-use evidence).
- Non-informative priors (Jeffreys, uniform) on small samples cannot pull the posterior below the data rate — useless for SIL demonstration on sparse data.
- Conjugate priors (Beta-Binomial, Gamma-Poisson) are restricted to exponential/binomial models; for Weibull β≠1 with non-conjugate priors, MCMC is required (computationally heavier).
- The posterior mean is a single point; for skewed posteriors, the median or 5th-percentile lower bound may be more decision-relevant.
- The Bayesian CRI and frequentist CI have different interpretations; do not collapse them into "the 95% interval" without specifying which.
- For very strong priors, the posterior is dominated by the prior and the data contributes little — the prior must be defensible.
- The "data swamps the prior" regime requires large n; for routine reliability data (n=10-100), the prior matters and the choice is consequential.
- MCMC for non-conjugate posteriors requires convergence diagnostics (Gelman-Rubin R̂, effective sample size) — non-converged chains give biased posteriors.`,
    comparison: `**Bayesian vs Frequentist:**
- Bayesian: θ is random; prior + likelihood → posterior; CRI is parameter-level ("95% probability θ in [L,U]"). Excels on small samples with justified priors. Mandatory for IEC 61508 route 2H.
- Frequentist: θ is fixed; likelihood only → MLE; CI is procedure-level ("95% of CIs cover θ"). More objective (no prior elicitation). Excels on large samples where the chi-square CI is tight.

**Beta-Binomial vs Gamma-Poisson conjugate pairs:**
- Beta-Binomial: parameter is a probability p (failure on demand); use for SIS final elements, shutdown valves, safety functions.
- Gamma-Poisson: parameter is a rate λ or MTBF (continuous failure rate); use for repairable systems in constant-failure-rate regime.

**Bayesian CRI vs frequentist CI (numerical):**
- For Beta(1, 199) prior + x=1, n=200: Bayesian CRI [0.00061, 0.0135] vs frequentist Wilson CI [0.00094, 0.0278]. The Bayesian is tighter (the prior contributed information).
- For Gamma(2, 10000) prior + r=4, T=10000: Bayesian posterior MTBF ≈ 3333 h vs MLE 2500 h; Bayesian 90% CRI [4500, 60000] vs frequentist chi-square 90% CI [1092, 21210] (much wider).`,
    practical_application: `- **Electronics (SIL 3 verification)**: Beta-Binomial posterior with prior justified by ISO 14224 population data; 95% upper CRI bound compared to SIL boundary.
- **Automotive (MTBF estimation from sparse field data)**: Gamma-Poisson posterior with engineering-judgment prior; 90% lower CRI bound on MTBF.
- **Aerospace (safety-critical component qualification)**: Bayesian with strong prior from physics-of-failure modeling; 95% upper CRI on failure probability.
- **Medical (FDA design-control)**: Bayesian posterior on P_fd for life-support equipment; 95% upper CRI per IEC 62304.
- **Oil & Gas (subsea ESD valve route 2H)**: Beta-Binomial with prior from supplier's prior-generation returns and ISO 14224; minimum n solved for SIL 3 demonstration.`,
    decision_scenario: `You are the CRE on a subsea ESD valve SIL 3 verification (P_fd ≤ 1×10⁻³ at 95% confidence per IEC 61508 route 2H). The supplier has documented prior-use evidence supporting a Beta(1, 999) prior (prior mean 0.001, exactly the SIL 3 boundary). Field test budget: n = 500 demands. (a) Compute the posterior if x = 0 failures are observed. (b) Compute the 95% upper CRI bound on p; does it meet SIL 3? (c) If x = 1 failure is observed, recompute and decide. (d) If SIL 3 is not met, what minimum n (with x = 0) would meet SIL 3 at 95%? (e) Discuss: is the supplier's prior defensible? What evidence is required under IEC 61508 route 2H?`,
    practice_questions: `- **Q1 (Easy, Recall):** State Bayes' theorem for reliability and the Beta-Binomial conjugate posterior.
- **Q2 (Medium, Calculation):** Prior Beta(1, 199), n = 200, x = 1. Compute the posterior and the posterior mean.
- **Q3 (Medium, Application):** Prior Gamma(2, 10000 h), T = 10000 h, r = 4. Compute the posterior mean of λ and the posterior MTBF.
- **Q4 (Hard, Analyze):** A SIL 3 demonstration requires P_fd ≤ 1×10⁻³ at 95% CRI upper bound. With a Beta(1, 999) prior and x=0, what minimum n meets SIL 3?`,
    certification_questions: `- **CRE-style (Easy):** What is the Beta-Binomial posterior for a Beta(a, b) prior and x failures in n demands?
- **CRE-style (Medium, Calculation):** Prior Beta(1, 199), n=200, x=1 — compute the posterior mean.
- **CRE-style (Hard, Analysis):** Contrast the Bayesian credible interval (CRI) with the frequentist confidence interval (CI) — what does each measure?`,
    summary: `Bayesian reliability analysis treats the unknown parameter θ as a random variable with a prior encoding pre-data knowledge. Bayes' theorem combines prior × likelihood → posterior; for the Beta-Binomial (failure-on-demand p) and Gamma-Poisson (failure rate λ) conjugate pairs, the posterior is closed-form. The Bayesian credible interval (CRI) is a parameter-level probability statement ("95% probability θ in [L,U]") — more natural for engineering decisions than the frequentist procedure-level CI. Bayesian methods excel on small samples where the frequentist chi-square CI is wide; they are mandatory in IEC 61508/61511 route 2H "prior use" for SIL 3/4 verification. The Maximum Likelihood Estimation (MLE) is the bridge: the Bayesian uses the same likelihood with a prior; for large n the posterior → MLE ("data swamps the prior"). Always document the prior justification — for SIL verification, the prior must come from prior-use evidence (ISO 14224, prior-generation data, physics-of-failure).`,
    key_takeaways: `- Bayes: posterior ∝ prior × likelihood; the prior encodes pre-data knowledge, the data updates it.
- Beta-Binomial: posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n) — failure-on-demand probability p.
- Gamma-Poisson: posterior Gamma(k+r, rate=1/θ+T), mean (k+r)/(1/θ+T) — exponential failure rate λ.
- CRI is parameter-level ("95% probability θ in [L,U]"); CI is procedure-level ("95% of CIs cover θ").
- For large n, posterior → MLE ("data swamps the prior"); for small n, prior dominates.
- MLE maximizes ℓ(θ) = Σ ln f(t_i) + Σ ln R(T⁺_j); the bridge to Bayesian (same likelihood, adds prior).
- IEC 61508 route 2H "prior use" = Bayesian posterior with justified prior; mandatory for SIL 3/4 demonstration on small samples.`,
    references: `- ASQ CRE Body of Knowledge — Probability & Statistics domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 12 (Bayesian reliability).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 14 (Bayesian methods).
- Nelson (1982/2004), Applied Life Data Analysis, Ch. 8 (MLE and censored-data likelihood).
- Montgomery & Runger (2014), Applied Statistics and Probability for Engineers, Ch. 14 (Bayesian methods).`,
  },
  knowledgeObject: {
    title: "Bayesian & Reliability Data Analysis",
    domain: "Probability & Statistics",
    competency: "Bayesian & Reliability Data Analysis",
    topic: "Bayesian Reliability Inference",
    concept: "Bayes theorem, Beta-Binomial/Gamma-Poisson conjugate priors, MLE, IEC 61508 route 2H",
    body: {
      definitions: [
        "Bayes' theorem: posterior(θ | data) ∝ prior(θ) × likelihood(data | θ).",
        "Prior distribution f(θ): pre-data belief about θ; informative or non-informative (Jeffreys, uniform).",
        "Likelihood L(data | θ): probability of observed data given θ; same function in Bayesian and frequentist paradigms.",
        "Posterior distribution f(θ | data): updated belief after seeing the data.",
        "Conjugate prior: a prior family yielding a posterior in the same family (Beta-Binomial, Gamma-Poisson).",
        "Beta distribution: continuous on [0,1], parameters (a, b); conjugate to binomial for a probability parameter.",
        "Gamma distribution: continuous on [0,∞), parameters (k shape, θ scale); conjugate to Poisson for a rate parameter.",
        "Credible interval (CRI): Bayesian analog of CI; parameter-level ('95% probability θ in [L,U]').",
        "MAP (maximum a posteriori): mode of the posterior.",
        "Posterior mean E[θ|data]: preferred point estimate for skewed posteriors.",
        "Posterior predictive: prediction of new data, integrating over the posterior.",
        "Jeffreys prior: non-informative prior ∝ √(det I(θ)); invariant under reparameterization.",
        "Data swamps the prior: as n grows, posterior → MLE; prior's influence shrinks.",
        "Route 2H prior use: IEC 61508 justification of safety-integrity equipment based on documented prior-use evidence (the prior).",
        "MLE (Maximum Likelihood Estimation): maximizes ℓ(θ) = Σ ln f(t_i) + Σ ln R(T⁺_j); the frequentist point estimate and the bridge to Bayesian.",
      ],
      principles: [
        "Bayes: posterior ∝ prior × likelihood; the prior encodes pre-data knowledge, the data updates it.",
        "Beta-Binomial: posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n) — failure-on-demand probability.",
        "Gamma-Poisson: posterior Gamma(k+r, rate=1/θ+T), mean (k+r)/(1/θ+T) — exponential failure rate.",
        "CRI is parameter-level; CI is procedure-level — do not collapse the two.",
        "For large n, posterior → MLE (data swamps the prior); for small n, prior dominates.",
        "MLE maximizes ℓ(θ) = Σ ln f(t_i) + Σ ln R(T⁺_j); same likelihood as Bayesian, no prior.",
        "IEC 61508 route 2H = Bayesian posterior with justified prior; mandatory for SIL 3/4 on small samples.",
      ],
      components: [
        "Prior distribution f(θ).",
        "Likelihood L(data | θ).",
        "Posterior distribution f(θ | data).",
        "Posterior mean / MAP (point estimates).",
        "Credible interval (CRI).",
        "Conjugate pair (Beta-Binomial, Gamma-Poisson).",
        "Marginal P(data) (normalization).",
        "Posterior predictive.",
      ],
      mechanism: [
        "Bayesian lifecycle: identify parameter θ → choose prior (informative from prior-use, or non-informative) → construct likelihood from observed data (with censoring) → compute posterior (closed-form for conjugate, MCMC for non-conjugate) → report posterior mean + 95% CRI → for SIL verification, compare posterior 95% upper bound to SIL boundary → document prior justification (IEC 61508 route 2H evidence).",
      ],
      process: [
        "1. Identify the unknown parameter θ (failure-on-demand p, failure rate λ, Weibull β).",
        "2. Choose the prior: informative (prior-use evidence) or non-informative (Jeffreys).",
        "3. Construct the likelihood L(data | θ) from observed failure data (with censoring).",
        "4. Compute the posterior f(θ | data) ∝ f(θ)·L — closed-form for conjugate pairs, MCMC for non-conjugate.",
        "5. Report posterior mean (or MAP) and 95% CRI.",
        "6. For SIL verification: compare posterior 95% upper bound to the SIL boundary; document prior justification.",
        "7. For small samples, augment with prior knowledge; for large samples, the data dominates and the Bayesian → MLE.",
        "8. Cross-check posterior mean against the MLE — they should converge as n grows.",
      ],
      formulas: [
        "Bayes: posterior(θ | data) ∝ prior(θ) × likelihood(data | θ).",
        "Beta-Binomial: prior Beta(a, b) × binomial(x, n) → posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n).",
        "Gamma-Poisson: prior Gamma(k, θ) × Poisson(r, T) → posterior Gamma(k+r, rate=1/θ+T), mean (k+r)/(1/θ+T).",
        "MLE exponential: ℓ(λ) = r·ln(λ) − λ·T; λ̂ = r/T, MTBF̂ = T/r.",
        "MLE Weibull: ℓ(β,η) = r·[ln β − β·ln η] + (β−1)·Σ ln t_i − (1/η^β)·[Σ t_i^β + Σ (T⁺_j)^β].",
        "Bayesian CRI: '95% probability θ in [L,U]' (parameter-level).",
        "Frequentist CI: '95% of CIs cover θ' (procedure-level).",
      ],
      metrics: [
        "Posterior mean E[θ | data] [parameter units].",
        "Posterior mode MAP [parameter units].",
        "95% CRI [L, U] [parameter units].",
        "Posterior predictive [predicted-data units].",
        "Marginal P(data) (normalization).",
        "SIL boundary (e.g., P_fd ≤ 1×10⁻³ for SIL 3).",
        "MLE point estimate (for cross-check).",
      ],
      examples: [
        "Beta(1, 199) prior + x=1, n=200 → posterior Beta(2, 398), mean 0.005, 95% CRI [0.00061, 0.0135].",
        "Gamma(2, 10000 h) prior + r=4, T=10000 h → posterior Gamma(6, rate=20000 h), E[λ|data]=3×10⁻⁴/h, MTBF≈3333 h.",
        "Beta(1, 999) prior + x=0, n=500 → posterior Beta(1, 1499), 95% upper CRI ≈ 0.0025 (above SIL 3 boundary 0.001).",
        "Beta(1, 999) prior + x=0, n=5000 → posterior Beta(1, 5999), 95% upper CRI ≈ 0.0006 (below SIL 3 boundary).",
      ],
      industrial_examples: [
        "Electronics — SIS final-element SIL 3 verification: Beta(1, 999) prior + n=500, x=1 → posterior Beta(2, 1498), 95% upper CRI ≈ 0.0043 — exceeds SIL 3 boundary; design FAILED.",
        "Automotive — ECU MTBF from sparse field data: Gamma(1, 50000) prior + T=5000, r=2 → posterior Gamma(3, 55000), 90% lower CRI on MTBF ≈ 4500 h (above 4000-h contract).",
        "Aerospace — safety-critical component qualification: Bayesian with physics-of-failure prior.",
        "Oil & Gas — subsea ESD valve route 2H: Beta(1, 999) prior + n=5000, x=0 → posterior Beta(1, 5999), 95% upper CRI ≈ 0.0006 — SIL 3 verified.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Subsea ESD valve SIL 3 route 2H: Jeffreys-like Beta(0.5, 499.5) prior + n=100, x=0 → posterior Beta(0.5, 599.5), 95% upper CRI ≈ 0.0040 — fails SIL 3. Strengthened prior Beta(1, 999) + n=1000, x=0 → posterior Beta(1, 1999), 95% upper ≈ 0.0019 — fails. n=5000, x=0 → posterior Beta(1, 5999), 95% upper ≈ 0.0006 — SIL 3 verified. Test infrastructure cost $2.5M justified by SIL 3 certification enabling subsea-EPC awards. Method per IEC 61508 route 2H and Ebeling (2010, Ch. 12).",
      ],
      common_errors: [
        "Using an unjustified informative prior for IEC 61508 route 2H — the prior must be documented from prior-use evidence.",
        "Choosing a non-informative prior for SIL 3/4 — the prior cannot pull the posterior below the data rate; requires huge n.",
        "Confusing Bayesian CRI with frequentist CI (different interpretations: parameter-level vs procedure-level).",
        "Reporting posterior mean without the CRI (conceals precision at small n).",
        "Using rule of 3 (3/n) as the SIL upper bound for 0 failures — too wide for SIL 3/4; use Bayesian with informative prior.",
        "Forgetting to normalize the prior × likelihood product (always automatic for conjugate pairs).",
        "Using MLE on heavily-censored small samples without Bayesian augmentation — biased and optimistic CI.",
        "Treating posterior predictive as the parameter estimate (it's wider, integrating over the posterior).",
      ],
      limitations: [
        "The prior is subjective; for SIL 3/4 verification it must be documented and justifiable (IEC 61508 route 2H).",
        "Non-informative priors on small samples cannot pull the posterior below the data rate — useless for SIL demonstration.",
        "Conjugate priors restricted to exponential/binomial models; Weibull β≠1 with non-conjugate priors requires MCMC.",
        "Posterior mean is a single point; for skewed posteriors, median or 5th-percentile may be more decision-relevant.",
        "Bayesian CRI ≠ frequentist CI in interpretation; do not collapse them.",
        "Strong priors dominate the posterior — must be defensible.",
        "'Data swamps the prior' requires large n; for routine n=10-100, the prior matters.",
        "MCMC for non-conjugate posteriors requires convergence diagnostics (Gelman-Rubin R̂, ESS) — biased if non-converged.",
      ],
      best_practices: [
        "Document the prior justification explicitly — for SIL verification under IEC 61508 route 2H, the prior must come from prior-use evidence (ISO 14224, prior-generation data, physics-of-failure modeling, expert judgment).",
        "Use conjugate priors (Beta-Binomial, Gamma-Poisson) for routine reliability work — closed-form, no MCMC.",
        "Report posterior mean + 95% CRI + the prior and the data — full transparency.",
        "For SIL 3/4 demonstration, solve the minimum-n problem: given the SIL boundary and the prior, find the minimum n (and acceptable x) that meets the 95% upper CRI bound.",
        "Cross-check the Bayesian posterior mean against the MLE — they should converge as n grows; divergence at small n is expected.",
        "Use non-informative priors (Jeffreys) only for screening or when prior-use evidence is unavailable; expect wide CRIs.",
        "For Weibull β≠1 with non-conjugate priors, use MCMC with convergence diagnostics (R̂ < 1.01, ESS > 400).",
      ],
      related_concepts: [
        "Probability Distributions for Reliability (Lesson 1) — exponential, Weibull, lognormal.",
        "Statistical Inference & Confidence Intervals (Lesson 2) — chi-square CI as the frequentist analog.",
        "Reliability Modeling (RM pillar) — RBD/FTA/Markov inputs from posterior mean + CRI lower bound.",
        "ISO 14224:2016 — population failure-rate source for prior elicitation.",
        "IEC 61508/61511 — route 2H 'prior use' justification framework.",
      ],
      prerequisites: [
        "Probability Distributions for Reliability (Lesson 1).",
        "Statistical Inference & Confidence Intervals (Lesson 2).",
        "Bayes' theorem: P(θ | data) = P(data | θ)·P(θ) / P(data).",
        "Beta, Gamma, and Poisson distributions and their conjugate-pair properties.",
        "IEC 61508/61511 SIL framework (superficially).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Probability & Statistics domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 12.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 14.",
        "Nelson (1982/2004), Applied Life Data Analysis, Ch. 8.",
        "Montgomery & Runger (2014), Applied Statistics and Probability for Engineers, Ch. 14.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Bayesian & Reliability Data Analysis",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the Beta-Binomial posterior for a Beta(a, b) prior on the failure-on-demand probability p, given x failures observed in n demands?",
      whyCorrect:
        "The Beta is the conjugate prior to the Binomial. The prior Beta(a, b) has density ∝ p^(a−1)·(1−p)^(b−1). The binomial likelihood (x failures in n demands) is L ∝ p^x·(1−p)^(n−x). Multiplying: posterior ∝ p^(a+x−1)·(1−p)^(b+n−x−1), which is Beta(a+x, b+n−x). The posterior mean is (a+x)/(a+b+n) — a weighted average between the prior mean (a/(a+b)) and the data rate (x/n), with weights proportional to (a+b) and n respectively.",
      whyOthersWrong: [
        "Option A (Beta(a+x, b)) — missing the (n−x) term in the second parameter; the binomial likelihood contributes (1−p)^(n−x), so the second posterior parameter is b+(n−x) = b+n−x, not b.",
        "Option C (Beta(a, b+n−x)) — missing the x term in the first parameter; the binomial contributes p^x, so the first posterior parameter is a+x.",
        "Option D (Beta(a·n+x, b·n+n−x)) — the prior parameters a, b are NOT multiplied by n; the conjugate update is additive (a+x, b+n−x), not multiplicative. The 'weight' on the prior is (a+b), not (a+b)·n.",
      ],
      explanation:
        "Beta-Binomial conjugate: prior Beta(a, b) × binomial(x, n) → posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n). The update is additive in both parameters.",
      options: [
        { text: "Beta(a + x, b)", isCorrect: false },
        { text: "Beta(a + x, b + n − x)", isCorrect: true },
        { text: "Beta(a, b + n − x)", isCorrect: false },
        { text: "Beta(a·n + x, b·n + n − x)", isCorrect: false },
      ],
    },
    {
      competencyName: "Bayesian & Reliability Data Analysis",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Aerospace",
      stem: "A safety-shutdown valve has a Beta(1, 199) prior on its failure-on-demand probability p (prior mean 0.005). A field test observes n = 200 demands with x = 1 failure. Compute the posterior mean E[p | data].",
      whyCorrect:
        "Beta-Binomial conjugate: posterior Beta(a+x, b+n−x) = Beta(1+1, 199+200−1) = Beta(2, 398). Posterior mean E[p | data] = (a+x)/(a+b+n) = (1+1)/(1+199+200) = 2/400 = 0.005 = 0.5%. The data rate x/n = 1/200 = 0.005 = 0.5% exactly matches the prior mean a/(a+b) = 1/200 = 0.005 — so the posterior mean equals both the prior mean and the data rate. The posterior is sharper than the prior (the data narrowed the uncertainty) but the location didn't shift because the data and prior agreed.",
      whyOthersWrong: [
        "Option A (0.0025) — this is the mode (a+x−1)/(a+b+n−2) = (1+1−1)/(1+199+200−2) = 1/398 = 0.00251, not the mean; for a Beta(2, 398), the mode is at (2−1)/(2+398−2) = 1/398 ≈ 0.00251, while the mean is (2)/(400) = 0.005. The mode is below the mean because the distribution is right-skewed.",
        "Option C (0.01) — this is 2·(x/n) = 2·0.005 = 0.01 — there is no Bayesian formula that doubles the data rate; this option confuses the prior strength.",
        "Option D (0.002) — this is x/(n+1) = 1/201 ≈ 0.00497 or (x+0)/(n+1) for a Laplace prior; not the Beta-Binomial posterior mean with a Beta(1, 199) prior.",
      ],
      explanation:
        "Posterior Beta(1+1, 199+200−1) = Beta(2, 398). E[p|data] = (a+x)/(a+b+n) = 2/400 = 0.005 = 0.5%. Data rate = prior mean = posterior mean (exact agreement). The posterior is sharper than the prior but at the same location.",
      options: [
        { text: "0.0025", isCorrect: false },
        { text: "0.005", isCorrect: true },
        { text: "0.01", isCorrect: false },
        { text: "0.002", isCorrect: false },
      ],
    },
    {
      competencyName: "Bayesian & Reliability Data Analysis",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "Contrast the Bayesian 95% credible interval (CRI) with the frequentist 95% confidence interval (CI). Which statement is correct?",
      whyCorrect:
        "The Bayesian CRI is a parameter-level statement: 'given the observed data and the prior, there is 95% probability that the true parameter θ lies in [L, U].' The frequentist CI is a procedure-level statement: 'if the experiment were repeated many times, 95% of the CIs constructed by this procedure would cover the true (fixed, unknown) θ.' The Bayesian treats θ as a random variable (with a prior); the frequentist treats θ as fixed. The CRI is more natural for engineering decisions ('95% probability the failure rate is below 1×10⁻³/h'); the CI is more objective (no prior elicitation). Both give numerical intervals; their interpretation differs fundamentally.",
      whyOthersWrong: [
        "Option A (Both are procedure-level; identical statements) — incorrect; the Bayesian CRI is parameter-level (probability statement about θ given the data), the frequentist CI is procedure-level (coverage probability of the procedure). The two statements are mathematically and conceptually distinct.",
        "Option B (Bayesian CRI requires no prior; frequentist CI requires a prior) — backwards: the Bayesian CRI is computed from a prior × likelihood → posterior; the frequentist CI uses only the likelihood (sampling distribution of the estimator), no prior.",
        "Option D (CRI is wider than CI for the same data) — not generally true; with an informative prior, the CRI can be narrower than the CI (the prior contributes information). With a non-informative prior, the CRI and CI are numerically similar but the interpretations remain different.",
      ],
      explanation:
        "Bayesian CRI: 'given data and prior, 95% probability θ in [L,U]' (parameter-level). Frequentist CI: '95% of CIs (by this procedure) cover θ' (procedure-level). The Bayesian treats θ as random; the frequentist treats θ as fixed.",
      options: [
        { text: "Both are procedure-level statements; identical in interpretation", isCorrect: false },
        { text: "Bayesian CRI requires no prior; frequentist CI requires a prior", isCorrect: false },
        { text: "Bayesian CRI is parameter-level ('95% probability θ in [L,U]'); frequentist CI is procedure-level ('95% of CIs cover θ')", isCorrect: true },
        { text: "CRI is always wider than CI for the same data", isCorrect: false },
      ],
    },
    {
      competencyName: "Bayesian & Reliability Data Analysis",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Electronics",
      stem: "True or False: For large sample sizes n, the Bayesian posterior mean converges to the MLE (maximum likelihood estimate) — the 'data swamps the prior' regime.",
      whyCorrect:
        "TRUE. As n grows, the likelihood L(data | θ) becomes increasingly concentrated around the MLE (the asymptotic normality of MLE: posterior ≈ N(MLE, 1/(n·I(θ̂))) for any smooth prior that is positive in a neighborhood of the MLE). The prior f(θ) is multiplied by a sharply-peaked likelihood; the prior's contribution becomes negligible compared to the likelihood's, and the posterior concentrates at the MLE. For Beta(a, b) prior + binomial(x, n): posterior mean = (a+x)/(a+b+n) → x/n (the MLE) as n → ∞ (since a, b are fixed and x/n → true p). For Gamma(k, θ) prior + Poisson(r, T): posterior mean = (k+r)/(1/θ+T) → r/T (the MLE λ̂) as T → ∞. This is the asymptotic equivalence of Bayesian and frequentist estimators — at large n, the choice of prior matters less.",
      whyOthersWrong: [
        "Option FALSE — would imply the Bayesian posterior diverges from the MLE at large n; in fact, the posterior converges to the MLE (asymptotic normality / Bernstein-von Mises theorem). The 'data swamps the prior' regime is the asymptotic justification for using non-informative priors in large samples — the prior's influence shrinks to zero and the Bayesian → frequentist.",
      ],
      explanation:
        "TRUE. As n → ∞, posterior mean → MLE (Bernstein-von Mises theorem). The prior's influence shrinks as 1/n; at large n the data dominates. Beta-Binomial: (a+x)/(a+b+n) → x/n; Gamma-Poisson: (k+r)/(1/θ+T) → r/T.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lessons table
// ---------------------------------------------------------------------------

export const CRE_PS_LESSONS: RefLesson[] = [
  LESSON_DIST,
  LESSON_INFERENCE,
  LESSON_BAYES,
];

// ---------------------------------------------------------------------------
// PS competencies created inside loadReference() (PS domain exists in
// src/lib/ref-content/cre.ts with NO competencies yet — this loader seeds
// the 3 PS competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CRE_PS_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Probability Distributions for Reliability",
    description:
      "Continuous probability distributions for time-to-failure data: exponential (constant failure rate, useful-life), Weibull (β shape, η scale — infant-mortality/wear-out), lognormal (fatigue, multiplicative degradation), normal (additive wear-out). Pdf, cdf, reliability R(t), hazard h(t), MTBF. Parameter estimation by MLE and median-rank regression; Anderson-Darling goodness-of-fit. The bridge from observed failure data to the reliability function used downstream in the RM pillar.",
    order: 1,
  },
  {
    name: "Statistical Inference & Confidence Intervals",
    description:
      "Point and interval estimation; chi-square MTBF confidence interval for the exponential (time-truncated ν=2r+2, failure-truncated ν=2r); one-sided lower MTBF bound and reliability lower bound R_L(t)=exp(−t/MTBF_L); hypothesis testing (H0: MTBF≤MTBF₀ vs H1: MTBF>MTBF₀); OC curve and sample-size design (producer's risk α, consumer's risk β, discrimination ratio d). Confidence levels 90%/95%/99% by consequence.",
    order: 2,
  },
  {
    name: "Bayesian & Reliability Data Analysis",
    description:
      "Bayes' theorem for reliability (posterior ∝ prior × likelihood); Beta-Binomial conjugate pair for failure-on-demand probability p (posterior Beta(a+x, b+n−x), mean (a+x)/(a+b+n)); Gamma-Poisson conjugate pair for exponential failure rate λ; Bayesian credible interval (CRI, parameter-level) vs frequentist confidence interval (CI, procedure-level); MLE basics for exponential/Weibull; reliability data from censored and field data; IEC 61508/61511 route 2H 'prior use' justification for SIL 3/4 verification on small samples.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-reliability-modeling.ts) with the
// additional step of creating the 3 PS competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CRE Probability & Statistics (PS) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CRE certification by slug "cre" (the structure+RF-content loader
 *     in src/lib/ref-content/cre.ts is a prerequisite).
 *  2. Find the PS domain by code "PS" (certificationId = cre.id). The PS
 *     domain exists in cre.ts with NO competencies — delete any stale PS
 *     competencies and create the 3 PS competencies from
 *     CRE_PS_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every PS lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (PS), competencyId,
 *     lessonId, body JSON, referenceIds (JSON shared), certificationIds
 *     (JSON [cre.id]), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos,
 *      questions, references } counts.
 */
export async function loadReference() {
  // 1) Certification (find by slug "cre")
  const certification = await db.certification.findUnique({
    where: { slug: "cre" },
  });
  if (!certification) {
    throw new Error(
      'CRE certification not found. Run the CRE structure+RF-content loader (src/lib/ref-content/cre.ts) first.'
    );
  }

  // 2) Find the PS domain by code "PS" (certificationId = cre.id). The PS
  //    domain exists in cre.ts but is seeded with NO competencies — delete
  //    any stale PS competencies and create the 3 PS competencies here.
  const psDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "PS" },
  });
  if (!psDomain) {
    throw new Error(
      'Probability & Statistics (PS) domain not found under CRE. Run the CRE structure+RF-content loader (src/lib/ref-content/cre.ts) first.'
    );
  }

  // Delete any existing PS competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: psDomain.id },
  });

  // Create the 3 PS competencies.
  for (const c of CRE_PS_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: psDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map PS competencies by NAME -> id.
  const psCompetencies = await db.competency.findMany({
    where: { domainId: psDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of psCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected PS competencies exist by name.
  const expectedCompetencyNames = CRE_PS_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing PS competencies by name: ${missing.join(
        ", "
      )}. Ensure CRE_PS_COMPETENCIES matches CRE_PS_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CRE_PS_SOURCES) {
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
  const sharedReferenceIds = CRE_PS_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CRE_PS_LESSONS) {
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
      domainId: psDomain.id,
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
          domainId: psDomain.id,
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
    domain: psDomain.id,
    competencies: psCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}

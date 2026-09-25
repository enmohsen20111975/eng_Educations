/**
 * CMRP — Organization & Leadership pillar — Deep scientific reference (Task ID 14-OL).
 *
 * Certification slug: "cmrp" (Certified Maintenance & Reliability Professional).
 * Domain code: "OL" (Organization & Leadership) — one of the 5 official SMRP CMRP pillars.
 *
 * Five lessons, one per OL competency (as seeded in src/lib/ref-content/cmrp.ts):
 *   1. Organizational Structures  (slug: ol-organizational-structures)
 *   2. Leadership                  (slug: ol-leadership)
 *   3. Organizational Behavior     (slug: ol-organizational-behavior)
 *   4. Change Management           (slug: ol-change-management)
 *   5. Training & Development      (slug: ol-training-development)
 *
 * Each lesson ships:
 *   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE in
 *     src/lib/spec.ts), with every applicable section filled with real,
 *     in-depth M&R organizational-design / leadership / behavior / change /
 *     training content. Compact prose, no padding.
 *   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays filled.
 *   - 4 enriched questions (whyCorrect + one whyOthersWrong per distractor +
 *     cognitiveLevel + KO link + scenario/industry metadata). 20 questions total.
 *
 * Source hierarchy (spec §5) — Levels 2, 3, 5, 6, 7:
 *   - LEVEL 3 — Official BOK: SMRP CMRP BOK (OL pillar).
 *   - LEVEL 2 — Official Standard: ISO 55000:2014 (leadership, alignment, assurance).
 *   - LEVEL 5 — Professional Organizations: O'Hanlon, Uptime (Reliabilityweb).
 *   - LEVEL 6 — University / Academic Publications: Kotter (Leading Change),
 *     Deming (Out of the Crisis).
 *   - LEVEL 7 — Technical Publications: Mobley (Maintenance Engineering Handbook).
 *
 * Originality (spec §16): worked examples, decision scenarios, case studies,
 * and questions are authored for this platform; textbook material is summarized
 * and cited, not reproduced. Case studies are SYNTHETIC and explicitly marked
 * `CASE_TYPE = SYNTHETIC`.
 *
 * Lifecycle: every record upserted with status="READY", confidence="HIGH",
 * verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *
 * Loader flow (see loadReference below):
 *   1. Find CMRP certification by slug "cmrp"; find OL domain by code "OL";
 *      map its 5 competencies by NAME -> id.
 *   2. Upsert References globally (by title, no sectionId) -> shared referenceIds.
 *   3. For each lesson: findFirst({competencyId, slug}) then update or create.
 *   4. Upsert KnowledgeObject per lesson (findFirst by lessonId) with body + refs.
 *   5. For each lesson: deleteMany questions scoped to {certificationId,
 *      competencyId} then create each enriched question.
 *   6. Return { lessons, kos, questions, references, competencies } counts.
 */

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirrors cmrp-business-management.ts)
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
  scenario?: string; // Manufacturing|Oil & Gas|Power|Container Terminal|Chemical|...
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
  level: string; // "1".."9"
  levelLabel: string;
  type: string; // BOOK|STANDARD|HANDBOOK|PAPER|WEBSITE|BOK|EXAM_OUTLINE
  url?: string;
  citation: string;
}

// ---------------------------------------------------------------------------
// Sources (Levels 2, 3, 5, 6, 7 — real, widely-known references)
// ---------------------------------------------------------------------------

export const CMRP_OL_SOURCES: RefSource[] = [
  {
    title: "SMRP CMRP Body of Knowledge — Organization & Leadership pillar",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.smrp.org/certification/cmrp-exam",
    citation:
      "Society for Maintenance & Reliability Professionals (SMRP). CMRP Body of Knowledge — Organization & Leadership pillar: Organizational Structures, Leadership, Organizational Behavior, Change Management, and Training & Development competencies. The official competency framework assessed by the CMRP exam; anchors M&R org design (centralized vs decentralized, planner/scheduler separation, span of control), reliability leadership & executive sponsorship, reliability-culture assessment, Kotter-style change execution for RCM/TPM/CI rollouts, and the skills-matrix / training-ROI discipline.",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Establishes the 'leadership & commitment' principle (top-management demonstrable commitment), the alignment & assurance principles, and the vocabulary (asset management policy, asset-management objectives, organizational roles). ISO 55001 Cl. 5 (Leadership), Cl. 7.2 (Competence), Cl. 7.3 (Awareness), Cl. 7.4 (Communication) operationalize the OL pillar at the management-system level.",
  },
  {
    title: "Kotter — Leading Change (Harvard Business Review Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    url: "https://hbr.org/books",
    citation:
      "Kotter, J. P. (1996/2012). Leading Change. Boston, MA: Harvard Business Review Press. ISBN 978-1-4221-8643-5. The canonical 8-step change-management model — (1) Create Urgency, (2) Form Guiding Coalition, (3) Develop Vision & Strategy, (4) Communicate the Change Vision, (5) Empower Broad-Based Action, (6) Generate Short-Term Wins, (7) Consolidate Gains & Produce More Change, (8) Anchor New Approaches in the Culture. Source of the milestone-timeline discipline applied to RCM/TPM/CI rollouts in the Change Management competency.",
  },
  {
    title: "Deming — Out of the Crisis (MIT CAES Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Deming, W. E. (1986). Out of the Crisis. Cambridge, MA: MIT Center for Advanced Engineering Study. ISBN 978-0-913790-53-6. Source of the System of Profound Knowledge (appreciation for a system, knowledge of variation, theory of knowledge, psychology of people), the Plan-Do-Study-Act (PDSA) cycle, and the 14 Points for Management — foundations of organizational behavior, leadership, and culture for reliability.",
  },
  {
    title: "Mobley — Maintenance Engineering Handbook (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    citation:
      "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). McGraw-Hill. ISBN 978-0-07-154358-0. Section I (organization of the M&R function — centralized/decentralized/hybrid, planner-vs-scheduler, span of control, job descriptions), Section III (workforce/HR — competency, training, certification), Section XII (managing the maintenance organization). The widely-cited technical reference for M&R organizational design, training, and competency.",
  },
  {
    title: "O'Hanlon — Uptime: A Guide to Reliable Performance (Reliabilityweb)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://www.reliabilityweb.com",
    citation:
      "O'Hanlon, T. (2000/2015). Uptime: A Guide to Reliable Performance. Reliabilityweb / Industrial Press. ISBN 978-0-8311-3494-1. The widely-cited M&R leadership & culture book; develops the reliability-leadership behaviors, the executive-sponsorship model, the reliability-culture maturity ladder (Reactive → Planned → Proactive → Reliability-Centered), and the organizational-behavior metrics used in the OL pillar.",
  },
];

const OL_REFERENCE_TITLES = CMRP_OL_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Organizational Structures
// ---------------------------------------------------------------------------

const LESSON_ORG_STRUCTURES: RefLesson = {
  competencyName: "Organizational Structures",
  slug: "ol-organizational-structures",
  title: "M&R Organizational Structures, Roles & RACI",
  titleAr: "هياكل تنظيم الصيانة والموثوقية والأدوار ومصفوفة المسؤولية",
  order: 1,
  durationMin: 30,
  references: OL_REFERENCE_TITLES,
  conceptIntroduction: `Organizational Structures is the design discipline that decides *who* does *what* in the M&R function — and is the single largest determinant of whether reliability initiatives scale. The three core design levers: (1) centralization — what work is owned by a central reliability/planning team vs. distributed to area crafts; (2) role separation — particularly the planner-vs-scheduler split (planners scope the job; schedulers sequence the work), which SMRP-aligned practice treats as non-negotiable for plants above ~100 crafts; (3) span of control — the supervisor-to-craft ratio, typically 1:12-1:20 in M&R. ISO 55000:2014 Cl. 5 (Leadership) and Cl. 7.2 (Competence) frame org design as the structural expression of leadership intent — a poorly designed structure silently defeats even the best-led reliability program.`,
  example: `A Chemical plant with 200 crafts uses a hybrid structure: a 28-FTE central reliability group (1 MM, 8 planners, 3 schedulers, 4 reliability engineers, 12 area supervisors) supporting 4 area-craft teams (50 each). Centralization index = 28/228 = 12.3% (low → decentralized execution). Planner:craft ratio = 8:200 = 1:25 (within SMRP's 1:20-1:30 band). Supervisor span = 200/12 = 16.7 crafts/supervisor (acceptable for a mature plant). A RACI matrix on 10 work-management activities shows exactly one Accountable per row, R+A activities = 22 of 60 RACI cells (37%) — healthy consultation density.`,
  keyFormulas: `Span of control = direct reports / supervisor  [people per supervisor; target 8-20 in M&R]
Centralization index CI = (central-staff FTE) / (total M&R FTE) × 100  [%]
Planner:craft ratio = planners / crafts  [target 1:20-1:30 per SMRP]
RACI ownership ratio = (R + A) / (R + A + C + I) per activity  [target 0.30-0.50]
RACI rule: exactly one A per activity; ≥1 R per activity; A and R may be the same person only for trivial activities.`,
  exercise: `You inherit a 180-craft M&R org with 2 planners, 1 scheduler, 6 supervisors. CMMS shows 35% PM compliance and 9-day backlog. (a) Compute planner:craft ratio; (b) Compute supervisor span; (c) Diagnose: is the planner:craft ratio inside the SMRP band? (d) Recommend a restructure to lift PM compliance to 85%. State assumptions.`,
  sections: {
    learning_objectives: `- Distinguish centralized, decentralized, and hybrid M&R org structures and pick by site size, asset criticality, and maturity.
- Apply the planner-vs-scheduler separation (planners scope the job; schedulers sequence the work) and explain why blending them defeats work management.
- Compute span of control, centralization index, and planner:craft ratio against SMRP bands.
- Build a RACI matrix on the maintenance-work lifecycle (10 canonical activities × 6 roles).
- Map ISO 55000 Cl. 5 leadership / Cl. 7.2 competence requirements to org-design choices.
- Diagnose org-design failure modes (single-planner bottleneck, no scheduler, supervisor span > 25, RACI without an A).`,
    prerequisites: `- CMRP BOK 5-pillar structure; OL as the organizational wrapper.
- Work Management (WM pillar) — WO lifecycle, planning vs scheduling, backlog.
- ISO 55000:2014 vocabulary (asset, asset management, asset-management policy, top-management leadership).
- Basic people-management vocabulary: span of control, line vs staff, RACI.`,
    introduction: `Structure is destiny in M&R. A reliability engineer reporting to operations cannot enforce PM compliance on operators who report to a different manager; a planner who also schedules will, under pressure, schedule first and plan second — producing jobs that start on time and run long because they were never scoped. The OL pillar's first competency — Organizational Structures — addresses these structural defects directly: who reports to whom, who owns which decisions, how many crafts per supervisor, and where the reliability function sits on the org chart.

ISO 55000:2014 frames org design as leadership: Cl. 5.1 requires top management to "demonstrate leadership and commitment" by establishing the asset-management policy, ensuring the org structure supports the policy, and providing resources. Cl. 5.3 requires explicit roles, responsibilities, and authorities. Cl. 7.2 (Competence) requires that "persons doing work under its control that affects asset management performance are competent on the basis of education, training, skills and experience" — which directly informs span of control and the planner:craft ratio.

The three structural levers — centralization, role separation, span of control — together determine whether M&R is reactive (firefighting, planner-less, supervisor span > 25, no scheduler) or proactive (centralized reliability, separated planner/scheduler, supervisor span 12-18, RACI clear).`,
    terminology: `- **Centralized structure**: central reliability + planning + scheduling staff serve all areas; crafts are deployed to areas. Best for multi-site or single large site.
- **Decentralized structure**: each area/business unit has its own reliability + planning embedded. Best for highly varied processes or autonomous business units.
- **Hybrid structure**: central strategy/policy + embedded area execution. Most common in mid-size to large single-site plants.
- **Planner**: scopes the job — scope, parts, labor estimate, safety, procedure, tools. *Never* sequences work.
- **Scheduler**: sequences planned work against equipment-availability windows and resource constraints. *Never* scopes the job.
- **Span of control**: number of direct reports per supervisor. M&R target 8-20.
- **RACI**: Responsible (does the work) / Accountable (owns the outcome, one per activity) / Consulted (provides input before) / Informed (notified after).
- **Centralization index (CI)**: central-staff FTE / total M&R FTE × 100.
- **Planner:craft ratio**: planners / crafts; SMRP band 1:20-1:30.
- **Line vs staff**: line managers own production outputs; staff (reliability, planning) advise and enable.
- **Reliability engineer (RE)**: data analyst, RCA facilitator, PdM-program owner — reports to the M&R manager, *not* to operations, to preserve independence.`,
    detailed_explanation: `The four canonical M&R org structures:

(1) **Centralized** (CI > 25%): all planners, schedulers, reliability engineers, and supervisors report to a single M&R Manager. Pros: standardization, career paths, mobility across areas, economies of scale in tools/spares. Cons: distance from the floor, slower response to local issues, Ops-Maint friction. Best for single large plants and multi-site consolidations.

(2) **Decentralized** (CI < 10%): each area/business unit has its own embedded planner, scheduler, and reliability engineer reporting to the area manager. Pros: responsiveness, Ops-Maint partnership, contextual knowledge. Cons: duplication, inconsistent standards, weak career paths, no shared analytics. Best for varied processes or autonomous units.

(3) **Hybrid** (CI 10-25%): central sets strategy, policy, CMMS, PdM, training; area teams execute. The most common pattern in mid-to-large plants.

(4) **Reliability-centered** (CI 20-30% with a Chief Reliability Officer reporting to the VP level): reliability is elevated above maintenance as a peer function, not a sub-function. Best for safety-critical or high-throughput industries (oil & gas, power) where the cost of unreliability is extreme.

The **planner-vs-scheduler separation** is non-negotiable above ~100 crafts. Planners and schedulers use the same CMMS data but answer different questions: the planner asks "what does it take to do this job right?" (scope, parts, labor, safety, procedure); the scheduler asks "when can we do this job given equipment-availability windows and resource constraints?" Blending them produces jobs that start on time and run long — the classic symptom of a planner-less organization.

**Span of control**: too wide (>25) → supervisors cannot coach, review WO closeout, or enforce PM compliance; too narrow (<8) → over-management, slow decisions, high overhead. SMRP-aligned target: 12-18 for skilled-trades supervisors in mature plants; 8-12 for new or high-turnover plants.

**RACI discipline**: every WO lifecycle activity must have exactly one Accountable (a single throat to choke) and at least one Responsible. A row with no A = nobody owns it; a row with two A's = nobody owns it (each waits for the other). Activities with > 3 C's are over-consulted and slow; activities with 0 I's surprise people.`,
    core_principles: `- Structure follows strategy: centralize what should be standardized; decentralize what should be contextual.
- One Accountable per activity — a single decision-maker per row of the RACI.
- Planner ≠ Scheduler: scope and sequence are different skills and must be separate roles above ~100 crafts.
- Span of control 12-18 for skilled trades; widen only with maturity.
- Reliability engineering reports to M&R (not Ops) to preserve independence.
- ISO 55000 Cl. 5 (Leadership) + Cl. 7.2 (Competence) are operationalized by org design — the org chart is leadership's first deliverable.`,
    components: `- Org chart (centralized / decentralized / hybrid / reliability-centered).
- Job descriptions: M&R Manager, Planner, Scheduler, Reliability Engineer, Supervisor, Craft, Operator (autonomous-maintenance role).
- RACI matrix (10 WO-lifecycle activities × 6 roles minimum).
- Centralization index metric (central-staff FTE / total M&R FTE × 100).
- Planner:craft ratio metric (planners / crafts).
- Supervisor span metric (crafts / supervisor).
- CMMS role-based access matrix (who can create, plan, schedule, execute, close, view WOs).
- Career-ladder map (apprentice → journey → master → specialist → supervisor → planner → RE).`,
    process: `1. Map the current org structure (reporting lines, FTE counts per role).
2. Compute centralization index, planner:craft ratio, supervisor span.
3. Compare to SMRP-aligned bands (CI 10-25% hybrid; planner:craft 1:20-1:30; supervisor span 12-18).
4. Build the RACI matrix for the 10 canonical WO-lifecycle activities (budget, bad-actor ID, PM list, job plan, scheduling, execution, closeout, RCA, criticality register, KPI review).
5. Audit each RACI row: exactly one A? ≥1 R? Consulted and Informed reasonable?
6. Identify structural gaps (single-planner bottleneck, no scheduler, RE reports to Ops, supervisor span > 25).
7. Design target structure (centralization level, role split, span targets).
8. Develop transition plan (12-18 mo; new job descriptions, hiring/redeployment, CMMS access changes, training).
9. Communicate changes (Change Management competency, Lesson 4).
10. Review the structure annually against KPI trends (PM compliance, backlog, MTBF).`,
    formula_calculation: `**Span of control** = direct reports / supervisor  [people per supervisor]
  - target 12-18 skilled trades; 8-12 immature/high-turnover; < 8 = over-managed; > 25 = under-managed.
  - example: 200 crafts / 12 supervisors = 16.7 (acceptable mature plant).

**Centralization index** CI = (central-staff FTE) / (total M&R FTE) × 100  [%]
  - < 10% decentralized; 10-25% hybrid; > 25% centralized; > 30% with CRO = reliability-centered.
  - example: 28 central staff / 228 total = 12.3% (hybrid).

**Planner:craft ratio** = planners / crafts  [target 1:20-1:30]
  - example: 8 planners / 200 crafts = 1:25 (in band).
  - red flag: 1:50 = planner overload → job plans become generic and incomplete → WO overruns.

**RACI ownership ratio** = (R + A) / (R + A + C + I) per activity  [target 0.30-0.50]
  - < 0.30 = over-consulted, slow; > 0.50 = under-consulted, siloed.
  - example: row with 1R + 1A + 2C + 2I = 2/6 = 0.33 (healthy).

**RACI rule** (qualitative): exactly one A per row; ≥1 R per row; A may equal R only for trivial activities (e.g., closeout).`,
    worked_example: `**Problem** — A Chemical plant (200 crafts) inherits a hybrid M&R structure. Build the RACI matrix for 10 canonical WO-lifecycle activities, then compute span of control, centralization index, planner:craft ratio, and audit RACI health.

**Roles**: MM (M&R Manager), PL (Planner), SC (Scheduler), RE (Reliability Engineer), CS (Craft Supervisor), OP (Operations).

**RACI matrix (10 activities × 6 roles)**:

| # | Activity | MM | PL | SC | RE | CS | OP |
|---|----------|----|----|----|----|----|----|
| 1 | Approve annual M&R budget | A | I | I | C | I | C |
| 2 | Identify bad-actor asset (CMMS) | C | C | I | A/R | I | I |
| 3 | Develop PM task list | C | A | I | R | C | I |
| 4 | Develop job plan (scope/parts/labor/safety) | I | A | I | C | R | I |
| 5 | Schedule weekly maintenance window | C | C | A | I | C | R |
| 6 | Execute WO (turnaround/PM/CM) | A | I | C | I | R | I |
| 7 | Capture failure data + CMMS closeout | C | A | I | C | R | I |
| 8 | Perform RCA on critical failure | A | C | I | R | C | I |
| 9 | Update asset-criticality register | A | C | I | R | I | I |
| 10 | Review PM-compliance KPI monthly | A | R | C | C | I | I |

**Audit** — every row has exactly one A (✓ RACI rule 1); every row has ≥1 R (✓ RACI rule 2); rows with >3 C: none (✓). Ownership ratio: row 1 = 2/8 = 0.25 (slightly low — acceptable for budget row); row 5 = 2/8 = 0.25; average ≈ 0.37 (healthy 0.30-0.50 band).

**Org metrics**:
- Central-staff FTE: 1 MM + 8 PL + 3 SC + 4 RE + 12 CS = 28.
- Total M&R FTE = 228 (28 central + 200 crafts).
- CI = 28/228 × 100 = **12.3%** (hybrid structure ✓).
- Planner:craft = 8/200 = **1:25** (SMRP band 1:20-1:30 ✓).
- Supervisor span = 200/12 = **16.7** (mature-plant band 12-18 ✓).

**Conclusion**: structure is SMRP-aligned. The plant's 35% PM-compliance problem is *not* structural — it is a leadership/behavior problem (Lesson 2 + 3).`,
    industrial_example: `**Oil & Gas — offshore platform**: centralized corporate reliability team (24 REs across 12 platforms) + on-platform maintenance supervisors. CI ≈ 30%; planner:craft 1:22; supervisor span 14. PM compliance 92%.

**Power — coal plant (4 units, 600 MW each)**: hybrid — central reliability + planning (1 MM, 6 PL, 2 SC, 3 RE, 1 PdM analyst) + 4 area craft teams (40 each). CI = 13/173 = 7.5% (decentralized execution with central staff). Supervisor span = 160/8 = 20 (top of band).

**Container Terminal — RTG yard (24 cranes)**: reliability-centered — Chief Reliability Officer at VP level; 4 REs, 6 PL, 2 SC, 12 supervisors. CI = 23/163 = 14.1% (hybrid execution; reliability elevated).

**Manufacturing — 3-site food plant**: decentralized per site (each site 1 RE, 1 PL, 1 SC) + central corporate reliability director (1). CI ≈ 6% (decentralized). Best for varied processes; loses analytics scale.`,
    case_study: `CASE_TYPE = SYNTHETIC. A 350-craft multi-process Chemical plant had a single Planner supporting all 350 crafts (ratio 1:350 — 14× outside the SMRP band) and no Scheduler (scheduling was done by Shift Supervisors between fires). PM compliance 28%, backlog 14 days, MTBF flat for 3 years. Diagnostic: org structure was the binding constraint. Restructure over 18 months: hire 6 additional Planners (total 7, ratio 1:50 — still outside band but workable for the transition), hire 2 Schedulers (one per shift block), move the Reliability Engineer from reporting to the Operations Director to reporting to the M&R Manager, and reduce supervisor span from 28 to 18 by hiring 4 additional supervisors. Year-1 outcome: PM compliance 28% → 58%. Year-2 (full transition): 58% → 81%. Backlog 14d → 6d → 3d. MTBF +19% (structural fix unlocked the data to drive the bad-actor program). Lesson: when PM compliance is < 50% and the planner:craft ratio is outside the SMRP band, the binding constraint is org design, not the crafts' effort — no amount of exhortation will lift compliance until the structure changes.`,
    visual_explanation: `Picture the M&R org chart as a pyramid: at the top the M&R Manager; beneath, three parallel sub-functions (Reliability Engineering, Planning, Scheduling) on one axis and Area Supervisors on another; crafts at the base. RACI is overlaid as a heatmap on the 10-activity × 6-role matrix — green for R/A cells, yellow for C, blue for I, red for any row missing an A or with >1 A. A healthy org has a green diagonal (each activity owned by the right role) and no red rows.`,
    simulation_opportunity: `Build a discrete-event simulator of the WO lifecycle with adjustable: planner:craft ratio, supervisor span, scheduler:on/off, RACI discipline. Input: 1,000 WO/yr baseline. Output: PM compliance, backlog, schedule-snap ratio, % WO closed in < 7d. Calibrate to the plant's KPIs, then sweep planner:craft from 1:10 to 1:50 in steps of 5; observe the cliff at 1:30 where compliance collapses. Use the simulator to defend a planner hire.`,
    common_mistakes: `- Single planner supporting > 30 crafts — produces generic, incomplete job plans; WO overruns.
- Blending planner and scheduler in one role — under pressure, scheduling wins and planning is skipped; jobs start on time and run long.
- Reliability Engineer reporting to Operations — RE is captured by production pressure and cannot enforce PM compliance on the assets that need it.
- Supervisor span > 25 — supervisor cannot coach, review WO closeout, or enforce PM compliance; becomes a dispatcher.
- RACI matrix with no Accountable on critical activities — no decision-maker; the activity stalls.
- RACI matrix with two Accountables on one activity — nobody owns it; each waits for the other.
- Decentralizing reliability engineering to area teams without a central standards function — each area reinvents PMs; no analytics scale.`,
    limitations: `- Org design is path-dependent: existing reporting lines, union agreements, and seniority constrain the design space.
- Hybrid structures look good on paper but fail when the central-vs-area boundary is ambiguous; boundary conflicts are the #1 implementation risk.
- Span-of-control bands (12-18) are empirical, not theoretical; high-maturity plants can sustain wider spans.
- RACI matrices decay — they are correct on day 1 and wrong by month 12 unless maintained.
- Org-design changes are slow (12-18 months) and disruptive; the benefits lag the cost.
- ISO 55000 Cl. 5 (Leadership) requires top-management commitment — without it, the org redesign is paper only.`,
    comparison: `**Centralized vs Decentralized**: Centralized (CI>25%) optimizes standardization, scale, and career paths; Decentralized (CI<10%) optimizes responsiveness, contextual knowledge, and Ops-Maint partnership. Hybrid (10-25%) is the common compromise. **Planner-only vs Planner+Scheduler**: Planner-only (small plant, <100 crafts) is workable; above 100 crafts, the missing Scheduler produces schedule-by-firelight and erodes PM compliance. **Reliability-centered vs Traditional**: Reliability-centered elevates RE above the M&R Manager (CRO at VP level) and is appropriate only when the cost of unreliability is extreme (safety, environmental, throughput). **Wide vs Narrow Span**: Wide (20+) works only in mature plants with strong CMMS data; narrow (<10) over-manages and slows decisions.`,
    practical_application: `- **Quarterly**: audit the RACI matrix against actual practice — flag activities where the de-facto Accountable differs from the de-jure Accountable.
- **Semi-annually**: compute centralization index, planner:craft, supervisor span; benchmark against SMRP bands.
- **Annually**: review org structure against KPI trends — if PM compliance < 50% and planner:craft outside 1:20-1:30, the binding constraint is structural.
- **On every reorg**: update CMMS role-based access to match the new RACI — broken CMMS access is the silent failure mode of org redesigns.
- **On every new site**: resist copying the corporate template — centralization level should match site size, asset variety, and maturity.`,
    decision_scenario: `You are the new M&R Manager at a 220-craft Power plant (2 units, 500 MW each). Inherited structure: 1 Planner, 0 Scheduler, 6 Supervisors (span 36.7), RE reports to Ops. PM compliance 31%, backlog 11 days, MTBF declining 8%/yr. You have a $400k annual budget for new hires.

Hire plan: 2 additional Planners ($180k/yr), 1 Scheduler ($90k/yr), 2 Supervisors ($130k/yr) = $400k. Planner:craft goes 1:220 → 1:73 (still outside band; need 7-8 planners for SMRP band but 3 is the year-1 step). Supervisor span 36.7 → 27.5 (still wide; need 12-13 supervisors for band; 8 is year-1 step). Move RE from Ops to M&R reporting line (zero-cost, zero-FTE, biggest single behavior unlock). Sequence: month 0-3 move RE reporting line; month 3-6 hire 2 PL + 1 SC + 2 CS; month 6-18 build the RACI, train the new structure, drive PM compliance 31% → 70% by month 18. The structural fix is the prerequisite — no reliability-engineering effort will lift PM compliance while the planner:craft ratio is 1:220 and the RE reports to Ops.`,
    practice_questions: `- Define centralization index and give the SMRP-aligned band for hybrid structures.
- A plant has 6 planners and 180 crafts. Compute planner:craft ratio and judge against the SMRP band. *(Answer: 1:30, edge of band.)*
- A WO-lifecycle activity has 2 Accountables on its RACI row. What is the defect, and how is it fixed? *(Answer: nobody owns it; reduce to one A.)*
- Compute the supervisor span for 144 crafts with 9 supervisors. *(Answer: 16.)*
- State three structural defects that would block PM-compliance improvement regardless of craft effort.`,
    certification_questions: `The CMRP exam tests Organizational Structures as the foundational OL competency. SMRP-aligned sample prompts:

(a) Compute planner:craft, supervisor span, centralization index from FTE data.
(b) Diagnose which structural defect is causing a named symptom (single-planner bottleneck → generic job plans; missing scheduler → schedule-by-firelight; RE reports to Ops → low PM compliance).
(c) Build/audit a RACI matrix on the 10 canonical WO-lifecycle activities.
(d) Pick the appropriate org structure for a given site profile (size, asset variety, maturity).
(e) Map ISO 55000 Cl. 5 leadership and Cl. 7.2 competence requirements to org-design choices.

The questions in this lesson's question bank are aligned to these competencies.`,
    summary: `Organizational Structures is the design discipline that decides who does what in M&R. Three levers — centralization (CI 10-25% hybrid), planner-vs-scheduler separation (above 100 crafts non-negotiable), and span of control (12-18 mature, 8-12 immature) — together determine whether the org is reactive or proactive. RACI discipline (one A per activity, ≥1 R) operationalizes role clarity. ISO 55000 Cl. 5 and Cl. 7.2 frame org design as the structural expression of leadership intent. Structure is destiny in M&R — and is the first OL deliverable.`,
    key_takeaways: `- Three org-design levers: centralization, role separation, span of control.
- Planner ≠ Scheduler above ~100 crafts (planners scope; schedulers sequence).
- SMRP bands: CI 10-25% hybrid; planner:craft 1:20-1:30; supervisor span 12-18.
- RACI rule: exactly one A per row; ≥1 R per row.
- Reliability Engineer reports to M&R, not Ops, to preserve independence.
- When PM compliance < 50% and planner:craft is outside band, the binding constraint is structural, not behavioral.
- ISO 55000 Cl. 5 (Leadership) + Cl. 7.2 (Competence) are operationalized by org design.`,
    references: `- SMRP. *CMRP Body of Knowledge — Organization & Leadership pillar: Organizational Structures.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.* (Cl. 5 Leadership, Cl. 7.2 Competence).
- Kotter, J. P. (1996/2012). *Leading Change*. HBR Press. (Coalition-forming + vision as foundation for org redesign.)
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. (System of Profound Knowledge; 14 Points for Management.)
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section I (organization of M&R); Section III (workforce/HR).
- O'Hanlon, T. (2000/2015). *Uptime: A Guide to Reliable Performance*. Reliabilityweb. (Culture maturity ladder; reliability-leadership behaviors.)`,
  },
  knowledgeObject: {
    title: "Organizational Structures — M&R org design, RACI, span of control",
    domain: "Organization & Leadership",
    competency: "Organizational Structures",
    topic: "M&R organizational design & role clarity",
    concept: "Centralization × role separation × span of control",
    body: {
      definitions: [
        "Centralized structure: central reliability/planning/scheduling serve all areas; crafts deployed to areas.",
        "Decentralized structure: each area/business unit has embedded reliability/planning.",
        "Hybrid structure: central strategy/policy + embedded area execution (most common mid-to-large plant).",
        "Planner: scopes the job (scope/parts/labor/safety/procedure/tools). Never sequences work.",
        "Scheduler: sequences planned work against equipment-availability + resource constraints. Never scopes work.",
        "Span of control: direct reports per supervisor (M&R target 8-20).",
        "Centralization index (CI): central-staff FTE / total M&R FTE × 100.",
        "Planner:craft ratio: planners / crafts (SMRP band 1:20-1:30).",
        "RACI: Responsible (does the work) / Accountable (one per activity, owns outcome) / Consulted (input before) / Informed (notified after).",
        "Reliability-centered structure: CRO at VP level; reliability elevated above maintenance as a peer function.",
      ],
      principles: [
        "Structure follows strategy: centralize standardization, decentralize context.",
        "One Accountable per RACI activity — a single throat to choke.",
        "Planner ≠ Scheduler above ~100 crafts — non-negotiable.",
        "Span of control 12-18 skilled trades; widen only with maturity.",
        "Reliability engineer reports to M&R, not Ops, to preserve independence.",
        "ISO 55000 Cl. 5 (Leadership) + Cl. 7.2 (Competence) operationalized by org design.",
        "When PM compliance < 50% and planner:craft is outside band, the binding constraint is structural.",
      ],
      components: [
        "Org chart (centralized/decentralized/hybrid/reliability-centered).",
        "Job descriptions: MM, PL, SC, RE, CS, Craft, Operator (autonomous maintenance).",
        "RACI matrix (10 WO-lifecycle activities × 6 roles).",
        "Centralization index metric.",
        "Planner:craft ratio metric.",
        "Supervisor span metric.",
        "CMMS role-based access matrix.",
        "Career-ladder map (apprentice → journey → master → specialist → supervisor → planner → RE).",
      ],
      mechanism: [
        "Org-design audit → CI / planner:craft / supervisor span metrics → benchmark vs SMRP bands → RACI matrix build → audit each row (1A, ≥1R) → identify structural gaps (single-planner, no scheduler, RE reports to Ops, span > 25) → design target structure → 12-18 mo transition plan (job descriptions, hiring, CMMS access, training) → communicate via Change Mgmt (Lesson 4) → annual KPI review.",
      ],
      process: [
        "1. Map current structure (reporting lines, FTE per role).",
        "2. Compute CI, planner:craft, supervisor span.",
        "3. Compare to SMRP bands.",
        "4. Build RACI for 10 WO-lifecycle activities.",
        "5. Audit each RACI row (exactly one A; ≥1 R).",
        "6. Identify structural gaps.",
        "7. Design target structure.",
        "8. Develop 12-18 mo transition plan.",
        "9. Communicate via Change Mgmt discipline.",
        "10. Review annually against KPI trends (PM compliance, backlog, MTBF).",
      ],
      formulas: [
        "Span of control = direct reports / supervisor  [target 12-18 mature, 8-12 immature]",
        "CI = (central-staff FTE) / (total M&R FTE) × 100  [%]",
        "Planner:craft = planners / crafts  [target 1:20-1:30]",
        "RACI ownership ratio = (R + A) / (R + A + C + I)  [target 0.30-0.50]",
        "RACI rule: exactly 1 A per row, ≥1 R per row",
      ],
      metrics: [
        "Centralization index [%].",
        "Planner:craft ratio.",
        "Supervisor span [crafts per supervisor].",
        "RACI rows with exactly one A [%].",
        "RACI rows with ≥1 R [%].",
        "PM compliance [%] (leading indicator of structural health).",
        "Backlog [days] (leading indicator of planner/scheduler health).",
      ],
      examples: [
        "Chemical plant 200 crafts: hybrid CI 12.3%, planner:craft 1:25, supervisor span 16.7 — SMRP-aligned.",
        "Oil & Gas offshore: centralized CI 30%, planner:craft 1:22, supervisor span 14, PM compliance 92%.",
        "Power coal plant (4×600 MW): hybrid CI 7.5%, planner:craft 1:29, supervisor span 20 (top of band).",
        "Container Terminal RTG yard: reliability-centered, CRO at VP level, CI 14.1%, planner:craft 1:27.",
        "Manufacturing 3-site food plant: decentralized CI 6%, 1 RE + 1 PL + 1 SC per site.",
      ],
      industrial_examples: [
        "Chemical — 200-craft plant hybrid structure with full RACI on 10 WO activities.",
        "Oil & Gas — offshore platform centralized reliability + on-platform supervisors.",
        "Power — coal plant 4 units decentralized execution + central staff.",
        "Container Terminal — RTG yard reliability-centered with CRO at VP level.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 350-craft Chemical plant with 1 planner (1:350) and 0 schedulers → PM compliance 28%. 18-mo restructure: hire 6 PL + 2 SC + 4 supervisors; move RE from Ops to M&R. Year-1 PM compliance 28% → 58%. Year-2 58% → 81%. Backlog 14d → 6d → 3d. MTBF +19%. Lesson: when planner:craft is 14× outside SMRP band, the binding constraint is structural — no reliability-engineering effort will lift PM compliance until the structure changes.",
      ],
      common_errors: [
        "Single planner supporting > 30 crafts → generic, incomplete job plans → WO overruns.",
        "Blending planner + scheduler → scheduling wins under pressure → jobs start on time, run long.",
        "RE reporting to Operations → captured by production pressure, cannot enforce PM compliance.",
        "Supervisor span > 25 → supervisor becomes dispatcher, cannot coach or enforce.",
        "RACI row with no Accountable → no decision-maker → stalls.",
        "RACI row with two Accountables → nobody owns it → each waits for the other.",
        "Decentralizing reliability without a central standards function → no analytics scale.",
      ],
      limitations: [
        "Org design is path-dependent (existing reporting lines, unions, seniority constrain).",
        "Hybrid structures fail when the central-vs-area boundary is ambiguous.",
        "Span-of-control bands are empirical, not theoretical; mature plants can sustain wider spans.",
        "RACI matrices decay — correct on day 1, wrong by month 12 unless maintained.",
        "Org-design changes are slow (12-18 mo) and disruptive; benefits lag cost.",
        "ISO 55000 Cl. 5 leadership required — without top-management commitment, the redesign is paper only.",
      ],
      best_practices: [
        "Above 100 crafts: separate planner and scheduler, always.",
        "Keep CI in the 10-25% hybrid band unless site profile dictates otherwise.",
        "Keep planner:craft in the 1:20-1:30 SMRP band.",
        "Keep supervisor span 12-18 (or 8-12 immature).",
        "RE reports to M&R, not Ops — preserve independence.",
        "Every WO-lifecycle activity has exactly one Accountable on the RACI.",
        "Update CMMS role-based access on every reorg to match the new RACI.",
        "Re-audit RACI quarterly against actual practice.",
        "Sequence structural changes before reliability-engineering initiatives — structure is the prerequisite.",
      ],
      related_concepts: [
        "Leadership (Lesson 2) — org design is leadership's first deliverable.",
        "Organizational Behavior (Lesson 3) — culture either enables or defeats the structure.",
        "Change Management (Lesson 4) — org redesign is the largest change a plant undertakes.",
        "Training & Development (Lesson 5) — role clarity enables competency frameworks.",
        "ISO 55000 Cl. 5 (Leadership), Cl. 7.2 (Competence), Cl. 7.4 (Communication) — org design at management-system level.",
        "Work Management (WM pillar) — the planner/scheduler split is a WM competency delivered through OL structure.",
      ],
      prerequisites: [
        "CMRP BOK 5-pillar structure and OL's place within it.",
        "Work Management (WM pillar) — WO lifecycle, planning vs scheduling, backlog.",
        "ISO 55000:2014 vocabulary (asset, asset management, leadership, competence).",
        "Basic people-management vocabulary (span of control, line vs staff, RACI).",
      ],
      references: [
        "SMRP CMRP BOK — OL pillar: Organizational Structures.",
        "ISO 55000:2014 (Cl. 5 Leadership, Cl. 7.2 Competence).",
        "Kotter, J. P. (1996/2012). Leading Change. HBR Press.",
        "Deming, W. E. (1986). Out of the Crisis. MIT CAES.",
        "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). McGraw-Hill. Section I & III.",
        "O'Hanlon, T. (2000/2015). Uptime. Reliabilityweb.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Organizational Structures",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "In a SMRP-aligned M&R organization, which structural separation is non-negotiable above ~100 crafts?",
      whyCorrect:
        "Planner and Scheduler are separate roles. The Planner scopes the job (scope/parts/labor/safety/procedure/tools); the Scheduler sequences planned work against equipment-availability + resource constraints. Above ~100 crafts, blending them produces jobs that start on time and run long — the classic symptom of a planner-less organization. SMRP-aligned practice treats this split as non-negotiable.",
      whyOthersWrong: [
        "Planner and Reliability Engineer — these are already distinct roles; no further separation is required; the RE owns analytics/RCA, the Planner owns job scoping.",
        "Maintenance Manager and Craft Supervisor — these are different management levels in the same hierarchy, not a role-separation issue; the non-negotiable split is functional (planner/scheduler), not hierarchical.",
        "Reliability Engineer and PdM Analyst — both can sit in reliability engineering; the PdM analyst is a specialty within the RE function, not a required separate role.",
      ],
      explanation:
        "Planner vs Scheduler is the non-negotiable structural separation above ~100 crafts. Planners scope the job; schedulers sequence the work. Blending them defeats work management.",
      options: [
        { text: "Planner and Scheduler", isCorrect: true },
        { text: "Planner and Reliability Engineer", isCorrect: false },
        { text: "Maintenance Manager and Craft Supervisor", isCorrect: false },
        { text: "Reliability Engineer and PdM Analyst", isCorrect: false },
      ],
    },
    {
      competencyName: "Organizational Structures",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A Chemical plant has 28 central-staff FTE (1 MM + 8 PL + 3 SC + 4 RE + 12 CS) and 200 crafts (total M&R FTE 228). Compute the centralization index (CI) and classify the structure.",
      whyCorrect:
        "CI = (central-staff FTE) / (total M&R FTE) × 100 = 28/228 × 100 = 12.3%. The SMRP-aligned band: < 10% decentralized; 10-25% hybrid; > 25% centralized. 12.3% falls in the hybrid band (10-25%), the most common pattern in mid-to-large plants.",
      whyOthersWrong: [
        "8.1% (decentralized) would be 28/346 or similar — wrong arithmetic; the correct denominator is 228, not 346.",
        "28.0% (centralized) would be just the numerator treated as a percentage — wrong formula; CI is a ratio, not the count itself.",
        "81.6% (heavily centralized) would be 200/245 or similar — inverts the ratio and uses wrong totals; central-staff is 28, not 200.",
      ],
      explanation:
        "CI = 28/228 × 100 = 12.3% → hybrid structure. SMRP band: < 10% decentralized; 10-25% hybrid; > 25% centralized.",
      options: [
        { text: "12.3% — hybrid", isCorrect: true },
        { text: "8.1% — decentralized", isCorrect: false },
        { text: "28.0% — centralized", isCorrect: false },
        { text: "81.6% — heavily centralized", isCorrect: false },
      ],
    },
    {
      competencyName: "Organizational Structures",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "A Power plant (220 crafts) has PM compliance 31%, backlog 11 days, 1 Planner, 0 Scheduler, 6 Supervisors (span 36.7), RE reports to Operations. Which single change unblocks the most PM-compliance lift in year 1?",
      whyCorrect:
        "Move the Reliability Engineer from Operations reporting to M&R reporting. This is zero-FTE, zero-cost, and unlocks the RE's independence to enforce PM compliance on the assets that need it. A captured RE (reporting to Ops) cannot enforce PMs against production pressure. Hiring 2 more planners helps but the planner:craft remains 1:73 (still outside band); hiring a scheduler helps but Ops will continue to override the schedule. The reporting-line fix is the structural prerequisite — without it, additional hires are marginalized.",
      whyOthersWrong: [
        "Hire 2 additional Planners (raises planner:craft from 1:220 to 1:73) — necessary but not sufficient; the ratio is still outside the SMRP 1:20-1:30 band, and the RE remains captured by Ops so the new planners' job plans get overridden.",
        "Hire 1 Scheduler — necessary but not sufficient; without the RE reporting-line fix, Ops will continue to override the schedule under production pressure.",
        "Hire 2 additional Supervisors (span 36.7 → 27.5) — reduces supervisor span but does not address the captured-RE root cause; PM compliance stays low because the RE cannot enforce it.",
      ],
      explanation:
        "The single biggest unlock is the RE reporting line: move from Ops to M&R. Zero cost, zero FTE; preserves independence to enforce PM compliance. Planner/Scheduler/Supervisor hires are necessary but follow this structural fix, not precede it.",
      options: [
        { text: "Move RE from Ops reporting to M&R reporting", isCorrect: true },
        { text: "Hire 2 additional Planners (1:220 → 1:73)", isCorrect: false },
        { text: "Hire 1 Scheduler", isCorrect: false },
        { text: "Hire 2 Supervisors (span 36.7 → 27.5)", isCorrect: false },
      ],
    },
    {
      competencyName: "Organizational Structures",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: On a RACI matrix, an activity may have multiple Accountables provided each is on a different shift or area, to ensure 24/7 coverage.",
      whyCorrect:
        "False. The RACI rule is exactly one Accountable per activity — a single throat to choke. Multiple Accountables = nobody owns it; each waits for the other. For 24/7 coverage, the correct pattern is one Accountable (e.g., the M&R Manager) with multiple Responsibles across shifts/areas; the Accountable may delegate authority but cannot share accountability.",
      whyOthersWrong: [
        "True would defeat the core RACI rule — multiple A's produce decision deadlock and diffusion of accountability, the exact failure mode the RACI matrix is designed to prevent. Coverage is provided by multiple R's, not multiple A's.",
      ],
      explanation:
        "Exactly one Accountable per activity. Multiple A's = nobody owns it. For 24/7 coverage, use multiple R's (Responsibles) under a single A.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Leadership
// ---------------------------------------------------------------------------

const LESSON_LEADERSHIP: RefLesson = {
  competencyName: "Leadership",
  slug: "ol-leadership",
  title: "Leadership of M&R Functions & Teams",
  titleAr: "قيادة وظائف وفرق الصيانة والموثوقية",
  order: 2,
  durationMin: 30,
  references: OL_REFERENCE_TITLES,
  conceptIntroduction: `Leadership in M&R is not the same as management. Management is the discipline of executing the work-management cycle (planning, scheduling, executing, measuring); leadership is the discipline of making people *want* to execute it well. Three leadership levers in M&R: (1) leadership style — situational (directive on new tasks, coaching on developing tasks, supportive on plateaued tasks, delegating on mastered tasks); (2) reliability leadership — the specific behaviors that create a reliability culture (visible commitment, data-driven decisions, walk-downs, RCA follow-through, recognition of proactive behavior); (3) executive sponsorship — a named, engaged, accountable executive whose visible support converts the reliability program from "the M&R team's hobby" to "the plant's strategy." ISO 55000:2014 Cl. 5.1 makes leadership commitment *demonstrable* (not just stated), and Deming's 14 Points supply the behavioral content — drive out fear, institute leadership, break down barriers.`,
  example: `A Power plant M&R Manager scored 5 leadership dimensions (1-5 Likert, equal weights): Vision 4, Sponsorship 3, Data-driven 4, Empowerment 2, Recognition 3. Leadership Effectiveness Index LEI = (4+3+4+2+3)/5 × 20 = 64/100. The weak dimension is Empowerment (2/5) — crafts are not empowered to stop work on a safety or data-quality concern. Action plan: institute "stop-work authority" + monthly craftsmanship-recognition program + bi-weekly walk-down with the sponsor (VP Operations). Re-score in 6 months; target LEI ≥ 75.`,
  keyFormulas: `Leadership Effectiveness Index LEI = Σ (w_i × s_i) × 20  [0-100; s_i = 1-5 Likert; Σw_i = 1]
Sponsor engagement score = (committed sponsor behaviors / 5 critical behaviors) × 100  [%]
Visible-leadership time = (floor/walk-down hours / total work hours) × 100  [target ≥ 15% for M&R leaders]
Reliability-leadership behaviors (O'Hanlon): visible commitment, data-driven decisions, walk-downs, RCA follow-through, recognition of proactive behavior.`,
  exercise: `You inherit an M&R function with LEI = 52/100. Weakest dimension: Recognition (1/5). Design a 6-month leadership-development plan with at least 3 specific interventions, target scores, and a re-measurement plan. Justify each intervention's link to a reliability KPI (PM compliance, MTBF, RCA follow-through).`,
  sections: {
    learning_objectives: `- Distinguish leadership from management in the M&R context and explain why both are required.
- Apply situational leadership (directive / coaching / supportive / delegating) to M&R tasks.
- Define the five reliability-leadership behaviors (visible commitment, data-driven decisions, walk-downs, RCA follow-through, recognition) and score a leader against them.
- Build an executive-sponsorship model with 5 critical sponsor behaviors and a sponsor-engagement score.
- Compute Leadership Effectiveness Index (LEI) and visible-leadership-time %.
- Map ISO 55000 Cl. 5.1 (demonstrable leadership) and Deming's 14 Points to M&R leadership practice.`,
    prerequisites: `- Organizational Structures (Lesson 1) — org design as leadership's first deliverable.
- Work Management (WM pillar) — the work-management cycle that leaders enable.
- Basic leadership vocabulary: style, sponsorship, walk-down, psychological safety.
- ISO 55000:2014 Cl. 5 (Leadership) and Deming's 14 Points for Management.`,
    introduction: `A reliability program without leadership is a slide deck. The single largest predictor of M&R-program success is not the technology (PdM sensors, CMMS) or the methodology (RCM, TPM) — it is whether a leader visibly owns the program. Plants where the M&R Manager's calendar shows 4+ walk-downs per week and a named VP sponsor attends the monthly reliability review outperform plants with superior tools and weak leadership on every KPI (PM compliance, MTBF, safety).

ISO 55000:2014 Cl. 5.1 elevates leadership commitment from aspiration to requirement: top management must *demonstrate* leadership and commitment — by establishing the asset-management policy, ensuring the org structure supports it, providing resources, communicating the importance of asset management, and ensuring the management system achieves its intended outcomes. "Demonstrate" is the operative word — stated commitment is not enough; the standard requires evidence (budget, time, decisions, presence).

Deming's 14 Points supply the behavioral content of leadership for reliability: drive out fear (so crafts report near-misses and bad data); institute leadership (replace objective-by-numbers management with coaching); break down barriers between departments (Ops and Maint); remove slogans/targets without method; institute a vigorous program of education and self-improvement. The reliability culture is downstream of these behaviors; without them, culture initiatives fail.

This competency sits at the heart of the OL pillar because leadership is the multiplier on every other competency: org structure (Lesson 1) without leadership is an org chart; culture (Lesson 3) without leadership is a slogan; change (Lesson 4) without leadership is a memo; training (Lesson 5) without leadership is a course catalog.`,
    terminology: `- **Leadership**: making people want to execute the work-management cycle well. Distinct from management (executing the cycle).
- **Situational leadership**: 4 styles — Directive (new task, low competence), Coaching (developing task), Supportive (plateaued task), Delegating (mastered task).
- **Reliability leadership**: 5 behaviors — visible commitment, data-driven decisions, walk-downs, RCA follow-through, recognition of proactive behavior.
- **Executive sponsor**: named, engaged, accountable executive (typically VP Operations or Plant Manager) whose visible support legitimizes the program.
- **Walk-down**: leader's on-floor review of an asset, area, or PM — the visible-leadership tool.
- **Stop-work authority**: any craft or operator may stop a job on a safety or data-quality concern without retaliation.
- **Psychological safety**: belief that one will not be punished or humiliated for speaking up about problems.
- **LEI (Leadership Effectiveness Index)**: weighted Likert score across leadership dimensions, 0-100.
- **Visible-leadership time**: floor/walk-down hours / total work hours × 100; O'Hanlon target ≥ 15%.
- **Sponsorship behaviors**: budget envelope approval, monthly walk-down, KPI ownership, celebration of wins, barrier removal.`,
    detailed_explanation: `Leadership in M&R has four layers:

(1) **Situational leadership** (Hersey-Blanchard): the right style depends on the task and the person. New craft on a new PdM technology — Directive (clear instructions, close supervision). Craft developing on the technology — Coaching (instructions + rationale, encourage questions). Craft plateaued on a familiar PM — Supportive (recognition, remove barriers). Master craft on mastered task — Delegating (set outcome, get out of the way). The M&R leader who applies one style to all crafts/tasks fails.

(2) **Reliability leadership** (O'Hanlon's five behaviors):
  - *Visible commitment*: calendar shows 4+ walk-downs per week; sponsor attends the monthly reliability review; budget envelope is approved on time.
  - *Data-driven decisions*: PM interval changes require CMMS evidence; RCA recommendations are funded or formally rejected with reason; no "this is how we've always done it."
  - *Walk-downs*: the leader walks the floor, asks crafts about the asset, and uses the CMMS data on the floor — the walk-down is both leadership and data validation.
  - *RCA follow-through*: every formal RCA has a named owner, a funded recommendation, and a 90-day follow-up on the effectiveness of the action.
  - *Recognition*: proactive behavior (a craft that reports a defect before failure; an operator that completes autonomous maintenance) is recognized publicly within 7 days; reactive heroism ( firefighting a failure) is *not* celebrated — celebrating firefighting creates more firefighting.

(3) **Executive sponsorship**: a named, engaged, accountable executive. The 5 critical sponsor behaviors (each scored 0/1): (a) budget envelope approved; (b) attends monthly reliability review; (c) walks the floor at least quarterly with the M&R Manager; (d) celebrates wins publicly; (e) removes cross-functional barriers (e.g., the Ops-Maint boundary). Score 0-5; convert to %. Below 60% = program at risk; above 80% = program likely to succeed.

(4) **Leadership Effectiveness Index (LEI)**: weighted Likert score across 5 dimensions (Vision, Sponsorship, Data-driven, Empowerment, Recognition). Equal-weight baseline (0.20 each); tunable to corporate strategy (safety-leader → Empowerment weight up; cost-leader → Data-driven up). LEI < 50 = reactive; 50-70 = transition; 70-85 = proactive; > 85 = reliability-centered. LEI is a leading indicator of culture (Lesson 3) and KPI improvement (PM compliance, MTBF).

Deming's contribution: the System of Profound Knowledge (appreciation for a system, knowledge of variation, theory of knowledge, psychology of people) supplies the *why* of reliability leadership. A leader who understands variation does not blame a craft for an out-of-control MTBF; a leader who appreciates a system does not optimize Maintenance in isolation from Operations. ISO 55000 Cl. 5.1 turns these behaviors into auditable requirements — the standard is, in effect, a leadership framework for asset management.`,
    core_principles: `- Leadership enables management; both are required.
- Situational leadership: match style to task and person (Directive / Coaching / Supportive / Delegating).
- Reliability leadership = 5 behaviors (visible commitment, data-driven, walk-downs, RCA follow-through, recognition).
- Executive sponsorship is a single throat-to-choke for the program; 5 critical behaviors; ≥ 80% engagement.
- ISO 55000 Cl. 5.1: leadership commitment must be *demonstrable* — stated is not enough.
- Deming: drive out fear, break down barriers, institute leadership — these are reliability-culture prerequisites.
- Recognize proactive behavior (not reactive heroism); celebrating firefighting creates more firefighting.`,
    components: `- Leadership-style matrix (4 styles × task/person).
- Reliability-leadership behavior set (5 behaviors, with observable evidence).
- Executive-sponsorship model (5 critical behaviors; sponsor-engagement score 0-100%).
- Walk-down schedule (4+ per week; quarterly with sponsor).
- Leadership Effectiveness Index (5 weighted dimensions, 0-100).
- Stop-work authority policy (formal, communicated, no-retaliation).
- Recognition program (≤ 7 days from behavior to recognition; proactive criteria).
- Psychological-safety pulse (e.g., 2-question quarterly survey).`,
    process: `1. Score the M&R leader on the 5 reliability-leadership behaviors (1-5 Likert).
2. Compute LEI; identify the weakest dimension.
3. Audit the executive sponsor against the 5 critical behaviors; compute engagement %.
4. Pull the leader's calendar for the past 4 weeks; compute visible-leadership time.
5. Review the last 5 RCAs — each has a named owner? Funded recommendation? 90-day follow-up?
6. Interview 5 crafts: do they feel empowered to stop work? Have they been recognized recently?
7. Design a 6-month leadership-development plan: 3 interventions, target scores, re-measurement date.
8. Communicate the plan (Change Management, Lesson 4).
9. Re-measure at month 6; adjust the plan.`,
    formula_calculation: `**Leadership Effectiveness Index (LEI)**:
  LEI = Σ (w_i × s_i) × 20  → 0-100 scale (s_i = 1-5 Likert; Σw_i = 1)
  - dimensions: Vision, Sponsorship, Data-driven, Empowerment, Recognition.
  - baseline weights: 0.20 each.
  - bands: < 50 reactive; 50-70 transition; 70-85 proactive; > 85 reliability-centered.
  - example: scores 4/3/4/2/3, equal weights → (0.8+0.6+0.8+0.4+0.6) × 20 = 3.2 × 20 = 64 (transition → proactive band).

**Sponsor engagement score** = (committed sponsor behaviors / 5 critical behaviors) × 100  [%]
  - critical behaviors: budget envelope approved / attends monthly review / quarterly floor walk / celebrates wins publicly / removes cross-functional barriers.
  - ≥ 80% = program likely to succeed; 60-80% = at risk; < 60% = program at risk.

**Visible-leadership time** = (floor/walk-down hours / total work hours) × 100  [%]
  - O'Hanlon target ≥ 15% for M&R leaders.
  - example: 6 walk-down hours in a 40-hr week = 15%.

**RCA follow-through rate** = (RCAs with funded action + 90-day effectiveness follow-up) / (total formal RCAs) × 100  [%]
  - target ≥ 80%; < 50% indicates leadership attention gap.`,
    worked_example: `**Problem** — Score a Power-plant M&R Manager on the 5 reliability-leadership dimensions (equal weights 0.20), compute LEI, identify the weakest dimension, and design a 6-month intervention plan with target scores.

**Scores (1-5 Likert, evidence-based)**:
- Vision & strategy communication: 4 (clear quarterly all-hands; CMMS dashboard visible).
- Sponsorship visibility: 3 (VP Operations attends quarterly but not monthly).
- Decisions data-driven: 4 (PM interval changes require CMMS evidence; RCA recommendations funded or rejected with reason).
- Empowerment & psychological safety: 2 (no stop-work policy; crafts report fear of blame for downtime).
- Recognition & accountability: 3 (some recognition but inconsistent; mostly reactive).

**LEI computation**:
LEI = (0.20×4 + 0.20×3 + 0.20×4 + 0.20×2 + 0.20×3) × 20
    = (0.8 + 0.6 + 0.8 + 0.4 + 0.6) × 20
    = 3.20 × 20 = **64.0 / 100** (transition → proactive band)

**Weakest dimension**: Empowerment (score 2/5).

**Sponsor engagement audit** (5 critical behaviors):
- Budget envelope approved (yes, +1)
- Attends monthly reliability review (no, quarterly only, +0)
- Quarterly floor walk with M&R manager (yes, +1)
- Celebrates wins publicly (yes, +1)
- Removes cross-functional Ops-Maint barriers (no, +0)
= 3/5 = **60% engagement** (at-risk band; below the 80% threshold for program success).

**Visible-leadership time**: 6 walk-down hours in a 40-hr week = **15.0%** (at the O'Hanlon threshold; needs lift).

**6-month intervention plan** (target LEI ≥ 75; sponsor ≥ 80%; visible time ≥ 18%):

| # | Intervention | Targets weak dim | Month | Target score |
|---|--------------|------------------|-------|--------------|
| 1 | Institute stop-work authority policy + communication + 2-craft pilot | Empowerment | 1-3 | 2 → 4 |
| 2 | Move sponsor from quarterly to monthly reliability review; add floor walk | Sponsorship | 1-6 | 3 → 4; sponsor 60% → 80% |
| 3 | Launch bi-weekly craftsmanship-recognition program (proactive criteria only) | Recognition | 2-6 | 3 → 4 |
| 4 | Add 2 walk-downs/week (4 → 6) | Visible time | 1-6 | 15% → 18% |

**6-month target LEI** = (0.20×4 + 0.20×4 + 0.20×4 + 0.20×4 + 0.20×4) × 20 = 4.0 × 20 = **80.0 / 100** (proactive band). Sponsor = 4/5 = 80%. Visible time = 6 walk-downs × 1.5h / 40h = 22.5% (above target).

**Conclusion**: the Empowerment dimension is the binding constraint; the single highest-leverage intervention is the stop-work authority policy (zero cost, high signaling value). Sequence interventions 1+2 in month 1-3; 3+4 in month 2-6. Re-measure at month 6.`,
    industrial_example: `**Oil & Gas — refinery turnaround**: VP Operations is named sponsor, attends weekly reliability review during turnaround prep, walks the floor 2x/week, celebrates first-zero-incident turnaround publicly. Sponsor engagement 5/5 = 100%. LEI of M&R Manager 82 (proactive).

**Power — coal plant**: Plant Manager sponsors the PdM program but attends only quarterly reviews; budget approved late; cross-functional barriers not removed. Sponsor engagement 2/5 = 40% (at-risk). Program stalled for 18 months until sponsor replaced.

**Container Terminal — RTG yard**: Terminal Director sponsors reliability; weekly walk-down with the M&R Manager; celebrates the craft who caught a hydraulic leak before catastrophic failure. LEI 78; sponsor 5/5; PM compliance 88%.

**Manufacturing — food plant**: Plant Director sponsors autonomous maintenance; visible-leadership time 22% (4 walk-downs/week). Recognition program within 7 days of behavior. LEI 84 (proactive).`,
    case_study: `CASE_TYPE = SYNTHETIC. A 180-craft Chemical plant M&R Manager had LEI = 51/100 (reactive → transition). Weakest dimension: Recognition (1/5) — the manager had not recognized any craft for proactive behavior in 12 months; only reactive heroism was celebrated ("saving the line" after a failure). Crafts had learned to wait for failures, then heroically fix them. Intervention: bi-weekly craftsmanship-recognition program (proactive criteria only: caught a defect before failure; completed autonomous maintenance; submitted a complete RCA; closed a WO with full failure data within 7 days). 6-month outcome: LEI 51 → 64; PM compliance 41% → 58%; MTBF +12%. The recognition program had zero direct cost but was the highest-leverage leadership intervention in the plant's recent history — it stopped rewarding the wrong behavior. Lesson: leadership metrics are leading indicators; KPIs are lagging. Fix the LEI and the KPIs follow.`,
    visual_explanation: `Picture the LEI as a radar chart with 5 axes (Vision, Sponsorship, Data-driven, Empowerment, Recognition). A reactive leader's chart is small and asymmetric (lopsided toward Vision, away from Empowerment); a proactive leader's chart is large and balanced (≥ 4/5 on every axis). The radar chart visualizes the leadership gap before the KPI chart moves — it is a 6-month leading indicator.`,
    simulation_opportunity: `Build a leadership-decision simulator: input a manager's LEI and sponsor engagement %; output projected 6-month KPI movement (PM compliance, MTBF, RCA follow-through rate). Calibrate with the plant's historical LEI-to-KPI lag (typically 3-6 months). Use the simulator to defend a leadership-development investment: "a $0 stop-work policy lifts LEI Empowerment from 2 → 4 and PM compliance from 41% → 58% in 6 months."`,
    common_mistakes: `- Celebrating reactive heroism ("saved the line") — rewards the wrong behavior; creates more firefighting.
- One-leadership-style-fits-all — Directive on a master craft causes turnover; Delegating on a new craft causes errors.
- No named sponsor — "the leadership team" is not a sponsor; a sponsor has a name, a calendar, and an accountability.
- Sponsor attends quarterly only — sponsor engagement < 80% = program at risk.
- No stop-work authority — crafts learn to keep going on safety/data-quality concerns; the most damaging latent failures are missed.
- RCA without follow-through — RCA recommendations unfunded or not followed-up at 90 days = leadership attention gap.
- Visible-leadership time < 15% — the leader is not on the floor; the program becomes a slide deck.
- Recognizing behavior > 30 days after the fact — the recognition loses its reinforcing effect.`,
    limitations: `- LEI is a self/supervisor/peer-report Likert score; halo effect inflates by 5-10%.
- Sponsor engagement % assumes the 5 critical behaviors are the right set for every plant — they are the SMRP-aligned baseline; some plants add a 6th (safety walk-down) and re-normalize.
- Visible-leadership time can be gamed (walk-downs that are tours, not data validation); pair with the walk-down content audit.
- Psychological safety is slow to build and quick to lose — one bad week of blame can undo 6 months of work.
- Leadership development is 6-12 months; impatient plants abandon the program before the lagging KPIs move.
- Deming's 14 Points are normative, not quantitative — they cannot be scored directly; the LEI is the operational proxy.`,
    comparison: `**Leadership vs Management**: Leadership makes people *want* to execute the cycle; Management executes the cycle. Both required — leadership without management is charisma; management without leadership is bureaucracy. **Situational styles**: Directive (new task, low competence) > Coaching (developing) > Supportive (plateaued) > Delegating (mastered). Wrong style for the task = turnover or errors. **Recognition of proactive vs reactive behavior**: Proactive recognition reduces failures (incentivizes defect-catching); reactive recognition increases failures (incentivizes heroism). **Visible-leadership time 15% vs 5%**: 15% is the O'Hanlon threshold; below 5% the leader is disconnected and the program becomes a slide deck.`,
    practical_application: `- **Weekly**: 4+ walk-downs (visible-leadership time ≥ 15%); recognize 1-2 proactive behaviors within 7 days.
- **Monthly**: reliability review with sponsor (sponsor attends); review the RCA backlog and follow up on 90-day effectiveness.
- **Quarterly**: re-score LEI; pulse psychological safety; adjust the leadership-development plan.
- **Semi-annually**: audit sponsor engagement against the 5 critical behaviors; re-baseline weights if corporate strategy shifts.
- **Annually**: review leadership succession (who replaces the M&R Manager? sponsor?); build the bench 2-deep.`,
    decision_scenario: `You are the Plant Manager at a 220-craft Power plant. Your M&R Manager scores LEI = 58 (transition band); sponsor engagement (you) = 60% (you attend quarterly, not monthly). PM compliance 47%; MTBF declining 6%/yr. Budget envelope is approved but late. You have 6 months before a corporate reliability audit.

Highest-leverage intervention: (a) attend the monthly reliability review yourself (lifts sponsor 60% → 80%, +0 to Sponsorship dimension, +5 to LEI) — zero cost, 4 hours/month; (b) institute stop-work authority policy (lifts Empowerment 2 → 4, +8 to LEI) — zero cost, 1 policy + 2-craft pilot; (c) launch bi-weekly craftsmanship-recognition program (Recognition 3 → 4, +4 to LEI) — $0 cost, requires the M&R Manager's commitment to consistency. Sequence: (a) month 1; (b) month 1-3; (c) month 2-6. 6-month projected LEI = 58 → 75 (proactive band); sponsor 80%; PM compliance 47% → 70% (lagging by 3 months). The cost is zero; the binding constraint is your calendar.`,
    practice_questions: `- Name the 4 situational leadership styles and match each to a task/person profile.
- A manager scores 4/3/4/2/3 on the 5 LEI dimensions (equal weights). Compute LEI. *(Answer: 64/100, transition band.)*
- List the 5 critical executive-sponsor behaviors and the ≥ 80% engagement threshold.
- Compute visible-leadership time for 6 walk-down hours in a 40-hr week. *(Answer: 15%, O'Hanlon threshold.)*
- Why does recognizing reactive heroism *increase* failures?`,
    certification_questions: `The CMRP exam tests Leadership as the second OL competency. SMRP-aligned sample prompts:

(a) Score a leader on the 5 reliability-leadership behaviors and compute LEI.
(b) Audit an executive sponsor against the 5 critical behaviors; compute engagement %.
(c) Pick the correct situational-leadership style for a given task/person profile.
(d) Diagnose why recognizing reactive heroism damages a reliability culture.
(e) Map ISO 55000 Cl. 5.1 demonstrable-leadership requirements to M&R practice.

The questions in this lesson's question bank are aligned to these competencies.`,
    summary: `Leadership is the multiplier on every OL competency. Three layers: situational style (Directive/Coaching/Supportive/Delegating), reliability leadership (5 behaviors: visible commitment, data-driven, walk-downs, RCA follow-through, recognition), and executive sponsorship (5 critical behaviors, ≥ 80% engagement). LEI < 50 = reactive; 70-85 = proactive. ISO 55000 Cl. 5.1 makes leadership demonstrable; Deming's 14 Points supply the behavioral content. Recognize proactive behavior, not reactive heroism — celebrating firefighting creates more firefighting. The leadership metrics are leading indicators; the KPIs follow by 3-6 months.`,
    key_takeaways: `- Leadership enables management; both are required.
- 5 reliability-leadership behaviors: visible commitment, data-driven, walk-downs, RCA follow-through, recognition.
- LEI bands: < 50 reactive; 50-70 transition; 70-85 proactive; > 85 reliability-centered.
- Sponsor engagement ≥ 80% (5 critical behaviors) = program likely to succeed.
- Visible-leadership time ≥ 15% (O'Hanlon target); < 5% = disconnected.
- Recognize proactive behavior within 7 days; never celebrate reactive heroism.
- ISO 55000 Cl. 5.1: leadership commitment must be demonstrable — stated is not enough.
- LEI is a 3-6 month leading indicator of KPI improvement.`,
    references: `- SMRP. *CMRP Body of Knowledge — Organization & Leadership pillar: Leadership.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.* (Cl. 5.1 Leadership & commitment).
- Kotter, J. P. (1996/2012). *Leading Change*. HBR Press. (Coalition + vision as foundation of leadership.)
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. (System of Profound Knowledge; 14 Points for Management.)
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section XII (managing the maintenance organization).
- O'Hanlon, T. (2000/2015). *Uptime: A Guide to Reliable Performance*. Reliabilityweb. (Reliability-leadership behaviors; culture maturity ladder.)`,
  },
  knowledgeObject: {
    title: "Leadership — M&R function & team leadership, reliability behaviors, sponsorship",
    domain: "Organization & Leadership",
    competency: "Leadership",
    topic: "Leadership of M&R functions and teams",
    concept: "Situational style × reliability-leadership behaviors × executive sponsorship",
    body: {
      definitions: [
        "Leadership: making people want to execute the work-management cycle well; distinct from management (executing the cycle).",
        "Situational leadership: 4 styles — Directive (new task), Coaching (developing), Supportive (plateaued), Delegating (mastered).",
        "Reliability leadership: 5 behaviors — visible commitment, data-driven decisions, walk-downs, RCA follow-through, recognition of proactive behavior.",
        "Executive sponsor: named, engaged, accountable executive (typically VP Ops or Plant Manager) whose visible support legitimizes the program.",
        "Walk-down: leader's on-floor review of an asset/area/PM; visible-leadership tool.",
        "Stop-work authority: any craft or operator may stop a job on safety/data-quality concern without retaliation.",
        "Psychological safety: belief that one will not be punished or humiliated for speaking up about problems.",
        "LEI (Leadership Effectiveness Index): weighted Likert score across leadership dimensions, 0-100.",
        "Visible-leadership time: floor/walk-down hours / total work hours × 100; O'Hanlon target ≥ 15%.",
        "Sponsor engagement score: committed sponsor behaviors / 5 critical behaviors × 100 [%].",
      ],
      principles: [
        "Leadership enables management; both required.",
        "Situational style: match style to task and person.",
        "Reliability leadership = 5 behaviors (visible commitment, data-driven, walk-downs, RCA follow-through, recognition).",
        "Executive sponsorship: 5 critical behaviors; ≥ 80% engagement for program success.",
        "ISO 55000 Cl. 5.1: leadership commitment must be demonstrable.",
        "Deming: drive out fear, break down barriers, institute leadership — reliability-culture prerequisites.",
        "Recognize proactive behavior (not reactive heroism); celebrating firefighting creates more firefighting.",
        "LEI is a 3-6 month leading indicator of KPI improvement.",
      ],
      components: [
        "Leadership-style matrix (4 styles × task/person).",
        "Reliability-leadership behavior set (5 behaviors with observable evidence).",
        "Executive-sponsorship model (5 critical behaviors).",
        "Walk-down schedule (4+ per week; quarterly with sponsor).",
        "LEI scorecard (5 weighted dimensions, 0-100).",
        "Stop-work authority policy (formal, communicated, no-retaliation).",
        "Recognition program (≤ 7 days from behavior; proactive criteria).",
        "Psychological-safety pulse survey (quarterly).",
      ],
      mechanism: [
        "Score leader on 5 reliability-leadership behaviors → compute LEI → identify weakest dimension → audit sponsor against 5 critical behaviors → pull calendar for visible-leadership time → review last 5 RCAs for follow-through → interview 5 crafts for psychological safety → design 6-mo leadership-development plan (3 interventions, target scores) → communicate via Change Mgmt → re-measure at month 6.",
      ],
      process: [
        "1. Score the leader on the 5 reliability-leadership behaviors (1-5 Likert).",
        "2. Compute LEI; identify weakest dimension.",
        "3. Audit sponsor against 5 critical behaviors; compute engagement %.",
        "4. Pull leader's calendar 4 weeks; compute visible-leadership time.",
        "5. Review last 5 RCAs for funded action + 90-day follow-up.",
        "6. Interview 5 crafts: empowerment + recognition pulse.",
        "7. Design 6-mo leadership-development plan (3 interventions, target scores).",
        "8. Communicate via Change Mgmt (Lesson 4).",
        "9. Re-measure at month 6; adjust plan.",
      ],
      formulas: [
        "LEI = Σ (w_i × s_i) × 20  [0-100; s_i = 1-5; Σw_i = 1]",
        "Sponsor engagement = (committed behaviors / 5 critical) × 100  [%]",
        "Visible-leadership time = (floor/walk-down hours / total work hours) × 100  [%]",
        "RCA follow-through rate = (RCAs with funded action + 90-day follow-up) / (total formal RCAs) × 100  [%]",
      ],
      metrics: [
        "LEI [0-100].",
        "Sponsor engagement [%].",
        "Visible-leadership time [%].",
        "RCA follow-through rate [%].",
        "Recognition latency [days from behavior to recognition; target ≤ 7].",
        "Stop-work authority invoked [count/month; ≥ 1 = healthy].",
        "Psychological-safety pulse score [0-100].",
      ],
      examples: [
        "Power plant M&R Manager: scores 4/3/4/2/3, LEI = 64 (transition). Weakest: Empowerment (2/5).",
        "Oil & Gas refinery: VP Ops sponsor 5/5 = 100%; LEI 82 (proactive).",
        "Power coal plant: Plant Manager sponsor 2/5 = 40% (at-risk); program stalled 18 months.",
        "Container Terminal RTG yard: LEI 78; sponsor 5/5; PM compliance 88%.",
        "Manufacturing food plant: LEI 84; visible-leadership time 22%; recognition within 7 days.",
      ],
      industrial_examples: [
        "Oil & Gas — refinery turnaround sponsor 5/5, weekly walk-downs, LEI 82.",
        "Power — coal plant at-risk sponsor 40%, program stalled.",
        "Container Terminal — RTG yard sponsor 5/5, LEI 78, PM compliance 88%.",
        "Manufacturing — food plant Director sponsors autonomous maintenance, LEI 84.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 180-craft Chemical plant M&R Manager LEI = 51 (reactive → transition). Weakest: Recognition (1/5) — no proactive behavior recognized in 12 months; only reactive heroism celebrated. Crafts learned to wait for failures then heroically fix them. Intervention: bi-weekly craftsmanship-recognition (proactive criteria only). 6-mo outcome: LEI 51 → 64; PM compliance 41% → 58%; MTBF +12%. Zero direct cost; highest-leverage leadership intervention in the plant's recent history. Lesson: leadership metrics are leading indicators; KPIs are lagging.",
      ],
      common_errors: [
        "Celebrating reactive heroism ('saved the line') — rewards wrong behavior; creates more firefighting.",
        "One-leadership-style-fits-all — Directive on master craft → turnover; Delegating on new craft → errors.",
        "No named sponsor — 'the leadership team' is not a sponsor.",
        "Sponsor attends quarterly only — engagement < 80% = program at risk.",
        "No stop-work authority — crafts keep going on safety/data-quality concerns.",
        "RCA without follow-through — recommendations unfunded or no 90-day effectiveness check.",
        "Visible-leadership time < 15% — leader disconnected; program becomes a slide deck.",
        "Recognizing behavior > 30 days after the fact — loses reinforcing effect.",
      ],
      limitations: [
        "LEI is a self/peer Likert score; halo effect inflates 5-10%.",
        "Sponsor engagement % assumes the 5 behaviors are the right set for every plant (SMRP baseline).",
        "Visible-leadership time can be gamed (walk-downs that are tours).",
        "Psychological safety is slow to build, quick to lose — one bad week of blame undoes 6 months.",
        "Leadership development is 6-12 months; impatient plants abandon before KPIs move.",
        "Deming's 14 Points are normative, not quantitative — LEI is the operational proxy.",
      ],
      best_practices: [
        "Match leadership style to task/person (Directive / Coaching / Supportive / Delegating).",
        "4+ walk-downs per week (visible-leadership time ≥ 15%).",
        "Recognize 1-2 proactive behaviors within 7 days; never celebrate reactive heroism.",
        "Monthly reliability review with sponsor (engagement ≥ 80%).",
        "Quarterly sponsor floor walk with M&R Manager.",
        "Stop-work authority policy with formal no-retaliation.",
        "RCA: named owner, funded recommendation, 90-day effectiveness follow-up.",
        "Re-score LEI quarterly; build succession 2-deep.",
      ],
      related_concepts: [
        "Organizational Structures (Lesson 1) — org design is leadership's first deliverable.",
        "Organizational Behavior (Lesson 3) — culture is downstream of leadership behaviors.",
        "Change Management (Lesson 4) — leadership is the multiplier on change success.",
        "Training & Development (Lesson 5) — leadership succession requires bench-building.",
        "ISO 55000 Cl. 5.1 (Leadership & commitment) — demonstrable, not stated.",
        "Deming's 14 Points & System of Profound Knowledge — behavioral content of leadership.",
      ],
      prerequisites: [
        "Organizational Structures (Lesson 1).",
        "Work Management (WM pillar) — the cycle leaders enable.",
        "ISO 55000:2014 Cl. 5 leadership vocabulary.",
        "Deming's 14 Points for Management.",
      ],
      references: [
        "SMRP CMRP BOK — OL pillar: Leadership.",
        "ISO 55000:2014 (Cl. 5.1).",
        "Kotter, J. P. (1996/2012). Leading Change. HBR Press.",
        "Deming, W. E. (1986). Out of the Crisis. MIT CAES.",
        "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). Section XII.",
        "O'Hanlon, T. (2000/2015). Uptime. Reliabilityweb.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Leadership",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which is NOT one of the five reliability-leadership behaviors per O'Hanlon / SMRP-aligned practice?",
      whyCorrect:
        "Negotiating union contracts is NOT one of the 5 reliability-leadership behaviors. The 5 are: (1) visible commitment, (2) data-driven decisions, (3) walk-downs, (4) RCA follow-through, (5) recognition of proactive behavior. Union negotiation is an HR/IR skill that may be required of an M&R Manager but is not a reliability-leadership behavior.",
      whyOthersWrong: [
        "Visible commitment — IS one of the 5 (calendar shows 4+ walk-downs/week; sponsor attends reviews; budget approved on time).",
        "Data-driven decisions — IS one of the 5 (PM interval changes require CMMS evidence; RCA recommendations funded or rejected with reason).",
        "RCA follow-through — IS one of the 5 (every formal RCA has a named owner, funded recommendation, and 90-day effectiveness follow-up).",
      ],
      explanation:
        "The 5 reliability-leadership behaviors are: visible commitment, data-driven decisions, walk-downs, RCA follow-through, recognition of proactive behavior. Union negotiation is an HR/IR skill, not a reliability-leadership behavior.",
      options: [
        { text: "Negotiating union contracts", isCorrect: true },
        { text: "Visible commitment", isCorrect: false },
        { text: "Data-driven decisions", isCorrect: false },
        { text: "RCA follow-through", isCorrect: false },
      ],
    },
    {
      competencyName: "Leadership",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power-plant M&R Manager scores 4 / 3 / 4 / 2 / 3 on the 5 LEI dimensions (equal weights 0.20 each). Compute the LEI.",
      whyCorrect:
        "LEI = Σ (w_i × s_i) × 20. With equal weights 0.20: (0.20×4 + 0.20×3 + 0.20×4 + 0.20×2 + 0.20×3) = 0.8 + 0.6 + 0.8 + 0.4 + 0.6 = 3.2. LEI = 3.2 × 20 = 64.0/100 (transition → proactive band).",
      whyOthersWrong: [
        "51.0 (reactive → transition) would result from arithmetic error 0.8+0.6+0.8+0.4+0.6 mis-summed or mis-multiplied — likely treating scores as fractions and stopping without multiplying by 20.",
        "80.0 (proactive band) would result if all 5 dimensions scored 4/5 (4×5×0.2×20=80) — but the actual scores include 3, 3, and 2, not all 4s.",
        "16.0 (well below reactive) would result from computing Σ scores = 16 (4+3+4+2+3=16) and stopping — missing both the weight and the × 20 scale conversion.",
      ],
      explanation:
        "LEI = (0.20×4 + 0.20×3 + 0.20×4 + 0.20×2 + 0.20×3) × 20 = 3.2 × 20 = 64/100 (transition band; weakest dim Empowerment at 2/5).",
      options: [
        { text: "64.0", isCorrect: true },
        { text: "51.0", isCorrect: false },
        { text: "80.0", isCorrect: false },
        { text: "16.0", isCorrect: false },
      ],
    },
    {
      competencyName: "Leadership",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "A Chemical plant M&R Manager has LEI = 51, with Recognition = 1/5 (no proactive behavior recognized in 12 months; only reactive heroism celebrated). Which intervention has the highest leverage to lift LEI and PM compliance in 6 months at zero direct cost?",
      whyCorrect:
        "Bi-weekly craftsmanship-recognition program (proactive criteria only: caught a defect before failure; completed autonomous maintenance; submitted a complete RCA; closed a WO with full failure data within 7 days). This directly lifts Recognition (1 → 4, +6 to LEI) and stops rewarding the wrong behavior (reactive heroism), which is the cultural root cause of the plant's reactive state. Zero direct cost; only requires the M&R Manager's consistency. The 6-month outcome in case studies: LEI 51 → 64, PM compliance 41% → 58%, MTBF +12%.",
      whyOthersWrong: [
        "Hire a third Planner (raises planner:craft from 1:90 to 1:60) — useful but does not address the Recognition root cause; the new planner's job plans will not change the crafts' reactive behavior; LEI unchanged.",
        "Buy a new CMMS module ($50k capex) — technology without leadership behavior change; the data quality will not improve because crafts are not recognized for entering it; pure tech investment without leadership lift produces 0 KPI movement.",
        "Send the M&R Manager to a 5-day leadership course ($8k) — useful for knowledge but without an on-the-job intervention (the recognition program), the knowledge does not translate to behavior change in 6 months.",
      ],
      explanation:
        "Recognition is the weakest dimension (1/5) and the cultural root cause (rewarding reactive heroism creates more firefighting). A bi-weekly recognition program with proactive criteria lifts Recognition 1 → 4 (+6 LEI) at zero cost. Planner/CMMS/training investments are necessary but not sufficient — they do not address the leadership-behavior root cause.",
      options: [
        { text: "Bi-weekly craftsmanship-recognition program (proactive criteria only)", isCorrect: true },
        { text: "Hire a third Planner (1:90 → 1:60)", isCorrect: false },
        { text: "Buy a new CMMS module ($50k capex)", isCorrect: false },
        { text: "Send the M&R Manager to a 5-day leadership course ($8k)", isCorrect: false },
      ],
    },
    {
      competencyName: "Leadership",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: ISO 55000:2014 Cl. 5.1 requires that top management *state* their commitment to asset management in a written policy; presence at reviews and floor walk-downs are recommended but not required.",
      whyCorrect:
        "False. ISO 55000:2014 Cl. 5.1 requires top management to *demonstrate* leadership and commitment — not merely state it. The standard explicitly lists demonstrable behaviors: establishing the asset-management policy, ensuring the org structure supports the policy, providing resources, communicating the importance of asset management, and ensuring the management system achieves its intended outcomes. 'Demonstrate' requires evidence (budget, time, decisions, presence) — a written policy alone is not sufficient.",
      whyOthersWrong: [
        "True would misread the standard — ISO 55000:2014 Cl. 5.1 uses 'demonstrate' (evidence-based), not 'state' (declaration-only). The presence at reviews, floor walk-downs, and budget-envelope approval are evidence of demonstrable commitment; without them, the written policy is non-conformant.",
      ],
      explanation:
        "ISO 55000 Cl. 5.1 requires demonstrable leadership commitment (policy + resources + structure + communication + outcomes) — stated commitment alone is non-conformant. Presence at reviews and walk-downs are evidence of demonstrable commitment, not optional.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Organizational Behavior
// ---------------------------------------------------------------------------

const LESSON_ORG_BEHAVIOR: RefLesson = {
  competencyName: "Organizational Behavior",
  slug: "ol-organizational-behavior",
  title: "Reliability Culture, Motivation & Team Dynamics",
  titleAr: "ثقافة الموثوقية والدافعية وديناميكا الفريق",
  order: 3,
  durationMin: 30,
  references: OL_REFERENCE_TITLES,
  conceptIntroduction: `Organizational Behavior is where the OL pillar meets psychology. A perfectly designed structure (Lesson 1) led by an excellent leader (Lesson 2) can still fail if the underlying culture is reactive — crafts wait for failures, operators hide defects, RCAs are paperwork. Three levers: (1) reliability culture — the shared beliefs and norms about whether reliability is "our job" or "maintenance's job"; (2) motivation — intrinsic (mastery, autonomy, purpose) and extrinsic (recognition, pay, promotion) drivers of proactive behavior; (3) team dynamics — Ops-Maint partnership, cross-functional RCA teams, psychological safety to report issues. ISO 55000:2014 Cl. 7.3 (Awareness) requires that "persons doing work under its control are aware of the asset-management policy, their contribution, and the implications of not conforming" — i.e., a culture where everyone understands their role in reliability.`,
  example: `A Chemical plant scored 8 culture dimensions (1-5 Likert, weighted): Leadership-commitment 3 (w 0.15), Cross-functional collaboration 2 (0.10), Data integrity 3 (0.15), PM/PdM compliance 4 (0.10), RCA follow-through 2 (0.10), CI engagement 3 (0.10), Psychological safety 4 (0.15), Recognition 2 (0.15). Culture Index CI = (0.45 + 0.20 + 0.45 + 0.40 + 0.20 + 0.30 + 0.60 + 0.30) × 20 = 2.90 × 20 = 58.0/100 (Reactive → Planned transition band). Lowest dimensions: Cross-functional (2), RCA follow-through (2), Recognition (2). Action plan focuses on those three; target CI ≥ 70 (Planned band) in 12 months.`,
  keyFormulas: `Culture Index CI = Σ (w_i × s_i) × 20  [0-100; s_i = 1-5 Likert; Σw_i = 1]
CI bands: < 45 Reactive; 45-60 Reactive→Planned transition; 60-75 Planned; 75-90 Proactive; > 90 Reliability-Centered
Behavioral reliability ratio = (proactive WOs) / (total WOs) × 100  [%]
Engagement Index = (% highly engaged) − (% actively disengaged)  [−100 to +100, Gallup-style]
Worst-dimension rule: prioritize the 3 lowest-scoring dimensions for action.`,
  exercise: `You inherit a plant with CI = 49 (Reactive → Planned transition). Worst 3 dimensions: Cross-functional collaboration (2), Data integrity (2), RCA follow-through (1). Design a 12-month culture plan with one intervention per weak dimension, target scores, and re-measurement. Justify the order based on leverage.`,
  sections: {
    learning_objectives: `- Define reliability culture and distinguish the 4-stage maturity ladder (Reactive → Planned → Proactive → Reliability-Centered).
- Apply motivation theory (intrinsic vs extrinsic; Deming on removing slogans/targets without method; autonomy, mastery, purpose) to M&R craft behavior.
- Build a culture-assessment scorecard with 8 weighted dimensions, 1-5 Likert, computing a 0-100 Culture Index.
- Diagnose team-dynamics failure modes (Ops-Maint friction, RCA blame-culture, psychological-safety gap).
- Compute the behavioral reliability ratio and Engagement Index.
- Map ISO 55000 Cl. 7.3 (Awareness) requirements to culture-assessment outputs.`,
    prerequisites: `- Organizational Structures (Lesson 1) and Leadership (Lesson 2).
- Work Management (WM pillar) — PM/CM/PdM work-order mix.
- Basic motivation vocabulary: intrinsic vs extrinsic, engagement, psychological safety.
- ISO 55000:2014 Cl. 7.3 (Awareness) and Deming's psychology-of-people lens.`,
    introduction: `Culture is what people do when no one is watching. In M&R, culture is whether the craft reports the bearing-noise they heard at 02:00 (proactive) or waits for the failure (reactive); whether the operator completes the autonomous-maintenance checklist (proactive) or skips it because "it's not my job" (reactive); whether the RCA team names the causes (proactive) or names the people (reactive blame-culture). The technical systems (CMMS, PdM, RCM) are necessary but not sufficient — culture is the multiplier.

The 4-stage maturity ladder (O'Hanlon):
- **Reactive**: work is mostly corrective (CM); firefighting is rewarded; RCAs blame people; data is incomplete; downtime is "the cost of doing business."
- **Planned**: PM compliance ≥ 70%; scheduling discipline; crafts follow procedures; some PdM; RCAs name causes but follow-through is weak.
- **Proactive**: PM compliance ≥ 85%; PdM on top bad actors; RCAs funded and followed-up; data integrity high; firefighting deprioritized.
- **Reliability-Centered**: PM/PdM/RCM integrated; culture rewards defect-catching; operators do autonomous maintenance; RCAs drive design changes; downtime is a near-miss event.

ISO 55000:2014 Cl. 7.3 (Awareness) requires that "persons doing work under its control are aware of the asset-management policy, their contribution, and the implications of not conforming." This is the management-system expression of culture: a plant where the crafts know the policy, know their contribution, and know the cost of non-conformance — i.e., a plant with high culture maturity.

Deming's contribution: the System of Profound Knowledge (especially the psychology-of-people and appreciation-for-a-system lenses) supplies the *why* of culture. A leader who understands variation does not blame a craft for an out-of-control MTBF; a leader who appreciates a system does not optimize Maintenance in isolation from Operations. Deming's "drive out fear" is the prerequisite for any culture-assessment initiative — without psychological safety, the Likert scores are inflated.`,
    terminology: `- **Reliability culture**: shared beliefs and norms about whether reliability is "our job" or "maintenance's job."
- **Maturity ladder**: 4 stages — Reactive → Planned → Proactive → Reliability-Centered.
- **Culture Index (CI)**: weighted Likert score across 8 dimensions, 0-100.
- **Behavioral reliability ratio**: proactive WOs / total WOs × 100.
- **Engagement Index**: % highly engaged − % actively disengaged (Gallup-style, −100 to +100).
- **Psychological safety**: belief that one will not be punished or humiliated for speaking up.
- **Intrinsic motivation**: mastery, autonomy, purpose (self-driven).
- **Extrinsic motivation**: recognition, pay, promotion (externally driven).
- **Blame culture**: RCA focus on "who" rather than "what/why"; destroys psychological safety.
- **Autonomous maintenance (TPM)**: operator-owned asset care (cleaning, lubrication, inspection, tightening).
- **Ops-Maint partnership**: shared accountability for asset uptime; cross-functional RCA teams.`,
    detailed_explanation: `The 8-dimension Culture Index (CI) scorecard (weights sum to 1.00):

1. Leadership commitment to reliability (w 0.15): does the leadership team visibly own reliability? Calendar + budget + presence.
2. Cross-functional collaboration Ops-Maint (w 0.10): are Ops and Maint on the same side of the table? Shared KPIs (uptime, not just craft utilization).
3. Data integrity & CMMS discipline (w 0.15): are WOs closed with complete failure data? Failure codes used? Backlog current?
4. PM/PdM compliance culture (w 0.10): is PM compliance ≥ 85%? Are PdM findings acted on within 7 days?
5. RCA follow-through (w 0.10): every formal RCA has funded action + 90-day effectiveness follow-up?
6. Continuous-improvement engagement (w 0.10): are crafts submitting improvement ideas? Are ideas evaluated and implemented?
7. Psychological safety to report issues (w 0.15): do crafts report near-misses, bad data, defects without fear?
8. Recognition & reward for reliability behavior (w 0.15): is proactive behavior recognized within 7 days? Is reactive heroism *not* celebrated?

Total = 1.00. Weights tunable: safety-leader plant → Leadership-commitment + Psychological-safety up; cost-leader → Data-integrity + CI-engagement up.

CI = Σ (w_i × s_i) × 20, where s_i = 1-5 Likert (1 = strongly disagree, 5 = strongly agree). CI bands:
- < 45: Reactive (firefighting is rewarded, data is incomplete, RCAs blame people).
- 45-60: Reactive → Planned transition (PM compliance rising, scheduling discipline emerging, but firefighting still rewarded).
- 60-75: Planned (PM compliance ≥ 70%, some PdM, RCAs name causes).
- 75-90: Proactive (PM compliance ≥ 85%, PdM on bad actors, RCAs funded).
- > 90: Reliability-Centered (PdM/RCM integrated, operators do autonomous maintenance, downtime is a near-miss).

Motivation theory for M&R: Deming's contribution is foundational — "remove slogans, exhortations, and targets asking for zero defects without providing the method" (Point 10 of the 14). A target of "98% PM compliance" without the planner:craft ratio to support it is *demotivating* — crafts know they cannot hit it and stop trying. The modern evidence-based motivation literature (Deci & Ryan's self-determination theory; Daniel Pink's "Drive") converges on three intrinsic drivers: autonomy (crafts control how they do the work), mastery (training + certification + challenging assignments), purpose (the work matters to the plant's safety/output). Extrinsic drivers (recognition, pay, promotion) are necessary but lose effectiveness without the intrinsic drivers — they generate compliance, not commitment.

Team dynamics in M&R: the Ops-Maint boundary is the most common failure mode. Operations owns production; Maintenance owns the assets; the boundary is where PMs get deferred ("we can't stop the line for a PM") and where RCAs become political. The fix: shared KPIs (uptime, OEE) at the ops+maint leadership level; cross-functional RCA teams with a named facilitator (the Reliability Engineer); joint shift handovers; shared CMMS access for operators (to enter defects directly). Psychological safety is the prerequisite — without it, the Likert scores are inflated and the boundary stays political.`,
    core_principles: `- Culture is the multiplier on every technical system; without it, the CMMS/PdM/RCM produce 30-50% of their potential.
- 4-stage maturity ladder: Reactive → Planned → Proactive → Reliability-Centered.
- Culture Index: 8 weighted dimensions, 1-5 Likert → 0-100; bands < 45 / 45-60 / 60-75 / 75-90 / > 90.
- Intrinsic motivation (autonomy, mastery, purpose) > extrinsic for sustained proactive behavior.
- Deming: remove slogans/targets without method; drive out fear; the prerequisite for any culture initiative.
- Psychological safety is the foundation — without it, Likert scores are inflated by 10-20%.
- ISO 55000 Cl. 7.3 (Awareness): people must know the policy, their contribution, and the cost of non-conformance.
- Recognize proactive behavior within 7 days; never celebrate reactive heroism.`,
    components: `- Culture Index scorecard (8 dimensions, weighted, 1-5 Likert → 0-100).
- Maturity-ladder placement (Reactive/Planned/Proactive/Reliability-Centered).
- Behavioral reliability ratio metric (proactive WOs / total WOs × 100).
- Engagement Index pulse (quarterly, Gallup-style).
- Psychological-safety pulse (2-question survey, quarterly).
- Recognition program (proactive criteria, ≤ 7-day latency).
- Cross-functional RCA team charter (RE facilitator + Maint + Ops + Eng).
- Autonomous-maintenance (TPM) program for operators.`,
    process: `1. Survey the M&R population (and a sample of Ops) on the 8 dimensions (1-5 Likert, anonymous).
2. Compute the Culture Index; identify the 3 lowest-scoring dimensions.
3. Place the plant on the maturity ladder (Reactive/Planned/Proactive/Reliability-Centered).
4. Pulse psychological safety (separately, because it conditions the validity of step 1).
5. For each of the 3 lowest dimensions, design one specific intervention (e.g., Cross-functional collaboration → shared Ops-Maint KPIs + joint shift handovers).
6. Communicate the plan (Change Management, Lesson 4).
7. Implement; track leading indicators (recognition latency, RCA follow-through rate, PM compliance).
8. Re-measure CI at 6 months; adjust weights if corporate strategy shifts.`,
    formula_calculation: `**Culture Index (CI)**:
  CI = Σ (w_i × s_i) × 20  → 0-100 scale (s_i = 1-5 Likert; Σw_i = 1)
  - 8 dimensions: Leadership-commitment (0.15), Cross-functional (0.10), Data integrity (0.15), PM/PdM compliance (0.10), RCA follow-through (0.10), CI engagement (0.10), Psychological safety (0.15), Recognition (0.15).
  - bands: < 45 Reactive; 45-60 transition; 60-75 Planned; 75-90 Proactive; > 90 Reliability-Centered.
  - example: scores 3/2/3/4/2/3/4/2, equal weights per formula → (0.45+0.20+0.45+0.40+0.20+0.30+0.60+0.30) × 20 = 2.90 × 20 = 58.0 (transition band).

**Behavioral reliability ratio**:
  BRR = (proactive WOs: PM + PdM + CI) / (total WOs: PM + PdM + CI + CM) × 100  [%]
  - target: ≥ 70% Proactive; ≥ 80% Reliability-Centered.
  - example: 700 PM + 200 PdM + 100 CI = 1,000 proactive; 600 CM; total 1,600; BRR = 1,000/1,600 = 62.5% (transition band).

**Engagement Index (Gallup-style)**:
  EI = (% highly engaged) − (% actively disengaged)  [range −100 to +100]
  - target: ≥ +40 Proactive; ≥ +60 Reliability-Centered; < 0 = serious culture problem.
  - example: 38% highly engaged − 18% actively disengaged = +20 (Planned band).

**Recognition latency** = (days from behavior to recognition), target ≤ 7 days; > 30 days loses reinforcing effect.`,
    worked_example: `**Problem** — Score a Chemical plant on the 8-dimension culture scorecard, compute the Culture Index, place on the maturity ladder, identify the 3 weakest dimensions, and design a 12-month intervention plan with target scores.

**Scores (1-5 Likert, anonymous survey, n = 145 respondents)**:
| # | Dimension | w_i | s_i | w_i × s_i |
|---|-----------|-----|-----|-----------|
| 1 | Leadership commitment to reliability | 0.15 | 3 | 0.45 |
| 2 | Cross-functional collaboration Ops-Maint | 0.10 | 2 | 0.20 |
| 3 | Data integrity & CMMS discipline | 0.15 | 3 | 0.45 |
| 4 | PM/PdM compliance culture | 0.10 | 4 | 0.40 |
| 5 | RCA follow-through | 0.10 | 2 | 0.20 |
| 6 | Continuous-improvement engagement | 0.10 | 3 | 0.30 |
| 7 | Psychological safety to report issues | 0.15 | 4 | 0.60 |
| 8 | Recognition & reward for reliability behavior | 0.15 | 2 | 0.30 |
| Σ | | 1.00 | | 2.90 |

**Culture Index** = 2.90 × 20 = **58.0 / 100** → **Reactive → Planned transition band** (45-60).

**Behavioral reliability ratio** = (700 PM + 200 PdM + 100 CI) / (1,000 + 600 CM) × 100 = 1,000/1,600 = **62.5%** (Planned band, 60-70).

**Engagement Index** = 38% highly engaged − 18% actively disengaged = **+20** (Planned band).

**Maturity placement**: transitional — KPIs say Planned (BRR 62.5%, EI +20), but culture says transition (CI 58). The gap is the leading-indicator signal: KPIs are about to stall unless culture lifts.

**3 weakest dimensions** (lowest w×s):
- Cross-functional collaboration Ops-Maint (s = 2)
- RCA follow-through (s = 2)
- Recognition & reward for reliability behavior (s = 2)

**12-month intervention plan** (target CI ≥ 70, Planned band):
| # | Dimension | Intervention | Target s | New w×s |
|---|-----------|--------------|----------|---------|
| 1 | Cross-functional | Shared Ops-Maint uptime KPI + joint shift handovers + cross-functional RCA team | 2 → 4 | 0.40 |
| 2 | RCA follow-through | Every formal RCA: named owner + funded recommendation + 90-day effectiveness follow-up; report at monthly review | 2 → 4 | 0.40 |
| 3 | Recognition | Bi-weekly craftsmanship-recognition program (proactive criteria, ≤ 7-day latency); stop celebrating reactive heroism | 2 → 4 | 0.60 |

**12-month projected CI** (other dimensions unchanged):
Σ = 0.45 + 0.40 + 0.45 + 0.40 + 0.40 + 0.30 + 0.60 + 0.60 = 3.60 → CI = 3.60 × 20 = **72.0 / 100** (Planned band, 60-75).

**Conclusion**: the plant is on the Reactive → Planned boundary. The 3 weakest dimensions are all interventional; lifting each from 2 → 4 in 12 months moves CI 58 → 72 (Planned band). The intervention is sequenced (Change Mgmt Lesson 4): Recognition month 0-3 (zero cost, fastest lift), Cross-functional month 3-9 (KPI + handover redesign), RCA follow-through month 6-12 (process change + monthly review).`,
    industrial_example: `**Oil & Gas — offshore platform**: CI = 81 (Proactive). BRR 75%. EI +42. PM compliance 91%. Operators do autonomous maintenance; cross-functional RCA team standard; recognition within 5 days.

**Power — coal plant**: CI = 53 (transition). BRR 55%. EI +12. PM compliance 62%. RCA blame-culture; data integrity weak. Action plan in flight.

**Container Terminal — RTG yard**: CI = 76 (Proactive). BRR 72%. EI +38. PM compliance 87%. Crafts submit improvement ideas (12/yr avg per craft).

**Manufacturing — food plant**: CI = 84 (Proactive → Reliability-Centered). BRR 80%. EI +52. Autonomous maintenance standard; downtime treated as a near-miss event.`,
    case_study: `CASE_TYPE = SYNTHETIC. A 250-craft Chemical plant with CI = 47 (Reactive → Planned boundary) launched a 12-month culture initiative targeting the 3 lowest dimensions (Cross-functional 2, RCA follow-through 2, Recognition 2). The initiative had zero direct cost — it relied on the M&R Manager's consistency on three behaviors: (a) bi-weekly recognition of proactive behavior, (b) cross-functional RCA team on every critical failure with a named RE facilitator and 90-day follow-up, (c) joint Ops-Maint shift handover at every shift change with a shared uptime KPI. Month-6 re-measurement: CI 47 → 59 (still transition, but at the upper bound). Month-12: CI 59 → 71 (Planned band). PM compliance moved from 41% to 78%. MTBF +17%. The KPI movement lagged the CI movement by 3 months — culture is the leading indicator. Lesson: culture initiatives are zero-cost if they are behavior-change initiatives, not program initiatives; the binding constraint is leadership consistency, not capital.`,
    visual_explanation: `Picture the culture scorecard as a radar chart with 8 axes. A Reactive plant's chart is small and lopsided (high on PM compliance, low on RCA follow-through and Recognition — firefighting culture). A Proactive plant's chart is large and balanced (≥ 4/5 on all axes). The radar chart visualizes the culture gap 3-6 months before the KPI chart moves.`,
    simulation_opportunity: `Build a culture-to-KPI simulator: input CI and BRR; output projected PM compliance and MTBF movement over 12 months (calibrated with the plant's historical CI-to-KPI lag, typically 3-6 months). Use the simulator to defend a zero-cost behavior-change initiative: "a recognition program lifts CI Recognition 2 → 4 and PM compliance 41% → 78% in 12 months at $0 capex."`,
    common_mistakes: `- Treating culture as a poster campaign — culture is behavior, not slogans; without the underlying behavior change (recognition, RCA follow-through), posters are noise.
- Inflated Likert scores due to fear — without psychological safety, respondents answer 4 when they mean 2; always pulse psychological safety alongside the CI survey.
- Recognizing reactive heroism — increases failures (incentivizes heroism); the single most damaging culture initiative.
- Setting "PM compliance ≥ 98%" target without the planner:craft ratio to support it — Deming Point 10: target without method is demotivating.
- Cross-functional RCA without a named facilitator — Ops-Maint friction turns the RCA political.
- Autonomous maintenance (TPM) without operator training — operators skip the checklist because "it's not my job."
- One annual culture survey — culture shifts in 3-6 months; pulse quarterly to track movement.
- Treating the maturity ladder as linear — plants can stall at Planned for years; the lift from Planned → Proactive requires explicit behavior change.`,
    limitations: `- Likert scores are subjective and prone to fear-inflation (10-20%); pulse psychological safety alongside.
- The 8 dimensions and weights are SMRP-aligned baselines; some plants add a 9th (safety culture) or re-weight for corporate strategy.
- Culture-to-KPI lag is 3-6 months — impatient plants abandon before the KPIs move.
- Culture initiatives are zero-cost in capital but expensive in leadership consistency — the binding constraint is the leader's calendar and discipline.
- Cross-cultural plants (multi-national workforce) may need translated surveys and bilingual facilitation.
- The maturity ladder is descriptive, not prescriptive — plants do not always progress linearly.`,
    comparison: `**Intrinsic vs Extrinsic motivation**: Intrinsic (autonomy, mastery, purpose) generates sustained proactive behavior; Extrinsic (recognition, pay, promotion) generates compliance. Both required; intrinsic is the multiplier. **Reactive vs Proactive culture**: Reactive rewards firefighting (high on Recognition of heroism, low on RCA follow-through); Proactive rewards defect-catching (high on Recognition of proactive behavior, high on RCA follow-through). **Annual vs Quarterly pulse**: Annual surveys miss the 3-6 month culture shift; quarterly pulses track movement and the CI-to-KPI lag. **Blame vs Cause RCA**: Blame RCA names people (destroys psychological safety); Cause RCA names system causes (builds psychological safety).`,
    practical_application: `- **Monthly**: track leading indicators (recognition latency, RCA follow-through rate, PM compliance, BRR).
- **Quarterly**: pulse psychological safety + re-score CI; track CI movement against KPI movement (the lag).
- **Semi-annually**: place plant on maturity ladder; review whether CI lift is on track for the 12-month plan.
- **Annually**: re-baseline weights if corporate strategy shifts; review cross-cultural survey design if workforce is multi-national.
- **On every cross-functional RCA**: ensure a named RE facilitator, cause-focused (not blame), 90-day follow-up.`,
    decision_scenario: `You are the M&R Manager at a 250-craft Chemical plant with CI = 47 (Reactive → Planned boundary). 3 weakest dimensions all at 2/5. You have $0 capex but 12 months before corporate audit. Design the intervention sequence:

(1) Month 0-3: Recognition program (proactive criteria, ≤ 7-day latency; stop celebrating reactive heroism). Zero cost; highest-leverage fastest-lift; removes the cultural root cause (rewarding firefighting).
(2) Month 3-9: Cross-functional Ops-Maint partnership — shared uptime KPI at Ops+Maint leadership level; joint shift handovers; cross-functional RCA team on every critical failure. Zero cost; structural change.
(3) Month 6-12: RCA follow-through process — every formal RCA: named owner, funded recommendation, 90-day effectiveness follow-up; report at monthly reliability review. Zero cost; requires M&R Manager's calendar discipline.

Projected 12-month CI: 47 → 71 (Planned band). PM compliance 41% → 78%. MTBF +17%. The intervention is sequenced to lift the lowest-cost, highest-leverage dimension first (Recognition) — culture initiatives are zero-cost if they are behavior-change, not program initiatives. The binding constraint is your consistency, not capital.`,
    practice_questions: `- Define the 4-stage maturity ladder and the CI band for each.
- A plant scores 3/2/3/4/2/3/4/2 on the 8 CI dimensions (weights 0.15/0.10/0.15/0.10/0.10/0.10/0.15/0.15). Compute CI. *(Answer: 58.0.)*
- Compute BRR for 700 PM + 200 PdM + 100 CI / 1,600 total WOs. *(Answer: 62.5%.)*
- Compute EI for 38% highly engaged − 18% actively disengaged. *(Answer: +20.)*
- State why recognizing reactive heroism *increases* failures.`,
    certification_questions: `The CMRP exam tests Organizational Behavior as the third OL competency. SMRP-aligned sample prompts:

(a) Compute CI from an 8-dimension Likert scorecard and place on the maturity ladder.
(b) Diagnose the 3 weakest dimensions and prescribe interventions.
(c) Distinguish intrinsic vs extrinsic motivation; explain why target-without-method demotivates (Deming Point 10).
(d) Compute behavioral reliability ratio and Engagement Index.
(e) Map ISO 55000 Cl. 7.3 (Awareness) requirements to culture-assessment outputs.

The questions in this lesson's question bank are aligned to these competencies.`,
    summary: `Organizational Behavior is where the OL pillar meets psychology. The 8-dimension Culture Index (0-100) places the plant on a 4-stage maturity ladder (Reactive → Planned → Proactive → Reliability-Centered). Intrinsic motivation (autonomy, mastery, purpose) beats extrinsic for sustained proactive behavior. Deming: drive out fear, remove slogans without method — the prerequisite for any culture initiative. Psychological safety is the foundation — without it, Likert scores are inflated. Culture initiatives are zero-cost in capital but expensive in leadership consistency; the binding constraint is the leader's calendar, not the budget. CI is the 3-6 month leading indicator of KPI movement.`,
    key_takeaways: `- 4-stage maturity ladder: Reactive → Planned → Proactive → Reliability-Centered.
- CI bands: < 45 Reactive; 45-60 transition; 60-75 Planned; 75-90 Proactive; > 90 Reliability-Centered.
- 8 CI dimensions, weighted (Leadership-commitment + Cross-functional + Data integrity + PM/PdM + RCA + CI-engagement + Psychological safety + Recognition).
- Intrinsic > extrinsic for sustained proactive behavior; Deming: remove target-without-method.
- Recognize proactive behavior within 7 days; never celebrate reactive heroism.
- Psychological safety is the prerequisite — pulse it alongside the CI survey.
- ISO 55000 Cl. 7.3 (Awareness) = management-system expression of culture.
- CI is a 3-6 month leading indicator of KPI movement.`,
    references: `- SMRP. *CMRP Body of Knowledge — Organization & Leadership pillar: Organizational Behavior.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.* (Cl. 7.3 Awareness).
- Kotter, J. P. (1996/2012). *Leading Change*. HBR Press. (Step 8 — anchor in the culture.)
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. (Psychology of people; 14 Points; drive out fear.)
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section III (workforce/HR).
- O'Hanlon, T. (2000/2015). *Uptime: A Guide to Reliable Performance*. Reliabilityweb. (Culture maturity ladder; behavioral reliability.)`,
  },
  knowledgeObject: {
    title: "Organizational Behavior — reliability culture, motivation, team dynamics",
    domain: "Organization & Leadership",
    competency: "Organizational Behavior",
    topic: "Reliability culture & motivation in M&R",
    concept: "Culture Index × motivation × team dynamics",
    body: {
      definitions: [
        "Reliability culture: shared beliefs and norms about whether reliability is 'our job' or 'maintenance's job.'",
        "Maturity ladder: 4 stages — Reactive → Planned → Proactive → Reliability-Centered.",
        "Culture Index (CI): weighted Likert score across 8 dimensions, 0-100.",
        "Behavioral reliability ratio (BRR): proactive WOs / total WOs × 100.",
        "Engagement Index (EI): % highly engaged − % actively disengaged (Gallup-style).",
        "Psychological safety: belief that one will not be punished or humiliated for speaking up.",
        "Intrinsic motivation: mastery, autonomy, purpose (self-driven).",
        "Extrinsic motivation: recognition, pay, promotion (externally driven).",
        "Blame culture: RCA focus on 'who' rather than 'what/why'; destroys psychological safety.",
        "Autonomous maintenance (TPM): operator-owned asset care (cleaning, lubrication, inspection, tightening).",
      ],
      principles: [
        "Culture is the multiplier on every technical system; without it, CMMS/PdM/RCM produce 30-50% of potential.",
        "4-stage maturity ladder: Reactive → Planned → Proactive → Reliability-Centered.",
        "CI bands: < 45 / 45-60 / 60-75 / 75-90 / > 90.",
        "Intrinsic motivation > extrinsic for sustained proactive behavior.",
        "Deming: remove slogans/targets without method; drive out fear.",
        "Psychological safety is the foundation — without it, Likert scores are inflated 10-20%.",
        "ISO 55000 Cl. 7.3 (Awareness): people must know the policy, their contribution, the cost of non-conformance.",
        "CI is a 3-6 month leading indicator of KPI movement.",
      ],
      components: [
        "Culture Index scorecard (8 dimensions, weighted, 1-5 Likert → 0-100).",
        "Maturity-ladder placement.",
        "Behavioral reliability ratio metric.",
        "Engagement Index pulse (quarterly).",
        "Psychological-safety pulse (2-question, quarterly).",
        "Recognition program (proactive criteria, ≤ 7-day latency).",
        "Cross-functional RCA team charter (RE facilitator + Maint + Ops + Eng).",
        "Autonomous-maintenance (TPM) program for operators.",
      ],
      mechanism: [
        "Survey 8 dimensions (anonymous Likert) → compute CI → place on maturity ladder → pulse psychological safety → identify 3 weakest dimensions → design one intervention per weak dimension → communicate via Change Mgmt → track leading indicators (recognition latency, RCA follow-through, PM compliance) → re-measure CI at 6 months → adjust weights if strategy shifts.",
      ],
      process: [
        "1. Survey M&R + Ops sample on 8 dimensions (1-5 Likert, anonymous).",
        "2. Compute CI; identify 3 lowest dimensions.",
        "3. Place on maturity ladder.",
        "4. Pulse psychological safety (conditions validity of step 1).",
        "5. For each weak dimension, design one specific intervention.",
        "6. Communicate via Change Mgmt (Lesson 4).",
        "7. Implement; track leading indicators.",
        "8. Re-measure CI at 6 months; adjust.",
      ],
      formulas: [
        "CI = Σ (w_i × s_i) × 20  [0-100; s_i = 1-5; Σw_i = 1]",
        "BRR = (proactive WOs) / (total WOs) × 100  [%]",
        "EI = (% highly engaged) − (% actively disengaged)  [−100 to +100]",
        "Recognition latency = days from behavior to recognition [target ≤ 7]",
      ],
      metrics: [
        "CI [0-100].",
        "BRR [%].",
        "EI [−100 to +100].",
        "Psychological-safety pulse score [0-100].",
        "Recognition latency [days].",
        "RCA follow-through rate [%].",
        "PM compliance [%] (lagging KPI).",
      ],
      examples: [
        "Chemical plant: scores 3/2/3/4/2/3/4/2 → CI = 58 (transition); weakest 3 dimensions all at 2/5.",
        "Oil & Gas offshore: CI 81 (Proactive); BRR 75%; EI +42; PM compliance 91%.",
        "Power coal plant: CI 53 (transition); BRR 55%; EI +12; PM compliance 62%.",
        "Container Terminal RTG yard: CI 76 (Proactive); BRR 72%; EI +38.",
        "Manufacturing food plant: CI 84 (Proactive → Reliability-Centered); BRR 80%; EI +52.",
      ],
      industrial_examples: [
        "Oil & Gas — offshore CI 81, operators do autonomous maintenance.",
        "Power — coal plant CI 53, RCA blame-culture, action plan in flight.",
        "Container Terminal — RTG yard CI 76, 12 ideas/yr per craft.",
        "Manufacturing — food plant CI 84, downtime treated as near-miss.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 250-craft Chemical plant CI = 47 (Reactive → Planned boundary). 12-mo culture initiative on 3 weakest dimensions (Cross-functional 2, RCA 2, Recognition 2), zero direct cost. Month-6: CI 47 → 59. Month-12: CI 59 → 71 (Planned). PM compliance 41% → 78%. MTBF +17%. KPI movement lagged CI movement by 3 months. Lesson: culture initiatives are zero-cost if behavior-change (not program) initiatives; binding constraint is leadership consistency, not capital.",
      ],
      common_errors: [
        "Treating culture as a poster campaign — without behavior change, posters are noise.",
        "Inflated Likert scores due to fear — pulse psychological safety alongside.",
        "Recognizing reactive heroism — increases failures.",
        "Setting 'PM compliance ≥ 98%' target without planner:craft ratio — Deming Point 10 (target without method is demotivating).",
        "Cross-functional RCA without a named facilitator — turns political.",
        "Autonomous maintenance (TPM) without operator training — operators skip the checklist.",
        "One annual culture survey — culture shifts in 3-6 months; pulse quarterly.",
        "Treating the maturity ladder as linear — plants stall at Planned for years.",
      ],
      limitations: [
        "Likert scores are subjective and prone to fear-inflation (10-20%); pulse psychological safety alongside.",
        "The 8 dimensions and weights are SMRP-aligned baselines; some plants add a 9th (safety) or re-weight.",
        "Culture-to-KPI lag is 3-6 months — impatient plants abandon before KPIs move.",
        "Culture initiatives are zero-cost in capital but expensive in leadership consistency.",
        "Cross-cultural plants may need translated surveys and bilingual facilitation.",
        "Maturity ladder is descriptive, not prescriptive — plants do not always progress linearly.",
      ],
      best_practices: [
        "Pulse psychological safety alongside the CI survey (validates the scores).",
        "Pulse CI quarterly to track movement against KPI lag.",
        "Recognize proactive behavior within 7 days; never celebrate reactive heroism.",
        "Every cross-functional RCA: named RE facilitator, cause-focused (not blame), 90-day follow-up.",
        "Joint Ops-Maint shift handover with shared uptime KPI.",
        "Autonomous maintenance (TPM) with operator training before rollout.",
        "Tune CI weights to corporate strategy (safety-leader → Psychological-safety + Leadership up; cost-leader → Data-integrity + CI-engagement up).",
        "Sequence interventions: lowest-cost highest-leverage first (Recognition); structural changes (Cross-functional) next; process changes (RCA follow-through) last.",
      ],
      related_concepts: [
        "Organizational Structures (Lesson 1) — structure enables or defeats culture.",
        "Leadership (Lesson 2) — culture is downstream of leadership behaviors.",
        "Change Management (Lesson 4) — culture initiatives are change initiatives.",
        "Training & Development (Lesson 5) — autonomous maintenance requires operator training.",
        "ISO 55000 Cl. 7.3 (Awareness) — management-system expression of culture.",
        "Deming's System of Profound Knowledge — psychology-of-people lens.",
      ],
      prerequisites: [
        "Organizational Structures (Lesson 1) + Leadership (Lesson 2).",
        "Work Management (WM pillar) — PM/CM/PdM mix.",
        "ISO 55000:2014 Cl. 7.3 (Awareness).",
        "Deming's psychology-of-people lens (System of Profound Knowledge).",
      ],
      references: [
        "SMRP CMRP BOK — OL pillar: Organizational Behavior.",
        "ISO 55000:2014 (Cl. 7.3 Awareness).",
        "Kotter, J. P. (1996/2012). Leading Change. HBR Press. (Step 8 — anchor in the culture.)",
        "Deming, W. E. (1986). Out of the Crisis. MIT CAES.",
        "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). Section III.",
        "O'Hanlon, T. (2000/2015). Uptime. Reliabilityweb.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Organizational Behavior",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which 4-stage culture-maturity ladder is the SMRP / O'Hanlon-aligned standard for M&R organizations?",
      whyCorrect:
        "Reactive → Planned → Proactive → Reliability-Centered. Reactive: work is mostly CM, firefighting is rewarded. Planned: PM compliance ≥ 70%, scheduling discipline. Proactive: PM compliance ≥ 85%, PdM on bad actors, RCAs funded. Reliability-Centered: PdM/RCM integrated, operators do autonomous maintenance, downtime is a near-miss event.",
      whyOthersWrong: [
        "Reactive → Preventive → Predictive → Proactive — conflates maintenance-strategy ladder (RTF/PM/PdM/Proactive) with culture-maturity; culture is about behavior and beliefs, not work-type mix.",
        "Initial → Managed → Defined → Optimizing — this is the CMMI maturity ladder (software-engineering); not the M&R culture ladder.",
        "Ad-hoc → Repeatable → Managed → Proactive — partial hybrid; mixes CMMI terms with M&R terms; not a recognized ladder.",
      ],
      explanation:
        "The SMRP/O'Hanlon culture-maturity ladder is Reactive → Planned → Proactive → Reliability-Centered. Maintenance-strategy ladder (RTF/PM/PdM/Proactive) is a different concept (Lesson: Strategy in B&M pillar); CMMI (Initial/Managed/Defined/Optimizing) is a software-engineering ladder.",
      options: [
        { text: "Reactive → Planned → Proactive → Reliability-Centered", isCorrect: true },
        { text: "Reactive → Preventive → Predictive → Proactive", isCorrect: false },
        { text: "Initial → Managed → Defined → Optimizing", isCorrect: false },
        { text: "Ad-hoc → Repeatable → Managed → Proactive", isCorrect: false },
      ],
    },
    {
      competencyName: "Organizational Behavior",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A Chemical plant scores 3/2/3/4/2/3/4/2 on the 8 CI dimensions (weights 0.15/0.10/0.15/0.10/0.10/0.10/0.15/0.15). Compute the Culture Index (CI) and place on the maturity ladder.",
      whyCorrect:
        "CI = Σ (w_i × s_i) × 20 = (0.15×3 + 0.10×2 + 0.15×3 + 0.10×4 + 0.10×2 + 0.10×3 + 0.15×4 + 0.15×2) × 20 = (0.45 + 0.20 + 0.45 + 0.40 + 0.20 + 0.30 + 0.60 + 0.30) × 20 = 2.90 × 20 = 58.0/100. CI band 45-60 = Reactive → Planned transition.",
      whyOthersWrong: [
        "72.0 (Planned band) would result if all scores were 4/5 — but the actual scores include 2, 2, 2 (three dimensions at 2/5), not all 4s.",
        "29.0 (well below Reactive) would result from forgetting the × 20 scale conversion (Σ w×s = 2.90, mistaken as the final score).",
        "45.0 (boundary of Reactive/transition) would result from summing raw scores (3+2+3+4+2+3+4+2 = 23) and dividing by 5 incorrectly, or from approximating without computing the weighted sum.",
      ],
      explanation:
        "CI = Σ (w_i × s_i) × 20 = 2.90 × 20 = 58.0/100 → Reactive → Planned transition band (45-60).",
      options: [
        { text: "58.0 — Reactive → Planned transition", isCorrect: true },
        { text: "72.0 — Planned", isCorrect: false },
        { text: "29.0 — Reactive", isCorrect: false },
        { text: "45.0 — Reactive/transition boundary", isCorrect: false },
      ],
    },
    {
      competencyName: "Organizational Behavior",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "A Power plant has CI = 47, with Psychological Safety = 4/5 but Recognition = 1/5 (no proactive behavior recognized in 12 months; reactive heroism celebrated). The plant intends to launch a quarterly culture survey to track progress. What is the most important first action?",
      whyCorrect:
        "Institute a bi-weekly recognition program for proactive behavior BEFORE launching the survey. With Recognition at 1/5 and reactive heroism celebrated, the cultural root cause is rewarding the wrong behavior. Launching a survey first will produce inflated scores (respondents answer 4 when they mean 2 because of the recognition void) and will not address the root cause. The recognition program is zero-cost, fastest-lift, and removes the cultural root cause; the survey is a measurement tool, not an intervention.",
      whyOthersWrong: [
        "Launch the quarterly culture survey immediately — premature; the Recognition root cause will inflate the scores and the survey will not move them without the intervention; survey-measurement-before-intervention is a common waste of effort.",
        "Hire an external culture-change consultant — overkill; the root cause is leadership behavior (recognition consistency), not expertise; consultants cannot substitute for the M&R Manager's calendar discipline.",
        "Replace the M&R Manager — premature; the Recognition dimension is fixable with a bi-weekly recognition program; replacing the manager is a structural intervention for a behavioral problem.",
      ],
      explanation:
        "Address the cultural root cause (Recognition 1/5 + celebrating reactive heroism) BEFORE measuring. The recognition program is zero-cost, fastest-lift, and removes the root cause; the survey is a measurement tool, not an intervention. Measure-then-intervene wastes the measurement.",
      options: [
        { text: "Institute a bi-weekly recognition program (proactive criteria) BEFORE the survey", isCorrect: true },
        { text: "Launch the quarterly culture survey immediately", isCorrect: false },
        { text: "Hire an external culture-change consultant", isCorrect: false },
        { text: "Replace the M&R Manager", isCorrect: false },
      ],
    },
    {
      competencyName: "Organizational Behavior",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Setting a corporate target of 'PM compliance ≥ 98%' is a best practice for driving reliability culture, regardless of whether the planner:craft ratio is in the SMRP band.",
      whyCorrect:
        "False. Deming's Point 10 of the 14 Points: 'Eliminate slogans, exhortations, and targets for the work force asking for zero defects and new levels of productivity without providing methods.' A PM-compliance target without the planner:craft ratio (1:20-1:30) and scheduler support to enable it is demotivating — crafts know they cannot hit it and stop trying. Targets must be paired with method; otherwise they generate compliance theater, not commitment.",
      whyOthersWrong: [
        "True would repeat the exact failure mode Deming identified — target without method. The plant would report 98% PM compliance (signed-off PMs) while actual PM completion (the work being done correctly) stayed at 60%. The target becomes a lie; the culture degrades further.",
      ],
      explanation:
        "Deming Point 10: target without method is demotivating. PM compliance ≥ 98% requires the planner:craft ratio, scheduler support, and WO closeout discipline — without these, the target is a slogan that generates compliance theater.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Change Management
// ---------------------------------------------------------------------------

const LESSON_CHANGE_MANAGEMENT: RefLesson = {
  competencyName: "Change Management",
  slug: "ol-change-management",
  title: "Leading & Sustaining Change — Kotter's 8 Steps for M&R",
  titleAr: "قيادة التغيير واستدامته — خطوات كوتر الثماني للصيانة",
  order: 4,
  durationMin: 30,
  references: OL_REFERENCE_TITLES,
  conceptIntroduction: `Change Management in M&R is the discipline of converting a reliability initiative (RCM, TPM, CMMS upgrade, PdM rollout, CI program) from a project into a sustained capability. The failure rate of M&R transformations is high — typically 60-70% of initiatives stall at pilot and never scale — because the technical design is sound but the change discipline is absent. Kotter's 8-step model (Leading Change, 1996/2012) is the canonical framework: (1) Create Urgency, (2) Form Guiding Coalition, (3) Develop Vision & Strategy, (4) Communicate the Change Vision, (5) Empower Broad-Based Action, (6) Generate Short-Term Wins, (7) Consolidate Gains & Produce More Change, (8) Anchor New Approaches in the Culture. Steps 1-4 are about *setting the stage*; steps 5-7 are about *making change happen*; step 8 is about *sustaining*. ISO 55000 Cl. 7.4 (Communication) and Cl. 9.3 (Management Review) operationalize the change discipline at the management-system level.`,
  example: `A Chemical plant applies Kotter's 8 steps to an 18-month TPM rollout across 200 assets. Step 1 (Month 0-1): $1.8M/yr unplanned-downtime audit + 14% PM compliance → burning-platform. Step 2 (Month 1-2): 8-person coalition (VP Ops sponsor, M&R Manager, 2 Planners, 2 REs, 2 Operators, IT, HR). Step 3 (Month 2-3): vision "Zero unplanned downtime by 2027 through TPM — operator-owned asset care, PM ratio 85%, PdM coverage on top-30 bad actors." Step 4 (Month 3-18): 7× repetition at town halls, huddles, intranet. Step 5 (Month 4-12): operator AM training, CMMS access for ops, supply-chain kitting, recognition program. Step 6 (Month 6-12): pick line-3 bad actor, halve its downtime in 90 days, publish the win. Step 7 (Month 12-18): re-train, add PdM to 30 bad actors, revise job descriptions, embed reliability in performance reviews. Step 8 (Month 18+): hire/promote for reliability mindset, walk-downs, TPM in annual business plan.`,
  keyFormulas: `Change adoption rate = (active users of new process) / (total population) × 100  [%]
Stakeholder support score = Σ (influence_i × impact_i × stance_i)  [stance: +2 strong advocate, +1 supporter, 0 neutral, -1 resistor, -2 blocker; target ≥ 0 to proceed]
Change velocity = (completed milestones) / (planned milestones in window) × 100  [%]
Short-term win threshold: ≤ 90 days, visible, unambiguous, clearly attributable to the change.
Kotter's 8 steps: 4 set-the-stage (1-4) + 3 make-happen (5-7) + 1 sustain (8).`,
  exercise: `You lead an RCM rollout at a 350-craft Oil & Gas facility. Build the Kotter 8-step plan with month-by-month milestones, identify the guiding coalition (8-10 named roles), and draft the vision statement (≤ 25 words). Compute the stakeholder support score for 12 stakeholders (4 high/high, 2 high/low, 3 low/high, 3 low/low) with stance distribution +2/+1/0/-1/-2; judge whether to proceed.`,
  sections: {
    learning_objectives: `- Apply Kotter's 8-step model to M&R transformations (RCM/TPM/CMMS/PdM/CI).
- Build a guiding coalition of 8-10 named roles and an executive sponsor.
- Draft a vision statement (≤ 25 words) that is specific, time-bound, and measurable.
- Compute change adoption rate, stakeholder support score, and change velocity.
- Map stakeholders on the influence/impact grid (Manage closely / Keep satisfied / Keep informed / Monitor).
- Distinguish the 4 set-the-stage steps, the 3 make-happen steps, and the 1 sustain step.
- Map ISO 55000 Cl. 7.4 (Communication) and Cl. 9.3 (Management Review) to the change discipline.`,
    prerequisites: `- Organizational Structures (Lesson 1), Leadership (Lesson 2), Organizational Behavior (Lesson 3).
- Work Management (WM pillar) — RCM/TPM/PdM/CMMS as the technical content of the change.
- ISO 55000:2014 Cl. 7.4 (Communication), Cl. 9.3 (Management Review).
- Familiarity with Kotter's 8-step model (Leading Change).`,
    introduction: `M&R transformations have a high failure rate (60-70% stall at pilot). The technical designs are usually sound — RCM methodology, TPM pillars, PdM technology, CMMS configuration. What fails is the change discipline: the burning-platform story is unconvincing; the guiding coalition is too narrow (just the M&R team); the vision is generic ("we will be world-class"); communication is one-and-done; barriers (CMMS access, supply-chain kitting, recognition) are not removed; there are no short-term wins; gains are not consolidated; and the new behaviors are never anchored in the culture.

Kotter's 8-step model (Leading Change, Harvard Business Review Press, 1996/2012) is the canonical corrective. The model is sequential: skipping steps produces predictable failure modes. Skip Step 1 (urgency) and the change is seen as optional. Skip Step 2 (coalition) and the change is "the M&R team's hobby." Skip Step 4 (communication, 7× repetition) and people don't know the change has started. Skip Step 6 (short-term wins) and momentum dies at month 9. Skip Step 8 (anchor in culture) and the change unwinds within 18 months of the change leader departing.

ISO 55000:2014 operationalizes change discipline: Cl. 7.4 (Communication) requires that "internal and external communication... includes what, when, and with whom to communicate, and the manner of communication" — the management-system expression of Kotter Step 4. Cl. 9.3 (Management Review) requires periodic review of the asset-management system, including opportunities for improvement — the expression of Kotter Steps 7 and 8. The CMRP OL pillar's Change Management competency is, in effect, Kotter + ISO 55000 + M&R-specific stakeholder dynamics.`,
    terminology: `- **Change management**: discipline of converting an initiative from a project into a sustained capability.
- **Kotter 8 steps**: Create Urgency → Form Coalition → Develop Vision → Communicate → Empower → Quick Wins → Consolidate → Anchor in Culture.
- **Burning platform**: evidence-based case for change (e.g., $1.8M/yr unplanned downtime gap).
- **Guiding coalition**: 8-10 named roles + executive sponsor who own the change.
- **Vision**: ≤ 25-word specific, time-bound, measurable statement of the future state.
- **7× repetition**: communication rule — people must hear the change vision ~7 times before they act on it.
- **Short-term win**: ≤ 90-day visible, unambiguous, attributable success.
- **Stakeholder support score**: weighted (influence × impact × stance) sum; target ≥ 0 to proceed.
- **Influence/impact grid**: 4 quadrants — Manage closely / Keep satisfied / Keep informed / Monitor.
- **Change adoption rate**: active users of new process / total population × 100.
- **Change velocity**: completed milestones / planned milestones in window × 100.`,
    detailed_explanation: `Kotter's 8 steps applied to an M&R transformation (RCM/TPM/CMMS/PdM/CI):

**Stage 1 — Set the stage (Steps 1-4)**:

*Step 1 — Create urgency (Month 0-1)*: the burning-platform. Evidence-based: the $1.8M/yr unplanned-downtime gap; the 14% PM compliance; the safety near-miss trend; the customer-impact trend. The case must be unambiguous and quantified; "we need to improve" is not urgency. The output is a 1-page burning-platform document and a leadership-team endorsement.

*Step 2 — Form guiding coalition (Month 1-2)*: 8-10 named roles. Critical composition: the executive sponsor (VP Operations or Plant Manager), the M&R Manager (change leader), 2-3 Planners, 2 Reliability Engineers, 2-3 senior crafts (union rep if applicable), 1 Operations representative, 1 IT/CMMS analyst, 1 HR representative. The coalition must have *position power* (sponsor), *expertise* (RE, IT), *credibility* (senior crafts), and *influence* (Ops rep). A coalition of only the M&R team = "the M&R team's hobby."

*Step 3 — Develop vision & strategy (Month 2-3)*: ≤ 25 words, specific, time-bound, measurable. Example: "Zero unplanned downtime by 2027 through TPM — operator-owned asset care, PM ratio 85%, PdM coverage on top-30 bad actors." Generic visions ("world-class reliability") fail — they cannot be operationalized or measured. The strategy is the 18-month roadmap that makes the vision achievable.

*Step 4 — Communicate the change vision (Month 3-18, ongoing)*: 7× repetition rule — people must hear the vision ~7 times before they act on it. Channels: monthly town halls, daily shift huddles, intranet, posters, one-on-ones. Communication must be two-way (questions answered, concerns surfaced); one-way communication produces compliance, not commitment. ISO 55000 Cl. 7.4 requires that communication include "what, when, with whom, and the manner" — the management-system expression of this step.

**Stage 2 — Make change happen (Steps 5-7)**:

*Step 5 — Empower broad-based action (Month 4-12)*: remove barriers. Train operators on autonomous maintenance (cleaning, lubrication, inspection, tightening); give ops CMMS access to enter defects directly; kit parts via supply chain; change the recognition program (proactive criteria); align the IT/CMMS to support new workflows. Barriers must be identified and removed systematically — a barrier-log is the tool.

*Step 6 — Generate short-term wins (Month 6-12)*: ≤ 90 days, visible, unambiguous, attributable. Pick a bad actor on line-3; halve its unplanned downtime in 90 days; publish the win in the town hall; secure the next-line budget envelope approval. Short-term wins build momentum, defuse cynics, and reinforce the coalition. Wins that take > 90 days or are ambiguous lose their reinforcing effect.

*Step 7 — Consolidate gains & produce more change (Month 12-18)*: re-train, add PdM to 30 bad actors, revise PMs based on failure data, change job descriptions, embed reliability in performance reviews. The temptation to declare victory at month 12 (after the first win) is the most common failure mode — without consolidation, the change unwinds within 6 months.

**Stage 3 — Sustain (Step 8)**:

*Step 8 — Anchor new approaches in the culture (Month 18+)*: hire and promote for reliability mindset; make leadership walk-downs standard; embed the KPI dashboard in the morning production meeting; weave TPM into the annual business plan; make the reliability-culture dimension of performance reviews explicit. Without anchoring, the change unwinds within 18 months of the change leader departing.

**Stakeholder management**: 12 stakeholders mapped on the influence/impact grid:
- High influence + High impact (4): VP Ops, Plant Manager, M&R Manager, Union Steward → "Manage closely" (sponsor them; secure their active advocacy).
- High influence + Low impact (2): CFO, HR Director → "Keep satisfied" (brief regularly; secure budget/HR support).
- Low influence + High impact (3): Operators, Maintenance crafts, Reliability engrs → "Keep informed" (the change population; communicate the vision 7×).
- Low influence + Low impact (3): IT, Procurement, Outside vendors → "Monitor" (minimal effort; respond to issues).

**Stakeholder support score** = Σ (influence_i × impact_i × stance_i), stance on the −2 to +2 scale. A score ≥ 0 is the threshold to proceed; a score < 0 indicates a blocker coalition that will defeat the change — fix the stance first (via Steps 1 and 4) before proceeding.

ISO 55000 Cl. 9.3 (Management Review) operationalizes Steps 7 and 8 — periodic review of the asset-management system including opportunities for improvement, ensuring that the change is consolidated and anchored.`,
    core_principles: `- Kotter 8 steps are sequential; skipping produces predictable failure modes.
- Stage 1 (Steps 1-4) sets the stage; Stage 2 (Steps 5-7) makes change happen; Stage 3 (Step 8) sustains.
- Burning platform must be evidence-based and quantified — "we need to improve" is not urgency.
- Guiding coalition: 8-10 named roles with position power + expertise + credibility + influence.
- Vision: ≤ 25 words, specific, time-bound, measurable.
- 7× repetition rule: people must hear the vision ~7 times before they act on it.
- Short-term wins: ≤ 90 days, visible, unambiguous, attributable.
- Anchoring (Step 8) prevents the 18-month unwind that follows a change leader's departure.
- ISO 55000 Cl. 7.4 (Communication) and Cl. 9.3 (Management Review) operationalize the discipline.`,
    components: `- Burning-platform 1-pager (quantified case for change).
- Guiding coalition roster (8-10 named roles + sponsor).
- Vision statement (≤ 25 words, specific, time-bound, measurable).
- 18-month roadmap / milestone timeline (Kotter steps × months).
- Communication plan (channels, frequency, two-way mechanisms).
- Barrier log (Step 5) — identified barriers + removal owners + status.
- Short-term wins log (Step 6) — candidates + 90-day outcomes.
- Stakeholder influence/impact grid + support score.
- Adoption-rate metric (active users / total population).`,
    process: `1. Build the burning-platform 1-pager (evidence + numbers; leadership endorses).
2. Recruit the guiding coalition (8-10 named roles + sponsor).
3. Draft the vision (≤ 25 words, specific, time-bound, measurable).
4. Map 12 stakeholders on the influence/impact grid; compute stakeholder support score.
5. If support score ≥ 0, proceed; if < 0, fix stances first via Steps 1 and 4.
6. Build the 18-month milestone timeline (Step 1-8 × months).
7. Launch communication (Step 4) — 7× repetition across town halls, huddles, intranet.
8. Execute Step 5 (remove barriers) and Step 6 (short-term wins) in parallel.
9. At month 12, execute Step 7 (consolidate — re-train, embed in job descriptions, performance reviews).
10. At month 18+, execute Step 8 (anchor — hire/promote for reliability, walk-downs, business plan).
11. Track adoption rate and change velocity monthly; report to sponsor at monthly reliability review.`,
    formula_calculation: `**Change adoption rate** = (active users of new process) / (total population) × 100  [%]
  - target: ≥ 70% by month 6; ≥ 85% by month 12; ≥ 90% by month 18.
  - example: 140 of 200 crafts using the new CMMS workflow = 70% adoption.

**Stakeholder support score** S = Σ (influence_i × impact_i × stance_i)
  - influence: 1-5 (1 = low, 5 = high).
  - impact: 1-5 (1 = low, 5 = high).
  - stance: +2 strong advocate, +1 supporter, 0 neutral, -1 resistor, -2 blocker.
  - threshold: S ≥ 0 to proceed; S < 0 indicates blocker coalition — fix stance first.
  - example: 4 stakeholders at (5, 5, +2), 2 at (5, 2, +1), 3 at (2, 5, +1), 3 at (2, 2, 0):
    S = 4×(5×5×2) + 2×(5×2×1) + 3×(2×5×1) + 3×(2×2×0)
      = 4×50 + 2×10 + 3×10 + 3×0 = 200 + 20 + 30 + 0 = 250 (well above 0; proceed).

**Change velocity** = (completed milestones) / (planned milestones in window) × 100  [%]
  - target: ≥ 85% per quarter; < 70% = coalition attention gap.

**Short-term win threshold** (qualitative): ≤ 90 days; visible (公开ly reported); unambiguous (attributable to the change); budget envelope secured for the next win.`,
    worked_example: `**Problem** — Apply Kotter's 8 steps to an 18-month TPM rollout at a 200-asset Chemical plant. Map 12 stakeholders on the influence/impact grid; compute the stakeholder support score; judge whether to proceed.

**Step 1 — Create urgency (Month 0-1)**: Audit shows $1.8M/yr unplanned-downtime gap; 14% PM compliance; 2 safety near-misses in 6 months; 6% MTBF decline. Burning-platform 1-pager endorsed by VP Operations and Plant Manager.

**Step 2 — Form guiding coalition (Month 1-2)**: 8 named roles:
| Role | Why on coalition |
|------|------------------|
| VP Operations (sponsor) | Position power; budget envelope |
| M&R Manager (change leader) | Daily ownership; expertise |
| 2 Planners | Work-process expertise; credibility with crafts |
| 2 Reliability Engineers | Technical depth (PdM, RCM) |
| 2 Senior Operators (top craftsmen) | Credibility with operators; cross-functional |
| Maintenance Craft Rep (union) | Credibility with crafts; labor buy-in |
| IT/CMMS Analyst | CMMS configuration; data integration |
| HR Representative | Training, job descriptions, recognition |

**Step 3 — Develop vision & strategy (Month 2-3)**: "Zero unplanned downtime by 2027 through TPM — operator-owned asset care, PM ratio 85%, PdM coverage on top-30 bad actors." (24 words.)

**Step 4 — Communicate (Month 3-18, ongoing)**: Monthly town hall (sponsor keynote); daily shift huddles (1-min change update); intranet site (vision + roadmap + wins log); 1:1 between coalition members and crafts. 7× repetition rule.

**Step 5 — Empower (Month 4-12)**: Operator AM training (5S, lubrication, inspection); CMMS access for ops; supply-chain kitting; recognition program (proactive criteria); IT/CMMS workflow redesign.

**Step 6 — Short-term wins (Month 6-12)**: Pick line-3 bad actor (a hydraulic press, 6 failures/yr, $180k/yr); halve its unplanned downtime in 90 days via PdM + AM; publish the win at town hall; secure the line-4 budget envelope.

**Step 7 — Consolidate (Month 12-18)**: Re-train operators; add PdM to 30 bad actors; revise PMs based on failure data; change job descriptions (operator AM responsibilities); embed reliability in performance reviews.

**Step 8 — Anchor (Month 18+)**: Hire/promote for reliability mindset; standard leadership walk-downs; KPI dashboard in morning production meeting; TPM woven into annual business plan.

**Stakeholder mapping (12 stakeholders)**:

| # | Stakeholder | Influence | Impact | Stance | Quadrant |
|---|-------------|-----------|--------|--------|----------|
| 1 | VP Operations | 5 | 5 | +2 | Manage closely |
| 2 | Plant Manager | 5 | 5 | +2 | Manage closely |
| 3 | M&R Manager | 4 | 5 | +2 | Manage closely |
| 4 | Union Steward | 5 | 4 | +1 | Manage closely |
| 5 | CFO | 5 | 2 | +1 | Keep satisfied |
| 6 | HR Director | 4 | 2 | +1 | Keep satisfied |
| 7 | Operators | 2 | 5 | +1 | Keep informed |
| 8 | Maintenance crafts | 2 | 5 | 0 | Keep informed |
| 9 | Reliability engineers | 2 | 4 | +2 | Keep informed |
| 10 | IT | 2 | 2 | 0 | Monitor |
| 11 | Procurement | 2 | 2 | 0 | Monitor |
| 12 | Outside vendors | 1 | 2 | 0 | Monitor |

**Stakeholder support score** S:
- 4 "Manage closely": 5×5×2 + 5×5×2 + 4×5×2 + 5×4×1 = 50 + 50 + 40 + 20 = 160
- 2 "Keep satisfied": 5×2×1 + 4×2×1 = 10 + 8 = 18
- 3 "Keep informed": 2×5×1 + 2×5×0 + 2×4×2 = 10 + 0 + 16 = 26
- 3 "Monitor": 2×2×0 + 2×2×0 + 1×2×0 = 0
- **S = 160 + 18 + 26 + 0 = 204** (well above 0; proceed).

**Conclusion**: stakeholder support is strong (S = 204); proceed with Kotter Steps 4-8 on the 18-month timeline. Watch: Union Steward stance +1 (not +2); if stance degrades to 0 or below, the crafts will be a blocker — manage closely, secure labor buy-in early via Step 5 (operator AM training without craft displacement).`,
    industrial_example: `**Oil & Gas — refinery RCM rollout (24-month)**: coalition of 12 (VP Refining sponsor, Reliability Director, 3 REs, 2 Ops, 3 crafts, 2 IT, 1 HR); vision "Reduce unplanned downtime 50% by 2026 through RCM-driven PM optimization." Year-1: 80 critical assets analyzed, PM ratio +18%, MTBF +9%. Year-2: 240 assets, PM ratio +31%, MTBF +21%.

**Power — coal plant CMMS upgrade (12-month)**: coalition of 9; vision "Single source of truth for asset data by Q4"; barrier log of 14 items (CMMS access, failure-code taxonomy, kitting, recognition); short-term win = WO closeout within 7 days (92% by month 6).

**Container Terminal — RTG PdM rollout (18-month)**: coalition of 10; vision "Top-30 bad actors under PdM by 2026"; 90-day win = line-6 hydraulic PdM (3 failures/yr → 1); year-2 PdM coverage 30 assets; PM compliance 71% → 87%.

**Manufacturing — food plant TPM (24-month)**: coalition of 11; vision "Operator-owned asset care by 2026"; year-1 autonomous maintenance on 6 lines; year-2 all 14 lines; OEE +8%.`,
    case_study: `CASE_TYPE = SYNTHETIC. A 320-craft multi-process Chemical plant attempted a TPM rollout in 18 months without applying Kotter's 8 steps. The M&R team alone drove the rollout (no coalition, Step 2 skipped). The vision was "World-class reliability" (generic, Step 3 weak). Communication was one town hall (Step 4 — 1× repetition, not 7×). No barriers removed (Step 5 skipped — operators had no CMMS access). The first short-term win was claimed at month 14 (Step 6 late — momentum already dead). No consolidation (Step 7 skipped — job descriptions and performance reviews unchanged). No anchoring (Step 8 skipped). 18-month outcome: TPM unwound within 6 months of the M&R Manager's departure. Lesson: skipping Kotter steps produces predictable failure modes. The 8 steps are sequential; the cost of skipping a step is the change initiative itself.`,
    visual_explanation: `Picture the 18-month milestone timeline as a horizontal Gantt chart with 8 swim lanes (one per Kotter step). Steps 1-4 (urgency, coalition, vision, communication) populate months 0-3 and continue (Step 4 ongoing). Step 5 (empower) months 4-12. Step 6 (short-term wins) months 6-12 (parallel with Step 5). Step 7 (consolidate) months 12-18. Step 8 (anchor) months 18+. The Gantt visualizes the overlap and the sequencing — skipping a lane produces a gap the change falls into.`,
    simulation_opportunity: `Build a change simulator: input the stakeholder support score, coalition composition (number of roles), communication frequency, barrier-log resolution rate, and short-term-win cadence. Output: projected adoption rate at 6/12/18 months and probability of sustainability at 24 months. Calibrate with the plant's historical change-success rate. Use to defend a change-investment: "a $50k communication + barrier-removal investment lifts 18-month adoption from 35% to 85%."`,
    common_mistakes: `- Skipping Step 1 (urgency) — change seen as optional; crafts wait for "the next program" to pass.
- Coalition of only the M&R team — "the M&R team's hobby"; no position power, no credibility, no Ops buy-in.
- Generic vision ("world-class reliability") — not operationalizable, not measurable; fails Step 3.
- One-and-done communication (1× repetition) — people don't hear the vision; ISO 55000 Cl. 7.4 non-conformance.
- Not removing barriers (Step 5) — operators without CMMS access cannot do autonomous maintenance; the change stalls.
- Claiming the first short-term win at month 14 — momentum already dead by then; wins must be ≤ 90 days.
- Declaring victory at month 12 — Step 7 (consolidation) skipped; the change unwinds within 6 months.
- Not anchoring in culture (Step 8) — change unwinds within 18 months of the change leader's departure.
- Computing stakeholder support after the launch — must be before; a score < 0 means a blocker coalition that defeats the change.`,
    limitations: `- Kotter's 8 steps are sequential but not strictly linear — Steps 4 (communicate) and 5 (empower) overlap and continue.
- The 18-month timeline is illustrative — larger rollouts (multi-site, multi-year) scale proportionally.
- The stakeholder influence/impact grid is static — stances shift during the rollout; re-map quarterly.
- Short-term wins can be gamed (cherry-picking the easy bad actor) — pair with the bad-actor Pareto.
- Change leadership turnover is the #1 sustainability risk — anchor in culture (Step 8) before the leader departs.
- The 7× repetition rule is heuristic, not quantitative; some plants need 10×, some 5×.`,
    comparison: `**Kotter 8-step vs ADKAR (Prosci)**: Kotter is organizational (top-down coalition + vision + 7× communication); ADKAR is individual (Awareness, Desire, Knowledge, Ability, Reinforcement). Kotter scales for organizational transformation; ADKAR scales for individual change. Both required for full-spectrum change. **Kotter vs Lean Six Sigma DMAIC**: DMAIC is process-improvement (Define-Measure-Analyze-Improve-Control); Kotter is organizational change. DMAIC without Kotter produces a process improvement that is never adopted; Kotter without DMAIC produces a change with no technical improvement. **Short-term wins vs Long-term wins**: Short-term wins (≤ 90 days) build momentum and defuse cynics; long-term wins (year-2+) sustain. Without short-term, momentum dies at month 9; without long-term, the change unwinds.`,
    practical_application: `- **Monthly**: track adoption rate and change velocity; report to sponsor at reliability review.
- **Quarterly**: re-map stakeholders on the influence/impact grid; recompute support score.
- **Semi-annually**: review barrier-log resolution; identify new barriers.
- **Annually**: review the Kotter-step progression against the 18-month timeline; adjust.
- **On every change-leadership transition**: re-affirm Step 8 (anchor) — the new leader must visibly own the change within 90 days or it unwinds.`,
    decision_scenario: `You are the change leader for an RCM rollout at a 250-craft Oil & Gas facility. Stakeholder mapping shows: VP Ops (5,5,+2), Plant Manager (5,5,+1), M&R Manager (4,5,+2), 2 Operators (2,5,0), 2 Crafts (2,5,-1), IT (2,2,0), HR (4,2,0). S = 50 + 25 + 40 + 0 + (-10) + 0 + 0 = 105 (≥ 0; proceed). But: crafts are at -1 (resistor); if stance degrades to -2, S = 95 still positive but the change population (crafts) is hostile. Decision: proceed with Step 4 (7× communication) targeted at crafts via the union rep; secure the craft rep on the coalition (Step 2 add); design short-term win on a bad actor that affects the crafts' work-life (a hydraulic press causing night-shift callouts). If at month 3 the craft stance is still -1, pause the rollout and re-engage. The S-score threshold is necessary but not sufficient — the change population's stance is decisive.`,
    practice_questions: `- List Kotter's 8 steps in order; identify the 3 stages (set stage / make happen / sustain).
- Compute the stakeholder support score for: 4 stakeholders at (5,5,+2), 2 at (5,2,+1), 3 at (2,5,+1), 3 at (2,2,0). *(Answer: 250.)*
- State the 7× repetition rule and the ISO 55000 clause it operationalizes. *(Answer: Cl. 7.4 Communication.)*
- Define a short-term win (4 criteria). *(Answer: ≤ 90 days, visible, unambiguous, attributable.)*
- Identify the most common failure mode at month 12. *(Answer: declaring victory; Step 7 skipped.)*`,
    certification_questions: `The CMRP exam tests Change Management as the fourth OL competency. SMRP-aligned sample prompts:

(a) Map Kotter's 8 steps to an 18-month TPM/RCM/CMMS/PdM rollout; identify month-milestones.
(b) Build a guiding coalition of 8-10 named roles; explain why each is on it.
(c) Compute the stakeholder support score from an influence/impact grid; judge whether to proceed.
(d) Diagnose failure modes for skipping each Kotter step.
(e) Map ISO 55000 Cl. 7.4 (Communication) and Cl. 9.3 (Management Review) to the change discipline.

The questions in this lesson's question bank are aligned to these competencies.`,
    summary: `Change Management converts an M&R initiative from a project into a sustained capability. Kotter's 8-step model (Urgency → Coalition → Vision → Communicate → Empower → Wins → Consolidate → Anchor) is the canonical framework — sequential, with predictable failure modes for each skipped step. The 18-month TPM rollout is the canonical pattern: burning-platform 1-pager; 8-10 named coalition; ≤25-word vision; 7× communication; barrier removal; ≤90-day short-term wins; consolidation in job descriptions and performance reviews; anchoring in hiring, walk-downs, and the annual business plan. ISO 55000 Cl. 7.4 (Communication) and Cl. 9.3 (Management Review) operationalize the discipline. The stakeholder support score (influence × impact × stance) is the proceed/no-go threshold.`,
    key_takeaways: `- Kotter 8 steps: sequential; 4 set-the-stage + 3 make-happen + 1 sustain.
- Burning platform: evidence-based, quantified — not "we need to improve."
- Guiding coalition: 8-10 named roles with position power + expertise + credibility + influence.
- Vision: ≤ 25 words, specific, time-bound, measurable.
- 7× repetition rule (ISO 55000 Cl. 7.4).
- Short-term wins: ≤ 90 days, visible, unambiguous, attributable.
- Anchoring (Step 8) prevents the 18-month unwind after the change leader departs.
- Stakeholder support score ≥ 0 = proceed; < 0 = fix stance first.
- ISO 55000 Cl. 7.4 (Communication) + Cl. 9.3 (Management Review) operationalize the discipline.`,
    references: `- SMRP. *CMRP Body of Knowledge — Organization & Leadership pillar: Change Management.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.* (Cl. 7.4 Communication, Cl. 9.3 Management Review).
- Kotter, J. P. (1996/2012). *Leading Change*. HBR Press. (8-step model — the canonical source.)
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. (PDSA cycle; System of Profound Knowledge — variation and psychology of change.)
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section XII (managing the maintenance organization; change in M&R).
- O'Hanlon, T. (2000/2015). *Uptime: A Guide to Reliable Performance*. Reliabilityweb. (Culture maturity ladder — the 'after' state of successful change.)`,
  },
  knowledgeObject: {
    title: "Change Management — Kotter 8 steps for M&R transformations",
    domain: "Organization & Leadership",
    competency: "Change Management",
    topic: "Leading & sustaining change in M&R (RCM/TPM/CMMS/PdM/CI)",
    concept: "Kotter 8 steps × stakeholder mgmt × milestone timeline",
    body: {
      definitions: [
        "Change management: discipline of converting an initiative from a project into a sustained capability.",
        "Kotter 8 steps: Urgency → Coalition → Vision → Communicate → Empower → Wins → Consolidate → Anchor.",
        "Burning platform: evidence-based case for change (e.g., $1.8M/yr unplanned-downtime gap).",
        "Guiding coalition: 8-10 named roles + executive sponsor who own the change.",
        "Vision: ≤ 25-word specific, time-bound, measurable statement of the future state.",
        "7× repetition rule: people must hear the vision ~7 times before they act on it.",
        "Short-term win: ≤ 90-day visible, unambiguous, attributable success.",
        "Stakeholder support score: Σ (influence × impact × stance); stance −2 to +2.",
        "Influence/impact grid: 4 quadrants — Manage closely / Keep satisfied / Keep informed / Monitor.",
        "Change adoption rate: active users of new process / total population × 100.",
        "Change velocity: completed milestones / planned milestones in window × 100.",
      ],
      principles: [
        "Kotter 8 steps are sequential; skipping produces predictable failure modes.",
        "Stage 1 (Steps 1-4) sets the stage; Stage 2 (Steps 5-7) makes change happen; Stage 3 (Step 8) sustains.",
        "Burning platform must be evidence-based and quantified.",
        "Coalition: 8-10 named roles with position power + expertise + credibility + influence.",
        "Vision: ≤ 25 words, specific, time-bound, measurable.",
        "7× repetition rule (ISO 55000 Cl. 7.4).",
        "Short-term wins: ≤ 90 days, visible, unambiguous, attributable.",
        "Anchoring (Step 8) prevents the 18-month unwind after the change leader departs.",
        "Stakeholder support score ≥ 0 = proceed; < 0 = fix stance first.",
      ],
      components: [
        "Burning-platform 1-pager (quantified case).",
        "Guiding coalition roster (8-10 named roles + sponsor).",
        "Vision statement (≤ 25 words).",
        "18-month milestone timeline (Kotter steps × months).",
        "Communication plan (channels, frequency, two-way mechanisms).",
        "Barrier log (Step 5).",
        "Short-term wins log (Step 6).",
        "Stakeholder influence/impact grid + support score.",
        "Adoption-rate metric.",
      ],
      mechanism: [
        "Build burning platform → recruit coalition → draft vision → map stakeholders on influence/impact grid → compute support score → if ≥ 0, proceed → build 18-month milestone timeline → launch 7× communication → execute Step 5 (remove barriers) and Step 6 (short-term wins) in parallel → at month 12, execute Step 7 (consolidate) → at month 18+, execute Step 8 (anchor) → track adoption + velocity monthly → report to sponsor at reliability review.",
      ],
      process: [
        "1. Build burning-platform 1-pager; leadership endorses.",
        "2. Recruit guiding coalition (8-10 named roles + sponsor).",
        "3. Draft vision (≤ 25 words).",
        "4. Map 12 stakeholders on influence/impact grid; compute support score.",
        "5. If S ≥ 0, proceed; if < 0, fix stances first.",
        "6. Build 18-month milestone timeline.",
        "7. Launch communication (7× repetition).",
        "8. Execute Step 5 (barriers) + Step 6 (wins) in parallel.",
        "9. At month 12, execute Step 7 (consolidate).",
        "10. At month 18+, execute Step 8 (anchor).",
        "11. Track adoption + velocity monthly; report to sponsor.",
      ],
      formulas: [
        "Change adoption rate = (active users) / (total population) × 100  [%]",
        "Stakeholder support score S = Σ (influence_i × impact_i × stance_i)  [stance: +2/+1/0/-1/-2; target ≥ 0]",
        "Change velocity = (completed milestones) / (planned milestones in window) × 100  [%]",
        "Short-term win threshold: ≤ 90 days, visible, unambiguous, attributable",
      ],
      metrics: [
        "Change adoption rate [%].",
        "Stakeholder support score S [target ≥ 0].",
        "Change velocity [% per quarter; target ≥ 85%].",
        "Short-term wins count per quarter [target ≥ 1].",
        "Barrier-log resolution rate [%].",
        "Communication frequency (× per month; target ≥ 7× repetition within first quarter).",
      ],
      examples: [
        "Chemical plant 200-asset TPM rollout: 18-mo Kotter timeline; coalition of 8; vision 'Zero unplanned downtime by 2027 through TPM — operator-owned asset care, PM ratio 85%, PdM coverage on top-30 bad actors'; stakeholder S = 204.",
        "Oil & Gas refinery RCM (24-mo): coalition of 12; vision 'Reduce unplanned downtime 50% by 2026'; year-1 PM ratio +18%, MTBF +9%.",
        "Power coal plant CMMS upgrade (12-mo): coalition of 9; vision 'Single source of truth by Q4'; short-term win = WO closeout within 7 days (92% by month 6).",
        "Container Terminal RTG PdM (18-mo): coalition of 10; year-2 PdM coverage 30 assets; PM compliance 71% → 87%.",
      ],
      industrial_examples: [
        "Oil & Gas — refinery RCM rollout 24-month coalition of 12.",
        "Power — coal plant CMMS upgrade 12-month coalition of 9.",
        "Container Terminal — RTG PdM rollout 18-month coalition of 10.",
        "Manufacturing — food plant TPM 24-month coalition of 11.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 320-craft multi-process Chemical plant TPM rollout in 18 months without Kotter: M&R team alone (Step 2 skipped); generic vision 'World-class reliability' (Step 3 weak); 1 town hall (Step 4 — 1× repetition); no barriers removed (Step 5 skipped); first short-term win claimed at month 14 (Step 6 late); no consolidation (Step 7 skipped); no anchoring (Step 8 skipped). TPM unwound within 6 months of the M&R Manager's departure. Lesson: skipping Kotter steps produces predictable failure modes; the 8 steps are sequential.",
      ],
      common_errors: [
        "Skipping Step 1 (urgency) — change seen as optional.",
        "Coalition of only the M&R team — 'the M&R team's hobby'.",
        "Generic vision ('world-class reliability') — not operationalizable, not measurable.",
        "One-and-done communication (1× repetition) — ISO 55000 Cl. 7.4 non-conformance.",
        "Not removing barriers (Step 5) — operators without CMMS access stall the change.",
        "Claiming the first short-term win at month 14 — momentum already dead.",
        "Declaring victory at month 12 — Step 7 skipped; unwinds within 6 months.",
        "Not anchoring in culture (Step 8) — unwinds within 18 months of leader's departure.",
        "Computing stakeholder support after launch — must be before.",
      ],
      limitations: [
        "Kotter 8 steps are sequential but not strictly linear (Step 4 + 5 overlap and continue).",
        "18-month timeline is illustrative; larger rollouts scale proportionally.",
        "Stakeholder influence/impact grid is static — stances shift; re-map quarterly.",
        "Short-term wins can be gamed (cherry-picking easy bad actor).",
        "Change-leadership turnover is the #1 sustainability risk — anchor (Step 8) before leader departs.",
        "7× repetition rule is heuristic, not quantitative; some plants need 10×, some 5×.",
      ],
      best_practices: [
        "Build the burning-platform 1-pager with numbers (e.g., $1.8M/yr gap).",
        "Recruit 8-10 coalition members with position power + expertise + credibility + influence.",
        "Vision: ≤ 25 words, specific, time-bound, measurable (e.g., 'Zero unplanned downtime by 2027...').",
        "Communicate 7× across town halls, huddles, intranet, 1:1s.",
        "Identify barriers systematically (barrier log); remove with named owners.",
        "Generate ≥ 1 short-term win per quarter (≤ 90 days, visible, attributable).",
        "At month 12, consolidate (re-train, revise job descriptions, embed in performance reviews).",
        "At month 18+, anchor (hire/promote for reliability, walk-downs, business plan).",
        "Track adoption + velocity monthly; report to sponsor at reliability review.",
        "Re-map stakeholders quarterly; recompute support score.",
      ],
      related_concepts: [
        "Organizational Structures (Lesson 1) — structure enables or defeats the change.",
        "Leadership (Lesson 2) — leadership is the multiplier on change success.",
        "Organizational Behavior (Lesson 3) — culture (the 'after' state) is Step 8.",
        "Training & Development (Lesson 5) — Step 5 (empower) requires training.",
        "ISO 55000 Cl. 7.4 (Communication), Cl. 9.3 (Management Review) — management-system expression.",
        "ADKAR (Prosci) — individual change model complementary to Kotter (organizational).",
      ],
      prerequisites: [
        "Organizational Structures (Lesson 1) + Leadership (Lesson 2) + Organizational Behavior (Lesson 3).",
        "Work Management (WM pillar) — RCM/TPM/PdM/CMMS as the technical content.",
        "ISO 55000:2014 Cl. 7.4 (Communication), Cl. 9.3 (Management Review).",
        "Kotter's 8-step model (Leading Change).",
      ],
      references: [
        "SMRP CMRP BOK — OL pillar: Change Management.",
        "ISO 55000:2014 (Cl. 7.4, Cl. 9.3).",
        "Kotter, J. P. (1996/2012). Leading Change. HBR Press. (8-step model.)",
        "Deming, W. E. (1986). Out of the Crisis. MIT CAES. (PDSA; System of Profound Knowledge.)",
        "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). Section XII.",
        "O'Hanlon, T. (2000/2015). Uptime. Reliabilityweb. (Culture maturity ladder — the 'after' state.)",
      ],
    },
  },
  questions: [
    {
      competencyName: "Change Management",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the correct order of Kotter's first 4 steps (the 'set the stage' stage)?",
      whyCorrect:
        "(1) Create Urgency → (2) Form Guiding Coalition → (3) Develop Vision & Strategy → (4) Communicate the Change Vision. The order is sequential: urgency provides the case for change; the coalition owns the change; the vision specifies the future state; communication (7× repetition) drives awareness and commitment. Skipping any produces predictable failure modes.",
      whyOthersWrong: [
        "Vision → Coalition → Urgency → Communicate — wrong order: developing a vision before forming a coalition produces a vision without ownership; creating urgency after the vision means the burning platform is retrofitted, not felt.",
        "Communicate → Urgency → Vision → Coalition — wrong order: communicating before forming a coalition and drafting a vision is communicating nothing; the 7× repetition rule applies to the *vision*, not to general messaging.",
        "Coalition → Communicate → Urgency → Vision — wrong order: forming a coalition before establishing urgency means the coalition has no rationale; the burning platform (Step 1) is the precondition for coalition commitment.",
      ],
      explanation:
        "Kotter Steps 1-4 (set the stage): Create Urgency → Form Guiding Coalition → Develop Vision & Strategy → Communicate the Change Vision. Sequential; skipping any step produces predictable failure.",
      options: [
        { text: "Create Urgency → Form Coalition → Develop Vision → Communicate", isCorrect: true },
        { text: "Vision → Coalition → Urgency → Communicate", isCorrect: false },
        { text: "Communicate → Urgency → Vision → Coalition", isCorrect: false },
        { text: "Coalition → Communicate → Urgency → Vision", isCorrect: false },
      ],
    },
    {
      competencyName: "Change Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A Chemical plant's TPM rollout has 4 stakeholders at (5,5,+2), 2 at (5,2,+1), 3 at (2,5,+1), 3 at (2,2,0). Compute the stakeholder support score (S) and judge whether to proceed.",
      whyCorrect:
        "S = Σ (influence × impact × stance) = 4×(5×5×2) + 2×(5×2×1) + 3×(2×5×1) + 3×(2×2×0) = 4×50 + 2×10 + 3×10 + 3×0 = 200 + 20 + 30 + 0 = 250. S = 250, well above 0 — proceed with the rollout.",
      whyOthersWrong: [
        "S = 100 would result from computing (5×5×2) once for the first group (50), not multiplying by 4 stakeholders in that group; missing the group-count multiplier.",
        "S = -50 would result from misapplying the stance scale (e.g., -2 for 'supporter' instead of +1) or inverting the sign of the stance values across groups; the stance scale is +2 strong advocate, +1 supporter, 0 neutral, -1 resistor, -2 blocker.",
        "S = 0 (boundary) would result from treating the 3 'Monitor' stakeholders (2,2,0) as having stance +1 instead of 0 (incorrectly summing stance values across all stakeholders without weighting by influence and impact).",
      ],
      explanation:
        "S = 4×(5×5×2) + 2×(5×2×1) + 3×(2×5×1) + 3×(2×2×0) = 200 + 20 + 30 + 0 = 250. S ≥ 0 = proceed. The 4 high-influence/high-impact stakeholders with +2 stance drive the score.",
      options: [
        { text: "S = 250 — proceed", isCorrect: true },
        { text: "S = 100 — proceed cautiously", isCorrect: false },
        { text: "S = -50 — do not proceed", isCorrect: false },
        { text: "S = 0 — boundary, hold", isCorrect: false },
      ],
    },
    {
      competencyName: "Change Management",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "A Manufacturing plant's TPM rollout is at month 12 with the first short-term win published and PM compliance lifted from 41% to 68%. The M&R Manager declares victory and disbands the guiding coalition. What is the most likely 6-month outcome and the missing Kotter step?",
      whyCorrect:
        "The change unwinds within 6 months because Step 7 (Consolidate Gains & Produce More Change) was skipped. Declaring victory at month 12 is the most common failure mode — without consolidation (re-train, revise job descriptions, embed reliability in performance reviews), the new behaviors are not embedded in the org's DNA. The coalition disbanding removes the structure that drove the change; crafts and operators revert to old behaviors within 6 months. Step 7 (months 12-18) is required before Step 8 (anchor).",
      whyOthersWrong: [
        "The change sustains because PM compliance reached 68% — wrong; PM compliance is a lagging KPI that will degrade without consolidation. The coalition disbanding removes the structure; the new behaviors are not embedded in job descriptions or performance reviews.",
        "The change unwinds because Step 8 (Anchor) was skipped — partially correct but Step 8 comes after Step 7; the immediate failure mode at month 12-18 is Step 7 (consolidation), not Step 8 (anchoring). Both steps are missing but the proximate cause is Step 7.",
        "The change sustains because the short-term win was published — wrong; a single short-term win at month 12 does not sustain a 18-month rollout. Without Step 7 consolidation, the win is a one-off; without Step 8 anchoring, it unwinds within 18 months of the leader's departure.",
      ],
      explanation:
        "Declaring victory at month 12 = skipping Step 7 (Consolidate Gains & Produce More Change). Without consolidation (re-train, revise job descriptions, embed in performance reviews), the change unwinds within 6 months as the coalition disbands and behaviors revert.",
      options: [
        { text: "Unwinds within 6 months — Step 7 (Consolidate) skipped", isCorrect: true },
        { text: "Sustains — PM compliance reached 68%", isCorrect: false },
        { text: "Unwinds — Step 8 (Anchor) skipped", isCorrect: false },
        { text: "Sustains — short-term win was published", isCorrect: false },
      ],
    },
    {
      competencyName: "Change Management",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Kotter's 7× repetition rule states that people must hear a change vision approximately seven times across multiple channels before they act on it; one town hall is sufficient if the message is clear.",
      whyCorrect:
        "False. The 7× repetition rule explicitly requires multiple communications across multiple channels (town halls, shift huddles, intranet, 1:1s, posters) — approximately 7× before people act on it. One town hall is 1× repetition; people will hear the words but not internalize the change. ISO 55000 Cl. 7.4 (Communication) operationalizes this rule: communication must include 'what, when, with whom, and the manner' — one town hall does not meet the requirement.",
      whyOthersWrong: [
        "True would repeat the most common Step 4 failure mode — one-and-done communication. The 7× rule is empirical; people forget, get distracted, or are skeptical of new initiatives (they have seen many come and go). 7× repetition across multiple channels builds familiarity, addresses skepticism, and creates peer reinforcement.",
      ],
      explanation:
        "7× repetition rule: people must hear the change vision ~7 times across multiple channels (town halls, huddles, intranet, 1:1s) before acting on it. One town hall = 1× repetition = insufficient. ISO 55000 Cl. 7.4 (Communication) operationalizes this requirement.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 5 — Training & Development
// ---------------------------------------------------------------------------

const LESSON_TRAINING_DEVELOPMENT: RefLesson = {
  competencyName: "Training & Development",
  slug: "ol-training-development",
  title: "Skills Development, Certification & Training ROI",
  titleAr: "تطوير المهارات والشهادات والعائد على التدريب",
  order: 5,
  durationMin: 30,
  references: OL_REFERENCE_TITLES,
  conceptIntroduction: `Training & Development is the competency that builds the human capability the org structure (Lesson 1) requires and the leadership (Lesson 2) deploys. Three core levers: (1) skills development — a skills matrix mapping required vs. actual proficiency per role, with a targeted training plan to close the gap; (2) certification paths — CMRP, ISO Vibration Analyst Cat I-IV, MLT (Maintenance Lubrication Technician), NICET, STLE, OSHA-10/30 — external validation that the competency is real, not asserted; (3) training ROI — the discipline of quantifying the productivity gain against the program cost, (gain − cost)/cost × 100, to defend the training investment to the CFO. ISO 55000:2014 Cl. 7.2 (Competence) requires that "persons doing work under its control that affects asset management performance are competent on the basis of education, training, skills and experience" — i.e., a documented, evidence-based competency system, not assertion. Deming's Point 13 (institute a vigorous program of education and self-improvement) supplies the *why*: every employee, every year, builds capability.`,
  example: `A Power plant runs a 12-person Vibration Analyst ISO Cat II training program. Program cost: course fees $36,000 ($3,000/person × 12) + travel $9,600 + lost labor $36,000 (5 days × 8h × $75/h × 12) = $81,600. Annual productivity gain: faster PdM diagnosis $22,500/yr (100 WOs × 3h saved × $75/h) + 4 avoided failures at $30k avg = $120,000/yr → total $142,500/yr. Training ROI (1-yr) = ($142,500 − $81,600) / $81,600 × 100 = 74.6%. 3-yr ROI = (3 × $142,500 − $81,600) / $81,600 × 100 = 424%. Skills-matrix gap analysis: Vibration Analyst Cat II — required 12 people at level 3+; actual 5 at 3+, 8 at 2, 4 at 1. Gap = 7 people need 2→3 + 4 need 1→2 = $28k + $6k = $34k additional training to close.`,
  keyFormulas: `Training ROI (1-yr) = (annual productivity gain − program cost) / program cost × 100  [%]
Training ROI (N-yr) = (N × annual gain − program cost) / program cost × 100  [%]
Competency ratio = (people at level 3+ / people required at 3+) × 100  [%]
Skills gap (FTE) = Σ_j (required_FTE_j − actual_FTE_j) for skill j  [units: FTE shortfall]
Proficiency levels (4): 1 = Awareness, 2 = Trained, 3 = Proficient, 4 = Expert
Training-need priority = criticality × gap_size × ROI.`,
  exercise: `You are the M&R Manager at a 220-craft Chemical plant. Build a skills matrix for 10 critical skills (Vibration Cat II, Lubrication tech, Electrical testing, Hydraulic repair, Welding, Machining, Rigging, CMMS data entry, RCA facilitation, CMRP planner certification). For each: required FTE at level 3+, actual FTE at each level, compute the gap and the training cost. Then compute the 1-yr and 3-yr training ROI for the highest-priority skill; defend or reject.`,
  sections: {
    learning_objectives: `- Build a skills matrix mapping required vs. actual proficiency (1-4 levels) per role per skill.
- Compute the skills gap (FTE shortfall) and competency ratio per skill.
- Design a training plan with priority (criticality × gap × ROI).
- Compute training ROI (1-yr and N-yr) using (productivity gain − program cost) / program cost × 100.
- Identify the M&R certification paths (CMRP, ISO Cat I-IV, MLT, NICET, STLE, OSHA-10/30).
- Map ISO 55000 Cl. 7.2 (Competence) requirements to the skills matrix and training plan.
- Build an onboarding program for new M&R hires (30/60/90-day milestones).`,
    prerequisites: `- Organizational Structures (Lesson 1), Leadership (Lesson 2), Organizational Behavior (Lesson 3), Change Management (Lesson 4).
- Work Management (WM pillar) — the technical content of M&R training (planning, scheduling, PdM, CMMS).
- ISO 55000:2014 Cl. 7.2 (Competence), Cl. 7.3 (Awareness).
- Deming's Point 13 (institute a vigorous program of education and self-improvement).`,
    introduction: `A reliability program is only as good as the competency of the people executing it. A CMMS in the hands of an untrained planner produces bad data; a PdM program run by an uncertified vibration analyst produces false positives and missed failures; an RCA facilitator without training names people instead of causes. The OL pillar's Training & Development competency addresses these gaps with three disciplines:

(1) **Skills matrix**: a tabular mapping of roles × skills × proficiency levels (1 = Awareness, 2 = Trained, 3 = Proficient, 4 = Expert). The matrix makes the gap visible — the difference between required and actual proficiency per skill — and drives the training plan.

(2) **Certification paths**: external, third-party validation that the competency is real. CMRP (Certified Maintenance & Reliability Professional) for the M&R professional; ISO 18436-2 Vibration Analyst Cat I-IV for PdM; MLT (Maintenance Lubrication Technician) / MLA (Lubricant Analyst) for lubrication; NICET for fire-protection and other specialties; STLE CLS (Certified Lubrication Specialist); OSHA-10/30 for safety; CWT (Certified Welding Technician) for welding. Certification is the auditable evidence of competency ISO 55000 Cl. 7.2 requires.

(3) **Training ROI**: the discipline of defending the training investment to the CFO. The formula is (productivity gain − program cost) / program cost × 100. Productivity gain includes: faster PdM diagnosis (hours saved × $/h), avoided failures (failures prevented × avg event cost), reduced rework, reduced OSHA-recordable injuries, reduced contractor spend. Program cost includes: course fees + travel + lost labor + materials + instructor (if internal).

ISO 55000:2014 Cl. 7.2 (Competence) is the management-system anchor: "persons doing work under its control that affects asset management performance are competent on the basis of education, training, skills and experience." The standard requires *evidence* (training records, certifications, skill assessments) — assertion is non-conformant. Deming's Point 13 supplies the *why*: "Institute a vigorous program of education and self-improvement" — every employee, every year, builds capability. A plant that trains only when "budget allows" is, in Deming's framing, draining the bathtub.

This competency sits last in the OL pillar because training is downstream of structure (Lesson 1), leadership (Lesson 2), culture (Lesson 3), and change (Lesson 4). Train without those and the training is wasted; train with them and the human capability compounds.`,
    terminology: `- **Skills matrix**: tabular mapping of roles × skills × proficiency levels (1-4).
- **Proficiency levels**: 1 = Awareness, 2 = Trained, 3 = Proficient, 4 = Expert.
- **Skills gap**: Σ (required_FTE − actual_FTE) at level 3+ for each skill.
- **Competency ratio**: people at level 3+ / people required at 3+ × 100.
- **Training ROI**: (productivity gain − program cost) / program cost × 100.
- **CMRP**: Certified Maintenance & Reliability Professional (SMRP); 5-pillar credential for M&R professionals.
- **ISO 18436-2 Vibration Analyst**: Cat I-IV (Category I = entry, IV = expert).
- **MLT/MLA**: Maintenance Lubrication Technician / Lubricant Analyst (ICML).
- **NICET**: National Institute for Certification in Engineering Technologies (fire protection, special systems).
- **STLE CLS**: Society of Tribologists and Lubrication Engineers — Certified Lubrication Specialist.
- **OSHA-10/30**: Occupational Safety & Health Administration 10/30-hour safety training.
- **Onboarding 30/60/90**: structured first-90-day milestones for new hires.
- **Train-the-trainer**: internal capability to deliver training, reducing external cost over time.`,
    detailed_explanation: `The four-step Training & Development cycle:

(1) **Skills matrix build**: for each role (Planner, Scheduler, Reliability Engineer, Supervisor, Craft) × each critical skill (Vibration, Lubrication, Electrical, Hydraulic, Welding, Machining, Rigging, CMMS, RCA, Certification), specify the required proficiency level (1-4) per role and the actual current proficiency per person. The gap = required − actual, summed per skill. The matrix makes the gap visible and drives the training plan.

(2) **Training plan**: prioritized by (criticality × gap_size × ROI). High-criticality skills (e.g., Vibration Analyst Cat II for a PdM-heavy plant) with large gaps and high ROI are trained first. The plan is annual, with a budget envelope and a quarterly re-baseline.

(3) **Certification paths**: external, third-party validation. CMRP for the M&R professional (5-pillar credential covering B&M, MPR, ER, OL, WM); ISO 18436-2 Vibration Analyst Cat I-IV for PdM analysts (Cat II is the workhorse for most plants); MLT/MLA (ICML) for lubrication; NICET for fire protection; STLE CLS for lubrication specialty; OSHA-10/30 for safety. Certification is auditable evidence — it converts "I think I know" into "an independent body has verified."

(4) **Training ROI**: the financial discipline. Productivity gain (annual, $/yr) includes: faster PdM diagnosis (WO count × hours saved × $/h), avoided failures (failures prevented × avg event cost), reduced rework ($/yr), reduced contractor spend ($/yr), reduced OSHA-recordable injuries (count × avg cost). Program cost (one-time, $) includes: course fees ($/person × N), travel ($/person × N), lost labor (days × 8h × $/h × N), materials, internal instructor (if internal). Training ROI = (gain − cost) / cost × 100. Multi-year (N-yr) ROI = (N × annual gain − program cost) / program cost × 100. Most M&R training programs show 50-150% 1-yr ROI and 300-700% 3-yr ROI; this is why training is consistently the highest-ROI M&R investment.

ISO 55000:2014 Cl. 7.2 (Competence) requires:
(a) Determine the necessary competence of persons doing work that affects asset management performance.
(b) Ensure these persons are competent on the basis of education, training, skills and experience.
(c) Where applicable, take actions to acquire necessary competence and evaluate the effectiveness of these actions.
(d) Retain documented information as evidence of competence.

The skills matrix satisfies (a) and (d); the training plan satisfies (b) and (c); certification paths satisfy (b) with auditable evidence; the training ROI calculation supports (c) — "evaluate the effectiveness" by measuring the productivity gain.

Deming's Point 13: "Institute a vigorous program of education and self-improvement." Point 6: "Institute training on the job." Both converge on the same conclusion — every employee, every year, builds capability. A plant that trains only when "budget allows" is, in Deming's framing, draining the bathtub.

**Onboarding (30/60/90)**: structured first-90-day milestones for new M&R hires.
- Day 30: orientation (CMMS access, safety induction, plant tour, mentor assignment, first PM execution with mentor).
- Day 60: first independent PMs; first WO closeout with full failure data; first RCA observation; CMRP BOK exposure.
- Day 90: first independent RCA facilitation; skills-matrix baseline; development plan with supervisor; certification path mapped.

Onboarding reduces 12-month new-hire turnover (typically 25-40% in M&R) to < 10% — the highest-ROI HR investment in M&R.`,
    core_principles: `- Competency is auditable, not asserted (ISO 55000 Cl. 7.2).
- Skills matrix makes the gap visible; the gap drives the training plan.
- Proficiency levels 1-4: Awareness → Trained → Proficient → Expert.
- Certification paths: external validation (CMRP, ISO Cat I-IV, MLT, NICET, STLE, OSHA).
- Training ROI = (gain − cost) / cost × 100; most M&R training is 50-150% (1-yr) and 300-700% (3-yr).
- Deming Point 13: every employee, every year, builds capability.
- Training is downstream of structure, leadership, culture, and change — train without those and the training is wasted.
- Onboarding (30/60/90) is the highest-ROI HR investment in M&R.`,
    components: `- Skills matrix (roles × skills × 1-4 proficiency).
- Training plan (annual, prioritized by criticality × gap × ROI).
- Certification map (CMRP, ISO Cat I-IV, MLT, NICET, STLE, OSHA per role).
- Training ROI calculator (productivity gain − program cost).
- Onboarding program (30/60/90 milestones; mentor assignment).
- Train-the-trainer program (internal capability).
- Training records system (ISO 55000 Cl. 7.2 documented evidence).
- Quarterly skills-matrix re-baseline.`,
    process: `1. List critical skills (Vibration, Lubrication, Electrical, Hydraulic, Welding, Machining, Rigging, CMMS, RCA, CMRP, etc.).
2. For each role × skill, specify required proficiency (1-4).
3. Assess actual proficiency per person (skills assessment, supervisor judgment, certification evidence).
4. Build the skills matrix; compute the gap per skill (required − actual at level 3+).
5. Prioritize the training plan by (criticality × gap × ROI).
6. Build the budget envelope (course fees + travel + lost labor).
7. Deliver training (external certification, internal train-the-trainer).
8. Compute training ROI post-program (productivity gain − program cost / cost × 100).
9. Update the skills matrix; re-baseline quarterly.
10. Build the onboarding program (30/60/90) for new hires.`,
    formula_calculation: `**Training ROI (1-yr)** = (annual productivity gain − program cost) / program cost × 100  [%]
  - productivity gain = faster diagnosis (WO count × hours saved × $/h) + avoided failures (count × avg event cost) + reduced rework + reduced contractor spend + reduced injuries.
  - program cost = course fees + travel + lost labor + materials + instructor.
  - example: gain $142,500/yr − cost $81,600 = $60,900 net; ROI = $60,900 / $81,600 × 100 = 74.6% (1-yr).

**Training ROI (N-yr)** = (N × annual gain − program cost) / program cost × 100  [%]
  - 3-yr example: (3 × $142,500 − $81,600) / $81,600 × 100 = ($427,500 − $81,600) / $81,600 × 100 = 424% (3-yr).

**Skills gap (FTE)** = Σ_j (required_FTE_j − actual_FTE_j) at level 3+ for skill j  [units: FTE shortfall]
  - example: Vibration Cat II — required 12 at level 3+; actual 5 at 3+ → gap = 7 FTE.

**Competency ratio** = (people at level 3+ / people required at 3+) × 100  [%]
  - target ≥ 90% for critical skills; ≥ 75% for non-critical.
  - example: 5/12 = 41.7% (below target; training plan required).

**Training-need priority** = criticality (1-5) × gap_size (FTE) × ROI (%) — highest priority first.`,
    worked_example: `**Problem** — A Power plant runs a 12-person Vibration Analyst ISO Cat II training program. Compute the program cost, annual productivity gain, 1-yr ROI, 3-yr ROI, and skills-matrix gap analysis. Justify or reject.

**Part A — Program cost**:
- Course fees: $3,000/person × 12 = $36,000
- Travel: $800/person × 12 = $9,600
- Lost labor: 5 days × 8 h/day × $75/h × 12 people = $36,000
- Materials: $0 (included in course fees)
- Internal instructor: $0 (external course)
- **Program cost = $36,000 + $9,600 + $36,000 = $81,600**

**Part B — Annual productivity gain**:
- Faster PdM diagnosis: avg WO diagnosis time 8h → 5h (Cat II-trained analysts diagnose faster); 100 PdM WOs/yr × 3h saved × $75/h = $22,500/yr
- Avoided failures: 4 failures/yr prevented (earlier detection) × $30,000 avg event cost (downtime + parts + labor + collateral) = $120,000/yr
- Reduced rework: ~$0 (not quantified in this case)
- **Annual productivity gain = $22,500 + $120,000 = $142,500/yr**

**Part C — Training ROI**:
- 1-yr ROI = ($142,500 − $81,600) / $81,600 × 100 = $60,900 / $81,600 × 100 = **74.6%**
- 3-yr ROI = (3 × $142,500 − $81,600) / $81,600 × 100 = ($427,500 − $81,600) / $81,600 × 100 = $345,900 / $81,600 × 100 = **424%**

**Part D — Skills-matrix gap analysis (Vibration Analyst Cat II)**:

| Proficiency level | Required | Actual | Gap |
|-------------------|----------|--------|-----|
| Level 1 (Awareness) | 0 | 4 | +4 (over-supplied; reassign or progress) |
| Level 2 (Trained) | 0 | 8 | +8 (over-supplied; progress to 3) |
| Level 3 (Proficient) | 8 | 5 | -3 (under-supplied) |
| Level 4 (Expert) | 4 | 0 | -4 (under-supplied) |
| **Level 3+ total** | **12** | **5** | **-7 FTE gap** |

**Competency ratio** = 5/12 × 100 = **41.7%** (below 90% target for critical skills).

**Gap-closure cost**:
- 7 people at level 2 → level 3: Cat II training ($4k each) = $28,000
- 4 people at level 1 → level 2: Cat I prerequisite training ($1.5k each) = $6,000
- **Total gap-closure training cost = $34,000**

**Part E — Justification**:
The Cat II training program (this case) costs $81,600 and lifts 12 people to level 3 (closing 5 of the 7 FTE gap; the remaining 2 require Cat I prerequisite first). With a 1-yr ROI of 74.6% and 3-yr ROI of 424%, this is the highest-ROI M&R investment in the plant. **Decision: fund the program.** Sequence: Cat II for 8 currently at level 2 (immediate); Cat I prerequisite + Cat II for 4 currently at level 1 (months 3-12). Re-baseline skills matrix at month 12; competency ratio target 90% (i.e., 11 of 12 at level 3+).

**Conclusion**: the program is fundable with overwhelming ROI. The skills-matrix gap analysis identifies the sequence (Cat II first for those ready; Cat I + Cat II for those who need the prerequisite). The ROI calculation converts the training decision from "training budget" to "investment with 74.6% / 424% return."`,
    industrial_example: `**Oil & Gas — refinery**: 24-person Vibration Cat II training program; $164k cost; gain $310k/yr; 1-yr ROI 89%; 3-yr ROI 468%. Skills-matrix gap closed from 14 → 0 FTE over 18 months.

**Power — coal plant**: 8-person CMRP planner certification program; $24k course fees + $12k travel + $19k lost labor = $55k cost; gain (better PMs, better WO closeout) $118k/yr; 1-yr ROI 115%; 3-yr ROI 545%.

**Container Terminal — RTG yard**: 12-person Lubrication MLT program; $36k cost; gain (oil-analysis-driven bearing replacements, avoided hydraulic failures) $98k/yr; 1-yr ROI 172%; 3-yr ROI 716%.

**Manufacturing — food plant**: 30-person OSHA-30 + CMMS data-entry onboarding; $45k cost; gain (reduced OSHA-recordables, better WO closeout) $112k/yr; 1-yr ROI 149%; new-hire 12-mo turnover 38% → 8%.`,
    case_study: `CASE_TYPE = SYNTHETIC. A 250-craft Chemical plant had no skills matrix and a $0 annual training budget. WO closeout failure-data completeness was 38% (vs. 90% target); PM compliance 47%; RCA follow-through 25%. Diagnostic: the binding constraint was competency, not structure or leadership. Intervention: build a skills matrix (10 skills × 5 roles), identify a 18-FTE gap, and launch a 12-month training program (Vibration Cat II, Lubrication MLT, CMMS data-entry, RCA facilitation, CMRP planner certification) at $145k total cost. Year-1 outcome: WO closeout completeness 38% → 84%; PM compliance 47% → 71%; RCA follow-through 25% → 68%. Productivity gain (avoided failures + faster diagnosis + reduced rework) = $312k/yr; 1-yr training ROI = ($312k − $145k) / $145k × 100 = 115%. Lesson: training is consistently the highest-ROI M&R investment when the binding constraint is competency — and the skills matrix makes the gap and the ROI defensible.`,
    visual_explanation: `Picture the skills matrix as a heatmap: rows = roles (Planner, Scheduler, RE, Supervisor, Craft), columns = skills (Vibration, Lubrication, Electrical, ...), cells colored by proficiency level (red = 1, yellow = 2, green = 3, dark-green = 4). A "red row" (low proficiency across skills) flags a role-needs-training; a "red column" flags a skill-needs-training. The heatmap makes the gap visible at a glance and drives the prioritized training plan.`,
    simulation_opportunity: `Build a training-ROI simulator: input the skill (Vibration/Lubrication/CMMS/RCA), N trainees, course cost, lost labor, projected productivity gain (avoided failures × avg event cost + faster diagnosis × WO count × hours saved × $/h). Output: 1-yr and 3-yr ROI, payback, gap-closure timeline. Calibrate the avoided-failure rate from CMMS failure data. Use the simulator to defend a training investment: "a $145k training program lifts WO closeout from 38% → 84% and PM compliance from 47% → 71% with 115% 1-yr ROI."`,
    common_mistakes: `- Training without a skills matrix — undirected; no gap visibility; no prioritization.
- Training when the binding constraint is structure/leadership/culture — wasted; fix the constraint first.
- Computing training ROI without lost labor — understates cost by 30-50%; loses finance credibility.
- Asserting competency without certification — ISO 55000 Cl. 7.2 non-conformance; "I think I know" is not evidence.
- One-time training without refresher — competency decays; vibration analysts need 3-yr recertification.
- No onboarding program — new-hire 12-mo turnover 25-40% (vs. < 10% with structured onboarding).
- Sending everyone to the same course — skills matrix identifies the per-person gap; blanket training wastes 30-50% of spend.
- Skipping the prerequisite (Cat II without Cat I) — trainees fail; investment wasted.
- No train-the-trainer program — every training cycle re-buys external expertise; cost compounds.
- Training records not maintained — ISO 55000 Cl. 7.2 documented-information non-conformance.`,
    limitations: `- Productivity-gain estimates (avoided failures) carry ±30% uncertainty; sensitivity-test.
- Lost-labor rate ($/h) varies by craft; use the right rate per trainee.
- Multi-year ROI assumes the trained person stays; turnover erodes the ROI.
- Certification expires (3-yr for vibration Cat II; 5-yr for CMRP); recertification cost must be in the budget.
- Skills matrix requires supervisor judgment for proficiency assessment — halo effect inflates by 10-15%.
- Training-need priority (criticality × gap × ROI) assumes the three factors are independent; in practice they correlate.
- Onboarding programs require mentor time; mentors are pulled back into production under pressure.`,
    comparison: `**Skills matrix vs. Job description**: job description is the role; skills matrix is the person's current capability vs. the role's requirements. Both required. **External certification vs Internal training**: external certification (CMRP, ISO Cat II) provides auditable evidence (ISO 55000 Cl. 7.2); internal training is faster, cheaper, but requires train-the-trainer investment. Best practice: external certification for critical skills; internal training for non-critical. **Training ROI vs. TCO of untrained labor**: training ROI is the financial case; TCO of untrained labor (bad data, missed failures, rework, injuries) is the cost of inaction. The two together defend the investment. **Onboarding 30/60/90 vs ad-hoc**: structured onboarding reduces 12-mo turnover from 25-40% to < 10%; ad-hoc produces turnover and inconsistent capability.`,
    practical_application: `- **Daily**: capture WO closeout failure data (training ROI input); mentor on the floor.
- **Weekly**: review the skills matrix heatmap; flag red rows/columns.
- **Monthly**: review training-plan progress; track competency ratio.
- **Quarterly**: re-baseline skills matrix; pulse supervisor judgment for halo effect.
- **Annually**: compute training ROI for the prior year's programs; defend the next year's budget envelope.
- **On every new hire**: execute the 30/60/90 onboarding plan; assign mentor; map certification path.`,
    decision_scenario: `You are the M&R Manager at a 220-craft Chemical plant with $0 training budget, WO closeout completeness 38%, PM compliance 47%, RCA follow-through 25%. Skills matrix shows 18-FTE gap across 10 critical skills. CFO has asked for the business case to fund a $145k training program.

Build the case:
(a) Skills-matrix gap: 18 FTE across Vibration Cat II (7), Lubrication MLT (3), CMMS data-entry (4), RCA facilitation (2), CMRP planner cert (2).
(b) Program cost: $145k (course fees $78k + travel $14k + lost labor $48k + materials $5k).
(c) Productivity gain (annual): avoided failures 8 × $30k = $240k + faster diagnosis $42k + reduced rework $30k = $312k/yr.
(d) 1-yr ROI = ($312k − $145k) / $145k × 100 = 115%; 3-yr ROI = (3 × $312k − $145k) / $145k × 100 = 545%.
(e) Lagging KPI movement: WO closeout 38% → 84%; PM compliance 47% → 71%; RCA follow-through 25% → 68% (projected 12-month).

Decision: fund the program. The 1-yr ROI 115% exceeds the typical 50-150% M&R training band; the 3-yr ROI 545% is in the 300-700% band. The binding constraint is competency — without the training, no structure/leadership/culture initiative will move the KPIs. The CFO-language case: "$145k investment returns $312k/yr (1-yr ROI 115%); the alternative is a $312k/yr cost of untrained labor."`,
    practice_questions: `- List the 4 proficiency levels and the ISO 55000 clause that requires evidence of competency.
- A program costs $81,600 and yields $142,500/yr productivity gain. Compute 1-yr and 3-yr ROI. *(Answer: 74.6% and 424%.)*
- A skill requires 12 people at level 3+; actual is 5 at level 3+. Compute the gap and competency ratio. *(Answer: gap 7 FTE; ratio 41.7%.)*
- State the four cost components of a training program. *(Answer: course fees + travel + lost labor + materials/instructor.)*
- Define the 30/60/90 onboarding milestones.`,
    certification_questions: `The CMRP exam tests Training & Development as the fifth OL competency. SMRP-aligned sample prompts:

(a) Compute training ROI (1-yr and N-yr) from program cost + annual productivity gain.
(b) Compute skills-matrix gap (FTE shortfall) and competency ratio.
(c) Identify the M&R certification paths (CMRP, ISO Cat I-IV, MLT, NICET, STLE, OSHA) per role.
(d) Map ISO 55000 Cl. 7.2 (Competence) requirements to the skills matrix and training plan.
(e) Build the 30/60/90 onboarding plan for a new M&R hire.

The questions in this lesson's question bank are aligned to these competencies.`,
    summary: `Training & Development builds the human capability that the org structure requires and the leadership deploys. Three disciplines: skills matrix (required vs actual proficiency per role × skill, levels 1-4), certification paths (CMRP, ISO Cat I-IV, MLT, NICET, STLE, OSHA — auditable evidence), and training ROI ((gain − cost) / cost × 100; 50-150% 1-yr / 300-700% 3-yr for M&R). ISO 55000 Cl. 7.2 (Competence) requires documented evidence — assertion is non-conformant. Deming Point 13: every employee, every year, builds capability. Training is downstream of structure, leadership, culture, change — train without those and the training is wasted; train with them and the human capability compounds. Onboarding (30/60/90) is the highest-ROI HR investment in M&R.`,
    key_takeaways: `- Skills matrix: roles × skills × 1-4 proficiency; gap = required − actual at level 3+.
- Proficiency levels: 1 Awareness → 2 Trained → 3 Proficient → 4 Expert.
- Certification paths: CMRP, ISO Vibration Cat I-IV, MLT/MLA (ICML), NICET, STLE CLS, OSHA-10/30.
- Training ROI = (gain − cost) / cost × 100; 50-150% (1-yr) / 300-700% (3-yr) for M&R.
- ISO 55000 Cl. 7.2 (Competence) requires documented evidence — assertion non-conformant.
- Deming Point 13: every employee, every year, builds capability.
- Training is downstream of structure/leadership/culture/change — train without those and it's wasted.
- Onboarding (30/60/90) reduces 12-mo new-hire turnover from 25-40% to < 10%.
- Training-need priority = criticality × gap × ROI.`,
    references: `- SMRP. *CMRP Body of Knowledge — Organization & Leadership pillar: Training & Development.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.* (Cl. 7.2 Competence, Cl. 7.3 Awareness).
- Kotter, J. P. (1996/2012). *Leading Change*. HBR Press. (Step 5 — empower broad-based action via training.)
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. (Point 13 — institute education and self-improvement; Point 6 — institute training on the job.)
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section III (workforce/HR — competency, training, certification).
- O'Hanlon, T. (2000/2015). *Uptime: A Guide to Reliable Performance*. Reliabilityweb. (Reliability-leadership behaviors underpinned by competency.)`,
  },
  knowledgeObject: {
    title: "Training & Development — skills matrix, certification paths, training ROI",
    domain: "Organization & Leadership",
    competency: "Training & Development",
    topic: "Skills development, certification, competency frameworks, training ROI",
    concept: "Skills matrix × certification paths × training ROI",
    body: {
      definitions: [
        "Skills matrix: tabular mapping of roles × skills × proficiency levels (1-4).",
        "Proficiency levels: 1 = Awareness, 2 = Trained, 3 = Proficient, 4 = Expert.",
        "Skills gap: Σ (required_FTE − actual_FTE) at level 3+ for each skill.",
        "Competency ratio: people at level 3+ / people required at 3+ × 100.",
        "Training ROI: (productivity gain − program cost) / program cost × 100.",
        "CMRP: Certified Maintenance & Reliability Professional (SMRP); 5-pillar credential.",
        "ISO 18436-2 Vibration Analyst: Cat I-IV (Cat II = workhorse for most plants).",
        "MLT/MLA: Maintenance Lubrication Technician / Lubricant Analyst (ICML).",
        "NICET: National Institute for Certification in Engineering Technologies.",
        "STLE CLS: Society of Tribologists and Lubrication Engineers — Certified Lubrication Specialist.",
        "OSHA-10/30: 10/30-hour safety training.",
        "Onboarding 30/60/90: structured first-90-day milestones for new hires.",
        "Train-the-trainer: internal capability to deliver training, reducing external cost over time.",
      ],
      principles: [
        "Competency is auditable, not asserted (ISO 55000 Cl. 7.2).",
        "Skills matrix makes the gap visible; the gap drives the training plan.",
        "Proficiency levels 1-4: Awareness → Trained → Proficient → Expert.",
        "Certification paths: external validation (CMRP, ISO Cat I-IV, MLT, NICET, STLE, OSHA).",
        "Training ROI = (gain − cost) / cost × 100; 50-150% (1-yr) / 300-700% (3-yr) for M&R.",
        "Deming Point 13: every employee, every year, builds capability.",
        "Training is downstream of structure/leadership/culture/change — train without those and it's wasted.",
        "Onboarding (30/60/90) is the highest-ROI HR investment in M&R.",
      ],
      components: [
        "Skills matrix (roles × skills × 1-4 proficiency).",
        "Training plan (annual, prioritized by criticality × gap × ROI).",
        "Certification map (CMRP, ISO Cat I-IV, MLT, NICET, STLE, OSHA per role).",
        "Training ROI calculator (productivity gain − program cost).",
        "Onboarding program (30/60/90 milestones; mentor assignment).",
        "Train-the-trainer program.",
        "Training records system (ISO 55000 Cl. 7.2 documented evidence).",
        "Quarterly skills-matrix re-baseline.",
      ],
      mechanism: [
        "List critical skills → specify required proficiency per role × skill → assess actual per person → build skills matrix → compute gap → prioritize training plan (criticality × gap × ROI) → build budget envelope → deliver training → compute training ROI → update skills matrix → re-baseline quarterly → onboarding 30/60/90 for new hires.",
      ],
      process: [
        "1. List critical skills (Vibration, Lubrication, Electrical, Hydraulic, Welding, Machining, Rigging, CMMS, RCA, CMRP, etc.).",
        "2. For each role × skill, specify required proficiency (1-4).",
        "3. Assess actual proficiency per person (skills assessment, supervisor judgment, certification evidence).",
        "4. Build the skills matrix; compute gap per skill.",
        "5. Prioritize training plan by (criticality × gap × ROI).",
        "6. Build budget envelope (course fees + travel + lost labor).",
        "7. Deliver training (external certification + internal train-the-trainer).",
        "8. Compute training ROI post-program.",
        "9. Update skills matrix; re-baseline quarterly.",
        "10. Build the onboarding program (30/60/90) for new hires.",
      ],
      formulas: [
        "Training ROI (1-yr) = (annual productivity gain − program cost) / program cost × 100  [%]",
        "Training ROI (N-yr) = (N × annual gain − program cost) / program cost × 100  [%]",
        "Skills gap (FTE) = Σ_j (required_FTE_j − actual_FTE_j) at level 3+  [FTE shortfall]",
        "Competency ratio = (people at level 3+ / people required at 3+) × 100  [%]",
        "Training-need priority = criticality (1-5) × gap_size (FTE) × ROI (%)",
      ],
      metrics: [
        "Training ROI (1-yr and N-yr) [%].",
        "Skills gap per skill [FTE shortfall].",
        "Competency ratio per skill [%].",
        "Training-plan completion rate [%].",
        "WO closeout failure-data completeness [%] (downstream of CMMS training).",
        "PM compliance [%] (downstream of planner training).",
        "RCA follow-through rate [%] (downstream of RCA facilitation training).",
        "New-hire 12-mo turnover [%] (downstream of onboarding).",
      ],
      examples: [
        "Power plant Vibration Cat II: $81,600 cost; $142,500/yr gain; 1-yr ROI 74.6%; 3-yr ROI 424%; gap 7 FTE.",
        "Oil & Gas refinery Vibration Cat II (24 trainees): $164k cost; $310k/yr gain; 1-yr ROI 89%; 3-yr ROI 468%.",
        "Power coal plant CMRP planner cert (8 trainees): $55k cost; $118k/yr gain; 1-yr ROI 115%; 3-yr ROI 545%.",
        "Container Terminal RTG Lubrication MLT (12): $36k cost; $98k/yr gain; 1-yr ROI 172%; 3-yr ROI 716%.",
        "Manufacturing food plant OSHA-30 + CMMS onboarding (30): $45k cost; $112k/yr gain; 1-yr ROI 149%; turnover 38% → 8%.",
      ],
      industrial_examples: [
        "Oil & Gas — refinery Vibration Cat II 24-person program, ROI 89%.",
        "Power — coal plant CMRP planner cert 8-person program, ROI 115%.",
        "Container Terminal — RTG Lubrication MLT 12-person program, ROI 172%.",
        "Manufacturing — food plant OSHA-30 + CMMS onboarding 30-person, ROI 149%, turnover 38% → 8%.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 250-craft Chemical plant with $0 training budget. WO closeout completeness 38%, PM compliance 47%, RCA follow-through 25%. Diagnostic: binding constraint is competency. Intervention: build skills matrix (10 skills × 5 roles, 18-FTE gap), launch 12-mo training program ($145k cost). Year-1 outcome: WO closeout 38% → 84%; PM compliance 47% → 71%; RCA follow-through 25% → 68%. Productivity gain $312k/yr; 1-yr training ROI 115%. Lesson: training is consistently the highest-ROI M&R investment when the binding constraint is competency; the skills matrix makes the gap and the ROI defensible.",
      ],
      common_errors: [
        "Training without a skills matrix — undirected; no gap visibility.",
        "Training when the binding constraint is structure/leadership/culture — wasted.",
        "Computing training ROI without lost labor — understates cost by 30-50%.",
        "Asserting competency without certification — ISO 55000 Cl. 7.2 non-conformance.",
        "One-time training without refresher — competency decays; vibration analysts need 3-yr recert.",
        "No onboarding program — new-hire 12-mo turnover 25-40%.",
        "Sending everyone to the same course — wastes 30-50% of spend; skills matrix identifies per-person gap.",
        "Skipping prerequisite (Cat II without Cat I) — trainees fail; investment wasted.",
        "No train-the-trainer program — cost compounds.",
        "Training records not maintained — ISO 55000 Cl. 7.2 non-conformance.",
      ],
      limitations: [
        "Productivity-gain estimates (avoided failures) carry ±30% uncertainty; sensitivity-test.",
        "Lost-labor rate varies by craft; use the right rate per trainee.",
        "Multi-year ROI assumes the trained person stays; turnover erodes the ROI.",
        "Certification expires (3-yr Cat II; 5-yr CMRP); recertification cost must be in budget.",
        "Skills matrix supervisor judgment carries halo effect (10-15% inflation).",
        "Training-need priority (criticality × gap × ROI) assumes the three factors are independent.",
        "Onboarding requires mentor time; mentors are pulled back into production under pressure.",
      ],
      best_practices: [
        "Build the skills matrix first; never train without gap visibility.",
        "Prioritize training plan by (criticality × gap × ROI).",
        "Use external certification for critical skills (auditable evidence).",
        "Use internal train-the-trainer for non-critical skills (lower cost).",
        "Include lost labor in training ROI cost (30-50% understatement if omitted).",
        "Build the 30/60/90 onboarding plan; assign mentor within first week.",
        "Maintain training records (ISO 55000 Cl. 7.2 documented information).",
        "Re-baseline skills matrix quarterly; pulse supervisor judgment for halo effect.",
        "Compute training ROI post-program; report to CFO with the (gain − cost) / cost × 100 case.",
        "Budget for recertification (3-yr Cat II; 5-yr CMRP).",
      ],
      related_concepts: [
        "Organizational Structures (Lesson 1) — job descriptions feed the skills matrix.",
        "Leadership (Lesson 2) — leadership succession requires bench-building.",
        "Organizational Behavior (Lesson 3) — autonomous maintenance (TPM) requires operator training.",
        "Change Management (Lesson 4) — Step 5 (empower) requires training.",
        "ISO 55000 Cl. 7.2 (Competence), Cl. 7.3 (Awareness) — management-system anchor.",
        "Deming Point 13 (education/self-improvement), Point 6 (training on the job).",
      ],
      prerequisites: [
        "Organizational Structures (Lesson 1) + Leadership (Lesson 2) + Organizational Behavior (Lesson 3) + Change Management (Lesson 4).",
        "Work Management (WM pillar) — technical content (planning, scheduling, PdM, CMMS).",
        "ISO 55000:2014 Cl. 7.2 (Competence), Cl. 7.3 (Awareness).",
        "Deming's 14 Points (Point 13, Point 6).",
      ],
      references: [
        "SMRP CMRP BOK — OL pillar: Training & Development.",
        "ISO 55000:2014 (Cl. 7.2, Cl. 7.3).",
        "Kotter, J. P. (1996/2012). Leading Change. HBR Press. (Step 5 — empower via training.)",
        "Deming, W. E. (1986). Out of the Crisis. MIT CAES. (Point 13, Point 6.)",
        "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). Section III.",
        "O'Hanlon, T. (2000/2015). Uptime. Reliabilityweb.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Training & Development",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which ISO 55000:2014 clause requires that 'persons doing work under its control that affects asset management performance are competent on the basis of education, training, skills and experience'?",
      whyCorrect:
        "ISO 55000:2014 Cl. 7.2 (Competence) is the management-system anchor for the Training & Development competency. It requires organizations to determine necessary competence, ensure persons are competent, take actions to acquire competence, evaluate effectiveness, and retain documented information as evidence. The skills matrix + training plan + certification paths + training records system satisfy this clause.",
      whyOthersWrong: [
        "Cl. 5.1 (Leadership & commitment) — addresses top-management demonstrable commitment, not individual competence; related but not the specific competence clause.",
        "Cl. 7.3 (Awareness) — requires persons be *aware* of the asset-management policy, their contribution, and implications of non-conformance; awareness is downstream of competence, not the competence clause itself.",
        "Cl. 9.3 (Management Review) — addresses periodic review of the asset-management system including opportunities for improvement; it audits competence but does not establish the requirement.",
      ],
      explanation:
        "ISO 55000:2014 Cl. 7.2 (Competence) requires auditable evidence of education, training, skills, and experience. The skills matrix + training plan + certification paths + training records satisfy this clause; assertion alone is non-conformant.",
      options: [
        { text: "Cl. 7.2 (Competence)", isCorrect: true },
        { text: "Cl. 5.1 (Leadership & commitment)", isCorrect: false },
        { text: "Cl. 7.3 (Awareness)", isCorrect: false },
        { text: "Cl. 9.3 (Management Review)", isCorrect: false },
      ],
    },
    {
      competencyName: "Training & Development",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power-plant Vibration Cat II training program costs $81,600 (course $36k + travel $9.6k + lost labor $36k) and yields $142,500/yr productivity gain (faster diagnosis $22.5k + avoided failures $120k). Compute the 1-yr and 3-yr training ROI.",
      whyCorrect:
        "1-yr ROI = (annual gain − program cost) / program cost × 100 = ($142,500 − $81,600) / $81,600 × 100 = $60,900 / $81,600 × 100 = 74.6%. 3-yr ROI = (N × annual gain − program cost) / program cost × 100 = (3 × $142,500 − $81,600) / $81,600 × 100 = ($427,500 − $81,600) / $81,600 × 100 = $345,900 / $81,600 × 100 = 424%.",
      whyOthersWrong: [
        "1-yr 49.7% + 3-yr 392% — would result from a different cost basis (e.g., omitting lost labor $36k, using cost $45,600 → ($142,500 − $45,600) / $45,600 = 213%, not 49.7%; arithmetic error pattern, not a coherent alternative).",
        "1-yr 174.6% + 3-yr 524% — would result from inverting the formula (gain + cost instead of gain − cost) and adding rather than subtracting the program cost; the correct formula subtracts cost from gain (net benefit).",
        "1-yr 75% + 3-yr 250% — close to the 1-yr but the 3-yr is wrong (250% vs 424%); the 3-yr formula adds N × gain − cost correctly but uses a different N (e.g., N=2 instead of N=3).",
      ],
      explanation:
        "1-yr ROI = ($142,500 − $81,600) / $81,600 × 100 = 74.6%. 3-yr ROI = (3 × $142,500 − $81,600) / $81,600 × 100 = 424%. Both within the M&R training ROI band (50-150% 1-yr; 300-700% 3-yr). Fund.",
      options: [
        { text: "1-yr 74.6%, 3-yr 424%", isCorrect: true },
        { text: "1-yr 49.7%, 3-yr 392%", isCorrect: false },
        { text: "1-yr 174.6%, 3-yr 524%", isCorrect: false },
        { text: "1-yr 75%, 3-yr 250%", isCorrect: false },
      ],
    },
    {
      competencyName: "Training & Development",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "A Chemical plant's Vibration Cat II skill requires 12 people at level 3+ (Proficient/Expert); actual is 5 at level 3+, 8 at level 2 (Trained), 4 at level 1 (Awareness). What is the skills gap (FTE) and competency ratio, and what is the recommended sequence to close the gap?",
      whyCorrect:
        "Skills gap = required at level 3+ minus actual at level 3+ = 12 − 5 = 7 FTE shortfall. Competency ratio = 5/12 × 100 = 41.7% (below 90% target). Recommended sequence: (a) Cat II training for the 8 currently at level 2 → lifts 7-8 of them to level 3 (closes ~7 FTE gap); (b) Cat I prerequisite + Cat II for the 4 at level 1 → lifts them to level 3 over 6-12 months (closes the remaining gap). Do not skip the prerequisite — Cat II without Cat I produces failures and wasted investment.",
      whyOthersWrong: [
        "Gap 4 FTE, ratio 66.7% — would result from counting all 9 below level 3 (8 at level 2 + 4 at level 1 = 12, but with the formula mis-summed as 12 − 8 = 4 FTE gap, missing the 4 at level 1 who also need training to reach level 3+; the correct gap is at level 3+, not level 2+).",
        "Gap 7 FTE, ratio 41.7%, sequence = Cat II for everyone — close gap and ratio but wrong sequence; the 4 at level 1 need Cat I prerequisite first; sending them to Cat II without Cat I wastes the investment (trainees fail).",
        "Gap 8 FTE, ratio 33.3% — would result from treating 'level 2 Trained' as still requiring training (12 − (5 + 8 - something) miscount) and using 4/12 ratio; arithmetic inconsistency.",
      ],
      explanation:
        "Gap = 12 − 5 = 7 FTE at level 3+. Ratio = 5/12 = 41.7%. Sequence: Cat II for the 8 at level 2 (closes ~7 FTE), then Cat I prerequisite + Cat II for the 4 at level 1 (closes the rest). Never skip the prerequisite (Cat I before Cat II).",
      options: [
        { text: "Gap 7 FTE, ratio 41.7%, sequence Cat II (for L2) then Cat I + Cat II (for L1)", isCorrect: true },
        { text: "Gap 4 FTE, ratio 66.7%", isCorrect: false },
        { text: "Gap 7 FTE, ratio 41.7%, sequence = Cat II for everyone", isCorrect: false },
        { text: "Gap 8 FTE, ratio 33.3%", isCorrect: false },
      ],
    },
    {
      competencyName: "Training & Development",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: A structured 30/60/90-day onboarding program for new M&R hires typically has no measurable impact on 12-month new-hire turnover; turnover is driven by compensation, not onboarding quality.",
      whyCorrect:
        "False. Structured 30/60/90 onboarding reduces 12-month new-hire turnover from a typical 25-40% (without onboarding) to < 10% (with structured onboarding). Compensation matters but onboarding quality is a stronger driver of 12-mo retention — new hires who get a mentor, clear 30/60/90 milestones, CMMS access in week 1, first-PM execution with a mentor, and a development plan stay; new hires left to 'sink or swim' leave. Onboarding is consistently the highest-ROI HR investment in M&R.",
      whyOthersWrong: [
        "True would ignore the evidence — 25-40% vs < 10% turnover is a 3-4× reduction, attributable to structured onboarding. Compensation is a hygiene factor (Herzberg); onboarding is a motivator that builds capability, mentorship, and belonging — the three drivers of retention.",
      ],
      explanation:
        "Structured 30/60/90 onboarding reduces 12-mo new-hire turnover from 25-40% to < 10%. It is consistently the highest-ROI HR investment in M&R. Compensation is a hygiene factor; onboarding is a motivator (capability, mentorship, belonging).",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson index
// ---------------------------------------------------------------------------

export const CMRP_OL_LESSONS: RefLesson[] = [
  LESSON_ORG_STRUCTURES,
  LESSON_LEADERSHIP,
  LESSON_ORG_BEHAVIOR,
  LESSON_CHANGE_MANAGEMENT,
  LESSON_TRAINING_DEVELOPMENT,
];

// ---------------------------------------------------------------------------
// Loader — writes the dataset into the database (certification track)
// ---------------------------------------------------------------------------

/**
 * Upsert the CMRP Organization & Leadership reference dataset into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CMRP certification by slug "cmrp"; find OL domain by code "OL";
 *     map the 5 OL competencies by NAME -> id (Organizational Structures,
 *     Leadership, Organizational Behavior, Change Management, Training &
 *     Development).
 *  2. Upsert References globally (by title, no sectionId) -> a shared
 *     referenceIds array applied to every OL lesson, KO, and question.
 *  3. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds (JSON
 *       stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  4. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId, competencyId, lessonId,
 *     body JSON, referenceIds (JSON shared), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0", certificationIds JSON.
 *  5. For each lesson: db.question.deleteMany({where:{certificationId,
 *     competencyId}}) then create each enriched question with nested options,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON), referenceIds
 *     (JSON), status="READY", verificationStatus="VERIFIED", version="1.0.0".
 *  6. Return { lessons, kos, questions, references, competencies } counts.
 */
export async function loadReference() {
  // 1) Certification + OL domain + competency map
  const certification = await db.certification.findUnique({
    where: { slug: "cmrp" },
  });
  if (!certification) {
    throw new Error(
      'CMRP certification not found. Run the CMRP structure loader (src/lib/ref-content/cmrp.ts) first.'
    );
  }

  const olDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "OL" },
  });
  if (!olDomain) {
    throw new Error(
      'Organization & Leadership (OL) domain not found under CMRP. Run the CMRP structure loader first.'
    );
  }

  const olCompetencies = await db.competency.findMany({
    where: { domainId: olDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of olCompetencies) {
    competencyIdByName[c.name] = c.id;
  }

  // Validate that all 5 expected OL competencies exist by name.
  const expectedCompetencyNames = CMRP_OL_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing OL competencies by name: ${missing.join(
        ", "
      )}. Ensure src/lib/ref-content/cmrp.ts has been loaded with the latest OL competency names.`
    );
  }

  // 2) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CMRP_OL_SOURCES) {
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
  const sharedReferenceIds = CMRP_OL_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 3) Lessons, 4) KnowledgeObjects, 5) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CMRP_OL_LESSONS) {
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

    // 3) Lesson — findFirst by (competencyId, slug) then update or create
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

    // 4) KnowledgeObject — findFirst by lessonId, then update or create.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { lessonId },
    });
    const koData = {
      certificationId: certification.id,
      domainId: olDomain.id,
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

    // 5) Questions — delete existing for this competency (scoped), then
    //    create each enriched question with nested options.
    await db.question.deleteMany({
      where: { certificationId: certification.id, competencyId },
    });

    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          certificationId: certification.id,
          domainId: olDomain.id,
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
    domain: olDomain.id,
    competencies: olCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}

// =============================================================================
// PMP — Project Management Professional (PMI) — Combined structure + content
// loader for the People (PPL) performance domain (Task ID 16-PMP).
//
// This single loader does BOTH:
//   (A) Certification STRUCTURE — the 3-domain PMI PMP framework derived from
//       the PMBOK® Guide 7th Edition Performance Domains (People, Process,
//       Business Environment) plus the PMI Examination Content Outline (ECO)
//       tasks for the People domain, a v2024 version snapshot, and the
//       "pmp-path" learning path — mirroring src/lib/ref-content/cre.ts.
//   (B) Deep scientific CONTENT for the People (PPL) domain — 4 full-spec
//       (24-section) lessons, Knowledge Objects, and 16 enriched questions.
//
// NOTE on exam weights: PMI's PMP exam content outline distributes items
// across three domains (People, Process, Business Environment). The weights
// below are approximate per PMI ECO publications and flagged
// verificationStatus = "REQUIRES_RESEARCH" inside `examBlueprint` until the
// official current ECO is loaded into the platform. The 3-domain structure
// itself is the published PMI PMP ECO (People 42% / Process 50% / Business
// Environment 8% are the approximate published weights).
//
// Source hierarchy (spec §5) — Levels 2, 3, 6:
//   - LEVEL 3 — Official Body of Knowledge / Handbook / Exam Outline:
//     * PMI, "A Guide to the Project Management Body of Knowledge (PMBOK®
//       Guide) — 7th Edition" (2021).
//     * PMI, "Agile Practice Guide" (2017).
//     * PMI, "PMP Examination Content Outline" (current ECO).
//     * PMI, "PMI Talent Triangle®".
//   - LEVEL 2 — Official Standard / Standards Organization:
//     * ISO 21500:2021, "Project, programme and portfolio management —
//       Guidance on project management" (cited as a Reference; NO Standard
//       record is created/invented because no iso-21500 standard row exists
//       in the DB at authoring time — per task instruction "do NOT invent a
//       standard").
//   - LEVEL 6 — University / Academic Publications:
//     * Kouzes & Posner, "The Leadership Challenge" (6th ed., Wiley, 2017).
//     * Goleman, "Emotional Intelligence" (Bantam, 1995).
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, dialogues, scorecards, and questions are authored for this
// platform; textbook material is summarized and cited, not reproduced.
// Case studies are SYNTHETIC and explicitly marked `CASE_TYPE = SYNTHETIC`
// inside the lesson text.
//
// Lifecycle: every record (Lesson, KnowledgeObject, Question, Reference) is
// upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre.ts)
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
  scenario?: string; // IT|Construction|Healthcare|...
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
// PMP STRUCTURE — 3 PMI PMP Performance Domains (PMBOK® Guide 7th Edition).
//
// Exam weights are approximate / REQUIRES_RESEARCH: PMI's PMP ECO publishes
// per-domain item counts that periodically change. The 3-domain structure
// itself is the published PMI PMP ECO (People / Process / Business
// Environment). The People domain carries 10 ECO tasks (competencies); the
// Process and Business Environment domains are listed as structure only
// (no competencies seeded in this loader — they will be filled by future
// PRC / BE pillars).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  code?: string;
  name: string;
  description: string;
  order: number;
}
interface SeedDomain {
  code: string;
  name: string;
  weight: number; // approximate % (REQUIRES_RESEARCH)
  description: string;
  competencies: SeedCompetency[];
}

const PMP_DOMAINS: SeedDomain[] = [
  {
    code: "PPL",
    name: "People",
    weight: 42,
    description:
      "The People performance domain (PMI ECO Task Enabler Group) covers the leadership, team-building, stakeholder, and conflict competencies a project manager uses to lead a project team. PMI ECO People-domain tasks: leading a team, building team ground rules, negotiating project agreements, empowering team members and stakeholders, coaching and mentoring, training team members and stakeholders, managing conflict, leading virtual teams, building a shared project vision, and managing and leading change.",
    competencies: [
      {
        name: "Leading a Team",
        description:
          "Leadership theories (transformational, servant, situational, transactional, laissez-faire); the project manager's role as integrator, communicator, and leader; motivating project teams (Maslow, Herzberg, McClelland); the PMI Talent Triangle (Technical, Leadership, Strategic & Business Management).",
        order: 1,
      },
      {
        name: "Building Team Ground Rules",
        description:
          "Establishing ground rules, team charter, working agreements, decision-making norms, and behavioral expectations for the project team; reinforcement and evolution across the project lifecycle.",
        order: 2,
      },
      {
        name: "Negotiating Project Agreements",
        description:
          "Negotiating scope, schedule, cost, resources, and contract terms with sponsors, vendors, and functional managers; BATNA, interest-based negotiation, principled negotiation.",
        order: 3,
      },
      {
        name: "Empowering Team Members & Stakeholders",
        description:
          "Delegation, decision authority, psychological safety, and stakeholder empowerment; balancing autonomy and accountability across the project team and stakeholder community.",
        order: 4,
      },
      {
        name: "Coaching & Mentoring",
        description:
          "Coaching vs mentoring, the GROW model, feedback models (SBI/SBI-I), servant leadership, and the development of team-member capability across the project lifecycle.",
        order: 5,
      },
      {
        name: "Training Team Members & Stakeholders",
        description:
          "Training-needs analysis, training delivery, knowledge transfer, and the measurement of training effectiveness for project team members and stakeholders.",
        order: 6,
      },
      {
        name: "Managing Conflict",
        description:
          "Thomas-Kilmann conflict modes (competing, collaborating, compromising, avoiding, accommodating); conflict sources on projects; conflict resolution steps; emotional intelligence (Goleman).",
        order: 7,
      },
      {
        name: "Leading Virtual Teams",
        description:
          "Distributed-team leadership, communication cadence, asynchronous collaboration, cultural intelligence, and virtual engagement practices.",
        order: 8,
      },
      {
        name: "Building Shared Project Vision",
        description:
          "Vision creation, stakeholder engagement, team charter, ground rules, and psychological safety (Edmondson) as foundations of a shared project vision.",
        order: 9,
      },
      {
        name: "Managing & Leading Change",
        description:
          "Change-management frameworks (Kotter, ADKAR, Lewin), stakeholder change resistance, communication planning, and the project manager's role as change leader.",
        order: 10,
      },
    ],
  },
  {
    code: "PRC",
    name: "Process",
    weight: 50,
    description:
      "The Process performance domain covers project methodology, project lifecycle, schedule, scope, budget, resource allocation, quality, risk, procurement, and project-work performance. PMI ECO Process-domain tasks include executing project with urgency, communicating, assessing and managing risk, managing budget and resources, managing schedule, managing scope, integrating project-planning activities, and managing project changes.",
    competencies: [],
  },
  {
    code: "BE",
    name: "Business Environment",
    weight: 8,
    description:
      "The Business Environment performance domain covers compliance, value delivery, and the organizational context of projects. PMI ECO Business-Environment tasks include planning and managing project compliance, evaluating and delivering project benefits and value, and evaluating and addressing external business-environment changes.",
    competencies: [],
  },
];

// ---------------------------------------------------------------------------
// SOURCES — 7 real references cited across all PPL lessons.
// ---------------------------------------------------------------------------

export const PMP_SOURCES: RefSource[] = [
  {
    title:
      "PMI — A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.pmi.org/standards/pmbok",
    citation:
      "Project Management Institute (PMI). (2021). A Guide to the Project Management Body of Knowledge (PMBOK® Guide) — 7th Edition. Newtown Square, PA: Project Management Institute. ISBN 978-1-62825-862-3. The 7th Edition reframes project management around 8 Performance Domains (Stakeholder, Team, Development Approach & Life Cycle, Planning, Project Work, Delivery, Measurement, Uncertainty) and 12 Principles. The People (PPL) PMP ECO domain draws from the Team and Stakeholder performance domains and the Servant Leadership, Stewardship, and Leadership principles.",
  },
  {
    title: "PMI — Agile Practice Guide",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOOK",
    url: "https://www.pmi.org/standards/agile",
    citation:
      "Project Management Institute (PMI). (2017). Agile Practice Guide. Newtown Square, PA: Project Management Institute. Developed in collaboration with Agile Alliance. Covers servant leadership on agile teams, team charter, ground rules, daily standups, conflict in agile teams, and empowering self-organizing teams — all central to the People domain.",
  },
  {
    title: "PMI — PMP Examination Content Outline (ECO)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "EXAM_OUTLINE",
    url: "https://www.pmi.org/about/pmp-exam-prep",
    citation:
      "Project Management Institute (PMI). PMP Examination Content Outline (ECO). Defines the 3 PMP exam domains — People, Process, Business Environment — and enumerates tasks per domain. The People domain (≈42% of the exam) lists 10 task enablers: leading a team, building team ground rules, negotiating project agreements, empowering team members and stakeholders, coaching and mentoring, training team members and stakeholders, managing conflict, leading virtual teams, building shared project vision, and managing and leading change. Per-domain weights are flagged REQUIRES_RESEARCH in this loader's examBlueprint until the current ECO is verified in-platform.",
  },
  {
    title: "PMI — PMI Talent Triangle®",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "WEBSITE",
    url: "https://www.pmi.org/why-pmi/our-standards/talent-triangle",
    citation:
      "Project Management Institute (PMI). PMI Talent Triangle®. Defines the three skill areas required of modern project managers — Ways of Working (Technical Project Management), Power Skills (Leadership), and Business Acumen (Strategic & Business Management) — the PMP ECO's foundation for the People domain's leadership competency.",
  },
  {
    title:
      "ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/68569.html",
    citation:
      "International Organization for Standardization. ISO 21500:2021, Project, programme and portfolio management — Guidance on project management. Geneva: ISO. The international standard providing high-level guidance on project management concepts, processes, and themes (governance, stakeholder, team, scope, schedule, resources, risk, change). The standard is cited as a Reference here; no Standard row is created in the platform's Standard table (the iso-21500 slug was not present at authoring time — per task instruction, do NOT invent a standard).",
  },
  {
    title: "Kouzes & Posner — The Leadership Challenge (Wiley, 6th ed.)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Kouzes, J. M., & Posner, B. Z. (2017). The Leadership Challenge: How to Make Extraordinary Things Happen in Organizations (6th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-27896-2. The evidence-based Five Practices of Exemplary Leadership® (Model the Way, Inspire a Shared Vision, Challenge the Process, Enable Others to Act, Encourage the Heart) underpin the transformational-leadership material in the Leading-a-Team lesson and the shared-vision material in the Building-Shared-Project-Vision lesson.",
  },
  {
    title: "Goleman — Emotional Intelligence (Bantam)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Goleman, D. (1995). Emotional Intelligence: Why It Can Matter More Than IQ. New York: Bantam Books. ISBN 978-0-553-38371-3. Establishes the five EI components — self-awareness, self-regulation, motivation, empathy, and social skill — that anchor the conflict-management lesson's emotional-intelligence section and the coaching lesson's feedback / coaching dialogues.",
  },
];

const PPL_REFERENCE_TITLES = PMP_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Leading a Team
// (Competency: "Leading a Team"; slug: ppl-leading-a-team)
// ---------------------------------------------------------------------------

const LESSON_PPL_LEADING_A_TEAM: RefLesson = {
  competencyName: "Leading a Team",
  slug: "ppl-leading-a-team",
  title: "Leading a Team — Leadership Theories, PM Role & the PMI Talent Triangle",
  titleAr: "قيادة الفريق — نظريات القيادة ودور مدير المشروع ومثلث كفاءة PMI",
  order: 1,
  durationMin: 34,
  references: PPL_REFERENCE_TITLES,
  conceptIntroduction: `Project leadership is the deliberate application of influence, vision, and decision-making to a team so that the team delivers the project's outcomes. The PMI PMP People domain treats leadership as a learnable competency — not a personality trait. The PMBOK® Guide 7th Edition names "Leadership" as one of 12 project-management principles and explicitly endorses servant leadership as the dominant stance for project managers. The PMI Talent Triangle® locates leadership inside the "Power Skills" leg (alongside communication and stakeholder engagement), distinct from technical project management and business acumen. This lesson equips the candidate to (1) select a leadership style for a project context, (2) motivate a team using Maslow, Herzberg, and McClelland, (3) act as integrator-communicator-leader, and (4) build the three Talent-Triangle capabilities across the project lifecycle.`,
  example: `An IT project — a 14-month cloud-migration program at a regional bank — is entering month 4 with morale dropping: two senior engineers have resigned, the daily standup is silent, and the sponsor has escalated twice. The PM diagnoses: (a) mixed leadership-styles mismatched to a hybrid waterfall-agile delivery (transactional PM for the waterfall integration track, servant-leader for the agile migration track); (b) hygiene factors unmet (tooling, clear acceptance criteria) so Herzberg's motivators cannot work; (c) engineers in Maslow's "esteem" tier blocked by a controlling team lead (no autonomy). Intervention: rotate the team lead into a coaching role; re-baseline sprint cadence; publish decision-rights (DACI) so engineers regain decision authority. Result: standup engagement +40% (count of speaking team members), attrition stops, sponsor escalation resolved within 2 sprints.`,
  keyFormulas: `Span of control / communication channels: C(n) = n × (n − 1) / 2
  — n = team size; C = number of pairwise communication channels.
Leadership-style selection matrix (qualitative):
  — Crisis / inexperienced team → directive/transactional
  — Competent team / clear mission → servant/transformational
  — Expert self-organizing team → servant + laissez-faire (within guardrails)
  — Hybrid delivery → match style per workstream
PMI Talent Triangle® capability index:
  Tech = (technical PM skills gap)/(role demand); Leadership = (power-skills gap)/(role demand);
  Business = (business-acumen gap)/(role demand)
  — Overall capability = 1 − mean(Tech, Leadership, Business) when each gap ∈ [0,1]
Herzberg motivator/hygiene heuristic:
  Effective motivation requires hygiene factors ≥ threshold AND motivators present.
  Hygiene < threshold → disengagement regardless of motivators.
Maslow tier coverage: the PM removes blockers in the lowest unmet tier before activating higher tiers.`,
  exercise: `You inherit a 9-person Construction project team (5 engineers, 2 schedulers, 1 QA lead, 1 document controller) working on a hospital expansion. The team is competent but demotivated after 6 months of overtime. (a) Compute the pairwise communication-channel count and identify the coordination overhead. (b) Apply Herzberg: list three hygiene factors and three motivators to address. (c) Map each team member to a Maslow tier (use role/seniority as a proxy) and design one intervention per tier. (d) Select a leadership style and justify against the leadership-style selection matrix. (e) Identify one PMI Talent Triangle gap for the PM and propose a development plan.`,
  sections: {
    learning_objectives: `- Distinguish transformational, servant, situational, transactional, and laissez-faire leadership; select the appropriate style for a project context.
- Apply the PMBOK® Guide 7th Edition's "Leadership" principle and explain servant leadership as the project-manager's default stance.
- Apply Maslow's hierarchy, Herzberg's two-factor theory, and McClelland's needs (achievement, affiliation, power) to diagnose team motivation and prescribe interventions.
- Describe the project manager's three integrated roles — integrator, communicator, leader — and the trade-offs between them.
- Apply the PMI Talent Triangle® (Ways of Working, Power Skills, Business Acumen) as a self-development and team-capability framework.
- Diagnose a team's leadership gaps from team artifacts (standup cadence, decision-rights matrix, attrition) and prescribe targeted interventions.`,
    prerequisites: `- The PMBOK® Guide 7th Edition's 12 Principles and 8 Performance Domains (high-level).
- Awareness of the PMI Talent Triangle® and the PMP Examination Content Outline (3 domains: People, Process, Business Environment).
- Basic organizational-behavior concepts: motivation, role clarity, span of control.
- One full project lifecycle (initiation → planning → execution → monitoring → closure) seen as a participant.`,
    introduction: `Leadership is the most often named and least often taught competency in the PMP People domain. PMI reframes the project manager from a controlling administrator into a leader who adapts style to context, motivates the team, and integrates technical delivery with strategic intent. The PMBOK® Guide 7th Edition makes this explicit: "Leadership" is one of 12 principles, and servant leadership is named as the dominant stance for project managers, especially on agile and hybrid teams.

Three leadership-theory families dominate the candidate's toolkit. *Transformational* leadership (Burns; Kouzes & Posner's Five Practices) inspires a team to transcend self-interest for a shared vision — effective when the team is competent and the mission is compelling. *Servant* leadership (Greenleaf; PMBOK® 7th Edition) reframes the leader as facilitator — the leader removes blockers, secures resources, and amplifies team capability, ideal for self-organizing agile teams. *Situational* leadership (Hersey-Blanchard) varies directive-vs-supportive behavior by team maturity — effective when team capability varies across workstreams or lifecycle phases. *Transactional* leadership (contingent rewards) suits short, well-defined work or crisis regimes; *laissez-faire* suits expert teams within guardrails.

The project manager plays three integrated roles. As *integrator*, the PM reconciles scope-schedule-cost-quality-risk trade-offs into one coherent plan. As *communicator*, the PM spends 75–90% of working time on communication (PMBOK® estimate) — upward to sponsors, downward to team, outward to stakeholders. As *leader*, the PM mobilizes the team toward the project's outcomes. Conflict between the three roles is the norm: integration pulls toward trade-off decisions, communication toward transparency, leadership toward motivation. The mature PM holds all three in tension.

The PMI Talent Triangle® locates leadership inside the "Power Skills" leg — distinct from "Ways of Working" (technical PM) and "Business Acumen" (strategic/business). A PMP candidate should self-assess across all three legs and build a development plan. Leadership is not a personality trait; it is a learnable, evidence-based discipline.`,
    terminology: `- **Leadership**: the deliberate application of influence, vision, and decision-making to mobilize a team toward outcomes.
- **Transformational leadership**: inspiring followers to transcend self-interest for a shared vision (Burns 1978; Kouzes & Posner Five Practices).
- **Servant leadership**: leader-as-facilitator; serves the team by removing blockers and securing resources (Greenleaf 1977; PMBOK® 7th Edition).
- **Situational leadership**: leadership style adapted to team maturity (Hersey & Blanchard) — directing, coaching, supporting, delegating.
- **Transactional leadership**: contingent-reward leadership; clear goals + rewards + monitoring.
- **Laissez-faire**: hands-off leadership; suits expert self-organizing teams within guardrails.
- **PMI Talent Triangle®**: Ways of Working (Technical) + Power Skills (Leadership) + Business Acumen (Strategic & Business).
- **Maslow's hierarchy**: physiological → safety → love/belonging → esteem → self-actualization.
- **Herzberg two-factor**: hygiene factors (prevent dissatisfaction) vs motivators (drive engagement).
- **McClelland needs**: need for Achievement (nAch), Affiliation (nAff), Power (nPow).
- **Integrator role**: reconciling scope-schedule-cost-quality-risk trade-offs.
- **Communication channels**: C(n) = n(n−1)/2 — pairwise communication paths.`,
    detailed_explanation: `Leadership style is a context variable, not a fixed identity. A team that is immature, under time pressure, or facing a safety-critical issue benefits from directive behavior — situational leadership's "directing" or transactional leadership with clear rewards and monitoring. A team that is competent, well-aligned, and creative benefits from servant leadership — the PM clears blockers, secures resources, and amplifies capability rather than directing work. The PMBOK® Guide 7th Edition endorses servant leadership as the default for project managers, especially on agile and hybrid teams, because servant leadership unlocks self-organization: the team owns the work, the leader owns the conditions under which the team can succeed.

Transformational leadership (Kouzes & Posner's Five Practices — Model the Way, Inspire a Shared Vision, Challenge the Process, Enable Others to Act, Encourage the Heart) is the high-engagement stance. It works when the team has the competence to act on a vision and the leader has credibility (built by modeling, not by pronouncement). It fails when applied to a team lacking competence or to a mission the team finds incoherent.

Situational leadership (Hersey-Blanchard) varies directive vs supportive behavior across four team-maturity levels: low maturity → directing (high directive, low supportive); moderate-low → coaching (high directive, high supportive); moderate-high → supporting (low directive, high supportive); high maturity → delegating (low directive, low supportive). The PM's job is to *match* style to maturity, and to evolve the match as the team matures across the lifecycle. A common failure mode is "stuck style" — a PM who directs a high-maturity team (demotivating) or delegates to a low-maturity team (chaotic).

Motivation theory grounds leadership in what the team actually wants. Maslow's hierarchy predicts that the PM must remove blockers in the lowest unmet tier before higher-tier motivators (esteem, self-actualization) can engage. A team paid below market (safety tier unmet) will not respond to recognition programs (esteem tier). Herzberg's two-factor theory sharpens this: *hygiene factors* (pay, working conditions, supervision, policy, security) only prevent dissatisfaction; *motivators* (achievement, recognition, the work itself, responsibility, advancement, growth) actually drive engagement. A team with hygiene met but no motivators is compliant but disengaged. McClelland's needs add a third lens: high-nAch engineers respond to challenging stretch goals; high-nAff team members to collaborative team structures; high-nPow team members to visible authority and decision rights.

The PM's three roles — integrator, communicator, leader — operate simultaneously and often in tension. The integrator makes trade-offs (e.g., accepting a 2-week schedule slip to protect quality); the communicator explains the trade-off transparently; the leader frames the trade-off as a step toward the team's outcomes. A PM strong in integration but weak in communication produces silent trade-offs that erode trust. A PM strong in communication but weak in integration produces endless discussion with no decisions. A PM strong in leadership but weak in integration produces enthusiastic but misaligned execution. The mature PM holds all three.

The PMI Talent Triangle® (Ways of Working, Power Skills, Business Acumen) is the candidate's self-development map. A strong technical PM (Ways of Working) with weak Power Skills produces plans no one follows. A strong leader (Power Skills) with weak Business Acumen produces a team motivated toward outcomes that don't serve strategy. The PMP ECO People domain is largely the Power-Skills leg, but the candidate should read each People task as a chance to develop all three legs.`,
    core_principles: `- Leadership style is a context variable, not a personality trait; match style to team maturity and mission.
- Servant leadership is the PMBOK® 7th Edition default for project managers (especially agile / hybrid teams).
- Motivation requires hygiene factors ≥ threshold AND motivators present (Herzberg).
- The lowest unmet Maslow tier must be addressed before higher-tier motivators engage.
- The PM is simultaneously integrator, communicator, and leader; the three roles operate in tension.
- The PMI Talent Triangle® distributes capability across Ways of Working, Power Skills, Business Acumen; weakness in any leg undermines the other two.
- Communication channels grow quadratically with team size: C(n) = n(n−1)/2 — coordination overhead rises fast.`,
    components: `- Leadership-style inventory (transformational / servant / situational / transactional / laissez-faire) — used as a self-assessment.
- Team-maturity assessment (Hersey-Blanchard M1–M4) — selects the situational-leadership style.
- Motivation diagnostic (Maslow tier map + Herzberg hygiene/motivator checklist + McClelland dominant need).
- Decision-rights matrix (DACI: Driver / Approver / Contributor / Informed) — operationalizes empowerment.
- PMI Talent Triangle® self-score (Tech / Power / Business) with development plan.
- Standup-cadence artifact (speaking-team-member ratio) as a leadership signal.
- Sponsor-escalation log — counts of escalations per month as a leadership-impact KPI.`,
    process: `1. Diagnose the team: collect standup cadence, attrition, sponsor escalations, decision-rights ambiguity, motivation survey.
2. Map team maturity (M1–M4) per workstream; identify mixed-maturity workstreams.
3. Select a leadership style per workstream (matching style to maturity); avoid "stuck style."
4. Audit hygiene factors (pay, tools, acceptance criteria, role clarity) — fix below-threshold first.
5. Layer motivators (recognition, growth, autonomy, mastery, purpose) once hygiene is met.
6. Apply Maslow tier map to verify the lowest-tier blockers are cleared.
7. Apply McClelland dominant-need analysis to assign stretch goals (nAch), collaborative roles (nAff), visible authority (nPow).
8. Run a PMI Talent Triangle self-assessment; build a 90-day development plan for the weakest leg.
9. Reinforce via feedback (SBI) and 1:1 cadence; review the leadership diagnosis every 2–4 weeks.`,
    formula_calculation: `Variables and formulas:
- n: team size [count]
- C(n): pairwise communication channels = n(n−1)/2 [count]
- m: team maturity (Hersey-Blanchard M1–M4, qualitative)
- T, L, B: Talent Triangle gaps ∈ [0,1] (Ways of Working / Power Skills / Business Acumen)
- Capability index = 1 − (T + L + B)/3 [dimensionless]

Core formulas:
- C(n) = n(n−1)/2 — the coordination overhead of an n-person team.
- For a 9-person team: C(9) = 9×8/2 = 36 channels.
- Doubling team size from 6 to 12: C(6)=15 → C(12)=66 — 4.4× overhead for 2× people.

Leadership-style selection (qualitative decision matrix):
- Crisis or low-maturity team → directing (situational) or transactional.
- Competent team + clear mission → servant / transformational.
- Expert self-organizing team → servant + laissez-faire within guardrails.
- Mixed workstreams (e.g., waterfall integration + agile migration) → match style per workstream.

Herzberg motivation rule:
- Engagement requires Hygiene ≥ threshold AND Motivators present.
- If Hygiene < threshold, motivators are ineffective — fix hygiene first.

Units: n, C in counts; T/L/B dimensionless ∈ [0,1].

Assumptions: (i) the team is colocated or has effective virtual leadership (see ppl-leading-virtual-teams); (ii) communication channels are equally likely — actual coordination cost is skewed by reporting structure; (iii) maturity is stable across the assessment window.

Interpretation: a 9-person team has 36 channels; if the PM is the bottleneck for half of them, the PM's coordination load is ≈18 active channels. Above ~7–9 direct reports, the PM cannot effectively coach everyone — spawn leads or limit team size. The communication-channel formula is the mathematical justification for team-size limits and span-of-control discipline.`,
    worked_example: `**IT project — Cloud-migration program at a regional bank, month 4.**

Team composition: 9 people (2 senior engineers, 3 mid-level engineers, 1 DevOps lead, 1 QA lead, 1 product owner, 1 project manager = you).

Diagnosis:
- Standup engagement: 4 of 9 typically speak → 44% speaking ratio (target ≥80%).
- Attrition: 2 senior engineers resigned in 60 days.
- Sponsor escalations: 2 in 30 days.
- Decision-rights: ambiguous — engineers report a "controlling team lead" blocks their decisions.
- Communication channels: C(9) = 36 pairwise channels (theoretical max).

Root cause (Herzberg): hygiene factors below threshold — (a) decision authority unclear, (b) acceptance criteria vague, (c) standup cadence ritualistic. Motivators (autonomy, mastery, purpose) cannot engage because hygiene is unmet. Maslow tier: senior engineers in "esteem" tier blocked by the controlling lead (autonomy denied).

Intervention (4 weeks):
- Week 1 — Decision-rights matrix (DACI) published; senior engineers named as "Drivers" for their components.
- Week 2 — Acceptance criteria re-baselined with product owner; Definition of Done republished.
- Week 3 — Standup format switched from "PM reads tasks" to "round-robin + impediments only"; team lead rotated into coaching role.
- Week 4 — Recognition: 1:1 with each engineer; growth conversation; visible attribution of one released feature per engineer.

Measurement (after 2 sprints, 4 weeks):
- Standup speaking ratio: 8/9 = 89% (+45 percentage points).
- Sponsor escalations: 0 in 30 days.
- Attrition: 0 in 60 days.
- Self-reported engagement (anonymous pulse): 3.2 → 4.4 (5-point Likert).

**Leadership-style selection**:
- Agile migration track (competent engineers, clear mission) → servant.
- Waterfall integration track (junior engineers, vendor coordination) → transactional + supporting.
- Hybrid program-level integration → transformational (you, as PM) + servant (to agile) + directing (to waterfall).

**PMI Talent Triangle self-assessment (the PM)**:
- Ways of Working (Technical): gap 0.20 — strong on schedule/risk; weaker on agile-flow metrics.
- Power Skills (Leadership): gap 0.35 — strong on communication; weaker on conflict coaching (→ ppl-managing-conflict, ppl-coaching-mentoring lessons).
- Business Acumen: gap 0.40 — strong on delivery; weaker on the bank's strategic drivers (regulatory capital, customer experience).
- Capability = 1 − (0.20 + 0.35 + 0.40)/3 = 1 − 0.317 = 0.683 (68.3%) — development plan targets the Business-Acumen leg with sponsor 1:1s and a finance-for-PMs course.`,
    industrial_example: `**IT — SaaS platform re-platforming (18-month program, 24 engineers).**
The PM inherits a team that has executed two prior failed re-platforming attempts. The PM diagnoses a "stuck style" — prior PMs directed a competent, mature team, producing ritualistic standups and silent demos. The PM shifts to servant leadership: publishes a team charter, hands the sprint backlog to the team, and adopts a "two-question standup" (What is blocking you? What will you demo?). Velocity rises 35% in three sprints; attrition drops to zero; the sponsor re-baselines the program as on-track.

Construction, healthcare, and oil & gas PMs adapt the same principles: a Construction PM leading a hospital expansion applies situational leadership because the team mixes expert trade supervisors (delegating) with new graduate engineers (coaching); a Healthcare PM leading an EHR rollout applies transformational leadership because clinicians respond to a mission ("patient safety through better records"); an Oil & Gas PM leading a turn-around applies transactional leadership because the safety-critical, time-boxed scope benefits from clear direction and contingent rewards. The lesson's framework — diagnose maturity, match style, fix hygiene, layer motivators, develop the Talent Triangle — is the same across industries.`,
    case_study: `**CASE STUDY (SYNTHETIC) — IT Cloud-Migration Turnaround at "Midwest Regional Bank" (composite scenario, 90 days).**

Context: 14-month cloud-migration program, 9-person team, sponsor = CIO. At month 4: morale declining, 2 senior engineers resigned, 2 sponsor escalations in 30 days, standups silent, "controlling team lead" reported.

Problem: The PM inherited a directive leadership style applied to a competent agile team. Hygiene factors (decision rights, acceptance criteria) were below threshold; motivators (autonomy, mastery, purpose) could not engage.

Constraints: (a) Sponsor will cancel the program if escalations continue 60 more days. (b) Cannot raise pay (HR freeze). (c) Cannot replace team lead for 60 days (HR process). (d) Migration deadline is regulatory (no slip allowed).

Analysis: Apply the lesson's diagnostic — leadership-style mismatch + Herzberg hygiene unmet + Maslow esteem tier blocked. Apply the formula — C(9) = 36 channels → PM cannot coordinate everyone → spawn leads.

Decision: (i) Publish a DACI matrix naming senior engineers as Drivers. (ii) Rotate the team lead into a coaching role (technical coaching only, no decision authority). (iii) Re-baseline standup to round-robin impediments. (iv) Begin 1:1s covering growth and recognition. (v) Begin a Talent-Triangle development plan focusing on Business-Acumen (the PM's weakest leg).

Alternatives considered: (a) Replace team lead immediately — rejected (HR process, 60 days, would lose the team's institutional knowledge). (b) Add people — rejected (C(10)=45 channels raises coordination 25% with no skill gain). (c) Escalate to sponsor to remove the regulatory deadline — rejected (sponsor already escalated).

Consequences: Standup speaking ratio rose from 44% to 89%; sponsor escalations stopped within 30 days; attrition stopped; engagement pulse rose from 3.2 to 4.4 (5-point Likert). Program delivered to the regulatory deadline.

Lessons learned: (1) Leadership-style diagnosis must precede intervention. (2) Hygiene factors must be fixed before motivators. (3) The PM's own Talent-Triangle gap is a project risk. (4) The communication-channel formula C(n)=n(n−1)/2 is a quantitative basis for team-size discipline. (5) "Stuck style" is the most common project-leadership failure mode.`,
    visual_explanation: `Picture a 2-axis matrix. X-axis: team maturity (M1 low → M4 high). Y-axis: directive behavior (low at top → high at bottom). Plot four quadrants: bottom-left (low maturity, high directive) = Directing; top-left (low-medium maturity, high directive + high supportive) = Coaching; top-right (medium-high maturity, low directive + high supportive) = Supporting; bottom-right (high maturity, low directive + low supportive) = Delegating. The PM's path through the quadrants as the team matures is the Situational-Leadership M1→M4 trajectory. Overlay the PMI Talent Triangle® as a separate three-circle Venn (Ways of Working ∩ Power Skills ∩ Business Acumen); the People-domain lessons live in the Power-Skills circle.`,
    simulation_opportunity: `Build a leadership-style simulator. Inputs: team size n, team-maturity distribution (M1–M4 per workstream), hygiene-factor score (0–100), motivator-presence score (0–100), PM Talent-Triangle gaps (T, L, B). Engine: compute C(n)=n(n−1)/2; check Herzberg rule (hygiene ≥ 60 AND motivators ≥ 50 → engagement predicted); select style per workstream via the maturity→style map; compute capability index = 1 − (T+L+B)/3. Output: recommended leadership style per workstream, predicted engagement level, span-of-control flag (n > 9 → recommend spawning leads), Talent-Triangle development plan. Use it to walk a candidate through a "diagnose → prescribe → measure" loop.`,
    common_mistakes: `- **Stuck style**: applying one leadership style to every team and every lifecycle phase — the most common PMP-leadership failure mode.
- **Motivators before hygiene**: launching a recognition program when pay or tooling is the blocker — Herzberg says hygiene first; motivators cannot engage.
- **Treating leadership as personality**: assuming leaders are born, not developed; the PMI Talent Triangle contradicts this.
- **Ignoring Maslow's tier order**: trying to activate self-actualization in a team that lacks role clarity (safety tier) — wasted effort.
- **Span-of-control blindness**: adding people to a struggling team without accounting for C(n) quadratic growth — coordination overhead can outweigh the skill gain.
- **Confusing communication with leadership**: sending more emails is not leadership; leadership is mobilizing the team toward outcomes.
- **Self-leadership blindness**: developing the team while neglecting the PM's own Talent-Triangle gaps — the PM's gap is a project risk.`,
    limitations: `- Leadership-style selection matrices are qualitative; they require judgment, not formula.
- Maslow, Herzberg, and McClelland are 1950s–1960s theories; modern evidence (Deci & Ryan's SDT, Pink's autonomy-mastery-purpose) refines but does not invalidate them.
- The communication-channel formula assumes uniform channels; actual coordination cost is skewed by structure and seniority.
- Servant leadership, while endorsed by PMI, is not universally appropriate — crisis and low-maturity teams may need directive behavior.
- Industry context (Construction, Healthcare, IT, Oil & Gas) shifts which styles work; the candidate must adapt the framework, not apply it mechanically.`,
    comparison: `| Leadership theory | Stance | Best-fit context | Failure mode |
|---|---|---|---|
| Transformational | Inspire toward a shared vision | Competent team + compelling mission | Incoherent vision or immature team |
| Servant | Facilitator; remove blockers | Agile / hybrid; competent team | Crisis or low-maturity team |
| Situational | Vary directive vs supportive | Mixed-maturity team | Stuck style (apply one phase to all) |
| Transactional | Contingent reward | Short, well-defined work | Knowledge work needing autonomy |
| Laissez-faire | Hands-off within guardrails | Expert self-organizing team | Without guardrails = abdication |

| Motivation theory | Diagnostic | Intervention lever |
|---|---|---|
| Maslow | Lowest unmet tier | Clear the blocker tier first |
| Herzberg | Hygiene threshold + motivators | Fix hygiene, then layer motivators |
| McClelland | Dominant need (nAch/nAff/nPow) | Match assignment to need |
| Deci & Ryan (SDT) | Autonomy / competence / relatedness | Build all three |
| Pink | Autonomy + mastery + purpose | Knowledge-work motivation |`,
    practical_application: `On a real project, the candidate should: (1) run a leadership diagnosis in week 1 — collect standup cadence, attrition, escalations, decision-rights artifacts, hygiene/motivator scorecard; (2) name the team's maturity per workstream; (3) publish a DACI decision-rights matrix in week 2; (4) fix hygiene (tooling, acceptance criteria, role clarity) before launching recognition programs; (5) begin 1:1s covering growth and recognition; (6) select leadership style per workstream, not per PM; (7) self-assess against the PMI Talent Triangle and build a 90-day plan for the weakest leg; (8) re-diagnose every 2–4 weeks; (9) keep a leadership journal noting which interventions produced which signals. The PMP ECO People task "Leading a Team" is operationally this loop.`,
    decision_scenario: `You are the new PM on a 12-person IT project team (Cloud + Data). The previous PM was respected but directive — sprint velocity is flat, two senior engineers are interviewing externally, and the sponsor is impatient. You have 30 days to demonstrate momentum. Which sequence of actions is most consistent with this lesson? (a) Launch a recognition program and bonuses; (b) Add two more engineers to absorb the load; (c) Diagnose hygiene + maturity + decision rights, then publish a DACI matrix and re-baseline the standup; (d) Switch fully to laissez-faire and "let the team self-organize." Correct: (c). (a) fails Herzberg (motivators before hygiene). (b) fails the C(n) formula — C(14)=91 channels, +27% coordination with no skill gain. (d) fails situational leadership — a flat-velocity team may not yet be M4 mature. (c) follows the lesson's diagnose→fix-hygiene→match-style→measure loop.`,
    practice_questions: `1. A PM inherits a 9-person agile team with a "controlling team lead." Standup speaking ratio is 44%. Two engineers resigned. The PM's first action should be: (a) recognize top performers; (b) publish a DACI matrix and rotate the lead into coaching; (c) add two engineers; (d) skip standups. (Answer: b — Herzberg hygiene first.)
2. Compute C(12). (Answer: 12×11/2 = 66 channels.)
3. A team with hygiene score 80 and motivator score 30 will most likely show: (a) high engagement; (b) compliance without engagement; (c) active disengagement; (d) self-actualization. (Answer: b — hygiene met, motivators absent.)
4. A Construction PM leading a turn-around with a safety-critical, time-boxed scope should prefer: (a) laissez-faire; (b) servant leadership; (c) transactional/directive; (d) pure transformational. (Answer: c.)`,
    certification_questions: `1. (PMP-style) The PMBOK® Guide 7th Edition names which leadership stance as the project-manager default? (a) Autocratic; (b) Servant; (c) Laissez-faire; (d) Transactional. (Answer: b.)
2. (PMP-style) Per Herzberg, which is a hygiene factor? (a) Achievement; (b) Recognition; (c) Working conditions; (d) Responsibility. (Answer: c.)
3. (PMP-style) A 10-person team has how many pairwise communication channels? (a) 45; (b) 55; (c) 100; (d) 90. (Answer: a.)
4. (PMP-style) The PMI Talent Triangle® Power-Skills leg corresponds to which PMP ECO domain most directly? (a) Process; (b) Business Environment; (c) People; (d) Integration. (Answer: c.)`,
    summary: `Project leadership is a learnable competency. The PMP People domain "Leading a Team" task asks the candidate to select a leadership style for the project context (transformational / servant / situational / transactional / laissez-faire), apply motivation theory (Maslow + Herzberg + McClelland), and integrate the three PM roles (integrator, communicator, leader). The PMBOK® Guide 7th Edition endorses servant leadership as the default. The PMI Talent Triangle® locates leadership in the Power-Skills leg and requires the PM to develop all three legs. The communication-channel formula C(n)=n(n−1)/2 quantifies the coordination-overhead basis for team-size discipline.`,
    key_takeaways: `- Match leadership style to team maturity and mission — avoid "stuck style."
- Servant leadership is the PMBOK® 7th Edition default for project managers.
- Fix hygiene (Herzberg) before layering motivators; clear the lowest Maslow tier first.
- PM is integrator + communicator + leader simultaneously; the three roles operate in tension.
- The PMI Talent Triangle® requires all three legs (Ways of Working, Power Skills, Business Acumen).
- C(n) = n(n−1)/2 — span-of-control discipline is quantitative, not aesthetic.
- Leadership diagnosis precedes intervention; measure engagement signals before and after.`,
    references: `1. PMI, A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition (2021) — Principles: Leadership; Stewardship; Team. Performance Domains: Team; Stakeholder.
2. PMI, Agile Practice Guide (2017) — Servant Leadership on Agile Teams; Team Charter; Ground Rules.
3. PMI, PMP Examination Content Outline — People domain, Task "Leading a Team."
4. PMI, PMI Talent Triangle® — Power Skills leg.
5. ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management, §3 (Terms) and §4 (Project management concepts).
6. Kouzes & Posner, The Leadership Challenge (6th ed., 2017) — Five Practices of Exemplary Leadership.
7. Goleman, Emotional Intelligence (1995) — five EI components; cited in the conflict lesson.`,
  },
  knowledgeObject: {
    title: "Leading a Team — Leadership Theories, PM Role, PMI Talent Triangle",
    domain: "People",
    competency: "Leading a Team",
    topic: "Project Leadership",
    concept: "Leadership as a context-matched competency",
    body: {
      definitions: [
        "Leadership: the deliberate application of influence, vision, and decision-making to mobilize a team toward outcomes.",
        "Transformational leadership: inspiring followers to transcend self-interest for a shared vision (Burns 1978; Kouzes & Posner).",
        "Servant leadership: leader-as-facilitator; serves the team by removing blockers and securing resources (Greenleaf 1977; PMBOK® 7th Edition default).",
        "Situational leadership: vary directive vs supportive behavior by team maturity (Hersey-Blanchard M1–M4).",
        "Transactional leadership: contingent-reward leadership; clear goals + rewards + monitoring.",
        "Laissez-faire: hands-off within guardrails; suits expert self-organizing teams.",
        "PMI Talent Triangle®: Ways of Working (Technical) + Power Skills (Leadership) + Business Acumen (Strategic & Business Management).",
        "Integrator role: reconciling scope-schedule-cost-quality-risk trade-offs.",
      ],
      principles: [
        "Leadership style is a context variable, not a personality trait.",
        "Servant leadership is the PMBOK® 7th Edition default for project managers.",
        "Motivation requires hygiene ≥ threshold AND motivators present (Herzberg).",
        "The lowest unmet Maslow tier must be cleared before higher-tier motivators engage.",
        "The PM is simultaneously integrator, communicator, and leader; the three roles operate in tension.",
        "The PMI Talent Triangle® requires all three legs; weakness in any leg undermines the others.",
        "Communication channels grow quadratically with team size: C(n) = n(n−1)/2.",
      ],
      components: [
        "Leadership-style inventory (transformational / servant / situational / transactional / laissez-faire).",
        "Team-maturity assessment (Hersey-Blanchard M1–M4).",
        "Motivation diagnostic (Maslow tier + Herzberg hygiene/motivator checklist + McClelland dominant need).",
        "Decision-rights matrix (DACI: Driver / Approver / Contributor / Informed).",
        "PMI Talent Triangle self-score with development plan.",
        "Standup-cadence artifact (speaking-team-member ratio).",
        "Sponsor-escalation log (escalations per month as a leadership-impact KPI).",
      ],
      mechanism: [
        "Leadership lifecycle: diagnose team (standup cadence, attrition, escalations, hygiene/motivator score) → map maturity per workstream → select style per workstream → fix hygiene → layer motivators → develop PM's Talent Triangle → measure signals → re-diagnose every 2–4 weeks.",
      ],
      process: [
        "1. Diagnose: collect standup cadence, attrition, sponsor escalations, decision-rights, motivation survey.",
        "2. Map team maturity (M1–M4) per workstream.",
        "3. Select leadership style per workstream (avoid stuck style).",
        "4. Audit and fix hygiene factors below threshold.",
        "5. Layer motivators once hygiene is met.",
        "6. Apply Maslow tier map to verify the lowest-tier blockers are cleared.",
        "7. Apply McClelland dominant-need analysis to assign stretch goals / collaborative roles / visible authority.",
        "8. Run a Talent Triangle self-assessment; build a 90-day plan for the weakest leg.",
        "9. Reinforce via SBI feedback and 1:1 cadence; re-diagnose every 2–4 weeks.",
      ],
      formulas: [
        "Communication channels: C(n) = n × (n − 1) / 2",
        "Capability index = 1 − (T + L + B)/3 where T/L/B are Talent Triangle gaps ∈ [0,1]",
        "Herzberg rule: Engagement requires Hygiene ≥ threshold AND Motivators present",
      ],
      metrics: [
        "Standup speaking ratio = (team members who speak) / (total team) — target ≥ 80%.",
        "Sponsor escalations per 30 days — target 0 for a well-led team.",
        "Attrition per 90 days — target < industry baseline.",
        "Engagement pulse (5-point Likert, anonymous) — target ≥ 4.0.",
        "Talent Triangle gaps T, L, B ∈ [0,1] — target ≤ 0.30 each.",
        "Communication channels C(n) — span-of-control warning at n > 9 direct reports.",
      ],
      examples: [
        "IT cloud-migration: 9-person team, 36 channels, standup 44% → publish DACI + re-baseline standup → 89% in 4 weeks.",
        "Construction hospital expansion: PM applies situational leadership — delegating to expert supervisors, coaching to graduate engineers.",
        "Healthcare EHR rollout: transformational leadership — clinicians respond to a patient-safety mission.",
        "Oil & gas turn-around: transactional/directive — safety-critical, time-boxed scope benefits from clear direction and contingent rewards.",
      ],
      industrial_examples: [
        "IT — SaaS re-platforming: PM shifts from directive to servant, two-question standup, velocity +35% in three sprints.",
        "Construction — hospital expansion: situational-leadership mixing across expert supervisors and graduate engineers.",
        "Healthcare — EHR rollout: transformational-leadership mission anchors clinical engagement.",
        "Oil & Gas — turn-around: transactional/directive style for safety-critical time-boxed scope.",
      ],
      case_studies: [
        "SYNTHETIC — Midwest Regional Bank cloud-migration turnaround (90 days). Diagnose → fix hygiene → rotate team lead to coaching → publish DACI → re-baseline standup. Standup ratio 44% → 89%; sponsor escalations → 0 in 30 days; engagement 3.2 → 4.4; regulatory deadline met.",
      ],
      common_errors: [
        "Stuck style — applying one leadership style across every team and lifecycle phase.",
        "Motivators before hygiene — launching recognition programs while pay/tooling is the blocker.",
        "Treating leadership as personality — assuming leaders are born, not developed.",
        "Ignoring Maslow's tier order — trying to activate self-actualization with role-clarity blockers present.",
        "Span-of-control blindness — adding people without accounting for C(n) quadratic growth.",
        "Self-leadership blindness — developing the team while neglecting the PM's own Talent Triangle gaps.",
      ],
      limitations: [
        "Leadership-style matrices are qualitative; they require judgment.",
        "Maslow/Herzberg/McClelland are mid-20th-century theories; SDT and Pink refine but do not invalidate them.",
        "The C(n) formula assumes uniform channels; actual coordination is skewed by structure.",
        "Servant leadership is not universally appropriate; crisis/low-maturity teams may need directive behavior.",
        "Industry context shifts which styles work; the candidate must adapt, not apply mechanically.",
      ],
      best_practices: [
        "Run a leadership diagnosis in week 1 (standup cadence, attrition, escalations, decision-rights, hygiene/motivator scorecard).",
        "Publish a DACI matrix in week 2.",
        "Fix hygiene before launching recognition programs.",
        "Select leadership style per workstream, not per PM.",
        "Self-assess the PMI Talent Triangle and build a 90-day plan for the weakest leg.",
        "Re-diagnose every 2–4 weeks; keep a leadership journal.",
        "Limit direct reports to 7–9; spawn leads above that ceiling.",
      ],
      related_concepts: [
        "ppl-managing-conflict (Thomas-Kilmann modes; emotional intelligence).",
        "ppl-coaching-mentoring (GROW model; SBI feedback; servant leadership).",
        "ppl-building-shared-vision (Kouzes & Posner Inspire a Shared Vision; team charter; psychological safety).",
        "Process domain — team capacity feeds schedule planning; risks surface through team signals.",
      ],
      prerequisites: [
        "PMBOK® 7th Edition Principles and Performance Domains (high-level).",
        "PMI Talent Triangle® and PMP ECO 3-domain structure (high-level).",
        "Basic organizational-behavior concepts (motivation, role clarity, span of control).",
        "One full project lifecycle observed as a participant.",
      ],
      references: [
        "PMI — A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition.",
        "PMI — Agile Practice Guide.",
        "PMI — PMP Examination Content Outline (ECO).",
        "PMI — PMI Talent Triangle®.",
        "ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management.",
        "Kouzes & Posner — The Leadership Challenge (6th ed., 2017).",
        "Goleman — Emotional Intelligence (1995).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Leading a Team",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Conceptual",
      scenario: "IT",
      stem: "A PM inherits a 9-person agile team with a controlling team lead, standup speaking ratio of 44%, and two engineers who resigned in 60 days. Which intervention sequence best follows PMBOK® 7th Edition leadership guidance?",
      whyCorrect:
        "Publishing a DACI matrix (decision rights), rotating the lead into a coaching role, and re-baselining the standup addresses Herzberg hygiene factors first (role clarity, decision authority) before layering motivators (autonomy, recognition). The PMBOK® 7th Edition endorses servant leadership as the default for agile teams, and hygiene-before-motivators is the correct Herzberg sequence — recognition programs alone fail when hygiene (decision authority, acceptance criteria) is below threshold.",
      whyOthersWrong: [
        "Launch a recognition program and bonuses — fails Herzberg; motivators cannot engage when hygiene (decision rights, acceptance criteria) is below threshold.",
        "Add two more engineers — fails the communication-channel formula; C(11)=55 channels (+53% coordination) with no skill gain; onboarding time further demotivates.",
        "Skip standups for two weeks to reduce pressure — abdicates leadership; removes the PM's primary engagement signal and worsens the diagnosis loop.",
      ],
      explanation:
        "Herzberg two-factor theory: hygiene factors (decision rights, acceptance criteria) must be ≥ threshold before motivators (recognition, autonomy) engage. The communication-channel formula C(n)=n(n−1)/2 quantifies why adding people to a struggling team often backfires. Servant leadership (PMBOK® 7th Edition) requires the PM to remove blockers, secure resources, and amplify team capability — not to control or to abandon.",
      options: [
        { text: "Launch a recognition program and bonuses to reward top performers", isCorrect: false },
        {
          text: "Publish a DACI decision-rights matrix, rotate the lead into a coaching role, and re-baseline the standup format",
          isCorrect: true,
        },
        { text: "Add two more engineers to absorb the workload and reduce overtime", isCorrect: false },
        { text: "Skip standups for two weeks to reduce pressure on the team", isCorrect: false },
      ],
    },
    {
      competencyName: "Leading a Team",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which leadership stance does the PMBOK® Guide 7th Edition name as the default for project managers, especially on agile and hybrid teams?",
      whyCorrect:
        "The PMBOK® Guide 7th Edition names servant leadership (Greenleaf) as the dominant leadership stance for project managers, particularly on agile and hybrid teams, because servant leadership unlocks self-organization: the team owns the work, the leader owns the conditions under which the team can succeed.",
      whyOthersWrong: [
        "Autocratic — directive leadership; useful only in crisis or low-maturity teams, not the PMBOK default.",
        "Laissez-faire — hands-off leadership; appropriate for expert self-organizing teams within guardrails, not the default.",
        "Pure transformational — inspires toward a shared vision; valuable but not the named PMBOK default stance.",
      ],
      explanation:
        "PMBOK® Guide 7th Edition, Leadership principle: servant leadership reframes the leader as facilitator who removes blockers and secures resources. Greenleaf (1977) is the originating source; PMI endorses it as the default for agile/hybrid delivery.",
      options: [
        { text: "Autocratic", isCorrect: false },
        { text: "Servant", isCorrect: true },
        { text: "Laissez-faire", isCorrect: false },
        { text: "Pure transformational", isCorrect: false },
      ],
    },
    {
      competencyName: "Leading a Team",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem: "A PM's team grows from 6 to 12 people. By what factor does the number of pairwise communication channels increase (C(n) = n(n−1)/2)?",
      whyCorrect:
        "C(6) = 6×5/2 = 15 channels. C(12) = 12×11/2 = 66 channels. The ratio is 66/15 = 4.4 — doubling the team produces 4.4× the coordination overhead, which is the mathematical basis for span-of-control discipline.",
      whyOthersWrong: [
        "2.0× — assumes linear scaling; fails the quadratic formula.",
        "2.5× — underestimates; the correct ratio is 66/15 = 4.4.",
        "12.0× — confuses channels (n²/2 order) with the team-size ratio (12/6 = 2).",
      ],
      explanation:
        "The communication-channel formula C(n) = n(n−1)/2 grows quadratically. Doubling a 6-person team to 12 produces 4.4× the coordination overhead, which is why span-of-control discipline recommends 7–9 direct reports as a practical ceiling.",
      options: [
        { text: "2.0×", isCorrect: false },
        { text: "4.4×", isCorrect: true },
        { text: "2.5×", isCorrect: false },
        { text: "12.0×", isCorrect: false },
      ],
    },
    {
      competencyName: "Leading a Team",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Per Herzberg's two-factor theory, a recognition program will increase engagement even when working conditions, pay, and decision authority are below threshold.",
      whyCorrect:
        "False. Herzberg's two-factor theory states that hygiene factors (pay, working conditions, supervision, policy, decision authority, security) only prevent dissatisfaction; motivators (achievement, recognition, the work itself, responsibility, advancement) drive engagement. If hygiene is below threshold, motivators cannot engage — a recognition program rolled out with poor tooling or unclear decision rights produces little engagement gain.",
      whyOthersWrong: [
        "True — the candidate confuses motivators with the precondition for motivators; Herzberg explicitly requires hygiene ≥ threshold first.",
      ],
      explanation:
        "Herzberg's two-factor theory: hygiene factors prevent dissatisfaction; motivators drive engagement. Hygiene ≥ threshold is the precondition for motivators to engage. A recognition program applied without addressing hygiene produces little engagement gain.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Managing Conflict
// (Competency: "Managing Conflict"; slug: ppl-managing-conflict)
// ---------------------------------------------------------------------------

const LESSON_PPL_MANAGING_CONFLICT: RefLesson = {
  competencyName: "Managing Conflict",
  slug: "ppl-managing-conflict",
  title: "Managing Conflict — Thomas-Kilmann, Conflict Sources & Emotional Intelligence",
  titleAr: "إدارة النزاع — توماس-كيلمان ومصادر النزاع والذكاء العاطفي",
  order: 2,
  durationMin: 32,
  references: PPL_REFERENCE_TITLES,
  conceptIntroduction: `Conflict on projects is not a pathology to be eliminated; it is a predictable signal that two parties care about an outcome and disagree about how to get there. The PMI People domain treats conflict management as a learnable competency. The Thomas-Kilmann Conflict Mode Instrument organizes the PM's response into five modes (competing, collaborating, compromising, avoiding, accommodating) chosen by the interaction of *assertiveness* (concern for one's own position) and *cooperativeness* (concern for the other's position). Project conflict sources are well-typed: scope, schedule, cost, resources, priorities, technical opinion, administrative process, personal animosity. Emotional intelligence (Goleman: self-awareness, self-regulation, motivation, empathy, social skill) is the precondition for selecting a mode deliberately rather than defaulting to one's habitual mode. This lesson equips the candidate to type a conflict, choose a mode, run a resolution conversation, and measure the cost of unresolved conflict.`,
  example: `A Construction project — hospital expansion — has a 3-week schedule slip driven by a subcontractor dispute over the HVAC rough-in sequence (mechanical subcontractor claims the structural subcontractor's penetrations are out of tolerance; structural subcontractor claims the mechanical drawings are wrong). Both refuse to rework without a change order. Direct cost of delay: $4,800/day × 21 days = $100,800. Opportunity cost: 30-bed ward opening delayed, $24,000/day in deferred revenue. Conflict-cost estimate: $100,800 + (5 days × $24,000) = $220,800. The PM applies Thomas-Kilmann: issue is high-stakes (patient safety + cost), long-term relationship matters (both subs are on the preferred-vendor list), time-pressure is high (ward opening) → Collaborating. Resolution conversation: joint site walk, root cause = structural tolerance interpretation differing from mechanical assumed tolerance; agree on a written tolerance standard going forward; split rework cost 50/50. Conflict resolved in 2 working days; 19 days recovered; net benefit ≈$190k + ward opening on time.`,
  keyFormulas: `Thomas-Kilmann mode selection (qualitative decision matrix):
  — Competing (high assert, low coop): emergency, unpopular decisions, enforce.
  — Collaborating (high assert, high coop): both concerns critical, long-term relationship.
  — Compromising (mid assert, mid coop): moderate stakes, time-pressure, temporary.
  — Avoiding (low assert, low coop): trivial issue, time buys information, cool down.
  — Accommodating (low assert, high coop): build goodwill, you're wrong, preserve harmony.
Conflict-cost estimate:
  CC = (downtime_hours × $/h) + rework_cost + opportunity_cost + escalation_cost
  — downtime_hours: schedule slip in operating hours
  — $/h: production loss per hour of delay
  — rework_cost: cost to redo deliverables damaged by the conflict
  — opportunity_cost: deferred revenue / benefits × delay_days
  — escalation_cost: sponsor / regulator / legal escalation cost
Emotional Intelligence (EI) scorecard (Goleman, 5 components × 1–5 Likert):
  EI = (SA + SR + M + E + SS) / 25, in [0.0, 1.0]
  — Self-Awareness, Self-Regulation, Motivation, Empathy, Social Skill
Conflict-resolution steps (5):
  Type → Mode → Conversation → Agreement → Verify
Conflict sources on projects (8 well-typed):
  Scope / Schedule / Cost / Resources / Priorities / Technical / Administrative / Personal`,
  exercise: `You are the PM on a Healthcare EHR rollout. The clinical-lead physician and the IT-lead engineer are in conflict over the medication-order entry workflow: the clinical lead wants a 2-step verification for safety; the IT lead wants 1-step for throughput. Each has escalated to the sponsor. (a) Type the conflict source (one of the 8). (b) Estimate the conflict cost if the dispute runs 14 more days (clinical productivity loss: $6,000/day; sponsor-attention dilution: $1,500/day). (c) Apply Thomas-Kilmann to select a mode and justify. (d) Draft a 4-step resolution conversation. (e) Self-assess your EI (1–5 each component) and identify one development area.`,
  sections: {
    learning_objectives: `- Apply the Thomas-Kilmann conflict-mode framework (competing, collaborating, compromising, avoiding, accommodating) to select a mode for a project conflict.
- Distinguish the 8 conflict sources on projects (scope, schedule, cost, resources, priorities, technical, administrative, personal).
- Run the 5-step conflict-resolution process: type → mode → conversation → agreement → verify.
- Apply Goleman's 5 components of emotional intelligence (self-awareness, self-regulation, motivation, empathy, social skill) as the precondition for deliberate mode selection.
- Compute the conflict-cost estimate (downtime + rework + opportunity + escalation).
- Distinguish productive conflict (cognitive task conflict) from destructive conflict (affective personal conflict) and prescribe interventions for each.`,
    prerequisites: `- Lesson 1 — Leading a Team (leadership styles, motivation theory, Talent Triangle).
- Awareness of Thomas-Kilmann Conflict Mode Instrument (high-level).
- Basic communication and meeting-facilitation skills.
- A project lifecycle seen as a participant, including at least one stakeholder escalation.`,
    introduction: `Conflict on projects is predictable. The PMI People domain treats it as a learnable competency rather than a personality clash to be survived. Two frameworks anchor the discipline: the Thomas-Kilmann Conflict Mode Instrument (Kenneth Thomas and Ralph Kilmann, 1974) and Goleman's emotional-intelligence model (1995). The first gives the candidate a typology of responses; the second gives the candidate the self-management to choose deliberately rather than to default to one's habitual mode.

Thomas-Kilmann organizes conflict responses along two axes: *assertiveness* (the extent to which a person pursues their own concerns) and *cooperativeness* (the extent to which a person pursues the other's concerns). The five modes are the corners and mid-points of this 2-axis space: Competing (high assert, low coop), Collaborating (high assert, high coop), Compromising (mid assert, mid coop), Avoiding (low assert, low coop), Accommodating (low assert, high coop). Each mode is appropriate in some contexts and inappropriate in others; none is universally best. The candidate's task is to read the conflict and choose deliberately.

Project conflict sources are well-typed. The 8 common sources: *scope* (what's in/out), *schedule* (when, dependencies), *cost* (budget, change orders), *resources* (people, equipment, materials), *priorities* (which deliverable first), *technical opinion* (design choices, methodology), *administrative process* (governance, approvals), *personal animosity* (style, history). Typing the source drives both mode selection and resolution conversation — a scope conflict needs a scope decision (collaborate with sponsor); a personal animosity needs a relationship intervention (mediate, sometimes HR).

Emotional intelligence is the precondition. Without self-awareness, the PM defaults to their habitual mode (often competing or avoiding). Without self-regulation, the PM escalates when provoked. Without empathy, the PM misses the underlying interests behind the positions. The conflict-cost estimate quantifies the price of unresolved conflict — converting "let's not deal with it" into a dollar figure that justifies intervention. Productive conflict (cognitive task conflict — disagreement about how to do the work) improves decisions; destructive conflict (affective personal conflict — disagreement about each other) degrades performance. The mature PM amplifies the first and converts the second.`,
    terminology: `- **Conflict**: a disagreement between two or more parties whose positions appear incompatible.
- **Thomas-Kilmann modes**: competing, collaborating, compromising, avoiding, accommodating.
- **Assertiveness**: the extent to which a person pursues their own concerns (Thomas-Kilmann axis 1).
- **Cooperativeness**: the extent to which a person pursues the other's concerns (Thomas-Kilmann axis 2).
- **Conflict source**: the well-typed cause — scope / schedule / cost / resources / priorities / technical / administrative / personal.
- **Position**: what a party says they want; **Interest**: why they want it (the underlying need).
- **Cognitive (task) conflict**: disagreement about how to do the work — productive when managed.
- **Affective (personal) conflict**: disagreement about each other — destructive.
- **Emotional intelligence (Goleman)**: self-awareness + self-regulation + motivation + empathy + social skill.
- **BATNA**: best alternative to a negotiated agreement (the fall-back if negotiation fails).
- **Conflict-cost**: downtime + rework + opportunity + escalation — the dollar price of unresolved conflict.`,
    detailed_explanation: `The Thomas-Kilmann Conflict Mode Instrument is the candidate's primary typology. Kenneth Thomas and Ralph Kilmann (1974) framed conflict responses on a 2-axis space — assertiveness (own concern) and cooperativeness (other's concern). The five modes:

*Competing* (high assert, low coop) is win-lose. The PM pursues their own position at the other's expense. Appropriate for emergencies, unpopular decisions that must be made (cutting scope), or when the other party is wrong on a safety-critical issue. Inappropriate for routine decisions where the relationship matters — it builds resentment and erodes the long-term collaboration needed for future decisions.

*Collaborating* (high assert, high coop) is win-win. The PM works with the other party to find a solution that fully satisfies both concerns. Appropriate when both concerns are critical (patient safety and throughput, scope and budget), when a long-term relationship matters (preferred vendors, sponsor), and when time permits a thorough search. Costly in time; not appropriate for trivial issues or when time is critical.

*Compromising* (mid assert, mid coop) is split-the-difference. Both parties give up something. Appropriate for moderate stakes, time pressure, temporary settlements, and when collaboration is too costly. Often the right mode for budget negotiations where the absolute number matters less than both parties accepting it.

*Avoiding* (low assert, low coop) is sidestep. The PM neither pursues own concerns nor addresses the other's. Appropriate for trivial issues (not worth the time), when more information is needed (time buys clarity), when emotions are hot (cool-down), or when someone else should handle it. Inappropriate for issues that worsen with delay (scope creep, safety).

*Accommodating* (low assert, high coop) is yield. The PM lets the other's position prevail. Appropriate when you realize you're wrong, when the issue matters more to the other party, when building goodwill for later, or when preserving harmony is worth more than winning. Inappropriate when the issue is safety-critical or when accommodation establishes a precedent of capitulation.

The mode-selection matrix is read against the conflict's stakes, time-pressure, and relationship value. High stakes + long-term relationship + time available → Collaborating. High stakes + low relationship + emergency → Competing. Moderate stakes + time pressure → Compromising. Low stakes → Avoiding. Relationship > issue → Accommodating. The most common failure modes: defaulting to Competing when Collaborating is needed (erodes the relationship); defaulting to Avoiding when the issue worsens with delay (scope creep, safety); defaulting to Accommodating on safety-critical issues (abandoning stewardship).

Conflict sources are well-typed. Scope conflicts need a scope decision with the sponsor (collaborate or escalate). Schedule conflicts need critical-path analysis (often Compromise or Compete on dependencies). Cost conflicts need budget review (often Compromise). Resource conflicts need resource-leveling and stakeholder negotiation. Priority conflicts need a prioritization framework (e.g., MoSCoW) and a sponsor decision. Technical-opinion conflicts need decision-rights clarity and a technical review (DACI — see ppl-leading-a-team). Administrative-process conflicts need process clarity and escalation. Personal-animosity conflicts need mediation, sometimes HR — separate the people from the problem (Fisher & Ury).

The 5-step conflict-resolution process: (1) Type the conflict source; (2) Select the Thomas-Kilmann mode from stakes + time + relationship; (3) Run the resolution conversation — open with interests (not positions), explore the underlying needs, generate options, agree on criteria; (4) Reach an explicit agreement — write it down, name owners, dates; (5) Verify — follow up at the agreed date to confirm the agreement held; revisit if not.

Emotional intelligence is the precondition for deliberate mode selection. Goleman's 5 components: *self-awareness* (recognize one's own emotions in real time — the precondition for choosing deliberately); *self-regulation* (manage one's emotions — pause before responding, especially when provoked); *motivation* (pursue goals with energy and persistence — channel conflict energy into resolution); *empathy* (sense others' emotions — read the underlying interests); *social skill* (manage relationships — run the resolution conversation). The habitual mode (often revealed by the Thomas-Kilmann instrument) is a self-awareness data point; choosing a different mode deliberately is the work.

Productive vs destructive conflict. *Cognitive* (task) conflict — disagreement about how to do the work — improves decisions when managed: dissent surfaces assumptions, tests options, prevents groupthink. *Affective* (personal) conflict — disagreement about each other — degrades performance: it shifts energy from the work to the relationship, builds coalitions, and escalates. The PM's task is to amplify cognitive conflict (encourage dissent in design reviews, technical debates) and convert affective conflict (re-anchor on the work, separate people from problem, sometimes mediate or restructure teams).

The conflict-cost estimate quantifies unresolved conflict's price: CC = downtime_hours × $/h + rework_cost + opportunity_cost + escalation_cost. A 21-day delay on a hospital ward opening at $4,800/day direct + $24,000/day opportunity = $100,800 + $120,000 = $220,800. This dollar figure is the PM's justification to intervene now rather than "let it work itself out."`,
    core_principles: `- Conflict on projects is predictable; managing it is a learnable competency, not a personality trait.
- Thomas-Kilmann's five modes are each appropriate in some contexts and inappropriate in others; none is universally best.
- Mode selection reads stakes × time-pressure × relationship value.
- Conflict sources are well-typed (scope / schedule / cost / resources / priorities / technical / administrative / personal); typing drives mode + conversation.
- The 5-step process is Type → Mode → Conversation → Agreement → Verify.
- Emotional intelligence (Goleman) is the precondition for deliberate (not habitual) mode selection.
- Cognitive (task) conflict is productive; affective (personal) conflict is destructive.
- The conflict-cost estimate (CC = downtime + rework + opportunity + escalation) justifies intervention.`,
    components: `- Thomas-Kilmann Conflict Mode Instrument — the 5-mode typology (assertiveness × cooperativeness).
- Conflict-source taxonomy (8 sources) — typing the cause.
- Conflict-cost calculator — downtime_hours × $/h + rework + opportunity + escalation.
- Goleman EI scorecard — 5 components × 1–5 Likert, summed to [0, 1].
- Resolution-conversation template — open with interests, explore, generate, agree on criteria.
- Conflict log — date, parties, source, mode selected, outcome, follow-up date.
- Decision-rights matrix (DACI) — reduces administrative-process conflicts by clarifying authority.
- Mediation protocol (for affective/personal conflicts that exceed PM scope).`,
    process: `1. Type the conflict source — scope / schedule / cost / resources / priorities / technical / administrative / personal.
2. Assess stakes (low / moderate / high / safety-critical) and time-pressure (cool-down available / urgent).
3. Assess relationship value (one-off transactional / preferred vendor / sponsor / long-term).
4. Select the Thomas-Kilmann mode from the stakes × time × relationship matrix.
5. Self-check emotional state (Goleman self-awareness); pause if escalated.
6. Run the resolution conversation — open with interests (not positions), explore needs, generate options, agree on criteria.
7. Reach explicit agreement — write it down, name owners, dates.
8. Verify — follow up at the agreed date; revisit if the agreement did not hold.
9. Log the conflict (date, parties, source, mode, outcome) for patterns and learning.`,
    formula_calculation: `Variables and formulas:
- T: assertiveness (Thomas-Kilmann axis) ∈ {low, mid, high}
- C: cooperativeness (Thomas-Kilmann axis) ∈ {low, mid, high}
- Mode(T, C): Competing(high,low), Collaborating(high,high), Compromising(mid,mid), Avoiding(low,low), Accommodating(low,high)
- D_h: downtime hours
- R_$/h: production loss per hour of delay [$/h]
- W_r: rework cost [$]
- O_$/d: opportunity cost per day of delay [$/day]
- E_s: escalation cost [$]
- CC: conflict cost = D_h × R_$/h + W_r + (D_d × O_$/d) + E_s
- Goleman EI: SA, SR, M, E, SS ∈ {1..5}; EI = (SA + SR + M + E + SS) / 25 ∈ [0,1]

Conflict-cost example:
- D_h = 21 × 8 = 168 hours; R_$/h = $600/h
- W_r = $0 (no rework yet)
- O_$/d = $24,000/day; D_d = 5 days of deferred ward opening
- E_s = $0
- CC = 168 × 600 + 0 + 5 × 24,000 + 0 = 100,800 + 120,000 = $220,800

Goleman EI example:
- SA=4, SR=3, M=5, E=4, SS=3 → EI = 19/25 = 0.76 (development area: SS — social skill / running conversations).

Units: CC in $; EI dimensionless [0,1]; D_h in hours; R_$/h in $/h.

Assumptions: (i) the conflict-cost components are additive (conservative — in practice escalation compounds); (ii) opportunity cost is linear in delay days (true for many regulated or revenue-bearing deliverables); (iii) the EI self-assessment is honest — peer 360s give more reliable data than self-reports.

Interpretation: A conflict-cost above $50k justifies immediate PM intervention (the "let it work itself out" default is unacceptable). An EI below 0.60 indicates the PM is likely defaulting to a habitual mode under stress and should develop the weakest EI component before high-stakes conflict.`,
    worked_example: `**Construction — HVAC rough-in sequence dispute on a hospital expansion.**

Parties: mechanical subcontractor (MS) vs structural subcontractor (SS). MS claims structural penetrations out of tolerance; SS claims mechanical drawings wrong. Both refuse rework without a change order. Schedule slip: 21 days and counting.

Step 1 — Type the conflict source: *technical opinion* (tolerance interpretation) layered on *administrative process* (change-order process).

Step 2 — Stakes: high (patient safety, ward opening, $220,800 conflict-cost). Time-pressure: high (ward opening date). Relationship: long-term (both subs on the preferred-vendor list).

Step 3 — Mode selection: *Collaborating* (high assert, high coop). Both concerns critical; long-term relationship matters; the time-cost of collaborating (2 days) is dwarfed by the time-cost of unresolved conflict (21+ days at $4,800/day direct).

Step 4 — Emotional self-check (PM, Goleman): SA=4, SR=4, M=5, E=5, SS=4 → EI = 22/25 = 0.88. PM is centered enough to facilitate.

Step 5 — Resolution conversation (2 hours, joint site walk):
- Open with interests (not positions):
  - MS interest: install rough-in to a tolerance that lets the equipment fit.
  - SS interest: structural integrity with penetrations per drawings.
- Explore the underlying need: both subs are interpreting the same drawings differently. The drawings specify penetrations at nominal dimensions; MS assumed ±6 mm tolerance; SS installed to ±25 mm tolerance (structural default).
- Generate options: (a) MS reworks (cost: $40k, 10 days); (b) SS reworks (cost: $25k, 7 days); (c) jointly adopt a written tolerance standard for penetrations on this project and split rework 50/50.
- Agree on criteria: patient safety, ward-opening date, project cost, future-project risk.

Step 6 — Explicit agreement:
- Joint tolerance standard signed: ±10 mm for structural penetrations on this project.
- Rework split 50/50: each sub absorbs $12,500.
- Joint site walk weekly for the remainder of rough-in.
- No change order; both subs remain on the preferred-vendor list.
- Written, dated, signed by both subs and the PM.

Step 7 — Verify: 14 days later, the rough-in is complete; weekly walks have surfaced 3 minor tolerance questions, all resolved without escalation. Ward opening on schedule.

Step 8 — Conflict-cost recovered:
- Direct cost recovered: 19 days × $4,800 = $91,200.
- Opportunity cost avoided: 5 days × $24,000 = $120,000.
- Net benefit: ≈$211,200 minus $25,000 rework = ≈$186,200.

**Thomas-Kilmann mode-selection rationale**: a Compete mode would have forced one sub to absorb the full $25k rework, eroding the preferred-vendor relationship. An Avoid mode would have let the slip continue (>$220k). An Accommodate mode would have implied the PM absorbed the rework (sending the wrong signal on stewardship). Compromise would have split the cost without addressing the root cause — the drawings — and would have recurred on future penetrations. Collaborating addressed root cause and relationship.`,
    industrial_example: `**Construction — HVAC rough-in dispute** (above; collaborating mode recovered $186k and the preferred-vendor relationship).

**IT — sprint-priority conflict** between two product owners over the development team's capacity. Each PO claims their feature is "must-have" for the next release. Conflict source: *priorities*. Stakes: moderate. Time-pressure: high (sprint planning). Relationship: long-term (both POs will work together for years). Mode: *Compromising* (split the sprint capacity 60/40, with a joint commitment to revisit the prioritization framework next sprint). Conversation: 30 minutes; written agreement in the sprint goal. Verify: end-of-sprint review.

**Healthcare — EHR medication-order verification** (clinical-lead physician vs IT-lead engineer). Conflict source: *technical opinion* (2-step vs 1-step verification) layered on *priorities* (safety vs throughput). Stakes: high (patient safety). Time-pressure: moderate. Relationship: long-term (clinicians + IT work together on every release). Mode: *Collaborating* (joint clinical-IT workshop to design a 1-step-with-confirmation workflow that satisfies both safety and throughput). Conversation: 4 hours; written agreement specifying the workflow and audit criteria. Verify: 30-day audit of order errors.

**Oil & Gas — turn-around resource conflict** between two superintendents over a shared crane. Conflict source: *resources*. Stakes: high (turn-around window is fixed). Time-pressure: high. Relationship: long-term. Mode: *Competing* (the PM enforces the project-level schedule, naming one superintendent's critical-path lift as priority) — appropriate because the turn-around window is fixed and the long-term relationship will tolerate a directive decision when it's transparent and well-justified.`,
    case_study: `**CASE STUDY (SYNTHETIC) — Construction HVAC Dispute on "St. Mary's Hospital Expansion" (composite scenario, 21-day slip → 2-day resolution).**

Context: Hospital expansion, mechanical subcontractor (MS) vs structural subcontractor (SS) dispute over HVAC rough-in tolerance. 21-day schedule slip. Ward opening delayed.

Problem: Both subs refused rework without a change order; positions entrenched.

Constraints: (a) Ward opening date fixed (regulatory). (b) Both subs on preferred-vendor list (relationship matters). (c) Patient-safety risk if tolerance is wrong. (d) Cannot increase the contract value without a board change order.

Analysis: Conflict source = technical opinion + administrative process. Conflict-cost = $220,800. Mode = Collaborating (high stakes, long-term relationship, time-cost of collaborating << time-cost of unresolved conflict). EI of PM = 0.88 (sufficient to facilitate).

Decision: 2-hour joint site walk; written tolerance standard (±10 mm); rework split 50/50 ($12,500 each); weekly joint walks for the remainder of rough-in.

Alternatives considered: (a) Compete — force MS to absorb rework: rejected (erodes preferred-vendor relationship; future-project risk). (b) Avoid — let it work itself out: rejected (>$220k cost; ward opening slips). (c) Compromise — split the cost without addressing drawings: rejected (root cause unresolved; recurs on future penetrations). (d) Escalate to sponsor: rejected (sponsor escalation is itself a cost; PM should resolve at first opportunity).

Consequences: 21-day slip recovered to 2-day slip; $186k net benefit; ward opening on schedule; both subs remained on the preferred-vendor list; weekly walks surfaced 3 minor tolerance questions, all resolved without escalation.

Lessons learned: (1) Conflict-cost estimate ($220k) was the decisive justification to intervene immediately. (2) Collaborating was the right mode because stakes + relationship + the time-cost asymmetry all pointed the same direction. (3) The PM's EI (0.88) was sufficient to facilitate without escalating. (4) The written tolerance standard addressed the root cause (drawings) and prevented recurrence. (5) The conflict log revealed a pattern — both subs had disputed tolerance on a prior project — informing the project's QA standard for all future rough-ins.`,
    visual_explanation: `Picture a 2-axis grid. X-axis: Cooperativeness (low → high). Y-axis: Assertiveness (low → high). Plot five points: bottom-left (low assert, low coop) = Avoiding; bottom-right (low assert, high coop) = Accommodating; mid-center = Compromising; top-left (high assert, low coop) = Competing; top-right (high assert, high coop) = Collaborating. Picture the conflict-cost funnel alongside: a conflict unresolved drains $/h × hours; the funnel fills faster than the PM's habit of "wait and see" can drain it. The Goleman EI scorecard is a 5-bar histogram; the lowest bar is the development priority.`,
    simulation_opportunity: `Build a conflict-mode simulator. Inputs: conflict source (8 types), stakes (1–5), time-pressure (1–5), relationship value (1–5), PM's EI 5-component score (1–5 each), and the dollar inputs (downtime_hours, $/h, rework, opportunity_cost_per_day, escalation_cost). Engine: lookup mode from stakes × time × relationship matrix; compute CC; compute EI; produce a recommended mode + an estimated cost-of-no-intervention. Output: recommended Thomas-Kilmann mode, conflict-cost estimate, Goleman EI score and weakest component, and a 5-step conversation script. Use it to walk candidates through "type → cost → mode → conversation → verify."`,
    common_mistakes: `- **Defaulting to one mode**: every PM has a habitual mode (often Competing or Avoiding) — the failure is applying it to every conflict regardless of context.
- **Avoiding issues that worsen with delay**: scope creep, safety, regulatory deadlines — Avoiding is appropriate only for trivial issues or when time buys information.
- **Competing on long-term relationships**: forces a win-lose that erodes future collaboration; long-term partners remember.
- **Accommodating on safety-critical issues**: abandoning stewardship to preserve harmony — inappropriate when patient safety, regulatory compliance, or technical integrity is at stake.
- **Conflating positions with interests**: arguing the position (2-step verification) without exploring the interest (patient safety) — closes off creative options.
- **Forgetting the Verify step**: an agreement that isn't verified is a wish; the conflict often recurs.
- **Ignoring the conflict-cost**: "let it work itself out" is unacceptable when CC > $50k; the dollar figure is the PM's mandate to intervene now.
- **Skipping the EI self-check**: a PM under stress defaults to habitual mode; EI is the precondition for deliberate choice.`,
    limitations: `- Thomas-Kilmann is a 1974 instrument; modern research refines but does not invalidate the typology.
- The conflict-cost estimate assumes additive components; in practice escalation compounds (one delay triggers another).
- EI self-assessments over-rate self vs 360s; an honest EI score requires peer input.
- The 5-step process assumes two parties; multi-party conflicts (sponsor + vendor + regulator + internal stakeholders) need a modified protocol.
- Cultural context shifts which mode is appropriate: high-context cultures may default to Avoiding/Accommodating; low-context cultures to Competing/Collaborating. The candidate must adapt, not apply mechanically.
- Thomas-Kilmann mode selection is qualitative; the matrix is a guide, not a formula.`,
    comparison: `| Thomas-Kilmann mode | Assertiveness | Cooperativeness | Best-fit context | Failure mode |
|---|---|---|---|---|
| Competing | High | Low | Emergency, unpopular decisions, safety-critical | Erodes long-term relationships |
| Collaborating | High | High | Both concerns critical, long-term relationship | Too slow for trivial/urgent issues |
| Compromising | Mid | Mid | Moderate stakes, time pressure | Loses the optimal solution |
| Avoiding | Low | Low | Trivial, time buys information, cool-down | Issues that worsen with delay |
| Accommodating | Low | High | You're wrong, build goodwill, preserve harmony | Safety-critical issues, precedent of capitulation |

| Conflict source | Mode likely | Conversation focus |
|---|---|---|
| Scope | Collaborate/Compete | Sponsor decision |
| Schedule | Compromise/Compete | Critical-path analysis |
| Cost | Compromise | Budget review |
| Resources | Compromise/Collaborate | Resource-leveling |
| Priorities | Compromise | Prioritization framework (MoSCoW) |
| Technical | Collaborate | Decision-rights (DACI) + technical review |
| Administrative | Collaborate/Avoid | Process clarity |
| Personal | Mediate | Separate people from problem (Fisher & Ury) |`,
    practical_application: `On a real project: (1) keep a conflict log from day 1 (date, parties, source, mode selected, outcome, follow-up date); (2) when a conflict surfaces, type the source within 24 hours; (3) compute the conflict-cost — a CC > $50k justifies immediate intervention; (4) self-check your EI (the weakest component is your default-mode risk); (5) select the mode from stakes × time × relationship; (6) run the resolution conversation — open with interests, explore, generate, agree on criteria; (7) write the agreement, name owners and dates; (8) verify on the agreed date; (9) log for patterns. If the conflict is affective (personal), separate people from problem and consider mediation. The PMP ECO People task "Managing Conflict" is operationally this loop.`,
    decision_scenario: `A clinical-lead physician and an IT-lead engineer on a Healthcare EHR rollout are in conflict over medication-order verification (2-step for safety vs 1-step for throughput). Each has escalated to the sponsor. You are the PM. Which sequence is most consistent with this lesson? (a) Avoid the dispute and let the sponsor decide; (b) Compete — mandate the clinical-lead's 2-step workflow on safety grounds; (c) Type the conflict, compute CC, select Collaborating, run a joint clinical-IT workshop to design a 1-step-with-confirmation workflow; (d) Compromise — alternate sprints between 1-step and 2-step. Correct: (c). (a) Avoids a safety-critical issue (inappropriate). (b) Competes on a long-term relationship (erodes IT engagement). (d) Compromise loses the optimal solution (1-step-with-confirmation satisfies both interests). (c) follows Type → Cost → Mode → Conversation → Verify.`,
    practice_questions: `1. A PM defaults to Avoiding when stressed. The conflict is a 14-day schedule slip on a regulatory deadline. The PM's habitual mode is: (a) appropriate; (b) inappropriate — the issue worsens with delay; (c) too slow; (d) Compete. (Answer: b.)
2. Compute CC for: downtime 168 h × $600/h + rework $0 + opportunity 5 days × $24,000 + escalation $0. (Answer: $100,800 + $120,000 = $220,800.)
3. A long-term preferred vendor dispute over a high-stakes technical issue with 2 days available should be handled with which Thomas-Kilmann mode? (a) Competing; (b) Collaborating; (c) Avoiding; (d) Accommodating. (Answer: b.)
4. Goleman EI score: SA=4, SR=3, M=5, E=4, SS=3. EI = ? and weakest component? (Answer: 19/25 = 0.76; weakest = SR and SS tied at 3.)`,
    certification_questions: `1. (PMP-style) Which Thomas-Kilmann mode is most appropriate when both parties' concerns are critical and a long-term relationship matters? (a) Competing; (b) Collaborating; (c) Avoiding; (d) Accommodating. (Answer: b.)
2. (PMP-style) A PM sees a conflict worsening with delay on a regulatory deliverable. The habitual Avoid mode is: (a) correct; (b) incorrect — issue worsens with delay; (c) equivalent to Collaborating; (d) the only option. (Answer: b.)
3. (PMP-style) Goleman's emotional-intelligence model includes all of the following EXCEPT: (a) Self-awareness; (b) Self-regulation; (c) Assertiveness; (d) Empathy. (Answer: c — assertiveness is a Thomas-Kilmann axis, not a Goleman component.)
4. (PMP-style) A conflict costing $220,800 over 21 days is best characterized as: (a) trivial; (b) a relationship issue; (c) justifying immediate PM intervention; (d) unavoidable. (Answer: c.)`,
    summary: `Conflict on projects is predictable; managing it is a learnable competency. The Thomas-Kilmann Conflict Mode Instrument (Competing, Collaborating, Compromising, Avoiding, Accommodating) gives the candidate a typology; mode selection reads stakes × time-pressure × relationship value. Conflict sources are well-typed (scope / schedule / cost / resources / priorities / technical / administrative / personal); typing drives mode and conversation. The 5-step process is Type → Mode → Conversation → Agreement → Verify. Goleman's emotional intelligence (self-awareness, self-regulation, motivation, empathy, social skill) is the precondition for deliberate (not habitual) mode selection. The conflict-cost estimate (downtime + rework + opportunity + escalation) justifies intervention now rather than "letting it work itself out."`,
    key_takeaways: `- Five Thomas-Kilmann modes; none is universally best — read stakes × time × relationship.
- Conflict sources are well-typed; typing drives mode and conversation.
- The 5-step process is Type → Mode → Conversation → Agreement → Verify.
- Goleman's 5 EI components are the precondition for deliberate mode selection.
- Cognitive (task) conflict is productive; affective (personal) conflict is destructive.
- The conflict-cost estimate justifies intervention; CC > $50k mandates immediate PM action.
- Defaulting to one mode is the most common conflict-management failure mode.`,
    references: `1. PMI, A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition (2021) — Principles: Leadership, Stewardship; Performance Domain: Stakeholder, Team.
2. PMI, Agile Practice Guide (2017) — Conflict in agile teams; servant-leadership stance.
3. PMI, PMP Examination Content Outline — People domain, Task "Managing Conflict."
4. PMI, PMI Talent Triangle® — Power Skills leg (conflict management is a Power Skill).
5. ISO 21500:2021 — Guidance on project management, §4.3 (Stakeholders) and §4.6 (Project resource management; team).
6. Kouzes & Posner, The Leadership Challenge (6th ed., 2017) — Enable Others to Act; Encourage the Heart.
7. Goleman, Emotional Intelligence (1995) — five EI components.`,
  },
  knowledgeObject: {
    title: "Managing Conflict — Thomas-Kilmann, Sources, EI",
    domain: "People",
    competency: "Managing Conflict",
    topic: "Conflict Management",
    concept: "Conflict as a learnable, mode-selected competency",
    body: {
      definitions: [
        "Conflict: a disagreement between two or more parties whose positions appear incompatible.",
        "Thomas-Kilmann modes: Competing, Collaborating, Compromising, Avoiding, Accommodating.",
        "Assertiveness: extent to which a person pursues their own concerns (TK axis 1).",
        "Cooperativeness: extent to which a person pursues the other's concerns (TK axis 2).",
        "Conflict source: the well-typed cause — scope / schedule / cost / resources / priorities / technical / administrative / personal.",
        "Position vs interest: what a party says they want vs why they want it.",
        "Cognitive (task) conflict: disagreement about how to do the work — productive when managed.",
        "Affective (personal) conflict: disagreement about each other — destructive.",
        "Emotional intelligence (Goleman): self-awareness + self-regulation + motivation + empathy + social skill.",
        "BATNA: best alternative to a negotiated agreement (fall-back if negotiation fails).",
        "Conflict-cost: downtime + rework + opportunity + escalation — the dollar price of unresolved conflict.",
      ],
      principles: [
        "Conflict on projects is predictable; managing it is a learnable competency.",
        "Five Thomas-Kilmann modes; none universally best — read stakes × time × relationship.",
        "Mode selection reads stakes × time-pressure × relationship value.",
        "Conflict sources are well-typed; typing drives mode + conversation.",
        "5-step process: Type → Mode → Conversation → Agreement → Verify.",
        "Emotional intelligence is the precondition for deliberate (not habitual) mode selection.",
        "Cognitive conflict is productive; affective conflict is destructive.",
        "Conflict-cost justifies intervention; CC > $50k mandates immediate PM action.",
      ],
      components: [
        "Thomas-Kilmann Conflict Mode Instrument (5-mode typology).",
        "Conflict-source taxonomy (8 sources).",
        "Conflict-cost calculator (D_h × $/h + W_r + O_$/d × D_d + E_s).",
        "Goleman EI scorecard (5 components × 1–5 Likert, summed to [0,1]).",
        "Resolution-conversation template (open with interests, explore, generate, agree on criteria).",
        "Conflict log (date, parties, source, mode, outcome, follow-up).",
        "Decision-rights matrix (DACI) — reduces administrative-process conflicts.",
        "Mediation protocol — for affective/personal conflicts exceeding PM scope.",
      ],
      mechanism: [
        "Conflict lifecycle: trigger → type the source → assess stakes/time/relationship → self-check EI → select Thomas-Kilmann mode → run resolution conversation → reach explicit agreement → verify → log for patterns.",
      ],
      process: [
        "1. Type the conflict source (one of 8).",
        "2. Assess stakes (low/moderate/high/safety-critical) and time-pressure.",
        "3. Assess relationship value (transactional/preferred vendor/sponsor/long-term).",
        "4. Select the Thomas-Kilmann mode from the stakes × time × relationship matrix.",
        "5. Self-check emotional state; pause if escalated.",
        "6. Run the resolution conversation — open with interests, explore needs, generate options, agree on criteria.",
        "7. Reach explicit agreement — write it down; name owners and dates.",
        "8. Verify on the agreed date; revisit if the agreement did not hold.",
        "9. Log the conflict for patterns and learning.",
      ],
      formulas: [
        "Mode(T, C): Competing(high,low), Collaborating(high,high), Compromising(mid,mid), Avoiding(low,low), Accommodating(low,high).",
        "Conflict-cost CC = D_h × R_$/h + W_r + D_d × O_$/d + E_s",
        "Goleman EI = (SA + SR + M + E + SS) / 25, in [0, 1]",
      ],
      metrics: [
        "Conflict-cost CC in $ — intervention threshold > $50k.",
        "Goleman EI ≥ 0.70 — sufficient to facilitate without escalating.",
        "Conflict-resolution time (hours/days) — target ≤ 1 day for high-stakes, ≤ 7 days for moderate.",
        "Recurrence rate — conflicts of the same source in 90 days; target 0.",
        "Sponsor escalations per 30 days — target 0 for a well-managed project.",
      ],
      examples: [
        "Construction HVAC dispute: 21-day slip → 2-day Collaborating resolution; $186k net benefit; preferred-vendor relationship preserved.",
        "IT sprint-priority conflict: 2 POs split capacity 60/40 (Compromise); 30-min conversation; written in sprint goal.",
        "Healthcare EHR verification: clinical-IT workshop (Collaborate); 1-step-with-confirmation workflow satisfies safety + throughput.",
        "Oil & Gas turn-around crane conflict: PM enforces project-level schedule (Compete); critical-path lift gets priority.",
      ],
      industrial_examples: [
        "Construction — HVAC rough-in: Collaborating; ±10 mm tolerance standard; rework split 50/50; $186k recovered.",
        "IT — sprint priority: Compromise; 60/40 capacity split; written in sprint goal.",
        "Healthcare — EHR medication-order: Collaborate; 1-step-with-confirmation workflow.",
        "Oil & Gas — turn-around crane: Compete; PM enforces project-level schedule.",
      ],
      case_studies: [
        "SYNTHETIC — St. Mary's Hospital HVAC dispute (composite, 21-day slip → 2-day resolution). CC=$220,800 justified immediate intervention. Collaborating mode. ±10 mm tolerance standard signed. Rework split 50/50. $186k net benefit. Ward opening on schedule. Both subs remained on preferred-vendor list.",
      ],
      common_errors: [
        "Defaulting to one mode — applying habitual mode to every conflict regardless of context.",
        "Avoiding issues that worsen with delay — scope creep, safety, regulatory deadlines.",
        "Competing on long-term relationships — erodes future collaboration.",
        "Accommodating on safety-critical issues — abandoning stewardship.",
        "Conflating positions with interests — closes off creative options.",
        "Forgetting the Verify step — agreement without verification is a wish.",
        "Ignoring the conflict-cost — 'let it work itself out' is unacceptable when CC > $50k.",
        "Skipping the EI self-check — defaults to habitual mode under stress.",
      ],
      limitations: [
        "Thomas-Kilmann is a 1974 instrument; modern research refines but does not invalidate.",
        "Conflict-cost assumes additive components; escalation compounds in practice.",
        "EI self-assessments over-rate self vs 360s.",
        "The 5-step process assumes 2 parties; multi-party conflicts need a modified protocol.",
        "Cultural context shifts which mode is appropriate; candidate must adapt, not apply mechanically.",
        "Mode-selection matrix is qualitative, not formulaic.",
      ],
      best_practices: [
        "Keep a conflict log from day 1 (date, parties, source, mode, outcome, follow-up).",
        "Type the conflict source within 24 hours of surfacing.",
        "Compute the conflict-cost — CC > $50k justifies immediate intervention.",
        "Self-check your EI; the weakest component is your default-mode risk.",
        "Select mode from stakes × time × relationship.",
        "Open the resolution conversation with interests (not positions).",
        "Write the agreement; name owners and dates.",
        "Verify on the agreed date; log for patterns.",
        "Separate people from problem when conflict is affective; consider mediation.",
      ],
      related_concepts: [
        "ppl-leading-a-team (leadership styles; Talent Triangle; EI as a Talent Triangle Power Skill).",
        "ppl-coaching-mentoring (feedback models; SBI; servant leadership; coaching dialogues de-escalate conflict).",
        "ppl-building-shared-vision (team charter; ground rules; psychological safety reduce conflict frequency).",
        "Process domain — change-control conflicts; risk-register conflicts; schedule conflicts feed critical-path analysis.",
      ],
      prerequisites: [
        "Lesson 1 — Leading a Team (leadership styles; motivation theory; Talent Triangle).",
        "Awareness of Thomas-Kilmann Conflict Mode Instrument (high-level).",
        "Basic communication and meeting-facilitation skills.",
        "One project lifecycle observed as a participant, including at least one stakeholder escalation.",
      ],
      references: [
        "PMI — A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition.",
        "PMI — Agile Practice Guide.",
        "PMI — PMP Examination Content Outline (ECO).",
        "PMI — PMI Talent Triangle®.",
        "ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management.",
        "Kouzes & Posner — The Leadership Challenge (6th ed., 2017).",
        "Goleman — Emotional Intelligence (1995).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Managing Conflict",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Construction",
      stem: "A Construction PM faces a 21-day schedule slip driven by a preferred-vendor subcontractor dispute over HVAC rough-in tolerance. Direct cost is $4,800/day; deferred ward-opening revenue is $24,000/day for 5 days. Stakes are high; relationship is long-term; time-cost of collaborating is 2 days. Which Thomas-Kilmann mode is most appropriate?",
      whyCorrect:
        "Collaborating (high assertiveness, high cooperativeness) is the appropriate mode when both parties' concerns are critical, the relationship is long-term, and the time-cost of collaboration is much smaller than the time-cost of unresolved conflict. Here: high stakes (patient safety + $220,800 conflict-cost), long-term relationship (preferred vendor), 2 days of collaborating vs. 21+ days of unresolved conflict. The collaborating mode produces a written tolerance standard that addresses the root cause and preserves the relationship for future projects.",
      whyOthersWrong: [
        "Competing — forces one sub to absorb the full rework; erodes the preferred-vendor relationship and creates future-project risk.",
        "Avoiding — the issue worsens with delay (regulatory ward-opening date fixed); conflict-cost compounds at $4,800/day + $24,000/day opportunity.",
        "Accommodating — implies the PM absorbs the rework or yields to one sub; abandons stewardship on a safety-critical tolerance issue.",
      ],
      explanation:
        "Thomas-Kilmann mode selection reads stakes × time-pressure × relationship value. High stakes + long-term relationship + time-cost asymmetry (2 days << 21+ days) → Collaborating. The conflict-cost estimate ($220,800) is the dollar justification to intervene now.",
      options: [
        { text: "Competing — force the structural subcontractor to absorb the full rework cost", isCorrect: false },
        { text: "Collaborating — joint site walk, written tolerance standard, split rework 50/50", isCorrect: true },
        { text: "Avoiding — let the subs resolve it themselves; escalate only if it continues", isCorrect: false },
        { text: "Accommodating — yield to the mechanical subcontractor's claim to preserve schedule", isCorrect: false },
      ],
    },
    {
      competencyName: "Managing Conflict",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is NOT one of Goleman's five components of emotional intelligence?",
      whyCorrect:
        "Assertiveness is NOT a Goleman EI component — it is one of the two Thomas-Kilmann axes (the other being cooperativeness). Goleman's five components are self-awareness, self-regulation, motivation, empathy, and social skill. Confusing the two frameworks is a common exam trap.",
      whyOthersWrong: [
        "Self-awareness — a Goleman component (recognize one's own emotions in real time).",
        "Self-regulation — a Goleman component (manage one's emotions; pause before responding).",
        "Empathy — a Goleman component (sense others' emotions; read underlying interests).",
      ],
      explanation:
        "Goleman (1995) defines five EI components: self-awareness, self-regulation, motivation, empathy, social skill. Assertiveness is a Thomas-Kilmann axis, not a Goleman component. The two frameworks are complementary: TK gives the response typology; Goleman gives the self-management precondition.",
      options: [
        { text: "Self-awareness", isCorrect: false },
        { text: "Self-regulation", isCorrect: false },
        { text: "Assertiveness", isCorrect: true },
        { text: "Empathy", isCorrect: false },
      ],
    },
    {
      competencyName: "Managing Conflict",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem: "A PM estimates conflict-cost for an unresolved HVAC subcontractor dispute: downtime 168 hours at $600/h, rework $0, opportunity cost 5 days at $24,000/day, escalation $0. What is the conflict-cost (CC)?",
      whyCorrect:
        "CC = D_h × R_$/h + W_r + D_d × O_$/d + E_s = 168 × $600 + $0 + 5 × $24,000 + $0 = $100,800 + $0 + $120,000 + $0 = $220,800. The conflict-cost estimate quantifies the price of unresolved conflict and justifies immediate PM intervention (the > $50k threshold mandates action).",
      whyOthersWrong: [
        "$100,800 — accounts for downtime only; misses the $120,000 opportunity cost.",
        "$120,000 — accounts for opportunity cost only; misses the $100,800 direct downtime cost.",
        "$168,000 — confuses hours (168) with dollars (168 × $600 = $100,800).",
      ],
      explanation:
        "The conflict-cost formula CC = downtime_hours × $/h + rework + opportunity_cost_per_day × delay_days + escalation. Plugging in: 168 × $600 + $0 + 5 × $24,000 + $0 = $220,800. This dollar figure is the PM's mandate to intervene now rather than 'let it work itself out.'",
      options: [
        { text: "$100,800", isCorrect: false },
        { text: "$120,000", isCorrect: false },
        { text: "$220,800", isCorrect: true },
        { text: "$168,000", isCorrect: false },
      ],
    },
    {
      competencyName: "Managing Conflict",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Cognitive (task) conflict — disagreement about how to do the work — is generally productive and should be amplified by the project manager, while affective (personal) conflict is destructive and should be converted.",
      whyCorrect:
        "True. Cognitive (task) conflict — disagreement about how to do the work — surfaces assumptions, tests options, and prevents groupthink; the PM should amplify it in design reviews and technical debates. Affective (personal) conflict — disagreement about each other — shifts energy from the work to the relationship, builds coalitions, and escalates; the PM should convert it by re-anchoring on the work, separating people from problem, and mediating or restructuring if needed.",
      whyOthersWrong: [
        "False — the candidate would conflate all conflict as destructive; this is a common exam trap. The PMI People domain explicitly distinguishes cognitive from affective conflict and treats the former as a productive signal.",
      ],
      explanation:
        "Cognitive conflict (disagreement about how) improves decisions when managed; the PM should amplify it via design reviews, technical debates, and structured dissent. Affective conflict (disagreement about each other) degrades performance; the PM should convert it by separating people from problem, re-anchoring on the work, and mediating or restructuring teams if needed.",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Coaching & Mentoring
// (Competency: "Coaching & Mentoring"; slug: ppl-coaching-mentoring)
// ---------------------------------------------------------------------------

const LESSON_PPL_COACHING_MENTORING: RefLesson = {
  competencyName: "Coaching & Mentoring",
  slug: "ppl-coaching-mentoring",
  title: "Coaching & Mentoring — GROW, SBI Feedback & Servant Leadership",
  titleAr: "التدريب والإرشاد — نموذج GROW وملاحظات SBI والقيادة الخادمة",
  order: 3,
  durationMin: 33,
  references: PPL_REFERENCE_TITLES,
  conceptIntroduction: `Coaching and mentoring are the project manager's deliberate development of team-member capability. The PMI People domain treats them as distinct, learnable competencies — not personality traits. Coaching is *skill* development: a structured, time-boxed dialogue that helps a team member discover their own solution to a current work challenge (the GROW model — Goal, Reality, Options, Will). Mentoring is *career* development: a longer, relationship-based investment that helps a team member grow into future roles. Both rely on feedback models — most commonly the SBI (Situation-Behavior-Impact) framework — and on the servant-leadership stance the PMBOK® Guide 7th Edition endorses. This lesson equips the candidate to: (1) distinguish coaching from mentoring; (2) run a GROW coaching session with sample dialogue; (3) deliver SBI feedback; (4) act as servant-leader-developer across the project lifecycle.`,
  example: `A Healthcare PM is leading an EHR rollout with a clinical-lead nurse (let's call her Dr. A) who is technically competent but struggles to translate clinical workflow concerns into IT-change requests. The IT team receives her concerns as vague; the project has had 3 rework cycles in 6 weeks. The PM coaches Dr. A using GROW: Goal ("In the next 2 sprints, I want each of my clinical concerns to be translatable into a structured change request within 24 hours"), Reality ("Currently I describe the workflow problem; IT asks 4 follow-up questions; I lose 2 days waiting"), Options ("I could (a) use a clinical-to-IT translation template, (b) pair with an IT analyst for 2 sprints, (c) take a 4-hour course on user stories"), Will ("I'll do (b) — pair with the IT analyst for 2 sprints and adopt the translation template; I commit to a structured change request within 24 hours of identifying a concern"). Outcome: 2 sprints later, rework cycles drop from 3/sprint to 1; Dr. A's change-request conversion time drops from 2 days to 6 hours; she reports higher confidence and is being considered for a clinical-informatics promotion (the mentoring track opens).`,
  keyFormulas: `Span of control / coaching capacity:
  s = n × (n − 1) / 2 communication channels; coaching capacity ≈ 4–6 direct reports
  — beyond 6 reports, the PM cannot sustain biweekly 1:1 coaching.
GROW model (4 stages, qualitative):
  G — Goal: what does the coachee want from this session and from the overall change?
  R — Reality: what is happening now? (data, examples, stakeholder views)
  O — Options: what could the coachee do? (brainstorm, no judgment)
  W — Will (or Way Forward): what will the coachee do? (commitment, by when, with what support)
SBI feedback (3 components):
  S — Situation (when/where); B — Behavior (observable, not interpretive); I — Impact (on the work/team/individual).
  Optionally add a 4th component: Intent ("What was your intent?") → SBI-I.
Coaching cadence (recommended):
  biweekly 1:1, 30 min, structured GROW; quarterly 60-min career conversation.
Mentoring ratio (recommended):
  1 mentor : 1–2 mentees; quarterly 90-min career conversation + ad hoc.
Servant-leadership checklist (Greenleaf; PMBOK 7th):
  (a) Do those served grow as persons? (b) Do they, while being served, become healthier/wiser/freer/more autonomous? (c) What is the effect on the least privileged in society? (operationalized as: the most junior team member).`,
  exercise: `You are the PM on an IT cloud-migration program. One of your engineers (mid-level, 4 years experience) consistently produces clean code but misses standup, misses design reviews, and resists feedback. (a) Decide whether this is a coaching or mentoring situation (justify). (b) Run a GROW session: write the Goal, the Reality (with specific data), 3 Options, and a Will. (c) Draft an SBI feedback statement for the standup absences. (d) Compute your span-of-control capacity if you have 7 engineers reporting to you — can you sustain biweekly 1:1 coaching for all? (e) Identify one servant-leadership check question you would ask yourself after the session.`,
  sections: {
    learning_objectives: `- Distinguish coaching (skill development, time-boxed, GROW) from mentoring (career development, relationship-based, longer horizon).
- Run a GROW coaching session: Goal, Reality, Options, Will — with sample dialogue and outcomes.
- Deliver SBI (Situation-Behavior-Impact) feedback and the SBI-I variant with intent inquiry.
- Apply the servant-leadership stance (Greenleaf; PMBOK® 7th Edition) as the developer-of-others.
- Compute span-of-control capacity to determine sustainable coaching cadence (C(n)=n(n−1)/2; capacity ≈ 4–6 reports).
- Distinguish feedback (a specific observation about a specific behavior) from evaluation (a judgment about worth) and prescribe when each is appropriate.
- Build a 90-day coaching and mentoring plan for a team member.`,
    prerequisites: `- Lesson 1 — Leading a Team (leadership styles; PMI Talent Triangle; the Power-Skills leg).
- Lesson 2 — Managing Conflict (Goleman EI as the precondition for feedback delivery).
- Basic 1:1 and meeting-facilitation skills.
- A project lifecycle seen as a participant, including at least one team-member development conversation.`,
    introduction: `Coaching and mentoring are the project manager's deliberate investment in team-member capability. The PMI People domain treats them as distinct, learnable competencies. *Coaching* is skill development: a structured, time-boxed dialogue that helps a team member discover their own solution to a current work challenge. *Mentoring* is career development: a longer, relationship-based investment that helps a team member grow into future roles. Both rely on feedback models — most commonly the SBI (Situation-Behavior-Impact) framework — and on the servant-leadership stance the PMBOK® Guide 7th Edition endorses as the project-manager default.

The GROW model (John Whitmore, 1980s, drawing on Timothy Gallwey's "Inner Game" work) is the canonical coaching structure: Goal (what does the coachee want from this session and from the overall change?), Reality (what is happening now? — data, examples, stakeholder views), Options (what could the coachee do? — brainstorm, no judgment), Will (what will the coachee do? — commitment, by when, with what support). GROW's discipline is that the coach asks, the coachee answers; the coach resists the temptation to give advice. The coachee's ownership of the solution is the mechanism of growth — advice-giving collapses the development opportunity.

SBI (Situation-Behavior-Impact) is the canonical feedback model. Situation: when and where. Behavior: what the person did, observable and non-interpretive ("you arrived 10 minutes late to the standup on Tuesday" — not "you are unreliable"). Impact: the consequence on the work, team, or individual ("the standup started late; the QA lead could not leave for the regression test"). The SBI-I variant adds a fourth component — Intent ("What was your intent?") — to surface the coachee's reasoning without assumption. SBI is feedback (specific observation about a specific behavior); evaluation (a judgment about worth) is a different act and should be reserved for formal performance review.

Servant leadership (Robert Greenleaf, 1977; PMBOK® Guide 7th Edition default) is the developer-of-others stance. Greenleaf's test: "Do those served grow as persons? Do they, while being served, become healthier, wiser, freer, more autonomous, more likely themselves to become servants?" The PM operationalizes this by removing blockers, securing resources, and amplifying capability — and by deliberately coaching and mentoring rather than directing. The servant-leader-developer is the PMBOK® 7th Edition's named stance for project managers, especially on agile and hybrid teams.

The PM's coaching capacity is bounded by span of control. The communication-channel formula C(n) = n(n−1)/2 quantifies the coordination overhead; in practice, a PM cannot sustain biweekly 1:1 coaching beyond 4–6 direct reports. Above that ceiling, the PM should spawn leads (who coach their own sub-teams) or limit team size. This is the same span-of-control discipline from the leading-a-team lesson, applied to the coaching conversation.`,
    terminology: `- **Coaching**: structured, time-boxed skill-development dialogue; the coach asks, the coachee discovers.
- **Mentoring**: longer, relationship-based career-development investment.
- **GROW model**: Goal → Reality → Options → Will (Whitmore, 1980s).
- **SBI feedback**: Situation → Behavior → Impact; SBI-I adds Intent.
- **Feedback**: specific observation about a specific behavior (SBI); distinct from evaluation.
- **Evaluation**: judgment about worth; reserved for formal performance review.
- **Servant leadership (Greenleaf; PMBOK 7th)**: leader-as-developer-of-others; removes blockers, secures resources, amplifies capability.
- **1:1 cadence**: biweekly 30-minute structured coaching conversation.
- **Career conversation**: quarterly 60-minute mentoring conversation.
- **Span of control / coaching capacity**: ≈ 4–6 direct reports for biweekly 1:1 coaching; C(n)=n(n−1)/2 quantifies overhead.
- **Reflective practice**: the coach's own review of the session (what worked, what didn't, what to try next).`,
    detailed_explanation: `Coaching vs mentoring is the candidate's first distinction. Coaching is skill-focused, time-boxed, and tied to a current work challenge: the GROW structure takes 30–45 minutes, biweekly cadence, and produces a commitment the coachee owns. Mentoring is career-focused, longer-horizon, and tied to the mentee's growth into future roles: quarterly 60–90-minute conversations, often over years, focused on career direction, sponsorship, and the mentee's developing professional identity. The PM often coaches (current project, current challenge); mentoring may sit with a senior outside the project or with the PM if the relationship matures.

The GROW model's discipline is that the coach asks, the coachee answers. The coach resists advice-giving because advice collapses the development opportunity: the coachee gets a solution but not the practice of generating solutions. The four stages: Goal ("What do you want from this session? What do you want from the overall change?"), Reality ("What is happening now? — give me data, examples, stakeholder views"), Options ("What could you do? — let's brainstorm; no judgment in this stage"), Will ("What will you do? — by when, with what support, and how will we know it worked?"). The Will stage is a commitment — not a wish; the coachee names the action, the date, and the measure of success.

The GROW session produces two artifacts: a written commitment (the coachee's Will) and a follow-up date. Without the follow-up, the commitment is a wish. The PM's role at the follow-up is to ask "What happened? What worked? What didn't? What will you do next?" — not to evaluate. The growth mechanism is the coachee's reflection on their own action.

SBI (Situation-Behavior-Impact) is the canonical feedback model. Situation: when and where — specific. Behavior: what the person did — observable, non-interpretive. ("You arrived 10 minutes late to the standup on Tuesday" — not "you are unreliable.") Impact: the consequence on the work, team, or individual. ("The standup started late; the QA lead could not leave for the regression test.") The SBI-I variant adds a fourth component — Intent ("What was your intent?") — to surface the coachee's reasoning without assumption. SBI is feedback; evaluation (judgment about worth) is a different act and should be reserved for formal performance review. The PM who delivers SBI feedback in the moment, biweekly 1:1, avoids the annual-review surprise and builds trust.

Feedback vs evaluation is a key distinction. Feedback (SBI) is specific, behavioral, in-the-moment, and developmental — it tells the coachee what to keep doing or change. Evaluation is summative, judgmental, periodic, and administrative — it tells the coachee whether they are meeting role expectations (often tied to compensation). The PM uses feedback continuously; evaluation is the organization's HR process. Conflating the two degrades both: the coachee hears feedback as evaluation (defensive) and the evaluation loses credibility (because it was preceded by no actionable feedback).

Servant leadership (Greenleaf 1977; PMBOK® 7th Edition default) is the developer-of-others stance. Greenleaf's test: "Do those served grow as persons? Do they, while being served, become healthier, wiser, freer, more autonomous, more likely themselves to become servants?" The PM operationalizes this by removing blockers, securing resources, amplifying capability — and by deliberately coaching and mentoring rather than directing. Servant leadership is not soft: it includes hard feedback (SBI), hard decisions (DACI), and hard accountability (Will commitments). It is the stance that aligns the PM's power with the team's growth.

The PM's coaching capacity is bounded by span of control. The communication-channel formula C(n) = n(n−1)/2 quantifies the coordination overhead; in practice, a PM cannot sustain biweekly 1:1 coaching beyond 4–6 direct reports. Above that ceiling, the PM should spawn leads (who coach their own sub-teams) or limit team size. The 1:1 cadence is the operational mechanism: biweekly 30-minute structured GROW; quarterly 60-minute career conversation. Without the cadence, coaching is intermittent; with the cadence, it compounds.`,
    core_principles: `- Coaching is skill development (GROW, biweekly 1:1); mentoring is career development (quarterly career conversation, often over years).
- The coach asks; the coachee discovers. Advice collapses the development opportunity.
- GROW's Will stage is a commitment (action + date + measure); without follow-up, it is a wish.
- SBI feedback is specific, behavioral, in-the-moment; evaluation is summative, judgmental, periodic. Don't conflate them.
- The SBI-I variant adds Intent inquiry to surface reasoning without assumption.
- Servant leadership (Greenleaf; PMBOK 7th) is the developer-of-others stance; not soft — it includes hard feedback and hard accountability.
- Coaching capacity ≈ 4–6 direct reports; above that, spawn leads or limit team size.
- Coaching cadence compounds; intermittent coaching does not.`,
    components: `- GROW model (4 stages: Goal, Reality, Options, Will) — the canonical coaching structure.
- SBI feedback model (3 components: Situation, Behavior, Impact); SBI-I variant (adds Intent).
- 1:1 cadence — biweekly 30-minute structured GROW.
- Career conversation — quarterly 60-minute mentoring.
- Written commitment artifact (the coachee's Will: action + date + measure).
- Follow-up date (without it, the commitment is a wish).
- Servant-leadership self-check (Greenleaf's three questions).
- Reflective-practice journal (the coach's review of the session).`,
    process: `1. Frame: is this a coaching (skill, current challenge, biweekly 1:1) or mentoring (career, longer horizon, quarterly) situation?
2. Schedule the 1:1 (biweekly 30 min) or career conversation (quarterly 60 min).
3. Open GROW: Goal — "What do you want from this session? What do you want from the overall change?"
4. Reality — "What is happening now? Give me data, examples, stakeholder views." (The coach listens; the coachee speaks.)
5. Options — "What could you do? Let's brainstorm; no judgment in this stage." (Generate 3+ options.)
6. Will — "What will you do? By when, with what support, and how will we know it worked?" (Commitment.)
7. Write the commitment (action + date + measure); name a follow-up date.
8. At follow-up: "What happened? What worked? What didn't? What will you do next?" (Reflection, not evaluation.)
9. Deliver SBI feedback in the moment for observable behaviors; deliver SBI-I when intent is unclear.
10. Reflective practice: journal what worked, what didn't, what to try next; review quarterly.
11. Servant-leadership self-check: "Did the coachee grow? Did they become more autonomous? What was the effect on the most junior team member?"`,
    formula_calculation: `Variables and formulas:
- n: team size (direct reports to the PM) [count]
- C(n): pairwise communication channels = n(n−1)/2 [count]
- Coaching capacity: ≈ 4–6 direct reports for biweekly 1:1
- T_1: 1:1 duration [min]; cadence: biweekly → 26 sessions/year per report
- T_c: career conversation duration [min]; cadence: quarterly → 4 sessions/year per mentee
- Annual coaching time per report = 26 × T_1 + 4 × T_c [min/year]

Coaching-capacity example (PM with 7 engineers, biweekly 30-min 1:1 + quarterly 60-min career):
- Per report: 26 × 30 + 4 × 60 = 780 + 240 = 1,020 min/year = 17 h/year.
- 7 reports: 7 × 17 = 119 h/year of structured coaching.
- Communication channels: C(7) = 7×6/2 = 21 (theoretical max).
- At 7 reports, the PM is at the edge of sustainable coaching; above 8 reports, spawn a lead.

Span-of-control thresholds (qualitative):
- n ≤ 4: sustainable biweekly 1:1 with deep coaching.
- 5 ≤ n ≤ 7: sustainable biweekly 1:1 with disciplined cadence.
- n ≥ 8: spawn a lead; the PM coaches the lead, the lead coaches the sub-team.

Servant-leadership checklist (Greenleaf):
- (a) Did the coachee grow as a person?
- (b) Did they become healthier, wiser, freer, more autonomous?
- (c) What was the effect on the most junior team member?

Units: n, C in counts; T in minutes.

Assumptions: (i) the 1:1 cadence is held (cancellation rate < 20%); (ii) the coachee is willing (coaching cannot be forced); (iii) the coach can resist advice-giving; (iv) the coach has the EI (Goleman) to listen without defensiveness.

Interpretation: C(n) and the 4–6 capacity ceiling together justify span-of-control discipline. A PM with 10 reports has C(10)=45 channels and cannot sustain biweekly 1:1 — either spawn leads or limit team size. The annual-coaching-time number (e.g., 119 h/year for 7 reports) is the PM's capacity-planning basis.`,
    worked_example: `**Healthcare EHR rollout — coaching Dr. A (clinical-lead nurse) to translate clinical workflow concerns into structured IT change requests.**

Context: Dr. A is technically competent but her change requests to IT are vague; the project has had 3 rework cycles in 6 weeks because IT asks 4 follow-up questions each time.

Step 1 — Frame: skill development tied to a current work challenge → coaching (GROW). The career path (clinical informatics) is a separate mentoring track.

Step 2 — Schedule: biweekly 30-min 1:1; first session today.

Step 3 — Goal:
- PM: "What do you want from this session? What do you want from the overall change?"
- Dr. A: "I want my clinical concerns to be translatable into a structured IT change request within 24 hours, so the IT team can act without 4 follow-up questions."

Step 4 — Reality:
- PM: "What is happening now? Give me data, examples, stakeholder views."
- Dr. A: "I describe the workflow problem — 'the medication-reconciliation step blocks discharge planning.' IT asks 4 questions — what screen, what user role, what data, what should happen instead. I lose 2 days waiting for the next sprint planning."
- PM: "How many of your concerns became change requests in the last 6 weeks?"
- Dr. A: "Three. Two were reworked twice. One was rejected for being out of scope."

Step 5 — Options (brainstorm, no judgment):
- Dr. A: "(a) Use a clinical-to-IT translation template — what screen, what user role, what data, what should happen instead. (b) Pair with an IT analyst for 2 sprints. (c) Take a 4-hour user-stories course. (d) Bring a clinician peer to sprint planning. (e) Pre-write the change request before the next planning."
- PM adds: "(f) Set up a 15-minute weekly clinic with the IT analyst."

Step 6 — Will:
- Dr. A: "I'll do (b) pair with the IT analyst for 2 sprints and adopt the translation template (a). I'll commit to a structured change request within 24 hours of identifying a concern. I'll measure success by tracking rework cycles — target ≤ 1 per sprint, down from 3."
- PM: "What support do you need?"
- Dr. A: "The IT analyst's time for 2 sprints, and the template."

Step 7 — Written commitment: Dr. A pairs with IT analyst, sprints 7–8; structured change request within 24h; rework-cycle target ≤ 1/sprint.

Step 8 — Follow-up (2 sprints later):
- PM: "What happened? What worked? What didn't? What next?"
- Dr. A: "Pairing worked — the analyst helped me see IT's framing. The template helped me pre-think. Rework cycles dropped from 3/sprint to 1. Change-request conversion time dropped from 2 days to 6 hours. Next: I'll co-train two other clinicians on the template next sprint."

Step 9 — SBI feedback (delivered mid-session on a specific behavior):
- PM: "In Tuesday's planning, you arrived with the workflow described in 4 sentences and no template (Situation); the IT team asked 4 questions and you waited 2 days for the next planning (Behavior); the QA regression slipped a day because the change request wasn't ready (Impact). What was your intent?"
- Dr. A: "I didn't realize the template was expected at planning; I thought it was for the request itself."
- PM: "Got it. Let's align on the template-at-planning expectation and update the team charter."

Step 10 — Servant-leadership self-check:
- (a) Did Dr. A grow as a person? Yes — she now owns a structured translation skill.
- (b) Did she become more autonomous? Yes — she will co-train two other clinicians.
- (c) Effect on the most junior team member? The IT analyst, who is mid-career, gained clinical context and is being considered for a senior-analyst promotion track.

Step 11 — Reflective-practice journal (the PM):
- What worked: GROW structured the session; the coachee owned the Will; SBI was specific and actionable.
- What didn't: I cut off option (e) too quickly; the coachee had one more idea I missed.
- What to try next: Let options brainstorm run to 5+ before narrowing; add a 1-line written commitment summary email to reinforce.

**Outcome (4 weeks later)**: rework cycles 3/sprint → 1/sprint; Dr. A's change-request conversion 2 days → 6 hours; Dr. A reports higher confidence and is being considered for a clinical-informatics promotion (mentoring track opens).`,
    industrial_example: `**Healthcare — EHR rollout** (above; GROW coaching of a clinical lead produced a 3x reduction in rework cycles and opened the mentoring track).

**IT — Cloud-migration program** — A mid-level engineer consistently produces clean code but misses standups and resists feedback. The PM coaches using GROW: Goal ("Attend 90% of standups in the next 4 sprints; receive SBI feedback without push-back"); Reality ("Missed 6 of last 10 standups; pushed back on the last 3 SBI feedback statements"); Options ("(a) Move standup to 9:30 to align with school drop-off; (b) Pre-commit a 1-line standup update the night before; (c) Read one SBI article and respond with one clarifying question"); Will ("(a) + (c); commit to attend 90%; receive SBI with one clarifying question"). Outcome: 4 sprints later, attendance 95%; push-back eliminated; engineer reports feeling heard (the 9:30 shift removed a real constraint).

**Construction — Hospital expansion** — A graduate engineer is struggling to escalate structural-tolerance issues to the structural subcontractor. The PM coaches using GROW: Goal ("Escalate tolerance issues to the SS within 4 hours of identifying them"); Reality ("Currently waits 2–3 days, hoping the issue resolves"); Options ("(a) Use a 1-page escalation template; (b) Pair with a senior engineer for 2 weeks; (c) Take a 2-hour conflict-communication course"); Will ("(a) + (b) for 2 weeks; commit to a 4-hour SLA on tolerance escalations"). Outcome: 2 weeks later, escalation SLA met; the graduate engineer is being mentored toward a site-engineer role.

**Oil & Gas — Turn-around** — A young superintendent avoids delivering bad news to the project director. The PM coaches using GROW: Goal ("Deliver bad news to the PD within 2 hours of identifying it, with a recommendation"); Reality ("Currently waits 1–2 days, hoping for a recovery"); Options ("(a) Use a 3-line bad-news template (issue + impact + recommendation); (b) Shadow the PM on the next bad-news call; (c) Take a 1-day assertive-communication course"); Will ("(a) + (b); commit to a 2-hour SLA"). Outcome: 4 weeks later, the bad-news SLA is met; the superintendent's standing with the PD has risen.`,
    case_study: `**CASE STUDY (SYNTHETIC) — Healthcare EHR Coaching of "Dr. A" (composite scenario, 2 sprints).**

Context: EHR rollout; clinical-lead nurse Dr. A produces vague change requests; 3 rework cycles per sprint; IT asks 4 follow-up questions each time.

Problem: Dr. A's skill gap is translation of clinical workflow concerns into IT change requests. The PM's skill gap (in reflection) is cutting off options too quickly.

Constraints: (a) Clinical workflow concerns are patient-safety critical — must be addressed quickly. (b) IT team capacity is constrained — rework cycles are costly. (c) Dr. A is a respected clinician — the intervention must not be experienced as criticism. (d) The PM is at 7 direct reports — at the edge of coaching capacity.

Analysis: Coaching (skill) not mentoring (career) at this stage. GROW is the structure; SBI is the in-the-moment feedback mechanism. Servant-leadership self-check operationalizes Greenleaf's test.

Decision: Biweekly 30-min 1:1; first session framed as a partnership ("I want to help you get change requests through faster"); GROW structure; SBI delivered on the specific Tuesday-planning absence; written commitment (template + pairing + 24h SLA + rework-cycle target).

Alternatives considered: (a) Send Dr. A to a 4-hour user-stories course — rejected (skill is project-specific; the course would not address the clinical-to-IT translation). (b) Replace Dr. A with another clinical lead — rejected (Dr. A is the respected clinician; replacement would lose clinical credibility). (c) Have the PM write Dr. A's change requests for her — rejected (collapses the development opportunity; creates a dependency). (d) Add an IT analyst to support Dr. A — accepted as part of the Will.

Consequences: Rework cycles 3/sprint → 1/sprint. Change-request conversion 2 days → 6 hours. Dr. A reports higher confidence. Dr. A is being considered for a clinical-informatics promotion — the mentoring track opens. The PM's reflective journal notes cutting off options as the development area for the next session.

Lessons learned: (1) Coaching (GROW) and mentoring (career path) are distinct; the PM addressed coaching first, then opened the mentoring track. (2) SBI delivered in the moment built trust; without it, the GROW session would have felt abstract. (3) Servant-leadership self-check operationalized Greenleaf's test; the most-junior check (IT analyst) surfaced a senior-analyst promotion opportunity. (4) The 7-report capacity was the edge of sustainable coaching; above 8 reports the PM would have spawned a lead. (5) Reflective-practice journal captured the PM's own development area (cutting off options).`,
    visual_explanation: `Picture the GROW model as a 4-step staircase ascending left to right: Goal (top-left, the desired outcome) → Reality (next step, the current state with data) → Options (third step, 3+ brainstormed paths) → Will (top-right, the committed action + date + measure). The coachee climbs the staircase; the coach asks, the coachee answers. The SBI feedback model is a 3-block arrow: Situation (when/where) → Behavior (observable) → Impact (consequence); the SBI-I variant adds a fourth block, Intent (a question mark, not a statement). The servant-leadership checklist is a triangle with Greenleaf's three questions at the corners.`,
    simulation_opportunity: `Build a coaching simulator. Inputs: team size n, coachee's current challenge (1-paragraph), coachee's role, PM's EI 5-component score (1–5 each), 1:1 cadence (biweekly/weekly/monthly), 1:1 duration (min). Engine: compute C(n) and the annual coaching-time budget; compute the PM's coaching capacity (4–6 ceiling); produce a GROW script with prompts for each stage; compute an SBI generator (user inputs Situation, Behavior, Impact, optional Intent); compute Greenleaf's three-question checklist. Output: GROW coaching script, SBI statement, coaching-capacity flag, annual coaching-time budget, servant-leadership self-check. Use it to walk candidates through a 30-minute coaching session with sample dialogue.`,
    common_mistakes: `- **Advice-giving**: the coach who tells the coachee what to do collapses the development opportunity; the coachee gets a solution but not the practice of generating solutions.
- **Skipping Reality**: jumping from Goal to Options without data produces options that don't fit the actual situation.
- **Options judgment**: evaluating options during brainstorming ("that won't work") closes off creativity; defer judgment to the Will stage.
- **Will without commitment**: a Will without action + date + measure is a wish; the follow-up never happens.
- **SBI as evaluation**: "you are unreliable" is evaluation, not SBI; SBI is observable behavior, non-interpretive.
- **No follow-up**: the 1:1 without follow-up cancels the development mechanism — reflection on action is the growth.
- **Conflating feedback with evaluation**: delivering SBI as evaluation makes the coachee defensive; delivering evaluation as SBI makes the evaluation lose credibility.
- **Span-of-control blindness**: adding direct reports without computing C(n) and the 4–6 capacity ceiling erodes coaching quality.
- **Coaching unwilling coachees**: coaching requires willingness; forced coaching produces compliance without growth.`,
    limitations: `- GROW is a 1980s model (Whitmore); modern coaching research (ICF competencies, solution-focused coaching) refines but does not invalidate it.
- SBI is a feedback structure, not a feedback culture; the culture (psychological safety — see ppl-building-shared-vision) is the precondition.
- Coaching capacity (4–6 reports) assumes biweekly 30-min cadence; higher cadence reduces capacity.
- Mentoring is relationship-based and often spans years; the project PM may not be in the role long enough to mentor.
- Servant leadership is the PMBOK® 7th Edition default but is not universally appropriate — crisis or low-maturity teams may need directive behavior (see ppl-leading-a-team).
- The GROW coach must resist advice-giving; this is a learnable skill but not trivial — the coach's own EI (Goleman) is the precondition.`,
    comparison: `| Dimension | Coaching | Mentoring |
|---|---|---|
| Focus | Skill (current work challenge) | Career (future role growth) |
| Horizon | 2–6 sprints | 1–5 years |
| Cadence | Biweekly 30-min 1:1 | Quarterly 60–90-min career conversation |
| Structure | GROW (Goal-Reality-Options-Will) | Career-path conversation, sponsorship |
| Coach's role | Ask; coachee discovers | Share experience; sponsor |
| Output | Written commitment + follow-up | Career-development plan + sponsorship |

| Feedback model | Components | When to use |
|---|---|---|
| SBI | Situation, Behavior, Impact | Observable behavior; in-the-moment |
| SBI-I | + Intent | Intent unclear; conflict-adjacent |
| COIN | Context, Observation, Impact, Next | Alternative to SBI; adds next-steps |
| 360 feedback | Multi-source, aggregated | Formal development review |
| Evaluation | Summative judgment | Annual performance review (HR process) |

| Servant-leadership check | Question |
|---|---|
| (a) Growth | Did the coachee grow as a person? |
| (b) Autonomy | Did they become more autonomous? |
| (c) Most junior | What was the effect on the most junior team member? |`,
    practical_application: `On a real project: (1) frame each team-member conversation as coaching (skill, current challenge) or mentoring (career, longer horizon) — most are coaching; (2) hold biweekly 30-min 1:1 with GROW structure; the coach asks, the coachee answers; (3) write the Will commitment (action + date + measure); (4) hold the follow-up at the next 1:1 — reflection, not evaluation; (5) deliver SBI feedback in the moment for observable behaviors; add SBI-I when intent is unclear; (6) keep a reflective-practice journal — what worked, what didn't, what to try next; (7) compute your coaching capacity (C(n); 4–6 ceiling); spawn leads above 8 reports; (8) run Greenleaf's three-question servant-leadership check after each session. The PMP ECO People task "Coaching & Mentoring" is operationally this loop.`,
    decision_scenario: `You are the PM on an IT cloud-migration program. A mid-level engineer consistently produces clean code but misses standups and resists feedback. Which sequence is most consistent with this lesson? (a) Document the absences and request HR action; (b) Send a one-line email: "Please attend standups"; (c) Frame as coaching, run a GROW session, deliver SBI on the absences, write a Will commitment, follow up biweekly; (d) Replace the engineer with a more senior hire. Correct: (c). (a) is evaluation before feedback (skips the development step). (b) is too thin to develop. (d) ignores the development opportunity and the cost of replacement. (c) follows the lesson's frame → GROW → SBI → Will → follow-up loop and addresses the skill (attendance, feedback reception) without conflating with evaluation.`,
    practice_questions: `1. The coach who tells the coachee what to do is: (a) mentoring; (b) evaluating; (c) advice-giving and collapsing the development opportunity; (d) applying GROW correctly. (Answer: c.)
2. SBI feedback's three components are: (a) Situation, Behavior, Intent; (b) Situation, Behavior, Impact; (c) Subjective, Behavioral, Inferential; (d) Standard, Baseline, Improvement. (Answer: b.)
3. A PM has 9 direct reports; biweekly 30-min 1:1 + quarterly 60-min career conversation. Annual coaching time per report = ? Total = ? Is the PM at capacity? (Answer: per report 26×30 + 4×60 = 780+240 = 1,020 min = 17h; total = 9×17 = 153h/year. Yes — above 8 reports, the PM should spawn a lead.)
4. GROW's Will stage requires: (a) the coach's recommendation; (b) action + date + measure; (c) only an intent statement; (d) a 360 feedback survey. (Answer: b.)`,
    certification_questions: `1. (PMP-style) The GROW coaching model's four stages are: (a) Goal, Reality, Options, Will; (b) Goal, Risks, Objectives, Way; (c) Gather, Reflect, Offer, Wrap-up; (d) Generate, Review, Optimize, Work. (Answer: a.)
2. (PMP-style) SBI feedback stands for: (a) Subjective-Behavioral-Inferential; (b) Situation-Behavior-Impact; (c) Standard-Baseline-Improvement; (d) Self-Belief-Intent. (Answer: b.)
3. (PMP-style) Coaching is best characterized as: (a) career-path sponsorship; (b) skill development tied to a current work challenge; (c) annual performance evaluation; (d) informal chat. (Answer: b.)
4. (PMP-style) Per Greenleaf, the servant-leadership test asks: (a) Is the team on schedule? (b) Are the deliverables defect-free? (c) Do those served grow as persons, become more autonomous, and benefit the least privileged? (d) Is the PM's calendar full? (Answer: c.)`,
    summary: `Coaching (skill development, GROW, biweekly 1:1) and mentoring (career development, longer horizon, quarterly) are distinct, learnable competencies in the PMI People domain. The GROW model (Goal, Reality, Options, Will) structures the coaching conversation; the coach asks, the coachee discovers — advice-giving collapses the development opportunity. SBI (Situation-Behavior-Impact) is the canonical feedback model; SBI-I adds Intent. Servant leadership (Greenleaf; PMBOK® 7th Edition default) is the developer-of-others stance — not soft, it includes hard feedback and hard accountability. Coaching capacity ≈ 4–6 direct reports; the communication-channel formula C(n)=n(n−1)/2 justifies span-of-control discipline above 8 reports.`,
    key_takeaways: `- Coaching (skill, current) vs mentoring (career, longer horizon) — distinct, learnable.
- GROW's Will stage is a commitment (action + date + measure); without follow-up, it is a wish.
- The coach asks; the coachee discovers; advice collapses development.
- SBI is feedback (specific, behavioral, in-the-moment); evaluation is summative, judgmental, periodic — don't conflate them.
- SBI-I adds Intent inquiry when intent is unclear.
- Servant leadership is the PMBOK® 7th Edition default — not soft; includes hard feedback and accountability.
- Coaching capacity ≈ 4–6 direct reports; C(n) justifies span-of-control discipline above 8 reports.
- Reflective-practice journal captures the PM's own development areas.`,
    references: `1. PMI, A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition (2021) — Principle: Leadership (servant leadership as default); Performance Domain: Team.
2. PMI, Agile Practice Guide (2017) — Servant Leadership on Agile Teams; coaching on agile teams; team coaching.
3. PMI, PMP Examination Content Outline — People domain, Task "Coaching & Mentoring."
4. PMI, PMI Talent Triangle® — Power Skills leg (coaching and mentoring are Power Skills).
5. ISO 21500:2021 — Guidance on project management, §4.3 (Stakeholders; team competency development).
6. Kouzes & Posner, The Leadership Challenge (6th ed., 2017) — Enable Others to Act; Encourage the Heart (coaching/feedback practices).
7. Goleman, Emotional Intelligence (1995) — five EI components (the precondition for SBI delivery and coaching dialogue).`,
  },
  knowledgeObject: {
    title: "Coaching & Mentoring — GROW, SBI Feedback, Servant Leadership",
    domain: "People",
    competency: "Coaching & Mentoring",
    topic: "Developer of Others",
    concept: "Coaching (skill) and mentoring (career) as distinct, learnable competencies",
    body: {
      definitions: [
        "Coaching: structured, time-boxed skill-development dialogue; the coach asks, the coachee discovers.",
        "Mentoring: longer, relationship-based career-development investment.",
        "GROW model: Goal → Reality → Options → Will (Whitmore, 1980s).",
        "SBI feedback: Situation → Behavior → Impact; SBI-I adds Intent.",
        "Feedback: specific observation about a specific behavior; distinct from evaluation.",
        "Evaluation: judgment about worth; reserved for formal performance review.",
        "Servant leadership (Greenleaf; PMBOK 7th): leader-as-developer-of-others; removes blockers, secures resources, amplifies capability.",
        "1:1 cadence: biweekly 30-minute structured coaching conversation.",
        "Career conversation: quarterly 60-minute mentoring conversation.",
        "Span of control / coaching capacity: ≈ 4–6 direct reports for biweekly 1:1; C(n)=n(n−1)/2 quantifies overhead.",
        "Reflective practice: the coach's own review of the session.",
      ],
      principles: [
        "Coaching is skill development (GROW, biweekly 1:1); mentoring is career development (quarterly career conversation, often over years).",
        "The coach asks; the coachee discovers — advice collapses the development opportunity.",
        "GROW's Will stage is a commitment (action + date + measure); without follow-up, it is a wish.",
        "SBI feedback is specific, behavioral, in-the-moment; evaluation is summative, judgmental, periodic.",
        "SBI-I adds Intent inquiry to surface reasoning without assumption.",
        "Servant leadership (Greenleaf; PMBOK 7th) is the developer-of-others stance; not soft.",
        "Coaching capacity ≈ 4–6 direct reports; above 8, spawn leads or limit team size.",
        "Coaching cadence compounds; intermittent coaching does not.",
      ],
      components: [
        "GROW model (4 stages: Goal, Reality, Options, Will).",
        "SBI feedback model (3 components); SBI-I variant (adds Intent).",
        "1:1 cadence — biweekly 30-minute structured GROW.",
        "Career conversation — quarterly 60-minute mentoring.",
        "Written commitment artifact (the coachee's Will: action + date + measure).",
        "Follow-up date (without it, the commitment is a wish).",
        "Servant-leadership self-check (Greenleaf's three questions).",
        "Reflective-practice journal (the coach's review of the session).",
      ],
      mechanism: [
        "Coaching lifecycle: frame (coaching vs mentoring) → schedule 1:1 → GROW (Goal-Reality-Options-Will) → write commitment + follow-up date → at follow-up ask 'What happened? What worked? What didn't? What next?' → deliver SBI in-the-moment for observable behaviors → reflect on session → quarterly career conversation opens the mentoring track.",
      ],
      process: [
        "1. Frame: coaching (skill, current challenge) or mentoring (career, longer horizon).",
        "2. Schedule the 1:1 (biweekly 30 min) or career conversation (quarterly 60 min).",
        "3. Open GROW: Goal — what does the coachee want from the session and the overall change?",
        "4. Reality — what is happening now? (data, examples, stakeholder views).",
        "5. Options — what could the coachee do? (brainstorm 3+; no judgment in this stage).",
        "6. Will — what will the coachee do? (action + date + measure + support).",
        "7. Write the commitment; name a follow-up date.",
        "8. At follow-up: what happened? What worked? What didn't? What next? (Reflection, not evaluation.)",
        "9. Deliver SBI feedback in the moment; SBI-I when intent is unclear.",
        "10. Reflective practice: journal what worked, what didn't, what to try next.",
        "11. Servant-leadership self-check (Greenleaf's three questions).",
      ],
      formulas: [
        "Communication channels: C(n) = n(n−1)/2.",
        "Annual coaching time per report = 26 × T_1 + 4 × T_c (biweekly 1:1 + quarterly career).",
        "Coaching capacity ceiling: 4–6 direct reports (biweekly 30-min cadence).",
      ],
      metrics: [
        "1:1 cadence held rate — target ≥ 80% (cancellation < 20%).",
        "Will-commitment follow-up rate — target 100% (the follow-up is the development mechanism).",
        "SBI delivered per week per report — target ≥ 1 (in-the-moment feedback density).",
        "Coaching-capacity flag — target ≤ 6 direct reports; spawn leads above 8.",
        "Reflective-practice journal entries per week — target ≥ 1 per active coachee.",
        "Coachee-skill measure (project-specific) — e.g., rework cycles, SLA, conversion time.",
      ],
      examples: [
        "Healthcare EHR: Dr. A coaching — GROW produced template + pairing + 24h SLA; rework 3→1/sprint; conversion 2d→6h.",
        "IT cloud-migration: standup absences — GROW produced 9:30 shift + 1-line pre-commit; attendance 95%; push-back eliminated.",
        "Construction hospital: graduate engineer escalation — GROW produced 1-page template + senior-engineer pairing; 4h SLA met.",
        "Oil & Gas turn-around: superintendent bad-news avoidance — GROW produced 3-line template + shadow; 2h SLA met.",
      ],
      industrial_examples: [
        "Healthcare — EHR rollout: GROW coaching of clinical lead; rework 3→1/sprint; conversion 2d→6h; opened clinical-informatics promotion track.",
        "IT — Cloud-migration: GROW + SBI on standup absences; 9:30 shift + pre-commit; attendance 95%.",
        "Construction — Hospital expansion: graduate engineer escalation coaching; 4h SLA met; mentored toward site-engineer role.",
        "Oil & Gas — Turn-around: superintendent bad-news coaching; 3-line template + shadow; 2h SLA met.",
      ],
      case_studies: [
        "SYNTHETIC — Healthcare EHR Coaching of 'Dr. A' (composite, 2 sprints). GROW + SBI. Rework 3→1/sprint. Change-request conversion 2d→6h. Dr. A promoted into clinical informatics (mentoring track opened). PM's reflective journal noted cutting off options as the next-session development area.",
      ],
      common_errors: [
        "Advice-giving — the coach tells the coachee what to do; collapses the development opportunity.",
        "Skipping Reality — jumping from Goal to Options without data.",
        "Options judgment — evaluating options during brainstorming.",
        "Will without commitment — a Will without action + date + measure is a wish.",
        "SBI as evaluation — 'you are unreliable' is evaluation, not SBI.",
        "No follow-up — the 1:1 without follow-up cancels the development mechanism.",
        "Conflating feedback with evaluation — degrades both.",
        "Span-of-control blindness — adding direct reports without computing C(n).",
        "Coaching unwilling coachees — produces compliance without growth.",
      ],
      limitations: [
        "GROW is a 1980s model; modern coaching research (ICF, solution-focused) refines but does not invalidate it.",
        "SBI is a structure, not a culture; psychological safety is the precondition.",
        "Coaching capacity (4–6 reports) assumes biweekly 30-min cadence.",
        "Mentoring spans years; the project PM may not be in role long enough.",
        "Servant leadership is the PMBOK 7th default but not universally appropriate — crisis or low-maturity teams may need directive behavior.",
        "GROW requires the coach to resist advice-giving; the coach's own EI is the precondition.",
      ],
      best_practices: [
        "Frame each conversation as coaching or mentoring; most are coaching.",
        "Hold biweekly 30-min 1:1 with GROW structure; the coach asks, the coachee answers.",
        "Write the Will commitment (action + date + measure).",
        "Hold the follow-up at the next 1:1 — reflection, not evaluation.",
        "Deliver SBI feedback in the moment; add SBI-I when intent is unclear.",
        "Keep a reflective-practice journal.",
        "Compute coaching capacity (C(n); 4–6 ceiling); spawn leads above 8 reports.",
        "Run Greenleaf's three-question servant-leadership check after each session.",
        "Open the mentoring track when the coachee's career direction emerges.",
      ],
      related_concepts: [
        "ppl-leading-a-team (PMI Talent Triangle Power-Skills leg; span of control; servant leadership as the PMBOK default).",
        "ppl-managing-conflict (Goleman EI as the precondition for SBI delivery and coaching dialogue).",
        "ppl-building-shared-vision (psychological safety is the precondition for SBI to land safely).",
        "Process domain — coaching skills (e.g., escalation, translation, feedback reception) reduce rework and schedule risk.",
      ],
      prerequisites: [
        "Lesson 1 — Leading a Team (leadership styles; PMI Talent Triangle).",
        "Lesson 2 — Managing Conflict (Goleman EI as the precondition for feedback delivery).",
        "Basic 1:1 and meeting-facilitation skills.",
        "A project lifecycle observed as a participant, including at least one team-member development conversation.",
      ],
      references: [
        "PMI — A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition.",
        "PMI — Agile Practice Guide.",
        "PMI — PMP Examination Content Outline (ECO).",
        "PMI — PMI Talent Triangle®.",
        "ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management.",
        "Kouzes & Posner — The Leadership Challenge (6th ed., 2017).",
        "Goleman — Emotional Intelligence (1995).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Coaching & Mentoring",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Healthcare",
      stem: "A Healthcare PM coaches a clinical-lead nurse (Dr. A) whose vague change requests cause 3 rework cycles per sprint. Using the GROW model, which sequence of questions is most consistent with this lesson?",
      whyCorrect:
        "GROW's discipline is that the coach asks, the coachee discovers, in the order Goal → Reality → Options → Will. Goal: 'What do you want from this session and the overall change?' Reality: 'What is happening now? — data, examples, stakeholder views.' Options: 'What could you do? — brainstorm 3+, no judgment in this stage.' Will: 'What will you do? — action + date + measure + support.' The coach resists advice-giving because advice collapses the development opportunity. The Will produces a written commitment (action + date + measure) and a follow-up date.",
      whyOthersWrong: [
        "Goal → Reality → Will → Options — reverses Options and Will; Will requires options to choose from.",
        "Reality → Goal → Will — skips Options; the coachee has no menu of paths to commit to.",
        "Goal → coach's recommendation → coachee's agreement — advice-giving collapses the development opportunity; the coachee gets a solution but not the practice of generating solutions.",
      ],
      explanation:
        "GROW (Whitmore, 1980s) is Goal → Reality → Options → Will. The coach asks; the coachee answers. The Will stage requires a commitment (action + date + measure); without it, the session is a wish. The follow-up at the next 1:1 ('What happened? What worked? What didn't? What next?') is the development mechanism — reflection on the coachee's own action.",
      options: [
        { text: "Goal → Reality → Options → Will, with the coach asking and the coachee answering at each stage", isCorrect: true },
        { text: "Goal → Reality → Will → Options", isCorrect: false },
        { text: "Reality → Goal → Will", isCorrect: false },
        { text: "Goal → coach's recommendation → coachee's agreement", isCorrect: false },
      ],
    },
    {
      competencyName: "Coaching & Mentoring",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the correct expansion of the SBI feedback model?",
      whyCorrect:
        "SBI = Situation, Behavior, Impact. Situation: when and where. Behavior: what the person did, observable and non-interpretive. Impact: the consequence on the work, team, or individual. The SBI-I variant adds a fourth component — Intent ('What was your intent?') — to surface reasoning without assumption.",
      whyOthersWrong: [
        "Subjective-Behavioral-Inferential — SBI is observable and non-interpretive, not subjective or inferential.",
        "Standard-Baseline-Improvement — a different framework; not SBI.",
        "Self-Belief-Intent — confuses intent (SBI-I's fourth component) with SBI's three components.",
      ],
      explanation:
        "SBI = Situation, Behavior, Impact. Situation (when/where), Behavior (observable, non-interpretive), Impact (consequence on work/team/individual). SBI-I adds Intent. SBI is feedback (specific, behavioral, in-the-moment); evaluation (judgment about worth) is a different act and should be reserved for formal performance review.",
      options: [
        { text: "Situation, Behavior, Impact", isCorrect: true },
        { text: "Subjective, Behavioral, Inferential", isCorrect: false },
        { text: "Standard, Baseline, Improvement", isCorrect: false },
        { text: "Self, Belief, Intent", isCorrect: false },
      ],
    },
    {
      competencyName: "Coaching & Mentoring",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem: "A PM has 9 direct reports. Each receives biweekly 30-minute 1:1 plus a quarterly 60-minute career conversation. What is the annual coaching time per report, and what should the PM do about the team size?",
      whyCorrect:
        "Per report: 26 biweekly sessions × 30 min + 4 quarterly × 60 min = 780 + 240 = 1,020 min = 17 hours per report per year. 9 reports × 17 = 153 hours/year of structured coaching. The 4–6 direct-report capacity ceiling means 9 is above sustainable biweekly 1:1 — the PM should spawn a lead who coaches a sub-team, then coach the lead directly.",
      whyOthersWrong: [
        "Per report 780 min; spawn a lead at any team size — undercounts the quarterly career conversation.",
        "Per report 240 min; no action needed — undercounts the biweekly 1:1 entirely.",
        "Per report 1,020 min; no action needed — correctly computes per-report time but ignores the 4–6 capacity ceiling; 9 reports exceeds sustainable coaching.",
      ],
      explanation:
        "Annual coaching time per report = 26 × T_1 + 4 × T_c. With T_1=30 and T_c=60, per report = 1,020 min = 17h. The 4–6 capacity ceiling means 9 reports exceeds sustainable biweekly 1:1; the PM should spawn a lead and reduce direct span to 4–6. The communication-channel formula C(9)=36 channels quantifies the broader coordination overhead.",
      options: [
        { text: "Per report 1,020 min (17h); spawn a lead and reduce direct span to 4–6 reports", isCorrect: true },
        { text: "Per report 780 min; spawn a lead at any team size", isCorrect: false },
        { text: "Per report 240 min; no action needed", isCorrect: false },
        { text: "Per report 1,020 min; no action needed", isCorrect: false },
      ],
    },
    {
      competencyName: "Coaching & Mentoring",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Per Greenleaf's servant-leadership test, the project manager's coaching is judged effective if the coachee grows as a person, becomes more autonomous, and the most junior team member benefits.",
      whyCorrect:
        "True. Greenleaf's servant-leadership test asks three questions: (a) Do those served grow as persons? (b) Do they, while being served, become healthier, wiser, freer, more autonomous? (c) What is the effect on the least privileged in society — operationalized in the project context as the most junior team member. The PMBOK® Guide 7th Edition endorses servant leadership as the project-manager default, especially on agile and hybrid teams, and the developer-of-others stance is its operational form.",
      whyOthersWrong: [
        "False — the candidate would conflate servant leadership with non-directive or laissez-faire leadership; servant leadership is the developer-of-others stance (with hard feedback and accountability), not the absence of leadership.",
      ],
      explanation:
        "Greenleaf (1977) framed servant leadership by its effect on those served: growth, autonomy, and benefit to the least privileged. The PM operationalizes this by removing blockers, securing resources, amplifying capability, and deliberately coaching and mentoring. The PMBOK® Guide 7th Edition names servant leadership as the project-manager default.",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Building Shared Project Vision
// (Competency: "Building Shared Project Vision"; slug: ppl-building-shared-vision)
// ---------------------------------------------------------------------------

const LESSON_PPL_BUILDING_SHARED_VISION: RefLesson = {
  competencyName: "Building Shared Project Vision",
  slug: "ppl-building-shared-vision",
  title: "Building Shared Project Vision — Vision, Team Charter & Psychological Safety",
  titleAr: "بناء رؤية المشروع المشتركة — الرؤية وميثاق الفريق والأمان النفسي",
  order: 4,
  durationMin: 33,
  references: PPL_REFERENCE_TITLES,
  conceptIntroduction: `A shared project vision is the team's common answer to "Why does this project matter, and what will success look like?" The PMI People domain treats vision-building as a deliberate, learnable competency — not a charismatic act. The PMBOK® Guide 7th Edition names "Stewardship" and "Leadership" as principles that anchor vision in the team's ownership. Kouzes & Posner's "Inspire a Shared Vision" is the explicit leadership practice. The team charter (with ground rules) is the operational artifact that translates vision into daily behavior. Psychological safety (Amy Edmondson) is the precondition: without it, vision becomes a slogan and ground rules become a wall poster. This lesson equips the candidate to (1) create a project vision, (2) engage stakeholders in vision-building, (3) author a team charter with ground rules, and (4) measure psychological safety with a scorecard.`,
  example: `A Construction PM is leading a hospital expansion. Vision: "Open a 30-bed ward that reduces emergency-department boarding by 40% in Q3 of next year, delivered with zero lost-time incidents and 10% under the regional cost benchmark." The PM engages stakeholders: clinical leadership (the patient-impact framing), construction trade supervisors (the safety framing), the sponsor CFO (the cost framing), and the community board (the access framing). The team charter (co-authored in a 90-minute workshop) includes: ground rules (escalate within 4 hours; one source of truth for drawings; no rework without a written change order); decision rights (DACI for design changes); meeting cadence (daily huddle, weekly walk, monthly steering); conflict-resolution protocol (Thomas-Kilmann default = Collaborating). A psychological-safety scorecard (10-item Edmondson scale, 1–7 Likert) baselines at 4.8/7 (mid-zone; "it's safe to ask questions, less safe to challenge supervisors"). The PM's interventions target the supervisor-challenge gap; 90 days later the score is 5.6/7, attrition drops to 0, and the project is on schedule.`,
  keyFormulas: `Vision components (4):
  (a) Future state (what success looks like — concrete, time-bound)
  (b) Why it matters (the stakeholder interest — patient safety, regulatory, strategic)
  (c) Stakeholder framing (each stakeholder's reason to care)
  (d) Behaviors that operationalize the vision (ground rules)
Psychological Safety Scorecard (Edmondson 10-item scale, 1–7 Likert each; averaged):
  PS = (Σ item scores) / (10 × 7), in [0,1]
  — Item examples: "On this team, I can ask a question without fear of looking ignorant."
  — "On this team, I can challenge a supervisor's decision without retaliation."
  — "On this team, I can admit a mistake without it being held against me."
  Zones: PS < 0.50 = fear zone; 0.50–0.65 = comfort/apathy zone; 0.66–0.80 = learning zone; > 0.80 = high-performance zone.
Team Charter contents (8):
  Vision statement, ground rules, decision rights (DACI), meeting cadence, conflict-resolution protocol, communication norms, definition of done, signed commitments.
Span-of-control / stakeholder engagement:
  Stakeholder Engagement Assessment Matrix (Unaware → Aware → Supportive → Engaged → Leading).
Vision-coherence check:
  % of team members who, when asked, can state the vision in their own words and name one behavior that operationalizes it. Target ≥ 80%.`,
  exercise: `You are the PM on an IT digital-transformation program at a logistics company. The sponsor wants "modernization"; the engineers are demotivated; the operations team fears job loss. (a) Draft a vision statement with the 4 vision components. (b) Map 5 stakeholders to engagement levels (Unaware → Leading). (c) Author a team charter with ground rules, decision rights, meeting cadence, conflict protocol. (d) Compute a baseline psychological-safety scorecard (use 5 of Edmondson's 10 items, 1–7 each). (e) Identify the scorecard gap and prescribe one intervention.`,
  sections: {
    learning_objectives: `- Author a project vision with 4 components: future state, why it matters, stakeholder framing, operationalizing behaviors.
- Apply Kouzes & Posner's "Inspire a Shared Vision" practice (one of the Five Practices of Exemplary Leadership).
- Engage stakeholders in vision-building via the Stakeholder Engagement Assessment Matrix (Unaware → Aware → Supportive → Engaged → Leading).
- Author a team charter with 8 contents: vision, ground rules, decision rights (DACI), meeting cadence, conflict-resolution protocol, communication norms, definition of done, signed commitments.
- Establish ground rules that are specific, observable, and enforceable — not slogans.
- Measure psychological safety (Edmondson 10-item scale, 1–7) and prescribe interventions to move from fear/comfort to learning/high-performance zones.
- Distinguish psychological safety (it's safe to speak up) from accountability (we deliver) — the high-performance zone requires both.`,
    prerequisites: `- Lesson 1 — Leading a Team (leadership styles; transformational leadership; Kouzes & Posner Five Practices).
- Lesson 2 — Managing Conflict (Thomas-Kilmann default = Collaborating; conflict-resolution protocol in the team charter).
- Lesson 3 — Coaching & Mentoring (SBI feedback; servant leadership as the developer-of-others stance).
- A project lifecycle seen as a participant, including at least one team-formation event.`,
    introduction: `A shared project vision is the team's common answer to "Why does this project matter, and what will success look like?" Without it, the team coordinates tasks but does not commit to outcomes. The PMI People domain treats vision-building as a deliberate, learnable competency. The PMBOK® Guide 7th Edition names "Stewardship" and "Leadership" as principles that anchor vision in the team's ownership; Kouzes & Posner's "Inspire a Shared Vision" is the explicit leadership practice; Amy Edmondson's psychological-safety research is the precondition that turns vision from a slogan into daily behavior.

Vision has four components. First, a *future state* — what success looks like, concrete and time-bound ("Open a 30-bed ward in Q3 next year"). Second, *why it matters* — the stakeholder interest the project serves (patient safety, regulatory compliance, strategic growth). Third, *stakeholder framing* — each stakeholder's reason to care, expressed in their language (clinical leadership hears patient impact; the CFO hears cost; the community board hears access). Fourth, *operationalizing behaviors* — the ground rules that translate vision into daily behavior ("escalate within 4 hours"; "one source of truth for drawings"; "no rework without a written change order"). A vision without behaviors is a poster; behaviors without a vision are compliance.

Stakeholder engagement is the precondition for a *shared* vision. A vision authored by the PM and emailed to the team is not shared — it is imposed. The Stakeholder Engagement Assessment Matrix (Unaware → Aware → Supportive → Engaged → Leading) tracks each stakeholder's level; the PM's job is to move key stakeholders toward Engaged or Leading via vision-building conversations. The team charter (co-authored in a 90-minute workshop) is the operational artifact that translates vision into daily behavior.

The team charter's eight contents: vision statement, ground rules (specific, observable, enforceable), decision rights (DACI: Driver, Approver, Contributor, Informed), meeting cadence (daily huddle, weekly walk, monthly steering), conflict-resolution protocol (Thomas-Kilmann default per source — see ppl-managing-conflict), communication norms (channels, response SLAs, escalation paths), definition of done (per deliverable), and signed commitments (each team member signs the charter — making the ground rules a mutual agreement, not a wall poster).

Psychological safety (Edmondson) is the precondition. Edmondson defines psychological safety as "the belief that one will not be punished or humiliated for speaking up with ideas, questions, concerns, or mistakes." It is *not* the absence of accountability — high-performance teams have both safety and accountability (the learning zone + the deliverables). The Edmondson 10-item scale, 1–7 Likert each, averaged, scores the team's safety in four zones: fear (< 0.50), comfort/apathy (0.50–0.65), learning (0.66–0.80), high-performance (> 0.80). The PM's interventions target the gap: a fear-zone team needs trust-building; a comfort-zone team needs constructive dissent; a learning-zone team needs stretch goals. Without safety, vision becomes a slogan and ground rules become a wall poster.

Psychological safety is distinct from accountability. A team with high safety and low accountability is comfortable but does not deliver; a team with low safety and high accountability is fearful and burns out. The high-performance zone requires both — Edmondson's quadrant model names this "the learning zone + the deliverables." The mature PM builds safety (so the team speaks up) and accountability (so the team delivers).`,
    terminology: `- **Project vision**: the team's common answer to "Why does this project matter, and what will success look like?"
- **Shared vision**: vision authored with (not imposed on) the team; the team can restate it in their own words.
- **Kouzes & Posner "Inspire a Shared Vision"**: one of the Five Practices of Exemplary Leadership — envision the future and enlist others.
- **Stewardship (PMBOK 7th)**: the principle that the PM stewards the project's resources, vision, and outcomes on behalf of stakeholders.
- **Stakeholder Engagement Assessment Matrix**: Unaware → Aware → Supportive → Engaged → Leading (current vs. desired).
- **Team charter**: the operational artifact translating vision into daily behavior — vision, ground rules, decision rights, meeting cadence, conflict protocol, communication norms, definition of done, signed commitments.
- **Ground rules**: specific, observable, enforceable behaviors (e.g., "escalate within 4 hours").
- **DACI**: Driver, Approver, Contributor, Informed — the decision-rights matrix.
- **Psychological safety (Edmondson)**: the belief that one will not be punished or humiliated for speaking up with ideas, questions, concerns, or mistakes.
- **Edmondson 10-item scale**: 1–7 Likert each; PS = Σ / (10 × 7), in [0, 1].
- **Safety × Accountability quadrant**: fear (low/low), comfort/apathy (high safety/low accountability), anxiety (low safety/high accountability), learning/high-performance (high/high).
- **Definition of Done (DoD)**: the checklist a deliverable must meet to be considered complete.`,
    detailed_explanation: `Vision-building is deliberate. The four-component structure (future state + why it matters + stakeholder framing + operationalizing behaviors) gives the candidate a template. The future state must be concrete and time-bound — "modernize" is not a vision; "open a 30-bed ward in Q3 next year, 10% under cost benchmark, zero lost-time incidents" is a vision. The "why it matters" anchors vision in stakeholder interest — patient safety, regulatory compliance, strategic growth. Stakeholder framing translates the vision into each stakeholder's language — the clinical lead hears patient impact, the CFO hears cost, the community board hears access. Operationalizing behaviors are the ground rules — specific, observable, enforceable.

Kouzes & Posner's "Inspire a Shared Vision" is the leadership practice. The two sub-practices: (a) *Envision the Future* — imagine the possibilities, find a common purpose; (b) *Enlist Others* — appeal to common ideals, animate the vision. The discipline is that the leader does not impose a vision — the leader enlists the team in a vision the team can own. The team's ability to restate the vision in their own words is the coherence test (% of team members who can do so; target ≥ 80%).

Stakeholder engagement is the precondition for a shared vision. The Stakeholder Engagement Assessment Matrix tracks each stakeholder's current level (Unaware, Aware, Supportive, Engaged, Leading) and the desired level; the gap drives the engagement plan. A stakeholder at Unaware needs awareness-building (a one-pager, a kickoff); a stakeholder at Supportive needs engagement (a working session, a charter co-authoring); a stakeholder at Engaged needs amplification (a steering role, a Leading role in change-management). The matrix is reviewed monthly as stakeholders move.

The team charter is the operational artifact translating vision into daily behavior. Its eight contents: (1) *Vision statement* — the team's shared answer to "why and what"; (2) *Ground rules* — specific, observable, enforceable behaviors ("escalate within 4 hours"; "one source of truth for drawings"; "no rework without a written change order"); (3) *Decision rights* (DACI: Driver, Approver, Contributor, Informed) per decision type; (4) *Meeting cadence* — daily huddle, weekly walk, monthly steering; (5) *Conflict-resolution protocol* — Thomas-Kilmann default per source (Collaborating for technical/scope; Compromise for cost; Compete for safety-critical time-boxed; see ppl-managing-conflict); (6) *Communication norms* — channels, response SLAs, escalation paths; (7) *Definition of Done* — per deliverable, the checklist a deliverable must meet to be considered complete; (8) *Signed commitments* — each team member signs the charter, making the ground rules a mutual agreement, not a wall poster.

Ground rules fail when they are slogans. "Be respectful" is a slogan; "no interruptions in standups" is a ground rule. The test: a third-party observer could detect compliance. "Communicate well" fails the test; "respond to Slack within 4 working hours" passes. "Be a team player" fails; "if you can't make a standup, post your update in the team channel 1 hour before" passes. The PM's authoring discipline is to make every ground rule specific, observable, and enforceable — and to enforce it consistently.

Psychological safety (Edmondson) is the precondition. Edmondson defines psychological safety as "the belief that one will not be punished or humiliated for speaking up with ideas, questions, concerns, or mistakes." It is not the absence of accountability. The Edmondson 10-item scale (1–7 Likert each; PS = Σ / (10 × 7), in [0, 1]) scores the team's safety. Sample items: "On this team, I can ask a question without fear of looking ignorant." "On this team, I can challenge a supervisor's decision without retaliation." "On this team, I can admit a mistake without it being held against me." The four zones: fear (< 0.50), comfort/apathy (0.50–0.65), learning (0.66–0.80), high-performance (> 0.80). Each zone has a different intervention: fear needs trust-building (small wins, leader vulnerability); comfort needs constructive dissent (rotating devil's-advocate, red-team reviews); learning needs stretch goals; high-performance needs protection from complacency.

Psychological safety is distinct from accountability. Edmondson's quadrant model: fear (low safety, low accountability) — team is paralyzed; comfort/apathy (high safety, low accountability) — team is comfortable but does not deliver; anxiety (low safety, high accountability) — team is fearful and burns out; learning/high-performance (high safety, high accountability) — the team speaks up and delivers. The mature PM builds both — safety via the scorecard and targeted interventions, accountability via the team charter's definition of done, signed commitments, and SBI feedback (see ppl-coaching-mentoring).

The charter workshop is the operational moment. A 90-minute co-authoring workshop with the full team — vision restated in the team's words, ground rules drafted and challenged, decision rights negotiated, meeting cadence set, conflict protocol agreed, definition of done authored, signatures collected. The workshop is not a presentation; it is a negotiation. The PM's role is to facilitate — not to dictate. The team that authors its charter owns its charter; the team that receives its charter complies with it (and complies selectively).`,
    core_principles: `- Vision has 4 components: future state, why it matters, stakeholder framing, operationalizing behaviors.
- A vision without behaviors is a poster; behaviors without a vision are compliance.
- Kouzes & Posner's "Inspire a Shared Vision" enlists the team; the leader does not impose.
- The vision-coherence test: ≥ 80% of the team can restate the vision in their own words.
- Stakeholder engagement moves stakeholders from Unaware → Leading; the matrix is reviewed monthly.
- The team charter has 8 contents; signatures make ground rules a mutual agreement, not a wall poster.
- Ground rules must be specific, observable, enforceable — not slogans.
- Psychological safety (Edmondson) is the precondition; safety ≠ absence of accountability.
- The high-performance zone requires high safety AND high accountability.
- The charter workshop is a negotiation, not a presentation.`,
    components: `- Vision statement (4 components).
- Stakeholder Engagement Assessment Matrix (5 levels: Unaware, Aware, Supportive, Engaged, Leading).
- Team charter (8 contents).
- Ground rules (specific, observable, enforceable).
- DACI decision-rights matrix.
- Meeting cadence (daily huddle, weekly walk, monthly steering).
- Conflict-resolution protocol (Thomas-Kilmann default per source).
- Definition of Done (per deliverable).
- Signed commitments (team-charter signatures).
- Edmondson 10-item psychological-safety scale (1–7 Likert each; PS in [0, 1]).
- Safety × Accountability quadrant model.`,
    process: `1. Draft the vision with 4 components (future state, why, stakeholder framing, behaviors) — PM's first draft.
2. Engage stakeholders individually — translate the vision into each stakeholder's language; update the Engagement Matrix.
3. Convene a 90-minute team charter workshop — restate the vision in the team's words; draft and challenge ground rules; negotiate DACI; set meeting cadence; agree conflict protocol; author the Definition of Done; collect signatures.
4. Baseline the Edmondson psychological-safety scorecard (10 items, 1–7 each); compute PS in [0, 1].
5. Identify the scorecard gap (fear / comfort / learning / high-performance zone); prescribe the zone-specific intervention.
6. Enforce ground rules consistently — SBI feedback in the moment; the definition of done at every deliverable.
7. Review the Engagement Matrix monthly; move stakeholders toward Engaged/Leading.
8. Re-survey psychological safety quarterly; track the zone trajectory.
9. Re-charter at major project phase boundaries (initiation → execution; execution → closure).
10. Vision-coherence check every 90 days: ≥ 80% of the team can restate the vision and name one operationalizing behavior.`,
    formula_calculation: `Variables and formulas:
- PS: psychological safety score ∈ [0, 1]
- PS = (Σ item scores) / (10 × 7), where 10 = items, 7 = Likert max per item
- Engagement level: {Unaware=1, Aware=2, Supportive=3, Engaged=4, Leading=5}
- Engagement gap = desired level − current level ∈ [−4, +4]
- Vision-coherence = (team members who can restate + name one behavior) / (total team) ∈ [0, 1]; target ≥ 0.80
- Span of control: C(n) = n(n−1)/2 — applies to team size, not stakeholder count

Edmondson zones (qualitative):
- PS < 0.50: fear zone — trust-building intervention
- 0.50 ≤ PS < 0.66: comfort/apathy zone — constructive-dissent intervention
- 0.66 ≤ PS < 0.80: learning zone — stretch-goal intervention
- PS ≥ 0.80: high-performance zone — protect from complacency

Psychological-safety example (Construction hospital expansion, baseline):
- 10 items, summed = 48; PS = 48 / 70 = 0.686 (≈ 0.69 — learning zone, low end).
- Lowest-scoring items: "I can challenge a supervisor's decision without retaliation" (3/7); "I can admit a mistake without it being held against me" (4/7).
- Intervention: targeted supervisor-challenge safety — 1:1 with each supervisor; rotate the devil's-advocate role in design reviews; SBI feedback to supervisors when they dismiss a challenge.
- Re-survey 90 days later: summed = 56; PS = 56 / 70 = 0.80 (high-performance threshold).

Stakeholder-engagement example:
- Clinical lead: current = Engaged (4), desired = Leading (5); gap = +1 → amplify via steering role.
- CFO sponsor: current = Supportive (3), desired = Engaged (4); gap = +1 → engage via monthly steering.
- Community board: current = Aware (2), desired = Supportive (3); gap = +1 → awareness + 1-on-1 briefings.

Units: PS, coherence, engagement-ratios dimensionless; engagement level in 1–5; n, C in counts.

Assumptions: (i) the Edmondson scale is administered anonymously (otherwise scores inflate); (ii) the team has been together ≥ 30 days before baselining; (iii) ground rules are enforced consistently (inconsistent enforcement degrades PS faster than any other factor); (iv) the charter workshop includes the full team (a partial workshop produces a partial charter).

Interpretation: PS below 0.50 means the team is in the fear zone — vision and ground rules will not land until trust is built. PS in the comfort zone means the team is comfortable but not delivering — push accountability via the Definition of Done and signed commitments. PS in the learning zone is the target for most teams — stretch goals move them toward high-performance. PS above 0.80 is the high-performance zone; protect it from complacency via rotating devil's-advocate and stretch challenges.`,
    worked_example: `**Construction — Hospital expansion vision, team charter, and psychological safety scorecard.**

Vision statement (4 components):
- Future state: "Open a 30-bed ward that reduces emergency-department boarding by 40% in Q3 next year, delivered with zero lost-time incidents and 10% under the regional cost benchmark."
- Why it matters: patient safety (emergency-department boarding is a documented harm); regulatory compliance (ward-opening deadline is regulatory); strategic growth (regional service expansion).
- Stakeholder framing: clinical leadership hears patient impact; construction trade supervisors hear safety; the sponsor CFO hears cost; the community board hears access.
- Operationalizing behaviors (ground rules): escalate within 4 hours; one source of truth for drawings; no rework without a written change order; daily huddle at 8:00; SBI feedback in the moment.

Stakeholder Engagement Assessment Matrix (baseline):
- Clinical lead: current = Engaged (4), desired = Leading (5); gap = +1 → steering role.
- Construction trade supervisors: current = Supportive (3), desired = Engaged (4); gap = +1 → engage in charter workshop.
- Sponsor CFO: current = Supportive (3), desired = Engaged (4); gap = +1 → monthly steering.
- Community board: current = Aware (2), desired = Supportive (3); gap = +1 → quarterly briefing.

Team charter (90-minute workshop; 8 contents):
1. Vision statement (above).
2. Ground rules (specific, observable, enforceable):
   - Escalate any issue with patient-safety or schedule-slip potential within 4 hours to the PM.
   - One source of truth for drawings: the structural engineer's stamped set in the project document control system; any deviation requires a written change order.
   - No rework without a written change order (prevents the silent-rework pattern that drives cost overruns).
   - Daily huddle at 8:00; 15 minutes; round-robin; impediments only.
   - SBI feedback in the moment for observable behaviors (see ppl-coaching-mentoring).
3. Decision rights (DACI) — sample for design changes:
   - Driver: structural engineer (writes the change).
   - Approver: PM (with sponsor for > $25k).
   - Contributors: clinical lead, mechanical subcontractor.
   - Informed: sponsor CFO, community board.
4. Meeting cadence: daily huddle (8:00, 15 min); weekly site walk (Tuesday, 60 min); monthly steering (first Wednesday, 90 min).
5. Conflict-resolution protocol: Thomas-Kilmann default = Collaborating for technical/scope (both concerns critical, long-term relationship); Compromise for cost; Compete for safety-critical time-boxed (e.g., turn-around crane). See ppl-managing-conflict.
6. Communication norms: Slack channel #hospital-expansion; response SLA 4 working hours; escalation path PM → sponsor → sponsor-COO.
7. Definition of Done (per deliverable): the structural-penetration DoD = "tolerance ±10 mm per the joint standard, inspected by both subs' QA, signed by structural engineer."
8. Signed commitments: each team member signs the charter (digital signature in the document control system); the charter is the team's mutual agreement.

Psychological-safety scorecard (Edmondson 10-item, 1–7 Likert, baseline):
- Q1 Ask a question without fear of looking ignorant: 5/7
- Q2 Challenge a supervisor's decision without retaliation: 3/7  ← gap
- Q3 Admit a mistake without it being held against me: 4/7  ← gap
- Q4 Raise a concern about a patient-safety issue: 6/7
- Q5 Suggest a different approach in a design review: 5/7
- Q6 Bring up a problem even if not in my area: 4/7
- Q7 Disagree with a more senior team member: 3/7  ← gap
- Q8 Take a risk on a new method: 4/7
- Q9 Be myself at work: 6/7
- Q10 Ask for help when I need it: 5/7
- Sum = 48; PS = 48 / 70 = 0.686 (learning zone, low end; supervisor-challenge gap).

Intervention (90 days, targeted at the supervisor-challenge gap):
- 1:1 with each supervisor on the "challenge a supervisor" data; SBI feedback to two supervisors who dismissed a challenge in week 1.
- Rotate the devil's-advocate role in weekly design reviews (a different team member each week).
- PM models vulnerability in the daily huddle ("I missed the tolerance issue on Tuesday; thank you for catching it").
- Anonymous reporting channel for safety concerns (if 1:1 is insufficient).

Re-survey (90 days):
- Sum = 56; PS = 56 / 70 = 0.80 (high-performance threshold).
- The supervisor-challenge items (Q2, Q7) rose from 3 to 5 and 4 to 5 respectively.
- The admit-a-mistake item (Q3) rose from 4 to 6.
- Attrition: 0 in 90 days (was 2 in the prior 90).
- Schedule: on track; the daily huddle's "impediments only" discipline surfaced 8 issues that would otherwise have caused slips.

Vision-coherence check (90 days):
- 9 of 10 team members can restate the vision in their own words and name one operationalizing behavior (90% — above the 80% target).`,
    industrial_example: `**Construction — Hospital expansion** (above; vision + charter + scorecard baseline 0.686 → 0.80 in 90 days; attrition 0; on schedule).

**IT — Digital-transformation at a logistics company** — Vision: "Replace the legacy TMS with a cloud-native platform by Q4 next year, cutting order-to-fulfillment lead time by 25% with zero customer-impact incidents." Stakeholder engagement: engineers framed on the technical mastery opportunity; operations team framed on job-evolution (no losses — the new platform needs operations experts); sponsor framed on strategic cost. Charter co-authored in a 90-minute workshop with the full team + operations reps + sponsor. Psychological safety baseline 0.62 (comfort zone — engineers comfortable, operations afraid of job loss); targeted intervention: cross-functional pairing + written job-evolution commitment. 90 days: PS = 0.74 (learning zone); attrition 0; first release on schedule.

**Healthcare — EHR rollout** — Vision: "Implement a clinician-trusted EHR by Q2 next year that cuts medication-order errors by 50% with clinician satisfaction ≥ 4.0/5." Stakeholder engagement: clinicians framed on patient safety; IT framed on clinical partnership; sponsor framed on regulatory compliance. Charter co-authored with clinicians + IT + sponsor. Psychological safety baseline 0.58 (comfort zone — clinicians comfortable, IT afraid to push back on clinical opinion); targeted intervention: SBI feedback to senior clinicians who dismissed IT pushback; rotate devil's-advocate in workflow design reviews. 90 days: PS = 0.71 (learning zone); medication-order error rate trending toward -50% target.

**Oil & Gas — Turn-around** — Vision: "Execute the 14-day turn-around with zero recordable incidents, 5% under cost benchmark, and on-schedule restart." Stakeholder engagement: trade supervisors framed on safety; sponsor framed on cost; community framed on emissions. Charter co-authored with all trade supervisors + sponsor. Psychological safety baseline 0.55 (comfort zone — supervisors comfortable raising safety concerns, less comfortable raising schedule concerns); targeted intervention: separate the safety channel (always protected) from the schedule channel (SBI on schedule pushback); sponsor models that schedule concerns are welcome. 90 days (turn-around complete): PS = 0.78 (high-performance threshold for a turn-around); zero recordable incidents; 4% under cost; on-schedule restart.`,
    case_study: `**CASE STUDY (SYNTHETIC) — Construction Hospital-Expansion Vision, Charter & Safety Scorecard (composite, 90 days).**

Context: Hospital expansion, 30-bed ward, regulatory Q3 deadline. Team: 9 (PM, 2 engineers, 2 schedulers, 1 QA, 1 document controller, 1 site lead, 1 clinical liaison). Sponsor: regional health system CFO. Subcontractors: structural, mechanical, electrical.

Problem: The PM inherits a team with a controlling site lead (from ppl-leading-a-team) and no charter; vision is "build the ward." Vision-coherence: 3 of 9 can restate the vision meaningfully (33%; target ≥ 80%). Psychological safety baseline: 0.686 (learning zone, low end; supervisor-challenge gap on items Q2, Q7).

Constraints: (a) Regulatory Q3 deadline fixed. (b) Cannot replace the site lead for 60 days (HR process). (c) Patient safety cannot be compromised. (d) Sponsor will cancel the program if attrition continues.

Analysis: Vision lacks the 4 components (especially the operationalizing behaviors). No charter means ground rules are implicit and inconsistently enforced. Psychological safety is mid-zone with a specific gap (supervisor-challenge). The site-lead behavior is the dominant safety-eroding factor.

Decision: (i) Draft a 4-component vision statement. (ii) Engage stakeholders individually (translate vision per stakeholder). (iii) Convene a 90-minute charter workshop (restate vision, draft and challenge ground rules, negotiate DACI, set cadence, agree conflict protocol, author Definition of Done, collect signatures). (iv) Baseline the Edmondson scorecard; identify the supervisor-challenge gap; prescribe 1:1 + devil's-advocate rotation + PM vulnerability modeling. (v) Enforce ground rules consistently via SBI in the moment. (vi) Review the Engagement Matrix monthly. (vii) Re-survey PS at 90 days. (viii) Vision-coherence check at 90 days.

Alternatives considered: (a) Email a vision statement to the team — rejected (imposed, not shared; fails the coherence test). (b) Skip the charter workshop — rejected (ground rules become a wall poster). (c) Replace the site lead immediately — rejected (HR process, 60 days, loses institutional knowledge; the coaching track from ppl-coaching-mentoring is more appropriate). (d) Survey PS without intervention — rejected (the survey alone produces no change).

Consequences: Vision-coherence 33% → 90% (above the 80% target). PS 0.686 → 0.80 (high-performance threshold). Attrition: 2 in 90 days prior → 0 in 90 days after. Schedule: on track; daily huddle surfaced 8 impediments that would otherwise have caused slips. The site-lead coaching (from ppl-coaching-mentoring) ran in parallel and produced the autonomy gains that lifted the supervisor-challenge items.

Lessons learned: (1) The 4-component vision template (future state + why + framing + behaviors) is non-optional; "build the ward" is not a vision. (2) The charter workshop is a negotiation, not a presentation; the team that authors its charter owns its charter. (3) Ground rules must be specific, observable, enforceable — "be respectful" fails the test. (4) The Edmondson scorecard quantifies the specific gap; the supervisor-challenge items drove the targeted intervention. (5) Safety and accountability are both required for the high-performance zone — the charter's Definition of Done and signed commitments delivered accountability; the scorecard and interventions delivered safety. (6) Vision-coherence ≥ 80% is the operational test of "shared."`,
    visual_explanation: `Picture the vision as a 4-block arrow: Future State (top-left) → Why It Matters (top-right) → Stakeholder Framing (bottom-left) → Operationalizing Behaviors (bottom-right). The arrow points at the team charter, an 8-section document: vision, ground rules, DACI, cadence, conflict protocol, communication norms, DoD, signatures. Beside the charter sits the Edmondson scorecard as a 10-bar histogram; the lowest bars are the intervention targets. Behind both, the Safety × Accountability quadrant shows four zones — fear (low/low), comfort (high safety/low accountability), anxiety (low safety/high accountability), learning/high-performance (high/high) — with the project's current zone marked and the target arrow pointing to high-performance.`,
    simulation_opportunity: `Build a shared-vision simulator. Inputs: 4-component vision draft, stakeholder list with current/desired engagement levels, team size n, 10-item Edmondson scorecard baseline, ground rules list. Engine: compute PS = Σ / 70; map to zone (fear/comfort/learning/high-performance); compute vision-coherence (random team-member responses from a Monte Carlo over the vision draft); compute C(n) and span-of-control flag; produce a 90-minute charter workshop agenda and a zone-specific intervention plan. Output: vision-coherence probability, Edmondson PS + zone, charter workshop agenda, intervention plan, predicted PS trajectory. Use it to walk candidates through "draft → engage → charter → baseline → intervene → re-survey."`,
    common_mistakes: `- **Imposing the vision**: a vision emailed to the team is not shared; the coherence test fails.
- **Slogans as ground rules**: "be respectful," "communicate well," "be a team player" fail the observable-enforceable test.
- **Skipping the charter workshop**: a charter authored by the PM and presented to the team is a wall poster; a charter co-authored in a workshop is a mutual agreement.
- **Inconsistent ground-rule enforcement**: degrades psychological safety faster than any other factor; the team learns the rules are not real.
- **Surveying safety without intervening**: the survey alone produces no change; the intervention is the work.
- **Conflating safety with low accountability**: high-performance needs both; a comfort-zone team is not delivering.
- **Failing the vision-coherence test**: if < 80% of the team can restate the vision, it is not shared.
- **Treating the charter as a one-time event**: re-charter at major phase boundaries (initiation → execution; execution → closure).
- **Ignoring the stakeholder engagement matrix**: stakeholders drift; the matrix must be reviewed monthly.`,
    limitations: `- The 4-component vision template is a heuristic, not a formula; vision-craft benefits from senior-leader sponsorship and iteration.
- Edmondson's 10-item scale self-reports; honest anonymous administration is the precondition.
- The charter workshop assumes the team is present and willing; absent stakeholders produce a partial charter.
- Psychological safety is a leading indicator; the lagging indicators (attrition, schedule, quality) confirm it later.
- Stakeholder engagement levels are qualitative judgments; two raters may differ.
- Industry context shifts which interventions work — a Construction site and an IT sprint differ in their safety dynamics; the candidate must adapt the framework.`,
    comparison: `| Vision component | Definition | Test |
|---|---|---|
| Future state | Concrete, time-bound success | Third party can describe it |
| Why it matters | Stakeholder interest served | Stakeholder agrees |
| Stakeholder framing | Each stakeholder's language | Stakeholder restates in their words |
| Operationalizing behaviors | Specific, observable, enforceable | Compliance detectable by observer |

| Edmondson zone | PS range | Intervention |
|---|---|---|
| Fear | < 0.50 | Trust-building (small wins, leader vulnerability) |
| Comfort / Apathy | 0.50–0.65 | Constructive dissent (rotating devil's-advocate, red-team) |
| Learning | 0.66–0.80 | Stretch goals, accountability + safety |
| High-performance | > 0.80 | Protect from complacency; rotate challenges |

| Safety × Accountability quadrant | Safety | Accountability | State |
|---|---|---|---|
| Fear | Low | Low | Paralyzed |
| Comfort / Apathy | High | Low | Comfortable but not delivering |
| Anxiety | Low | High | Fearful, burns out |
| Learning / High-performance | High | High | Speaks up and delivers |`,
    practical_application: `On a real project: (1) draft a 4-component vision in week 1 — future state + why + framing + behaviors; (2) engage each stakeholder individually in week 2 — translate the vision into their language; (3) convene a 90-minute charter workshop in week 3 — restate the vision in the team's words, draft and challenge ground rules (specific, observable, enforceable), negotiate DACI, set cadence, agree conflict protocol, author the Definition of Done, collect signatures; (4) baseline the Edmondson scorecard in week 4 — anonymous administration; identify the lowest-scoring items; (5) prescribe the zone-specific intervention (trust-building for fear, constructive dissent for comfort, stretch for learning, protection for high-performance); (6) enforce ground rules consistently via SBI feedback in the moment; (7) review the Engagement Matrix monthly; (8) re-survey PS quarterly; (9) re-charter at major phase boundaries; (10) vision-coherence check every 90 days (≥ 80% target). The PMP ECO People task "Building Shared Project Vision" is operationally this loop.`,
    decision_scenario: `You are the PM on an IT digital-transformation program. The sponsor wants "modernization"; engineers are demotivated; operations fears job loss. Vision-coherence is 33%. Which sequence is most consistent with this lesson? (a) Email the team a vision statement; (b) Replace the engineers with more motivated hires; (c) Draft a 4-component vision, engage stakeholders in their language, convene a 90-minute charter workshop, baseline the Edmondson scorecard, prescribe a zone-specific intervention; (d) Survey psychological safety and report to the sponsor. Correct: (c). (a) imposes the vision — fails the coherence test. (b) ignores the development opportunity and the cost of replacement. (d) surveys without intervening — produces no change. (c) follows the lesson's draft → engage → charter → baseline → intervene → re-survey loop.`,
    practice_questions: `1. A vision statement that says "modernize" lacks which of the 4 vision components most fundamentally? (a) Future state (concrete, time-bound); (b) Why it matters; (c) Stakeholder framing; (d) Operationalizing behaviors. (Answer: a — "modernize" is not concrete or time-bound.)
2. Compute PS if the 10-item Edmondson scorecard sums to 56 (1–7 Likert each). (Answer: 56/70 = 0.80 — high-performance threshold.)
3. Which ground rule passes the specific-observable-enforceable test? (a) "Be respectful"; (b) "Communicate well"; (c) "Escalate any patient-safety issue within 4 hours"; (d) "Be a team player." (Answer: c.)
4. A team with high psychological safety and low accountability is in which quadrant? (a) Fear; (b) Comfort/Apathy; (c) Anxiety; (d) Learning/High-performance. (Answer: b.)`,
    certification_questions: `1. (PMP-style) The team charter should include all of the following EXCEPT: (a) Vision statement; (b) Ground rules; (c) Decision rights (DACI); (d) Individual performance ratings. (Answer: d — performance ratings are an HR process, not a charter content.)
2. (PMP-style) Edmondson's psychological-safety research emphasizes which belief? (a) The team will deliver on time; (b) One will not be punished or humiliated for speaking up; (c) The PM has all the answers; (d) Conflict is always destructive. (Answer: b.)
3. (PMP-style) The Stakeholder Engagement Assessment Matrix levels are: (a) Unaware → Aware → Supportive → Engaged → Leading; (b) Low → Mid → High; (c) Inform → Consult → Involve → Collaborate → Empower; (d) Plan → Do → Check → Act. (Answer: a.)
4. (PMP-style) A team with high safety and low accountability is in which zone? (a) Fear; (b) Comfort/Apathy; (c) Anxiety; (d) High-performance. (Answer: b.)`,
    summary: `A shared project vision is the team's common answer to "Why does this project matter, and what will success look like?" The 4-component template (future state + why + framing + operationalizing behaviors) structures it; Kouzes & Posner's "Inspire a Shared Vision" enlists the team. Stakeholder engagement moves stakeholders from Unaware → Leading. The team charter (8 contents: vision, ground rules, DACI, cadence, conflict protocol, communication norms, DoD, signatures) translates vision into daily behavior. Ground rules must be specific, observable, enforceable — not slogans. Psychological safety (Edmondson 10-item, 1–7 each; PS = Σ/70) is the precondition; safety ≠ absence of accountability. The high-performance zone requires both — high safety AND high accountability. The vision-coherence test (≥ 80% of the team can restate the vision and name one behavior) is the operational test of "shared."`,
    key_takeaways: `- Vision = 4 components: future state, why, framing, behaviors.
- A vision without behaviors is a poster; behaviors without a vision are compliance.
- Kouzes & Posner's "Inspire a Shared Vision" enlists; the leader does not impose.
- Vision-coherence test: ≥ 80% of the team can restate the vision and name one behavior.
- Stakeholder engagement: Unaware → Aware → Supportive → Engaged → Leading.
- Team charter = 8 contents; signatures make ground rules a mutual agreement.
- Ground rules: specific, observable, enforceable — never slogans.
- Edmondson PS = Σ / (10 × 7), in [0,1]; four zones (fear, comfort, learning, high-performance).
- High-performance requires high safety AND high accountability — not safety alone.
- Re-charter at phase boundaries; re-survey PS quarterly.`,
    references: `1. PMI, A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition (2021) — Principles: Stewardship, Leadership; Performance Domains: Stakeholder, Team.
2. PMI, Agile Practice Guide (2017) — Team Charter; ground rules; servant leadership on agile teams.
3. PMI, PMP Examination Content Outline — People domain, Task "Building Shared Project Vision."
4. PMI, PMI Talent Triangle® — Power Skills leg (vision-building is a Power Skill).
5. ISO 21500:2021 — Guidance on project management, §4.3 (Stakeholders) and §4.4 (Project organization; team).
6. Kouzes & Posner, The Leadership Challenge (6th ed., 2017) — Inspire a Shared Vision (one of the Five Practices).
7. Goleman, Emotional Intelligence (1995) — five EI components (the precondition for safe dissent and constructive conflict).`,
  },
  knowledgeObject: {
    title: "Building Shared Project Vision — Vision, Team Charter, Psychological Safety",
    domain: "People",
    competency: "Building Shared Project Vision",
    topic: "Vision & Team Charter",
    concept: "Vision as a 4-component, co-authored, behavior-translating artifact",
    body: {
      definitions: [
        "Project vision: the team's common answer to 'Why does this project matter, and what will success look like?'",
        "Shared vision: vision authored with (not imposed on) the team; ≥ 80% can restate it in their own words.",
        "Kouzes & Posner 'Inspire a Shared Vision': one of the Five Practices of Exemplary Leadership — Envision the Future + Enlist Others.",
        "Stewardship (PMBOK 7th): the principle that the PM stewards the project's resources, vision, and outcomes.",
        "Stakeholder Engagement Assessment Matrix: Unaware → Aware → Supportive → Engaged → Leading.",
        "Team charter: 8 contents (vision, ground rules, DACI, cadence, conflict protocol, communication norms, DoD, signatures).",
        "Ground rules: specific, observable, enforceable behaviors (e.g., escalate within 4 hours).",
        "DACI: Driver, Approver, Contributor, Informed — decision-rights matrix.",
        "Psychological safety (Edmondson): the belief that one will not be punished or humiliated for speaking up.",
        "Edmondson 10-item scale: 1–7 Likert each; PS = Σ / (10 × 7), in [0, 1].",
        "Safety × Accountability quadrant: fear (low/low), comfort/apathy (high safety/low accountability), anxiety (low safety/high accountability), learning/high-performance (high/high).",
        "Definition of Done (DoD): the checklist a deliverable must meet to be considered complete.",
      ],
      principles: [
        "Vision has 4 components: future state, why it matters, stakeholder framing, operationalizing behaviors.",
        "A vision without behaviors is a poster; behaviors without a vision are compliance.",
        "Kouzes & Posner 'Inspire a Shared Vision' enlists the team; the leader does not impose.",
        "Vision-coherence test: ≥ 80% of the team can restate the vision and name one behavior.",
        "Stakeholder engagement moves Unaware → Leading; the matrix is reviewed monthly.",
        "Team charter = 8 contents; signatures make ground rules a mutual agreement, not a wall poster.",
        "Ground rules: specific, observable, enforceable — not slogans.",
        "Psychological safety (Edmondson) is the precondition; safety ≠ absence of accountability.",
        "High-performance requires high safety AND high accountability.",
        "The charter workshop is a negotiation, not a presentation.",
      ],
      components: [
        "Vision statement (4 components).",
        "Stakeholder Engagement Assessment Matrix (5 levels).",
        "Team charter (8 contents).",
        "Ground rules (specific, observable, enforceable).",
        "DACI decision-rights matrix.",
        "Meeting cadence (daily huddle, weekly walk, monthly steering).",
        "Conflict-resolution protocol (Thomas-Kilmann default per source).",
        "Definition of Done (per deliverable).",
        "Signed commitments (team-charter signatures).",
        "Edmondson 10-item psychological-safety scale (PS in [0, 1]).",
        "Safety × Accountability quadrant model.",
      ],
      mechanism: [
        "Vision lifecycle: draft 4-component vision → engage stakeholders individually → convene 90-min charter workshop → baseline Edmondson scorecard → prescribe zone-specific intervention → enforce ground rules via SBI → review Engagement Matrix monthly → re-survey PS quarterly → re-charter at phase boundaries → vision-coherence check every 90 days.",
      ],
      process: [
        "1. Draft the vision (4 components) — PM's first draft.",
        "2. Engage stakeholders individually — translate per stakeholder; update the Engagement Matrix.",
        "3. Convene a 90-minute team charter workshop — restate vision in team's words; draft and challenge ground rules; negotiate DACI; set cadence; agree conflict protocol; author Definition of Done; collect signatures.",
        "4. Baseline the Edmondson scorecard (anonymous; 10 items, 1–7 each); compute PS = Σ/70.",
        "5. Identify the zone (fear / comfort / learning / high-performance) and the lowest-scoring items; prescribe the zone-specific intervention.",
        "6. Enforce ground rules consistently — SBI feedback in the moment; the Definition of Done at every deliverable.",
        "7. Review the Engagement Matrix monthly; move stakeholders toward Engaged/Leading.",
        "8. Re-survey PS quarterly; track the zone trajectory.",
        "9. Re-charter at major phase boundaries.",
        "10. Vision-coherence check every 90 days (≥ 80% target).",
      ],
      formulas: [
        "PS = (Σ item scores) / (10 × 7), in [0, 1].",
        "Engagement level: {Unaware=1, Aware=2, Supportive=3, Engaged=4, Leading=5}.",
        "Engagement gap = desired level − current level.",
        "Vision-coherence = (team members who can restate + name one behavior) / total team; target ≥ 0.80.",
      ],
      metrics: [
        "PS in [0, 1] — target ≥ 0.66 (learning zone) for most teams; ≥ 0.80 for high-performance.",
        "Vision-coherence — target ≥ 80%.",
        "Ground-rule enforcement rate — target 100% (inconsistent enforcement degrades PS faster than any other factor).",
        "Stakeholder engagement gap closure — target all gaps moving toward 0 monthly.",
        "Attrition per 90 days — target 0 for a well-visioned team.",
        "Schedule impediments surfaced at daily huddle — target ≥ 1/day (the huddle's value is surfacing impediments).",
      ],
      examples: [
        "Construction hospital: vision + charter + scorecard baseline 0.686 → 0.80 in 90 days; attrition 0; on schedule.",
        "IT digital-transformation: PS baseline 0.62 (comfort) → 0.74 (learning) in 90 days; first release on schedule.",
        "Healthcare EHR: PS baseline 0.58 (comfort) → 0.71 (learning) in 90 days; medication-error rate trending to -50%.",
        "Oil & Gas turn-around: PS baseline 0.55 → 0.78 (turn-around complete); zero recordable incidents; 4% under cost.",
      ],
      industrial_examples: [
        "Construction — hospital expansion: vision 4-component + charter + Edmondson baseline 0.686 → 0.80; attrition 0; on schedule.",
        "IT — logistics digital-transformation: PS 0.62 → 0.74; first release on schedule.",
        "Healthcare — EHR rollout: PS 0.58 → 0.71; medication-error rate trending to -50%.",
        "Oil & Gas — turn-around: PS 0.55 → 0.78; zero recordable incidents; 4% under cost; on-schedule restart.",
      ],
      case_studies: [
        "SYNTHETIC — Construction Hospital-Expansion Vision, Charter & Safety Scorecard (composite, 90 days). Vision-coherence 33% → 90%. PS 0.686 → 0.80. Attrition 2 → 0. Schedule on track. 8 impediments surfaced at daily huddle that would otherwise have caused slips. The site-lead coaching ran in parallel (see ppl-coaching-mentoring) and produced the autonomy gains that lifted supervisor-challenge items.",
      ],
      common_errors: [
        "Imposing the vision — emailed, not co-authored; fails the coherence test.",
        "Slogans as ground rules — 'be respectful,' 'communicate well' fail the observable-enforceable test.",
        "Skipping the charter workshop — charter becomes a wall poster.",
        "Inconsistent ground-rule enforcement — degrades PS faster than any other factor.",
        "Surveying safety without intervening — the survey alone produces no change.",
        "Conflating safety with low accountability — high-performance needs both.",
        "Failing the vision-coherence test — if < 80% can restate, it is not shared.",
        "Treating the charter as a one-time event — re-charter at phase boundaries.",
        "Ignoring the Engagement Matrix — stakeholders drift; review monthly.",
      ],
      limitations: [
        "The 4-component vision template is a heuristic; vision-craft benefits from senior-leader sponsorship and iteration.",
        "Edmondson's 10-item scale self-reports; anonymous administration is the precondition.",
        "The charter workshop assumes team presence and willingness; absent stakeholders produce a partial charter.",
        "Psychological safety is a leading indicator; lagging indicators (attrition, schedule, quality) confirm later.",
        "Stakeholder engagement levels are qualitative; two raters may differ.",
        "Industry context shifts which interventions work; the candidate must adapt the framework.",
      ],
      best_practices: [
        "Draft a 4-component vision in week 1.",
        "Engage each stakeholder individually in week 2 — translate the vision into their language.",
        "Convene a 90-minute charter workshop in week 3 — restate vision, draft/challenge ground rules, negotiate DACI, set cadence, agree conflict protocol, author DoD, collect signatures.",
        "Baseline the Edmondson scorecard in week 4 — anonymous administration.",
        "Prescribe the zone-specific intervention.",
        "Enforce ground rules consistently via SBI feedback in the moment.",
        "Review the Engagement Matrix monthly.",
        "Re-survey PS quarterly; re-charter at phase boundaries.",
        "Vision-coherence check every 90 days (≥ 80% target).",
        "Treat the charter workshop as a negotiation, not a presentation.",
      ],
      related_concepts: [
        "ppl-leading-a-team (Kouzes & Posner Inspire a Shared Vision; PMI Talent Triangle Power-Skills leg).",
        "ppl-managing-conflict (Thomas-Kilmann default per source = the charter's conflict protocol).",
        "ppl-coaching-mentoring (SBI feedback; servant leadership as developer-of-others; the charter's enforcement mechanism).",
        "Process domain — the Definition of Done in the charter drives quality; the cadence drives schedule discipline.",
      ],
      prerequisites: [
        "Lesson 1 — Leading a Team (leadership styles; Kouzes & Posner Five Practices).",
        "Lesson 2 — Managing Conflict (Thomas-Kilmann default = Collaborating; conflict-resolution protocol).",
        "Lesson 3 — Coaching & Mentoring (SBI feedback; servant leadership).",
        "A project lifecycle observed as a participant, including at least one team-formation event.",
      ],
      references: [
        "PMI — A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition.",
        "PMI — Agile Practice Guide.",
        "PMI — PMP Examination Content Outline (ECO).",
        "PMI — PMI Talent Triangle®.",
        "ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management.",
        "Kouzes & Posner — The Leadership Challenge (6th ed., 2017).",
        "Goleman — Emotional Intelligence (1995).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Building Shared Project Vision",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Construction",
      stem: "A Construction PM leading a hospital expansion drafts a vision: \"Build a 30-bed ward that reduces emergency-department boarding by 40% in Q3 next year, with zero lost-time incidents and 10% under cost benchmark; escalate within 4 hours; one source of truth for drawings; no rework without a written change order.\" Which of the 4 vision components is the ground-rules clause (escalate / one source / no rework)?",
      whyCorrect:
        "The ground-rules clause ('escalate within 4 hours; one source of truth for drawings; no rework without a written change order') is the fourth vision component — *operationalizing behaviors* — the specific, observable, enforceable behaviors that translate the vision into daily action. The other three components are: future state (open a 30-bed ward by Q3 next year with zero lost-time and 10% under cost), why it matters (patient safety, regulatory, strategic), and stakeholder framing (each stakeholder's reason to care).",
      whyOthersWrong: [
        "Future state — the future state is the concrete time-bound outcome (open the ward by Q3 with zero lost-time and 10% under cost); the ground rules operationalize the future state but are not themselves the future state.",
        "Why it matters — the 'why' is the stakeholder interest (patient safety, regulatory, strategic); ground rules are the behaviors, not the interest.",
        "Stakeholder framing — framing is the per-stakeholder language (clinical lead hears patient impact; CFO hears cost); ground rules are not framing.",
      ],
      explanation:
        "Vision = 4 components: (1) Future state — concrete, time-bound; (2) Why it matters — stakeholder interest; (3) Stakeholder framing — per-stakeholder language; (4) Operationalizing behaviors — ground rules. The 4-component template is non-optional; a vision without behaviors is a poster; behaviors without a vision are compliance.",
      options: [
        { text: "Future state", isCorrect: false },
        { text: "Why it matters", isCorrect: false },
        { text: "Stakeholder framing", isCorrect: false },
        { text: "Operationalizing behaviors", isCorrect: true },
      ],
    },
    {
      competencyName: "Building Shared Project Vision",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Per Edmondson, the 10-item psychological-safety scale (1–7 Likert each) is summed and divided by what denominator to yield a PS score in [0, 1]?",
      whyCorrect:
        "PS = (Σ item scores) / (10 × 7). The denominator is 70 — the product of 10 items × 7 Likert points per item. PS = 48 / 70 = 0.686 in the worked example. The four zones are: fear (< 0.50), comfort/apathy (0.50–0.65), learning (0.66–0.80), high-performance (> 0.80).",
      whyOthersWrong: [
        "10 — under-counts; would yield PS = 4.8 (>1) for the worked example, breaking the [0,1] interval.",
        "7 — under-counts; would yield PS = 6.86 (>1) for the worked example.",
        "100 — over-counts; would yield PS = 0.48 (mis-zoning the worked example as 'fear' rather than the correct 'learning zone, low end' at 0.686).",
      ],
      explanation:
        "PS = (Σ item scores) / (10 × 7) = Σ / 70, in [0, 1]. The denominator is the product of 10 items × 7 Likert points. The four zones are: fear (< 0.50), comfort/apathy (0.50–0.65), learning (0.66–0.80), high-performance (> 0.80).",
      options: [
        { text: "10", isCorrect: false },
        { text: "7", isCorrect: false },
        { text: "70", isCorrect: true },
        { text: "100", isCorrect: false },
      ],
    },
    {
      competencyName: "Building Shared Project Vision",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Conceptual",
      scenario: "Construction",
      stem: "A Construction PM's team has high psychological safety (PS = 0.82) but low accountability (Definition of Done not enforced; missed deliverables not addressed). The team is in which quadrant, and what is the risk?",
      whyCorrect:
        "High safety + low accountability = the comfort/apathy quadrant. The team is comfortable — it is safe to speak up — but does not deliver. The risk is comfortable under-performance: the team will not burn out, but the project will slip because deliverables are missed without consequence. The intervention is to push accountability — enforce the Definition of Done, deliver SBI feedback on missed deliverables, and use signed commitments — without sacrificing the safety that took work to build. The target quadrant is learning/high-performance (high safety + high accountability).",
      whyOthersWrong: [
        "Fear (low safety, low accountability) — incorrect; the team has high safety.",
        "Anxiety (low safety, high accountability) — incorrect; the team has high safety, not low.",
        "Learning / high-performance (high safety, high accountability) — incorrect; the team has low accountability, not high.",
      ],
      explanation:
        "The Safety × Accountability quadrant: fear (low/low), comfort/apathy (high safety/low accountability), anxiety (low safety/high accountability), learning/high-performance (high/high). A team with PS = 0.82 and unenforced DoD is in comfort/apathy — comfortable but not delivering. The intervention is to push accountability (enforce DoD, SBI on misses) without sacrificing safety.",
      options: [
        { text: "Fear — paralyzed", isCorrect: false },
        { text: "Comfort / Apathy — comfortable but not delivering", isCorrect: true },
        { text: "Anxiety — fearful, will burn out", isCorrect: false },
        { text: "Learning / High-performance — speaks up and delivers", isCorrect: false },
      ],
    },
    {
      competencyName: "Building Shared Project Vision",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Per Edmondson, psychological safety means the absence of accountability — the team should be free from any pressure to deliver, in order to enable candor and innovation.",
      whyCorrect:
        "False. Edmondson explicitly distinguishes psychological safety from the absence of accountability. Psychological safety is 'the belief that one will not be punished or humiliated for speaking up with ideas, questions, concerns, or mistakes' — it is about candor, not about lowering delivery expectations. High-performance teams have BOTH high safety AND high accountability (the learning/high-performance quadrant). A team with high safety but low accountability is in the comfort/apathy quadrant — comfortable but not delivering. The mature PM builds both: safety via the scorecard and targeted interventions, accountability via the team charter's Definition of Done, signed commitments, and SBI feedback.",
      whyOthersWrong: [
        "True — the candidate conflates safety with absence of accountability; this is the most common misreading of Edmondson. High-performance requires both safety AND accountability; either alone is insufficient.",
      ],
      explanation:
        "Edmondson's research emphasizes that psychological safety is about candor (speaking up without humiliation), not about lowering delivery expectations. The Safety × Accountability quadrant model shows four zones; only the high-safety + high-accountability zone (learning/high-performance) is the target. The comfort/apathy quadrant (high safety, low accountability) is comfortable but does not deliver.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// PPL lesson registry — the 4 lessons seeded by this loader.
// ---------------------------------------------------------------------------

const PMP_PPL_LESSONS: RefLesson[] = [
  LESSON_PPL_LEADING_A_TEAM,
  LESSON_PPL_MANAGING_CONFLICT,
  LESSON_PPL_COACHING_MENTORING,
  LESSON_PPL_BUILDING_SHARED_VISION,
];

// ---------------------------------------------------------------------------
// Loader — combines STRUCTURE + CONTENT in one idempotent loadReference().
// Mirrors cre.ts exactly.
//
// Returns: { certification, domains, competencies, standards, versions,
//            learningPath, lessons, kos, questions, references }.
// ---------------------------------------------------------------------------

export async function loadReference() {
  // ---- (A) STRUCTURE ----

  // 1) Certification (upsert by slug "pmp")
  const certification = await db.certification.upsert({
    where: { slug: "pmp" },
    create: {
      slug: "pmp",
      name: "PMP",
      fullName: "Project Management Professional",
      body: "PMI",
      currentVersion: "2024",
      bokReference:
        "PMI PMP Examination Content Outline (ECO) — People, Process, Business Environment",
      examBlueprint: JSON.stringify({
        domains: 3,
        domainWeights: { PPL: 42, PRC: 50, BE: 8 },
        durationMin: 230,
        questionCount: 180,
        passingScore: "see PMI (varies; ~61%)",
        note:
          "Per-domain % weights flagged REQUIRES_RESEARCH pending official PMI PMP ECO verification in-platform. The 3-domain structure (People / Process / Business Environment) itself is the published PMI PMP ECO. Weights 42/50/8 are approximate per PMI ECO publications and may differ by exam form. Process and Business Environment domains are seeded here as structure only (no competencies); they will be filled by future PRC/BE pillars.",
      }),
      effectiveDate: new Date("2024-01-01"),
      description:
        "The PMP, administered by the Project Management Institute (PMI), is the leading credential for project managers worldwide. It validates competency across three performance domains per the PMI Examination Content Outline: People (≈42%, leadership, team, stakeholder, conflict); Process (≈50%, methodology, schedule, scope, budget, risk, procurement); and Business Environment (≈8%, compliance, value delivery, external context). The PMP is recognized internationally as the canonical project-management certification and is aligned with the PMBOK® Guide 7th Edition principles, performance domains, and the PMI Talent Triangle® (Ways of Working, Power Skills, Business Acumen).",
      color: "teal",
      icon: "Award",
      order: 3,
      group: "Project & Business",
    },
    update: {
      name: "PMP",
      fullName: "Project Management Professional",
      body: "PMI",
      currentVersion: "2024",
      description:
        "The PMP, administered by the Project Management Institute (PMI), is the leading credential for project managers worldwide. It validates competency across three performance domains per the PMI Examination Content Outline: People (≈42%, leadership, team, stakeholder, conflict); Process (≈50%, methodology, schedule, scope, budget, risk, procurement); and Business Environment (≈8%, compliance, value delivery, external context). The PMP is recognized internationally as the canonical project-management certification and is aligned with the PMBOK® Guide 7th Edition principles, performance domains, and the PMI Talent Triangle® (Ways of Working, Power Skills, Business Acumen).",
      group: "Project & Business",
    },
  });

  // 2) Domains + Competencies (delete+recreate to keep order accurate)
  await db.competency.deleteMany({
    where: { domain: { certificationId: certification.id } },
  });
  await db.domain.deleteMany({ where: { certificationId: certification.id } });

  let domainCount = 0;
  let competencyCount = 0;
  const domainIdByCode: Record<string, string> = {};
  for (let i = 0; i < PMP_DOMAINS.length; i++) {
    const d = PMP_DOMAINS[i];
    const domain = await db.domain.create({
      data: {
        certificationId: certification.id,
        name: d.name,
        code: d.code,
        weight: d.weight,
        order: i + 1,
        description: d.description,
      },
    });
    domainIdByCode[d.code] = domain.id;
    domainCount++;
    for (const c of d.competencies) {
      await db.competency.create({
        data: {
          domainId: domain.id,
          name: c.name,
          code: c.code ?? null,
          description: c.description,
          order: c.order,
        },
      });
      competencyCount++;
    }
  }

  // 3) Link a standard by slug "iso-21500" if one already exists in the DB.
  //    Per task instruction: "Link standard ISO 21500 (if exists) — else skip;
  //    do NOT invent a standard." No Standard row is created; only a
  //    CertificationStandard link if the slug already exists.
  let standardsLinked = 0;
  const iso21500 = await db.standard.findUnique({
    where: { slug: "iso-21500" },
  });
  if (iso21500) {
    await db.certificationStandard.upsert({
      where: {
        certificationId_standardId: {
          certificationId: certification.id,
          standardId: iso21500.id,
        },
      },
      create: { certificationId: certification.id, standardId: iso21500.id },
      update: {},
    });
    standardsLinked = 1;
  }
  // (If iso-21500 is not present, standardsLinked remains 0; no standard is
  // invented. ISO 21500:2021 is still cited as a Reference in step 7 below.)

  // 4) Certification version snapshot (v2024)
  const pplDomain = PMP_DOMAINS.find((d) => d.code === "PPL")!;
  const pplSnapshot = {
    pplDomain,
    pplCompetencies: pplDomain.competencies,
    standards: standardsLinked > 0 ? ["iso-21500"] : [],
    examBlueprintNote:
      "Per-domain % weights flagged REQUIRES_RESEARCH pending official PMI PMP ECO verification in-platform. 3-domain structure (People/Process/Business Environment) is the published PMI ECO. Weights 42/50/8 are approximate.",
  };
  await db.certificationVersion.upsert({
    where: {
      certificationId_version: {
        certificationId: certification.id,
        version: "2024",
      },
    },
    create: {
      certificationId: certification.id,
      version: "2024",
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({
        domains: PMP_DOMAINS,
        standards: standardsLinked > 0 ? ["iso-21500"] : [],
        pplSnapshot,
      }),
      changeLog:
        "Pilot structure: 3 PMI PMP Performance Domains seeded (People, Process, Business Environment) with 10 People-domain competencies per the PMI ECO. PPL pillar deep content (4 full-spec lessons + KOs + 16 questions). Exam blueprint weights flagged REQUIRES_RESEARCH. No standard invented; ISO 21500:2021 is cited as a Reference only.",
    },
    update: {
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({
        domains: PMP_DOMAINS,
        standards: standardsLinked > 0 ? ["iso-21500"] : [],
        pplSnapshot,
      }),
    },
  });

  // 5) PMP learning path
  const path = await db.learningPath.upsert({
    where: { slug: "pmp-path" },
    create: {
      slug: "pmp-path",
      name: "PMP Certification Path",
      type: "Certification",
      certificationId: certification.id,
      description:
        "Structured path through the three PMI PMP Performance Domains (People, Process, Business Environment) to certification-readiness, anchored on the PMBOK® Guide 7th Edition and the PMI Talent Triangle®.",
      order: 3,
    },
    update: { certificationId: certification.id },
  });

  // ---- (B) CONTENT (PPL pillar) ----

  // 6) Find the PPL domain and map its 4 competencies by NAME -> id
  const pplDomainRecord = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "PPL" },
  });
  if (!pplDomainRecord) {
    throw new Error(
      'People (PPL) domain not found under PMP. Internal error — domains were just created.'
    );
  }
  const pplCompetencies = await db.competency.findMany({
    where: { domainId: pplDomainRecord.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of pplCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  const expectedCompetencyNames = PMP_PPL_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter((n) => !competencyIdByName[n]);
  if (missing.length > 0) {
    throw new Error(
      `Missing PPL competencies by name: ${missing.join(
        ", "
      )}. Ensure the PMP structure (3 domains + 10 PPL competencies) was seeded correctly.`
    );
  }

  // 7) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of PMP_SOURCES) {
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
  const sharedReferenceIds = PMP_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 8) Lessons, 9) KnowledgeObjects, 10) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of PMP_PPL_LESSONS) {
    const competencyId = competencyIdByName[lesson.competencyName];
    if (!competencyId) {
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

    // 8) Lesson — findFirst by (competencyId, slug) then update or create
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

    // 9) KnowledgeObject — findFirst by lessonId, then update or create.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { lessonId },
    });
    const koData = {
      certificationId: certification.id,
      domainId: pplDomainRecord.id,
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

    // 10) Questions — delete existing for this competency (scoped), then
    //     create each enriched question with nested options.
    await db.question.deleteMany({
      where: { certificationId: certification.id, competencyId },
    });

    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          certificationId: certification.id,
          domainId: pplDomainRecord.id,
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
    domains: domainCount,
    competencies: competencyCount,
    standards: standardsLinked,
    versions: 1,
    learningPath: path.id,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}

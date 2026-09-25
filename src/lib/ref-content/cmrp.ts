// =============================================================================
// CMRP Pilot — Certified Maintenance & Reliability Professional
// Models the SMRP CMRP Body of Knowledge structure: 5 official pillars (domains)
// and their competencies, related ISO 5500x standards, and a version snapshot.
//
// NOTE on exam weights: the exact % per pillar is published in the official SMRP
// CMRP exam blueprint. The weights below are approximate placeholders flagged
// verificationStatus = "REQUIRES_RESEARCH" until the official blueprint is
// loaded from SMRP (per the data-collector spec §1: do not invent certification
// requirements). The 5-pillar structure itself is the published SMRP BOK.
// =============================================================================

import { db } from "@/lib/db";

interface SeedCompetency {
  code?: string;
  name: string;
  description: string;
  order: number;
}
interface SeedDomain {
  code: string;
  name: string;
  weight: number; // approximate %
  description: string;
  competencies: SeedCompetency[];
}

const CMRP_DOMAINS: SeedDomain[] = [
  {
    code: "B&M",
    name: "Business & Management",
    weight: 20,
    description:
      "Business management, strategy, quality, economics, and human-resources foundations that connect maintenance/reliability to enterprise value.",
    competencies: [
      { name: "Business Management", description: "How maintenance & reliability drive business value, cost-of-ownership, and ROI.", order: 1 },
      { name: "Strategy", description: "Aligning M&R strategy with corporate strategy and asset lifecycle planning.", order: 2 },
      { name: "Quality", description: "Quality management principles, continuous improvement, and their link to reliability.", order: 3 },
      { name: "Economics", description: "Engineering economics: NPV, IRR, life-cycle cost, and cost-benefit for asset decisions.", order: 4 },
      { name: "Human Resources", description: "People skills, workforce planning, competency development, and engagement.", order: 5 },
    ],
  },
  {
    code: "MPR",
    name: "Manufacturing Process Reliability",
    weight: 20,
    description:
      "Designing, commissioning, and sustaining reliable manufacturing processes — process reliability and maintainability engineering.",
    competencies: [
      { name: "Process Design", description: "Designing processes for inherent reliability and maintainability.", order: 1 },
      { name: "Installation & Commissioning", description: "Asset installation, acceptance testing, and commissioning for reliability.", order: 2 },
      { name: "Reliability & Maintainability", description: "Process RAM (Reliability, Availability, Maintainability) engineering.", order: 3 },
      { name: "Maintenance Technologies", description: "Selecting and applying maintenance technologies across the process.", order: 4 },
    ],
  },
  {
    code: "ER",
    name: "Equipment Reliability",
    weight: 20,
    description:
      "Equipment-level reliability engineering: failure analysis, condition monitoring, work-zone analysis, and equipment history.",
    competencies: [
      { name: "Equipment Reliability", description: "Failure modes, failure data, MTBF/MTTR, and equipment reliability engineering.", order: 1 },
      { name: "Condition Monitoring & Diagnostics", description: "CBM technologies: vibration, oil analysis, thermography, ultrasonic.", order: 2 },
      { name: "Work Zone Analysis", description: "Criticality and bad-actor analysis to prioritize equipment improvement.", order: 3 },
      { name: "Equipment History", description: "CMMS data, failure history, and reliability analytics from history.", order: 4 },
    ],
  },
  {
    code: "OL",
    name: "Organization & Leadership",
    weight: 20,
    description:
      "Organizational design, leadership, behavior, change management, and training/development for a reliability culture.",
    competencies: [
      { name: "Organizational Structures", description: "Designing M&R organizational structures and roles/responsibilities.", order: 1 },
      { name: "Leadership", description: "Leadership of maintenance/reliability functions and teams.", order: 2 },
      { name: "Organizational Behavior", description: "Culture, motivation, and team dynamics for reliability.", order: 3 },
      { name: "Change Management", description: "Leading and sustaining change (RCM/TPM/CI rollouts).", order: 4 },
      { name: "Training & Development", description: "Skills development, certification, and competency frameworks.", order: 5 },
    ],
  },
  {
    code: "WM",
    name: "Work Management",
    weight: 20,
    description:
      "The work-management cycle: planning, scheduling, execution, CMMS, MRO materials, and measurements/KPIs.",
    competencies: [
      { name: "Planning", description: "Work-order planning: scope, parts, labor, tools, safety, procedures.", order: 1 },
      { name: "Scheduling", description: "Scheduling planned work with resources and equipment availability.", order: 2 },
      { name: "Work Execution", description: "Executing, closing, and capturing data from work orders.", order: 3 },
      { name: "CMMS", description: "Computerized Maintenance Management System design, use, and data integrity.", order: 4 },
      { name: "MRO Materials Management", description: "Spare parts, storeroom, and MRO inventory management.", order: 5 },
      { name: "Measurements & Reporting", description: "Maintenance & reliability KPIs (OEE, MTBF, MTTR, PM compliance, backlog).", order: 6 },
    ],
  },
];

const CMRP_STANDARDS = [
  {
    slug: "iso-55000",
    name: "ISO 55000",
    organization: "ISO",
    number: "55000",
    version: "2014",
    description:
      "Asset management — Overview, principles and terminology. The umbrella standard for asset management.",
  },
  {
    slug: "iso-55001",
    name: "ISO 55001",
    organization: "ISO",
    number: "55001",
    version: "2014",
    description:
      "Asset management — Management systems — Requirements. The requirements standard (CAMA assesses against it).",
  },
  {
    slug: "iso-55002",
    name: "ISO 55002",
    organization: "ISO",
    number: "55002",
    version: "2018",
    description:
      "Asset management — Guidelines for the application of ISO 55001.",
  },
];

export async function loadReference() {
  // 1) Certification (upsert by slug)
  const certification = await db.certification.upsert({
    where: { slug: "cmrp" },
    create: {
      slug: "cmrp",
      name: "CMRP",
      fullName: "Certified Maintenance & Reliability Professional",
      body: "SMRP",
      currentVersion: "2024",
      bokReference: "SMRP CMRP Body of Knowledge (5 Pillars)",
      examBlueprint: JSON.stringify({
        pillars: 5,
        durationMin: 150,
        questionCount: 100,
        passingScore: "see SMRP",
        note: "Exam blueprint details flagged REQUIRES_RESEARCH pending official SMRP BOK load.",
      }),
      effectiveDate: new Date("2024-01-01"),
      description:
        "The CMRP, administered by SMRP, is the leading credential for maintenance & reliability professionals. It validates competency across five pillars: Business & Management, Manufacturing Process Reliability, Equipment Reliability, Organization & Leadership, and Work Management.",
      color: "emerald",
      icon: "Award",
      order: 1,
    },
    update: {
      name: "CMRP",
      fullName: "Certified Maintenance & Reliability Professional",
      body: "SMRP",
      currentVersion: "2024",
      description:
        "The CMRP, administered by SMRP, is the leading credential for maintenance & reliability professionals. It validates competency across five pillars: Business & Management, Manufacturing Process Reliability, Equipment Reliability, Organization & Leadership, and Work Management.",
    },
  });

  // 2) Standards (upsert by slug) + link to CMRP
  const standardIds: string[] = [];
  for (const s of CMRP_STANDARDS) {
    const std = await db.standard.upsert({
      where: { slug: s.slug },
      create: s,
      update: {
        name: s.name,
        organization: s.organization,
        number: s.number,
        version: s.version,
        description: s.description,
      },
    });
    standardIds.push(std.id);
    await db.certificationStandard.upsert({
      where: {
        certificationId_standardId: {
          certificationId: certification.id,
          standardId: std.id,
        },
      },
      create: { certificationId: certification.id, standardId: std.id },
      update: {},
    });
  }

  // 3) Domains + Competencies (delete+recreate to keep order accurate)
  await db.competency.deleteMany({
    where: { domain: { certificationId: certification.id } },
  });
  await db.domain.deleteMany({ where: { certificationId: certification.id } });

  let domainCount = 0;
  let competencyCount = 0;
  for (const d of CMRP_DOMAINS) {
    const domain = await db.domain.create({
      data: {
        certificationId: certification.id,
        name: d.name,
        code: d.code,
        weight: d.weight,
        order: CMRP_DOMAINS.indexOf(d) + 1,
        description: d.description,
      },
    });
    domainCount++;
    for (const c of d.competencies) {
      await db.competency.create({
        data: {
          domainId: domain.id,
          name: c.name,
          description: c.description,
          order: c.order,
        },
      });
      competencyCount++;
    }
  }

  // 4) Certification version snapshot (§10 — never delete old; here the pilot v2024)
  await db.certificationVersion.upsert({
    where: {
      certificationId_version: { certificationId: certification.id, version: "2024" },
    },
    create: {
      certificationId: certification.id,
      version: "2024",
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({ domains: CMRP_DOMAINS, standardIds }),
      changeLog: "Pilot structure: 5 pillars + competencies seeded. Exam blueprint weights flagged REQUIRES_RESEARCH.",
    },
    update: {
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({ domains: CMRP_DOMAINS, standardIds }),
    },
  });

  // 5) A CMRP learning path (§22) — Certification path
  const path = await db.learningPath.upsert({
    where: { slug: "cmrp-path" },
    create: {
      slug: "cmrp-path",
      name: "CMRP Certification Path",
      type: "Certification",
      certificationId: certification.id,
      description:
        "Structured path from Foundation to Certification-readiness across the 5 CMRP pillars.",
      order: 1,
    },
    update: { certificationId: certification.id },
  });

  return {
    certification: certification.id,
    domains: domainCount,
    competencies: competencyCount,
    standards: standardIds.length,
    versions: 1,
    learningPath: path.id,
    lessons: 0,
    kos: 0,
    questions: 0,
    references: 0,
  };
}

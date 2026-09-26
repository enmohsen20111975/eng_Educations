import { db } from "@/lib/db";
import { electricalBatch1 } from "./electrical-batch1";
import { electricalBatch2 } from "./electrical-batch2";
import { electricalBatch3 } from "./electrical-batch3";
import { upsBatteryEquations } from "./electrical-ups-battery";
import { mechanicalBatch1 } from "./mechanical-batch1";
import { mechanicalBatch2 } from "./mechanical-batch2";
import { civilBatch1 } from "./civil-batch1";
import { civilBatch2 } from "./civil-batch2";
import { chemicalBatch1 } from "./chemical-batch1";
import { mathematicsBatch1 } from "./mathematics-batch1";

const ALL = [
  ...electricalBatch1, ...electricalBatch2, ...electricalBatch3, ...upsBatteryEquations,
  ...mechanicalBatch1, ...mechanicalBatch2,
  ...civilBatch1, ...civilBatch2,
  ...chemicalBatch1,
  ...mathematicsBatch1,
];

export async function seedEquations() {
  let count = 0;
  for (const eq of ALL as any[]) {
    // Upsert category
    let categoryId: string | null = null;
    if (eq.category_slug) {
      const cat = await db.equationCategory.upsert({
        where: { slug: eq.category_slug },
        create: { slug: eq.category_slug, name: eq.category_slug.replace(/-/g, " "), sortOrder: 0 },
        update: {},
      });
      categoryId = cat.id;
    }
    // Upsert equation
    await db.equation.upsert({
      where: { slug: eq.equation_id },
      create: {
        slug: eq.equation_id,
        name: eq.name,
        description: eq.description || null,
        formula: eq.equation || "",
        variables: JSON.stringify(eq.inputs || []),
        outputs: JSON.stringify(eq.outputs || []),
        tags: JSON.stringify(eq.tags || []),
        difficulty: eq.difficulty_level || "intermediate",
        domain: eq.domain || "general",
        categoryId,
        isActive: true,
      },
      update: {
        name: eq.name,
        description: eq.description || null,
        formula: eq.equation || "",
        variables: JSON.stringify(eq.inputs || []),
        outputs: JSON.stringify(eq.outputs || []),
        tags: JSON.stringify(eq.tags || []),
        difficulty: eq.difficulty_level || "intermediate",
        domain: eq.domain || "general",
        categoryId,
      },
    });
    count++;
  }
  return { equations: count };
}

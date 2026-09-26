import { db } from "@/lib/db";
import { ok, bad, serverError } from "@/lib/api-helpers";
export const dynamic = "force-dynamic";
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  try {
    const eq = await db.equation.findUnique({ where: { slug: id } });
    if (!eq) return bad("Equation not found");
    const inputs = body.inputs || {};
    // Parse the formula, substitute variables, evaluate
    const formula = eq.formula;
    const outputMatch = formula.match(/^(\w+)\s*=/);
    const outputVar = outputMatch ? outputMatch[1] : "result";
    const expr = formula.substring(formula.indexOf("=") + 1).trim();
    // Simple eval with variable substitution (safe-ish for engineering formulas)
    const vars: Record<string, number> = {};
    for (const [k, v] of Object.entries(inputs)) vars[k] = Number(v) || 0;
    // Use Function to evaluate (engineering formulas only, not user code in prod)
    const fn = new Function(...Object.keys(vars), `"use strict"; return (${expr})`);
    const result = fn(...Object.values(vars));
    return ok({ equation: eq.name, formula: eq.formula, inputs: vars, result: { [outputVar]: result }, unit: JSON.parse(eq.outputs || "[]")[0]?.unit || "" });
  } catch (e: any) { return serverError(String(e)); }
}

import { ok, serverError, requireAdmin } from "@/lib/api-helpers";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const guard = await requireAdmin(req); if (guard) return guard;
  try {
    const { seedEquations } = await import("@/lib/equations/seed");
    const result = await seedEquations();
    return ok(result);
  } catch (e: any) {
    return serverError(String(e));
  }
}

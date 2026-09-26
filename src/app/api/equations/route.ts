import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/api-helpers";
export const revalidate = 3600;
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
    const equations = await db.equation.findMany({
      where: { isActive: true, ...(domain ? { domain } : {}) },
      orderBy: { domain: "asc" },
      take: 200,
    });
    return ok(equations);
  } catch (e: any) { return serverError(String(e)); }
}

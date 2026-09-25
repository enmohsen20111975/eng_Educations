import { db } from "@/lib/db";
import { bad, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  if (!sectionId) return bad("sectionId required");
  try {
    const kos = await db.knowledgeObject.findMany({
      where: { sectionId },
      orderBy: { createdAt: "asc" },
    });
    return ok(kos);
  } catch (e) {
    return serverError(String(e));
  }
}

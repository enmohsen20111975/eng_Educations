import { ok, bad, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** Load a pre-authored full-spec reference dataset for a section (produced by
 * the content-generation pipeline following the data-collector spec). The
 * loader module lives at src/lib/ref-content/<slug>.ts and exports
 * `loadReference(sectionId)` returning { lessons, kos, questions, references }. */
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return bad("Invalid JSON"); }
  const slug: string = body?.sectionSlug;
  if (!slug) return bad("sectionSlug required");
  try {
    const mod = await import(`@/lib/ref-content/${slug}`);
    if (typeof mod.loadReference !== "function") {
      return bad(`No loadReference() exported for slug "${slug}"`);
    }
    const result = await mod.loadReference();
    return ok(result);
  } catch (e: any) {
    if (String(e).includes("Cannot find module") || String(e).includes("Unknown variable")) {
      return bad(`Reference content for "${slug}" not authored yet.`, 404);
    }
    return serverError(String(e));
  }
}

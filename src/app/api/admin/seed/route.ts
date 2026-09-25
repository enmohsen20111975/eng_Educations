import { ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** Run the seed. POST { reset?: boolean } -> { sections, lessons, questions, cells } */
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty body ok
  }
  try {
    const { runSeed } = await import("@/lib/seed-data");
    const result = await runSeed({ reset: body?.reset === true });
    return ok(result);
  } catch (e) {
    return serverError(String(e));
  }
}

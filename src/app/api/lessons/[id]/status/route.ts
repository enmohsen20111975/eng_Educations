import { db } from "@/lib/db";
import { bad, notFound, ok, serverError, requireAdmin } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await requireAdmin(req); if (guard) return guard;
  let body: any;
  try { body = await req.json(); } catch { return bad("Invalid JSON"); }
  try {
    const data: any = { lastReviewedAt: new Date() };
    if (body.status !== undefined) data.status = body.status;
    if (body.confidence !== undefined) data.confidence = body.confidence;
    if (body.verificationStatus !== undefined) data.verificationStatus = body.verificationStatus;
    if (body.version !== undefined) data.version = body.version;
    const lesson = await db.lesson.update({ where: { id }, data });
    return ok(lesson);
  } catch (e) {
    return serverError(String(e));
  }
}

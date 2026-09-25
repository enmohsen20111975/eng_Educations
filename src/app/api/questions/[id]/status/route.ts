import { db } from "@/lib/db";
import { bad, ok, serverError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: any;
  try { body = await req.json(); } catch { return bad("Invalid JSON"); }
  try {
    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.verificationStatus !== undefined) data.verificationStatus = body.verificationStatus;
    if (body.version !== undefined) data.version = body.version;
    const q = await db.question.update({ where: { id }, data });
    return ok(q);
  } catch (e) {
    return serverError(String(e));
  }
}

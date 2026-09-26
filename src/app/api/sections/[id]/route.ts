import { db } from "@/lib/db";
import { notFound, ok, serverError, requireAdmin } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await requireAdmin(req); if (guard) return guard;
  try {
    const section = await db.section.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { _count: { select: { questions: true } } },
        },
        _count: { select: { questions: true } },
      },
    });
    if (!section) return notFound("Section not found");
    return ok(section);
  } catch (e) {
    return serverError(String(e));
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return serverError("Invalid JSON");
  }
  try {
    const section = await db.section.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        titleAr: body.titleAr,
        description: body.description,
        icon: body.icon,
        color: body.color,
        order: body.order,
      },
    });
    return ok(section);
  } catch (e) {
    return serverError(String(e));
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await db.section.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return serverError(String(e));
  }
}

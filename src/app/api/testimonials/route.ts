import { db } from "@/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get("spaceId");
    if (!spaceId) {
      return Response.json(
        {
          error: "Space ID is required",
        },
        {
          status: 400,
        },
      );
    }
    const testimonials = await db.query.TESTIMONIAL.findMany({
      where: (table, { eq, and }) =>
        and(eq(table.spaceId, spaceId), eq(table.isPublished, true)),
      orderBy: (table, { desc }) => desc(table.createdAt),
    });
    return Response.json({
      testimonials,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}

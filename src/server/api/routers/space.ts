import { db } from "@/server/db";
import { SPACE, TESTIMONIAL } from "@/server/db/schema/space";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const spaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        customMessage: z.string(),
        logo: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await db.insert(SPACE).values({
        name: input.name,
        customMessage: input.customMessage,
        logo: input.logo,
        userId,
      });
    }),
  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const space = await db.query.SPACE.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: {
          testimonials: true,
        },
      });

      if (!space) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return space;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Build the query
    const query = db.query.SPACE.findMany({
      where: (table, { eq }) => eq(table.userId, userId),
      with: {
        testimonials: true,
      },
    });

    return await query; // Execute the original query object
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const space = await db.query.SPACE.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
      });

      if (!space) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await db.delete(SPACE).where(eq(SPACE.id, input.id));
    }),
  createTestimonial: publicProcedure
    .input(
      z.object({
        spaceId: z.string(),
        text: z.string().min(1),
        authorName: z.string().min(1),
        socialUrl: z.string().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const spaceExists = await db.query.SPACE.findFirst({
        where: (table, { eq }) => eq(table.id, input.spaceId),
        columns: { id: true },
      });

      if (!spaceExists) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      try {
        const testimony = await db.insert(TESTIMONIAL).values({
          spaceId: input.spaceId,
          text: input.text,
          authorName: input.authorName,
          socialUrl: input.socialUrl ?? "",
          imageUrl: input.imageUrl,
        });

        return testimony;
      } catch (error) {
        console.error(error);
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        customMessage: z.string(),
        logo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await db
        .update(SPACE)
        .set({
          name: input.name,
          customMessage: input.customMessage,
          logo: input.logo,
        })
        .where(and(eq(SPACE.id, input.id), eq(SPACE.userId, userId)));
    }),
  getWall: publicProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ input }) => {
      console.log(`Fetching wall data for space: ${input.spaceId}`);

      const space = await db.query.SPACE.findFirst({
        where: (table, { eq }) => eq(table.id, input.spaceId),
        with: {
          testimonials: {
            where: (table, { eq }) => eq(table.isPublished, true),
            orderBy: (table, { desc }) => desc(table.createdAt),
          },
        },
      });

      if (!space) {
        console.error(`Space not found: ${input.spaceId}`);
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return space;
    }),

  /**
   * Fetches public data needed for the Testimonial Collector widget/page
   */
  getCollectorConfig: publicProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ input }) => {
      const space = await db.query.SPACE.findFirst({
        where: (table, { eq }) => eq(table.id, input.spaceId),
        columns: {
          name: true,
          logo: true,
          customMessage: true,
        },
      });

      console.log("space", space);

      if (!space) {
        console.error(`Collector Config: Space not found: ${input.spaceId}`);
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return space;
    }),
  publishTestimonial: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const testimonial = await db.query.TESTIMONIAL.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
      });
      if (!testimonial) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const [updatedTestimonial] = await db
        .update(TESTIMONIAL)
        .set({
          isPublished: true,
        })
        .where(and(eq(TESTIMONIAL.id, input.id)))
        .returning();
      console.log("Updated testimonial", updatedTestimonial);
      return updatedTestimonial;
    }),
});

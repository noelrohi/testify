import { env } from "@/env";
import { db } from "@/server/db"; // Import db
import { TESTIMONIAL } from "@/server/db/schema/space"; // Import TESTIMONIAL schema
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { and, eq } from "drizzle-orm"; // Import necessary drizzle functions
import { handle } from "hono/vercel";

export const runtime = "nodejs";

// Schema for the query parameter 'spaceId'
const QuerySchema = z.object({
  spaceId: z
    .string()
    .min(1, "Space ID cannot be empty.")
    .openapi({
      param: {
        name: "spaceId",
        in: "query", // Specify parameter is in query
      },
      example: "clxkzq8e00000qzj9f9f9f9f9", // Example CUID
      description: "The ID of the space to retrieve testimonials for.",
    }),
});

// Schema for a single testimonial, matching the database structure
const TestimonialSchema = z
  .object({
    id: z.string().openapi({ example: "clxkzq8e00000qzj9f9f9f9f9" }),
    authorName: z.string().openapi({ example: "John Doe" }),
    text: z.string().openapi({ example: "This product is amazing!" }),
    socialUrl: z
      .string()
      .url()
      .openapi({ example: "https://twitter.com/johndoe" }),
    imageUrl: z
      .string()
      .url()
      .nullable()
      .openapi({ example: "https://example.com/avatar.jpg" }),
    createdAt: z.date().openapi({ example: "2024-01-01T12:00:00Z" }), // Representing timestamp as date for Zod
    updatedAt: z.date().openapi({ example: "2024-01-01T12:00:00Z" }),
    isPublished: z.boolean().openapi({ example: true }),
    spaceId: z.string().openapi({ example: "clxkzq8e00000qzj9f9f9f9f9" }),
  })
  .openapi("Testimonial");

// Schema for the successful response body
const TestimonialsResponseSchema = z
  .object({
    testimonials: z.array(TestimonialSchema).openapi("TestimonialsList"),
  })
  .openapi("TestimonialsResponse");

// Schema for error responses
const ErrorSchema = z.object({
  error: z.string().openapi({ example: "Database error" }),
});

// Define the route for getting testimonials
const getTestimonialsRoute = createRoute({
  method: "get",
  path: "/testimonials", // Path relative to basePath
  request: {
    query: QuerySchema, // Use query schema here
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TestimonialsResponseSchema,
        },
      },
      description:
        "Successfully retrieved published testimonials for the space.",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Bad Request - Invalid or missing spaceId.",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal Server Error.",
    },
  },
  tags: ["Testimonials"], // Add tags for OpenAPI documentation grouping
});

const app = new OpenAPIHono().basePath("/api");

app.openapi(getTestimonialsRoute, async (c) => {
  const { spaceId } = c.req.valid("query"); // Get validated spaceId from query

  try {
    const testimonials = await db.query.TESTIMONIAL.findMany({
      where: and(
        eq(TESTIMONIAL.spaceId, spaceId),
        eq(TESTIMONIAL.isPublished, true),
      ),
      orderBy: (table, { desc }) => desc(table.createdAt),
    });

    return c.json({ testimonials }, 200);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    // Use the defined error schema
    return c.json(
      {
        error: `Failed to retrieve testimonials: ${message}`,
      },
      500, // Explicitly set status code
    );
  }
});

// The OpenAPI documentation will be available at /api/doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Testify API", // Updated title
    description: "API for managing Testify spaces and testimonials.", // Added description
  },
  servers: [
    {
      url: `${env.NEXT_PUBLIC_APP_URL}`,
      description: "Current environment",
    },
  ],
});

app.get("/reference", Scalar({ url: "/api/doc" }));

export const GET = handle(app);
export const POST = handle(app); // Keep POST in case other methods are added later

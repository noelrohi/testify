import { env } from "@/env";
import { ratelimit } from "@/lib/ratelimit";
import { db } from "@/server/db";
import { TESTIMONIAL } from "@/server/db/schema/space";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { and, eq } from "drizzle-orm";
import { handle } from "hono/vercel";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import jsonContent from "stoker/openapi/helpers/json-content";
import jsonContentRequired from "stoker/openapi/helpers/json-content-required";
import createMessageObjectSchema from "stoker/openapi/schemas/create-message-object";
import { cors } from "hono/cors";

export const runtime = "nodejs";

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
    position: z.string().nullish().openapi({ example: "CEO" }),
    companyName: z.string().nullish().openapi({ example: "Acme Inc." }),
    createdAt: z.date().openapi({ example: "2024-01-01T12:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2024-01-01T12:00:00Z" }),
    isPublished: z.boolean().openapi({ example: true }),
    spaceId: z.string().openapi({ example: "clxkzq8e00000qzj9f9f9f9f9" }),
  })
  .openapi("Testimonial");

// Schema for creating a new testimonial (request body)
const CreateTestimonialSchema = z
  .object({
    authorName: z
      .string()
      .min(1, "Author name cannot be empty.")
      .openapi({ example: "Jane Doe" }),
    text: z
      .string()
      .min(1, "Testimonial text cannot be empty.")
      .openapi({ example: "Absolutely fantastic!" }),
    socialUrl: z
      .string()
      .url("Invalid social URL.")
      .openapi({ example: "https://linkedin.com/in/janedoe" }),
    imageUrl: z
      .string()
      .url("Invalid image URL.")
      .nullable()
      .openapi({ example: "https://example.com/avatar_jane.jpg" }),
    position: z.string().nullish().openapi({ example: "CTO" }),
    companyName: z.string().nullish().openapi({ example: "Innovate Corp" }),
  })
  .openapi("CreateTestimonialPayload");

// Schema for the successful response body for GET /testimonials
const TestimonialsResponseSchema = z
  .object({
    testimonials: z.array(TestimonialSchema).openapi("TestimonialsList"),
  })
  .openapi("TestimonialsResponse");

// Standardized error schema using stoker
const StandardErrorSchema =
  createMessageObjectSchema().openapi("StandardError");

// Schema for a rate limit error response
const RateLimitErrorSchema = createMessageObjectSchema(
  HttpStatusPhrases.TOO_MANY_REQUESTS,
).openapi("RateLimitError");

// Define the route for getting testimonials
const getTestimonialsRoute = createRoute({
  method: "get",
  path: "/testimonials",
  request: {
    query: z.object({
      spaceId: z.string().min(1, "Space ID cannot be empty."),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      TestimonialsResponseSchema,
      "Successfully retrieved published testimonials for the space.",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      StandardErrorSchema,
      `${HttpStatusPhrases.BAD_REQUEST} - Invalid or missing spaceId.`,
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      StandardErrorSchema,
      HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    ),
  },
  tags: ["Testimonials"],
});

// Define the route for creating a testimonial
const createTestimonialRoute = createRoute({
  method: "post",
  path: "/testimonials/{spaceId}",
  request: {
    params: z.object({
      spaceId: z.string().openapi({
        description:
          "Identifier of the space to which the testimonial will be added.",
        example: "clxkzq8e00000qzj9f9f9f9f9",
      }),
    }),
    body: jsonContentRequired(
      CreateTestimonialSchema,
      "Data for the new testimonial.",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      TestimonialSchema,
      "Successfully created testimonial.",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      StandardErrorSchema,
      `${HttpStatusPhrases.BAD_REQUEST} - Invalid input data.`,
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
      RateLimitErrorSchema,
      HttpStatusPhrases.TOO_MANY_REQUESTS,
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      StandardErrorSchema,
      HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    ),
  },
  tags: ["Testimonials"],
});

const app = new OpenAPIHono().basePath("/api");

app.use("/api/*", cors());

app.openapi(getTestimonialsRoute, async (c) => {
  const { spaceId } = c.req.valid("query");

  try {
    const testimonials = await db.query.TESTIMONIAL.findMany({
      where: and(
        eq(TESTIMONIAL.spaceId, spaceId),
        eq(TESTIMONIAL.isPublished, true),
      ),
      orderBy: (table, { desc }) => desc(table.createdAt),
    });

    return c.json({ testimonials }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    return c.json(
      {
        message: `Failed to retrieve testimonials: ${message}`,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

// Handler for creating a testimonial
app.openapi(createTestimonialRoute, async (c) => {
  const { spaceId } = c.req.param();
  const testimonialData = c.req.valid("json");

  // Rate limiting
  const ip =
    c.req.header("x-forwarded-for") ||
    c.req.header("cf-connecting-ip") ||
    c.req.raw.headers.get("REMOTE_ADDR") ||
    "anonymous";
  const { success, limit, remaining, reset } = await ratelimit.limit(
    `testimonial_creation_ip:${ip}`,
  );

  if (!success) {
    return c.json(
      {
        message: HttpStatusPhrases.TOO_MANY_REQUESTS,
      },
      HttpStatusCodes.TOO_MANY_REQUESTS,
    );
  }

  try {
    const newTestimonial = await db
      .insert(TESTIMONIAL)
      .values({
        ...testimonialData,
        spaceId,
        isPublished: false,
      })
      .returning()
      .then((res) => res[0]);

    if (!newTestimonial) {
      return c.json(
        { message: "Failed to create testimonial record." },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json(newTestimonial, HttpStatusCodes.CREATED);
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    return c.json(
      {
        message: `Failed to create testimonial: ${message}`,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

// The OpenAPI documentation will be available at /api/doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Testify API",
    description: "API for managing Testify spaces and testimonials.",
  },
  servers: [
    {
      url: `${env.NEXT_PUBLIC_APP_URL}`,
      description: "Production environment",
    },
    {
      url: "http://localhost:3000",
      description: "Local environment",
    },
  ],
});

app.get("/reference", Scalar({ url: "/api/doc" }));

export const GET = handle(app);
export const POST = handle(app);

import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const TESTIMONIAL = pgTable(
  "testimonial",
  {
    id: text("id").primaryKey().default(createId()),
    authorName: text("author_name").notNull(),
    text: text("text").notNull(),
    socialUrl: text("social_url").notNull(),
    photoBase64: text("photo_base64").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    published: boolean("published").notNull().default(false),
    spaceId: text("space_id")
      .notNull()
      .references(() => SPACE.id),
  },
  (t) => [index("space_id_idx").on(t.spaceId)],
);

export const TESTIMONIAL_RELATIONS = relations(TESTIMONIAL, ({ one }) => ({
  space: one(SPACE, {
    fields: [TESTIMONIAL.spaceId],
    references: [SPACE.id],
  }),
}));

export const SPACE = pgTable(
  "space",
  {
    id: text("id").primaryKey().default(createId()),
    name: text("name").notNull(),
    customMessage: text("custom_message").notNull(),
    logo: text("logo"),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [index("user_id_idx").on(table.userId)],
);

export const SPACE_RELATIONS = relations(SPACE, ({ many }) => ({
  testimonials: many(TESTIMONIAL),
}));

export type Space = typeof SPACE.$inferSelect;
export type Testimonial = typeof TESTIMONIAL.$inferSelect;

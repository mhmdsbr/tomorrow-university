import { pgTable, text } from "drizzle-orm/pg-core";

export const milestones = pgTable("milestones", {
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

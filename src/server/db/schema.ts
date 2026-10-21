import { integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import type { MilestoneStep, ScenarioAssignment } from "../shared/milestones";

export const milestones = pgTable("milestones", {
  title: text("title").notNull(),
  description: text("description").notNull(),
  topicTitle: text("topic_title"),
  topicDescription: text("topic_description"),
  steps: jsonb("steps").$type<MilestoneStep[]>(),
  pathwayMilestoneId: integer("pathway_milestone_id"),
  duration: text("duration"),
  learningOutcomes: jsonb("learning_outcomes").$type<string[]>(),
  scenarioAssignment: jsonb("scenario_assignment").$type<ScenarioAssignment>(),
  pathwayGroupId: uuid("pathway_group_id"),
  pathwayOptionId: integer("pathway_option_id"),
  pathwayTitle: text("pathway_title"),
  pathwayFocus: text("pathway_focus"),
  pathwayDescription: text("pathway_description"),
});

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

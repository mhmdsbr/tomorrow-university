ALTER TABLE "milestones" ADD COLUMN "pathway_milestone_id" integer;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "learning_outcomes" jsonb;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "scenario_assignment" jsonb;
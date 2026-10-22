import { z } from "zod";

export const topicSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
});

export const LEARNING_DOMAINS = [
  "Entrepreneurship & Innovation",
  "Business & Leadership",
  "Technology & AI",
  "Sustainability",
] as const;

export const learningDomainSchema = z.enum(LEARNING_DOMAINS);

export const LEARNING_DOMAIN_HINTS: Record<
  (typeof LEARNING_DOMAINS)[number],
  string
> = {
  "Entrepreneurship & Innovation":
    "Startups, opportunity discovery, customer validation, business models, innovation strategy.",
  "Business & Leadership":
    "Organizations, management, strategy, leadership, teams, change, and performance.",
  "Technology & AI":
    "Software, data, AI and digital systems: how they work, are designed, and are used responsibly.",
  Sustainability:
    "Climate, environment, resources, circular economy, social impact, and sustainable transitions.",
};

export const domainFitSchema = z.object({
  matches: z.boolean(),
  suggested_domain: learningDomainSchema,
  reason: z.string().trim().min(1).max(500),
});

export const pathwayTopicSchema = topicSchema.extend({
  domain: learningDomainSchema,
});

export const milestoneStepSchema = topicSchema.extend({
  order: z.number().int().min(1).max(5),
});

export const scenarioAssignmentSchema = z.object({
  title: topicSchema.shape.title,
  scenario: topicSchema.shape.description,
  task: topicSchema.shape.description,
  student_output: topicSchema.shape.description,
});

export const milestoneResourceSchema = z
  .object({
    title: topicSchema.shape.title,
    author_or_publisher: topicSchema.shape.title,
  })
  .strict();

export const milestoneSchema = topicSchema
  .extend({
    id: z.number().int().min(1).max(5),
    learning_outcomes: z.array(topicSchema.shape.description).min(2).max(3),
    steps: z.array(milestoneStepSchema).min(3).max(5),
    resources: z.array(milestoneResourceSchema).min(1).max(2),
    scenario_assignment: scenarioAssignmentSchema,
  })
  .refine(
    (milestone) =>
      milestone.steps.every((step, index) => step.order === index + 1),
    {
      message: "Steps must be ordered consecutively starting at 1.",
    },
  );

export type MilestoneTopic = z.infer<typeof topicSchema>;
export type LearningDomain = z.infer<typeof learningDomainSchema>;
export type PathwayTopic = z.infer<typeof pathwayTopicSchema>;
export type DomainFit = z.infer<typeof domainFitSchema>;
export type MilestoneStep = z.infer<typeof milestoneStepSchema>;
export type LearningMilestone = z.infer<typeof milestoneSchema>;
export type ScenarioAssignment = z.infer<typeof scenarioAssignmentSchema>;
export type MilestoneResource = z.infer<typeof milestoneResourceSchema>;

export const learningPathwaySchema = topicSchema
  .extend({
    id: z.number().int().min(1).max(3),
    focus: topicSchema.shape.description,
    milestones: z.array(milestoneSchema).min(3).max(5),
  })
  .refine(
    (pathway) =>
      pathway.milestones.every(
        (milestone, index) => milestone.id === index + 1,
      ),
    {
      message: "Milestones must be sequential within each pathway.",
    },
  );

export const pathwaySuggestionsSchema = z
  .object({
    topic: topicSchema,
    duration: z.literal("3 months"),
    domain_fit: domainFitSchema,
    pathway_options: z.array(learningPathwaySchema).length(3),
  })
  .refine(
    (draft) =>
      draft.pathway_options.every((pathway, index) => pathway.id === index + 1),
    {
      message: "Exactly three ordered pathway options are required.",
    },
  );

export const pathwaySaveSchema = z.object({
  topic: pathwayTopicSchema,
  duration: z.literal("3 months"),
  pathway: learningPathwaySchema,
});

export type LearningPathway = z.infer<typeof learningPathwaySchema>;
export type PathwaySuggestions = z.infer<typeof pathwaySuggestionsSchema>;
export type PathwaySaveInput = z.infer<typeof pathwaySaveSchema>;

import { z } from "zod";
import { topicSchema } from "../../server/shared/milestones";

export const MILESTONE_SESSION_KEY = "learning-studio:milestone-session:v1";

const editableTextSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(5000),
});
const editableScenarioSchema = z.object({
  title: z.string().max(200),
  scenario: z.string().max(5000),
  task: z.string().max(5000),
  student_output: z.string().max(5000),
});
const editableMilestoneSchema = editableTextSchema.extend({
  id: z.number().int().min(1).max(5),
  learning_outcomes: z.array(z.string().max(5000)).min(2).max(3),
  steps: z
    .array(
      editableTextSchema.extend({
        order: z.number().int().min(1).max(5),
      }),
    )
    .min(3)
    .max(5),
  scenario_assignment: editableScenarioSchema,
});
const indices = z
  .array(z.number().int().min(0).max(4))
  .max(5)
  .refine((values) => new Set(values).size === values.length);

const sessionFields = {
  topicInput: editableTextSchema,
  draftTopic: topicSchema.nullable(),
  saved: indices,
  selected: indices,
  editing: indices,
};

const previousSessionSchema = z
  .object({
    ...sessionFields,
    version: z.literal(2),
    draft: z
      .object({
        topic: topicSchema,
        duration: z.literal("3 months"),
        milestones: z.array(editableMilestoneSchema).min(3).max(5),
      })
      .nullable(),
  })
  .refine((state) => {
    if (!state.draft) {
      return (
        state.draftTopic === null &&
        state.saved.length + state.selected.length + state.editing.length === 0
      );
    }
    const count = state.draft.milestones.length;
    return (
      state.draftTopic !== null &&
      [...state.saved, ...state.selected, ...state.editing].every(
        (index) => index < count,
      ) &&
      !state.saved.some(
        (index) =>
          state.selected.includes(index) || state.editing.includes(index),
      ) &&
      state.draft.milestones.every(
        (milestone, index) =>
          milestone.id === index + 1 &&
          milestone.steps.every(
            (step, position) => step.order === position + 1,
          ),
      )
    );
  });

const legacySessionSchema = z.object({
  ...sessionFields,
  version: z.literal(1),
  draft: z
    .object({
      milestones: z
        .array(
          editableTextSchema.extend({
            steps: z.array(editableTextSchema).min(3).max(5),
          }),
        )
        .length(3),
    })
    .nullable(),
});

function restorePreviousSession(input: unknown) {
  const current = previousSessionSchema.safeParse(input);
  if (current.success) return { state: current.data, migrated: false };
  const legacy = legacySessionSchema.parse(input);
  const state = previousSessionSchema.parse({
    ...legacy,
    version: 2,
    draft: legacy.draft
      ? {
          topic: legacy.draftTopic,
          duration: "3 months",
          milestones: legacy.draft.milestones.map((milestone, index) => ({
            ...milestone,
            id: index + 1,
            learning_outcomes: ["", ""],
            steps: milestone.steps.map((step, position) => ({
              ...step,
              order: position + 1,
            })),
            scenario_assignment: {
              title: "",
              scenario: "",
              task: "",
              student_output: "",
            },
          })),
        }
      : null,
  });
  return { state, migrated: true };
}

const editablePathwaySchema = editableTextSchema.extend({
  id: z.number().int().min(1).max(3),
  focus: z.string().max(5000),
  milestones: z.array(editableMilestoneSchema).min(3).max(5),
});

export const milestoneSessionSchema = z
  .object({
    version: z.literal(3),
    topicInput: editableTextSchema,
    draftTopic: topicSchema.nullable(),
    draft: z
      .object({
        topic: topicSchema,
        duration: z.literal("3 months"),
        pathway_options: z.array(editablePathwaySchema).min(1).max(3),
      })
      .nullable(),
    selectedPathwayId: z.number().int().min(1).max(3).nullable(),
    saved: z.boolean(),
    editing: indices,
    legacy: z.boolean(),
  })
  .refine((state) => {
    if (!state.draft)
      return (
        state.draftTopic === null &&
        state.selectedPathwayId === null &&
        !state.saved &&
        state.editing.length === 0 &&
        !state.legacy
      );
    const options = state.draft.pathway_options;
    const chosen = options.find(
      (option) => option.id === state.selectedPathwayId,
    );
    return (
      state.draftTopic !== null &&
      (state.legacy ? options.length === 1 : options.length === 3) &&
      options.every(
        (option, index) =>
          option.id === index + 1 &&
          option.milestones.every(
            (milestone, position) =>
              milestone.id === position + 1 &&
              milestone.steps.every(
                (step, stepIndex) => step.order === stepIndex + 1,
              ),
          ),
      ) &&
      (state.selectedPathwayId === null || chosen !== undefined) &&
      (!state.saved || (chosen !== undefined && state.editing.length === 0)) &&
      state.editing.every(
        (index) => chosen !== undefined && index < chosen.milestones.length,
      )
    );
  });

export function restoreMilestoneSession(input: unknown) {
  const current = milestoneSessionSchema.safeParse(input);
  if (current.success) return { state: current.data, migrated: false };
  const { state: previous } = restorePreviousSession(input);
  const state = milestoneSessionSchema.parse({
    version: 3,
    topicInput: previous.topicInput,
    draftTopic: previous.draftTopic,
    draft: previous.draft
      ? {
          topic: previous.draft.topic,
          duration: previous.draft.duration,
          pathway_options: [
            {
              id: 1,
              title: previous.draft.topic.title,
              focus: "Previous single-pathway draft",
              description: previous.draft.topic.description,
              milestones: previous.draft.milestones,
            },
          ],
        }
      : null,
    selectedPathwayId: previous.draft ? 1 : null,
    saved: previous.saved.length > 0,
    editing: previous.saved.length > 0 ? [] : previous.editing,
    legacy: previous.draft !== null,
  });
  return { state, migrated: true };
}

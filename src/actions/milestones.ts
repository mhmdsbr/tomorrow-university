"use server";

import { insertMilestones } from "@/server/repos/milestones";
import { generateMilestones } from "@/server/services/milestone-generation";
import {
  pathwaySaveSchema,
  topicSchema,
  type PathwaySuggestions,
  type LearningPathway,
  type MilestoneTopic,
} from "@/server/shared/milestones";

type ActionResult =
  | { success: true; draft: PathwaySuggestions; topic: MilestoneTopic }
  | { success: false; message: string };

export async function generateMilestoneDraft(
  formData: FormData,
): Promise<ActionResult> {
  const topic = topicSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!topic.success) {
    return {
      success: false,
      message:
        "Enter a topic title (1-200 characters) and description (1-5000 characters).",
    };
  }

  try {
    const draft = await generateMilestones(topic.data);
    return { success: true, draft, topic: topic.data };
  } catch (error) {
    console.error("Failed to generate milestone draft:", error);
    return {
      success: false,
      message:
        "Could not generate three pathway suggestions. Check the server's AI provider configuration and try again. Nothing was saved.",
    };
  }
}

export async function saveMilestoneDraft(
  input: unknown,
): Promise<
  | { success: true; pathway: LearningPathway }
  | { success: false; message: string }
> {
  const draft = pathwaySaveSchema.safeParse(input);

  if (!draft.success) {
    return {
      success: false,
      message:
        "Choose one complete pathway with 3-5 sequential milestones. Each milestone needs 2-3 outcomes, 3-5 ordered steps, and one complete scenario assignment.",
    };
  }

  try {
    await insertMilestones(
      draft.data.pathway,
      draft.data.topic,
      draft.data.duration,
    );
    return {
      success: true,
      pathway: draft.data.pathway,
    };
  } catch (error) {
    console.error("Failed to save approved milestones:", error);
    return {
      success: false,
      message:
        "Could not save the pathway. Your draft is still available. Please try again.",
    };
  }
}

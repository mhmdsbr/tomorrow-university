"use server";

import { insertMilestones } from "@/server/repos/milestones";
import { generateMilestones } from "@/server/services/milestone-generation";
import {
  milestoneSelectionSchema,
  milestoneSchema,
  type MilestoneDraft,
} from "@/server/shared/milestones";

type ActionResult =
  | { success: true; draft: MilestoneDraft }
  | { success: false; message: string };

export async function generateMilestoneDraft(
  formData: FormData,
): Promise<ActionResult> {
  const topic = milestoneSchema.safeParse({
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
    return { success: true, draft };
  } catch (error) {
    console.error("Failed to generate milestone draft:", error);
    return {
      success: false,
      message:
        "Could not generate three milestones. Check the server's Gemini configuration and try again. Nothing was saved.",
    };
  }
}

export async function saveMilestoneDraft(
  input: unknown,
): Promise<ActionResult> {
  const draft = milestoneSelectionSchema.safeParse(input);

  if (!draft.success) {
    return {
      success: false,
      message:
        "Select one to three milestones, each with a title (1-200 characters) and description (1-5000 characters).",
    };
  }

  try {
    await insertMilestones(draft.data.milestones);
    return { success: true, draft: draft.data };
  } catch (error) {
    console.error("Failed to save approved milestones:", error);
    return {
      success: false,
      message:
        "Could not save the milestones. Your draft is still available. Please try again.",
    };
  }
}

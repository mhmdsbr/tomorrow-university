"use server";

import { insertMilestone } from "@/server/repos/milestones";

export type MilestoneFormState = {
  status: "idle" | "error" | "success";
  message: string;
  values: { title: string; description: string };
};

export async function createMilestone(
  _previousState: MilestoneFormState,
  formData: FormData,
): Promise<MilestoneFormState> {
  const title = formData.get("title");
  const description = formData.get("description");
  const values = {
    title: typeof title === "string" ? title.trim() : "",
    description: typeof description === "string" ? description.trim() : "",
  };

  if (!values.title || !values.description) {
    return {
      status: "error",
      message: "Please enter both a title and a description.",
      values,
    };
  }

  try {
    await insertMilestone(values);
  } catch (error) {
    console.error("Failed to create milestone:", error);
    return {
      status: "error",
      message: "Could not save the milestone. Please try again.",
      values,
    };
  }

  return {
    status: "success",
    message: "Milestone saved.",
    values: { title: "", description: "" },
  };
}

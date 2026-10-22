import { db, milestones } from "@/server/db";
import { randomUUID } from "node:crypto";
import type {
  LearningPathway,
  MilestoneTopic,
} from "@/shared/milestones";

export async function insertMilestones(
  pathway: LearningPathway,
  topic: MilestoneTopic,
  duration: "3 months",
) {
  const pathwayGroupId = randomUUID();
  await db.insert(milestones).values(
    pathway.milestones.map((milestone) => ({
      title: milestone.title,
      description: milestone.description,
      steps: milestone.steps,
      pathwayMilestoneId: milestone.id,
      learningOutcomes: milestone.learning_outcomes,
      resources: milestone.resources,
      scenarioAssignment: milestone.scenario_assignment,
      duration,
      topicTitle: topic.title,
      topicDescription: topic.description,
      pathwayOptionId: pathway.id,
      pathwayTitle: pathway.title,
      pathwayFocus: pathway.focus,
      pathwayDescription: pathway.description,
      pathwayGroupId,
    })),
  );
}

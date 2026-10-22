import { db, milestones } from "@/server/db";
import { randomUUID } from "node:crypto";
import type {
  LearningPathway,
  PathwayTopic,
} from "@/shared/milestones";

export async function insertMilestones(
  pathway: LearningPathway,
  topic: PathwayTopic,
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
      topicDomain: topic.domain,
      pathwayOptionId: pathway.id,
      pathwayTitle: pathway.title,
      pathwayFocus: pathway.focus,
      pathwayDescription: pathway.description,
      pathwayGroupId,
    })),
  );
}

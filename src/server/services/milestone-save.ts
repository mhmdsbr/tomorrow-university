import { insertMilestones } from "@/server/repos/milestones";
import type { PathwaySaveInput } from "@/shared/milestones";

export async function saveChosenPathway({
  pathway,
  topic,
  duration,
}: PathwaySaveInput): Promise<void> {
  await insertMilestones(pathway, topic, duration);
}

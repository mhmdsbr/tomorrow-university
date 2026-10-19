import { db, milestones } from "@/server/db";
import type { NewMilestone } from "@/server/db/schema";

export async function insertMilestones(draft: NewMilestone[]) {
  await db.insert(milestones).values(draft);
}

import { db, milestones } from "@/server/db";
import type { NewMilestone } from "@/server/db/schema";

export async function insertMilestone(milestone: NewMilestone) {
  await db.insert(milestones).values(milestone);
}

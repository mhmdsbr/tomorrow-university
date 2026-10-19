import { z } from "zod";

export const milestoneSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
});

export const milestoneDraftSchema = z.object({
  milestones: z.array(milestoneSchema).length(3),
});

export type MilestoneDraft = z.infer<typeof milestoneDraftSchema>;

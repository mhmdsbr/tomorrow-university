import type { MilestoneDraft } from "../../server/shared/milestones";
import { Heading } from "../atoms";
import FormField from "./FormField";

export type MilestoneField = "title" | "description";

interface MilestoneCardProps {
  milestone: MilestoneDraft["milestones"][number];
  index: number;
  onEdit: (index: number, field: MilestoneField, value: string) => void;
}

export default function MilestoneCard({
  milestone,
  index,
  onEdit,
}: MilestoneCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-400 p-4">
      <Heading as="h2" size="inherit" color="inherit" weight="semibold">
        Milestone {index + 1}
      </Heading>
      <FormField
        label="Title"
        id={`milestone-title-${index}`}
        value={milestone.title}
        onChange={(event) => onEdit(index, "title", event.target.value)}
        required
        maxLength={200}
      />
      <FormField
        multiline
        label="Description"
        id={`milestone-description-${index}`}
        value={milestone.description}
        onChange={(event) => onEdit(index, "description", event.target.value)}
        required
        maxLength={5000}
        rows={4}
      />
    </div>
  );
}

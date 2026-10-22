import type { FormEventHandler } from "react";
import type {
  LearningMilestone,
  LearningPathway,
} from "../../shared/milestones";
import { Button, Typography } from "../atoms";
import MilestoneCard from "./MilestoneCard";

interface DraftReviewProps {
  pathway: LearningPathway;
  saved: boolean;
  editing: number[];
  pending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onEdit: (index: number, milestone: LearningMilestone) => void;
  onToggleEdit: (index: number) => void;
}

export default function DraftReview({
  pathway,
  saved,
  editing,
  pending,
  onSubmit,
  onEdit,
  onToggleEdit,
}: DraftReviewProps) {

  
  return (
    <form onSubmit={onSubmit} method="post" data-draft-review>
      <fieldset
        disabled={pending || saved}
        className="flex min-w-0 flex-col gap-6"
      >
        <legend className="mb-2 text-2xl font-semibold tracking-tight">
          {saved ? "Your saved pathway" : pathway.title}
        </legend>
        <Typography size="sm" color="inherit" leading="relaxed">
          {saved
            ? "Your chosen pathway and all its milestones have been saved."
            : "Complete these milestones in order. Each builds on the previous work. Use Edit to refine details; saving keeps the whole pathway."}
        </Typography>
        <ol
          aria-label="Sequential milestones"
          className="grid min-w-0 gap-5 lg:grid-cols-2"
        >
          {pathway.milestones.map((milestone, index) => (
            <li key={milestone.id} className="min-w-0">
              <MilestoneCard
                milestone={milestone}
                index={index}
                saved={saved}
                editing={editing.includes(index)}
                pending={pending}
                onEdit={onEdit}
                onToggleEdit={onToggleEdit}
              />
            </li>
          ))}
        </ol>
        {!saved && (
          <Button variant="solid" type="submit" disabled={pending}>
            {pending
              ? "Saving..."
              : `Save chosen pathway (${pathway.milestones.length} milestones)`}
          </Button>
        )}
      </fieldset>
    </form>
  );
}

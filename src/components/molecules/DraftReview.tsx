import type { FormEventHandler } from "react";
import type {
  LearningMilestone,
  LearningPathway,
} from "../../shared/milestones";
import { Button, LoadingSpinner, Typography } from "../atoms";
import MilestoneCard from "./MilestoneCard";

interface DraftReviewProps {
  pathway: LearningPathway;
  saved: boolean;
  editing: number[];
  pending: boolean;
  saving?: boolean;
  expanded: number | null;
  onToggleExpand: (index: number) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onEdit: (index: number, milestone: LearningMilestone) => void;
  onToggleEdit: (index: number) => void;
}

export default function DraftReview({
  pathway,
  saved,
  editing,
  pending,
  saving = false,
  expanded,
  onToggleExpand,
  onSubmit,
  onEdit,
  onToggleEdit,
}: DraftReviewProps) {
  return (
    <form onSubmit={onSubmit} method="post" data-draft-review>
      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4">
        <legend className="mb-1 text-xl font-semibold tracking-tight">
          {saved ? "Your saved pathway" : pathway.title}
        </legend>
        <Typography size="sm" color="inherit" leading="relaxed">
          {saved
            ? "Your chosen pathway and all its milestones have been saved."
            : "Milestones build on each other in order. Open one to review its steps; use Edit to refine it."}
        </Typography>
        <ol
          aria-label="Sequential milestones"
          className="flex min-w-0 flex-col gap-3"
        >
          {pathway.milestones.map((milestone, index) => (
            <li key={milestone.id} className="min-w-0">
              <MilestoneCard
                milestone={milestone}
                index={index}
                saved={saved}
                editing={editing.includes(index)}
                pending={pending}
                expanded={expanded === index}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onToggleEdit={onToggleEdit}
              />
            </li>
          ))}
        </ol>
        {!saved && (
          <div
            data-save-bar
            className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-white/95 p-3 pl-5 shadow-[0_12px_40px_-20px_rgba(66,20,183,0.45)] backdrop-blur dark:border-brand-800 dark:bg-brand-950/95"
          >
            <span className="text-sm text-brand-700 dark:text-brand-300">
              Option 0{pathway.id} · {pathway.milestones.length} milestones
            </span>
            <Button variant="solid" type="submit" disabled={pending}>
              {saving && <LoadingSpinner size="sm" />}
              {saving
                ? "Saving..."
                : `Save chosen pathway (${pathway.milestones.length} milestones)`}
            </Button>
          </div>
        )}
      </fieldset>
    </form>
  );
}

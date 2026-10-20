import type { FormEventHandler } from "react";
import type { MilestoneDraft } from "../../server/shared/milestones";
import { Button, Typography } from "../atoms";
import MilestoneCard, { type MilestoneField } from "./MilestoneCard";

interface DraftReviewProps {
  draft: MilestoneDraft;
  selected: number[];
  saved: number[];
  editing: number[];
  pending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onEdit: (index: number, field: MilestoneField, value: string) => void;
  onSelect: (index: number) => void;
  onToggleEdit: (index: number) => void;
  onDiscard: () => void;
}

export default function DraftReview({
  draft,
  selected,
  saved,
  editing,
  pending,
  onSubmit,
  onEdit,
  onSelect,
  onToggleEdit,
  onDiscard,
}: DraftReviewProps) {
  const complete = saved.length === draft.milestones.length;

  return (
    <form onSubmit={onSubmit} method="post" data-draft-review>
      <fieldset
        disabled={pending || complete}
        className="flex min-w-0 flex-col gap-6"
      >
        <legend className="mb-2 text-2xl font-semibold tracking-tight">
          {complete ? "Your saved milestones" : "Make the journey yours"}
        </legend>
        <Typography size="sm" color="inherit" leading="relaxed">
          {complete
            ? "All three milestones have been saved. Start with a new topic whenever you are ready."
            : "Select the milestones you want to keep. Use Edit to refine a title or description before saving. Unselected cards stay as drafts."}
        </Typography>
        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {draft.milestones.map((milestone, index) => (
            <MilestoneCard
              key={index}
              milestone={milestone}
              index={index}
              selected={selected.includes(index)}
              saved={saved.includes(index)}
              editing={editing.includes(index)}
              pending={pending}
              onEdit={onEdit}
              onSelect={onSelect}
              onToggleEdit={onToggleEdit}
            />
          ))}
        </div>
        {!complete && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-900">
            <Typography size="sm" color="inherit">
              {selected.length} selected · {saved.length} saved
            </Typography>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="subtle" onClick={onDiscard} disabled={pending}>
                Discard unsaved drafts
              </Button>
              <Button
                variant="solid"
                type="submit"
                disabled={pending || selected.length === 0}
              >
                {pending ? "Working..." : `Save selected (${selected.length})`}
              </Button>
            </div>
          </div>
        )}
      </fieldset>
    </form>
  );
}

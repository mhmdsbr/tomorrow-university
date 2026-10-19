import type { FormEventHandler } from "react";
import type { MilestoneDraft } from "../../server/shared/milestones";
import { Button } from "../atoms";
import MilestoneCard, { type MilestoneField } from "./MilestoneCard";

interface DraftReviewProps {
  draft: MilestoneDraft;
  saved: boolean;
  pending: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onEdit: (index: number, field: MilestoneField, value: string) => void;
  onDiscard: () => void;
}

export default function DraftReview({
  draft,
  saved,
  pending,
  onSubmit,
  onEdit,
  onDiscard,
}: DraftReviewProps) {
  return (
    <form onSubmit={onSubmit} method="post">
      <fieldset disabled={pending || saved} className="flex flex-col gap-6">
        <legend className="mb-4 text-xl font-semibold">
          {saved ? "Saved milestones" : "Review your draft"}
        </legend>
        {draft.milestones.map((milestone, index) => (
          <MilestoneCard
            key={index}
            milestone={milestone}
            index={index}
            onEdit={onEdit}
          />
        ))}
        {!saved && (
          <div className="flex flex-wrap gap-3">
            <Button variant="solid" type="submit" disabled={pending}>
              {pending ? "Working..." : "Approve and save all three"}
            </Button>
            <Button variant="subtle" onClick={onDiscard} disabled={pending}>
              Discard draft
            </Button>
          </div>
        )}
      </fieldset>
    </form>
  );
}

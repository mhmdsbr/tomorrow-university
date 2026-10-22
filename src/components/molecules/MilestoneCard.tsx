import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { LearningMilestone } from "../../shared/milestones";
import { Button } from "../atoms";
import MilestoneAssignment from "./milestone-card/MilestoneAssignment";
import MilestoneOutcomes from "./milestone-card/MilestoneOutcomes";
import MilestoneResources from "./milestone-card/MilestoneResources";
import MilestoneSteps from "./milestone-card/MilestoneSteps";
import MilestoneSummary from "./milestone-card/MilestoneSummary";

gsap.registerPlugin(useGSAP);

interface MilestoneCardProps {
  milestone: LearningMilestone;
  index: number;
  editing: boolean;
  saved: boolean;
  pending: boolean;
  expanded: boolean;
  onToggleExpand: (index: number) => void;
  onToggleEdit: (index: number) => void;
  onEdit: (index: number, milestone: LearningMilestone) => void;
}

export default function MilestoneCard({
  milestone,
  index,
  editing,
  saved,
  pending,
  expanded,
  onToggleExpand,
  onToggleEdit,
  onEdit,
}: MilestoneCardProps) {
  // Editing keeps the card open so its required fields stay visible.
  const open = expanded || editing;
  const bodyId = `milestone-${index}-details`;
  const card = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          card.current,
          { scale: 0.99 },
          {
            scale: 1,
            duration: 0.25,
            ease: "power2.out",
          },
        );
      });
      return () => media.revert();
    },
    { scope: card },
  );

  const section = {
    milestone,
    index,
    editable: editing && !saved,
    onChange: (updated: LearningMilestone) => onEdit(index, updated),
  };

  return (
    <article
      ref={card}
      data-milestone-card
      className={`min-w-0 rounded-2xl border bg-white dark:bg-brand-950 ${
        open
          ? "border-brand-300 dark:border-brand-700"
          : "border-brand-100 dark:border-brand-800"
      }`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          disabled={editing}
          onClick={() => onToggleExpand(index)}
          className="flex w-full cursor-pointer items-start gap-4 rounded-2xl p-4 text-left focus-visible:outline-2 focus-visible:outline-brand-600 disabled:cursor-default sm:px-5"
        >
          <span className="mt-0.5 font-mono text-xs tracking-widest text-brand-700 dark:text-brand-300">
            0{index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold leading-snug wrap-break-word">
              {milestone.title}
            </span>
            <span className="mt-1 block text-xs text-brand-500 dark:text-brand-400">
              {milestone.steps.length} steps ·{" "}
              {milestone.learning_outcomes.length} outcomes ·{" "}
              {milestone.resources.length} readings · 1 assignment
              {saved && " · Saved"}
              {editing && " · Editing"}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`mt-0.5 text-brand-500 transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
      </h3>
      {open && (
        <div
          id={bodyId}
          className="border-t border-brand-100/70 px-5 pt-4 pb-5 sm:px-6 dark:border-brand-800"
        >
          <MilestoneSummary {...section} />
          <MilestoneOutcomes {...section} />
          <MilestoneSteps {...section} />
          <MilestoneResources {...section} />
          <MilestoneAssignment {...section} />
          {!saved && (
            <div className="mt-5 border-t border-brand-100/70 pt-4 dark:border-brand-800">
              <Button
                variant="subtle"
                disabled={pending}
                ariaLabel={`${editing ? "Done editing" : "Edit"} milestone ${index + 1}`}
                onClick={() => onToggleEdit(index)}
              >
                {editing ? "Done editing" : "Edit milestone"}
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

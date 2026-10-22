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
  onToggleEdit: (index: number) => void;
  onEdit: (index: number, milestone: LearningMilestone) => void;
}

export default function MilestoneCard({
  milestone,
  index,
  editing,
  saved,
  pending,
  onToggleEdit,
  onEdit,
}: MilestoneCardProps) {
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

  console.log(milestone);

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
      className="min-w-0 rounded-2xl border border-brand-100 bg-white p-5 sm:p-6 dark:border-brand-800 dark:bg-brand-950"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="font-mono text-xs tracking-widest text-brand-700 dark:text-brand-300">
          MILESTONE 0{index + 1}
        </span>
        <span className="text-xs text-brand-500">
          {saved ? "Saved" : "Sequential milestone"}
        </span>
      </div>
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
    </article>
  );
}

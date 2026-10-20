import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { MilestoneDraft } from "../../server/shared/milestones";
import { Button, Heading, Typography } from "../atoms";
import FormField from "./FormField";

gsap.registerPlugin(useGSAP);

export type MilestoneField = "title" | "description";

interface MilestoneCardProps {
  milestone: MilestoneDraft["milestones"][number];
  index: number;
  selected: boolean;
  editing: boolean;
  saved: boolean;
  pending: boolean;
  onSelect: (index: number) => void;
  onToggleEdit: (index: number) => void;
  onEdit: (index: number, field: MilestoneField, value: string) => void;
}

export default function MilestoneCard({
  milestone,
  index,
  selected,
  editing,
  saved,
  pending,
  onSelect,
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
          { scale: selected ? 0.985 : 1.01 },
          {
            scale: 1,
            duration: 0.25,
            ease: "power2.out",
          },
        );
      });
      return () => media.revert();
    },
    { scope: card, dependencies: [selected], revertOnUpdate: true },
  );

  return (
    <article
      ref={card}
      data-milestone-card
      className={`min-w-0 rounded-2xl border p-5 transition-colors sm:p-6 ${
        selected
          ? "border-emerald-600 bg-emerald-50/70 shadow-sm dark:bg-emerald-950/40"
          : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="font-mono text-xs tracking-widest text-emerald-700 dark:text-emerald-400">
          MILESTONE 0{index + 1}
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected}
            disabled={pending || saved}
            onChange={() => onSelect(index)}
            aria-label={`Select milestone ${index + 1}`}
            className="h-4 w-4 accent-emerald-700"
          />
          {saved ? "Saved" : "Select"}
        </label>
      </div>
      {editing && !saved ? (
        <div className="flex flex-col gap-4">
          <FormField
            label="Title"
            id={`milestone-title-${index}`}
            value={milestone.title}
            onChange={(event) => onEdit(index, "title", event.target.value)}
            required={selected}
            maxLength={200}
          />
          <FormField
            multiline
            label="Description"
            id={`milestone-description-${index}`}
            value={milestone.description}
            onChange={(event) =>
              onEdit(index, "description", event.target.value)
            }
            required={selected}
            maxLength={5000}
            rows={5}
          />
        </div>
      ) : (
        <div className="space-y-3 break-words">
          <Heading as="h2" size="lg" color="inherit" weight="semibold">
            {milestone.title}
          </Heading>
          <Typography size="sm" color="inherit" leading="relaxed">
            {milestone.description}
          </Typography>
        </div>
      )}
      {!saved && (
        <div className="mt-5 border-t border-stone-200/70 pt-4 dark:border-stone-700">
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

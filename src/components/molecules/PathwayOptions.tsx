import type { LearningPathway } from "../../server/shared/milestones";
import { Heading, Typography } from "../atoms";

interface PathwayOptionsProps {
  options: LearningPathway[];
  selectedId: number | null;
  disabled: boolean;
  onChoose: (id: number) => void;
}

export default function PathwayOptions({
  options,
  selectedId,
  disabled,
  onChoose,
}: PathwayOptionsProps) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-2 text-2xl font-semibold">
        Choose your learning pathway
      </legend>
      <Typography size="sm" color="inherit" spacing="bottomLarge">
        These are independent alternatives, not successive phases. Choose one
        three-month journey, then review its sequential milestones below.
      </Typography>
      <div className="grid gap-4 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.id}
            data-pathway-option
            className={`flex min-w-0 cursor-pointer flex-col gap-4 rounded-2xl border p-5 transition-colors ${
              option.id === selectedId
                ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40"
                : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
            }`}
          >
            <span className="flex items-center justify-between gap-3 text-xs font-semibold">
              OPTION 0{option.id}
              <input
                type="radio"
                name="pathway-choice"
                value={option.id}
                checked={option.id === selectedId}
                onChange={() => onChoose(option.id)}
                aria-label={`Choose pathway ${option.id}: ${option.title}`}
                className="h-4 w-4 accent-emerald-700"
              />
            </span>
            <Heading as="h2" size="lg" color="inherit" weight="semibold">
              {option.title}
            </Heading>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              {option.focus}
            </p>
            <Typography size="sm" color="inherit" leading="relaxed">
              {option.description}
            </Typography>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {option.milestones.length} sequential milestones · 3 months
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

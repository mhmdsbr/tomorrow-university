import type { LearningPathway } from "../../shared/milestones";
import { Typography } from "../atoms";

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
      <legend className="mb-1 text-lg font-semibold">
        Choose your learning pathway
      </legend>
      <Typography size="xs" color="inherit" spacing="bottomMedium">
        Three independent alternatives, not successive phases. Pick one.
      </Typography>
      <div className="brand-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <label
              key={option.id}
              data-pathway-option
              className={`flex w-[82%] min-w-0 shrink-0 cursor-pointer snap-start flex-col gap-2 rounded-2xl border p-4 transition-colors sm:w-[45%] lg:w-auto ${
                selected
                  ? "border-brand-600 bg-brand-50/70 dark:bg-brand-950/40"
                  : "border-brand-100 bg-white hover:border-brand-300 dark:border-brand-800 dark:bg-brand-950"
              }`}
            >
              <span className="flex items-center justify-between gap-3 text-xs font-semibold">
                OPTION 0{option.id}
                <input
                  type="radio"
                  name="pathway-choice"
                  value={option.id}
                  checked={selected}
                  onChange={() => onChoose(option.id)}
                  aria-label={`Choose pathway ${option.id}: ${option.title}`}
                  className="h-4 w-4 accent-brand-700"
                />
              </span>
              <h2 className="text-base font-semibold leading-snug">
                {option.title}
              </h2>
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                {option.focus}
              </p>
              <p
                className={`text-sm leading-relaxed ${selected ? "" : "line-clamp-2"}`}
              >
                {option.description}
              </p>
              <span className="text-xs text-brand-500 dark:text-brand-400">
                {option.milestones.length} milestones · 3 months
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

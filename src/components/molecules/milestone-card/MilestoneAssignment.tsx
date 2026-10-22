import { Typography } from "../../atoms";
import FormField from "../FormField";
import type { MilestoneSectionProps } from "./types";

export default function MilestoneAssignment({
  milestone,
  index,
  editable,
  onChange,
}: MilestoneSectionProps) {
  return (
    <section
      aria-label={`Milestone ${index + 1} scenario assignment`}
      className="mt-6 space-y-4 rounded-xl bg-brand-50/70 p-4 dark:bg-brand-900/60"
    >
      <h3 className="text-sm font-semibold">Scenario assignment</h3>
      {(
        [
          ["title", "Assignment title"],
          ["scenario", "Scenario"],
          ["task", "Your task"],
          ["student_output", "Your output"],
        ] as const
      ).map(([field, label]) => (
        <div key={field} className="break-words">
          {editable ? (
            <FormField
              multiline
              label={label}
              id={`milestone-${index}-assignment-${field}`}
              value={milestone.scenario_assignment[field]}
              required
              maxLength={field === "title" ? 200 : 5000}
              rows={field === "title" ? 2 : 3}
              onChange={(event) =>
                onChange({
                  ...milestone,
                  scenario_assignment: {
                    ...milestone.scenario_assignment,
                    [field]: event.target.value,
                  },
                })
              }
            />
          ) : (
            <>
              <p className="mb-1 text-xs font-semibold">{label}</p>
              <Typography size="sm" color="inherit" leading="relaxed">
                {milestone.scenario_assignment[field]}
              </Typography>
            </>
          )}
        </div>
      ))}
    </section>
  );
}

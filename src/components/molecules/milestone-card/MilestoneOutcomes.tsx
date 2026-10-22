import FormField from "../FormField";
import type { MilestoneSectionProps } from "./types";

export default function MilestoneOutcomes({
  milestone,
  index,
  editable,
  onChange,
}: MilestoneSectionProps) {
  return (
    <section
      aria-label={`Milestone ${index + 1} learning outcomes`}
      className="mt-6 space-y-3"
    >
      <h3 className="text-sm font-semibold">What you will be able to do</h3>
      <ul className="space-y-3">
        {milestone.learning_outcomes.map((outcome, outcomeIndex) => (
          <li key={outcomeIndex} className="text-sm leading-relaxed">
            {editable ? (
              <FormField
                multiline
                label={`Learning outcome ${outcomeIndex + 1}`}
                id={`milestone-${index}-outcome-${outcomeIndex}`}
                value={outcome}
                required
                maxLength={5000}
                rows={2}
                onChange={(event) =>
                  onChange({
                    ...milestone,
                    learning_outcomes: milestone.learning_outcomes.map(
                      (value, position) =>
                        position === outcomeIndex ? event.target.value : value,
                    ),
                  })
                }
              />
            ) : (
              outcome
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

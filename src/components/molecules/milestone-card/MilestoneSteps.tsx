import { Heading, Typography } from "../../atoms";
import FormField from "../FormField";
import type { MilestoneSectionProps } from "./types";

export default function MilestoneSteps({
  milestone,
  index,
  editable,
  onChange,
}: MilestoneSectionProps) {
  return (
    <section
      aria-label={`Milestone ${index + 1} steps`}
      className="mt-6 border-t border-brand-100/70 pt-4 dark:border-brand-800"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
        {milestone.steps.length} learning steps
      </p>
      <ol className="space-y-5">
        {milestone.steps.map((step, stepIndex) => (
          <li key={stepIndex} className="min-w-0 break-words">
            <p className="mb-2 text-xs font-medium text-brand-500 dark:text-brand-400">
              Step {step.order}
            </p>
            {editable ? (
              <div className="flex flex-col gap-3">
                <FormField
                  label={`Step ${stepIndex + 1} title`}
                  id={`milestone-${index}-step-${stepIndex}-title`}
                  value={step.title}
                  onChange={(event) =>
                    onChange({
                      ...milestone,
                      steps: milestone.steps.map((value, position) =>
                        position === stepIndex
                          ? { ...value, title: event.target.value }
                          : value,
                      ),
                    })
                  }
                  required
                  maxLength={200}
                />
                <FormField
                  multiline
                  label={`Step ${stepIndex + 1} description`}
                  id={`milestone-${index}-step-${stepIndex}-description`}
                  value={step.description}
                  onChange={(event) =>
                    onChange({
                      ...milestone,
                      steps: milestone.steps.map((value, position) =>
                        position === stepIndex
                          ? { ...value, description: event.target.value }
                          : value,
                      ),
                    })
                  }
                  required
                  maxLength={5000}
                  rows={3}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Heading
                  as="h3"
                  size="inherit"
                  color="inherit"
                  weight="semibold"
                >
                  {step.title}
                </Heading>
                <Typography size="sm" color="inherit" leading="relaxed">
                  {step.description}
                </Typography>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

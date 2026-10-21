import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { LearningMilestone } from "../../server/shared/milestones";
import { Button, Heading, Typography } from "../atoms";
import FormField from "./FormField";

gsap.registerPlugin(useGSAP);

interface MilestoneCardProps {
  milestone: LearningMilestone;
  index: number;
  editing: boolean;
  saved: boolean;
  archived?: boolean;
  pending: boolean;
  onToggleEdit: (index: number) => void;
  onEdit: (index: number, milestone: LearningMilestone) => void;
}

export default function MilestoneCard({
  milestone,
  index,
  editing,
  saved,
  archived = false,
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

  return (
    <article
      ref={card}
      data-milestone-card
      className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-stone-700 dark:bg-stone-900"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="font-mono text-xs tracking-widest text-emerald-700 dark:text-emerald-400">
          MILESTONE 0{index + 1}
        </span>
        <span className="text-xs text-stone-500">
          {archived ? "Archived" : saved ? "Saved" : "Sequential milestone"}
        </span>
      </div>
      {editing && !saved ? (
        <div className="flex flex-col gap-4">
          <FormField
            label="Title"
            id={`milestone-title-${index}`}
            value={milestone.title}
            onChange={(event) =>
              onEdit(index, { ...milestone, title: event.target.value })
            }
            required
            maxLength={200}
          />
          <FormField
            multiline
            label="Description"
            id={`milestone-description-${index}`}
            value={milestone.description}
            onChange={(event) =>
              onEdit(index, { ...milestone, description: event.target.value })
            }
            required
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
      <section
        aria-label={`Milestone ${index + 1} learning outcomes`}
        className="mt-6 space-y-3"
      >
        <h3 className="text-sm font-semibold">What you will be able to do</h3>
        <ul className="space-y-3">
          {milestone.learning_outcomes.map((outcome, outcomeIndex) => (
            <li key={outcomeIndex} className="text-sm leading-relaxed">
              {editing && !saved ? (
                <FormField
                  multiline
                  label={`Learning outcome ${outcomeIndex + 1}`}
                  id={`milestone-${index}-outcome-${outcomeIndex}`}
                  value={outcome}
                  required
                  maxLength={5000}
                  rows={2}
                  onChange={(event) =>
                    onEdit(index, {
                      ...milestone,
                      learning_outcomes: milestone.learning_outcomes.map(
                        (value, position) =>
                          position === outcomeIndex
                            ? event.target.value
                            : value,
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
      <section
        aria-label={`Milestone ${index + 1} steps`}
        className="mt-6 border-t border-stone-200/70 pt-4 dark:border-stone-700"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          {milestone.steps.length} learning steps
        </p>
        <ol className="space-y-5">
          {milestone.steps.map((step, stepIndex) => (
            <li key={stepIndex} className="min-w-0 break-words">
              <p className="mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                Step {step.order}
              </p>
              {editing && !saved ? (
                <div className="flex flex-col gap-3">
                  <FormField
                    label={`Step ${stepIndex + 1} title`}
                    id={`milestone-${index}-step-${stepIndex}-title`}
                    value={step.title}
                    onChange={(event) =>
                      onEdit(index, {
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
                      onEdit(index, {
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
      <section
        aria-label={`Milestone ${index + 1} scenario assignment`}
        className="mt-6 space-y-4 rounded-xl bg-stone-100/70 p-4 dark:bg-stone-800/60"
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
            {editing && !saved ? (
              <FormField
                multiline
                label={label}
                id={`milestone-${index}-assignment-${field}`}
                value={milestone.scenario_assignment[field]}
                required
                maxLength={field === "title" ? 200 : 5000}
                rows={field === "title" ? 2 : 3}
                onChange={(event) =>
                  onEdit(index, {
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

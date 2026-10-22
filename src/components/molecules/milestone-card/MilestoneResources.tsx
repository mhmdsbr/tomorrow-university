import FormField from "../FormField";
import type { MilestoneSectionProps } from "./types";

export default function MilestoneResources({
  milestone,
  index,
  editable,
  onChange,
}: MilestoneSectionProps) {
  return (
    <section
      aria-label={`Milestone ${index + 1} suggested reading`}
      className="mt-6 space-y-3 border-t border-brand-100/70 pt-4 dark:border-brand-800"
    >
      <h3 className="text-sm font-semibold">Suggested reading</h3>
      <ul className="space-y-3">
        {milestone.resources.map((resource, resourceIndex) => (
          <li key={resourceIndex} className="min-w-0 break-words text-sm">
            {editable ? (
              <div className="flex flex-col gap-3">
                {(
                  [
                    ["title", "title"],
                    ["author_or_publisher", "author or publisher"],
                  ] as const
                ).map(([field, label]) => (
                  <FormField
                    key={field}
                    label={`Resource ${resourceIndex + 1} ${label}`}
                    id={`milestone-${index}-resource-${resourceIndex}-${field}`}
                    value={resource[field]}
                    required
                    maxLength={200}
                    onChange={(event) =>
                      onChange({
                        ...milestone,
                        resources: milestone.resources.map((value, position) =>
                          position === resourceIndex
                            ? { ...value, [field]: event.target.value }
                            : value,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <>
                <cite className="font-medium not-italic">{resource.title}</cite>
                <span className="text-brand-500 dark:text-brand-400">
                  {" "}
                  · {resource.author_or_publisher}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

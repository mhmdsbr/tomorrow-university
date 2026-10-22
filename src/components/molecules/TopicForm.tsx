import type { FormEventHandler } from "react";
import {
  LEARNING_DOMAIN_HINTS,
  LEARNING_DOMAINS,
  type LearningDomain,
} from "../../shared/milestones";
import { Button, LoadingSpinner, Typography } from "../atoms";
import FormField, { fieldClassName } from "./FormField";

type TopicField = "domain" | "title" | "description";

interface TopicFormProps {
  pending: boolean;
  generating?: boolean;
  hasDraft: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  topic?: Record<TopicField, string>;
  onTopicChange?: (field: TopicField, value: string) => void;
  onCancel?: () => void;
}

export default function TopicForm({
  pending,
  generating = false,
  hasDraft,
  onSubmit,
  topic,
  onTopicChange,
  onCancel,
}: TopicFormProps) {
  const domain = LEARNING_DOMAINS.includes(topic?.domain as LearningDomain)
    ? (topic?.domain as LearningDomain)
    : null;
  return (
    <form
      onSubmit={onSubmit}
      method="post"
      data-topic-form
      className="rounded-3xl border border-brand-100/80 bg-white/90 p-6 shadow-[0_16px_70px_-40px_rgba(66,20,183,0.3)] sm:p-8 dark:border-brand-800 dark:bg-brand-950/90"
    >
      <fieldset disabled={pending} className="flex flex-col gap-5">
        <legend className="mb-2 text-xl font-semibold tracking-tight">
          Start with a little curiosity.
        </legend>
        <Typography size="sm" color="inherit" leading="relaxed">
          Choose a domain and describe what your students should explore. We
          will turn your idea into three alternative three-month pathways. Each
          has 3-5 sequential milestones, learning outcomes, steps, and scenario
          assignments. Review them and save one or more.
        </Typography>
        <div className="flex flex-col gap-2">
          <label htmlFor="domain" className="text-sm font-medium">
            Domain
          </label>
          <select
            id="domain"
            name="domain"
            required
            aria-describedby="domain-hint"
            className={fieldClassName}
            value={topic?.domain}
            defaultValue={topic ? undefined : ""}
            onChange={
              onTopicChange
                ? (event) => onTopicChange("domain", event.target.value)
                : undefined
            }
          >
            <option value="" disabled>
              Choose a domain
            </option>
            {LEARNING_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
          <p
            id="domain-hint"
            aria-live="polite"
            className="text-xs leading-relaxed text-brand-600 dark:text-brand-300"
          >
            {domain
              ? `Covers: ${LEARNING_DOMAIN_HINTS[domain]}`
              : "Pick the domain that best matches your topic."}
          </p>
        </div>
        <FormField
          label="Topic title"
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          value={topic?.title}
          onChange={
            onTopicChange
              ? (event) => onTopicChange("title", event.target.value)
              : undefined
          }
          placeholder="e.g. Validating a startup idea"
        />
        <FormField
          multiline
          label="Topic description"
          id="description"
          name="description"
          required
          maxLength={5000}
          value={topic?.description}
          onChange={
            onTopicChange
              ? (event) => onTopicChange("description", event.target.value)
              : undefined
          }
          rows={2}
          className="field-sizing-content max-h-60 min-h-20"
          placeholder="Who is learning, what should they discover, and why does it matter?"
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button variant="solid" type="submit" disabled={pending}>
            {generating && <LoadingSpinner size="sm" />}
            {generating
              ? "Generating pathways..."
              : domain
                ? `Generate ${hasDraft ? "new " : ""}${domain} pathways`
                : hasDraft
                  ? "Generate new pathway options"
                  : "Generate three pathway options"}
          </Button>
          {onCancel && (
            <Button variant="subtle" disabled={pending} onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        <Typography size="xs" color="inherit" leading="relaxed">
          Generation sends your topic to the configured AI provider (Google
          Gemini or DeepSeek). Nothing is saved until you select and save to the
          database. Unsaved drafts are lost when you reload or leave the page.
        </Typography>
      </fieldset>
    </form>
  );
}

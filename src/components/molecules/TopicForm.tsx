import type { FormEventHandler } from "react";
import { LEARNING_DOMAINS } from "../../shared/milestones";
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
}

export default function TopicForm({
  pending,
  generating = false,
  hasDraft,
  onSubmit,
  topic,
  onTopicChange,
}: TopicFormProps) {
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
          will turn your idea into three alternative three-month pathways.
          Choose one, with 3-5 sequential milestones, learning outcomes, steps,
          and scenario assignments.
        </Typography>
        <div className="flex flex-col gap-2">
          <label htmlFor="domain" className="text-sm font-medium">
            Domain
          </label>
          <select
            id="domain"
            name="domain"
            required
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
          rows={4}
          placeholder="Who is learning, what should they discover, and why does it matter?"
        />
        <Button variant="solid" type="submit" disabled={pending}>
          {generating && <LoadingSpinner size="sm" />}
          {generating
            ? "Generating pathways..."
            : hasDraft
              ? "Generate new pathway options"
              : "Generate three pathway options"}
        </Button>
        <Typography size="xs" color="inherit" leading="relaxed">
          Generation sends your topic to the configured AI provider (Google
          Gemini or DeepSeek). Nothing is saved until you select and save to the
          database. Unsaved drafts are lost when you reload or leave the page.
        </Typography>
      </fieldset>
    </form>
  );
}

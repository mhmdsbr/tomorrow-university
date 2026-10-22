import type { FormEventHandler } from "react";
import { Button, Typography } from "../atoms";
import FormField from "./FormField";

interface TopicFormProps {
  pending: boolean;
  hasDraft: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  topic?: { title: string; description: string };
  onTopicChange?: (field: "title" | "description", value: string) => void;
}

export default function TopicForm({
  pending,
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
      className="rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-[0_16px_70px_-40px_rgba(28,60,44,0.3)] sm:p-8 dark:border-stone-700 dark:bg-stone-900/90"
    >
      <fieldset disabled={pending} className="flex flex-col gap-5">
        <legend className="mb-2 text-xl font-semibold tracking-tight">
          Start with a little curiosity.
        </legend>
        <Typography size="sm" color="inherit" leading="relaxed">
          Describe what your students should explore. We will turn your idea
          into three alternative three-month pathways. Choose one, with 3-5
          sequential milestones, learning outcomes, steps, and scenario
          assignments.
        </Typography>
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
          placeholder="e.g. Sustainable food systems"
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
          {pending
            ? "Working..."
            : hasDraft
              ? "Generate new pathway options"
              : "Generate three pathway options"}
        </Button>
        <Typography size="xs" color="inherit" leading="relaxed">
          Generation sends your topic to the configured AI provider (Google
          Gemini or DeepSeek). Nothing is saved until you select and save to the
          database. Your work is kept in this browser tab&apos;s session across
          reloads, until the tab is closed.
        </Typography>
      </fieldset>
    </form>
  );
}

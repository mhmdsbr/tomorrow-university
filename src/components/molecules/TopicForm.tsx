import type { FormEventHandler } from "react";
import { Button, Typography } from "../atoms";
import FormField from "./FormField";

interface TopicFormProps {
  pending: boolean;
  hasDraft: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function TopicForm({
  pending,
  hasDraft,
  onSubmit,
}: TopicFormProps) {
  return (
    <form onSubmit={onSubmit} method="post">
      <fieldset disabled={pending} className="flex flex-col gap-4">
        <legend className="mb-4 font-semibold">Your topic</legend>
        <FormField
          label="Topic title"
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
        />
        <FormField
          multiline
          label="Topic description"
          id="description"
          name="description"
          required
          maxLength={5000}
          rows={4}
        />
        <Button variant="solid" type="submit" disabled={pending}>
          {pending
            ? "Working..."
            : hasDraft
              ? "Generate a new draft"
              : "Generate three milestones"}
        </Button>
        <Typography size="sm" color="inherit">
          Generation sends your topic to Google Gemini. Nothing is saved until
          you approve. Unsaved drafts are lost when you leave or reload this
          page.
        </Typography>
      </fieldset>
    </form>
  );
}

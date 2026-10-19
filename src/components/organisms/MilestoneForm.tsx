"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  generateMilestoneDraft,
  saveMilestoneDraft,
} from "../../../actions/milestones";
import type { MilestoneDraft } from "@/server/shared/milestones";
import { Typography } from "../atoms";
import TopicForm from "../molecules/TopicForm";
import DraftReview from "../molecules/DraftReview";

export default function MilestoneForm() {
  const [draft, setDraft] = useState<MilestoneDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const [pending, startTransition] = useTransition();

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFeedback({ error: false, message: "" });

    startTransition(async () => {
      try {
        const result = await generateMilestoneDraft(formData);
        if (!result.success) {
          setFeedback({ error: true, message: result.message });
          return;
        }
        setDraft(result.draft);
        setSaved(false);
        setFeedback({
          error: false,
          message:
            "Draft generated. Review and edit all three milestones before saving.",
        });
      } catch (error) {
        console.error("Milestone generation request failed:", error);
        setFeedback({
          error: true,
          message:
            "The request failed. Please try again. Your existing draft has not changed.",
        });
      }
    });
  }

  function approve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || saved || pending) return;
    setFeedback({ error: false, message: "" });

    startTransition(async () => {
      try {
        const result = await saveMilestoneDraft(draft);
        if (!result.success) {
          setFeedback({ error: true, message: result.message });
          return;
        }
        setDraft(result.draft);
        setSaved(true);
        setFeedback({
          error: false,
          message: "All three milestones were approved and saved.",
        });
      } catch (error) {
        console.error("Milestone save request failed:", error);
        setFeedback({
          error: true,
          message:
            "Could not confirm the save. Your draft is still available. Check the database before retrying to avoid duplicates.",
        });
      }
    });
  }

  function editMilestone(
    index: number,
    field: "title" | "description",
    value: string,
  ) {
    setDraft((current) =>
      current
        ? {
            milestones: current.milestones.map((milestone, position) =>
              position === index ? { ...milestone, [field]: value } : milestone,
            ),
          }
        : current,
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <TopicForm
        pending={pending}
        hasDraft={Boolean(draft)}
        onSubmit={generate}
      />
      {draft && (
        <DraftReview
          draft={draft}
          saved={saved}
          pending={pending}
          onSubmit={approve}
          onEdit={editMilestone}
          onDiscard={() => {
            setDraft(null);
            setFeedback({
              error: false,
              message: "Draft discarded. Nothing was saved.",
            });
          }}
        />
      )}
      {feedback.message && (
        <div role={feedback.error ? "alert" : "status"}>
          <Typography size="base" color="inherit">
            {feedback.message}
          </Typography>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  generateMilestoneDraft,
  saveMilestoneDraft,
} from "../actions/milestones";
import type {
  LearningMilestone,
  MilestoneTopic,
} from "../server/shared/milestones";
import { useMilestoneSession } from "./useMilestoneSession";

export function useMilestoneForm() {
  const { session, setSession, sessionReady, storageError } =
    useMilestoneSession();
  const { draft, draftTopic, selectedPathwayId, saved } = session;
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const [pending, startTransition] = useTransition();
  const chosen = draft?.pathway_options.find(
    (option) => option.id === selectedPathwayId,
  );

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
        setSession((current) => ({
          ...current,
          draft: result.draft,
          draftTopic: result.topic,
          selectedPathwayId: null,
          saved: false,
          editing: [],
          legacy: false,
        }));
        setFeedback({
          error: false,
          message:
            "Three alternative pathways are ready. Choose one independent learning journey to review and save.",
        });
      } catch (error) {
        console.error("Pathway generation request failed:", error);
        setFeedback({
          error: true,
          message:
            "The request failed. Your existing draft has not changed. Please try again.",
        });
      }
    });
  }

  function approve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !draftTopic || !chosen || saved || pending) return;
    setFeedback({ error: false, message: "" });
    startTransition(async () => {
      try {
        const result = await saveMilestoneDraft({
          topic: draftTopic,
          duration: draft.duration,
          pathway: chosen,
        });
        if (!result.success) {
          setFeedback({ error: true, message: result.message });
          return;
        }
        setSession((current) => ({
          ...current,
          draft: current.draft
            ? {
                ...current.draft,
                pathway_options: current.draft.pathway_options.map((option) =>
                  option.id === result.pathway.id ? result.pathway : option,
                ),
              }
            : null,
          saved: true,
          editing: [],
        }));
        setFeedback({
          error: false,
          message: `Your chosen pathway and all ${result.pathway.milestones.length} milestones were saved. The other options were not recorded.`,
        });
      } catch (error) {
        console.error("Pathway save request failed:", error);
        setFeedback({
          error: true,
          message:
            "Could not confirm the save. Your draft is preserved. Check the database before retrying to avoid duplicates.",
        });
      }
    });
  }

  function editMilestone(index: number, updated: LearningMilestone) {
    setSession((current) => ({
      ...current,
      draft: current.draft
        ? {
            ...current.draft,
            pathway_options: current.draft.pathway_options.map((option) =>
              option.id === current.selectedPathwayId
                ? {
                    ...option,
                    milestones: option.milestones.map((milestone, position) =>
                      position === index ? updated : milestone,
                    ),
                  }
                : option,
            ),
          }
        : null,
    }));
  }

  function changeTopic(field: keyof MilestoneTopic, value: string) {
    setSession((current) => ({
      ...current,
      topicInput: { ...current.topicInput, [field]: value },
    }));
  }

  function choosePathway(id: number) {
    setSession((current) => ({
      ...current,
      selectedPathwayId: id,
      editing: [],
    }));
    setFeedback({ error: false, message: "" });
  }

  function toggleEdit(index: number) {
    setSession((current) => ({
      ...current,
      editing: current.editing.includes(index)
        ? current.editing.filter((value) => value !== index)
        : [...current.editing, index],
    }));
  }

  function discard() {
    setSession((current) => ({
      ...current,
      draft: null,
      draftTopic: null,
      selectedPathwayId: null,
      editing: [],
      saved: false,
      legacy: false,
    }));
    setFeedback({
      error: false,
      message: saved
        ? "Browser draft cleared. Previously saved content remains in the database."
        : "Draft options discarded. Nothing was recorded.",
    });
  }

  return {
    ...session,
    sessionReady,
    storageError,
    feedback,
    pending,
    chosen,
    generate,
    approve,
    editMilestone,
    changeTopic,
    choosePathway,
    toggleEdit,
    discard,
  };
}

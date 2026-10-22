"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  generateMilestoneDraft,
  saveMilestoneDraft,
} from "../actions/milestones";
import type {
  LearningDomain,
  LearningMilestone,
  MilestoneTopic,
  PathwaySuggestions,
  PathwayTopic,
} from "../shared/milestones";

interface MilestoneFormState {
  topicInput: MilestoneTopic & { domain: LearningDomain | "" };
  draft: PathwaySuggestions | null;
  draftTopic: PathwayTopic | null;
  selectedPathwayId: number | null;
  savedIds: number[];
  editing: number[];
  expanded: number | null;
  topicOpen: boolean;
}

const initialState: MilestoneFormState = {
  topicInput: { domain: "", title: "", description: "" },
  draft: null,
  draftTopic: null,
  selectedPathwayId: null,
  savedIds: [],
  editing: [],
  expanded: null,
  topicOpen: false,
};

export function useMilestoneForm() {
  const [state, setState] = useState(initialState);
  const { draft, draftTopic, selectedPathwayId, savedIds } = state;
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    "generate" | "save" | null
  >(null);
  const chosen = draft?.pathway_options.find(
    (option) => option.id === selectedPathwayId,
  );
  const saved = chosen ? savedIds.includes(chosen.id) : false;

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFeedback({ error: false, message: "" });
    setPendingAction("generate");
    startTransition(async () => {
      try {
        const result = await generateMilestoneDraft(formData);
        if (!result.success) {
          setFeedback({ error: true, message: result.message });
          return;
        }
        setState((current) => ({
          ...current,
          draft: result.draft,
          draftTopic: result.topic,
          selectedPathwayId: null,
          savedIds: [],
          editing: [],
          expanded: null,
          topicOpen: false,
        }));
        setFeedback({
          error: false,
          message:
            "Three alternative pathways are ready. Choose one to review; you can save one or several.",
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
    setPendingAction("save");
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
        setState((current) => ({
          ...current,
          draft: current.draft
            ? {
                ...current.draft,
                pathway_options: current.draft.pathway_options.map((option) =>
                  option.id === result.pathway.id ? result.pathway : option,
                ),
              }
            : null,
          savedIds: current.savedIds.includes(result.pathway.id)
            ? current.savedIds
            : [...current.savedIds, result.pathway.id],
          editing: [],
        }));
        setFeedback({
          error: false,
          message: `Option 0${result.pathway.id} and its ${result.pathway.milestones.length} milestones were saved. You can choose and save another option too.`,
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
    setState((current) => ({
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

  function changeTopic(
    field: keyof MilestoneFormState["topicInput"],
    value: string,
  ) {
    setState((current) => ({
      ...current,
      topicInput: { ...current.topicInput, [field]: value },
    }));
  }

  function choosePathway(id: number) {
    setState((current) => ({
      ...current,
      selectedPathwayId: id,
      editing: [],
      expanded: 0,
    }));
    setFeedback({ error: false, message: "" });
  }

  function toggleEdit(index: number) {
    setState((current) => ({
      ...current,
      editing: current.editing.includes(index)
        ? current.editing.filter((value) => value !== index)
        : [...current.editing, index],
    }));
  }

  function toggleExpand(index: number) {
    setState((current) => ({
      ...current,
      expanded: current.expanded === index ? null : index,
    }));
  }

  function setTopicOpen(topicOpen: boolean) {
    setState((current) => ({ ...current, topicOpen }));
  }

  function discard() {
    setState((current) => ({
      ...current,
      draft: null,
      draftTopic: null,
      selectedPathwayId: null,
      editing: [],
      expanded: null,
      topicOpen: false,
      savedIds: [],
    }));
    setFeedback({
      error: false,
      message: savedIds.length
        ? "Draft cleared. Your saved pathways remain in the database."
        : "Draft options discarded. Nothing was recorded.",
    });
  }

  return {
    ...state,
    saved,
    feedback,
    pending,
    generating: pending && pendingAction === "generate",
    saving: pending && pendingAction === "save",
    chosen,
    generate,
    approve,
    editMilestone,
    changeTopic,
    choosePathway,
    toggleEdit,
    toggleExpand,
    openTopic: () => setTopicOpen(true),
    closeTopic: () => setTopicOpen(false),
    discard,
  };
}

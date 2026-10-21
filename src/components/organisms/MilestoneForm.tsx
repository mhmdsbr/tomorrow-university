"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  generateMilestoneDraft,
  saveMilestoneDraft,
} from "../../../actions/milestones";
import type {
  LearningMilestone,
  MilestoneTopic,
  PathwaySuggestions,
} from "../../server/shared/milestones";
import { Button, Typography } from "../atoms";
import TopicForm from "../molecules/TopicForm";
import DraftReview from "../molecules/DraftReview";
import PathwayOptions from "../molecules/PathwayOptions";
import {
  MILESTONE_SESSION_KEY,
  restoreMilestoneSession,
} from "./milestone-session";

gsap.registerPlugin(useGSAP);

export default function MilestoneForm() {
  const [draft, setDraft] = useState<PathwaySuggestions | null>(null);
  const [draftTopic, setDraftTopic] = useState<MilestoneTopic | null>(null);
  const [topicInput, setTopicInput] = useState({ title: "", description: "" });
  const [selectedPathwayId, setSelectedPathwayId] = useState<number | null>(
    null,
  );
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<number[]>([]);
  const [legacy, setLegacy] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const [pending, startTransition] = useTransition();
  const container = useRef<HTMLDivElement>(null);
  const chosen = draft?.pathway_options.find(
    (option) => option.id === selectedPathwayId,
  );

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(MILESTONE_SESSION_KEY);
      if (stored !== null) {
        const { state } = restoreMilestoneSession(JSON.parse(stored));
        setTopicInput(state.topicInput);
        setDraft(state.draft);
        setDraftTopic(state.draftTopic);
        setSelectedPathwayId(state.selectedPathwayId);
        setSaved(state.saved);
        setEditing(state.editing);
        setLegacy(state.legacy);
      }
    } catch (error) {
      console.error("Could not restore pathway session:", error);
      setStorageError(
        "Could not restore your previous browser session. Keep any visible draft open.",
      );
    } finally {
      setSessionReady(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    try {
      sessionStorage.setItem(
        MILESTONE_SESSION_KEY,
        JSON.stringify({
          version: 3,
          topicInput,
          draft,
          draftTopic,
          selectedPathwayId,
          saved,
          editing,
          legacy,
        }),
      );
    } catch (error) {
      console.error("Could not preserve pathway session:", error);
      setStorageError(
        "Browser session storage is unavailable or full. Keep this page open: changes may be lost on reload.",
      );
    }
  }, [
    sessionReady,
    topicInput,
    draft,
    draftTopic,
    selectedPathwayId,
    saved,
    editing,
    legacy,
  ]);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = container.current?.querySelectorAll(
          "[data-pathway-option], [data-milestone-card]",
        );
        if (cards?.length)
          gsap.from(cards, {
            y: 20,
            opacity: 0,
            stagger: 0.07,
            duration: 0.45,
            ease: "power2.out",
          });
      });
      return () => media.revert();
    },
    {
      scope: container,
      dependencies: [draft?.pathway_options.length, selectedPathwayId],
      revertOnUpdate: true,
    },
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
        setDraft(result.draft);
        setDraftTopic(result.topic);
        setSelectedPathwayId(null);
        setSaved(false);
        setEditing([]);
        setLegacy(false);
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
        setDraft((current) =>
          current
            ? {
                ...current,
                pathway_options: current.pathway_options.map((option) =>
                  option.id === result.pathway.id ? result.pathway : option,
                ),
              }
            : current,
        );
        setSaved(true);
        setEditing([]);
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
    setDraft((current) =>
      current
        ? {
            ...current,
            pathway_options: current.pathway_options.map((option) =>
              option.id === selectedPathwayId
                ? {
                    ...option,
                    milestones: option.milestones.map((milestone, position) =>
                      position === index ? updated : milestone,
                    ),
                  }
                : option,
            ),
          }
        : current,
    );
  }

  return (
    <div ref={container} className="flex w-full flex-col gap-10">
      <TopicForm
        pending={pending || !sessionReady}
        hasDraft={Boolean(draft)}
        onSubmit={generate}
        topic={topicInput}
        onTopicChange={(field, value) =>
          setTopicInput((current) => ({ ...current, [field]: value }))
        }
      />
      {draft && (
        <>
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {draft.topic.title} · {draft.duration} per pathway
            </p>
            <Typography size="sm" color="inherit">
              {draft.topic.description}
            </Typography>
          </div>
          {legacy && (
            <p
              role="status"
              className="rounded-xl border border-amber-400 p-4 text-sm"
            >
              Your previous single-pathway draft is preserved, not presented as
              three alternatives. Generate new options to use the new format.
              Previously saved or partially saved legacy drafts are read-only to
              avoid recording duplicates. Complete any blank outcomes or
              assignments before saving an unsaved legacy draft.
            </p>
          )}
          <PathwayOptions
            options={draft.pathway_options}
            selectedId={selectedPathwayId}
            disabled={pending || saved}
            onChoose={(id) => {
              setSelectedPathwayId(id);
              setEditing([]);
              setFeedback({ error: false, message: "" });
            }}
          />
          {chosen && (
            <DraftReview
              pathway={chosen}
              saved={saved}
              archived={legacy && saved}
              editing={editing}
              pending={pending}
              onSubmit={approve}
              onEdit={editMilestone}
              onToggleEdit={(index) =>
                setEditing((current) =>
                  current.includes(index)
                    ? current.filter((value) => value !== index)
                    : [...current, index],
                )
              }
            />
          )}
          <Button
            variant="subtle"
            disabled={pending}
            onClick={() => {
              setDraft(null);
              setDraftTopic(null);
              setSelectedPathwayId(null);
              setEditing([]);
              setSaved(false);
              setLegacy(false);
              setFeedback({
                error: false,
                message: saved
                  ? "Browser draft cleared. Previously saved content remains in the database."
                  : "Draft options discarded. Nothing was recorded.",
              });
            }}
          >
            Discard draft options
          </Button>
        </>
      )}
      {feedback.message && (
        <div
          role={feedback.error ? "alert" : "status"}
          className={`rounded-xl border px-5 py-4 ${feedback.error ? "border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200" : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"}`}
        >
          <Typography size="base" color="inherit">
            {feedback.message}
          </Typography>
        </div>
      )}
      {storageError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-400 p-4 text-sm"
        >
          {storageError}
        </div>
      )}
    </div>
  );
}

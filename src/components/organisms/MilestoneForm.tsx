"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  generateMilestoneDraft,
  saveMilestoneDraft,
} from "../../../actions/milestones";
import type { MilestoneDraft } from "@/server/shared/milestones";
import { Typography } from "../atoms";
import TopicForm from "../molecules/TopicForm";
import DraftReview from "../molecules/DraftReview";

gsap.registerPlugin(useGSAP);

export default function MilestoneForm() {
  const [draft, setDraft] = useState<MilestoneDraft | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<number[]>([]);
  const [generation, setGeneration] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const [pending, startTransition] = useTransition();

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-topic-form]", {
          y: 16,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });
        const cards = container.current?.querySelectorAll(
          "[data-milestone-card]",
        );
        if (cards?.length) {
          gsap.from(cards, {
            y: 24,
            opacity: 0,
            stagger: 0.1,
            duration: 0.55,
            ease: "power2.out",
          });
        }
      });
      return () => media.revert();
    },
    { scope: container, dependencies: [generation], revertOnUpdate: true },
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
        setSaved([]);
        setSelected([]);
        setEditing([]);
        setGeneration((current) => current + 1);
        setFeedback({
          error: false,
          message:
            "Three milestones are ready. Select the ones you want to save, or edit them first.",
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
    if (!draft || selected.length === 0 || pending) return;
    setFeedback({ error: false, message: "" });

    startTransition(async () => {
      try {
        const result = await saveMilestoneDraft({
          milestones: selected.map((index) => draft.milestones[index]),
        });
        if (!result.success) {
          setFeedback({ error: true, message: result.message });
          return;
        }
        setDraft((current) =>
          current
            ? {
                milestones: current.milestones.map((milestone, index) => {
                  const position = selected.indexOf(index);
                  return position >= 0
                    ? result.draft.milestones[position]
                    : milestone;
                }),
              }
            : current,
        );
        setSaved((current) => [...current, ...selected]);
        setEditing((current) =>
          current.filter((index) => !selected.includes(index)),
        );
        setSelected([]);
        setFeedback({
          error: false,
          message: `${selected.length} milestone${selected.length === 1 ? "" : "s"} saved. Unselected milestones were not recorded.`,
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
    <div ref={container} className="flex w-full flex-col gap-10">
      <TopicForm
        pending={pending}
        hasDraft={Boolean(draft)}
        onSubmit={generate}
      />
      {draft && (
        <DraftReview
          draft={draft}
          saved={saved}
          selected={selected}
          editing={editing}
          pending={pending}
          onSubmit={approve}
          onEdit={editMilestone}
          onSelect={(index) =>
            setSelected((current) =>
              current.includes(index)
                ? current.filter((value) => value !== index)
                : [...current, index].sort((a, b) => a - b),
            )
          }
          onToggleEdit={(index) =>
            setEditing((current) =>
              current.includes(index)
                ? current.filter((value) => value !== index)
                : [...current, index],
            )
          }
          onDiscard={() => {
            setDraft(null);
            setFeedback({
              error: false,
              message:
                saved.length > 0
                  ? "Unsaved drafts discarded. Previously saved milestones remain in the database."
                  : "Draft discarded. Nothing was saved.",
            });
          }}
        />
      )}
      {feedback.message && (
        <div
          role={feedback.error ? "alert" : "status"}
          className={`rounded-xl border px-5 py-4 ${feedback.error ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200" : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"}`}
        >
          <Typography size="base" color="inherit">
            {feedback.message}
          </Typography>
        </div>
      )}
    </div>
  );
}

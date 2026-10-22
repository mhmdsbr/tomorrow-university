"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMilestoneForm } from "@/hooks/useMilestoneForm";
import { Button, Typography } from "../atoms";
import TopicForm from "../molecules/TopicForm";
import DraftReview from "../molecules/DraftReview";
import PathwayOptions from "../molecules/PathwayOptions";

gsap.registerPlugin(useGSAP);

export default function MilestoneForm() {
  const {
    draft,
    topicInput,
    selectedPathwayId,
    saved,
    editing,
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
  } = useMilestoneForm();
  const container = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={container} className="flex w-full flex-col gap-10">
      <TopicForm
        pending={pending}
        hasDraft={Boolean(draft)}
        onSubmit={generate}
        topic={topicInput}
        onTopicChange={changeTopic}
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
          <PathwayOptions
            options={draft.pathway_options}
            selectedId={selectedPathwayId}
            disabled={pending || saved}
            onChoose={choosePathway}
          />
          {chosen && (
            <DraftReview
              pathway={chosen}
              saved={saved}
              editing={editing}
              pending={pending}
              onSubmit={approve}
              onEdit={editMilestone}
              onToggleEdit={toggleEdit}
            />
          )}
          <Button variant="subtle" disabled={pending} onClick={discard}>
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
    </div>
  );
}

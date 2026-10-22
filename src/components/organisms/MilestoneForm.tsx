"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMilestoneForm } from "@/hooks/useMilestoneForm";
import { Button, LoadingSpinner, Typography } from "../atoms";
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
    draftTopic,
    feedback,
    pending,
    generating,
    saving,
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
        generating={generating}
        hasDraft={Boolean(draft)}
        onSubmit={generate}
        topic={topicInput}
        onTopicChange={changeTopic}
      />
      {generating && (
        <div className="flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-brand-900 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-100">
          <LoadingSpinner
            label="Generating pathway options"
            className="border-brand-700 dark:border-brand-300"
          />
          <div>
            <p className="font-semibold">Generating three pathway options…</p>
            <Typography size="sm" color="inherit" leading="relaxed">
              This can take up to a minute. Keep this page open.
            </Typography>
          </div>
        </div>
      )}
      {draft && (
        <>
          <div className="space-y-2">
            {draftTopic && (
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                {draftTopic.domain}
              </p>
            )}
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
              saving={saving}
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
          className={`rounded-xl border px-5 py-4 ${feedback.error ? "border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200" : "border-brand-200 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200"}`}
        >
          <Typography size="base" color="inherit">
            {feedback.message}
          </Typography>
        </div>
      )}
    </div>
  );
}

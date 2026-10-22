"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMilestoneForm } from "@/hooks/useMilestoneForm";
import { LoadingSpinner, Typography } from "../atoms";
import TopicForm from "../molecules/TopicForm";
import DraftReview from "../molecules/DraftReview";
import PathwayOptions from "../molecules/PathwayOptions";
import TopicSummary from "../molecules/TopicSummary";

gsap.registerPlugin(useGSAP);

function scrollToStart(element: HTMLElement | null) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element?.scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "start",
  });
}

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
    toggleExpand,
    openTopic,
    closeTopic,
    discard,
    expanded,
    topicOpen,
  } = useMilestoneForm();
  const container = useRef<HTMLDivElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const review = useRef<HTMLDivElement>(null);

  // Bring the options into view instead of the (now collapsed) form.
  useEffect(() => {
    if (draftTopic) scrollToStart(workspace.current);
  }, [draftTopic]);

  function chooseAndReveal(id: number) {
    choosePathway(id);
    // On narrow screens the milestones sit below the options.
    if (window.matchMedia("(max-width: 1023px)").matches)
      requestAnimationFrame(() => scrollToStart(review.current));
  }

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

  const feedbackBox = feedback.message && (
    <div
      role={feedback.error ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 ${feedback.error ? "border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200" : "border-brand-200 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200"}`}
    >
      <Typography size="sm" color="inherit">
        {feedback.message}
      </Typography>
    </div>
  );

  return (
    <div ref={container} className="flex w-full flex-col gap-8">
      {(!draft || topicOpen) && (
        <TopicForm
          pending={pending}
          generating={generating}
          hasDraft={Boolean(draft)}
          onSubmit={generate}
          topic={topicInput}
          onTopicChange={changeTopic}
          onCancel={draft ? closeTopic : undefined}
        />
      )}
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
      {!draft && feedbackBox}
      {draft && (
        <div
          ref={workspace}
          className="grid scroll-mt-6 gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start"
        >
          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-4 brand-scrollbar">
            {!topicOpen && draftTopic && (
              <TopicSummary
                topic={draftTopic}
                duration={draft.duration}
                pending={pending}
                onEditTopic={openTopic}
                onDiscard={discard}
              />
            )}
            {feedbackBox}
            <PathwayOptions
              options={draft.pathway_options}
              selectedId={selectedPathwayId}
              disabled={pending || saved}
              onChoose={chooseAndReveal}
            />
          </aside>
          <div ref={review} className="min-w-0 scroll-mt-6">
            {chosen ? (
              <DraftReview
                pathway={chosen}
                saved={saved}
                editing={editing}
                pending={pending}
                saving={saving}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                onSubmit={approve}
                onEdit={editMilestone}
                onToggleEdit={toggleEdit}
              />
            ) : (
              <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-brand-200 p-6 text-center text-sm text-brand-600 dark:border-brand-800 dark:text-brand-300">
                Choose a pathway to review its milestones here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

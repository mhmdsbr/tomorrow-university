import type { PathwayTopic } from "../../shared/milestones";
import { Button } from "../atoms";

interface TopicSummaryProps {
  topic: PathwayTopic;
  duration: string;
  pending: boolean;
  onEditTopic: () => void;
  onDiscard: () => void;
}

export default function TopicSummary({
  topic,
  duration,
  pending,
  onEditTopic,
  onDiscard,
}: TopicSummaryProps) {
  return (
    <section
      aria-label="Current topic"
      data-topic-summary
      className="rounded-2xl border border-brand-100 bg-white/90 p-4 dark:border-brand-800 dark:bg-brand-950/90"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
        {topic.domain} · {duration}
      </p>
      <p className="mt-1 font-semibold leading-snug wrap-break-word">
        {topic.title}
      </p>
      <p
        className="mt-1 line-clamp-2 text-sm text-brand-700/80 dark:text-brand-200/80"
        title={topic.description}
      >
        {topic.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        <Button variant="subtle" disabled={pending} onClick={onEditTopic}>
          Edit topic / regenerate
        </Button>
        <Button variant="subtle" disabled={pending} onClick={onDiscard}>
          Discard draft
        </Button>
      </div>
    </section>
  );
}

import type { DomainFit, LearningDomain } from "../../shared/milestones";
import { Button } from "../atoms";

interface DomainFitNoticeProps {
  fit: DomainFit;
  chosenDomain: LearningDomain;
  pending: boolean;
  onRegenerate: (domain: LearningDomain) => void;
  onKeep: () => void;
}

export default function DomainFitNotice({
  fit,
  chosenDomain,
  pending,
  onRegenerate,
  onKeep,
}: DomainFitNoticeProps) {
  return (
    <section
      role="alert"
      aria-label="Domain check"
      data-domain-fit-notice
      className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100"
    >
      <p className="font-semibold">
        This topic looks closer to {fit.suggested_domain} than {chosenDomain}.
      </p>
      <p className="mt-1 text-sm leading-relaxed">{fit.reason}</p>
      <p className="mt-1 text-sm leading-relaxed">
        The options below were still designed for {chosenDomain}.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Button
          variant="solid"
          disabled={pending}
          onClick={() => onRegenerate(fit.suggested_domain)}
        >
          Regenerate as {fit.suggested_domain}
        </Button>
        <Button variant="subtle" disabled={pending} onClick={onKeep}>
          Keep {chosenDomain}
        </Button>
      </div>
    </section>
  );
}

import { Heading, Typography } from "@/components/atoms";

export default function Header() {
  return (
    <header className="mb-12 max-w-2xl space-y-5">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-brand-600"
        />
        University Tomorrow
      </span>
      <Heading as="h1" size="4xl" color="inherit" weight="semibold">
        Learn while challenging yourself
      </Heading>
      <Typography size="lg" color="inherit" leading="relaxed">
        Start with a topic, refine three
        alternatives, and choose the pathway that inspires students.
      </Typography>
      <ol
        aria-label="How it works"
        className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-brand-600 dark:text-brand-400"
      >
        <li>01 &nbsp; Describe</li>
        <li>02 &nbsp; Review &amp; refine</li>
        <li>03 &nbsp; Choose a pathway &amp; save</li>
      </ol>
    </header>
  );
}

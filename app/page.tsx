import MilestoneForm from "@/components/organisms/MilestoneForm";
import { Heading, Typography } from "@/components/atoms";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#e7efe7,_transparent_55%)] font-sans text-stone-800 dark:bg-[radial-gradient(ellipse_at_top_left,_#16352a,_transparent_55%)] dark:text-stone-100">
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-10 sm:py-20">
        <header className="mb-12 max-w-2xl space-y-5">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-emerald-600"
            />
            The learning studio
          </span>
          <Heading as="h1" size="4xl" color="inherit" weight="semibold">
            Big ideas. Meaningful milestones.
          </Heading>
          <Typography size="lg" color="inherit" leading="relaxed">
            Shape a learning journey that matters. Start with a topic, refine
            the possibilities, and keep the milestones that inspire you.
          </Typography>
          <ol
            aria-label="How it works"
            className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-stone-600 dark:text-stone-400"
          >
            <li>01 &nbsp; Describe</li>
            <li>02 &nbsp; Review &amp; refine</li>
            <li>03 &nbsp; Select &amp; save</li>
          </ol>
        </header>
        <div className="flex w-full flex-col gap-6">
          <MilestoneForm />
        </div>
      </main>
    </div>
  );
}

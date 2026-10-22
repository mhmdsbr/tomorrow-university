import MilestoneForm from "@/components/organisms/MilestoneForm";
import Header from "@/components/organisms/Header"

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,#e7efe7,transparent_55%)] font-sans text-stone-800 dark:bg-[radial-gradient(ellipse_at_top_left,#16352a,transparent_55%)] dark:text-stone-100">
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-10 sm:py-20">
        <Header />
        <div className="flex w-full flex-col gap-6">
          <MilestoneForm />
        </div>
      </main>
    </div>
  );
}

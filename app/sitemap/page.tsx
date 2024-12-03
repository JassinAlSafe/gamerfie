import { TimelineDemo } from "@/components/timelinePage";

// Mark as Server Component
export const dynamic = 'force-static';

export default async function SitemapPage() {
  return (
    <main 
      className="flex items-center justify-center min-h-[100dvh] bg-black text-white"
      aria-label="Sitemap Timeline"
    >
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TimelineDemo />
      </section>
    </main>
  );
}
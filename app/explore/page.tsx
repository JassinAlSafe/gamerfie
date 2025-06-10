import { ExploreContent } from "@/components/explore/ExploreContent";

export default function ExplorePage() {
  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F15] via-gray-900 to-[#0B0F15] pointer-events-none" />
      <ExploreContent />
    </div>
  );
}

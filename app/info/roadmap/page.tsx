import { InfoContent } from "@/components/layout/InfoContent";
import { RoadmapClient } from "@/components/roadmap/RoadmapClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap - Gamerfie | Our Development Plans",
  description: "See what's coming next to Gamerfie - upcoming features, improvements, and our vision for the future of game tracking.",
  keywords: ["roadmap", "features", "development", "gaming platform", "updates", "future"],
  openGraph: {
    title: "Roadmap - Gamerfie | Our Development Plans", 
    description: "Discover upcoming features and improvements planned for Gamerfie gaming platform",
    type: "website",
  },
};

export default function RoadmapPage() {
  return (
    <InfoContent
      title="Development Roadmap"
      description="Discover what's coming next to Gamerfie and our vision for the future of game tracking."
    >
      <RoadmapClient />
    </InfoContent>
  );
}
import { InfoContent } from "@/components/layout/InfoContent";
import { FAQClient } from "@/components/faq/FAQClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Gamerfie | Frequently Asked Questions",
  description: "Find answers to common questions about Gamerfie - game tracking, reviews, friends, and more. Get help with using our gaming platform.",
  keywords: ["FAQ", "help", "gaming platform", "game tracking", "support", "questions"],
  openGraph: {
    title: "FAQ - Gamerfie | Frequently Asked Questions", 
    description: "Find answers to common questions about Gamerfie gaming platform",
    type: "website",
  },
};

export default function FAQPage() {
  return (
    <InfoContent
      title="Frequently Asked Questions"
      description="Find answers to common questions about Gamerfie and how to make the most of our gaming platform."
    >
      <FAQClient />
    </InfoContent>
  );
}
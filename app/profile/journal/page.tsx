import { Container } from "@/components/ui/container";
import { JournalTab } from "@/components/journal/JournalTab";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Journal | Gamerfie",
  description:
    "Track your gaming journey with personal journal entries, reviews, and progress updates.",
};

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-gray-950 pb-12">
      <div className="w-full bg-gradient-to-b from-gray-900 to-gray-950 py-6">
        <Container>
          <h1 className="text-2xl font-bold text-white mb-2">Gaming Journal</h1>
          <p className="text-gray-400 text-sm">
            Document your gaming journey, track progress, and share your
            thoughts
          </p>
        </Container>
      </div>
      <Container>
        <JournalTab />
      </Container>
    </div>
  );
}

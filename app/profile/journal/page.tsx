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
      <div className="relative w-full bg-gradient-to-br from-purple-900/30 via-gray-900 to-gray-950 py-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]" />
        </div>
        
        <Container>
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-4 border border-purple-500/20 shadow-xl">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Gaming Journal
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                  Document your gaming journey, track progress, write reviews, and share your thoughts with the community
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      <Container className="mt-8">
        <JournalTab />
      </Container>
    </div>
  );
}

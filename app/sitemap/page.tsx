import React from "react";
import { TimelineDemo } from "@/components/timelinePage";

export default function SitemapPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <TimelineDemo />
      </div>
    </main>
  );
}
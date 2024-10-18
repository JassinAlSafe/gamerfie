import React from "react";
import { TimelineDemo } from "../../components/timelinePage";

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <TimelineDemo />
      </div>
    </div>
  );
}
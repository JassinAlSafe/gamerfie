"use client";

import { Container } from "@/components/Container";
import { JournalTab } from "@/components/journal/JournalTab";

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-[#0B0F15]">
      <Container className="py-8">
        <JournalTab />
      </Container>
    </div>
  );
}

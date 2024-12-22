"use client";

import { CreateChallenge } from "@/components/Challenges/CreateChallenge";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function CreateChallengePage() {
  const handleCreateChallenge = async (data: any) => {
    // Handle challenge creation
    console.log(data);
  };

  return (
    <div className="relative min-h-screen pt-20">
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full opacity-50" />
      <div className="relative max-w-4xl mx-auto px-4">
        <CreateChallenge onSubmit={handleCreateChallenge} />
      </div>
    </div>
  );
}

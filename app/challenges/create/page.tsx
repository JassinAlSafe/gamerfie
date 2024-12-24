"use client";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { CreateChallenge } from "@/components/Challenges/CreateChallenge";
import { useChallengesStore } from "@/store/challenges";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function CreateChallengePage() {
  const router = useRouter();
  const { createChallenge } = useChallengesStore();
  const { toast } = useToast();

  const handleCreateChallenge = async (data: any) => {
    try {
      await createChallenge(data);
      toast({
        title: "Success!",
        description: "Challenge created successfully.",
        variant: "default",
      });
      router.push("/challenges");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="relative min-h-screen pt-20 pb-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <BackgroundBeams className="opacity-20" />
      <CreateChallenge onSubmit={handleCreateChallenge} />
    </main>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function TestChallengePage() {
  const [challengeId, setChallengeId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const createTestChallenge = async () => {
    try {
      const response = await fetch("/api/challenges/test", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create test challenge");
      }

      const { challenge_id } = await response.json();
      setChallengeId(challenge_id);
      toast({
        title: "Success",
        description: "Test challenge created successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const updateProgress = async () => {
    if (!challengeId) {
      toast({
        title: "Error",
        description: "Create a test challenge first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/challenges/${challengeId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: Math.min(100, progress + 25),
          goalProgress: {
            "goal-1": Math.min(100, progress + 25),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update progress");
      }

      setProgress((prev) => Math.min(100, prev + 25));
      toast({
        title: "Success",
        description:
          progress === 75
            ? "Challenge completed! Check your badges."
            : "Progress updated successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Challenge System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={createTestChallenge} disabled={!!challengeId}>
              Create Test Challenge
            </Button>
          </div>

          {challengeId && (
            <div className="space-y-4">
              <div>
                <p>Challenge ID: {challengeId}</p>
                <p>Current Progress: {progress}%</p>
              </div>

              <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <Button onClick={updateProgress} disabled={progress >= 100}>
                Add Progress (+25%)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

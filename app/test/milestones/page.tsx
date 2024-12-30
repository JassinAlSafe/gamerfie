"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MilestoneManagement } from "@/components/challenges/MilestoneManagement";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Using valid UUID format for test challenge IDs
const TEST_CHALLENGE_ID = "123e4567-e89b-12d3-a456-426614174000";
const EMPTY_CHALLENGE_ID = "123e4567-e89b-12d3-a456-426614174001";

export default function TestMilestonesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const setupTestData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          toast.error("Please log in to use this test page");
          return;
        }
        setUserId(user.id);

        // Check if test challenges exist
        const { data: challenges, error: challengeError } = await supabase
          .from("challenges")
          .select("id")
          .in("id", [TEST_CHALLENGE_ID, EMPTY_CHALLENGE_ID]);

        if (challengeError) throw challengeError;

        // Create test challenges if they don't exist
        if (!challenges || challenges.length < 2) {
          const { error: insertError } = await supabase
            .from("challenges")
            .upsert([
              {
                id: TEST_CHALLENGE_ID,
                title: "Test Challenge",
                description: "A challenge for testing milestone management",
                type: "competitive",
                status: "upcoming",
                start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                end_date: new Date(Date.now() + 604800000).toISOString(), // Week from now
                min_participants: 1,
                max_participants: 10,
                creator_id: user.id,
                goal_type: "complete_games",
                goal_target: 5,
              },
              {
                id: EMPTY_CHALLENGE_ID,
                title: "Empty Challenge",
                description: "A challenge with no milestones",
                type: "collaborative",
                status: "upcoming",
                start_date: new Date(Date.now() + 86400000).toISOString(),
                end_date: new Date(Date.now() + 604800000).toISOString(),
                min_participants: 1,
                max_participants: 10,
                creator_id: user.id,
                goal_type: "complete_games",
                goal_target: 3,
              },
            ]);

          if (insertError) throw insertError;
          toast.success("Test challenges created successfully");
        }
      } catch (error) {
        console.error("Error setting up test data:", error);
        toast.error("Failed to set up test data");
      } finally {
        setIsLoading(false);
      }
    };

    setupTestData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            Please log in to use this test page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="prose max-w-none">
        <h1>Milestone Management Test Page</h1>
        <p>
          This page demonstrates the milestone management functionality. You can
          test different states and interactions below.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <p className="text-yellow-700">
            <strong>Note:</strong> This is a test page using sample challenge
            IDs. In a real application, these would be actual challenge IDs from
            your database.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Test Challenge ID: {TEST_CHALLENGE_ID}
            <br />
            Empty Challenge ID: {EMPTY_CHALLENGE_ID}
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Creator View */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Creator View</h2>
          <p className="text-gray-600 mb-4">
            This view shows what a challenge creator sees, with full editing
            capabilities.
          </p>
          <MilestoneManagement
            challengeId={TEST_CHALLENGE_ID}
            isCreator={true}
          />
        </section>

        {/* Participant View */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Participant View</h2>
          <p className="text-gray-600 mb-4">
            This view shows what a challenge participant sees, with read-only
            access.
          </p>
          <MilestoneManagement
            challengeId={TEST_CHALLENGE_ID}
            isCreator={false}
          />
        </section>

        {/* Empty Challenge */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Empty Challenge</h2>
          <p className="text-gray-600 mb-4">
            This view shows how an empty challenge looks (no milestones created
            yet).
          </p>
          <MilestoneManagement
            challengeId={EMPTY_CHALLENGE_ID}
            isCreator={true}
          />
        </section>
      </div>

      <div className="prose max-w-none mt-8">
        <h2>Usage Instructions</h2>
        <ul>
          <li>
            In the Creator View, you can:
            <ul>
              <li>Add new milestones using the "Add Milestone" button</li>
              <li>Edit existing milestones by clicking the edit icon</li>
              <li>Delete milestones using the delete icon</li>
              <li>Set different reward types and amounts</li>
            </ul>
          </li>
          <li>
            In the Participant View, you can:
            <ul>
              <li>View all milestones and their requirements</li>
              <li>See reward information for each milestone</li>
              <li>Track progress towards each milestone</li>
            </ul>
          </li>
          <li>
            Features demonstrated:
            <ul>
              <li>Milestone creation and management</li>
              <li>Different reward types (badges, points, titles)</li>
              <li>Progress tracking</li>
              <li>Role-based access control</li>
              <li>Error handling and validation</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}

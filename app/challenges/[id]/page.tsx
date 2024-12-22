import { Metadata } from "next";
import { ChallengeDetails } from "@/components/Challenges/ChallengeDetails";
import { ChallengeLeaderboard } from "@/components/Challenges/ChallengeLeaderboard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface ChallengePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });

  const { data: challenge } = await supabase
    .from("challenges")
    .select("title, description")
    .eq("id", params.id)
    .single();

  if (!challenge) {
    return {
      title: "Challenge Not Found | Gamerfie",
      description: "The challenge you're looking for doesn't exist",
    };
  }

  return {
    title: `${challenge.title} | Gamerfie`,
    description: challenge.description,
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const supabase = createServerComponentClient({ cookies });

  const { data: challenge, error } = await supabase
    .from("challenges")
    .select(
      `
      *,
      creator:creator_id(id, username, avatar_url),
      participants:challenge_participants(
        user:user_id(id, username, avatar_url),
        joined_at,
        progress,
        completed
      ),
      rewards:challenge_rewards(*),
      rules:challenge_rules(*),
      tags:challenge_tags(*)
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !challenge) {
    notFound();
  }

  // Get current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user is a participant
  const isParticipant =
    session &&
    challenge.participants.some((p) => p.user.id === session.user.id);

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChallengeDetails
            challenge={challenge}
            isParticipant={isParticipant}
          />
        </div>
        <div>
          <ChallengeLeaderboard challengeId={challenge.id} />
        </div>
      </div>
    </div>
  );
}

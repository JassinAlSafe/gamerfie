import { Challenge, ChallengeStatus } from "@/types/challenge";
import { ChallengeCard } from "@/components/ui/challenge-card";

type ValidChallengeStatus = Extract<
  ChallengeStatus,
  "active" | "upcoming" | "completed"
>;

type ChallengeGridProps = {
  challenges: Challenge[];
  onChallengeClick: (challengeId: string) => void;
};

type ChallengeParticipant = {
  user?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
};

export function ChallengeGrid({
  challenges,
  onChallengeClick,
}: ChallengeGridProps) {
  if (!challenges?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No challenges available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challenges.map((challenge) => {
        if (!challenge?.id) return null;
        return (
          <ChallengeCard
            key={challenge.id}
            title={challenge.title || "Untitled Challenge"}
            description={challenge.description || "No description available"}
            organizer={{
              name: challenge.creator?.username || "Unknown",
              avatar: challenge.creator?.avatar_url || undefined,
            }}
            media={challenge.media}
            coverImage={
              challenge.cover_url || "/images/placeholders/game-cover.jpg"
            }
            participantCount={
              challenge.participant_count || challenge.participants?.length || 0
            }
            participantAvatars={
              challenge.participants
                ?.slice(0, 3)
                .map((p: ChallengeParticipant) => ({
                  image: p.user?.avatar_url,
                  fallback: p.user?.username?.[0].toUpperCase() || "U",
                })) || []
            }
            status={challenge.status as ValidChallengeStatus}
            type={challenge.type}
            onAction={() => onChallengeClick(challenge.id)}
          />
        );
      })}
    </div>
  );
}

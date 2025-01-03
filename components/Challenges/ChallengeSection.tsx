import { Challenge, ChallengeStatus } from "@/types/challenge";
import { ChallengeCard } from "@/components/ui/challenge-card";
import { cn } from "@/lib/utils";

type ValidChallengeStatus = Extract<
  ChallengeStatus,
  "active" | "upcoming" | "completed"
>;

type ChallengeSectionProps = {
  status: ValidChallengeStatus;
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

export function ChallengeSection({
  status,
  challenges,
  onChallengeClick,
}: ChallengeSectionProps) {
  if (!challenges?.length) return null;

  const sectionTitles = {
    active: "Active Challenges",
    upcoming: "Upcoming Adventures",
    completed: "Past Victories",
  };

  const sectionGradients = {
    active: "from-emerald-500 to-emerald-700",
    upcoming: "from-amber-500 to-amber-700",
    completed: "from-blue-500 to-blue-700",
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={cn(
              "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
              sectionGradients[status]
            )}
          >
            {sectionTitles[status]}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {status === "active"
              ? "Your ongoing gaming challenges"
              : status === "upcoming"
              ? "Challenges starting soon"
              : "Completed challenges and achievements"}
          </p>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            status === "active"
              ? "bg-emerald-500/10 text-emerald-500"
              : status === "upcoming"
              ? "bg-amber-500/10 text-amber-500"
              : "bg-blue-500/10 text-blue-500"
          )}
        >
          {challenges.length}{" "}
          {challenges.length === 1 ? "Challenge" : "Challenges"}
        </span>
      </div>
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
                challenge.participant_count ||
                challenge.participants?.length ||
                0
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
    </section>
  );
}

import { NextResponse } from "next/server";
import { withAuth } from "../middleware";
import { 
  type Challenge, 
  type UserChallenge, 
  type ChallengeTeam 
} from "../types";

type HandlerContext = {
  supabase: any;
  session: {
    user: {
      id: string;
    };
  };
};

export const GET = withAuth(async (
  request: Request,
  params: any,
  { supabase, session }: HandlerContext
) => {
  try {
    // Get all challenges where the user is a participant
    const { data: challenges, error: challengesError } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(
          id,
          username,
          avatar_url
        ),
        goals:challenge_goals(
          *,
          progress:challenge_participant_progress!inner(
            progress,
            participant_id
          )
        ),
        teams:challenge_teams(
          *,
          participants:challenge_participants(
            user:profiles(*),
            joined_at
          ),
          progress:challenge_team_progress(*)
        ),
        rewards:challenge_rewards(*),
        rules:challenge_rules(*)
      `)
      .eq("goals.progress.participant_id", session.user.id);

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError);
      return NextResponse.json(
        { error: "Failed to fetch challenges", details: challengesError },
        { status: 500 }
      );
    }

    if (!challenges) {
      return NextResponse.json([]);
    }

    // Process challenges to include calculated progress
    const processedChallenges: UserChallenge[] = challenges.map((challenge: any) => {
      // Calculate overall progress for the user
      const userProgress = challenge.goals.reduce((sum: number, goal: any) => {
        const progressRecord = goal.progress.find(
          (p: any) => p.participant_id === session.user.id
        );
        return sum + (progressRecord?.progress || 0);
      }, 0) / (challenge.goals.length || 1);

      // Calculate progress for each team
      const teamsWithProgress = challenge.teams.map((team: ChallengeTeam) => ({
        ...team,
        progress: team.progress.reduce(
          (avg: number, p: { progress: number }) => avg + (p.progress || 0),
          0
        ) / (team.progress.length || 1),
      }));

      // Find user's team
      const userTeam = challenge.teams.find((team: ChallengeTeam) =>
        team.participants.some(p => p.user.id === session.user.id)
      );

      return {
        ...challenge,
        user_progress: userProgress,
        user_team: userTeam?.id,
        teams: teamsWithProgress,
      };
    });

    // Sort challenges by start date and status
    const sortedChallenges = processedChallenges.sort((a, b) => {
      // Active challenges first
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;

      // Then upcoming challenges
      if (a.status === "upcoming" && b.status !== "upcoming") return -1;
      if (b.status === "upcoming" && a.status !== "upcoming") return 1;

      // Sort by start date within each status
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    return NextResponse.json(sortedChallenges);
  } catch (error) {
    console.error("Error in GET /api/challenges/user:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}); 
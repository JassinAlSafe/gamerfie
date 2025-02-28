import { supabase } from "@/lib/supabase";
import {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
  ChallengeLeaderboard,
  ChallengeTeam,
} from "@/types/challenge";

export class ChallengeServices {
  static async getAllChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        goals:challenge_goals(*),
        participants:challenge_participants(
          user:user_id(id, username, avatar_url),
          joined_at,
          progress,
          completed,
          team_id
        ),
        teams:challenge_teams(
          id,
          name,
          members:challenge_participants(
            user:user_id(id, username, avatar_url),
            joined_at,
            progress,
            completed
          )
        ),
        rewards:challenge_rewards(*),
        rules:challenge_rules(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getUserChallenges(): Promise<Challenge[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("challenge_participants")
      .select(`
        challenge:challenge_id(
          *,
          creator:creator_id(id, username, avatar_url),
          goals:challenge_goals(*),
          participants:challenge_participants(
            user:user_id(id, username, avatar_url),
            joined_at,
            progress,
            completed,
            team_id
          ),
          teams:challenge_teams(
            id,
            name,
            members:challenge_participants(
              user:user_id(id, username, avatar_url),
              joined_at,
              progress,
              completed
            )
          ),
          rewards:challenge_rewards(*),
          rules:challenge_rules(*)
        )
      `)
      .eq("user_id", session.user.id);

    if (error) throw error;
    return data?.map(c => c.challenge) || [];
  }

  static async getChallengeById(id: string): Promise<Challenge> {
    const { data, error } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        goals:challenge_goals(*),
        participants:challenge_participants(
          user:user_id(id, username, avatar_url),
          joined_at,
          progress,
          completed,
          team_id
        ),
        teams:challenge_teams(
          id,
          name,
          members:challenge_participants(
            user:user_id(id, username, avatar_url),
            joined_at,
            progress,
            completed
          )
        ),
        rewards:challenge_rewards(*),
        rules:challenge_rules(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createChallenge(data: CreateChallengeInput): Promise<Challenge> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    // Start a transaction
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .insert({
        title: data.title,
        description: data.description,
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date,
        creator_id: session.user.id,
        status: "upcoming",
        requirements: data.requirements,
        min_participants: data.min_participants,
        max_participants: data.max_participants,
      })
      .select()
      .single();

    if (challengeError) throw challengeError;

    // Create goals
    if (data.goals?.length > 0) {
      const { error: goalsError } = await supabase
        .from("challenge_goals")
        .insert(
          data.goals.map(goal => ({
            ...goal,
            challenge_id: challenge.id,
          }))
        );

      if (goalsError) throw goalsError;
    }

    // Create rewards if any
    if (data.rewards?.length > 0) {
      const { error: rewardsError } = await supabase
        .from("challenge_rewards")
        .insert(
          data.rewards.map(reward => ({
            ...reward,
            challenge_id: challenge.id,
          }))
        );

      if (rewardsError) throw rewardsError;
    }

    // Create rules if any
    if (data.rules?.length > 0) {
      const { error: rulesError } = await supabase
        .from("challenge_rules")
        .insert(
          data.rules.map(rule => ({
            rule,
            challenge_id: challenge.id,
          }))
        );

      if (rulesError) throw rulesError;
    }

    return this.getChallengeById(challenge.id);
  }

  static async updateChallenge(id: string, data: UpdateChallengeInput): Promise<Challenge> {
    const { error } = await supabase
      .from("challenges")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    return this.getChallengeById(id);
  }

  static async deleteChallenge(id: string): Promise<void> {
    const { error } = await supabase
      .from("challenges")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async joinChallenge(challengeId: string, teamId?: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { error } = await supabase
      .from("challenge_participants")
      .insert({
        challenge_id: challengeId,
        user_id: session.user.id,
        team_id: teamId,
        progress: 0,
        completed: false,
        joined_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  static async leaveChallenge(challengeId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { error } = await supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", session.user.id);

    if (error) throw error;
  }

  static async updateProgress(
    challengeId: string, 
    goalId: string, 
    progress: number
  ): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    // Update individual goal progress
    const { error: progressError } = await supabase
      .from("challenge_participant_progress")
      .upsert({
        participant_id: session.user.id,
        goal_id: goalId,
        progress,
        updated_at: new Date().toISOString(),
      });

    if (progressError) throw progressError;

    // Calculate and update overall progress
    const { data: totalProgress } = await supabase
      .rpc("calculate_challenge_progress", {
        p_challenge_id: challengeId,
        p_participant_id: session.user.id,
      });

    const { error: updateError } = await supabase
      .from("challenge_participants")
      .update({
        progress: totalProgress,
        completed: totalProgress >= 100,
        updated_at: new Date().toISOString(),
      })
      .eq("challenge_id", challengeId)
      .eq("user_id", session.user.id);

    if (updateError) throw updateError;
  }

  static async createTeam(
    challengeId: string,
    name: string
  ): Promise<ChallengeTeam> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { data: team, error: teamError } = await supabase
      .from("challenge_teams")
      .insert({
        challenge_id: challengeId,
        name,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Join the team automatically
    await this.joinTeam(challengeId, team.id);

    return team;
  }

  static async joinTeam(
    challengeId: string,
    teamId: string
  ): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { error } = await supabase
      .from("challenge_participants")
      .update({ team_id: teamId })
      .eq("challenge_id", challengeId)
      .eq("user_id", session.user.id);

    if (error) throw error;
  }

  static async leaveTeam(challengeId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { error } = await supabase
      .from("challenge_participants")
      .update({ team_id: null })
      .eq("challenge_id", challengeId)
      .eq("user_id", session.user.id);

    if (error) throw error;
  }

  static async getLeaderboard(challengeId: string): Promise<ChallengeLeaderboard> {
    const { data, error } = await supabase
      .from("challenge_participants")
      .select(`
        user:user_id(id, username, avatar_url),
        progress,
        completed,
        team_id
      `)
      .eq("challenge_id", challengeId)
      .order("progress", { ascending: false });

    if (error) throw error;

    const rankings = data?.map((p, index) => ({
      rank: index + 1,
      user_id: p.user.id,
      username: p.user.username,
      avatar_url: p.user.avatar_url,
      progress: p.progress,
      completed: p.completed,
      team_id: p.team_id,
    })) || [];

    return { challenge_id: challengeId, rankings };
  }
} 
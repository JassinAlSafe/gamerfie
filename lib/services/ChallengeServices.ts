import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
  ChallengeLeaderboard,
} from "@/types/challenge";

export class ChallengeServices {
  private static supabase = createClientComponentClient();

  static async getAllChallenges(): Promise<Challenge[]> {
    const { data, error } = await this.supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        participants:challenge_participants(
          user:user_id(id, username, avatar_url),
          joined_at,
          progress,
          completed
        ),
        rewards:challenge_rewards(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getUserChallenges(): Promise<Challenge[]> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { data, error } = await this.supabase
      .from("challenge_participants")
      .select(`
        challenge:challenge_id(
          *,
          creator:creator_id(id, username, avatar_url),
          participants:challenge_participants(
            user:user_id(id, username, avatar_url),
            joined_at,
            progress,
            completed
          ),
          rewards:challenge_rewards(*)
        )
      `)
      .eq("user_id", session.user.id);

    if (error) throw error;
    return data?.map(c => c.challenge) || [];
  }

  static async getChallengeById(id: string): Promise<Challenge> {
    const { data, error } = await this.supabase
      .from("challenges")
      .select(`
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
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createChallenge(data: CreateChallengeInput): Promise<Challenge> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    // Start a transaction by using single batch
    const { data: challenge, error: challengeError } = await this.supabase
      .from("challenges")
      .insert({
        ...data,
        creator_id: session.user.id,
        status: "upcoming",
      })
      .select()
      .single();

    if (challengeError) throw challengeError;

    // Create rewards if any
    if (data.rewards?.length > 0) {
      const { error: rewardsError } = await this.supabase
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
      const { error: rulesError } = await this.supabase
        .from("challenge_rules")
        .insert(
          data.rules.map(rule => ({
            rule,
            challenge_id: challenge.id,
          }))
        );

      if (rulesError) throw rulesError;
    }

    // Create tags if any
    if (data.tags?.length > 0) {
      const { error: tagsError } = await this.supabase
        .from("challenge_tags")
        .insert(
          data.tags.map(tag => ({
            tag,
            challenge_id: challenge.id,
          }))
        );

      if (tagsError) throw tagsError;
    }

    return this.getChallengeById(challenge.id);
  }

  static async updateChallenge(id: string, data: UpdateChallengeInput): Promise<Challenge> {
    const { error } = await this.supabase
      .from("challenges")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    return this.getChallengeById(id);
  }

  static async deleteChallenge(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("challenges")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async joinChallenge(challengeId: string): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { error } = await this.supabase
      .from("challenge_participants")
      .insert({
        challenge_id: challengeId,
        user_id: session.user.id,
        progress: 0,
        completed: false,
      });

    if (error) throw error;
  }

  static async leaveChallenge(challengeId: string): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { error } = await this.supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", session.user.id);

    if (error) throw error;
  }

  static async updateProgress(challengeId: string, progress: number): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) throw new Error("No authenticated user");

    const { error } = await this.supabase
      .from("challenge_participants")
      .update({
        progress,
        completed: progress >= 100,
      })
      .eq("challenge_id", challengeId)
      .eq("user_id", session.user.id);

    if (error) throw error;
  }

  static async getLeaderboard(challengeId: string): Promise<ChallengeLeaderboard> {
    const { data, error } = await this.supabase
      .from("challenge_participants")
      .select(`
        user:user_id(id, username, avatar_url),
        progress,
        completed
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
    })) || [];

    return { challenge_id: challengeId, rankings };
  }
} 
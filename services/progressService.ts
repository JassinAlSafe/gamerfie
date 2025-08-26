/**
 * Progress Service - Handle game progress tracking and history
 * Based on the documented progress tracking system
 */

import { createClient } from '@/utils/supabase/client';
import { APIError } from '@/utils/api';
import type { ProgressDataPoint, AchievementDataPoint } from '@/components/progress/ProgressHistory';

export interface GameProgress {
  id: string;
  user_id: string;
  game_id: string;
  play_time: number;
  completion_percentage: number;
  last_played_at: string;
  achievements_unlocked: number;
  total_achievements: number;
  status: 'playing' | 'completed' | 'want_to_play' | 'dropped';
  created_at: string;
  updated_at: string;
}

export interface ProgressSession {
  id: string;
  user_id: string;
  game_id: string;
  start_time: string;
  end_time?: string;
  duration: number; // minutes
  notes?: string;
  achievements_unlocked?: string[];
  progress_delta?: number;
}

export interface AchievementUnlock {
  id: string;
  user_id: string;
  game_id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_description: string;
  rarity: number;
  unlocked_at: string;
}

export class ProgressService {
  private static supabase = createClient();

  /**
   * Get user's progress history for a specific game
   */
  static async getGameProgressHistory(
    gameId: string,
    days: number = 30
  ): Promise<{
    playTimeHistory: ProgressDataPoint[];
    achievementHistory: AchievementDataPoint[];
    totalPlayTime: number;
    totalAchievements: number;
    completionPercentage: number;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get game sessions for playtime history
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: true });

      if (sessionsError) {
        throw new APIError('Failed to fetch game sessions', 500, 'DATABASE_ERROR', sessionsError);
      }

      // Get achievement unlocks for achievement history
      const { data: achievements, error: achievementsError } = await this.supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(name, description, rarity)
        `)
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .gte('unlocked_at', startDate.toISOString())
        .order('unlocked_at', { ascending: true });

      if (achievementsError) {
        throw new APIError('Failed to fetch achievements', 500, 'DATABASE_ERROR', achievementsError);
      }

      // Get current game progress
      const { data: currentProgress } = await this.supabase
        .from('user_games')
        .select('play_time, completion_percentage')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single();

      // Process playtime history
      const playTimeMap = new Map<string, ProgressDataPoint>();
      
      // Initialize all dates with zero hours
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateKey = date.toISOString().split('T')[0];
        
        playTimeMap.set(dateKey, {
          date: dateKey,
          hours: 0,
          sessions: 0,
          completionPercentage: 0
        });
      }

      // Add session data
      sessions?.forEach(session => {
        const dateKey = session.start_time.split('T')[0];
        const existing = playTimeMap.get(dateKey);
        if (existing && existing.sessions !== undefined) {
          existing.hours += (session.duration || 0) / 60; // Convert minutes to hours
          existing.sessions += 1;
        }
      });

      const playTimeHistory = Array.from(playTimeMap.values());

      // Process achievement history
      const achievementMap = new Map<string, AchievementDataPoint>();

      achievements?.forEach(unlock => {
        const dateKey = unlock.unlocked_at.split('T')[0];
        const existing = achievementMap.get(dateKey);
        
        if (existing) {
          existing.count += 1;
          existing.achievements.push({
            id: unlock.achievement_id,
            name: unlock.achievement?.name || 'Unknown Achievement',
            rarity: unlock.achievement?.rarity || 0
          });
        } else {
          achievementMap.set(dateKey, {
            date: dateKey,
            count: 1,
            achievements: [{
              id: unlock.achievement_id,
              name: unlock.achievement?.name || 'Unknown Achievement',
              rarity: unlock.achievement?.rarity || 0
            }]
          });
        }
      });

      const achievementHistory = Array.from(achievementMap.values());

      // Get totals
      const totalPlayTime = currentProgress?.play_time || 0;
      const totalAchievements = achievements?.length || 0;
      const completionPercentage = currentProgress?.completion_percentage || 0;

      return {
        playTimeHistory,
        achievementHistory,
        totalPlayTime,
        totalAchievements,
        completionPercentage
      };

    } catch (error) {
      console.error('Error fetching game progress history:', error);
      throw error;
    }
  }

  /**
   * Start a new gaming session
   */
  static async startSession(gameId: string, notes?: string): Promise<string> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { data: session, error } = await this.supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_id: gameId,
          start_time: new Date().toISOString(),
          notes
        })
        .select()
        .single();

      if (error) {
        throw new APIError('Failed to start session', 500, 'DATABASE_ERROR', error);
      }

      return session.id;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * End a gaming session
   */
  static async endSession(
    sessionId: string, 
    achievementsUnlocked?: string[],
    progressDelta?: number
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      // Get session to calculate duration
      const { data: session } = await this.supabase
        .from('game_sessions')
        .select('start_time, game_id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (!session) {
        throw new APIError('Session not found', 404);
      }

      const endTime = new Date();
      const startTime = new Date(session.start_time);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

      // Update session
      const { error: sessionError } = await this.supabase
        .from('game_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration,
          achievements_unlocked: achievementsUnlocked,
          progress_delta: progressDelta
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (sessionError) {
        throw new APIError('Failed to end session', 500, 'DATABASE_ERROR', sessionError);
      }

      // Update total play time in user_games
      const { error: updateError } = await this.supabase
        .rpc('update_game_playtime', {
          p_user_id: user.id,
          p_game_id: session.game_id,
          p_additional_minutes: duration
        });

      if (updateError) {
        console.warn('Failed to update total playtime:', updateError);
      }

    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Update game progress
   */
  static async updateProgress(
    gameId: string,
    updates: {
      completion_percentage?: number;
      status?: 'playing' | 'completed' | 'want_to_play' | 'dropped';
      notes?: string;
    }
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { error } = await this.supabase
        .from('user_games')
        .upsert({
          user_id: user.id,
          game_id: gameId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new APIError('Failed to update progress', 500, 'DATABASE_ERROR', error);
      }

    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Record achievement unlock
   */
  static async recordAchievementUnlock(
    gameId: string,
    achievementId: string,
    achievementData: {
      name: string;
      description: string;
      rarity: number;
    }
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { error } = await this.supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          game_id: gameId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw new APIError('Failed to record achievement', 500, 'DATABASE_ERROR', error);
      }

      // Create activity for achievement unlock
      try {
        const { ActivityService } = await import('./activityService');
        await ActivityService.createActivity({
          type: 'achievement_unlocked',
          game_id: gameId,
          achievement_id: achievementId,
          metadata: {
            achievement_name: achievementData.name,
            achievement_description: achievementData.description,
            achievement_rarity: achievementData.rarity
          }
        });
      } catch (activityError) {
        console.warn('Failed to create achievement activity:', activityError);
      }

    } catch (error) {
      console.error('Error recording achievement unlock:', error);
      throw error;
    }
  }

  /**
   * Get user's overall progress stats
   */
  static async getUserProgressStats(userId?: string): Promise<{
    totalGames: number;
    gamesCompleted: number;
    totalPlayTime: number;
    totalAchievements: number;
    avgCompletionRate: number;
    mostPlayedGames: Array<{
      game_id: string;
      game_name: string;
      play_time: number;
    }>;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new APIError('User not authenticated', 401);
      }

      // Get user games with stats
      const { data: userGames, error } = await this.supabase
        .from('user_games')
        .select(`
          *,
          game:games(name)
        `)
        .eq('user_id', targetUserId);

      if (error) {
        throw new APIError('Failed to fetch user games', 500, 'DATABASE_ERROR', error);
      }

      // Calculate stats
      const totalGames = userGames?.length || 0;
      const gamesCompleted = userGames?.filter(g => g.status === 'completed').length || 0;
      const totalPlayTime = userGames?.reduce((sum, g) => sum + (g.play_time || 0), 0) || 0;
      
      // Get total achievements
      const { count: totalAchievements } = await this.supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      // Calculate average completion rate
      const completionRates = userGames?.filter(g => g.completion_percentage > 0)
        .map(g => g.completion_percentage) || [];
      const avgCompletionRate = completionRates.length > 0 
        ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length 
        : 0;

      // Get most played games
      const mostPlayedGames = userGames
        ?.sort((a, b) => (b.play_time || 0) - (a.play_time || 0))
        .slice(0, 5)
        .map(g => ({
          game_id: g.game_id,
          game_name: g.game?.name || 'Unknown Game',
          play_time: g.play_time || 0
        })) || [];

      return {
        totalGames,
        gamesCompleted,
        totalPlayTime,
        totalAchievements: totalAchievements || 0,
        avgCompletionRate,
        mostPlayedGames
      };

    } catch (error) {
      console.error('Error fetching user progress stats:', error);
      throw error;
    }
  }
}
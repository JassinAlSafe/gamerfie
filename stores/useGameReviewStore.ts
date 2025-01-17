'use client';

import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createActivity } from '@/lib/activity';

interface GameReview {
  id: string;
  gameId: string;
  userId: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface GameReviewStore {
  reviews: GameReview[];
  userReviews: GameReview[];
  isLoading: boolean;
  error: string | null;
  createReview: (gameId: string, rating: number, content: string) => Promise<void>;
  updateReview: (reviewId: string, rating: number, content: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  fetchGameReviews: (gameId: string) => Promise<void>;
  fetchUserReviews: () => Promise<void>;
}

export const useGameReviewStore = create<GameReviewStore>((set, get) => ({
  reviews: [],
  userReviews: [],
  isLoading: false,
  error: null,

  createReview: async (gameId: string, rating: number, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      // Create journal entry for the review
      const { data: review, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: session.session.user.id,
          type: 'review',
          game_id: gameId,
          rating,
          content,
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Create activity for the review
      await createActivity('review', gameId, {
        rating,
        content
      });

      // Update user_games table
      await supabase
        .from('user_games')
        .upsert({
          user_id: session.session.user.id,
          game_id: gameId,
          user_rating: rating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,game_id'
        });

      // Refresh reviews
      await get().fetchUserReviews();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateReview: async (reviewId: string, rating: number, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data: review, error } = await supabase
        .from('journal_entries')
        .update({
          rating,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('user_id', session.session.user.id)
        .select()
        .single();

      if (error) throw error;

      // Update user_games rating
      if (review.game_id) {
        await supabase
          .from('user_games')
          .upsert({
            user_id: session.session.user.id,
            game_id: review.game_id,
            user_rating: rating,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,game_id'
          });
      }

      // Refresh reviews
      await get().fetchUserReviews();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteReview: async (reviewId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      // Refresh reviews
      await get().fetchUserReviews();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGameReviews: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          user:profiles (
            username,
            avatar_url
          )
        `)
        .eq('type', 'review')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ reviews: data as GameReview[] });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('type', 'review')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ userReviews: data as GameReview[] });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
})); 
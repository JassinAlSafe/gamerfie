import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Force dynamic rendering due to cookies usage
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user - using getUser() instead of getSession() for better security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user library stats - using correct column names from database schema
    const { data: libraryStats, error: libraryError } = await supabase
      .from('user_games')
      .select('status, user_rating, play_time')
      .eq('user_id', user.id);

    if (libraryError) {
      console.error('Error fetching library stats:', libraryError);
      return NextResponse.json({ error: 'Failed to fetch library stats' }, { status: 500 });
    }

    // Calculate library statistics with proper validation
    const totalGames = libraryStats?.length || 0;
    const completedGames = libraryStats?.filter(game => 
      game.status === 'completed'
    ).length || 0;
    
    // Calculate total playtime (play_time is stored as double precision in hours)
    const totalPlaytime = libraryStats?.reduce((sum, game) => {
      const hours = parseFloat(game.play_time?.toString() || '0') || 0;
      return sum + hours;
    }, 0) || 0;
    
    // Calculate average rating (user_rating is stored as double precision 0-10)
    const ratedGames = libraryStats?.filter(game => 
      game.user_rating && !isNaN(parseFloat(game.user_rating?.toString() || '0'))
    ) || [];
    const avgRating = ratedGames.length > 0 
      ? ratedGames.reduce((sum, game) => sum + (parseFloat(game.user_rating?.toString() || '0') || 0), 0) / ratedGames.length
      : 0;

    // Get journal stats
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('type, rating, hours_played')
      .eq('user_id', user.id);

    if (journalError) {
      console.warn('Journal stats not available:', journalError);
    }

    // Calculate journal stats
    const journalStats = journalEntries ? {
      total_entries: journalEntries.length,
      total_reviews: journalEntries.filter(entry => entry.type === 'review').length,
      avg_rating: journalEntries.filter(entry => entry.rating).length > 0 
        ? journalEntries.filter(entry => entry.rating).reduce((sum, entry) => sum + (entry.rating || 0), 0) / journalEntries.filter(entry => entry.rating).length
        : 0,
      total_playtime: journalEntries.reduce((sum, entry) => sum + (entry.hours_played || 0), 0)
    } : {
      total_entries: 0,
      total_reviews: 0,
      avg_rating: 0,
      total_playtime: 0
    };

    // Get recent activity count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentActivities, error: activityError } = await supabase
      .from('friend_activities')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (activityError) {
      console.warn('Activity stats not available:', activityError);
    }

    const recentActivitiesCount = recentActivities?.length || 0;

    return NextResponse.json({
      total_games: totalGames,
      completed_games: completedGames,
      total_playtime: Math.round(totalPlaytime * 100) / 100, // Round to 2 decimal places
      avg_rating: Math.round(avgRating * 100) / 100, // Round to 2 decimal places
      recent_activities: recentActivitiesCount,
      journal: journalStats
    });
  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user - using getUser() instead of getSession() for better security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the optimized get_user_activity_summary function
    const { data: userStats, error } = await supabase
      .rpc('get_user_activity_summary', { 
        user_uuid: user.id 
      });

    if (error) {
      console.error('Error fetching user stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user statistics' },
        { status: 500 }
      );
    }

    // Get journal stats directly from journal_entries table
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

    return NextResponse.json({
      ...userStats,
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
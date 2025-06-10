import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the optimized get_challenge_leaderboard function
    const { data: leaderboard, error } = await supabase
      .rpc('get_challenge_leaderboard', {
        challenge_id: params.id
      });

    if (error) {
      console.error('Error fetching challenge leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch challenge leaderboard' },
        { status: 500 }
      );
    }

    // Also get challenge overview for additional context
    const { data: overview, error: overviewError } = await supabase
      .from('challenge_overview')
      .select('*')
      .eq('id', params.id)
      .single();

    if (overviewError) {
      console.warn('Challenge overview not available:', overviewError);
    }

    return NextResponse.json({
      leaderboard: leaderboard || [],
      challenge: overview || null,
      total_participants: leaderboard?.length || 0
    });
  } catch (error) {
    console.error('Challenge leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
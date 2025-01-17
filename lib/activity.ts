import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ActivityDetails {
  comment?: string;
  progress?: number;
  rating?: number;
}

export async function createActivity(
  activity_type: string,
  game_id: string,
  details?: ActivityDetails
) {
  const supabase = createClientComponentClient();
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error('Not authenticated');

  try {
    const { error } = await supabase
      .from('friend_activities')
      .insert({
        user_id: session.session.user.id,
        game_id,
        activity_type,
        details,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

export async function updateGameTimestamps(gameId: string) {
  const supabase = createClientComponentClient();
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;

  const timestamp = new Date().toISOString();
  
  // Update user_games timestamp
  await supabase
    .from('user_games')
    .update({ updated_at: timestamp })
    .eq('user_id', session.session.user.id)
    .eq('game_id', gameId);

  // Update game_progress_history timestamp
  await supabase
    .from('game_progress_history')
    .update({ updated_at: timestamp })
    .eq('user_id', session.session.user.id)
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(1);
} 
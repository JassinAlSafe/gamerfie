import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/hooks/use-profile';
import { useProgressStore } from '@/stores/progress-store';
import { Game } from '@/types/game';

export function GameProgressUpdate({ game }: { game: Game }) {
  const { profile } = useProfile();
  const { updateGameStatus } = useProgressStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    if (!profile?.id) return;
    
    setIsUpdating(true);
    
    const gameData = {
      id: game.id.toString(),
      name: game.name,
      cover_url: game.cover?.url,
      rating: game.total_rating || null,
      first_release_date: game.first_release_date || null,
      platforms: game.platforms || [],
      genres: game.genres || [],
    };

    try {
      await updateGameStatus(profile.id, gameData, status);
    } catch (error) {
      console.error('Error updating game status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : `Status: ${game.status || 'Not Set'}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleStatusUpdate('want_to_play')}>
          Want to Play
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate('playing')}>
          Currently Playing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>
          Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate('dropped')}>
          Dropped
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
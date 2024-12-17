import { useState, useEffect } from 'react';
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
import { useProgressStore } from '@/stores/useProgressStore';
import { Game } from '@/types/game';

export function GameProgressUpdate({ game }: { game: Game }) {
  const { profile } = useProfile();
  const { status, loading: isLoading, updateGameStatus, fetchProgress } = useProgressStore();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile?.id && game?.id) {
      fetchProgress(profile.id.toString(), game.id.toString());
    }
  }, [profile?.id, game?.id, fetchProgress]);

  const handleStatusUpdate = async (newStatus: string) => {
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
      await updateGameStatus(profile.id.toString(), gameData.id, newStatus, gameData);
    } catch (error) {
      console.error('Error updating game status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isDisabled = isUpdating || isLoading;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isDisabled}>
          {isDisabled ? 'Updating...' : `Status: ${status || 'Not Set'}`}
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
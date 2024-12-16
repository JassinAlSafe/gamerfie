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

interface GameProgressUpdateProps {
  gameId: string;
  userId: string;
  currentStatus: string | null;
  onStatusUpdate: (newStatus: string) => void;
}

export function GameProgressUpdate({
  gameId,
  userId,
  currentStatus,
  onStatusUpdate
}: GameProgressUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          status: newStatus,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      onStatusUpdate(newStatus);
      toast.success('Progress updated');
    } catch (error) {
      toast.error('Failed to update progress');
      console.error('Status update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : `Status: ${currentStatus || 'Not Set'}`}
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
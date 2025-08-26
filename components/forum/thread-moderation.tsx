"use client";

import React, { useState } from "react";
import { Lock, Unlock, Pin, PinOff, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { DeleteButton } from "./delete-button";
import type { ForumThread } from "@/types/forum";

interface ThreadModerationProps {
  thread: ForumThread;
  /** Callback when thread is updated */
  onThreadUpdated?: (updatedThread: Partial<ForumThread>) => void;
  /** Callback when thread is deleted */
  onThreadDeleted?: () => void;
  /** Show as badges only (for display) or include action buttons */
  displayOnly?: boolean;
}

/**
 * Thread moderation component for admins and moderators
 * Handles locking, pinning, and deletion of threads
 */
export function ThreadModeration({
  thread,
  onThreadUpdated,
  onThreadDeleted,
  displayOnly = false
}: ThreadModerationProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, profile } = useAuthStore();
  const { toast } = useToast();

  const isAuthor = user?.id === thread.author_id;
  const isModerator = profile?.role === 'moderator' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  const canModerate = isModerator || isAdmin;

  const handleToggleLock = async () => {
    if (!canModerate || isUpdating) return;

    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/forum/threads/${thread.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_locked: !thread.is_locked
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update thread' }));
        throw new Error(errorData.error || 'Failed to update thread');
      }

      await response.json();
      
      toast({
        title: "Success",
        description: `Thread ${thread.is_locked ? 'unlocked' : 'locked'} successfully`,
      });

      onThreadUpdated?.({ is_locked: !thread.is_locked });
      
    } catch (error) {
      console.error('Error updating thread lock status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update thread',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePin = async () => {
    if (!canModerate || isUpdating) return;

    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/forum/threads/${thread.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_pinned: !thread.is_pinned
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update thread' }));
        throw new Error(errorData.error || 'Failed to update thread');
      }

      await response.json();
      
      toast({
        title: "Success",
        description: `Thread ${thread.is_pinned ? 'unpinned' : 'pinned'} successfully`,
      });

      onThreadUpdated?.({ is_pinned: !thread.is_pinned });
      
    } catch (error) {
      console.error('Error updating thread pin status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update thread',
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Display only mode - just show status badges
  if (displayOnly) {
    return (
      <div className="flex items-center gap-2">
        {thread.is_pinned && (
          <Badge variant="secondary" className="text-xs">
            <Pin className="mr-1 h-3 w-3" />
            Pinned
          </Badge>
        )}
        {thread.is_locked && (
          <Badge variant="outline" className="text-xs">
            <Lock className="mr-1 h-3 w-3" />
            Locked
          </Badge>
        )}
      </div>
    );
  }

  // No moderation powers
  if (!canModerate && !isAuthor) {
    return (
      <div className="flex items-center gap-2">
        {thread.is_pinned && (
          <Badge variant="secondary" className="text-xs">
            <Pin className="mr-1 h-3 w-3" />
            Pinned
          </Badge>
        )}
        {thread.is_locked && (
          <Badge variant="outline" className="text-xs">
            <Lock className="mr-1 h-3 w-3" />
            Locked
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status badges */}
      {thread.is_pinned && (
        <Badge variant="secondary" className="text-xs">
          <Pin className="mr-1 h-3 w-3" />
          Pinned
        </Badge>
      )}
      {thread.is_locked && (
        <Badge variant="outline" className="text-xs">
          <Lock className="mr-1 h-3 w-3" />
          Locked
        </Badge>
      )}

      {/* Moderation actions dropdown */}
      {canModerate && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Shield className="h-4 w-4" />
              <span className="sr-only">Moderation actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Lock/Unlock */}
            <DropdownMenuItem
              onClick={handleToggleLock}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : thread.is_locked ? (
                <Unlock className="mr-2 h-4 w-4" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {thread.is_locked ? 'Unlock thread' : 'Lock thread'}
            </DropdownMenuItem>

            {/* Pin/Unpin */}
            <DropdownMenuItem
              onClick={handleTogglePin}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : thread.is_pinned ? (
                <PinOff className="mr-2 h-4 w-4" />
              ) : (
                <Pin className="mr-2 h-4 w-4" />
              )}
              {thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Delete thread */}
            <DeleteButton
              type="thread"
              id={thread.id}
              isAuthor={isAuthor}
              userRole={profile?.role}
              variant="dropdown"
              onDeleted={onThreadDeleted}
              customWarning={
                thread.replies_count > 0
                  ? `This thread has ${thread.replies_count} replies. Deleting it will remove all replies as well.`
                  : undefined
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/**
 * Simple thread status display for lists
 */
export function ThreadStatus({ 
  thread,
  className = ""
}: { 
  thread: Pick<ForumThread, 'is_pinned' | 'is_locked'>;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {thread.is_pinned && (
        <Pin className="h-3 w-3 text-blue-500" />
      )}
      {thread.is_locked && (
        <Lock className="h-3 w-3 text-gray-500" />
      )}
    </div>
  );
}

/**
 * Thread actions for the thread author (non-moderator actions)
 */
export function ThreadAuthorActions({
  thread,
  onEdit,
  onDeleted,
}: {
  thread: ForumThread;
  onEdit?: () => void;
  onDeleted?: () => void;
}) {
  const { user, profile } = useAuthStore();
  const isAuthor = user?.id === thread.author_id;

  if (!isAuthor) return null;

  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-sm"
        >
          Edit Thread
        </Button>
      )}
      
      <DeleteButton
        type="thread"
        id={thread.id}
        isAuthor={isAuthor}
        userRole={profile?.role}
        onDeleted={onDeleted}
        customWarning={
          thread.replies_count > 0
            ? `This thread has ${thread.replies_count} replies. You can only delete it within 1 hour of creation if it has replies.`
            : undefined
        }
      />
    </div>
  );
}
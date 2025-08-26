"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface DeleteButtonProps {
  /** Type of content being deleted */
  type: 'post' | 'thread';
  /** ID of the content to delete */
  id: string;
  /** Whether user is the author of the content */
  isAuthor: boolean;
  /** User's role (admin, moderator, user) */
  userRole?: string;
  /** Whether to show as dropdown menu item vs standalone button */
  variant?: 'button' | 'dropdown';
  /** Callback when content is successfully deleted */
  onDeleted?: () => void;
  /** Custom deletion reason/warning message */
  customWarning?: string;
  /** Whether the delete button should be disabled */
  disabled?: boolean;
}

/**
 * Reusable delete button component for forum posts and threads
 * Handles permissions, confirmation dialog, and API calls
 */
export function DeleteButton({
  type,
  id,
  isAuthor,
  userRole,
  variant = 'button',
  onDeleted,
  customWarning,
  disabled = false
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Check if user can delete this content
  const canDelete = React.useMemo(() => {
    if (disabled) return false;
    
    // Admins and moderators can delete anything
    if (userRole === 'admin' || userRole === 'moderator') {
      return true;
    }
    
    // Authors can delete their own content
    if (isAuthor) {
      return true;
    }
    
    return false;
  }, [isAuthor, userRole, disabled]);

  const deleteEndpoint = type === 'post' 
    ? `/api/forum/posts/${id}`
    : `/api/forum/threads/${id}`;

  const getWarningMessage = () => {
    if (customWarning) return customWarning;
    
    const contentType = type === 'post' ? 'post' : 'thread';
    const baseMessage = `Are you sure you want to delete this ${contentType}?`;
    
    if (type === 'thread') {
      return `${baseMessage} This will also delete all replies in this thread.`;
    }
    
    return `${baseMessage} This action cannot be undone.`;
  };

  const handleDelete = async (hardDelete: boolean = false) => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    
    try {
      const url = hardDelete ? `${deleteEndpoint}?hard=true` : deleteEndpoint;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete' }));
        throw new Error(errorData.error || `Failed to delete ${type}`);
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message || `${type === 'post' ? 'Post' : 'Thread'} deleted successfully`,
      });

      // Close dialog and call callback
      setIsOpen(false);
      onDeleted?.();
      
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to delete ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canDelete) {
    return null;
  }

  const DeleteTrigger = variant === 'dropdown' ? (
    <DropdownMenuItem 
      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
      onSelect={(e) => {
        e.preventDefault();
        setIsOpen(true);
      }}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete {type}
    </DropdownMenuItem>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
      disabled={disabled || isDeleting}
      onClick={() => setIsOpen(true)}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {variant === 'button' && (
        <span className="ml-2">Delete</span>
      )}
    </Button>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {DeleteTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete {type === 'post' ? 'Post' : 'Thread'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {getWarningMessage()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <div className="flex gap-2">
            {/* Soft delete - default option */}
            <AlertDialogAction
              onClick={() => handleDelete(false)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
            
            {/* Hard delete - only for admins */}
            {userRole === 'admin' && (
              <AlertDialogAction
                onClick={() => handleDelete(true)}
                disabled={isDeleting}
                className="bg-red-800 hover:bg-red-900"
              >
                Delete Permanently
              </AlertDialogAction>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to check if current user can delete specific content
 */
export function useCanDelete(
  authorId: string,
  currentUserId?: string,
  userRole?: string
) {
  return React.useMemo(() => {
    if (!currentUserId) return false;
    
    // Admins and moderators can delete anything
    if (userRole === 'admin' || userRole === 'moderator') {
      return true;
    }
    
    // Authors can delete their own content
    if (authorId === currentUserId) {
      return true;
    }
    
    return false;
  }, [authorId, currentUserId, userRole]);
}
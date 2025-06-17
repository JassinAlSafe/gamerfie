"use client";

import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface PlaylistKeyboardShortcutsProps {
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onToggleView?: () => void;
}

export const PlaylistKeyboardShortcuts: React.FC<PlaylistKeyboardShortcutsProps> = ({
  onLike,
  onBookmark,
  onShare,
  onToggleView,
}) => {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'l':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            onLike();
          }
          break;
        case 'b':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            onBookmark();
          }
          break;
        case 's':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            onShare();
          }
          break;
        case 'v':
          if (!event.metaKey && !event.ctrlKey && onToggleView) {
            event.preventDefault();
            onToggleView();
          }
          break;
        case '?':
          event.preventDefault();
          showShortcuts();
          break;
      }
    };

    const showShortcuts = () => {
      toast({
        title: "Keyboard Shortcuts",
        description: "L - Like/Unlike • B - Bookmark • S - Share • V - Toggle View • ? - Show shortcuts",
      });
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onLike, onBookmark, onShare, onToggleView, toast]);

  return null;
};
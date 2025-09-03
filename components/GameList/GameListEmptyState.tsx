"use client";

import { memo } from "react";
import { Gamepad2, MessageCircle } from "lucide-react";

interface GameListEmptyStateProps {
  variant: 'games' | 'comments';
}

export const GameListEmptyState = memo<GameListEmptyStateProps>(function GameListEmptyState({ variant }) {
  const config = variant === 'games' 
    ? {
        icon: <Gamepad2 className="w-6 h-6 text-gray-400" />,
        title: 'No games yet',
        description: 'This list is empty. Games added to this list will appear here.'
      }
    : {
        icon: <MessageCircle className="w-6 h-6 text-gray-400" />,
        title: 'No comments yet',
        description: 'Be the first to share your thoughts about this list!'
      };

  return (
    <div className="text-center py-12">
      <div className="inline-block p-3 rounded-full bg-white/5 mb-4">
        {config.icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{config.title}</h3>
      <p className="text-gray-400 text-sm">
        {config.description}
      </p>
    </div>
  );
});
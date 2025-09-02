/**
 * Friend Request Card Component
 * Displays individual friend requests with appropriate actions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Clock, MessageCircle } from 'lucide-react';
import { Friend } from '@/types/friend';

interface FriendRequestCardProps {
  friend: Friend;
  type: 'sent' | 'received';
  onAccept?: (friendId: string) => void;
  onDecline?: (friendId: string) => void;
  onCancel?: (friendId: string) => void;
  onMessage?: (friendId: string) => void;
}

export const FriendRequestCard = React.memo<FriendRequestCardProps>(({
  friend,
  type,
  onAccept,
  onDecline,
  onCancel,
  onMessage,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-900/50 border-gray-700/30 hover:border-gray-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="w-12 h-12 border-2 border-gray-700/50 flex-shrink-0">
              <AvatarImage src={friend.avatar_url || undefined} alt={friend.username} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm">
                {friend.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info - Improved spacing and no truncation */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white leading-tight">
                  {friend.display_name || friend.username}
                </h4>
                {type === 'sent' && (
                  <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    Pending
                  </div>
                )}
              </div>
              {friend.display_name && (
                <p className="text-sm text-gray-400 leading-tight">@{friend.username}</p>
              )}
              {friend.bio && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-2">
                  {friend.bio}
                </p>
              )}
            </div>

            {/* Actions - Improved spacing */}
            <div className="flex flex-col gap-2.5 flex-shrink-0 ml-2">
              {type === 'received' ? (
                <>
                  {/* Accept Button */}
                  <Button
                    size="sm"
                    onClick={() => onAccept?.(friend.id)}
                    className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm hover:shadow-green-500/20 font-medium"
                    aria-label={`Accept friend request from ${friend.username}`}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Accept
                  </Button>
                  
                  {/* Decline Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDecline?.(friend.id)}
                    className="h-9 px-4 border-gray-600 text-gray-300 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 hover:shadow-sm font-medium"
                    aria-label={`Decline friend request from ${friend.username}`}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Decline
                  </Button>
                </>
              ) : (
                <>
                  {/* Cancel Button for Sent Requests */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancel?.(friend.id)}
                    className="h-9 px-4 border-gray-600 text-gray-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 hover:shadow-sm font-medium"
                    aria-label={`Cancel friend request to ${friend.username}`}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                </>
              )}

              {/* Message Button (Optional) */}
              {onMessage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMessage(friend.id)}
                  className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50 mt-1"
                  aria-label={`Send message to ${friend.username}`}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

FriendRequestCard.displayName = 'FriendRequestCard';
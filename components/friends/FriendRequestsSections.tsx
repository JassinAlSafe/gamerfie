/**
 * Friend Requests Sections Component
 * Shows sent and received friend requests with proper actions
 */

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FriendRequestCard } from './FriendRequestCard';
import { Friend } from '@/types/friend';
import { 
  Clock, 
  Inbox, 
  RefreshCw, 
  Users, 
  ArrowRight
} from 'lucide-react';

interface FriendRequestsSectionsProps {
  sentRequests: Friend[];
  receivedRequests: Friend[];
  isLoading: boolean;
  onRefresh: () => void;
  onAcceptRequest: (friendId: string) => void;
  onDeclineRequest: (friendId: string) => void;
  onCancelRequest: (friendId: string) => void;
  onMessage?: (friendId: string) => void;
}

export const FriendRequestsSections = React.memo<FriendRequestsSectionsProps>(({
  sentRequests,
  receivedRequests,
  isLoading,
  onRefresh,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onMessage,
}) => {
  const hasAnyRequests = sentRequests.length > 0 || receivedRequests.length > 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Inbox className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Friend Requests
            </h3>
            <p className="text-sm text-gray-400">
              Manage your pending connections
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
          aria-label="Refresh friend requests"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* No Requests State */}
      {!hasAnyRequests && !isLoading && (
        <Card className="bg-gray-900/30 border-gray-700/30">
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-300 mb-2">
              No pending friend requests
            </h4>
            <p className="text-gray-500 text-sm">
              Send friend requests to connect with other gamers!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Received Requests Section */}
      {receivedRequests.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/30 hover:border-gray-600/30 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-white text-base">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Inbox className="w-4 h-4 text-green-400" />
              </div>
              <span>Received Requests</span>
              <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium">
                {receivedRequests.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <AnimatePresence>
                {receivedRequests.map((friend, index) => (
                  <div
                    key={friend.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className="animate-fade-in-up"
                  >
                    <FriendRequestCard
                      friend={friend}
                      type="received"
                      onAccept={onAcceptRequest}
                      onDecline={onDeclineRequest}
                      onMessage={onMessage}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent Requests Section */}
      {sentRequests.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/30 hover:border-gray-600/30 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-white text-base">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <span>Sent Requests</span>
              <span className="text-sm bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-medium">
                {sentRequests.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <AnimatePresence>
                {sentRequests.map((friend, index) => (
                  <div
                    key={friend.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className="animate-fade-in-up"
                  >
                    <FriendRequestCard
                      friend={friend}
                      type="sent"
                      onCancel={onCancelRequest}
                      onMessage={onMessage}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation to Full Friends Page */}
      {hasAnyRequests && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white mb-1">
                  View All Friends
                </h4>
                <p className="text-sm text-gray-400">
                  See your complete friends list and activity
                </p>
              </div>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                onClick={() => window.location.href = '/profile/friends'}
              >
                View Friends
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && hasAnyRequests && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Refreshing requests...</span>
          </div>
        </div>
      )}
    </div>
  );
});

FriendRequestsSections.displayName = 'FriendRequestsSections';
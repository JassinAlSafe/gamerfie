import { Friend, FriendStatus, FriendRequest, FriendActivity, ActivityType } from "../types/friend";

interface CreateActivityRequest {
  activity_type: ActivityType;
  game_id?: string;
  details?: {
    name?: string;
    comment?: string;
  };
}

export const FriendsService = {
  async getFriends(status?: FriendStatus): Promise<Friend[]> {
    const response = await fetch(`/api/friends${status ? `?status=${status}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch friends');
    return response.json();
  },

  async addFriend(request: FriendRequest): Promise<Friend> {
    const response = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to add friend');
    return response.json();
  },

  async updateFriendStatus(friendId: string, status: FriendStatus): Promise<Friend> {
    const response = await fetch(`/api/friends/${friendId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update friend status');
    return response.json();
  },

  async removeFriend(friendId: string): Promise<void> {
    const response = await fetch(`/api/friends/${friendId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove friend');
  },

  async createActivity(request: CreateActivityRequest): Promise<FriendActivity> {
    const response = await fetch('/api/friends/activities/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
  },

  async getFriendActivities(page: number = 0): Promise<FriendActivity[]> {
    const response = await fetch(`/api/friends/activities?offset=${page * 20}&include=reactions,comments`);
    if (!response.ok) throw new Error('Failed to fetch friend activities');
    return response.json();
  },

  async addReaction(activityId: string, emoji: string): Promise<void> {
    const response = await fetch(`/api/friends/activities/${activityId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    if (!response.ok) throw new Error('Failed to add reaction');
  },

  async removeReaction(activityId: string, emoji: string): Promise<void> {
    const response = await fetch(`/api/friends/activities/${activityId}/reactions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    if (!response.ok) throw new Error('Failed to remove reaction');
  },

  async addComment(activityId: string, content: string): Promise<void> {
    const response = await fetch(`/api/friends/activities/${activityId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
  },

  async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`/api/friends/activities/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },
};
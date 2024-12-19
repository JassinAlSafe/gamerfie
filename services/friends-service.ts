import { Friend, FriendStatus, FriendRequest, FriendActivity } from "../types/friend";

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

  async getFriendActivities(page: number = 0): Promise<FriendActivity[]> {
    const response = await fetch(`/api/friends/activities?offset=${page * 20}`);
    if (!response.ok) throw new Error('Failed to fetch friend activities');
    return response.json();
  },
};
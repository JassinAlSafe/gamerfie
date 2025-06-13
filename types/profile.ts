export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
  role?: 'user' | 'admin' | 'moderator';
} 
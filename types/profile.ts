export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  full_name?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  settings?: Record<string, any>;
  display_name?: string;
} 
-- Create playlist_likes table
CREATE TABLE IF NOT EXISTS playlist_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, user_id)
);

-- Create playlist_bookmarks table
CREATE TABLE IF NOT EXISTS playlist_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playlist_likes_playlist_id ON playlist_likes(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_likes_user_id ON playlist_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_bookmarks_playlist_id ON playlist_bookmarks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_bookmarks_user_id ON playlist_bookmarks(user_id);

-- Enable Row Level Security
ALTER TABLE playlist_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playlist_likes
CREATE POLICY "Users can view all playlist likes" ON playlist_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON playlist_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON playlist_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for playlist_bookmarks
CREATE POLICY "Users can view all playlist bookmarks" ON playlist_bookmarks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own bookmarks" ON playlist_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON playlist_bookmarks
  FOR DELETE USING (auth.uid() = user_id);
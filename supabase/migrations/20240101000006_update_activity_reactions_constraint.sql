-- Update activity_reactions table constraint
ALTER TABLE activity_reactions DROP CONSTRAINT IF EXISTS activity_reactions_activity_id_user_id_emoji_key;
ALTER TABLE activity_reactions ADD CONSTRAINT activity_reactions_activity_id_user_id_key UNIQUE (activity_id, user_id);

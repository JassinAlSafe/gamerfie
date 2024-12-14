-- First, create an enum for game status if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
        CREATE TYPE game_status AS ENUM ('notStarted', 'inProgress', 'completed', 'abandoned');
    END IF;
END $$;

-- Create games table if it doesn't exist
create table if not exists games (
  id text primary key,
  name text not null,
  cover jsonb,
  rating float,
  first_release_date bigint,
  platforms jsonb,
  genres jsonb
);

-- Modify user_games table if needed
create table if not exists user_games (
  user_id uuid references auth.users(id) on delete cascade,
  game_id text not null,
  status game_status default 'notStarted',
  play_time float default 0,
  user_rating float,
  completed_at timestamp with time zone,
  notes text,
  last_played_at timestamp with time zone,
  display_order integer,
  primary key (user_id, game_id)
);

-- Add foreign key to user_games
alter table user_games
  drop constraint if exists fk_game;

alter table user_games
  add constraint fk_game
  foreign key (game_id)
  references games (id)
  on delete cascade;
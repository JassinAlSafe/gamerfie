-- Normalize Game IDs Script  
-- This script updates all game IDs to use clean numeric format (IGDB IDs without prefix)

-- First, let's see what we have
SELECT 
  CASE 
    WHEN game_id LIKE 'igdb_%' THEN 'IGDB prefixed'
    WHEN game_id LIKE 'rawg_%' THEN 'RAWG format'
    WHEN game_id ~ '^[0-9]+$' THEN 'Pure numeric (good!)'
    ELSE 'Unknown format'
  END as format_type,
  COUNT(*) as count,
  array_agg(DISTINCT game_id) as example_ids
FROM playlist_games 
GROUP BY 1
ORDER BY count DESC;

-- Remove igdb_ prefix from already prefixed IDs (normalize to pure numbers)
UPDATE playlist_games 
SET game_id = REPLACE(game_id, 'igdb_', '') 
WHERE game_id LIKE 'igdb_%';

-- Convert RAWG IDs to pure IGDB numeric IDs using manual mappings
-- DOOM games (from GameIdMappingService manual mappings)
UPDATE playlist_games 
SET game_id = '1020' 
WHERE game_id = 'rawg_2454';  -- DOOM (2016)

UPDATE playlist_games 
SET game_id = '1942' 
WHERE game_id = 'rawg_11';    -- DOOM II: Hell on Earth

UPDATE playlist_games 
SET game_id = '72' 
WHERE game_id = 'rawg_13';    -- DOOM

UPDATE playlist_games 
SET game_id = '472' 
WHERE game_id = 'rawg_23014'; -- DOOM 3

UPDATE playlist_games 
SET game_id = '71' 
WHERE game_id = 'rawg_612';   -- DOOM 3: BFG Edition

-- Add more RAWG to IGDB conversions as needed...

-- Check the final results - should be all pure numeric now
SELECT 
  CASE 
    WHEN game_id ~ '^[0-9]+$' THEN 'Pure numeric (perfect!)'
    WHEN game_id LIKE 'rawg_%' THEN 'RAWG format (needs conversion)'
    ELSE 'Other format'
  END as format_type,
  COUNT(*) as count,
  array_agg(DISTINCT game_id) as example_ids
FROM playlist_games 
GROUP BY 1
ORDER BY count DESC;
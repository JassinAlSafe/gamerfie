-- First, update the enum type to include 'declined'
ALTER TYPE friend_status ADD VALUE IF NOT EXISTS 'declined'; 
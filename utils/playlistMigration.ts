import { createClient } from "@/utils/supabase/client";
import { GameIdMappingService } from "@/services/gameIdMappingService";

/**
 * Playlist Migration Utility
 * 
 * This utility migrates existing playlists from RAWG IDs to IGDB IDs
 * to align with the IGDB-first architecture.
 */

interface PlaylistGameRow {
  playlist_id: string;
  game_id: string;
  display_order: number;
  added_at: string;
}

export class PlaylistMigrationService {
  private static supabase = createClient();

  /**
   * Migrate all playlists from RAWG IDs to IGDB IDs
   */
  static async migrateAllPlaylists(): Promise<void> {
    console.log('🔄 Starting playlist migration from RAWG to IGDB format...');

    try {
      // Get all playlist games with RAWG IDs
      const { data: playlistGames, error } = await this.supabase
        .from('playlist_games')
        .select('*')
        .like('game_id', 'rawg_%');

      if (error) {
        console.error('❌ Error fetching playlist games:', error);
        throw error;
      }

      if (!playlistGames || playlistGames.length === 0) {
        console.log('✅ No RAWG IDs found in playlists - migration not needed');
        return;
      }

      console.log(`📋 Found ${playlistGames.length} playlist games with RAWG IDs to migrate`);

      // Group by playlist for better logging
      const playlistGroups = new Map<string, PlaylistGameRow[]>();
      playlistGames.forEach(pg => {
        if (!playlistGroups.has(pg.playlist_id)) {
          playlistGroups.set(pg.playlist_id, []);
        }
        playlistGroups.get(pg.playlist_id)!.push(pg);
      });

      console.log(`📋 Found ${playlistGroups.size} playlists to migrate`);

      // Process each playlist
      for (const [playlistId, games] of playlistGroups.entries()) {
        await this.migratePlaylist(playlistId, games);
      }

      console.log('✅ Playlist migration completed successfully');
    } catch (error) {
      console.error('❌ Playlist migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate a specific playlist from RAWG IDs to IGDB IDs
   */
  static async migratePlaylist(playlistId: string, games: PlaylistGameRow[]): Promise<void> {
    console.log(`🔄 Migrating playlist ${playlistId} with ${games.length} games...`);

    const migrations: Array<{
      original: PlaylistGameRow;
      newGameId: string;
    }> = [];

    // Convert each RAWG ID to IGDB ID
    for (const game of games) {
      console.log(`🔄 Converting ${game.game_id}...`);
      
      // Check manual mapping first
      const manualMapping = GameIdMappingService.getManualMapping(game.game_id);
      if (manualMapping) {
        migrations.push({
          original: game,
          newGameId: manualMapping
        });
        console.log(`✅ Manual mapping: ${game.game_id} -> ${manualMapping}`);
      } else {
        // Try automatic conversion
        const igdbId = await GameIdMappingService.convertRawgToIgdb(game.game_id);
        if (igdbId) {
          migrations.push({
            original: game,
            newGameId: igdbId
          });
          console.log(`✅ Auto-converted: ${game.game_id} -> ${igdbId}`);
        } else {
          console.warn(`⚠️ Could not convert ${game.game_id}, skipping`);
        }
      }
    }

    if (migrations.length === 0) {
      console.log(`⚠️ No successful conversions for playlist ${playlistId}`);
      return;
    }

    // Perform database updates
    for (const migration of migrations) {
      const { error } = await this.supabase
        .from('playlist_games')
        .update({ game_id: migration.newGameId })
        .match({
          playlist_id: playlistId,
          game_id: migration.original.game_id
        });

      if (error) {
        console.error(`❌ Failed to update ${migration.original.game_id}:`, error);
      } else {
        console.log(`✅ Updated: ${migration.original.game_id} -> ${migration.newGameId}`);
      }
    }

    console.log(`✅ Completed migration for playlist ${playlistId}: ${migrations.length}/${games.length} games updated`);
  }

  /**
   * Migrate a specific playlist by ID
   */
  static async migrateSpecificPlaylist(playlistId: string): Promise<void> {
    console.log(`🔄 Migrating specific playlist: ${playlistId}`);

    const { data: playlistGames, error } = await this.supabase
      .from('playlist_games')
      .select('*')
      .eq('playlist_id', playlistId)
      .like('game_id', 'rawg_%');

    if (error) {
      console.error('❌ Error fetching playlist games:', error);
      throw error;
    }

    if (!playlistGames || playlistGames.length === 0) {
      console.log('✅ No RAWG IDs found in this playlist');
      return;
    }

    await this.migratePlaylist(playlistId, playlistGames);
  }

  /**
   * Preview what migrations would happen without executing them
   */
  static async previewMigration(): Promise<void> {
    console.log('🔍 Previewing playlist migration...');

    const { data: playlistGames, error } = await this.supabase
      .from('playlist_games')
      .select(`
        playlist_id,
        game_id,
        display_order,
        playlists!inner(title)
      `)
      .like('game_id', 'rawg_%');

    if (error) {
      console.error('❌ Error fetching playlist games:', error);
      throw error;
    }

    if (!playlistGames || playlistGames.length === 0) {
      console.log('✅ No RAWG IDs found in any playlists');
      return;
    }

    console.log('📋 Migration Preview:');
    
    const playlistGroups = new Map<string, any[]>();
    playlistGames.forEach(pg => {
      if (!playlistGroups.has(pg.playlist_id)) {
        playlistGroups.set(pg.playlist_id, []);
      }
      playlistGroups.get(pg.playlist_id)!.push(pg);
    });

    for (const [playlistId, games] of playlistGroups.entries()) {
      const playlistTitle = (games[0] as any).playlists?.title || 'Unknown';
      console.log(`\n📋 Playlist: "${playlistTitle}" (${playlistId})`);
      
      for (const game of games) {
        const manualMapping = GameIdMappingService.getManualMapping(game.game_id);
        console.log(`  ${game.game_id} -> ${manualMapping || 'AUTO_CONVERT'}`);
      }
    }
  }
}
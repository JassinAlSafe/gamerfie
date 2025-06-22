import { IGDBService } from '@/services/igdb';

export async function GET() {
  try {
    console.log('🎯 Fetching filter options from IGDB...');

    // Fetch all filter options concurrently
    const [platforms, genres, gameModes, themes] = await Promise.all([
      IGDBService.getPlatforms(),
      IGDBService.getGenres(),
      IGDBService.getGameModes(),
      IGDBService.getThemes()
    ]);

    const filterOptions = {
      platforms,
      genres,
      gameModes,
      themes,
      // Predefined rating ranges
      ratingRanges: [
        { label: 'Any Rating', min: 0, max: 100 },
        { label: '90+ (Masterpiece)', min: 90, max: 100 },
        { label: '80+ (Great)', min: 80, max: 100 },
        { label: '70+ (Good)', min: 70, max: 100 },
        { label: '60+ (Mixed)', min: 60, max: 100 },
      ],
      // Predefined years for quick selection
      popularYears: [
        new Date().getFullYear().toString(), // Current year
        (new Date().getFullYear() - 1).toString(), // Last year
        '2020', '2019', '2018', '2017', '2016', '2015', '2010'
      ]
    };

    console.log(`✅ Filter options loaded: ${platforms.length} platforms, ${genres.length} genres, ${gameModes.length} modes, ${themes.length} themes`);

    // Cache for 1 hour since filter options don't change frequently
    return new Response(JSON.stringify(filterOptions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });

  } catch (error) {
    console.error('❌ Error fetching filter options:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch filter options',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
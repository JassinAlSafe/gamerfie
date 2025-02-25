import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { UserGame, GameStats } from '@/types/game'
import type { Profile } from '@/types/profile'

export async function fetchProfile() {
    const supabase = createClientComponentClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
        console.error('Error fetching user:', userError)
        throw userError
    }

    if (!user) {
        throw new Error('No authenticated user')
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url, email, created_at, updated_at')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching user profile:', error)
        throw error
    }

    return data as unknown as Profile
}

export async function fetchUserGames(userId: string, page = 1, pageSize = 10) {
    const supabase = createClientComponentClient()

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const { data, error, count } = await supabase
        .from('user_games')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(start, end)

    if (error) {
        console.error('Error fetching user games:', error)
        throw error
    }

    return {
        games: (data as UserGame[]) || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
        hasMore: count ? (page * pageSize) < count : false
    }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
    if (!userId) {
        throw new Error('User ID is required to update profile')
    }

    const supabase = createClientComponentClient()

    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating user profile:', error)
        throw error
    }

    return data as unknown as Profile
}

export async function calculateGameStats(userId: string): Promise<GameStats> {
    const supabase = createClientComponentClient()

    // Fetch user's games with game details
    const { data: userGames, error: gamesError } = await supabase
        .from('user_games')
        .select(`
            *,
            games (
                id,
                name,
                cover_url,
                platforms,
                genres,
                summary,
                created_at,
                updated_at
            )
        `)
        .eq('user_id', userId)
        .order('last_played_at', { ascending: false })

    if (gamesError) {
        console.error('Error fetching games for stats:', gamesError)
        throw gamesError
    }

    // Process games for stats
    const totalGames = userGames?.length || 0
    const totalPlaytime = userGames?.reduce((total, game) => total + (game.play_time || 0), 0) || 0

    // Get recently played games (last 5)
    const recentlyPlayed = userGames
        ?.filter(game => game.last_played_at)
        ?.slice(0, 5)
        ?.map(game => ({
            id: game.game_id,
            name: game.games?.name || '',
            title: game.games?.name || '',
            cover_url: game.games?.cover_url || null,
            platforms: game.games?.platforms ? JSON.parse(game.games.platforms) : [],
            genres: game.games?.genres ? JSON.parse(game.games.genres) : [],
            status: game.status,
            rating: game.user_rating || 0,
            summary: game.games?.summary || '',
            created_at: game.created_at,
            updated_at: game.updated_at
        })) || []

    // Get most played games (top 5 by playtime)
    const mostPlayed = [...(userGames || [])]
        ?.sort((a, b) => (b.play_time || 0) - (a.play_time || 0))
        ?.slice(0, 5)
        ?.map(game => ({
            id: game.game_id,
            name: game.games?.name || '',
            title: game.games?.name || '',
            cover_url: game.games?.cover_url || null,
            platforms: game.games?.platforms ? JSON.parse(game.games.platforms) : [],
            genres: game.games?.genres ? JSON.parse(game.games.genres) : [],
            status: game.status,
            rating: game.user_rating || 0,
            summary: game.games?.summary || '',
            created_at: game.created_at,
            updated_at: game.updated_at
        })) || []

    return {
        totalGames,
        totalPlaytime,
        recentlyPlayed,
        mostPlayed
    }
}


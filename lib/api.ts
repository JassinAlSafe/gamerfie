import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@/types/profile'

const supabase = createClient()

export async function fetchProfile() {
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

export async function fetchUserStats(userId: string) {
    const { data: userGames, error } = await supabase
        .from('user_games')
        .select('status')
        .eq('user_id', userId)

    if (error) throw error

    const stats = {
        playing: 0,
        completed: 0,
        want_to_play: 0,
        dropped: 0,
        total: userGames?.length || 0
    }

    userGames?.forEach(game => {
        const status = game.status as 'playing' | 'completed' | 'want_to_play' | 'dropped'
        if (status in stats) {
            stats[status]++
        }
    })

    return stats
}

export async function fetchTopGenres(userId: string) {
    const { data, error } = await supabase
        .from('user_games')
        .select(`
            games!inner(
                genres
            )
        `)
        .eq('user_id', userId)

    if (error) throw error
    
    const genreCount: Record<string, number> = {}
    
    data?.forEach((userGame: any) => {
        if (userGame.games?.genres && Array.isArray(userGame.games.genres)) {
            userGame.games.genres.forEach((genre: string) => {
                genreCount[genre] = (genreCount[genre] || 0) + 1
            })
        }
    })

    return Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
}

export async function fetchRecentActivity(userId: string) {
    const { data, error } = await supabase
        .from('friend_activities')
        .select(`
            *,
            game:games(id, name, cover_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) throw error
    return data
}

export async function fetchGameStats(gameId: string) {
    const { data: userGames, error } = await supabase
        .from('user_games')
        .select('status')
        .eq('game_id', gameId)

    if (error) throw error

    const stats = {
        playing: 0,
        completed: 0,
        want_to_play: 0,
        dropped: 0,
        total: userGames?.length || 0
    }

    userGames?.forEach(game => {
        const status = game.status as 'playing' | 'completed' | 'want_to_play' | 'dropped'
        if (status in stats) {
            stats[status]++
        }
    })

    return stats
}

export async function fetchGameActivities(gameId: string) {
    const { data, error } = await supabase
        .from('friend_activities')
        .select(`
            *,
            user:profiles(username, avatar_url)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data
}

export async function addGameToLibrary(gameId: string, status: string = 'want_to_play') {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('user_games')
        .insert({
            user_id: user.id,
            game_id: gameId,
            status,
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateGameStatus(gameId: string, status: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('user_games')
        .update({ 
            status,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function removeGameFromLibrary(gameId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('user_games')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', gameId)

    if (error) throw error
}

// Define missing types locally
interface UserGame {
    user_id: string
    game_id: string
    status: 'playing' | 'completed' | 'want_to_play' | 'dropped'
    created_at: string
    updated_at?: string
    games?: {
        id: string
        name: string
        cover_url?: string
        genres?: string[]
    }
}


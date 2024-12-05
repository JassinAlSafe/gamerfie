import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserGame } from '@/types'

import { Profile } from '../types/index'
import { GameStats } from '../types/index'

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
        .select('id, username, display_name, bio, avatar_url, email, updated_at')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching user profile:', error)
        throw error
    }

    return data as Profile
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

    return data as Profile
}

export async function calculateGameStats(userId: string): Promise<GameStats> {
    const supabase = createClientComponentClient()

    const { data: games, error } = await supabase
        .from('user_games')
        .select('status, created_at')
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching games for stats:', error)
        throw error
    }

    const currentYear = new Date().getFullYear()

    return games.reduce(
        (stats, game) => {
            if (game.status === 'completed' || game.status === 'playing') {
                stats.total_played++
                if (new Date(game.created_at).getFullYear() === currentYear) {
                    stats.played_this_year++
                }
            } else if (game.status === 'want_to_play') {
                stats.backlog++
            }
            return stats
        },
        { total_played: 0, played_this_year: 0, backlog: 0 }
    )
}


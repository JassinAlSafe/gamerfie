'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad, Plus, Star, Search} from 'lucide-react'
import toast from 'react-hot-toast'

interface Game {
  id: string
  name: string
  cover?: {
    url: string
  }
}

interface UserGame {
  id: string
  game_id: string
  status: 'playing' | 'completed' | 'want_to_play' | 'dropped'
  rating: number | null
  start_date: string | null
  completion_date: string | null
}

export function GamesTab() {
  const [games, setGames] = useState<(Game & { userStatus?: UserGame })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUserGames()
  }, [])

  const fetchUserGames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userGames, error: userGamesError } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', user.id)

      if (userGamesError) throw userGamesError

      // Here you would typically fetch game details from your game API (IGDB)
      // For now, we'll use placeholder data
      const gamesWithStatus = userGames.map(ug => ({
        id: ug.game_id,
        name: `Game ${ug.game_id}`, // Replace with actual game name from API
        userStatus: ug
      }))

      setGames(gamesWithStatus)
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('Failed to load games')
    } finally {
      setIsLoading(false)
    }
  }

  const updateGameStatus = async (gameId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_games')
        .upsert({
          user_id: user.id,
          game_id: gameId,
          status: status as UserGame['status'],
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Game status updated')
      fetchUserGames()
    } catch (error) {
      console.error('Error updating game status:', error)
      toast.error('Failed to update game status')
    }
  }

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || game.userStatus?.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="playing">Playing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="want_to_play">Want to Play</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Gamepad className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? "No games match your filters"
                : "Start building your game collection by adding games"}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Game
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <Card key={game.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{game.name}</span>
                  {game.userStatus?.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm">{game.userStatus.rating}</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Status: {game.userStatus?.status || 'Not added'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={game.userStatus?.status || 'want_to_play'}
                  onValueChange={(value) => updateGameStatus(game.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playing">Playing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="want_to_play">Want to Play</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
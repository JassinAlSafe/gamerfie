import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from "@/components/ui/icons"
import { GamepadIcon} from "lucide-react"

interface GameStatsProps {
  totalPlayed: number
  playedThisYear: number
  backlog: number
}

export function GameStats({ totalPlayed, playedThisYear, backlog }: GameStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <GamepadIcon className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Total Played</p>
              <p className="text-2xl font-bold">{totalPlayed}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Icons.calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Played This Year</p>
              <p className="text-2xl font-bold">{playedThisYear}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Icons.list className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Backlog</p>
              <p className="text-2xl font-bold">{backlog}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
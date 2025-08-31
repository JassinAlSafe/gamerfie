'use client'

import { useState } from 'react'
import { LinkWithStatus } from './link-with-status'
import { cn } from '@/lib/utils'

interface GameLinkProps {
  gameId: string
  children: React.ReactNode
  className?: string
  prefetchOnHover?: boolean
  showLoadingIndicator?: boolean
}

export function GameLink({ 
  gameId, 
  children, 
  className,
  prefetchOnHover = true,
  showLoadingIndicator = true
}: GameLinkProps) {
  const [shouldPrefetch, setShouldPrefetch] = useState(!prefetchOnHover)

  const handleMouseEnter = () => {
    if (prefetchOnHover && !shouldPrefetch) {
      setShouldPrefetch(true)
    }
  }

  return (
    <LinkWithStatus
      href={`/game/${gameId}`}
      className={cn(
        "block group transition-transform hover:scale-105",
        className
      )}
      prefetch={shouldPrefetch}
      onMouseEnter={handleMouseEnter}
      showSpinner={showLoadingIndicator}
      spinnerClassName="bg-black/50 rounded-full p-1"
    >
      {children}
    </LinkWithStatus>
  )
}
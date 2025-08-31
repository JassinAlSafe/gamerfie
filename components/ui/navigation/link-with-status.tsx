'use client'

import Link from 'next/link'
import { useLinkStatus } from 'next/link'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LinkWithStatusProps {
  href: string
  children: React.ReactNode
  className?: string
  showSpinner?: boolean
  spinnerClassName?: string
  prefetch?: boolean
  onMouseEnter?: () => void
}

export function LinkWithStatus({ 
  href, 
  children, 
  className,
  showSpinner = true,
  spinnerClassName,
  prefetch,
  onMouseEnter,
  ...props 
}: LinkWithStatusProps) {
  const { pending } = useLinkStatus()

  return (
    <Link 
      href={href} 
      className={cn(
        "relative transition-opacity",
        pending && "opacity-75 cursor-wait",
        className
      )}
      prefetch={prefetch}
      onMouseEnter={onMouseEnter}
      {...props}
    >
      {children}
      {pending && showSpinner && (
        <span className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          "animate-spin opacity-75",
          spinnerClassName
        )}>
          <Loader2 className="h-4 w-4" />
        </span>
      )}
    </Link>
  )
}
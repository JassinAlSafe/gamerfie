'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface OptimizedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  prefetchOnHover?: boolean
  prefetch?: boolean
  [key: string]: any
}

export function OptimizedLink({ 
  href,
  children,
  className,
  prefetchOnHover = false,
  prefetch,
  ...props
}: OptimizedLinkProps) {
  const [shouldPrefetch, setShouldPrefetch] = useState(prefetch !== false && !prefetchOnHover)

  const handleMouseEnter = useCallback(() => {
    if (prefetchOnHover && !shouldPrefetch) {
      setShouldPrefetch(true)
    }
  }, [prefetchOnHover, shouldPrefetch])

  return (
    <Link 
      href={href}
      prefetch={shouldPrefetch}
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  )
}
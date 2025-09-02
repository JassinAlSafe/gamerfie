'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Generate breadcrumbs from path if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://gamersvaultapp.com${item.href}`
    }))
  }

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <nav 
        aria-label="Breadcrumb"
        className={`flex items-center space-x-1 text-sm text-gray-400 mb-6 ${className}`}
      >
        <Link 
          href="/" 
          className="hover:text-white transition-colors flex items-center"
          aria-label="Home"
        >
          <Home size={16} className="mr-1" />
          Home
        </Link>
        
        {breadcrumbItems.length > 1 && breadcrumbItems.slice(1).map((item, index) => (
          <div key={item.href} className="flex items-center">
            <ChevronRight size={16} className="mx-2 text-gray-500" />
            {index === breadcrumbItems.length - 2 ? (
              // Last item - current page (not clickable)
              <span className="text-white font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              // Intermediate items (clickable)
              <Link 
                href={item.href} 
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ]

  let currentPath = ''
  
  for (const segment of segments) {
    currentPath += `/${segment}`
    
    // Convert path segments to readable labels
    const label = getReadableLabel(segment, currentPath)
    
    breadcrumbs.push({
      label,
      href: currentPath
    })
  }

  return breadcrumbs
}

function getReadableLabel(segment: string, fullPath: string): string {
  // Custom mappings for specific paths
  const pathMappings: Record<string, string> = {
    '/explore': 'Explore Games',
    '/all-games': 'All Games',
    '/popular-games': 'Popular Games',
    '/info': 'Info',
    '/info/faq': 'FAQ',
    '/info/about': 'About',
    '/info/privacy': 'Privacy Policy',
    '/info/terms': 'Terms of Service',
    '/profile': 'Profile',
    '/friends': 'Friends',
    '/achievements': 'Achievements',
    '/auth': 'Sign In',
    '/signup': 'Sign Up',
    '/best-video-game-tracker': 'Best Video Game Tracker',
    '/video-game-achievement-tracker': 'Achievement Tracker',
    '/gaming-backlog-tracker': 'Backlog Tracker',
  }

  // Check for exact path match first
  if (pathMappings[fullPath]) {
    return pathMappings[fullPath]
  }

  // Handle dynamic routes
  if (fullPath.startsWith('/game/')) {
    return 'Game Details'
  }
  
  if (fullPath.startsWith('/games/')) {
    return 'Game'
  }

  // Convert kebab-case to Title Case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
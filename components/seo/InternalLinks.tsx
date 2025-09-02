import Link from 'next/link'

interface InternalLink {
  href: string
  text: string
  description?: string
}

interface InternalLinksProps {
  title?: string
  links: InternalLink[]
  className?: string
}

export function InternalLinks({ 
  title = "Related Pages", 
  links, 
  className = "" 
}: InternalLinksProps) {
  if (!links.length) return null

  return (
    <div className={`bg-gray-800/30 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors group"
          >
            <div className="text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
              {link.text}
            </div>
            {link.description && (
              <div className="text-sm text-gray-400 mt-1">
                {link.description}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Predefined link sets for common page types
export const VIDEO_GAME_TRACKER_LINKS: InternalLink[] = [
  {
    href: "/explore",
    text: "Explore Games",
    description: "Discover new games to add to your tracker"
  },
  {
    href: "/all-games", 
    text: "Browse All Games",
    description: "Complete database of trackable games"
  },
  {
    href: "/popular-games",
    text: "Popular Games",
    description: "Most tracked games on our platform"
  },
  {
    href: "/info/faq",
    text: "How to Track Games",
    description: "Learn how to use our video game tracker"
  }
]

export const ACHIEVEMENT_TRACKER_LINKS: InternalLink[] = [
  {
    href: "/achievements",
    text: "Achievement Hunter",
    description: "Track your gaming achievements and trophies"
  },
  {
    href: "/popular-games",
    text: "Achievement-Heavy Games", 
    description: "Games with the most achievements to unlock"
  },
  {
    href: "/profile",
    text: "Your Achievement Progress",
    description: "View your personal achievement statistics"
  }
]

export const BACKLOG_TRACKER_LINKS: InternalLink[] = [
  {
    href: "/profile/games",
    text: "Your Game Library",
    description: "Manage your personal game backlog"
  },
  {
    href: "/all-games",
    text: "Add Games to Backlog",
    description: "Find new games to add to your tracking list"
  },
  {
    href: "/explore",
    text: "Discover Games",
    description: "Find hidden gems for your backlog"
  }
]
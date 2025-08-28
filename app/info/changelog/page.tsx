import { InfoContent } from "@/components/layout/InfoContent";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Zap, 
  Bug, 
  Plus, 
  ArrowUpCircle, 
  Shield, 
  Sparkles,
  Trophy,
  Users,
  Search,
  Settings,
  Database,
  Palette,
  Clock
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog - Game Vault",
  description:
    "Stay up to date with the latest features, improvements, and bug fixes in Game Vault. See what's new and what's coming next.",
  keywords: [
    "game vault changelog",
    "updates",
    "new features",
    "bug fixes",
    "improvements",
    "version history"
  ],
  openGraph: {
    title: "Changelog - Game Vault",
    description:
      "Discover the latest updates, features, and improvements to Game Vault. Track our development progress and see what's new.",
    type: "website",
  },
};

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  title: string;
  description: string;
  changes: {
    type: "added" | "improved" | "fixed" | "security" | "deprecated";
    items: string[];
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: "2.1.0",
    date: "2025-08-28",
    type: "minor",
    title: "Achievements System Preview & Enhanced Footer",
    description: "Introducing the achievements system preview and major footer improvements with proper studio branding.",
    changes: [
      {
        type: "added",
        items: [
          "Achievements page with coming soon preview",
          "Achievement categories and rarity system design",
          "Links to achievements throughout the platform",
          "Developer section in footer with roadmap and API docs",
          "Zenit Digital Studios branding and links"
        ]
      },
      {
        type: "improved",
        items: [
          "Footer layout with 4-column navigation structure",
          "Enhanced footer branding and visual design",
          "Better responsive spacing in footer components",
          "Achievement-related component linking across platform"
        ]
      }
    ]
  },
  {
    version: "2.0.5",
    date: "2025-08-25",
    type: "patch",
    title: "All-Games Filtering System Overhaul",
    description: "Complete redesign of the filtering system with full IGDB integration and intelligent sorting.",
    changes: [
      {
        type: "added",
        items: [
          "Comprehensive filtering by platform, genre, rating, and year",
          "Intelligent sorting based on filter types",
          "Time range filtering (recent, this year, upcoming)",
          "Advanced filter combinations with proper validation"
        ]
      },
      {
        type: "improved",
        items: [
          "Rating filter scale converted from UI (1-10) to IGDB (0-100)",
          "Enhanced filter parameter processing in API routes",
          "Better error handling for overly restrictive filter combinations",
          "Mobile-optimized cache times for better performance"
        ]
      },
      {
        type: "fixed",
        items: [
          "Filter parameters were being ignored by API route",
          "Rating filters not showing highest-rated games first",
          "Time range options not matching backend implementation",
          "Genre and platform filtering not working properly"
        ]
      }
    ]
  },
  {
    version: "2.0.4",
    date: "2025-08-22",
    type: "patch",
    title: "Video Gallery & Media Tab Fixes",
    description: "Fixed video display issues across game pages and media galleries.",
    changes: [
      {
        type: "fixed",
        items: [
          "Media tab videos not displaying due to missing video_id field",
          "GameHero 'Watch Trailer' button not working",
          "Video data transformation losing crucial fields",
          "YouTube video embed URLs not generating correctly"
        ]
      },
      {
        type: "improved",
        items: [
          "Enhanced video data processing pipeline",
          "Better video URL construction from IGDB data",
          "Preserved all necessary video fields through transformation layers"
        ]
      }
    ]
  },
  {
    version: "2.0.3",
    date: "2025-08-20",
    type: "patch",
    title: "Explore Page Data Quality & All-Games Pagination",
    description: "Major improvements to game data quality and pagination functionality.",
    changes: [
      {
        type: "added",
        items: [
          "Proper pagination support for all-games page",
          "Dynamic date calculations for recent/upcoming games",
          "Enhanced IGDB filtering with quality criteria"
        ]
      },
      {
        type: "improved",
        items: [
          "Recently Released section now shows actual latest games",
          "Coming Soon section displays properly anticipated titles",
          "Unified data source priority preferring IGDB over RAWG",
          "Better sorting logic for different game categories"
        ]
      },
      {
        type: "fixed",
        items: [
          "All-games pagination returning duplicate results",
          "Explore page showing incorrect data from wrong sources",
          "CSP violations from RAWG background images",
          "Date range logic not adapting to current system date"
        ]
      }
    ]
  },
  {
    version: "2.0.0",
    date: "2025-08-15",
    type: "major",
    title: "Authentication Architecture Overhaul",
    description: "Complete redesign of authentication system with pure Supabase integration and enhanced type safety.",
    changes: [
      {
        type: "added",
        items: [
          "Pure Supabase authentication system",
          "Comprehensive TypeScript interfaces for auth states",
          "Unified component structure in /components/auth/",
          "Database function verification with MCP tools",
          "Enhanced error handling and user feedback"
        ]
      },
      {
        type: "improved",
        items: [
          "100% type safety across authentication flows",
          "Consolidated auth components and removed duplicates",
          "Better session management and state persistence",
          "Enhanced profile creation and user onboarding"
        ]
      },
      {
        type: "fixed",
        items: [
          "Mixed NextAuth/Supabase architecture conflicts",
          "Duplicate SignIn/SignUp form components",
          "Authentication state inconsistencies",
          "Type safety issues with 'any' types throughout auth system"
        ]
      },
      {
        type: "deprecated",
        items: [
          "NextAuth.js integration completely removed",
          "Legacy auth configuration files",
          "Duplicate auth component implementations"
        ]
      }
    ]
  },
  {
    version: "1.8.0",
    date: "2025-08-10",
    type: "minor",
    title: "Infrastructure & Performance Optimizations",
    description: "Major code quality improvements, component optimizations, and infrastructure enhancements.",
    changes: [
      {
        type: "added",
        items: [
          "React.memo optimization for performance-critical components",
          "Standardized authentication helper for API routes",
          "Consolidated type definitions and interfaces",
          "Enhanced error monitoring and reporting"
        ]
      },
      {
        type: "improved",
        items: [
          "Removed duplicate components (GameCard, FriendCard variants)",
          "Fixed security vulnerabilities with innerHTML usage",
          "Consolidated Supabase client implementations",
          "Enhanced component structure and maintainability"
        ]
      },
      {
        type: "fixed",
        items: [
          "Duplicate auth store implementations",
          "Mixed Supabase client usage (client vs server)",
          "Missing imports causing runtime errors",
          "Hardcoded API endpoints and validation issues"
        ]
      }
    ]
  },
  {
    version: "1.5.0",
    date: "2025-07-28",
    type: "minor",
    title: "Enhanced Game Discovery & Review System",
    description: "Major improvements to game exploration, filtering, and community review features.",
    changes: [
      {
        type: "added",
        items: [
          "Advanced game filtering by genre, platform, and rating",
          "Enhanced review system with community engagement",
          "Improved game recommendation algorithms",
          "Better search functionality with autocomplete"
        ]
      },
      {
        type: "improved",
        items: [
          "Faster game data loading and caching",
          "Better mobile experience for game browsing",
          "Enhanced user profile customization options",
          "Improved challenge creation and management"
        ]
      }
    ]
  },
  {
    version: "1.0.0",
    date: "2025-07-01",
    type: "major",
    title: "Game Vault Launch",
    description: "Initial release of Game Vault with core gaming tracking and community features.",
    changes: [
      {
        type: "added",
        items: [
          "User registration and authentication system",
          "Game library management and tracking",
          "Progress tracking for individual games",
          "Community features and friend system",
          "Review and rating system for games",
          "Challenge creation and participation",
          "Responsive design for all device types"
        ]
      }
    ]
  }
];

const getChangeTypeIcon = (type: string) => {
  switch (type) {
    case "added": return <Plus className="w-4 h-4 text-green-400" />;
    case "improved": return <ArrowUpCircle className="w-4 h-4 text-blue-400" />;
    case "fixed": return <Bug className="w-4 h-4 text-yellow-400" />;
    case "security": return <Shield className="w-4 h-4 text-red-400" />;
    case "deprecated": return <Clock className="w-4 h-4 text-gray-400" />;
    default: return <Zap className="w-4 h-4 text-purple-400" />;
  }
};

const getChangeTypeLabel = (type: string) => {
  switch (type) {
    case "added": return "Added";
    case "improved": return "Improved";
    case "fixed": return "Fixed";
    case "security": return "Security";
    case "deprecated": return "Deprecated";
    default: return "Changed";
  }
};

const getVersionBadgeColor = (type: "major" | "minor" | "patch") => {
  switch (type) {
    case "major": return "bg-red-500/20 text-red-300 border-red-500/30";
    case "minor": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "patch": return "bg-green-500/20 text-green-300 border-green-500/30";
  }
};

export default function ChangelogPage() {
  return (
    <InfoContent
      title="Changelog"
      description="Stay up to date with the latest features, improvements, and bug fixes. Track our development journey and see what's new in Game Vault."
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-900/70 transition-colors">
          <div className="inline-flex p-3 bg-purple-500/20 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {changelogData.length}
          </div>
          <div className="text-gray-400 text-sm">Total Releases</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-900/70 transition-colors">
          <div className="inline-flex p-3 bg-green-500/20 rounded-full mb-4">
            <Plus className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {changelogData.reduce((total, entry) => 
              total + entry.changes.find(c => c.type === "added")?.items.length || 0, 0
            )}
          </div>
          <div className="text-gray-400 text-sm">Features Added</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-900/70 transition-colors">
          <div className="inline-flex p-3 bg-yellow-500/20 rounded-full mb-4">
            <Bug className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {changelogData.reduce((total, entry) => 
              total + entry.changes.find(c => c.type === "fixed")?.items.length || 0, 0
            )}
          </div>
          <div className="text-gray-400 text-sm">Bugs Fixed</div>
        </div>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-8">
        {changelogData.map((entry, index) => (
          <div 
            key={entry.version}
            className="group bg-gray-900/30 border border-gray-800/30 rounded-2xl p-8 hover:bg-gray-900/50 hover:border-gray-700/50 transition-all duration-300"
          >
            {/* Version Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Badge 
                    className={`px-3 py-1 text-sm font-semibold border ${getVersionBadgeColor(entry.type)}`}
                  >
                    v{entry.version}
                  </Badge>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              
              {index === 0 && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Latest
                </Badge>
              )}
            </div>

            {/* Title and Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {entry.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {entry.description}
              </p>
            </div>

            {/* Changes */}
            <div className="space-y-6">
              {entry.changes.map((changeGroup, groupIndex) => (
                <div key={groupIndex}>
                  <div className="flex items-center gap-2 mb-4">
                    {getChangeTypeIcon(changeGroup.type)}
                    <h4 className="text-lg font-semibold text-white">
                      {getChangeTypeLabel(changeGroup.type)}
                    </h4>
                  </div>
                  
                  <ul className="space-y-2 ml-6">
                    {changeGroup.items.map((item, itemIndex) => (
                      <li 
                        key={itemIndex}
                        className="flex items-start gap-3 text-gray-300 group-hover:text-gray-200 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2.5 flex-shrink-0"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-16 text-center bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-2xl p-8 border border-gray-800/30">
        <div className="inline-flex p-4 bg-purple-500/20 rounded-full mb-6">
          <Trophy className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Stay in the Loop
        </h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
          Follow our development journey and be the first to know about new features, 
          improvements, and exciting updates to Game Vault.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://www.linkedin.com/company/zenit-digital-studios/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Follow Zenit Digital Studios
          </a>
          <a
            href="/info/roadmap"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 border border-gray-600/50 hover:bg-purple-900/30 hover:border-purple-500/50 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-200 hover:transform hover:scale-105"
          >
            <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            View Roadmap
          </a>
        </div>
      </div>
    </InfoContent>
  );
}
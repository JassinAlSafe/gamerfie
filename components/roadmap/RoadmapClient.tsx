"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, Zap, Users, Gamepad2, Smartphone, Shield, Sparkles, Calendar, ArrowRight, X } from "lucide-react";
import type { RoadmapItem, RoadmapStatus, RoadmapStatusConfig, RoadmapCategoryIcons } from "@/types/roadmap";

const roadmapData: RoadmapItem[] = [
  // Q4 2024 - Completed
  {
    id: "auth-overhaul",
    title: "Authentication System Overhaul",
    description: "Complete redesign of user authentication with enhanced security and better UX",
    status: "completed",
    quarter: "Q4 2024",
    category: "security",
    impact: "high",
    features: ["Pure Supabase Auth", "Enhanced Type Safety", "Improved Error Handling", "Better Session Management"]
  },
  {
    id: "ui-improvements",
    title: "UI/UX Design Improvements",
    description: "Major visual overhaul with modern design patterns and improved user experience",
    status: "completed",
    quarter: "Q4 2024",
    category: "core",
    impact: "high",
    features: ["New Component Library", "Responsive Design", "Dark Mode Enhancements", "Accessibility Improvements"]
  },
  
  // Q1 2025 - In Progress
  {
    id: "game-import",
    title: "Platform Game Import",
    description: "Import your game libraries from Steam, PlayStation, Xbox, and Nintendo Switch",
    status: "in-progress",
    quarter: "Q1 2025",
    category: "core",
    impact: "high",
    features: ["Steam Library Sync", "PlayStation Integration", "Xbox Game Pass Support", "Nintendo Switch Connect"]
  },
  {
    id: "enhanced-tracking",
    title: "Advanced Game Tracking",
    description: "Detailed progress tracking with achievements, playtime, and completion analytics",
    status: "in-progress",
    quarter: "Q1 2025",
    category: "core",
    impact: "high",
    features: ["Achievement Tracking", "Playtime Analytics", "Progress Screenshots", "Personal Notes System"]
  },
  {
    id: "social-features",
    title: "Enhanced Social Features",
    description: "Improved friend system with activity feeds, game recommendations, and social challenges",
    status: "planned",
    quarter: "Q1 2025",
    category: "social",
    impact: "medium",
    features: ["Activity Feed Redesign", "Friend Recommendations", "Social Challenges", "Game Comparison Tools"]
  },
  
  // Q2 2025 - Planned
  {
    id: "mobile-app",
    title: "Mobile Application",
    description: "Native mobile apps for iOS and Android with full feature parity",
    status: "planned",
    quarter: "Q2 2025",
    category: "mobile",
    impact: "high",
    features: ["iOS Native App", "Android Native App", "Offline Mode", "Push Notifications"]
  },
  {
    id: "gaming-communities",
    title: "Gaming Communities",
    description: "Create and join gaming communities around your favorite games and genres",
    status: "planned",
    quarter: "Q2 2025",
    category: "social",
    impact: "medium",
    features: ["Community Creation", "Discussion Forums", "Event Organization", "Community Challenges"]
  },
  {
    id: "analytics-dashboard",
    title: "Personal Gaming Analytics",
    description: "Comprehensive dashboard with gaming insights, trends, and personalized statistics",
    status: "planned",
    quarter: "Q2 2025",
    category: "core",
    impact: "medium",
    features: ["Gaming Insights", "Trend Analysis", "Personal Statistics", "Goal Setting"]
  },
  
  // Q3 2025 - Planned
  {
    id: "streaming-integration",
    title: "Streaming Platform Integration",
    description: "Connect with Twitch, YouTube Gaming, and other platforms to showcase your gaming",
    status: "planned",
    quarter: "Q3 2025",
    category: "social",
    impact: "medium",
    features: ["Twitch Integration", "YouTube Gaming Connect", "Stream Highlights", "Viewer Engagement"]
  },
  {
    id: "ai-recommendations",
    title: "AI-Powered Game Recommendations",
    description: "Smart game suggestions based on your preferences, playstyle, and gaming history",
    status: "planned",
    quarter: "Q3 2025",
    category: "core",
    impact: "high",
    features: ["Personalized Suggestions", "Mood-Based Recommendations", "Friend Influence Analysis", "Genre Exploration"]
  },
  
  // Future
  {
    id: "vr-ar-support",
    title: "VR/AR Gaming Support",
    description: "Track and showcase your virtual and augmented reality gaming experiences",
    status: "future",
    quarter: "Future",
    category: "core",
    impact: "low",
    features: ["VR Game Tracking", "AR Experience Logging", "Immersive Statistics", "3D Game Showcases"]
  },
  {
    id: "blockchain-achievements",
    title: "Blockchain Achievements",
    description: "Verifiable gaming achievements and collectibles using blockchain technology",
    status: "future",
    quarter: "Future",
    category: "core",
    impact: "low",
    features: ["NFT Achievements", "Verifiable Progress", "Cross-Platform Recognition", "Digital Collectibles"]
  }
];

const statusConfig: Record<RoadmapStatus, RoadmapStatusConfig> = {
  completed: {
    icon: CheckCircle,
    label: "Completed",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
    bgColor: "bg-green-900/20 border-green-500/30"
  },
  "in-progress": {
    icon: Circle,
    label: "In Progress", 
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    bgColor: "bg-blue-900/20 border-blue-500/30"
  },
  planned: {
    icon: Clock,
    label: "Planned",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    bgColor: "bg-yellow-900/20 border-yellow-500/30"
  },
  future: {
    icon: Sparkles,
    label: "Future",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    bgColor: "bg-purple-900/20 border-purple-500/30"
  }
};

const categoryIcons: RoadmapCategoryIcons = {
  core: Gamepad2,
  social: Users,
  mobile: Smartphone,
  performance: Zap,
  security: Shield
};

export function RoadmapClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("all");

  const hasActiveFilters = selectedCategory !== "all" || selectedQuarter !== "all";
  const clearFilters = useCallback(() => {
    setSelectedCategory("all");
    setSelectedQuarter("all");
  }, []);

  const categories = ["all", "core", "social", "mobile", "performance", "security"] as const;
  const quarters = useMemo(() => ["all", "Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025", "Future"] as const, []);

  const filteredItems = useMemo(() => {
    return roadmapData.filter(item => {
      const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
      const quarterMatch = selectedQuarter === "all" || item.quarter === selectedQuarter;
      return categoryMatch && quarterMatch;
    });
  }, [selectedCategory, selectedQuarter]);

  const groupedByQuarter = useMemo(() => {
    return quarters
      .filter(q => q !== "all")
      .map(quarter => ({
        quarter,
        items: filteredItems.filter(item => item.quarter === quarter)
      }))
      .filter(group => group.items.length > 0);
  }, [filteredItems, quarters]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleQuarterChange = useCallback((quarter: string) => {
    setSelectedQuarter(quarter);
  }, []);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/50 sticky top-4 z-10">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-300 mb-3 block">Category</label>
          <div className="flex flex-wrap gap-2 max-h-20 sm:max-h-none overflow-y-auto sm:overflow-visible">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                aria-pressed={selectedCategory === category}
                aria-label={`Filter by ${category === "all" ? "all categories" : category}`}
                className="capitalize"
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-300 mb-3 block">Timeline</label>
          <div className="flex flex-wrap gap-2 max-h-20 sm:max-h-none overflow-y-auto sm:overflow-visible">
            {quarters.map(quarter => (
              <Button
                key={quarter}
                variant={selectedQuarter === quarter ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuarterChange(quarter)}
                aria-pressed={selectedQuarter === quarter}
                aria-label={`Filter by ${quarter === "all" ? "all timelines" : quarter}`}
              >
                {quarter === "all" ? "All Time" : quarter}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Desktop Clear Filters Button */}
        {hasActiveFilters && (
          <div className="hidden sm:flex justify-end p-4 pt-0">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Roadmap Timeline */}
      {filteredItems.length > 0 && (
        <div className="space-y-12">
          {groupedByQuarter.map(({ quarter, items }) => (
          <div key={quarter} className="relative">
            {/* Quarter Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30 shadow-lg">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{quarter}</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-purple-500/50 via-blue-500/30 to-transparent flex-1" />
            </div>

            {/* Timeline Line */}
            <div className="absolute left-3 sm:left-6 top-20 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-gray-600/30" />

            {/* Items */}
            <div className="space-y-6 ml-8 sm:ml-16">
              {items.map((item) => {
                const StatusIcon = statusConfig[item.status].icon;
                const CategoryIcon = categoryIcons[item.category];
                
                return (
                  <div key={item.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-8 sm:-left-16 top-6 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 ${statusConfig[item.status].color} bg-gray-900`} />
                    
                    {/* Content Card */}
                    <div className={`p-5 sm:p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${statusConfig[item.status].bgColor}`}>
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig[item.status].color}`}>
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight">{item.title}</h3>
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 order-2 sm:order-1">
                          <Badge className={statusConfig[item.status].color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[item.status].label}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {item.impact} Impact
                          </Badge>
                        </div>
                      </div>

                      {/* Features List */}
                      {item.features && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {item.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start gap-2 text-sm text-gray-400 break-words">
                              <ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-900/20 rounded-lg border border-gray-800/30">
          <p className="text-sm text-gray-300">
            Showing <span className="font-semibold text-white">{filteredItems.length}</span> roadmap items
            {hasActiveFilters && ' matching your filters'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              View all items
            </button>
          )}
        </div>
      )}
      
      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No items found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters to see more roadmap items.</p>
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 p-6 sm:p-8 bg-gradient-to-r from-purple-900/20 via-blue-900/15 to-purple-900/20 rounded-2xl border border-gray-800/50 text-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">Have a Feature Request?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            We're always looking for ways to improve Gamerfie. Share your ideas and help shape the future of our platform!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/info/contact"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              Submit Feedback
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://discord.gg/gamerfie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 text-white font-semibold rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-105"
            >
              Join Community
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
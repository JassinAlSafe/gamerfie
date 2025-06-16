"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  Calendar,
  Trophy,
  Heart,
  TrendingUp,
  Clock,
  Users,
  Gamepad2,
  Sparkles,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaylistType } from "@/types/playlist";
import { PLAYLIST_TYPE_CONFIG } from "@/lib/playlist-utils";

interface PlaylistTemplate {
  id: string;
  name: string;
  description: string;
  type: PlaylistType;
  icon: React.ComponentType<{ className?: string }>;
  gameIds: string[];
  metadata: {
    tags?: string[];
  };
  isPopular?: boolean;
}

const templates: PlaylistTemplate[] = [
  {
    id: "trending-now",
    name: "Trending Now",
    description: "Current most popular games across all platforms",
    type: "featured",
    icon: TrendingUp,
    gameIds: [], // Would be populated with trending game IDs
    metadata: {
      tags: ["trending", "popular", "new"]
    },
    isPopular: true
  },
  {
    id: "indie-gems",
    name: "Indie Gems",
    description: "Hidden indie masterpieces worth discovering",
    type: "collection",
    icon: Sparkles,
    gameIds: [],
    metadata: {
      tags: ["indie", "hidden gems", "artistic"]
    },
    isPopular: true
  },
  {
    id: "multiplayer-madness",
    name: "Multiplayer Madness",
    description: "Best games to play with friends and family",
    type: "collection",
    icon: Users,
    gameIds: [],
    metadata: {
      tags: ["multiplayer", "co-op", "party"]
    }
  },
  {
    id: "award-winners",
    name: "Award Winners",
    description: "Game of the Year winners and nominees",
    type: "collection",
    icon: Award,
    gameIds: [],
    metadata: {
      tags: ["awards", "goty", "acclaimed"]
    }
  },
  {
    id: "quick-plays",
    name: "Quick Plays",
    description: "Games you can finish in a weekend",
    type: "collection",
    icon: Clock,
    gameIds: [],
    metadata: {
      tags: ["short", "weekend", "quick"]
    }
  },
  {
    id: "summer-event",
    name: "Summer Gaming Event",
    description: "Special summer gaming showcase event",
    type: "event",
    icon: Calendar,
    gameIds: [],
    metadata: {
      tags: ["summer", "event", "showcase"]
    }
  },
  {
    id: "retro-classics",
    name: "Retro Classics",
    description: "Timeless games that defined gaming",
    type: "genre",
    icon: Trophy,
    gameIds: [],
    metadata: {
      tags: ["retro", "classic", "nostalgia"]
    }
  },
  {
    id: "community-favorites",
    name: "Community Favorites",
    description: "Most loved games by our community",
    type: "collection",
    icon: Heart,
    gameIds: [],
    metadata: {
      tags: ["community", "favorites", "loved"]
    }
  }
];

interface PlaylistTemplatesProps {
  onCreateFromTemplate: (template?: PlaylistTemplate) => void;
}

const PlaylistTemplates: React.FC<PlaylistTemplatesProps> = ({
  onCreateFromTemplate,
}) => {
  const handleCreateFromTemplate = () => {
    // You would typically pass the template data to create a new playlist
    onCreateFromTemplate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quick Start Templates</h2>
          <p className="text-sm text-muted-foreground">
            Start with a pre-configured playlist template
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => onCreateFromTemplate()}
          className="gap-2"
        >
          <Gamepad2 className="w-4 h-4" />
          Custom Playlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            onSelect={handleCreateFromTemplate}
          />
        ))}
      </div>

      {/* Popular Templates Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Popular Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates
            .filter(t => t.isPopular)
            .map((template, index) => (
              <PopularTemplateCard
                key={template.id}
                template={template}
                index={index}
                onSelect={handleCreateFromTemplate}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: PlaylistTemplate;
  index: number;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  index,
  onSelect,
}) => {
  const Icon = template.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${PLAYLIST_TYPE_CONFIG[template.type].color}`} />
        <CardContent className="p-4" onClick={onSelect}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${PLAYLIST_TYPE_CONFIG[template.type].color} flex items-center justify-center text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{template.name}</h4>
                {template.isPopular && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {template.metadata.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(template.metadata.tags?.length || 0) > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{(template.metadata.tags?.length || 0) - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            variant="outline"
          >
            <Zap className="w-3 h-3 mr-1" />
            Use Template
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PopularTemplateCard: React.FC<TemplateCardProps> = ({
  template,
  index,
  onSelect,
}) => {
  const Icon = template.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
        <CardContent className="p-0" onClick={onSelect}>
          <div className="flex">
            <div className={`w-20 h-20 bg-gradient-to-br ${PLAYLIST_TYPE_CONFIG[template.type].color} flex items-center justify-center text-white flex-shrink-0`}>
              <Icon className="w-8 h-8" />
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{template.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {template.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {template.metadata.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="outline"
                >
                  <Zap className="w-3 h-3" />
                  Use
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlaylistTemplates;
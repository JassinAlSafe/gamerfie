import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, Edit3 } from "lucide-react";
import type { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  profile: Profile;
}

export const AboutSection = memo<AboutSectionProps>(({ profile }) => {
  const hasBio = profile.bio && profile.bio.trim().length > 0;

  return (
    <Card className={cn(
      "glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl",
      "hover:border-gray-600/40 transition-all duration-300 group"
    )}>
      <CardContent className="p-6">
        {/* Section Header with Apple-inspired typography */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">About</h3>
          </div>
          
          {/* Subtle edit hint for empty state */}
          {!hasBio && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Edit3 className="h-4 w-4 text-gray-500" />
            </div>
          )}
        </div>

        {/* Content with Apple's content-first approach */}
        <div className="space-y-3">
          {hasBio ? (
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed text-[15px] font-normal">
                {profile.bio}
              </p>
              
              {/* Subtle visual separator */}
              <div className="w-12 h-px bg-gradient-to-r from-gray-600 to-transparent mt-4" />
              
              {/* Profile metadata with refined typography */}
              <div className="flex items-center text-xs text-gray-500 space-x-4 mt-3">
                <span>Member since {new Date(profile.created_at || '').getFullYear()}</span>
                {profile.updated_at && profile.updated_at !== profile.created_at && (
                  <>
                    <span>•</span>
                    <span>Updated {new Date(profile.updated_at).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Empty state with encouraging design */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
                <Edit3 className="h-6 w-6 text-gray-500" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-white font-medium tracking-tight">
                  Tell us about yourself
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Share your gaming journey, favorite genres, or anything that makes you unique.
                </p>
              </div>
              
              {/* Subtle call-to-action */}
              <div className="pt-2">
                <div className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Add bio in profile settings
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

AboutSection.displayName = 'AboutSection';
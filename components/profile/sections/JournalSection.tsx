import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookText, ArrowRight, PenTool, Trophy, Star, Calendar, List, FileText } from "lucide-react";
import Link from "next/link";
import type { JournalEntry } from "@/types/journal";
import { formatDisplayDate } from "@/utils/date-formatting";
import { cn } from "@/lib/utils";

interface JournalSectionProps {
  entries: JournalEntry[];
}

export const JournalSection = memo<JournalSectionProps>(({ entries }) => {
  const hasEntries = entries && entries.length > 0;
  const displayEntries = entries.slice(0, 3);

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return Star;
      case 'progress': return Trophy;
      case 'daily': return Calendar;
      case 'list': return List;
      case 'achievement': return Trophy;
      default: return FileText;
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'review': return 'text-yellow-400 bg-yellow-500/20';
      case 'progress': return 'text-blue-400 bg-blue-500/20';
      case 'daily': return 'text-green-400 bg-green-500/20';
      case 'list': return 'text-purple-400 bg-purple-500/20';
      case 'achievement': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'review': return 'Review';
      case 'progress': return 'Progress';
      case 'daily': return 'Daily';
      case 'list': return 'List';
      case 'achievement': return 'Achievement';
      case 'note': return 'Note';
      default: return 'Entry';
    }
  };

  return (
    <Card className={cn(
      "glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl",
      "hover:border-gray-600/40 transition-all duration-300 group"
    )}>
      <CardContent className="p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <BookText className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Journal</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {hasEntries ? `${entries.length} journal entries` : 'Your gaming journal'}
              </p>
            </div>
          </div>
          
          {/* Action button */}
          <Link href="/profile/journal">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "profile-nav-item touch-feedback",
                "text-gray-400 hover:text-white hover:bg-white/10",
                "transition-all duration-200 rounded-lg group/btn"
              )}
            >
              {hasEntries ? (
                <>
                  View All
                  <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  Start Writing
                  <PenTool className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </Link>
        </div>
        {/* Content */}
        {hasEntries ? (
          <div className="space-y-3">
            {displayEntries.map((entry, index) => {
              const TypeIcon = getEntryTypeIcon(entry.type);
              const typeColor = getEntryTypeColor(entry.type);
              const typeLabel = getEntryTypeLabel(entry.type);
              
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "p-3 rounded-xl border border-gray-700/50",
                    "hover:bg-white/5 hover:border-gray-600/50 transition-all duration-200 group/entry"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white line-clamp-1 group-hover/entry:text-indigo-100 transition-colors">
                      {entry.title || (entry.type === 'review' && entry.content ? entry.content : entry.game?.name || 'Untitled Entry')}
                    </h4>
                    <div className={cn("flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium", typeColor)}>
                      <TypeIcon className="h-3 w-3" />
                      <span>{typeLabel}</span>
                    </div>
                  </div>
                  
                  {entry.content && entry.type !== 'review' && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-2">
                      {entry.content}
                    </p>
                  )}
                  
                  {entry.type === 'review' && entry.game?.name && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-1 mb-2">
                      {entry.game.name}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {formatDisplayDate(entry.createdAt)}
                  </p>
                </div>
              );
            })}

            {/* Show remaining entries count */}
            {entries.length > 3 && (
              <div className="pt-2 border-t border-gray-700/30">
                <Link href="/profile/journal">
                  <div className="text-center py-2 text-xs text-gray-400 hover:text-gray-300 cursor-pointer transition-colors">
                    +{entries.length - 3} more entr{entries.length - 3 !== 1 ? 'ies' : 'y'}
                  </div>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
              <PenTool className="h-6 w-6 text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium tracking-tight">
                Start Your Gaming Journal
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Document your gaming journey, progress, and memorable moments.
              </p>
            </div>
            
            {/* Call-to-action */}
            <div className="pt-2">
              <Link href="/profile/journal">
                <div className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                  <PenTool className="h-3 w-3 mr-1" />
                  Create your first entry
                </div>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

JournalSection.displayName = 'JournalSection';
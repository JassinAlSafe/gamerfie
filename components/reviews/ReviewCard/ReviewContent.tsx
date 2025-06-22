import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReviewContentProps {
  reviewText: string;
  isLongReview: boolean;
  showFullReview: boolean;
  onToggleFullReview: () => void;
}

export function ReviewContent({ 
  reviewText, 
  isLongReview, 
  showFullReview, 
  onToggleFullReview 
}: ReviewContentProps) {
  const maxCharsCollapsed = 150;
  const displayText = showFullReview 
    ? reviewText 
    : reviewText?.slice(0, maxCharsCollapsed);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-slate-800/20 rounded-lg p-3 border border-slate-700/30 relative h-full flex flex-col">
        {/* Text Content */}
        <div className={`flex-1 ${!showFullReview ? 'overflow-hidden' : ''} min-h-[60px] flex items-start`}>
          <div className={`relative w-full ${!showFullReview && isLongReview ? 'max-h-[120px] overflow-hidden' : ''}`}>
            <p className="text-slate-200 leading-relaxed text-sm">
              {displayText}
              {isLongReview && !showFullReview && "..."}
            </p>
            
            {/* Gradient fade for long content */}
            {!showFullReview && isLongReview && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-800/20 to-transparent pointer-events-none" />
            )}
          </div>
        </div>

        {/* Read More/Less Button */}
        {isLongReview && (
          <div className="mt-3 pt-2 border-t border-slate-700/20">
            <button
              onClick={onToggleFullReview}
              className="text-xs text-slate-400 hover:text-white transition-all duration-200 flex items-center gap-1 group"
            >
              {showFullReview ? (
                <>
                  Show less
                  <ChevronUp className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" />
                </>
              ) : (
                <>
                  Read more
                  <ChevronDown className="w-3 h-3 transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
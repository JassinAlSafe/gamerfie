import React from "react";
import { ExternalLink } from "lucide-react";

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
  const displayText = showFullReview 
    ? reviewText 
    : reviewText?.slice(0, 200);

  return (
    <div className="mb-4 flex-1">
      <div className="bg-slate-800/20 rounded-lg p-3 border border-slate-700/30">
        <p className="text-slate-200 leading-relaxed text-sm">
          {displayText}
          {isLongReview && !showFullReview && "..."}
        </p>
        {isLongReview && (
          <button
            onClick={onToggleFullReview}
            className="text-xs text-slate-400 hover:text-white mt-2 transition-colors flex items-center gap-1"
          >
            {showFullReview ? "Show less" : "Read more"}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
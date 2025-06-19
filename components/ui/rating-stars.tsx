"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  size?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  showValue?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  variant?: "default" | "glow" | "minimal";
}

const sizeConfig = {
  sm: { star: "w-3 h-3", text: "text-xs", spacing: "gap-0.5" },
  md: { star: "w-4 h-4", text: "text-sm", spacing: "gap-1" },
  lg: { star: "w-5 h-5", text: "text-base", spacing: "gap-1" },
  xl: { star: "w-6 h-6", text: "text-lg", spacing: "gap-1.5" },
};

export function RatingStars({
  rating,
  totalStars = 5,
  size = "md",
  interactive = false,
  showValue = false,
  onRatingChange,
  className,
  variant = "default",
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const config = sizeConfig[size];
  const currentRating = interactive && isHovering ? hoverRating : rating;

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovering(false);
      setHoverRating(0);
    }
  };

  const getStarVariant = (starIndex: number) => {
    const isActive = starIndex <= currentRating;

    switch (variant) {
      case "glow":
        return cn(
          "transition-all duration-200",
          isActive
            ? "text-yellow-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            : "text-gray-600 hover:text-gray-500"
        );
      case "minimal":
        return cn(
          "transition-colors duration-200",
          isActive ? "text-yellow-500 fill-current" : "text-gray-400"
        );
      default:
        return cn(
          "transition-all duration-200",
          isActive ? "text-yellow-400 fill-current" : "text-gray-600",
          interactive && "hover:text-yellow-300 hover:scale-110"
        );
    }
  };

  return (
    <div className={cn("flex items-center", config.spacing, className)}>
      <div
        className={cn("flex items-center", config.spacing)}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: totalStars }, (_, index) => {
          const starIndex = index + 1;
          const isPartial =
            !Number.isInteger(currentRating) &&
            starIndex === Math.ceil(currentRating);
          const partialPercentage = isPartial ? (currentRating % 1) * 100 : 0;

          return (
            <motion.button
              key={index}
              className={cn(
                "relative focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded",
                interactive ? "cursor-pointer" : "cursor-default"
              )}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              whileHover={interactive ? { scale: 1.1 } : undefined}
              whileTap={interactive ? { scale: 0.95 } : undefined}
              disabled={!interactive}
            >
              {/* Base star (empty) */}
              <Star className={cn(config.star, getStarVariant(0))} />

              {/* Filled star overlay */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: isPartial
                    ? `inset(0 ${100 - partialPercentage}% 0 0)`
                    : starIndex <= currentRating
                    ? "inset(0 0 0 0)"
                    : "inset(0 100% 0 0)",
                }}
              >
                <Star className={cn(config.star, getStarVariant(starIndex))} />
              </div>

              {/* Hover glow effect for interactive stars */}
              {interactive && variant === "glow" && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Star
                    className={cn(config.star, "text-yellow-400/30 blur-sm")}
                  />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Rating value display */}
      {showValue && (
        <AnimatePresence mode="wait">
          <motion.span
            key={currentRating}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={cn(
              config.text,
              "font-medium text-gray-300 ml-2",
              interactive && isHovering && "text-yellow-400"
            )}
          >
            {currentRating.toFixed(1)}
          </motion.span>
        </AnimatePresence>
      )}

      {/* Interactive feedback tooltip */}
      {interactive && isHovering && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg shadow-lg pointer-events-none"
          style={{ bottom: "100%", left: "50%", transform: "translateX(-50%)" }}
        >
          {hoverRating} star{hoverRating !== 1 ? "s" : ""}
        </motion.div>
      )}
    </div>
  );
}

// Preset variants for common use cases
export const ReviewRating = ({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) => (
  <RatingStars
    rating={rating}
    size="md"
    variant="glow"
    showValue
    className={className}
  />
);

export const CompactRating = ({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) => (
  <RatingStars
    rating={rating}
    size="sm"
    variant="minimal"
    className={className}
  />
);

export const InteractiveRating = ({
  rating,
  onRatingChange,
  className,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  className?: string;
}) => (
  <RatingStars
    rating={rating}
    size="lg"
    variant="glow"
    interactive
    showValue
    onRatingChange={onRatingChange}
    className={className}
  />
);

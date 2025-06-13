"use client";

import { memo, useEffect, useState, useRef } from "react";
import { GameProgressRing } from "./GameProgressRing";

interface GameProgressRingDebugProps {
  completedGames?: number;
  totalGames?: number;
  totalPlaytime?: number;
  weeklyGoal?: number;
  className?: string;
}

export const GameProgressRingDebug = memo(function GameProgressRingDebug(props: GameProgressRingDebugProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative border-2 border-red-500">
      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs p-1 z-50">
        {dimensions.width}x{dimensions.height}
      </div>
      <GameProgressRing {...props} />
    </div>
  );
});
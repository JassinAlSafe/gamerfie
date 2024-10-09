"use client";

import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface GameProgressBarProps {
  currentLevel: number;
  currentExp: number;
  expToNextLevel: number;
}

const GameProgressBar: React.FC<GameProgressBarProps> = ({
  currentLevel,
  currentExp,
  expToNextLevel,
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress((currentExp / expToNextLevel) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentExp, expToNextLevel]);

  const levelMarkers = [1, 2, 3, 4, 5];

  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
          <Star className="w-4 h-4 mr-2 text-yellow-400" />
          Level {currentLevel}
        </Badge>
        <span className="text-lg font-semibold text-gray-300">
          {currentExp} / {expToNextLevel} XP
        </span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Progress value={animationProgress} className="h-4" />
              {levelMarkers.map((level, index) => (
                <div
                  key={level}
                  className={`absolute top-0 w-1 h-4 bg-gray-600 transition-colors duration-300 ${
                    (index + 1) * 20 <= animationProgress ? "bg-primary" : ""
                  }`}
                  style={{ left: `${index * 25}%` }}
                />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`${animationProgress.toFixed(1)}% to next level`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex justify-between mt-4">
        {levelMarkers.map((level) => (
          <TooltipProvider key={level}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    level <= currentLevel
                      ? "bg-primary text-primary-foreground shadow-lg scale-110"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {level}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{level <= currentLevel ? "Achieved" : "Locked"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default GameProgressBar;
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
}

export function TextGenerateEffect({
  words,
  className,
}: TextGenerateEffectProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + words[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, words]);

  return (
    <div className={cn("font-bold", className)}>
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
        {displayText}
        {currentIndex < words.length && (
          <span className="animate-pulse">|</span>
        )}
      </div>
    </div>
  );
}

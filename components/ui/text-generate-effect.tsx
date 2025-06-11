"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const TextGenerateEffect = ({
  words,
  className = "",
  as: Component = "span",
}: {
  words: string;
  className?: string;
  as?: "span" | "div" | "p";
}) => {
  const [displayText, setDisplayText] = useState(words); // Start with full text for SSR
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setDisplayText("");
    setIsGenerating(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    
    const timeout = setTimeout(() => {
      if (displayText.length < words.length && isGenerating) {
        setDisplayText(words.slice(0, displayText.length + 1));
      } else {
        setIsGenerating(false);
      }
    }, 30);

    return () => clearTimeout(timeout);
  }, [displayText, words, isGenerating, hasMounted]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      suppressHydrationWarning
    >
      <Component>{displayText}</Component>
      {isGenerating && hasMounted && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block ml-1 border-r-2 border-purple-400 h-4 w-[2px]"
        />
      )}
    </motion.span>
  );
};

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
  const [displayText, setDisplayText] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (displayText.length < words.length && isGenerating) {
        setDisplayText(words.slice(0, displayText.length + 1));
      } else {
        setIsGenerating(false);
      }
    }, 30); // Slower typing speed (was previously 10)

    return () => clearTimeout(timeout);
  }, [displayText, words, isGenerating]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Component>{displayText}</Component>
      {isGenerating && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block ml-1 border-r-2 border-primary h-4 w-[2px]"
        />
      )}
    </motion.span>
  );
};

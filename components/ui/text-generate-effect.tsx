"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const TextGenerateEffect = ({
  words,
  className = "",
}: {
  words: string;
  className?: string;
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
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span>{displayText}</span>
      {isGenerating && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block ml-1 border-r-2 border-primary h-4 w-[2px]"
        />
      )}
    </motion.div>
  );
};

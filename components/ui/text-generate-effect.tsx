"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [wordArray, setWordArray] = useState<string[]>([]);

  useEffect(() => {
    setWordArray(words.split(" "));
  }, [words]);

  return (
    <span className={cn("inline-block", className)}>
      {wordArray.map((word, idx) => {
        return (
          <motion.span
            key={word + idx}
            className="text-gray-300 dark:text-gray-300 inline-block mr-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.25,
              delay: idx * 0.1,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
};

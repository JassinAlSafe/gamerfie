"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AnimatedTooltipProps {
  items: {
    id: string | number;
    name: string;
    designation?: string;
    image?: string;
  }[];
  className?: string;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  items,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const x = useMotionValue(0);

  return (
    <div className={cn("flex gap-2", className)}>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: x,
                  rotate: 0,
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex items-center justify-center"
              >
                <div className="bg-black/80 backdrop-blur-sm border border-white/10 p-2 rounded-lg">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs text-white font-bold">{item.name}</p>
                    {item.designation && (
                      <p className="text-xs text-white/60">
                        {item.designation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative">
            {item.image ? (
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white group-hover:scale-105 transition-transform duration-200">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-neutral-600 flex items-center justify-center border-2 border-white group-hover:scale-105 transition-transform duration-200">
                <span className="text-sm text-white">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

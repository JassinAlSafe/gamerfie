"use client";

import { motion } from "framer-motion";

export function AnimatedFeaturesContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {children}
    </motion.div>
  );
}

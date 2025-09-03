"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { createSkeletonArray } from "@/utils/game-list-details-utils";

export const GameListSkeleton = memo(function GameListSkeleton() {
  return (
    <motion.div 
      className="space-y-8 animate-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header Skeleton */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="h-12 w-2/3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg" />
            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-700/50 to-gray-600/50" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
                <div className="h-4 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-md" />
            <div className="h-9 w-20 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-md" />
          </div>
        </div>
      </div>

      {/* Games Section Skeleton */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 space-y-4">
        <div className="h-7 w-48 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
        <div className="grid gap-4" style={{ 
          gridTemplateColumns: 'repeat(auto-fill, minmax(201px, 1fr))',
          justifyItems: 'center'
        }}>
          {createSkeletonArray(6).map((_, i) => (
            <motion.div
              key={i}
              className="bg-white/5 rounded-lg overflow-hidden space-y-3 p-3 w-full max-w-[201px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{ width: '201px' }}
            >
              <div className="aspect-[3/4] bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-md" />
              <div className="h-5 w-full bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
              <div className="h-4 w-2/3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comments Section Skeleton */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 space-y-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <div className="h-7 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
        </div>
        
        <div className="flex gap-4 items-start">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-700/50 to-gray-600/50" />
          <div className="flex-1 h-10 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-md" />
        </div>

        <div className="space-y-4">
          {createSkeletonArray(3).map((_, i) => (
            <motion.div
              key={i}
              className="flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-700/50 to-gray-600/50" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-4 w-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
                  <div className="h-4 w-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
                </div>
                <div className="h-4 w-full bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
                <div className="h-4 w-3/4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});
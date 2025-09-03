"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/friends/ActionButton";
import { Plus, BookOpen, Sparkles } from "lucide-react";

export interface EmptyStateProps {
  onCreateList: () => void;
  variant?: "default" | "compact";
}

export const EmptyState = memo<EmptyStateProps>(function EmptyState({
  onCreateList,
  variant = "default"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30">
        <CardContent className={variant === "compact" ? "p-8" : "p-12"}>
          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="relative"
            >
              <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-purple-400" />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="space-y-2">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className={`font-bold text-white ${variant === "compact" ? "text-xl" : "text-2xl"}`}
              >
                No Game Lists Yet
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className={`text-gray-400 ${variant === "compact" ? "text-sm" : "text-base"}`}
              >
                Create your first game list to start organizing your favorite games, 
                wishlist items, or completed adventures
              </motion.p>
            </div>

            {/* Features List */}
            {variant !== "compact" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Organize Games</p>
                    <p className="text-gray-400 text-xs">Create custom collections</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Track Progress</p>
                    <p className="text-gray-400 text-xs">Monitor your journey</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Share & Discover</p>
                    <p className="text-gray-400 text-xs">Connect with others</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <ActionButton
                onClick={onCreateList}
                color="purple"
                size="lg"
                icon={<Plus />}
                className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
              >
                Create Your First List
              </ActionButton>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
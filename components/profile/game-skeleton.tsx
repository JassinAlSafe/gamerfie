import { motion } from "framer-motion";

export function GameSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="relative rounded-xl overflow-hidden"
    >
      <div className="aspect-[3/4] bg-gray-800/50 animate-pulse rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-800/10 to-gray-800/30" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-4 bg-gray-700/50 rounded-md w-3/4 mb-2 animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-700/50 rounded-full w-24 animate-pulse" />
          <div className="h-8 w-8 bg-gray-700/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export function GameSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-2 md:px-0">
      {Array.from({ length: 12 }).map((_, index) => (
        <GameSkeleton key={index} index={index} />
      ))}
    </div>
  );
} 
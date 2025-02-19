"use client";

import { motion } from "framer-motion";
import { Stat } from "@/types/home";

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="mt-16 w-full max-w-6xl px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="bg-gray-900/50 rounded-xl p-6 text-center backdrop-blur-md"
    >
      <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
        {stat.value}
      </div>
      <div className="text-gray-400 text-sm sm:text-lg">{stat.label}</div>
    </motion.div>
  );
}

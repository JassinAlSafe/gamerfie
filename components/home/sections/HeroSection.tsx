"use client";

import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ArrowRight, Play, Trophy, Users, Star, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Stat } from "@/types/home";

interface HeroSectionProps {
  stats: Stat[];
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center py-8 sm:py-12 lg:py-16 xl:py-20 relative px-4 sm:px-6">
      {/* Floating Elements - Hidden on mobile for better performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {[
          { icon: "🎮", top: "20%", left: "10%", delay: 0, duration: 6 },
          { icon: "🔥", top: "30%", right: "15%", delay: 1, duration: 8 },
          { icon: "⚔️", top: "60%", left: "15%", delay: 2, duration: 7 },
          { icon: "🏆", top: "70%", right: "20%", delay: 3, duration: 9 },
          { icon: "⭐", top: "40%", left: "5%", delay: 4, duration: 5 },
          { icon: "🚀", top: "80%", right: "10%", delay: 5, duration: 8 }
        ].map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-xl lg:text-2xl opacity-30"
            style={{
              top: item.top,
              left: item.left,
              right: item.right
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-5, 5, -5],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Badge variant="outline" className="border-purple-500/50 text-purple-300 px-4 py-2 sm:px-6 sm:py-3 bg-black/20 backdrop-blur-sm hover:border-purple-400/70 hover:bg-purple-500/10 transition-all duration-300 cursor-default text-sm sm:text-base">
            <span className="mr-2 text-base sm:text-lg">🎮</span>
            <span className="font-medium tracking-wide">The Ultimate Gaming Platform</span>
          </Badge>
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.span 
            className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Track.
          </motion.span>
          <motion.span 
            className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Connect.
          </motion.span>
          <motion.span 
            className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Conquer.
          </motion.span>
        </motion.h1>

        <motion.div 
          className="max-w-2xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <TextGenerateEffect
            words="Your ultimate gaming companion. Track your progress, connect with fellow gamers, and unlock achievements across your entire gaming library."
            className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link href="/signin">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 h-auto text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden group border border-purple-500/20 hover:border-purple-400/30"
              >
                <span className="relative z-10">Start Your Journey</span>
                <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </Link>
          <Link href="/explore">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/70 px-8 py-4 h-auto text-lg font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm bg-black/20 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <Play className="mr-2 h-5 w-5" />
                Explore Games
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mt-12 lg:mt-16 text-sm text-gray-400"
        >
          {[
            { icon: Trophy, text: "Track Achievements" },
            { icon: Users, text: "Find Friends" },
            { icon: Star, text: "Rate Games" },
            { icon: BarChart3, text: "View Stats" }
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.text}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-900/30 backdrop-blur-sm border border-gray-800/50"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-4 w-4 text-purple-400" />
                <span>{feature.text}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20 lg:mt-24 w-full max-w-6xl"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
          >
            <AnimatedCard variant="stat" className="p-6 md:p-8 text-center h-full">
              <div className="space-y-3">
                <div className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm md:text-base font-medium tracking-wide">
                  {stat.label}
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60" />
            </AnimatedCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
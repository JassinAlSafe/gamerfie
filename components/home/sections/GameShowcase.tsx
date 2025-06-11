"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Star } from "lucide-react";
import Link from "next/link";

const gameData = [
  { title: "The Witcher 3", players: "2.3k", rating: "4.8", image: "🎮", trend: "+12%" },
  { title: "Cyberpunk 2077", players: "1.8k", rating: "4.6", image: "🔥", trend: "+8%" },
  { title: "Elden Ring", players: "3.1k", rating: "4.9", image: "⚔️", trend: "+15%" }
];

export function GameShowcase() {
  return (
    <section className="py-16 lg:py-24 xl:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Popular on Gamerfie
            </span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            See what games our community is playing, rating, and completing right now.
          </p>
        </motion.div>

        {/* Game Grid - Modern Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {gameData.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <AnimatedCard variant="feature" className="p-6 lg:p-8 cursor-pointer group h-full hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="text-4xl lg:text-5xl">{game.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors text-lg lg:text-xl">
                        {game.title}
                      </h3>
                      <div className="flex items-center text-green-400 text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span className="font-medium">{game.trend}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm lg:text-base text-gray-400 mt-3">
                      <div className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="font-medium">{game.players} playing</span>
                      </div>
                      <div className="flex items-center bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                        <Star className="h-3 w-3 text-yellow-400 mr-1 fill-current" />
                        <span className="font-medium text-yellow-400">{game.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/explore">
            <Button
              variant="outline"
              size="lg"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-3 rounded-xl"
            >
              Explore All Games
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
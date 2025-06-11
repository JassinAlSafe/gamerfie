"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Gamepad2, Users, Trophy, Star, BarChart3, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Feature } from "@/types/home";
import { cn } from "@/lib/utils";

const iconMap = {
  Gamepad2,
  Users,
  Trophy,
  Star,
  BarChart3,
  Zap,
};

interface FeaturesSectionProps {
  features: Feature[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
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
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Powerful features designed to enhance your gaming experience and connect you with a vibrant community.
          </p>
        </motion.div>

        {/* Features Grid - Modern Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            const isLargeCard = index === 0 || index === 3; // Make first and fourth cards larger
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  isLargeCard && "md:col-span-2 lg:col-span-1",
                  "group"
                )}
              >
                <Link href={feature.link}>
                  <AnimatedCard 
                    variant="feature" 
                    className={cn(
                      "p-6 lg:p-8 cursor-pointer h-full relative overflow-hidden hover:scale-[1.02] transition-all duration-300",
                      isLargeCard && "xl:p-12"
                    )}
                  >
                    {/* Background Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 space-y-4 lg:space-y-6">
                      {/* Icon Container */}
                      <motion.div 
                        className="flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className={cn(
                          "p-3 lg:p-4 rounded-2xl border border-purple-500/20 transition-all duration-300",
                          "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
                          "group-hover:border-purple-400/40 group-hover:shadow-lg group-hover:shadow-purple-500/20"
                        )}>
                          <Icon className={cn(
                            `h-6 w-6 lg:h-8 lg:w-8 ${feature.iconColor}`,
                            "transition-all duration-300 group-hover:scale-110"
                          )} />
                        </div>
                      </motion.div>
                      
                      {/* Content */}
                      <div className={cn(
                        "text-center space-y-3 lg:space-y-4",
                        isLargeCard && "lg:text-left lg:space-y-4 xl:space-y-6"
                      )}>
                        <h3 className={cn(
                          "font-bold text-white group-hover:text-purple-300 transition-colors duration-300",
                          isLargeCard ? "text-xl lg:text-2xl xl:text-3xl" : "text-lg lg:text-xl"
                        )}>
                          {feature.title}
                        </h3>
                        <p className={cn(
                          "text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300",
                          isLargeCard ? "text-base lg:text-lg" : "text-sm lg:text-base"
                        )}>
                          {feature.description}
                        </p>
                        
                        {/* Call to Action for Large Cards */}
                        {isLargeCard && (
                          <div className="inline-flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-all duration-300 bg-purple-500/5 hover:bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 hover:border-purple-500/30">
                            <span>Learn More</span>
                            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Hover Effect Lines */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </AnimatedCard>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 lg:mt-20"
        >
          <AnimatedCard variant="feature" className="p-6 lg:p-8 xl:p-12 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 20%, #8B5CF6 0%, transparent 50%), 
                                 radial-gradient(circle at 80% 80%, #EC4899 0%, transparent 50%),
                                 radial-gradient(circle at 50% 50%, #06B6D4 0%, transparent 50%)`
              }} />
            </div>
            
            <div className="relative z-10 space-y-6 lg:space-y-8 max-w-4xl mx-auto">
              <div className="space-y-3 lg:space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <span className="text-purple-400 text-sm font-medium">🚀 Coming Soon</span>
                </div>
                <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white">
                  AI-Powered Game Recommendations
                </h3>
                <p className="text-gray-400 text-base lg:text-lg max-w-2xl mx-auto">
                  Our intelligent system learns from your gaming preferences to suggest new games you'll love, 
                  based on your play style, favorite genres, and community trends.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 text-center">
                {[
                  { emoji: "🧠", label: "Smart Analysis" },
                  { emoji: "🎯", label: "Perfect Matches" },
                  { emoji: "📈", label: "Trend Insights" },
                  { emoji: "🎮", label: "Genre Discovery" }
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    className="space-y-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-xl lg:text-2xl">{item.emoji}</div>
                    <p className="text-gray-400 text-xs lg:text-sm font-medium">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  );
}
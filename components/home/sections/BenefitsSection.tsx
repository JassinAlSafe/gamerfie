"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Shield, Clock, Globe, Sparkles } from "lucide-react";

const benefitData = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your gaming data is secure and private with end-to-end encryption",
    color: "text-green-400",
    gradient: "from-green-400/20 to-emerald-400/20"
  },
  {
    icon: Clock,
    title: "Real-time Sync",
    description: "Instant updates across all your devices with cloud synchronization",
    color: "text-blue-400", 
    gradient: "from-blue-400/20 to-cyan-400/20"
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Connect with millions of gamers worldwide in our inclusive platform",
    color: "text-purple-400",
    gradient: "from-purple-400/20 to-pink-400/20"
  },
  {
    icon: Sparkles,
    title: "Always Free",
    description: "Core features will always be free with optional premium enhancements",
    color: "text-yellow-400",
    gradient: "from-yellow-400/20 to-orange-400/20"
  }
];

export function BenefitsSection() {
  return (
    <section className="py-16 lg:py-24 xl:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why Gamerfie?
            </span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Built for gamers, by gamers. Experience the difference with our platform.
          </p>
        </motion.div>

        {/* Benefits Grid - Modern Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefitData.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <AnimatedCard variant="stat" className="p-6 lg:p-8 text-center h-full relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 space-y-4 lg:space-y-6">
                    {/* Icon Container */}
                    <motion.div 
                      className="flex justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`p-3 lg:p-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} border border-gray-700/50 group-hover:border-gray-600/50 transition-colors`}>
                        <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${benefit.color}`} />
                      </div>
                    </motion.div>
                    
                    {/* Content */}
                    <div className="space-y-3 lg:space-y-4">
                      <h3 className="font-bold text-white text-base lg:text-lg group-hover:text-purple-200 transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-400 text-xs lg:text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover Effect Lines */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Features Grid - Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 lg:mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Large Feature */}
            <AnimatedCard variant="feature" className="p-6 lg:p-8 xl:p-12">
              <div className="space-y-4 lg:space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <span className="text-purple-400 text-sm font-medium">🎯 Smart Tracking</span>
                </div>
                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white">
                  Intelligent Game Detection
                </h3>
                <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
                  Our advanced algorithms automatically detect your games across multiple platforms, 
                  track your progress, and sync achievements without any manual input required.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Steam", "Epic Games", "GOG", "Xbox", "PlayStation"].map((platform) => (
                    <span 
                      key={platform}
                      className="px-3 py-1 text-xs bg-gray-800/50 text-gray-300 rounded-full border border-gray-700/50"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            {/* Right Column - Two Smaller Features */}
            <div className="space-y-4 lg:space-y-6">
              <AnimatedCard variant="feature" className="p-4 lg:p-6">
                <div className="space-y-3 lg:space-y-4">
                  <div className="text-2xl lg:text-3xl">📊</div>
                  <h3 className="text-lg lg:text-xl font-bold text-white">Detailed Analytics</h3>
                  <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
                    Get insights into your gaming habits with detailed statistics and beautiful visualizations.
                  </p>
                </div>
              </AnimatedCard>
              
              <AnimatedCard variant="feature" className="p-4 lg:p-6">
                <div className="space-y-3 lg:space-y-4">
                  <div className="text-2xl lg:text-3xl">🏆</div>
                  <h3 className="text-lg lg:text-xl font-bold text-white">Achievement System</h3>
                  <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
                    Unlock platform achievements and compete with friends on leaderboards.
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
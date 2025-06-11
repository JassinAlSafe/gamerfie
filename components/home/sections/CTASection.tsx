"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="pt-8 pb-16 lg:pt-12 lg:pb-24 xl:pt-16 xl:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <AnimatedCard variant="feature" className="relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="relative z-10 p-12 md:p-16 max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Header */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex justify-center">
                    <motion.div 
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-medium">Ready to Start?</span>
                    </motion.div>
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-bold">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Level Up Your Gaming
                    </span>
                  </h3>
                  
                  <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Join thousands of gamers already tracking their progress, connecting with friends, 
                    and building their gaming legacy on Gamerfie.
                  </p>
                </motion.div>
                
                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link href="/signin">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 h-auto text-lg font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        <span className="relative z-10">Get Started Free</span>
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
                        className="border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-12 py-4 h-auto text-lg font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm"
                      >
                        Browse Games
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
                
                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-800/50"
                >
                  {[
                    {
                      icon: "🚀",
                      title: "Free Forever",
                      description: "Core features always free"
                    },
                    {
                      icon: "🔒",
                      title: "Privacy First",
                      description: "Your data stays secure"
                    },
                    {
                      icon: "⚡",
                      title: "Instant Setup",
                      description: "Start tracking in minutes"
                    }
                  ].map((trust) => (
                    <motion.div
                      key={trust.title}
                      className="text-center space-y-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl">{trust.icon}</div>
                      <h4 className="font-semibold text-white">{trust.title}</h4>
                      <p className="text-gray-400 text-sm">{trust.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  );
}
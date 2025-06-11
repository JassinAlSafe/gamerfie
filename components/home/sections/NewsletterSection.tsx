"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Mail, Bell, Sparkles } from "lucide-react";
import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

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
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #8B5CF6 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, #EC4899 0%, transparent 50%)`
              }} />
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
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <Bell className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-medium">Stay Updated</span>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-bold">
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Never Miss a Beat
                    </span>
                  </h3>
                  
                  <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Get early access to new features, discover trending games, and stay connected with the gaming community.
                  </p>
                </motion.div>
                
                {/* Newsletter Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {!isSubscribed ? (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                      <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap"
                      >
                        Subscribe
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-4"
                    >
                      <div className="text-4xl">🎉</div>
                      <p className="text-green-400 font-semibold text-lg">Thanks for subscribing!</p>
                      <p className="text-gray-400">You'll hear from us soon with the latest updates.</p>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Benefits List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
                >
                  {[
                    {
                      icon: "🎮",
                      title: "New Features",
                      description: "Be the first to try new tools and updates"
                    },
                    {
                      icon: "🔥",
                      title: "Trending Games",
                      description: "Weekly highlights of popular community picks"
                    },
                    {
                      icon: "👥",
                      title: "Community Spotlights",
                      description: "Stories from fellow gamers and achievements"
                    }
                  ].map((benefit) => (
                    <motion.div
                      key={benefit.title}
                      className="text-center space-y-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl">{benefit.icon}</div>
                      <h4 className="font-semibold text-white">{benefit.title}</h4>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Privacy Note */}
                <motion.p 
                  className="text-gray-500 text-sm mt-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  No spam, unsubscribe anytime. We respect your privacy and will never share your email.
                </motion.p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  );
}
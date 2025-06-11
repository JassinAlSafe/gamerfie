"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Globe, Sparkles, Mail, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export function FinalSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <section className="py-16 lg:py-24 xl:py-32 relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Why Gamerfie Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
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

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20">
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
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 space-y-4 lg:space-y-6">
                    <motion.div 
                      className="flex justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`p-3 lg:p-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} border border-gray-700/50 group-hover:border-gray-600/50 transition-colors`}>
                        <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${benefit.color}`} />
                      </div>
                    </motion.div>
                    
                    <div className="space-y-3 lg:space-y-4">
                      <h3 className="font-bold text-white text-base lg:text-lg group-hover:text-purple-200 transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-400 text-xs lg:text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Newsletter + CTA Combined Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <AnimatedCard variant="feature" className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #8B5CF6 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, #EC4899 0%, transparent 50%)`
              }} />
            </div>
            
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="max-w-4xl mx-auto text-center space-y-12">
                {/* Newsletter Section */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="space-y-6">
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
                  </div>

                  {/* Newsletter Form */}
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
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-300"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-105 border border-purple-500/20"
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

                {/* Enhanced Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <motion.div 
                      className="bg-gradient-to-r from-black via-gray-900/90 to-black px-4 py-2 rounded-full border border-gray-700/30 backdrop-blur-sm"
                      whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.3)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-gray-300 text-xs font-medium tracking-wide uppercase relative">
                        or
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <motion.div 
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-full h-full border border-purple-500/10 rounded-full"></div>
                  </motion.div>
                  <motion.div 
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-full h-full border border-pink-500/10 rounded-full"></div>
                  </motion.div>
                </div>

                {/* CTA Section */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="space-y-6">
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
                    
                    <h4 className="text-3xl md:text-4xl font-bold">
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Level Up Your Gaming Today
                      </span>
                    </h4>
                    
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                      Join thousands of gamers already tracking their progress and building their gaming legacy.
                    </p>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signin">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 h-auto text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden group border border-purple-500/20 hover:border-purple-400/30"
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
                          className="border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/70 px-12 py-4 h-auto text-lg font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10"
                        >
                          Browse Games
                        </Button>
                      </motion.div>
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-800/50">
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
                        <h5 className="font-semibold text-white">{trust.title}</h5>
                        <p className="text-gray-400 text-sm">{trust.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Quote } from "lucide-react";

const testimonialData = [
  {
    quote: "Finally, a platform that gets what gamers want. Love tracking my achievements!",
    author: "Alex Chen",
    role: "RPG Enthusiast",
    games: 247,
    avatar: "🎯"
  },
  {
    quote: "The community features are amazing. Found my new gaming squad here!",
    author: "Sarah Kim",
    role: "Multiplayer Gamer",
    games: 156,
    avatar: "🎮"
  },
  {
    quote: "Clean interface, great features. This is how game tracking should be done.",
    author: "Mike Rodriguez",
    role: "Indie Game Lover",
    games: 389,
    avatar: "🕹️"
  }
];

export function TestimonialsSection() {
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
            <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Loved by Gamers
            </span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Join a community that's passionate about gaming and tracking progress.
          </p>
        </motion.div>

        {/* Testimonials Grid - Bento Box Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonialData.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <AnimatedCard variant="minimal" className="p-6 lg:p-8 h-full relative group hover:scale-[1.02] transition-all duration-300">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="h-6 w-6 text-purple-400/30 group-hover:text-purple-400/50 transition-colors duration-300" />
                </div>
                
                <div className="space-y-6">
                  {/* Avatar and Quote */}
                  <div className="space-y-4 lg:space-y-6">
                    <div className="text-3xl lg:text-4xl">{testimonial.avatar}</div>
                    <blockquote className="text-gray-300 italic leading-relaxed text-base lg:text-lg relative">
                      <span className="text-purple-400/50 text-2xl absolute -top-2 -left-1 font-serif">“</span>
                      <span className="relative z-10">{testimonial.quote}</span>
                      <span className="text-purple-400/50 text-2xl absolute -bottom-2 -right-1 font-serif">”</span>
                    </blockquote>
                  </div>
                  
                  {/* Author Info */}
                  <div className="border-t border-gray-800/50 pt-4 lg:pt-6 space-y-2">
                    <div className="font-semibold text-white text-base lg:text-lg">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/15 group-hover:border-purple-500/30 transition-all duration-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-xs text-purple-400 font-medium">
                        {testimonial.games} games tracked
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 lg:mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {[
              { label: "Active Daily Users", value: "2,500+" },
              { label: "Games Completed", value: "15,000+" },
              { label: "Community Reviews", value: "45,000+" },
              { label: "Achievement Unlocks", value: "250,000+" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-xs md:text-sm mt-1 lg:mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
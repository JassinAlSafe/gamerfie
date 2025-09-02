"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Star, 
  Users, 
  Trophy, 
  Gamepad2,
  ArrowRight,
  Sparkles,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface EmptyStateProps {
  userHasGames?: boolean;
  completedGamesCount?: number;
  recentCompletedGames?: Array<{id: string, name: string, cover_url?: string}>;
  className?: string;
}

export function ImprovedEmptyState({ 
  userHasGames = false, 
  completedGamesCount = 0,
  recentCompletedGames = [],
  className = ""
}: EmptyStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Gamepad2,
      title: "Play Games",
      description: "Track your gaming journey",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: Star,
      title: "Write Reviews",
      description: "Share your experience", 
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      icon: Users,
      title: "Help Others",
      description: "Guide fellow gamers",
      color: "text-green-400", 
      bgColor: "bg-green-500/20"
    },
    {
      icon: Trophy,
      title: "Build Reputation",
      description: "Become a trusted reviewer",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20"
    }
  ];

  return (
    <div className={`text-center py-16 px-6 ${className}`}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-8 border border-purple-500/20">
            <BookOpen className="w-16 h-16 text-purple-400" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">
          Start Your Review Journey
        </h2>
        <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
          Share your gaming experiences and help build the ultimate gaming community
        </p>

        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-12 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <motion.div
                key={index}
                className={`relative flex flex-col items-center p-3 sm:p-4 rounded-lg transition-all cursor-pointer min-w-[100px] ${
                  isActive ? `${step.bgColor} border border-purple-500/30` : 
                  isCompleted ? 'bg-green-500/20 border border-green-500/30' : 
                  'bg-gray-800/30 border border-gray-700/50'
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentStep(index)}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 ${
                  isActive ? step.color : 
                  isCompleted ? 'text-green-400' : 
                  'text-gray-400'
                }`} />
                <span className="text-xs font-medium text-white text-center">{step.title}</span>
                <span className="text-xs text-gray-400 mt-1 text-center hidden sm:block">{step.description}</span>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 hidden sm:block" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Personalized Actions */}
      <div className="space-y-6">
        {userHasGames ? (
          <Card className="bg-gray-800/30 border-purple-500/20 max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Ready to Review?
              </h3>
              <p className="text-gray-400 mb-4">
                You have {completedGamesCount} completed games waiting for your thoughts
              </p>
              {recentCompletedGames.length > 0 && (
                <div className="flex justify-center gap-2 mb-4">
                  {recentCompletedGames.slice(0, 3).map((game) => (
                    <div key={game.id} className="w-12 h-16 bg-gray-700 rounded overflow-hidden">
                      {game.cover_url ? (
                        <img 
                          src={game.cover_url} 
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <Gamepad2 className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {completedGamesCount > 3 && (
                    <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                      <span className="text-xs text-gray-400">+{completedGamesCount - 3}</span>
                    </div>
                  )}
                </div>
              )}
              <Link href="/profile/games?filter=completed">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                  <Star className="w-4 h-4 mr-2" />
                  Review My Games
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="bg-gray-800/30 border-gray-700/50 max-w-md mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Start Building Your Library
                </h3>
                <p className="text-gray-400 mb-4">
                  Add games to track your progress and unlock the ability to write reviews
                </p>
                <div className="flex gap-2">
                  <Link href="/all-games" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Browse Games
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="outline" size="icon" className="border-gray-700/50">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-sm text-gray-500">
              or explore{" "}
              <Link href="/reviews" className="text-purple-400 hover:text-purple-300 underline">
                community reviews
              </Link>
              {" "}for inspiration
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-8 max-w-lg mx-auto">
          <Card className="bg-gray-800/20 border-gray-700/30">
            <CardContent className="p-4">
              <h4 className="font-medium text-white mb-2">💡 Review Tips</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Be honest about your experience</li>
                <li>• Mention what type of gamer might enjoy it</li>
                <li>• Include both pros and cons</li>
                <li>• Rate based on your enjoyment, not hype</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, BookOpen, Award, Users, ThumbsUp } from "lucide-react";

interface ReviewStatsProps {
  totalReviews: number;
  averageRating: number;
  highRatedCount: number;
  reviewStreak?: number;
  helpfulVotes?: number;
  communityImpact?: number;
}

export function ReviewStatsCard({ 
  totalReviews, 
  averageRating, 
  highRatedCount,
  reviewStreak = 0,
  helpfulVotes = 0,
  communityImpact = 0
}: ReviewStatsProps) {
  const stats = [
    {
      icon: BookOpen,
      label: "Reviews Written",
      value: totalReviews.toString(),
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      icon: Star,
      label: "Average Rating",
      value: totalReviews > 0 ? `${averageRating.toFixed(1)}/10` : "—",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30"
    },
    {
      icon: TrendingUp,
      label: "Highly Rated",
      value: `${highRatedCount}`,
      subtext: totalReviews > 0 ? `${Math.round((highRatedCount / totalReviews) * 100)}%` : "",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: ThumbsUp,
      label: "Helpful Votes",
      value: helpfulVotes.toString(),
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30"
    }
  ];

  if (totalReviews === 0) {
    return (
      <Card className="bg-gray-800/30 border-gray-700/50 mb-8">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              Start Your Review Journey
            </h3>
            <p className="text-gray-400 mb-6">
              Write your first review to unlock detailed statistics and achievements
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center opacity-50">
                    <div className={`${stat.bgColor} rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center border ${stat.borderColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-600">—</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-purple-500/20 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Review Statistics</h3>
          <div className="flex gap-2">
            {helpfulVotes > 10 && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Users className="w-3 h-3 mr-1" />
                Community Helper
              </Badge>
            )}
            {reviewStreak > 7 && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                <Award className="w-3 h-3 mr-1" />
                {reviewStreak}d streak
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`${stat.bgColor} rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center border ${stat.borderColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs text-gray-400 font-medium mb-1">{stat.label}</p>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500">{stat.subtext}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress indicators */}
        {totalReviews > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Quality Rating</span>
                  <span className="text-white">{averageRating.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(averageRating / 10) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">High Rating %</span>
                  <span className="text-white">{totalReviews > 0 ? Math.round((highRatedCount / totalReviews) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalReviews > 0 ? (highRatedCount / totalReviews) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
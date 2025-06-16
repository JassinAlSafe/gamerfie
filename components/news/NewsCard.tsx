"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, Badge as BadgeIcon } from "lucide-react";
import { motion } from "framer-motion";
import { NewsPost } from "@/types/news";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type NewsCardVariant = "featured" | "grid" | "list" | "compact";

interface NewsCardProps {
  post: NewsPost;
  variant?: NewsCardVariant;
  index?: number;
  priority?: boolean;
  className?: string;
}

const getCategoryColor = (category: NewsPost['category']) => {
  const colors = {
    'Product Update': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Feature': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Announcement': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Security': 'bg-red-500/10 text-red-600 border-red-500/20',
    'Community': 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  };
  return colors[category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const NewsCard = memo(({ 
  post, 
  variant = "grid", 
  index = 0, 
  priority = false,
  className 
}: NewsCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        delay: index * 0.1 
      }
    }
  };

  if (variant === "featured") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={cn("group", className)}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:shadow-2xl transition-all duration-300">
          <div className="relative aspect-[16/9]">
            {post.featured_image ? (
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={priority}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                <BadgeIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {post.badge && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0">
                {post.badge}
              </Badge>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <Badge className={cn("mb-2", getCategoryColor(post.category))}>
                {post.category}
              </Badge>
              <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-gray-200 line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.published_at || post.created_at)}
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author.display_name || post.author.username}
                    </div>
                  )}
                </div>
                <Link href={`/news/${post.slug}`}>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (variant === "list") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={cn("group", className)}
      >
        <Link href={`/news/${post.slug}`}>
          <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {post.featured_image && (
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getCategoryColor(post.category))}>
                        {post.category}
                      </Badge>
                      {post.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {post.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </div>
                  <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={cn("group", className)}
      >
        <Link href={`/news/${post.slug}`}>
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn("text-xs", getCategoryColor(post.category))}>
                {post.category}
              </Badge>
              {post.badge && (
                <Badge variant="destructive" className="text-xs">
                  {post.badge}
                </Badge>
              )}
            </div>
            <h4 className="font-medium line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h4>
            <p className="text-xs text-gray-500">
              {formatDate(post.published_at || post.created_at)}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid variant (default)
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn("group", className)}
    >
      <Link href={`/news/${post.slug}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700">
          <div className="relative aspect-[16/9]">
            {post.featured_image ? (
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={priority}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                <BadgeIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {post.badge && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">
                {post.badge}
              </Badge>
            )}
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <Badge className={cn("text-xs", getCategoryColor(post.category))}>
                {post.category}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDate(post.published_at || post.created_at)}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </CardContent>
          
          {post.author && (
            <CardFooter className="pt-0">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                {post.author.display_name || post.author.username}
              </div>
            </CardFooter>
          )}
        </Card>
      </Link>
    </motion.div>
  );
});

NewsCard.displayName = "NewsCard";

export default NewsCard;
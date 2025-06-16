"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft, Share2, Bookmark, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { NewsPost } from "@/types/news";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import CommentsList from "./comments/CommentsList";
import { createClient } from "@/utils/supabase/client";

interface NewsDetailProps {
  post: NewsPost;
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NewsDetail: React.FC<NewsDetailProps> = ({ post, className }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);

        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.article
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("max-w-4xl mx-auto", className)}
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/news">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Button>
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge className={cn("text-sm", getCategoryColor(post.category))}>
            <Tag className="w-3 h-3 mr-1" />
            {post.category}
          </Badge>
          {post.badge && (
            <Badge variant="destructive" className="text-sm">
              {post.badge}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author.display_name || post.author.username}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <Separator />
      </header>

      {/* Featured Image */}
      {post.featured_image && (
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden"
        >
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="prose prose-lg dark:prose-invert max-w-none"
      >
        <div 
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="leading-relaxed"
        />
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {formatDate(post.updated_at)}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share this post
            </Button>
          </div>
        </div>

        {/* Related/Navigation */}
        <div className="mt-8 text-center">
          <Link href="/news">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              View all news
            </Button>
          </Link>
        </div>
      </motion.footer>

      {/* Comments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <CommentsList
          postId={post.id}
          commentsEnabled={post.comments_enabled ?? true}
          currentUserId={currentUser?.id}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
        />
      </motion.section>
    </motion.article>
  );
};

export default NewsDetail;
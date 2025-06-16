"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NewsPost, NewsFilters } from "@/types/news";
import { NewsService } from "@/services/newsService";
import NewsCard, { NewsCardVariant } from "./NewsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsListProps {
  variant?: NewsCardVariant;
  limit?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  featured?: boolean;
  className?: string;
}

const categories: Array<{ value: NewsPost['category']; label: string }> = [
  { value: 'Product Update', label: 'Product Updates' },
  { value: 'Feature', label: 'Features' },
  { value: 'Announcement', label: 'Announcements' },
  { value: 'Security', label: 'Security' },
  { value: 'Community', label: 'Community' },
];

const NewsList: React.FC<NewsListProps> = ({
  variant = "grid",
  limit = 12,
  showFilters = true,
  showSearch = true,
  featured = false,
  className
}) => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<NewsFilters>({
    status: 'published',
    limit,
    page: 1
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchPosts = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: NewsFilters = {
        ...filters,
        page,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory as NewsPost['category'] : undefined
      };

      let response;
      if (featured) {
        const featuredPosts = await NewsService.getFeaturedPosts(limit);
        response = {
          posts: featuredPosts,
          total: featuredPosts.length,
          page: 1,
          limit,
          hasMore: false
        };
      } else {
        response = await NewsService.getNewsPosts(filterParams);
      }

      if (reset || page === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }

      setHasMore(response.hasMore);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, [searchTerm, selectedCategory, featured]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(currentPage + 1, false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const getGridClassName = () => {
    switch (variant) {
      case "featured":
        return "grid grid-cols-1";
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      case "list":
        return "space-y-4";
      case "compact":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => fetchPosts(1, true)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters and Search */}
      {(showFilters || showSearch) && !featured && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => handleCategoryChange('all')}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>

          {showSearch && (
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.includes('does not exist') 
              ? 'News system is being set up. Please run the database migration first.'
              : searchTerm || selectedCategory !== 'all' 
              ? 'No news posts found matching your criteria.'
              : 'No news posts available yet.'
            }
          </p>
          {(searchTerm || selectedCategory !== 'all') && !error?.includes('does not exist') && (
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={getGridClassName()}
        >
          {posts.map((post, index) => (
            <NewsCard
              key={post.id}
              post={post}
              variant={variant}
              index={index}
              priority={index < 3}
            />
          ))}
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="text-center pt-6">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loading && posts.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default NewsList;
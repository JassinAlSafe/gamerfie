"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  Eye,
  Heart,
  Calendar,
  Award
} from "lucide-react";

interface ForumStats {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  activeUsersToday: number;
  pendingReports: number;
  lockedThreads: number;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  threads_count: number;
  posts_count: number;
  last_post_at: string | null;
  created_at: string;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author_username: string;
  category_name: string;
  category_color: string;
  replies_count: number;
  views_count: number;
  likes_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  last_post_at: string;
}

interface ForumAnalyticsProps {
  stats: ForumStats | null;
  categories: ForumCategory[];
  threads: ForumThread[];
}

export function ForumAnalytics({ stats, categories, threads }: ForumAnalyticsProps) {
  const analytics = useMemo(() => {
    if (!stats) return null;

    // Calculate category performance
    const categoryAnalytics = categories
      .map(category => ({
        ...category,
        engagement: (category.posts_count / Math.max(category.threads_count, 1)).toFixed(1)
      }))
      .sort((a, b) => b.threads_count - a.threads_count);

    // Calculate thread performance
    const topThreadsByViews = threads
      .slice()
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 10);

    const topThreadsByEngagement = threads
      .slice()
      .sort((a, b) => (b.likes_count + b.replies_count) - (a.likes_count + a.replies_count))
      .slice(0, 10);

    // Calculate user activity
    const authorStats = threads.reduce((acc, thread) => {
      const author = thread.author_username;
      if (!acc[author]) {
        acc[author] = {
          threadCount: 0,
          totalViews: 0,
          totalLikes: 0,
          totalReplies: 0
        };
      }
      acc[author].threadCount++;
      acc[author].totalViews += thread.views_count;
      acc[author].totalLikes += thread.likes_count;
      acc[author].totalReplies += thread.replies_count;
      return acc;
    }, {} as Record<string, any>);

    const topAuthors = Object.entries(authorStats)
      .map(([username, stats]: [string, any]) => ({
        username,
        ...stats,
        engagement: stats.totalLikes + stats.totalReplies
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    // Calculate time-based analytics
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentThreads = threads.filter(thread => new Date(thread.created_at) >= lastWeek);
    const monthlyThreads = threads.filter(thread => new Date(thread.created_at) >= lastMonth);

    return {
      categoryAnalytics,
      topThreadsByViews,
      topThreadsByEngagement,
      topAuthors,
      weeklyActivity: {
        newThreads: recentThreads.length,
        totalViews: recentThreads.reduce((sum, thread) => sum + thread.views_count, 0),
        totalEngagement: recentThreads.reduce((sum, thread) => sum + thread.likes_count + thread.replies_count, 0)
      },
      monthlyActivity: {
        newThreads: monthlyThreads.length,
        totalViews: monthlyThreads.reduce((sum, thread) => sum + thread.views_count, 0),
        totalEngagement: monthlyThreads.reduce((sum, thread) => sum + thread.likes_count + thread.replies_count, 0)
      }
    };
  }, [stats, categories, threads]);

  if (!stats || !analytics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Forum Analytics</h2>
        <p className="text-muted-foreground">
          Insights into forum performance and user engagement
        </p>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.weeklyActivity.newThreads}</div>
            <p className="text-xs text-muted-foreground">
              New threads this week
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.weeklyActivity.totalViews.toLocaleString()} views
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analytics.weeklyActivity.totalEngagement / Math.max(analytics.weeklyActivity.newThreads, 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average engagement per thread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Authors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topAuthors.length}</div>
            <p className="text-xs text-muted-foreground">
              Top contributors this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.categoryAnalytics.length}</div>
            <p className="text-xs text-muted-foreground">
              Active discussion categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Performance
          </CardTitle>
          <CardDescription>
            Thread count, engagement, and activity by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryAnalytics.map((category, index) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <div 
                      className="p-2 rounded-lg text-sm"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.threads_count} threads • {category.posts_count} posts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    {category.engagement} avg replies
                  </Badge>
                  {category.last_post_at && (
                    <span className="text-muted-foreground">
                      Last: {new Date(category.last_post_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Threads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Most Viewed Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topThreadsByViews.map((thread, index) => (
                <div key={thread.id} className="flex items-center justify-between p-2 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{thread.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {thread.author_username}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {thread.views_count.toLocaleString()} views
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Most Engaged Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topThreadsByEngagement.map((thread, index) => (
                <div key={thread.id} className="flex items-center justify-between p-2 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{thread.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {thread.author_username}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {(thread.likes_count + thread.replies_count)} engagement
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Contributors
          </CardTitle>
          <CardDescription>
            Most active community members by engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topAuthors.map((author, index) => (
              <div key={author.username} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {author.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{author.username}</h4>
                    <p className="text-sm text-muted-foreground">
                      {author.threadCount} threads created
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{author.totalViews.toLocaleString()}</div>
                    <div className="text-muted-foreground">views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{author.totalLikes}</div>
                    <div className="text-muted-foreground">likes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{author.totalReplies}</div>
                    <div className="text-muted-foreground">replies</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
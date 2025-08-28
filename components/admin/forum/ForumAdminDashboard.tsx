"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Edit3,
  Lock,
  Pin
} from "lucide-react";
import { ForumCategoryManager } from "./ForumCategoryManager";
import { ForumThreadModeration } from "./ForumThreadModeration";
import { ForumAnalytics } from "./ForumAnalytics";

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

export function ForumAdminDashboard() {
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch("/api/forum/stats");
      const statsData = await statsResponse.json();
      
      // Fetch categories
      const categoriesResponse = await fetch("/api/forum/categories");
      const categoriesData = await categoriesResponse.json();
      
      // Fetch recent threads
      const threadsResponse = await fetch("/api/forum/threads?limit=20");
      const threadsData = await threadsResponse.json();

      setStats({
        totalThreads: statsData.total_threads || 0,
        totalPosts: statsData.total_posts || 0,
        totalUsers: statsData.total_users || 0,
        activeUsersToday: statsData.active_users_today || 0,
        pendingReports: 0, // TODO: Implement reports system
        lockedThreads: threadsData.threads?.filter((t: ForumThread) => t.is_locked).length || 0
      });
      
      setCategories(categoriesData.categories || []);
      setThreads(threadsData.threads || []);
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forum Management</h1>
          <p className="text-muted-foreground">
            Manage forum categories, moderate discussions, and analyze community activity
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalThreads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Discussions across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsersToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Users active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Replies and discussions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderation</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lockedThreads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Locked threads requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Threads
              </CardTitle>
              <CardDescription>
                Latest forum discussions and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threads.slice(0, 10).map((thread) => (
                  <div key={thread.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{thread.title}</h4>
                        {thread.is_pinned && (
                          <Badge variant="secondary" className="text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {thread.is_locked && (
                          <Badge variant="destructive" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {thread.author_username}</span>
                        <Badge 
                          variant="outline" 
                          style={{ borderColor: thread.category_color, color: thread.category_color }}
                        >
                          {thread.category_name}
                        </Badge>
                        <span>{thread.replies_count} replies</span>
                        <span>{thread.views_count} views</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <ForumCategoryManager 
            categories={categories}
            onCategoriesChange={fetchForumData}
          />
        </TabsContent>

        <TabsContent value="moderation">
          <ForumThreadModeration 
            threads={threads}
            onThreadsChange={fetchForumData}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <ForumAnalytics 
            stats={stats}
            categories={categories}
            threads={threads}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
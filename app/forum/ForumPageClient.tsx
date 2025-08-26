"use client";

import { useState } from "react";
import { ForumCategory, ForumStats } from "@/types/forum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MessageSquare, Users, Eye, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { formatDisplayDate } from "@/utils/date-formatting";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthDialog } from "@/components/auth/AuthDialog";

interface ForumPageClientProps {
  initialCategories: ForumCategory[];
  initialStats: ForumStats;
}

export function ForumPageClient({ initialCategories, initialStats }: ForumPageClientProps) {
  const { user, isInitialized } = useAuthStore();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const [categories] = useState(initialCategories);
  const [stats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const isAuthenticated = isInitialized && !!user;

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewThreadClick = () => {
    if (!isAuthenticated) {
      openDialog({
        defaultTab: "signin",
        actionContext: "to create a new thread"
      });
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !selectedCategory) {
      return;
    }

    try {
      // TODO: Implement thread creation API call
      console.log("Creating thread:", {
        title: newThreadTitle,
        content: newThreadContent,
        category_id: selectedCategory,
      });

      // Reset form
      setNewThreadTitle("");
      setNewThreadContent("");
      setSelectedCategory("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="forum-skip-link">Skip to main content</a>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <main id="main-content" role="main">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Community Forum
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with fellow gamers, share experiences, and get help
            </p>
          </div>

          <Button 
            onClick={handleNewThreadClick}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-purple-500/25 transition-all duration-300" 
            aria-label="Create new forum thread"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Thread
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-background border-border max-w-2xl forum-dialog">
              <DialogHeader>
                <DialogTitle>Create New Thread</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Thread Title</Label>
                  <Input
                    id="title"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="Enter thread title..."
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder="Write your post content..."
                    rows={6}
                    className="bg-card border-border"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-border text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateThread}
                    disabled={!newThreadTitle.trim() || !newThreadContent.trim() || !selectedCategory}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    Create Thread
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 forum-stats">
          <Card className="bg-card border-border hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_threads}</p>
                  <p className="text-sm text-muted-foreground">Threads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_posts}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_users}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active_users_today}</p>
                  <p className="text-sm text-muted-foreground">Online Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-8 forum-search">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border h-12 text-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            aria-label="Search forum categories"
          />
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/forum/category/${category.id}`} aria-label={`Browse ${category.name} category`}>
              <Card className="bg-card border-border hover:bg-accent/5 hover:border-purple-500/20 transition-all duration-200 cursor-pointer group forum-category-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${getCategoryColor(category.color || 'blue')} flex items-center justify-center text-2xl`}>
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-foreground text-lg">{category.name}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {category.threads_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {category.posts_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {category.last_post_user && (
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
                      <span>
                        Last post by{" "}
                        <span className="text-purple-400">{category.last_post_user.username}</span>
                      </span>
                      <span>{formatDisplayDate(category.last_post_at)}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No categories found</h3>
            <p className="text-muted-foreground/70">Try adjusting your search terms</p>
          </div>
        )}
        </main>
      </div>

      {/* Authentication Dialog */}
      <AuthDialog />
    </div>
  );
}
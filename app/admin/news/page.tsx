"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/text/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, Edit, Eye, Calendar, User, Tag, Globe, FileText, Image as ImageIcon, Hash, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { NewsPost } from "@/types/news";

interface CreateNewsForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category:
    | "Product Update"
    | "Feature"
    | "Announcement"
    | "Security"
    | "Community";
  status: "draft" | "published";
  badge: string;
  comments_enabled: boolean;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Product Update":
      return "from-purple-500 to-purple-400";
    case "Feature":
      return "from-blue-500 to-blue-400";
    case "Announcement":
      return "from-green-500 to-green-400";
    case "Security":
      return "from-orange-500 to-orange-400";
    case "Community":
      return "from-pink-500 to-pink-400";
    default:
      return "from-gray-500 to-gray-400";
  }
};

export default function NewsManagementPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  // New post form state
  const [formData, setFormData] = useState<CreateNewsForm>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category: "Announcement",
    status: "draft",
    badge: "",
    comments_enabled: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const checkAdminStatus = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        router.push("/");
        return;
      }

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      router.push("/");
    }
  }, [supabase, router]);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: rawPosts, error } = await supabase
        .from("news_posts")
        .select(
          `
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          category,
          status,
          badge,
          published_at,
          created_at,
          updated_at,
          profiles:author_id (
            id,
            username,
            display_name
          )
        `
        )
        .eq("status", showDrafts ? "draft" : "published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (rawPosts) {
        // Safely transform the posts with proper validation
        const validPosts: NewsPost[] = rawPosts
          .filter((post: any) => {
            // Basic validation
            return (
              post.id &&
              post.title &&
              post.content &&
              post.category &&
              post.status
            );
          })
          .map((post: any): NewsPost => {
            // Handle profiles - it could be an array or single object
            let profiles = undefined;
            if (post.profiles) {
              const profileData = Array.isArray(post.profiles)
                ? post.profiles[0]
                : post.profiles;
              if (profileData) {
                profiles = {
                  id: profileData.id || "",
                  username: profileData.username || "",
                  display_name: profileData.display_name || undefined,
                };
              }
            }

            return {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt || undefined,
              content: post.content,
              featured_image: post.featured_image || undefined,
              category: post.category as NewsPost["category"],
              status: post.status as NewsPost["status"],
              badge: post.badge || undefined,
              published_at: post.published_at || undefined,
              created_at: post.created_at,
              updated_at: post.updated_at,
              author: profiles,
            };
          });

        setPosts(validPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch news posts");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, showDrafts]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin, fetchPosts]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    });
  };

  const handleCreatePost = async () => {
    try {
      setIsCreating(true);
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      toast({
        title: "Success",
        description: "News post created successfully",
      });

      // Reset form and refresh posts
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featured_image: "",
        category: "Announcement",
        status: "draft",
        badge: "",
        comments_enabled: true,
      });
      setIsDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      setIsCreating(true);
      const response = await fetch(`/api/news/${editingPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }

      toast({
        title: "Success",
        description: "News post updated successfully",
      });

      setEditingPost(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featured_image: "",
        category: "Announcement",
        status: "draft",
        badge: "",
        comments_enabled: true,
      });
      setIsDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this news post?")) return;

    try {
      const response = await fetch(`/api/news/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete post");
      }

      toast({
        title: "Success",
        description: "News post deleted successfully",
      });

      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: NewsPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      category: post.category,
      status: post.status,
      badge: post.badge || "",
      comments_enabled: post.comments_enabled ?? true,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      category: "Announcement",
      status: "draft",
      badge: "",
      comments_enabled: true,
    });
    setIsDialogOpen(false);
  };

  if (!isAdmin) {
    return null;
  }

  const handleSetupDatabase = async () => {
    try {
      const response = await fetch('/api/admin/setup-news', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Database setup completed successfully",
        });
        setError(null);
        fetchPosts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Setup failed');
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Setup failed",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {error.includes('does not exist') && (
          <div className="mt-4">
            <Button onClick={handleSetupDatabase}>
              Setup News Database
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            News Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage news posts for your community
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
            <Switch
              id="show-drafts"
              checked={showDrafts}
              onCheckedChange={setShowDrafts}
            />
            <Label htmlFor="show-drafts" className="text-sm font-medium">
              Show Drafts
            </Label>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {editingPost ? (
                    <>
                      <Edit className="w-5 h-5" />
                      Edit News Post
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Create New News Post
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {editingPost
                    ? "Update your news post and publish changes to your community."
                    : "Create engaging content to keep your community informed and updated."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter an engaging title"
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="flex items-center gap-2 text-sm font-medium">
                        <Hash className="w-4 h-4" />
                        URL Slug *
                      </Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        placeholder="url-friendly-slug"
                        className="h-10 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        URL: /news/{formData.slug || 'your-slug-here'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="excerpt" className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Excerpt
                      </Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData({ ...formData, excerpt: e.target.value })
                        }
                        placeholder="Brief summary for previews and SEO"
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.excerpt.length}/160 characters (recommended for SEO)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="featured_image" className="flex items-center gap-2 text-sm font-medium">
                        <ImageIcon className="w-4 h-4" />
                        Featured Image URL
                      </Label>
                      <Input
                        id="featured_image"
                        value={formData.featured_image}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featured_image: e.target.value,
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="h-10"
                      />
                      {formData.featured_image && (
                        <div className="mt-2">
                          <img 
                            src={formData.featured_image} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Tag className="w-4 h-4" />
                          Category *
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value: CreateNewsForm["category"]) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Product Update">
                              🚀 Product Update
                            </SelectItem>
                            <SelectItem value="Feature">
                              ✨ Feature
                            </SelectItem>
                            <SelectItem value="Announcement">
                              📢 Announcement
                            </SelectItem>
                            <SelectItem value="Security">
                              🔒 Security
                            </SelectItem>
                            <SelectItem value="Community">
                              👥 Community
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Globe className="w-4 h-4" />
                          Status *
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: CreateNewsForm["status"]) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">
                              📝 Draft
                            </SelectItem>
                            <SelectItem value="published">
                              🌐 Published
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="badge" className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="w-4 h-4" />
                        Badge (Optional)
                      </Label>
                      <Input
                        id="badge"
                        value={formData.badge}
                        onChange={(e) =>
                          setFormData({ ...formData, badge: e.target.value })
                        }
                        placeholder="Latest, Important, Breaking, etc."
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="comments_enabled" className="flex items-center gap-2 text-sm font-medium">
                          <MessageCircle className="w-4 h-4" />
                          Enable Comments
                        </Label>
                        <Switch
                          id="comments_enabled"
                          checked={formData.comments_enabled}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, comments_enabled: checked })
                          }
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Allow users to comment on this post
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Content */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content" className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Content * 
                        <span className="text-xs text-muted-foreground ml-auto">
                          HTML supported
                        </span>
                      </Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Write your full article content here. You can use HTML tags for formatting."
                        rows={20}
                        className="resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.content.length} characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-6 border-t">
                <div className="flex items-center justify-between w-full">
                  <div className="text-xs text-muted-foreground">
                    * Required fields
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    {!editingPost && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFormData({ ...formData, status: "draft" });
                          handleCreatePost();
                        }}
                        disabled={isCreating || !formData.title || !formData.content}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Save as Draft
                      </Button>
                    )}
                    <Button
                      onClick={editingPost ? handleUpdatePost : handleCreatePost}
                      disabled={isCreating || !formData.title || !formData.content}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {editingPost ? "Updating..." : "Creating..."}
                        </>
                      ) : editingPost ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Update Post
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" />
                          Publish Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 bg-gradient-to-r ${getCategoryColor(
                          post.category
                        )} text-white text-xs font-medium rounded-md`}
                      >
                        {post.category}
                      </span>
                      {post.badge && (
                        <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-medium rounded-md animate-pulse">
                          {post.badge}
                        </span>
                      )}
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-md",
                          post.status === "published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}
                      >
                        {post.status === "published" ? "🌐 Published" : "📝 Draft"}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-base leading-tight group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {post.excerpt || post.content.substring(0, 100) + "..."}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/news/${post.slug}`, '_blank')}
                      className="h-8 w-8 p-0"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      {post.author.display_name || post.author.username}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    /news/{post.slug}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                No {showDrafts ? "draft" : "published"} posts found. Create your
                first news post to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

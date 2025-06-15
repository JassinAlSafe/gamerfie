"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Plus, Trash2, Edit, Eye } from "lucide-react";
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

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category: 'Product Update' | 'Feature' | 'Announcement' | 'Security' | 'Community';
  status: 'draft' | 'published';
  badge?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name?: string;
  };
}

interface CreateNewsForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: 'Product Update' | 'Feature' | 'Announcement' | 'Security' | 'Community';
  status: 'draft' | 'published';
  badge: string;
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
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin, showDrafts]);

  const checkAdminStatus = async () => {
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
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data: posts, error } = await supabase
        .from("news_posts")
        .select(`
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
            username,
            display_name
          )
        `)
        .eq('status', showDrafts ? 'draft' : 'published')
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch news posts");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
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
      });
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update post');
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
      });
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update post",
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
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete post');
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
        description: error instanceof Error ? error.message : "Failed to delete post",
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
    });
  };

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News Management</h1>
          <p className="text-muted-foreground">Create and manage news posts for your users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-drafts"
              checked={showDrafts}
              onCheckedChange={setShowDrafts}
            />
            <Label htmlFor="show-drafts">Show Drafts</Label>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? 'Edit News Post' : 'Create New News Post'}
                </DialogTitle>
                <DialogDescription>
                  {editingPost ? 'Update the news post information.' : 'Create a new news post for your users.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="post-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Brief description of the post"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter full post content"
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) =>
                      setFormData({ ...formData, featured_image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: CreateNewsForm["category"]) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Product Update">Product Update</SelectItem>
                        <SelectItem value="Feature">Feature</SelectItem>
                        <SelectItem value="Announcement">Announcement</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: CreateNewsForm["status"]) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge (Optional)</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    placeholder="Latest, Important, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
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
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingPost ? handleUpdatePost : handleCreatePost}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingPost ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingPost ? 'Update Post' : 'Create Post'
                  )}
                </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="border-0">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(
                          post.category
                        )} text-white text-xs font-medium rounded-full`}
                      >
                        {post.category}
                      </span>
                      {post.badge && (
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-medium rounded-full">
                          {post.badge}
                        </span>
                      )}
                      <span
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full",
                          post.status === "published"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        )}
                      >
                        {post.status}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt || post.content.substring(0, 100) + "..."}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Created: {new Date(post.created_at).toLocaleDateString()}</div>
                  {post.published_at && (
                    <div>Published: {new Date(post.published_at).toLocaleDateString()}</div>
                  )}
                  {post.profiles && (
                    <div>
                      Author: {post.profiles.display_name || post.profiles.username}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                No {showDrafts ? 'draft' : 'published'} posts found. Create your first news post to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
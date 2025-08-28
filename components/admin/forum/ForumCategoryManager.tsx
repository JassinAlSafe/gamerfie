"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit3, 
  Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

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

interface ForumCategoryManagerProps {
  categories: ForumCategory[];
  onCategoriesChange: () => void;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange  
  "#eab308", // yellow
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
  "#dc2626", // red-600
  "#059669", // emerald-600
  "#7c3aed", // violet-600
];

const PRESET_ICONS = [
  "💬", "🎮", "🏆", "⭐", "👥", "🔧", "🎯", "☕", 
  "🐛", "💡", "📢", "🎨", "🚀", "⚡", "🌟", "🔥",
  "🎲", "🎪", "🎭", "🎨", "📚", "🔬", "🎵", "🎬"
];

export function ForumCategoryManager({ categories, onCategoriesChange }: ForumCategoryManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "💬",
    color: "#3b82f6"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "💬",
      color: "#3b82f6"
    });
  };

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/forum/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category created successfully"
        });
        resetForm();
        setIsCreateDialogOpen(false);
        onCategoriesChange();
      } else {
        throw new Error("Failed to create category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/forum/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
        setEditingCategory(null);
        resetForm();
        onCategoriesChange();
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/forum/categories/${categoryId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });
        onCategoriesChange();
      } else {
        throw new Error("Failed to delete category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const startEdit = (category: ForumCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-muted-foreground">
            Organize forum discussions into categories
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize forum discussions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., General Discussion"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this category is for..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {PRESET_ICONS.map((icon) => (
                      <Button
                        key={icon}
                        variant={formData.icon === icon ? "default" : "outline"}
                        size="sm"
                        className="text-lg"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <Button
                        key={color}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-2"
                        style={{ 
                          backgroundColor: color,
                          borderColor: formData.color === color ? "#000" : color
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <Label>Preview</Label>
                <div className="mt-2 p-3 border rounded-lg flex items-center gap-3">
                  <div 
                    className="flex-shrink-0 p-2 rounded-xl"
                    style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{formData.name || "Category Name"}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.description || "Category description"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex-shrink-0 p-2 rounded-xl text-lg"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => startEdit(category)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{category.threads_count} threads</span>
                <span>{category.posts_count} posts</span>
              </div>
              {category.last_post_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last activity: {new Date(category.last_post_at).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {PRESET_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      variant={formData.icon === icon ? "default" : "outline"}
                      size="sm"
                      className="text-lg"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {PRESET_COLORS.map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-2"
                      style={{ 
                        backgroundColor: color,
                        borderColor: formData.color === color ? "#000" : color
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
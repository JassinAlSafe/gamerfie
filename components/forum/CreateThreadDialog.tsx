"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MessageSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ForumCategory } from "@/types/forum";
import { cn } from "@/lib/utils";

interface CreateThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ForumCategory[];
  selectedCategoryId?: string;
  onSubmit: (data: { title: string; content: string; categoryId: string }) => Promise<void>;
  isLoading?: boolean;
}

export function CreateThreadDialog({
  isOpen,
  onClose,
  categories,
  selectedCategoryId,
  onSubmit
}: CreateThreadDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(selectedCategoryId || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      yellow: "from-yellow-500 to-yellow-600",
      red: "from-red-500 to-red-600",
      purple: "from-purple-500 to-purple-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
    };
    return colors[color as keyof typeof colors] || "from-slate-500 to-slate-600";
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError("Please enter a thread title");
      return;
    }
    if (!content.trim()) {
      setError("Please enter thread content");
      return;
    }
    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        categoryId
      });
      
      // Reset form
      setTitle("");
      setContent("");
      setCategoryId(selectedCategoryId || "");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create thread");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setCategoryId(selectedCategoryId || "");
      setError("");
      onClose();
    }
  };

  const selectedCategory = categories.find(cat => cat.id === categoryId);
  const isValid = title.trim() && content.trim() && categoryId;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200/80 dark:border-slate-700/80 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Create New Thread
              </DialogTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Start a new discussion with the community
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600">
                <SelectValue placeholder="Select a category for your thread" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm shadow-sm",
                        getCategoryColor(category.color || 'blue')
                      )}>
                        <span className="text-white">{category.icon}</span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thread Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Thread Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your thread..."
              className="bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600 text-base py-3"
              maxLength={200}
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Make it clear and engaging</span>
              <span>{title.length}/200</span>
            </div>
          </div>
          
          {/* Thread Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              rows={8}
              className="bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600 resize-none"
              maxLength={5000}
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Be descriptive and helpful to get better responses</span>
              <span>{content.length}/5000</span>
            </div>
          </div>

          {/* Selected Category Preview */}
          {selectedCategory && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm",
                  getCategoryColor(selectedCategory.color || 'blue')
                )}>
                  <span className="text-white text-lg">{selectedCategory.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Posting in {selectedCategory.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedCategory.threads_count} threads · {selectedCategory.posts_count} posts
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Thread
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
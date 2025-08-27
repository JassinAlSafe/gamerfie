"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Lock, 
  Unlock, 
  Pin, 
  PinOff, 
  Trash2, 
  Eye,
  Edit3,
  AlertTriangle,
  Search,
  Filter,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ForumThreadModerationProps {
  threads: ForumThread[];
  onThreadsChange: () => void;
}

export function ForumThreadModeration({ threads, onThreadsChange }: ForumThreadModerationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.author_username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "pinned" && thread.is_pinned) ||
                         (filterStatus === "locked" && thread.is_locked) ||
                         (filterStatus === "normal" && !thread.is_pinned && !thread.is_locked);

    return matchesSearch && matchesFilter;
  });

  const handleThreadAction = async (threadId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/forum/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Thread ${action}ed successfully`
        });
        onThreadsChange();
      } else {
        throw new Error(`Failed to ${action} thread`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} thread`,
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedThreads.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select threads to perform bulk actions",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/forum/threads/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          threadIds: selectedThreads,
          action 
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Bulk action completed successfully`
        });
        setSelectedThreads([]);
        onThreadsChange();
      } else {
        throw new Error("Failed to perform bulk action");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  };

  const handleDeleteThread = async (threadId: string, threadTitle: string) => {
    if (!confirm(`Are you sure you want to delete the thread "${threadTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/forum/threads/${threadId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Thread deleted successfully"
        });
        onThreadsChange();
      } else {
        throw new Error("Failed to delete thread");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete thread",
        variant: "destructive"
      });
    }
  };

  const toggleThreadSelection = (threadId: string) => {
    setSelectedThreads(prev => 
      prev.includes(threadId) 
        ? prev.filter(id => id !== threadId)
        : [...prev, threadId]
    );
  };

  const selectAllThreads = () => {
    if (selectedThreads.length === filteredThreads.length) {
      setSelectedThreads([]);
    } else {
      setSelectedThreads(filteredThreads.map(thread => thread.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Thread Moderation</h2>
        <p className="text-muted-foreground">
          Moderate forum threads, manage pins, locks, and handle content
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threads by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threads</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="pinned">Pinned</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedThreads.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedThreads.length} threads selected
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction("pin")}
                  >
                    <Pin className="h-4 w-4 mr-1" />
                    Pin
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction("lock")}
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    Lock
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleBulkAction("delete")}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threads List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Threads ({filteredThreads.length})
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={selectAllThreads}
            >
              {selectedThreads.length === filteredThreads.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredThreads.map((thread) => (
              <div key={thread.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedThreads.includes(thread.id)}
                    onChange={() => toggleThreadSelection(thread.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
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
                          
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: thread.category_color, 
                              color: thread.category_color 
                            }}
                            className="text-xs"
                          >
                            {thread.category_name}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>by {thread.author_username}</span>
                          <span>{thread.replies_count} replies</span>
                          <span>{thread.views_count} views</span>
                          <span>{thread.likes_count} likes</span>
                          <span>
                            Created {new Date(thread.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-4">
                        <Button size="sm" variant="outline" title="View Thread">
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleThreadAction(thread.id, thread.is_pinned ? "unpin" : "pin")}
                          title={thread.is_pinned ? "Unpin Thread" : "Pin Thread"}
                        >
                          {thread.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleThreadAction(thread.id, thread.is_locked ? "unlock" : "lock")}
                          title={thread.is_locked ? "Unlock Thread" : "Lock Thread"}
                        >
                          {thread.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteThread(thread.id, thread.title)}
                          title="Delete Thread"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {thread.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {thread.content.substring(0, 200)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredThreads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No threads found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
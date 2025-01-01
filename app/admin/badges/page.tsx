"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Badge as BadgeType } from "@/types/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BadgeManagementPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // New badge form state
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    icon_url: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchBadges();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Get user's profile with role
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

  const fetchBadges = async () => {
    try {
      setIsLoading(true);
      const { data: badges, error } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBadges(badges || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
      setError("Failed to fetch badges");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBadge = async () => {
    try {
      setIsCreating(true);

      const response = await fetch("/api/badges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBadge),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create badge");
      }

      const badge = await response.json();
      setBadges([badge, ...badges]);
      setNewBadge({ name: "", description: "", icon_url: "" });
      setIsDialogOpen(false);

      toast({
        title: "Success",
        description: "Badge created successfully",
      });
    } catch (error) {
      console.error("Error creating badge:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create badge",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      const response = await fetch(`/api/badges/${badgeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete badge");
      }

      setBadges(badges.filter((badge) => badge.id !== badgeId));
      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete badge",
        variant: "destructive",
      });
    }
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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Badge Management</h1>
          <p className="text-muted-foreground">
            Create and manage badges for challenges
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
              <DialogDescription>
                Create a new badge that can be awarded to users for completing
                challenges.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newBadge.name}
                  onChange={(e) =>
                    setNewBadge({ ...newBadge, name: e.target.value })
                  }
                  placeholder="e.g., Challenge Master"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBadge.description}
                  onChange={(e) =>
                    setNewBadge({ ...newBadge, description: e.target.value })
                  }
                  placeholder="Describe what this badge represents..."
                />
              </div>
              <div>
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={newBadge.icon_url}
                  onChange={(e) =>
                    setNewBadge({ ...newBadge, icon_url: e.target.value })
                  }
                  placeholder="https://example.com/badges/icon.png"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateBadge} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Badge"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <Card key={badge.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBadge(badge.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {badge.icon_url && (
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <img
                      src={badge.icon_url}
                      alt={badge.name}
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(badge.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

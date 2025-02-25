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
import { Textarea } from "@/components/ui/text/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CreateBadgeForm {
  name: string;
  description: string;
  icon_url: string;
  type: "challenge" | "achievement" | "special" | "community";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export default function BadgeManagementPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // New badge form state
  const [formData, setFormData] = useState<CreateBadgeForm>({
    name: "",
    description: "",
    icon_url: "",
    type: "challenge",
    rarity: "common",
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
      const { error } = await supabase.from("badges").insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Badge created successfully",
      });

      // Reset form and refresh badges
      setFormData({
        name: "",
        description: "",
        icon_url: "",
        type: "challenge",
        rarity: "common",
      });
      fetchBadges();
    } catch (error) {
      console.error("Error creating badge:", error);
      toast({
        title: "Error",
        description: "Failed to create badge",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      console.log("Attempting to delete badge:", badgeId);

      const { error } = await supabase
        .from("badges")
        .delete()
        .eq("id", badgeId);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      console.log("Badge deleted successfully from Supabase");

      // Fetch the updated list of badges instead of just updating state
      await fetchBadges();

      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast({
        title: "Error",
        description: "Failed to delete badge",
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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Badge Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
              <DialogDescription>
                Create a new badge that can be awarded to users.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url}
                  onChange={(e) =>
                    setFormData({ ...formData, icon_url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: CreateBadgeForm["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select badge type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rarity</Label>
                <Select
                  value={formData.rarity}
                  onValueChange={(value: CreateBadgeForm["rarity"]) =>
                    setFormData({ ...formData, rarity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select badge rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
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
            <Card
              key={badge.id}
              className={cn(
                "border-0",
                badge.rarity === "legendary" && "bg-yellow-500/10",
                badge.rarity === "epic" && "bg-purple-500/10",
                badge.rarity === "rare" && "bg-blue-500/10",
                badge.rarity === "common" && "bg-gray-500/10"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {badge.name}
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          badge.rarity === "legendary" &&
                            "bg-yellow-500/20 text-yellow-500",
                          badge.rarity === "epic" &&
                            "bg-purple-500/20 text-purple-500",
                          badge.rarity === "rare" &&
                            "bg-blue-500/20 text-blue-500",
                          badge.rarity === "common" &&
                            "bg-gray-500/20 text-gray-500"
                        )}
                      >
                        {badge.rarity}
                      </span>
                    </CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full inline-block mt-2",
                        badge.type === "challenge" &&
                          "bg-green-500/20 text-green-500",
                        badge.type === "achievement" &&
                          "bg-blue-500/20 text-blue-500",
                        badge.type === "special" &&
                          "bg-purple-500/20 text-purple-500",
                        badge.type === "community" &&
                          "bg-orange-500/20 text-orange-500"
                      )}
                    >
                      {badge.type}
                    </span>
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
                  <div
                    className={cn(
                      "relative w-24 h-24 mx-auto rounded-lg overflow-hidden",
                      badge.rarity === "legendary" && "bg-yellow-500/20",
                      badge.rarity === "epic" && "bg-purple-500/20",
                      badge.rarity === "rare" && "bg-blue-500/20",
                      badge.rarity === "common" && "bg-gray-500/20"
                    )}
                  >
                    <Image
                      src={badge.icon_url}
                      alt={badge.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Replace broken image with fallback
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = "none";
                        const parent = imgElement.parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "w-full h-full flex items-center justify-center";
                          fallback.innerHTML = `<svg class="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-4 text-center">
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

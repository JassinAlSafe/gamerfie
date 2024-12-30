"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { ProgressMilestone, RewardType } from "@/types/challenge";

const milestoneSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  required_progress: z.number().min(0).max(100),
  reward_type: z.enum(["badge", "points", "title"]),
  reward_amount: z.number().optional(),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

const defaultValues: MilestoneFormValues = {
  title: "",
  description: "",
  required_progress: 0,
  reward_type: "badge",
  reward_amount: 0,
};

interface MilestoneManagementProps {
  challengeId: string;
  isCreator: boolean;
}

export function MilestoneManagement({
  challengeId,
  isCreator,
}: MilestoneManagementProps) {
  const [milestones, setMilestones] = useState<ProgressMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] =
    useState<ProgressMilestone | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [challengeId]);

  useEffect(() => {
    if (editingMilestone) {
      form.reset({
        title: editingMilestone.title,
        description: editingMilestone.description || "",
        required_progress: editingMilestone.required_progress,
        reward_type: editingMilestone.reward_type || "badge",
        reward_amount: editingMilestone.reward_amount || 0,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editingMilestone, form]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("progress_milestones")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("required_progress", { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      toast.error("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: MilestoneFormValues) => {
    if (!userId) {
      toast.error("You must be logged in to manage milestones");
      return;
    }

    if (!isCreator) {
      toast.error("Only the challenge creator can manage milestones");
      return;
    }

    try {
      if (editingMilestone) {
        const { error } = await supabase
          .from("progress_milestones")
          .update({
            title: values.title,
            description: values.description,
            required_progress: values.required_progress,
            reward_type: values.reward_type,
            reward_amount: values.reward_amount,
            updated_at: new Date().toISOString(),
            updated_by: userId,
          })
          .eq("id", editingMilestone.id)
          .eq("challenge_id", challengeId)
          .eq("created_by", userId);

        if (error) throw error;
        toast.success("Milestone updated successfully");
      } else {
        const { error } = await supabase.from("progress_milestones").insert({
          challenge_id: challengeId,
          title: values.title,
          description: values.description,
          required_progress: values.required_progress,
          reward_type: values.reward_type,
          reward_amount: values.reward_amount,
          created_by: userId,
          updated_by: userId,
        });

        if (error) throw error;
        toast.success("Milestone created successfully");
      }

      setIsDialogOpen(false);
      setEditingMilestone(null);
      fetchMilestones();
    } catch (error) {
      console.error("Error saving milestone:", error);
      toast.error("Failed to save milestone");
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!userId) {
      toast.error("You must be logged in to delete milestones");
      return;
    }

    try {
      const { error } = await supabase
        .from("progress_milestones")
        .delete()
        .eq("id", milestoneId)
        .eq("challenge_id", challengeId)
        .eq("created_by", userId);

      if (error) throw error;
      toast.success("Milestone deleted successfully");
      fetchMilestones();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Failed to delete milestone");
    }
  };

  const getRewardIcon = (type?: RewardType) => {
    switch (type) {
      case "badge":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "points":
        return <Medal className="h-5 w-5 text-blue-500" />;
      case "title":
        return <Star className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Challenge Milestones</CardTitle>
            <CardDescription>
              Track progress and reward achievements
            </CardDescription>
          </div>
          {isCreator && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingMilestone(null)}>
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMilestone ? "Edit Milestone" : "Create Milestone"}
                  </DialogTitle>
                  <DialogDescription>
                    Set milestone requirements and rewards
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter milestone title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the milestone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="required_progress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Progress (%)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              max={100}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reward_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a reward type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="badge">Badge</SelectItem>
                              <SelectItem value="points">Points</SelectItem>
                              <SelectItem value="title">Title</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reward_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Amount</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Specify points or badge level
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">
                        {editingMilestone ? "Update" : "Create"} Milestone
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No milestones created yet
            </p>
          ) : (
            milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRewardIcon(milestone.reward_type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-sm text-gray-500">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {milestone.required_progress}% Required
                  </Badge>
                  {milestone.reward_type && (
                    <Badge>
                      {milestone.reward_type}
                      {milestone.reward_amount &&
                        ` (${milestone.reward_amount})`}
                    </Badge>
                  )}
                  {isCreator && userId === milestone.created_by && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMilestone(milestone);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

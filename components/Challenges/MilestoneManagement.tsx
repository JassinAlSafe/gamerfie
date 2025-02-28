"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/text/textarea";
import { Trophy, Medal, Star } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type {
  ProgressMilestone,
  RewardType,
  ChallengeGoal,
} from "@/types/challenge";
import { useChallengesStore } from "@/stores/challenges";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

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
  goals: ChallengeGoal[];
}

export function MilestoneManagement({
  challengeId,
  isCreator,
  goals,
}: MilestoneManagementProps) {
  const [milestones, setMilestones] = useState<ProgressMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] =
    useState<ProgressMilestone | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const { updateGoalProgress } = useChallengesStore();

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
  }, [supabase.auth]);

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

  const fetchMilestones = useCallback(async () => {
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
  }, [challengeId, supabase]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

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

  const handleProgressChange = async (goalId: string, value: number) => {
    try {
      await updateGoalProgress(challengeId, goalId, value);
      setProgress((prev) => ({ ...prev, [goalId]: value }));
      toast.success("Progress updated successfully");
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error("Failed to update progress");
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
        <div className="space-y-6">
          {/* Display milestones */}
          {milestones.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Milestone Rewards</h3>
              <div className="grid gap-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      {getRewardIcon(milestone.reward_type)}
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-gray-400">
                          {milestone.required_progress}% completion required
                        </p>
                      </div>
                    </div>
                    {isCreator && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingMilestone(milestone);
                            setIsDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(milestone.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Goal Progress</h3>
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <Label className="text-gray-300">{goal.description}</Label>
                <div className="space-y-2">
                  <Slider
                    value={[progress[goal.id] || 0]}
                    onValueChange={(value) =>
                      handleProgressChange(goal.id, value[0])
                    }
                    max={goal.target}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0</span>
                    <span>
                      {progress[goal.id] || 0}/{goal.target}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

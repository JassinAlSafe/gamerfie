"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Target,
  Calendar,
  Users,
  Gamepad2,
  Flag,
  Plus,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

const createChallengeSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
    type: z.enum(["competitive", "collaborative"]),
    start_date: z.date().min(new Date(), "Start date must be in the future"),
    end_date: z.date(),
    goal: z.object({
      type: z.enum(["complete_games", "win_games", "achieve_score"]),
      target: z.number().min(1, "Target must be at least 1"),
    }),
    max_participants: z
      .number()
      .min(2, "Must allow at least 2 participants")
      .optional(),
    rewards: z.array(z.string()).min(1, "Add at least one reward"),
    rules: z.array(z.string()).min(1, "Add at least one rule"),
  })
  .refine(
    (data) => {
      return data.end_date > data.start_date;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

type CreateChallengeForm = z.infer<typeof createChallengeSchema>;

interface CreateChallengeProps {
  onSubmit: (data: CreateChallengeForm) => Promise<void>;
}

export function CreateChallenge({ onSubmit }: CreateChallengeProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewards, setRewards] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [newReward, setNewReward] = useState("");
  const [newRule, setNewRule] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateChallengeForm>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      type: "competitive",
      goal: {
        type: "complete_games",
        target: 10,
      },
      max_participants: 10,
      rewards: [],
      rules: [],
    },
  });

  const handleAddReward = () => {
    if (newReward.trim()) {
      const updatedRewards = [...rewards, newReward.trim()];
      setRewards(updatedRewards);
      setValue("rewards", updatedRewards);
      setNewReward("");
    }
  };

  const handleRemoveReward = (index: number) => {
    const updatedRewards = rewards.filter((_, i) => i !== index);
    setRewards(updatedRewards);
    setValue("rewards", updatedRewards);
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      const updatedRules = [...rules, newRule.trim()];
      setRules(updatedRules);
      setValue("rules", updatedRules);
      setNewRule("");
    }
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    setValue("rules", updatedRules);
  };

  const onFormSubmit = async (data: CreateChallengeForm) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        rewards: rewards,
        rules: rules,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/challenges"
          className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Challenges</span>
        </Link>
      </div>

      <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                Create Challenge
              </h1>
            </div>
            <p className="text-gray-400">
              Create a new challenge to engage with the community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Challenge Title
                </label>
                <Input
                  placeholder="Enter a catchy title..."
                  className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Description
                </label>
                <Textarea
                  placeholder="Describe your challenge..."
                  className="bg-gray-800/30 border-gray-700/30 min-h-[120px] resize-none focus:border-purple-500/50"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Type
                  </label>
                  <Select
                    value={watch("type")}
                    onValueChange={(value) => setValue("type", value as any)}
                  >
                    <SelectTrigger className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competitive">Competitive</SelectItem>
                      <SelectItem value="collaborative">
                        Collaborative
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-400">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    {...register("max_participants", { valueAsNumber: true })}
                  />
                  {errors.max_participants && (
                    <p className="text-sm text-red-400">
                      {errors.max_participants.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Start Date
                  </label>
                  <DatePicker
                    value={watch("start_date")}
                    onChange={(date) => setValue("start_date", date)}
                    placeholder="Select date"
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-400">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    End Date
                  </label>
                  <DatePicker
                    value={watch("end_date")}
                    onChange={(date) => setValue("end_date", date)}
                    placeholder="Select date"
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-400">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Goal Type
                  </label>
                  <Select
                    value={watch("goal.type")}
                    onValueChange={(value) =>
                      setValue("goal.type", value as any)
                    }
                  >
                    <SelectTrigger className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete_games">
                        Complete Games
                      </SelectItem>
                      <SelectItem value="win_games">Win Games</SelectItem>
                      <SelectItem value="achieve_score">
                        Achieve Score
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.goal?.type && (
                    <p className="text-sm text-red-400">
                      {errors.goal.type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Target
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    {...register("goal.target", { valueAsNumber: true })}
                  />
                  {errors.goal?.target && (
                    <p className="text-sm text-red-400">
                      {errors.goal.target.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Rewards & Rules */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold">Rewards</h2>
                  </div>
                  {errors.rewards && (
                    <p className="text-sm text-red-400">
                      {errors.rewards.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a reward..."
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddReward();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddReward}
                    className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 h-9 w-9 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-gray-800/30 border border-gray-700/30 group hover:border-purple-500/30"
                    >
                      <span className="text-sm">{reward}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveReward(index)}
                        className="opacity-0 group-hover:opacity-100 hover:bg-gray-700/30 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold">Rules</h2>
                  </div>
                  {errors.rules && (
                    <p className="text-sm text-red-400">
                      {errors.rules.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a rule..."
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRule();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddRule}
                    className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 h-9 w-9 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-gray-800/30 border border-gray-700/30 group hover:border-purple-500/30"
                    >
                      <span className="text-sm">{rule}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRule(index)}
                        className="opacity-0 group-hover:opacity-100 hover:bg-gray-700/30 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Create Challenge
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

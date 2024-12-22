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

const createChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  type: z.enum(["competitive", "collaborative"]),
  start_date: z.date(),
  end_date: z.date(),
  goal: z.object({
    type: z.enum(["complete_games", "win_games", "achieve_score"]),
    target: z.number().min(1),
  }),
  max_participants: z.number().min(2).optional(),
  rewards: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
});

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
      setRewards([...rewards, newReward.trim()]);
      setValue("rewards", [...rewards, newReward.trim()]);
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
      setRules([...rules, newRule.trim()]);
      setValue("rules", [...rules, newRule.trim()]);
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
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Challenge created successfully!",
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

      <Card className="p-6 bg-gray-800/50 border-gray-700/50">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Challenge Title"
                  className="bg-gray-800/30 border-gray-700/30 h-9"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Textarea
                  placeholder="Challenge Description"
                  className="bg-gray-800/30 border-gray-700/30 min-h-[100px] resize-none"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    value={watch("type")}
                    onValueChange={(value) => setValue("type", value as any)}
                  >
                    <SelectTrigger className="bg-gray-800/30 border-gray-700/30 h-9">
                      <SelectValue placeholder="Challenge Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competitive">Competitive</SelectItem>
                      <SelectItem value="collaborative">
                        Collaborative
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    type="number"
                    placeholder="Max Participants"
                    className="bg-gray-800/30 border-gray-700/30 h-9"
                    {...register("max_participants", { valueAsNumber: true })}
                  />
                  {errors.max_participants && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.max_participants.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <DatePicker
                    value={watch("start_date")}
                    onChange={(date) => setValue("start_date", date)}
                    placeholder="Start Date"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <DatePicker
                    value={watch("end_date")}
                    onChange={(date) => setValue("end_date", date)}
                    placeholder="End Date"
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    value={watch("goal.type")}
                    onValueChange={(value) =>
                      setValue("goal.type", value as any)
                    }
                  >
                    <SelectTrigger className="bg-gray-800/30 border-gray-700/30 h-9">
                      <SelectValue placeholder="Goal Type" />
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
                    <p className="mt-1 text-sm text-red-400">
                      {errors.goal.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    type="number"
                    placeholder="Goal Target"
                    className="bg-gray-800/30 border-gray-700/30 h-9"
                    {...register("goal.target", { valueAsNumber: true })}
                  />
                  {errors.goal?.target && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.goal.target.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Rewards & Rules */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold">Rewards</h2>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a reward"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    className="bg-gray-800/30 border-gray-700/30 h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddReward}
                    className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 h-9 w-9"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-gray-800/30 border border-gray-700/30"
                    >
                      <span>{reward}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveReward(index)}
                        className="hover:bg-gray-700/30 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold">Rules</h2>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a rule"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    className="bg-gray-800/30 border-gray-700/30 h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddRule}
                    className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 h-9 w-9"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-gray-800/30 border border-gray-700/30"
                    >
                      <span>{rule}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRule(index)}
                        className="hover:bg-gray-700/30 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
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

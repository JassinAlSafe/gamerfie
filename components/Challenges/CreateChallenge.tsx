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
  Gamepad2,
  Flag,
  Plus,
  X,
  Loader2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { useRouter } from "next/router";

const goalTypes = [
  "complete_games",
  "achieve_trophies",
  "play_time",
  "review_games",
  "score_points",
  "reach_level",
] as const;

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
    start_date: z
      .date()
      .min(
        new Date(new Date().setHours(0, 0, 0, 0)),
        "Start date cannot be in the past"
      ),
    end_date: z.date(),
    goals: z
      .array(
        z.object({
          type: z.enum(goalTypes),
          target: z.number().min(1, "Target must be at least 1"),
          description: z.string().optional(),
        })
      )
      .min(1, "At least one goal is required")
      .max(5, "Maximum 5 goals allowed"),
    min_participants: z.number().min(2, "Must allow at least 2 participants"),
    max_participants: z
      .number()
      .min(2, "Must allow at least 2 participants")
      .optional(),
    requirements: z.object({
      genre: z.string().optional(),
      platform: z.string().optional(),
      minRating: z.number().optional(),
      releaseYear: z.number().optional(),
    }),
    rewards: z
      .array(
        z.object({
          type: z.enum(["badge", "points", "title"]),
          name: z.string().min(1, "Reward name is required"),
          description: z.string().min(1, "Reward description is required"),
        })
      )
      .min(1, "Add at least one reward"),
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
  )
  .refine(
    (data) => {
      if (data.type === "competitive" && !data.max_participants) {
        return false;
      }
      return true;
    },
    {
      message:
        "Competitive challenges must have a maximum number of participants",
      path: ["max_participants"],
    }
  );

type CreateChallengeForm = z.infer<typeof createChallengeSchema>;

interface Goal {
  type: (typeof goalTypes)[number];
  target: number;
  description?: string;
}

interface Reward {
  type: "badge" | "points" | "title";
  name: string;
  description: string;
}

interface CreateChallengeProps {
  onSubmit?: (data: CreateChallengeForm) => Promise<void>;
}

export function CreateChallenge({ onSubmit }: CreateChallengeProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState<Goal>({
    type: "complete_games",
    target: 1,
  });
  const [newReward, setNewReward] = useState<Reward>({
    type: "badge",
    name: "",
    description: "",
  });
  const [newRule, setNewRule] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

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
      min_participants: 2,
      requirements: {
        genre: "",
        platform: "",
        minRating: undefined,
        releaseYear: undefined,
      },
      goals: [],
      rewards: [],
      rules: [],
    },
  });

  const handleAddGoal = () => {
    if (newGoal.target > 0) {
      const updatedGoals = [...goals, { ...newGoal }];
      setGoals(updatedGoals);
      setValue("goals", updatedGoals);
      setNewGoal({
        type: "complete_games",
        target: 1,
      });
    }
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    setValue("goals", updatedGoals);
  };

  const handleAddReward = () => {
    if (newReward.name.trim() && newReward.description.trim()) {
      const updatedRewards = [...rewards, { ...newReward }];
      setRewards(updatedRewards);
      setValue("rewards", updatedRewards);
      setNewReward({
        type: "badge",
        name: "",
        description: "",
      });
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

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = createClientComponentClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `challenge-covers/${fileName}`;

    console.log("Uploading image:", { fileName, filePath });

    const { error: uploadError, data } = await supabase.storage
      .from("challenges")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("challenges").getPublicUrl(filePath);

    console.log("Generated public URL:", publicUrl);
    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: CreateChallengeForm) => {
    try {
      setIsSubmitting(true);

      // Upload image first if exists
      let coverUrl = null;
      if (imageFile) {
        coverUrl = await uploadImage(imageFile);
      }

      const supabase = createClientComponentClient();

      // Get the current user's profile
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error("No session found");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error("No profile found");

      // Prepare the challenge data
      const challengeData = {
        ...data,
        creator_id: profile.id,
        status: "upcoming" as const,
        requirements: data.requirements || {},
        cover_url: coverUrl,
        goals,
        rewards,
        rules,
      };

      console.log("Submitting challenge data:", challengeData);

      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create challenge");
      }

      toast({
        title: "Success",
        description: "Challenge created successfully!",
      });

      // Redirect to the profile challenges page
      router.push("/profile/challenges");
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create challenge. Please try again.",
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
          href="/profile/challenges"
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

              {/* Goals Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold">Goals</h2>
                  </div>
                  {errors.goals && (
                    <p className="text-sm text-red-400">
                      {errors.goals.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={newGoal.type}
                      onValueChange={(value) =>
                        setNewGoal({
                          ...newGoal,
                          type: value as (typeof goalTypes)[number],
                        })
                      }
                    >
                      <SelectTrigger className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50">
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Target value"
                      value={newGoal.target}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          target: parseInt(e.target.value) || 1,
                        })
                      }
                      className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Goal description (optional)"
                      value={newGoal.description || ""}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          description: e.target.value,
                        })
                      }
                      className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    />
                    <Button
                      type="button"
                      onClick={handleAddGoal}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {goals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800/30 rounded-md p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {goal.type.replace("_", " ")}
                        </Badge>
                        <span className="font-medium">{goal.target}</span>
                        {goal.description && (
                          <span className="text-sm text-gray-400">
                            - {goal.description}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGoal(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
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

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Select
                        value={newReward.type}
                        onValueChange={(value) =>
                          setNewReward({
                            ...newReward,
                            type: value as "badge" | "points" | "title",
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50">
                          <SelectValue placeholder="Select reward type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="badge">Badge</SelectItem>
                          <SelectItem value="points">Points</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="Reward name"
                      value={newReward.name}
                      onChange={(e) =>
                        setNewReward({ ...newReward, name: e.target.value })
                      }
                      className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Reward description"
                      value={newReward.description}
                      onChange={(e) =>
                        setNewReward({
                          ...newReward,
                          description: e.target.value,
                        })
                      }
                      className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                    />
                    <Button
                      type="button"
                      onClick={handleAddReward}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800/30 rounded-md p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {reward.type}
                        </Badge>
                        <span className="font-medium">{reward.name}</span>
                        <span className="text-sm text-gray-400">
                          - {reward.description}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReward(index)}
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

          {/* Add Requirements Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold">Requirements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Genre
                </label>
                <Input
                  placeholder="e.g., RPG"
                  className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                  {...register("requirements.genre")}
                />
                {errors.requirements?.genre && (
                  <p className="text-sm text-red-400">
                    {errors.requirements.genre.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Platform
                </label>
                <Input
                  placeholder="e.g., PC"
                  className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                  {...register("requirements.platform")}
                />
                {errors.requirements?.platform && (
                  <p className="text-sm text-red-400">
                    {errors.requirements.platform.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Minimum Rating
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 80"
                  className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                  {...register("requirements.minRating", {
                    valueAsNumber: true,
                  })}
                />
                {errors.requirements?.minRating && (
                  <p className="text-sm text-red-400">
                    {errors.requirements.minRating.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Release Year
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 2024"
                  className="bg-gray-800/30 border-gray-700/30 h-9 focus:border-purple-500/50"
                  {...register("requirements.releaseYear", {
                    valueAsNumber: true,
                  })}
                />
                {errors.requirements?.releaseYear && (
                  <p className="text-sm text-red-400">
                    {errors.requirements.releaseYear.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Challenge Cover Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Challenge cover preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700/50 rounded-lg hover:border-purple-500/50 transition-colors cursor-pointer bg-gray-800/30">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-400 mt-2">
                    Upload cover image
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Recommended size: 1200x630px
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
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

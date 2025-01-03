"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChallengeStore } from "@/stores/useChallengeStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Gamepad2,
  Trophy,
  Plus,
  Trash2,
} from "lucide-react";
import type { CreateChallengeRequest } from "@/types/challenge";
import { useBadgesStore } from "@/stores/useBadgesStore";
import Image from "next/image";
import { BadgeImage } from "@/components/ui/placeholder-image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    type: z.enum(["competitive", "collaborative"]),
    start_date: z.date({
      required_error: "Start date is required",
    }),
    end_date: z.date({
      required_error: "End date is required",
    }),
    min_participants: z
      .number()
      .min(1, "Minimum participants must be at least 1"),
    max_participants: z.number().nullable(),
    coverImage: z.any().optional(),
    goals: z
      .array(
        z.object({
          type: z.string({
            required_error: "Goal type is required",
          }),
          target: z
            .number({
              required_error: "Target number is required",
            })
            .min(1, "Target must be at least 1"),
          description: z.string().optional(),
        })
      )
      .min(1, "At least one goal is required"),
    rewards: z
      .array(
        z.object({
          type: z.enum(["badge", "points", "title"], {
            required_error: "Reward type is required",
          }),
          badge_id: z.string().optional(),
          name: z
            .string({
              required_error: "Reward name is required",
            })
            .min(1, "Reward name cannot be empty"),
          description: z
            .string({
              required_error: "Reward description is required",
            })
            .min(1, "Reward description cannot be empty"),
        })
      )
      .min(1, "At least one reward is required"),
    rules: z
      .array(
        z
          .string({
            required_error: "Rule is required",
          })
          .min(1, "Rule cannot be empty")
      )
      .min(1, "At least one rule is required"),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  })
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

type FormData = z.infer<typeof formSchema>;

export function CreateChallenge() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { createChallenge } = useChallengeStore();
  const [imageUploading, setImageUploading] = useState(false);
  const { badges, fetchBadges } = useBadgesStore();

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "competitive",
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      min_participants: 1,
      max_participants: null,
      coverImage: undefined,
      goals: [
        {
          type: "complete_games",
          target: 1,
          description: "Complete games to achieve the goal",
        },
      ],
      rewards: [
        {
          type: "badge",
          name: "Challenge Completion Badge",
          description: "Awarded for completing the challenge",
          badge_id: undefined,
        },
      ],
      rules: ["Participate fairly and follow game guidelines"],
    },
  });

  useEffect(() => {
    const logFormState = () => {
      console.log("Form values:", form.getValues());
      console.log("Form errors:", form.formState.errors);
    };

    form.watch(() => logFormState());
  }, [form]);

  const onSubmit = async (data: FormData) => {
    console.log("Submitting form with data:", data);
    console.log("Form errors:", form.formState.errors);

    try {
      // Handle image upload if present
      let coverUrl = undefined;
      if (data.coverImage instanceof FileList && data.coverImage.length > 0) {
        setImageUploading(true);
        const file = data.coverImage[0];
        const fileName = `${Math.random()}.${file.name.split(".").pop()}`;
        const filePath = `challenge-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("challenges")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("challenges").getPublicUrl(filePath);

        coverUrl = publicUrl;
        setImageUploading(false);
      }

      // Transform form data to match database schema
      const challengeData: CreateChallengeRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        status: "upcoming",
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        min_participants: data.min_participants,
        max_participants: data.max_participants,
        cover_url: coverUrl,
        goals: data.goals.map((goal) => ({
          type: goal.type,
          target: goal.target,
          description: goal.description,
        })),
        rewards: data.rewards.map((reward) => ({
          type: reward.type,
          name: reward.name,
          description: reward.description,
          badge_id: reward.badge_id,
        })),
        rules: data.rules,
      };

      const challengeId = await createChallenge(challengeData);

      if (!challengeId) {
        throw new Error("Failed to create challenge");
      }

      toast.success("Challenge created successfully!");
      router.push(`/challenges/${challengeId}`);
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create challenge"
      );
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">Create Challenge</CardTitle>
              <CardDescription>
                Create a new challenge for your community
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Basic Information</h2>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter challenge title" {...field} />
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
                          placeholder="Describe your challenge"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select challenge type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="competitive">
                            Competitive
                          </SelectItem>
                          <SelectItem value="collaborative">
                            Collaborative
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Timeline</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Participants</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? parseInt(value) : null);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Required for competitive challenges
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Cover Image</h2>

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Upload Cover Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onChange(file);
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Goals Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Goals</h2>
                  {form.formState.errors.goals && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.goals.message}
                    </p>
                  )}
                </div>

                {form.watch("goals")?.map((_, index) => (
                  <div key={index} className="space-y-4 p-4 bg-card rounded-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">
                        Goal {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const goals = form.getValues("goals");
                          form.setValue(
                            "goals",
                            goals.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`goals.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select goal type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="complete_games">
                                Complete Games
                              </SelectItem>
                              <SelectItem value="achieve_trophies">
                                Achieve Trophies
                              </SelectItem>
                              <SelectItem value="play_time">
                                Play Time
                              </SelectItem>
                              <SelectItem value="score_points">
                                Score Points
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`goals.${index}.target`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Rewards Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Rewards</h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const rewards = form.getValues("rewards") || [];
                      form.setValue("rewards", [
                        ...rewards,
                        { type: "badge", name: "", description: "" },
                      ]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reward
                  </Button>
                </div>

                <div className="grid gap-6">
                  {form.watch("rewards")?.map((reward, index) => (
                    <div
                      key={index}
                      className="p-6 bg-card rounded-lg border border-border/50"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold">
                          Reward {index + 1}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const rewards = form.getValues("rewards");
                            form.setValue(
                              "rewards",
                              rewards.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`rewards.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Reset badge-specific fields when changing type
                                if (value !== "badge") {
                                  form.setValue(
                                    `rewards.${index}.badge_id`,
                                    undefined
                                  );
                                }
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reward type" />
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

                      {form.watch(`rewards.${index}.type`) === "badge" ? (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`rewards.${index}.badge_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Badge</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a badge" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="w-[400px] p-0">
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                      {badges.map((badge) => (
                                        <SelectItem
                                          key={badge.id}
                                          value={badge.id}
                                          className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-accent/50 data-[state=checked]:bg-accent"
                                        >
                                          <BadgeImage
                                            imageUrl={
                                              badge.icon_url ||
                                              badge.image_url ||
                                              null
                                            }
                                            name={badge.name}
                                            size="sm"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                              {badge.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                              {badge.description}
                                            </p>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </div>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Badge preview */}
                          {form.watch(`rewards.${index}.badge_id`) && (
                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                                Selected Badge
                              </h4>
                              {badges
                                .filter(
                                  (b) =>
                                    b.id ===
                                    form.watch(`rewards.${index}.badge_id`)
                                )
                                .map((badge) => (
                                  <div
                                    key={badge.id}
                                    className="flex items-center gap-6"
                                  >
                                    <BadgeImage
                                      imageUrl={
                                        badge.icon_url ||
                                        badge.image_url ||
                                        null
                                      }
                                      name={badge.name}
                                      size="lg"
                                    />
                                    <div className="flex-1">
                                      <p className="font-semibold text-lg mb-1">
                                        {badge.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {badge.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <FormField
                            control={form.control}
                            name={`rewards.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`rewards.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Rules</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const rules = form.getValues("rules") || [];
                      form.setValue("rules", [...rules, ""]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>

                {form.watch("rules")?.map((_, index) => (
                  <div
                    key={index}
                    className="space-y-4 p-4 bg-card rounded-lg border border-border/50"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">
                        Rule {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const rules = form.getValues("rules");
                          form.setValue(
                            "rules",
                            rules.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`rules.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter rule description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={imageUploading || form.formState.isSubmitting}
                  className="w-full md:w-auto"
                >
                  {form.formState.isSubmitting || imageUploading ? (
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

              {/* Add error summary with details */}
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 text-destructive">
                  <h4 className="font-semibold mb-2">
                    Please fix the following errors:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(form.formState.errors).map(
                      ([key, error]) => (
                        <li key={key}>
                          {key}: {error?.message as string}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

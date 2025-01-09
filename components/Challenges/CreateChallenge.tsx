"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
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
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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

interface ChallengeFormData extends FormData {
  imageFile: File | null;
}

export function CreateChallenge() {
  const router = useRouter();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const createChallenge = useChallengesStore((state) => state.createChallenge);
  const isLoading = useChallengesStore((state) => state.isLoading);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "competitive",
      start_date: new Date(),
      end_date: new Date(),
      min_participants: 2,
      max_participants: undefined,
      goals: [],
      rules: [],
      rewards: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!data) return;

      const challengeData: ChallengeFormData = {
        ...data,
        imageFile,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
      };

      await createChallenge(challengeData);

      toast({
        title: "Success",
        description: "Challenge created successfully!",
      });

      router.push("/profile/challenges");
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create challenge",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Create Challenge</CardTitle>
              <CardDescription>
                Create a new challenge for the community
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <Link href="/challenges">
                <ArrowLeft className="w-4 h-4" />
                Back to Challenges
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                </div>
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
                      <FormLabel>Challenge Type</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
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
                                variant="outline"
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
                                variant="outline"
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

                <div className="grid grid-cols-2 gap-4">
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
                    name="max_participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Goals</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const goals = form.getValues("goals");
                        form.setValue("goals", [
                          ...goals,
                          { type: "", target: 1, description: "" },
                        ]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                  {form.watch("goals").map((_, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name={`goals.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Type</FormLabel>
                              <FormControl>
                                <Input placeholder="Goal type" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`goals.${index}.target`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Target</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-8"
                          onClick={() => {
                            const goals = form.getValues("goals");
                            form.setValue(
                              "goals",
                              goals.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`goals.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the goal"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Rules</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const rules = form.getValues("rules");
                        form.setValue("rules", [...rules, ""]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  {form.watch("rules").map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <FormField
                        control={form.control}
                        name={`rules.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Enter rule" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const rules = form.getValues("rules");
                          form.setValue(
                            "rules",
                            rules.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Rewards</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const rewards = form.getValues("rewards");
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
                  {form.watch("rewards").map((_, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name={`rewards.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-8"
                          onClick={() => {
                            const rewards = form.getValues("rewards");
                            form.setValue(
                              "rewards",
                              rewards.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`rewards.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Reward name" {...field} />
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
                              <Textarea
                                placeholder="Describe the reward"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Challenge
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

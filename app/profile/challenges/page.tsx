"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ChallengeType, ChallengeStatus, Challenge } from "@/types/challenge";
import { CalendarDays, Trophy, Users, Plus, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useChallengesStore } from "@/stores/useChallengesStore";

type ValidChallengeStatus = Extract<
  ChallengeStatus,
  "active" | "upcoming" | "completed"
>;

type GroupedChallenges = Record<ValidChallengeStatus, Challenge[]>;

export default function UserChallengesPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const {
    filteredChallenges,
    activeChallenges,
    upcomingChallenges,
    completedChallenges,
    isLoading,
    filter,
    statusFilter,
    sortBy,
    setFilter,
    setStatusFilter,
    setSortBy,
    fetchChallenges,
    fetchActiveChallenges,
    fetchUpcomingChallenges,
  } = useChallengesStore();

  useEffect(() => {
    // Fetch all challenges initially
    fetchChallenges(supabase);

    // Set up interval to fetch active and upcoming challenges
    const interval = setInterval(() => {
      fetchActiveChallenges(supabase);
      fetchUpcomingChallenges(supabase);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [
    fetchChallenges,
    fetchActiveChallenges,
    fetchUpcomingChallenges,
    supabase,
  ]);

  const handleCreateChallenge = () => {
    router.push("/challenges/create");
  };

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400";
      case "completed":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
      case "upcoming":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";
      case "cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  // Group challenges by status
  const groupedChallenges: GroupedChallenges = {
    active: activeChallenges,
    upcoming: upcomingChallenges,
    completed: completedChallenges,
  };

  const handleLeaveChallenge = async (challenge: Challenge) => {
    try {
      // Implement the leave challenge logic here
      console.log("Leaving challenge:", challenge.id);
      await fetchChallenges(supabase);
    } catch (error) {
      console.error("Error leaving challenge:", error);
    }
  };

  const getTimeStatus = (challenge: Challenge) => {
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysUntilEnd = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (challenge.status === "completed") {
      return "Completed";
    } else if (now < startDate) {
      return `Starts in ${daysUntilStart} day${
        daysUntilStart !== 1 ? "s" : ""
      }`;
    } else if (now > endDate) {
      return "Ended";
    } else {
      return `${daysUntilEnd} day${daysUntilEnd !== 1 ? "s" : ""} remaining`;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-background to-background/50 -z-10" />

      <div className="mx-auto max-w-7xl space-y-8 p-6 relative">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-500">
              Your Challenges
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Track your active and upcoming gaming adventures
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/challenges")}
              variant="outline"
              className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors"
            >
              Browse All Challenges
            </Button>
            <Button
              onClick={handleCreateChallenge}
              className="relative inline-flex h-11 items-center justify-center rounded-[8px] bg-background px-6 font-medium text-neutral-200 transition-colors hover:text-neutral-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Challenge
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | ChallengeStatus) =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-[160px] bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-black/80 backdrop-blur-sm border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter}
            onValueChange={(value: "all" | ChallengeType) => setFilter(value)}
          >
            <SelectTrigger className="w-[160px] bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-black/80 backdrop-blur-sm border-white/10">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="competitive">Competitive</SelectItem>
              <SelectItem value="collaborative">Collaborative</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: "date" | "participants") => setSortBy(value)}
          >
            <SelectTrigger className="w-[160px] bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-black/80 backdrop-blur-sm border-white/10">
              <SelectItem value="date">Latest First</SelectItem>
              <SelectItem value="participants">By Participants</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg p-8 text-center border border-white/10">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Challenges Found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {filter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters to see more challenges"
                : "Start your gaming journey by joining or creating a challenge"}
            </p>
            <Button
              onClick={() => router.push("/challenges")}
              variant="outline"
              className="bg-black/20 backdrop-blur-sm border-white/10 hover:bg-black/30 transition-colors"
            >
              Browse Challenges
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <Accordion
              type="multiple"
              className="w-full space-y-4"
              defaultValue={
                statusFilter === "all" ? ["active"] : [statusFilter]
              }
            >
              {(["active", "upcoming", "completed"] as ValidChallengeStatus[])
                .filter(
                  (statusGroup) =>
                    statusFilter === "all" || statusGroup === statusFilter
                )
                .map(
                  (statusGroup) =>
                    groupedChallenges[statusGroup]?.length > 0 && (
                      <AccordionItem
                        key={statusGroup}
                        value={statusGroup}
                        className={cn(
                          "border-white/10 backdrop-blur-sm rounded-lg overflow-hidden",
                          statusGroup === "active"
                            ? "bg-emerald-950/20"
                            : "bg-black/20"
                        )}
                      >
                        <AccordionTrigger
                          className={cn(
                            "px-6 transition-colors",
                            statusGroup === "active"
                              ? "hover:bg-emerald-950/30"
                              : "hover:bg-black/30"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "capitalize",
                                getStatusColor(statusGroup as ChallengeStatus)
                              )}
                            >
                              {statusGroup}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              ({groupedChallenges[statusGroup].length})
                            </span>
                            {statusGroup === "active" && (
                              <Badge
                                variant="secondary"
                                className="ml-2 bg-emerald-500/20 text-emerald-200"
                              >
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 grid gap-4">
                            {groupedChallenges[statusGroup].map((challenge) => (
                              <Card
                                key={challenge.id}
                                className={cn(
                                  "group backdrop-blur-sm border-white/10 transition-all duration-300",
                                  statusGroup === "active"
                                    ? "bg-emerald-950/20 hover:bg-emerald-950/30"
                                    : "bg-black/20 hover:bg-black/30"
                                )}
                              >
                                <CardHeader className="pb-2">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-lg font-medium line-clamp-1 text-neutral-200">
                                          {challenge.title}
                                        </CardTitle>
                                        {statusGroup === "active" && (
                                          <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs text-emerald-200">
                                              Live Now
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      {(challenge.status === "upcoming" ||
                                        challenge.status === "completed") && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-muted-foreground hover:text-destructive"
                                            >
                                              Leave
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-black/80 backdrop-blur-sm border-white/10">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                Leave Challenge?
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to leave
                                                this challenge? This action
                                                cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="bg-background hover:bg-background/90">
                                                Cancel
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() =>
                                                  handleLeaveChallenge(
                                                    challenge
                                                  )
                                                }
                                                className="bg-destructive hover:bg-destructive/90"
                                              >
                                                Leave Challenge
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          "text-xs font-normal",
                                          statusGroup === "active"
                                            ? "bg-emerald-500/20 text-emerald-200"
                                            : "bg-black/40 hover:bg-black/50"
                                        )}
                                      >
                                        <Clock className="mr-1 h-3 w-3" />
                                        {getTimeStatus(challenge)}
                                      </Badge>
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          "text-xs font-normal",
                                          statusGroup === "active"
                                            ? "bg-emerald-500/20 text-emerald-200"
                                            : "bg-black/40 hover:bg-black/50"
                                        )}
                                      >
                                        {challenge.type}
                                      </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2 text-sm text-neutral-400">
                                      {challenge.description}
                                    </CardDescription>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2 pt-0">
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="flex items-center text-neutral-400">
                                      <CalendarDays className="mr-2 h-4 w-4" />
                                      <span className="truncate">
                                        {new Date(
                                          challenge.start_date
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-neutral-400">
                                      <Users className="mr-2 h-4 w-4" />
                                      <span className="truncate">
                                        {challenge.min_participants} players
                                      </span>
                                    </div>
                                    <div className="flex items-center text-neutral-400">
                                      <Trophy className="mr-2 h-4 w-4" />
                                      <span className="truncate">
                                        {challenge.goals?.length || 0} goals
                                      </span>
                                    </div>
                                  </div>
                                  {statusGroup === "active" && (
                                    <Button
                                      onClick={() =>
                                        router.push(
                                          `/challenges/${challenge.id}/progress`
                                        )
                                      }
                                      className="w-full mt-4 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 transition-colors"
                                    >
                                      View Progress
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                )}
            </Accordion>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

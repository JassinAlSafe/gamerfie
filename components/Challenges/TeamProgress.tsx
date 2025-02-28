// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Trophy, Users, Medal } from "lucide-react";
// import { toast } from "sonner";
// import type {
//   ChallengeTeam,
//   ProgressMilestone,
//   ParticipantAchievement,
//   TeamProgressHistory,
// } from "@/types/challenge";

// interface TeamProgressProps {
//   challengeId: string;
//   teamId: string;
// }

// export function TeamProgress({ challengeId, teamId }: TeamProgressProps) {
//   const [team, setTeam] = useState<ChallengeTeam | null>(null);
//   const [milestones, setMilestones] = useState<ProgressMilestone[]>([]);
//   const [achievements, setAchievements] = useState<ParticipantAchievement[]>(
//     []
//   );
//   const [progressHistory, setProgressHistory] = useState<TeamProgressHistory[]>(
//     []
//   );
//   const [loading, setLoading] = useState(true);

//   const router = useRouter();
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     fetchTeamData();
//   }, [challengeId, teamId]);

//   const fetchTeamData = async () => {
//     try {
//       setLoading(true);

//       // Fetch team data
//       const { data: teamData, error: teamError } = await supabase
//         .from("challenge_teams")
//         .select(
//           `
//           *,
//           participants:challenge_participants (
//             user:profiles(*),
//             progress,
//             completed
//           )
//         `
//         )
//         .eq("id", teamId)
//         .single();

//       if (teamError) throw teamError;
//       setTeam(teamData);

//       // Fetch milestones
//       const { data: milestoneData, error: milestoneError } = await supabase
//         .from("progress_milestones")
//         .select("*")
//         .eq("challenge_id", challengeId)
//         .order("required_progress", { ascending: true });

//       if (milestoneError) throw milestoneError;
//       setMilestones(milestoneData);

//       // Fetch team progress history
//       const { data: historyData, error: historyError } = await supabase
//         .from("team_progress_history")
//         .select("*")
//         .eq("team_id", teamId)
//         .order("recorded_at", { ascending: true });

//       if (historyError) throw historyError;
//       setProgressHistory(historyData);

//       // Fetch achievements
//       const { data: achievementData, error: achievementError } = await supabase
//         .from("participant_achievements")
//         .select(
//           `
//           *,
//           milestone:progress_milestones(*)
//         `
//         )
//         .in(
//           "participant_id",
//           teamData.participants.map((p: any) => p.id)
//         );

//       if (achievementError) throw achievementError;
//       setAchievements(achievementData);
//     } catch (error) {
//       console.error("Error fetching team data:", error);
//       toast.error("Failed to load team data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getTeamProgress = () => {
//     if (!team?.participants?.length) return 0;
//     return Math.round(
//       team.participants.reduce((sum, p) => sum + (p.progress || 0), 0) /
//         team.participants.length
//     );
//   };

//   const getProgressColor = (progress: number) => {
//     if (progress >= 100) return "bg-green-500";
//     if (progress >= 75) return "bg-yellow-500";
//     if (progress >= 50) return "bg-orange-500";
//     return "bg-gray-500";
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="animate-pulse space-y-4">
//             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//             <div className="h-8 bg-gray-200 rounded"></div>
//             <div className="space-y-2">
//               <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//               <div className="h-4 bg-gray-200 rounded w-4/6"></div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!team) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <p className="text-center text-gray-500">Team not found</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-2xl font-bold">{team.name}</CardTitle>
//             <CardDescription>
//               {team.participants?.length || 0} members
//             </CardDescription>
//           </div>
//           <Badge variant="outline" className="ml-2">
//             {team.team_type}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Overall Progress */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="font-semibold">Team Progress</h3>
//             <span className="text-sm text-gray-500">{getTeamProgress()}%</span>
//           </div>
//           <Progress
//             value={getTeamProgress()}
//             className={getProgressColor(getTeamProgress())}
//           />
//         </div>

//         {/* Milestones */}
//         <div>
//           <h3 className="font-semibold mb-4">Milestones</h3>
//           <div className="grid gap-4">
//             {milestones.map((milestone) => {
//               const achieved = achievements.some(
//                 (a) => a.milestone?.id === milestone.id
//               );
//               return (
//                 <TooltipProvider key={milestone.id}>
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <div
//                         className={`flex items-center p-3 rounded-lg border ${
//                           achieved
//                             ? "bg-green-50 border-green-200"
//                             : "bg-gray-50 border-gray-200"
//                         }`}
//                       >
//                         <div className="flex-1">
//                           <h4 className="font-medium">{milestone.title}</h4>
//                           <p className="text-sm text-gray-500">
//                             {milestone.description}
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           {milestone.reward_type === "badge" && (
//                             <Trophy className="h-5 w-5 text-yellow-500" />
//                           )}
//                           {milestone.reward_type === "points" && (
//                             <Medal className="h-5 w-5 text-blue-500" />
//                           )}
//                           <span className="text-sm font-medium">
//                             {milestone.required_progress}%
//                           </span>
//                         </div>
//                       </div>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Required Progress: {milestone.required_progress}%</p>
//                       {milestone.reward_type && (
//                         <p>
//                           Reward: {milestone.reward_type}{" "}
//                           {milestone.reward_amount &&
//                             `(${milestone.reward_amount})`}
//                         </p>
//                       )}
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>
//               );
//             })}
//           </div>
//         </div>

//         {/* Team Members */}
//         <div>
//           <h3 className="font-semibold mb-4">Team Members</h3>
//           <div className="grid gap-3">
//             {team.participants?.map((participant) => (
//               <div
//                 key={participant.user_id}
//                 className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
//               >
//                 <div className="flex items-center gap-3">
//                   <Users className="h-5 w-5 text-gray-500" />
//                   <div>
//                     <p className="font-medium">{participant.user?.username}</p>
//                     <p className="text-sm text-gray-500">
//                       Joined{" "}
//                       {new Date(participant.joined_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Progress
//                     value={participant.progress || 0}
//                     className={`w-24 ${getProgressColor(
//                       participant.progress || 0
//                     )}`}
//                   />
//                   <span className="text-sm font-medium min-w-[3ch]">
//                     {participant.progress || 0}%
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

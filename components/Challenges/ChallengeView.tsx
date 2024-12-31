// "use client";

// import { useState } from "react";
// import { Challenge, ChallengeGoal, ChallengeTeam } from "@/types/challenge";
// import { GoalProgress } from "./GoalProgress";
// import { TeamManagement } from "./TeamManagement";
// import { TeamLeaderboard } from "./TeamLeaderboard";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Trophy, Users, Target } from "lucide-react";

// interface ChallengeViewProps {
//   challenge: Challenge & {
//     goals: ChallengeGoal[];
//     teams: (ChallengeTeam & { progress: number })[];
//   };
//   userTeamId?: string;
//   onUpdateProgress: (goalId: string, progress: number) => Promise<void>;
//   onCreateTeam: (name: string) => Promise<void>;
//   onJoinTeam: (teamId: string) => Promise<void>;
//   onLeaveTeam: () => Promise<void>;
//   isLoading?: boolean;
// }

// export function ChallengeView({
//   challenge,
//   userTeamId,
//   onUpdateProgress,
//   onCreateTeam,
//   onJoinTeam,
//   onLeaveTeam,
//   isLoading,
// }: ChallengeViewProps) {
//   const [activeTab, setActiveTab] = useState("goals");

//   const overallProgress = challenge.goals.length
//     ? Math.round(
//         challenge.goals.reduce((sum, goal) => sum + goal.current, 0) /
//           challenge.goals.length
//       )
//     : 0;

//   return (
//     <div className="space-y-6">
//       <Card className="bg-gray-800/30 border-gray-700/30">
//         <CardHeader>
//           <CardTitle>{challenge.title}</CardTitle>
//           <p className="mt-2 text-gray-400">{challenge.description}</p>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4 md:grid-cols-3">
//             <div className="p-4 rounded-lg bg-gray-800/30 space-y-2">
//               <div className="flex items-center gap-2 text-purple-400">
//                 <Target className="w-5 h-5" />
//                 <h4 className="font-medium">Goals</h4>
//               </div>
//               <p className="text-2xl font-semibold">
//                 {challenge.goals.length}
//                 <span className="text-sm font-normal text-gray-400 ml-2">
//                   total goals
//                 </span>
//               </p>
//             </div>
//             <div className="p-4 rounded-lg bg-gray-800/30 space-y-2">
//               <div className="flex items-center gap-2 text-purple-400">
//                 <Users className="w-5 h-5" />
//                 <h4 className="font-medium">Teams</h4>
//               </div>
//               <p className="text-2xl font-semibold">
//                 {challenge.teams.length}
//                 <span className="text-sm font-normal text-gray-400 ml-2">
//                   competing
//                 </span>
//               </p>
//             </div>
//             <div className="p-4 rounded-lg bg-gray-800/30 space-y-2">
//               <div className="flex items-center gap-2 text-purple-400">
//                 <Trophy className="w-5 h-5" />
//                 <h4 className="font-medium">Progress</h4>
//               </div>
//               <p className="text-2xl font-semibold">
//                 {overallProgress}%
//                 <span className="text-sm font-normal text-gray-400 ml-2">
//                   completed
//                 </span>
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-gray-800/30 border-gray-700/30">
//           <TabsTrigger
//             value="goals"
//             className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400"
//           >
//             Goals
//           </TabsTrigger>
//           <TabsTrigger
//             value="teams"
//             className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400"
//           >
//             Teams
//           </TabsTrigger>
//           <TabsTrigger
//             value="leaderboard"
//             className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400"
//           >
//             Leaderboard
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="goals" className="mt-6">
//           <div className="grid gap-4 md:grid-cols-2">
//             {challenge.goals.map((goal) => (
//               <GoalProgress
//                 key={goal.id}
//                 goal={goal}
//                 onProgressUpdate={onUpdateProgress}
//                 isLoading={isLoading}
//               />
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="teams" className="mt-6">
//           <TeamManagement
//             teams={challenge.teams}
//             userTeamId={userTeamId}
//             onCreateTeam={onCreateTeam}
//             onJoinTeam={onJoinTeam}
//             onLeaveTeam={onLeaveTeam}
//             isLoading={isLoading}
//           />
//         </TabsContent>

//         <TabsContent value="leaderboard" className="mt-6">
//           <TeamLeaderboard teams={challenge.teams} userTeamId={userTeamId} />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

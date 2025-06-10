// "use client";

// import { ChallengeTeam } from "@/types/challenge";
// import { Trophy, Medal, Users } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Progress } from "@/components/ui/progress";

// interface TeamLeaderboardProps {
//   teams: (ChallengeTeam & { progress: number })[];
//   userTeamId?: string;
//   className?: string;
// }

// const RankIcon = ({ rank }: { rank: number }) => {
//   if (rank === 1) {
//     return <Trophy className="w-5 h-5 text-yellow-400" />;
//   }
//   if (rank === 2) {
//     return <Medal className="w-5 h-5 text-gray-300" />;
//   }
//   if (rank === 3) {
//     return <Medal className="w-5 h-5 text-amber-600" />;
//   }
//   return <span className="text-sm font-medium text-gray-400">#{rank}</span>;
// };

// export function TeamLeaderboard({
//   teams,
//   userTeamId,
//   className,
// }: TeamLeaderboardProps) {
//   // Sort teams by progress in descending order
//   const sortedTeams = [...teams].sort((a, b) => b.progress - a.progress);

//   return (
//     <div className={cn("space-y-4", className)}>
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-200">Team Rankings</h3>
//         <div className="flex items-center gap-2 text-sm text-gray-400">
//           <Users className="w-4 h-4" />
//           {teams.length} team{teams.length !== 1 && "s"}
//         </div>
//       </div>

//       <div className="space-y-3">
//         {sortedTeams.map((team, index) => (
//           <Card
//             key={team.id}
//             className={cn(
//               "bg-gray-800/30 border-gray-700/30 transition-colors",
//               team.id === userTeamId && "border-purple-500/50"
//             )}
//           >
//             <CardContent className="p-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center justify-center w-8">
//                   <RankIcon rank={index + 1} />
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h4 className="font-medium text-gray-200 truncate">
//                       {team.name}
//                     </h4>
//                     {team.id === userTeamId && (
//                       <span className="px-2 py-0.5 text-xs font-medium text-purple-400 bg-purple-500/10 rounded-full">
//                         Your Team
//                       </span>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-400">Progress</span>
//                       <span className="text-white">{team.progress}%</span>
//                     </div>
//                     <Progress
//                       value={team.progress}
//                       className={cn(
//                         "h-2",
//                         index === 0
//                           ? "bg-yellow-500/20"
//                           : index === 1
//                           ? "bg-gray-500/20"
//                           : index === 2
//                           ? "bg-amber-700/20"
//                           : "bg-gray-700"
//                       )}
//                     />
//                   </div>

//                   <div className="flex items-center gap-2 mt-3">
//                     <div className="flex -space-x-2">
//                       {team.participants.slice(0, 3).map((participant) => (
//                         <Avatar
//                           key={participant.id}
//                           className="border-2 border-gray-800 w-6 h-6"
//                         >
//                           <AvatarImage src={participant.avatar_url} />
//                           <AvatarFallback>
//                             {participant.username.slice(0, 2).toUpperCase()}
//                           </AvatarFallback>
//                         </Avatar>
//                       ))}
//                     </div>
//                     {team.participants.length > 3 && (
//                       <span className="text-sm text-gray-400">
//                         +{team.participants.length - 3} more
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ChallengeTeam } from "@/types/challenge";
// import { Users, Plus, Loader2, UserPlus, UserMinus } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// interface TeamManagementProps {
//   teams: ChallengeTeam[];
//   userTeamId?: string;
//   onCreateTeam: (name: string) => Promise<void>;
//   onJoinTeam: (teamId: string) => Promise<void>;
//   onLeaveTeam: () => Promise<void>;
//   isLoading?: boolean;
//   className?: string;
// }

// export function TeamManagement({
//   teams,
//   userTeamId,
//   onCreateTeam,
//   onJoinTeam,
//   onLeaveTeam,
//   isLoading,
//   className,
// }: TeamManagementProps) {
//   const [newTeamName, setNewTeamName] = useState("");
//   const [creating, setCreating] = useState(false);
//   const [joining, setJoining] = useState(false);
//   const [leaving, setLeaving] = useState(false);

//   const handleCreateTeam = async () => {
//     if (!newTeamName.trim()) return;
//     try {
//       setCreating(true);
//       await onCreateTeam(newTeamName);
//       setNewTeamName("");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleJoinTeam = async (teamId: string) => {
//     try {
//       setJoining(true);
//       await onJoinTeam(teamId);
//     } finally {
//       setJoining(false);
//     }
//   };

//   const handleLeaveTeam = async () => {
//     try {
//       setLeaving(true);
//       await onLeaveTeam();
//     } finally {
//       setLeaving(false);
//     }
//   };

//   return (
//     <div className={cn("space-y-6", className)}>
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <Input
//             placeholder="Enter team name"
//             value={newTeamName}
//             onChange={(e) => setNewTeamName(e.target.value)}
//             className="flex-1 bg-gray-800/30 border-gray-700/30"
//           />
//           <Button
//             onClick={handleCreateTeam}
//             disabled={isLoading || creating || !newTeamName.trim()}
//             className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
//           >
//             {creating ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Creating...
//               </>
//             ) : (
//               <>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Create Team
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {teams.map((team) => (
//           <Card
//             key={team.id}
//             className={cn(
//               "bg-gray-800/30 border-gray-700/30",
//               team.id === userTeamId && "border-purple-500/50"
//             )}
//           >
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Users className="w-5 h-5 text-purple-400" />
//                 {team.name}
//               </CardTitle>
//               <CardDescription>
//                 {team.participants.length} member
//                 {team.participants.length !== 1 && "s"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex -space-x-2">
//                   {team.participants.map((participant) => (
//                     <Avatar
//                       key={participant.id}
//                       className="border-2 border-gray-800"
//                     >
//                       <AvatarImage src={participant.avatar_url} />
//                       <AvatarFallback>
//                         {participant.username.slice(0, 2).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                   ))}
//                 </div>

//                 {team.id === userTeamId ? (
//                   <Button
//                     onClick={handleLeaveTeam}
//                     disabled={isLoading || leaving}
//                     variant="destructive"
//                     className="w-full"
//                   >
//                     {leaving ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Leaving...
//                       </>
//                     ) : (
//                       <>
//                         <UserMinus className="w-4 h-4 mr-2" />
//                         Leave Team
//                       </>
//                     )}
//                   </Button>
//                 ) : (
//                   <Button
//                     onClick={() => handleJoinTeam(team.id)}
//                     disabled={isLoading || joining || Boolean(userTeamId)}
//                     className="w-full bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
//                   >
//                     {joining ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Joining...
//                       </>
//                     ) : (
//                       <>
//                         <UserPlus className="w-4 h-4 mr-2" />
//                         Join Team
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

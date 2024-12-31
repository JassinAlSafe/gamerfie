// "use client";

// import * as React from "react";
// import { useState, useEffect } from "react";
// import { Challenge, ChallengeStatus } from "@/types/challenge";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { formatDistanceToNow } from "date-fns";
// import Link from "next/link";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { ChallengeServices } from "@/lib/services/ChallengeServices";
// import {
//   Trophy,
//   Users,
//   Calendar,
//   Target,
//   Share2,
//   Gamepad2,
//   ArrowLeft,
//   Loader2,
//   Crown,
//   Flag,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";

// type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// interface ParticipantUser {
//   id: string;
//   username: string;
//   avatar_url?: string;
// }

// interface ChallengeParticipantData {
//   user: ParticipantUser;
//   joined_at: string;
//   progress: number;
//   completed: boolean;
// }

// interface ChallengeDetailsProps {
//   challenge: Challenge;
//   isLoading: boolean;
//   error: string | null;
//   onShare: () => void;
//   onChallengeUpdate?: () => Promise<void>;
// }

// export function ChallengeDetails({
//   challenge,
//   isLoading,
//   error,
//   onShare,
//   onChallengeUpdate,
// }: ChallengeDetailsProps) {
//   const supabase = createClientComponentClient();
//   const { toast } = useToast();
//   const [isJoining, setIsJoining] = useState(false);
//   const [isLeaving, setIsLeaving] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   useEffect(() => {
//     const getUser = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       if (session?.user) {
//         setCurrentUserId(session.user.id);
//         console.log("Current user ID:", session.user.id);
//       }
//     };
//     getUser();
//   }, [supabase.auth]);

//   useEffect(() => {
//     console.log("Challenge participants:", challenge?.participants || []);
//     console.log("Current user ID:", currentUserId);
//     console.log(
//       "Is participant:",
//       challenge?.participants?.some((p) => p.user?.id === currentUserId) ||
//         false
//     );
//   }, [challenge?.participants, currentUserId]);

//   const isParticipant =
//     challenge?.participants?.some((p) => p.user?.id === currentUserId) || false;

//   const getStatusVariant = (status: ChallengeStatus): BadgeVariant => {
//     switch (status) {
//       case "upcoming":
//         return "default";
//       case "active":
//         return "secondary";
//       case "completed":
//         return "outline";
//       case "cancelled":
//         return "destructive";
//       default:
//         return "default";
//     }
//   };

//   const handleJoin = async () => {
//     if (!currentUserId) {
//       toast({
//         title: "Error",
//         description: "You must be logged in to join a challenge.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       console.log("Attempting to join challenge:", challenge.id);
//       setIsJoining(true);
//       await ChallengeServices.joinChallenge(challenge.id);
//       console.log("Successfully joined challenge");
//       toast({
//         title: "Success",
//         description: "You have joined the challenge!",
//       });
//       if (onChallengeUpdate) {
//         await onChallengeUpdate();
//       }
//     } catch (error) {
//       console.error("Error joining challenge:", error);
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to join the challenge. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsJoining(false);
//     }
//   };

//   const handleLeave = async () => {
//     if (!currentUserId) {
//       toast({
//         title: "Error",
//         description: "You must be logged in to leave a challenge.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       console.log("Attempting to leave challenge:", challenge.id);
//       setIsLeaving(true);
//       await ChallengeServices.leaveChallenge(challenge.id);
//       console.log("Successfully left challenge");
//       toast({
//         title: "Success",
//         description: "You have left the challenge.",
//       });
//       if (onChallengeUpdate) {
//         await onChallengeUpdate();
//       }
//     } catch (error) {
//       console.error("Error leaving challenge:", error);
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to leave the challenge. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLeaving(false);
//     }
//   };

//   if (error) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-red-400">Error loading challenge: {error}</p>
//       </div>
//     );
//   }

//   if (isLoading || !challenge) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <Loader2 className="w-8 h-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="-mx-6">
//         <div className="bg-gray-900/95 px-6 py-4 border-b border-gray-800/50">
//           <div className="flex items-center justify-between max-w-[calc(100vw-3rem)]">
//             <div className="flex items-center gap-4">
//               <Link
//                 href="/challenges"
//                 className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 <span>Back</span>
//               </Link>
//             </div>
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 hover:border-purple-500/50"
//                 onClick={onShare}
//               >
//                 <Share2 className="w-4 h-4 mr-2" />
//                 Share
//               </Button>
//               {isParticipant ? (
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={handleLeave}
//                   disabled={isLeaving}
//                   className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
//                 >
//                   {isLeaving ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Leaving...
//                     </>
//                   ) : (
//                     <>
//                       <XCircle className="w-4 h-4 mr-2" />
//                       Leave Challenge
//                     </>
//                   )}
//                 </Button>
//               ) : (
//                 <Button
//                   size="sm"
//                   onClick={handleJoin}
//                   disabled={isJoining}
//                   className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
//                 >
//                   {isJoining ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Joining...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-4 h-4 mr-2" />
//                       Join Challenge
//                     </>
//                   )}
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="space-y-8">
//         {/* Challenge Overview */}
//         <div className="space-y-6">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-purple-500/10 rounded-xl">
//               <Gamepad2 className="w-8 h-8 text-purple-400" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
//               <div className="flex items-center gap-2">
//                 <Badge
//                   variant="secondary"
//                   className="bg-purple-500/10 text-purple-400 border-purple-500/20"
//                 >
//                   {challenge.type}
//                 </Badge>
//                 <Badge
//                   variant={getStatusVariant(challenge.status)}
//                   className="bg-gray-800/50"
//                 >
//                   {challenge.status}
//                 </Badge>
//               </div>
//             </div>
//           </div>

//           <p className="text-gray-400 text-lg leading-relaxed">
//             {challenge.description}
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-purple-500/10 rounded-lg">
//                   <Target className="w-5 h-5 text-purple-400" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-400">Goal</p>
//                   <div className="flex items-center gap-2">
//                     <Target className="w-4 h-4 text-gray-400" />
//                     <span className="text-gray-400">
//                       {challenge.goal_target}{" "}
//                       {challenge.goal_type.replace(/_/g, " ")}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-purple-500/10 rounded-lg">
//                   <Users className="w-5 h-5 text-purple-400" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-400">Participants</p>
//                   <p className="font-medium">
//                     {challenge.participants?.length || 0} /{" "}
//                     {challenge.max_participants || "∞"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-purple-500/10 rounded-lg">
//                   <Calendar className="w-5 h-5 text-purple-400" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-400">Timeline</p>
//                   <p className="font-medium">
//                     {challenge.status === "upcoming"
//                       ? `Starts ${formatDistanceToNow(
//                           new Date(challenge.start_date),
//                           {
//                             addSuffix: true,
//                           }
//                         )}`
//                       : `Ends ${formatDistanceToNow(
//                           new Date(challenge.end_date),
//                           {
//                             addSuffix: true,
//                           }
//                         )}`}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Rewards Section */}
//         {challenge.rewards && challenge.rewards.length > 0 && (
//           <div className="space-y-4">
//             <h2 className="text-xl font-bold flex items-center gap-3">
//               <div className="p-2 bg-purple-500/10 rounded-lg">
//                 <Trophy className="w-5 h-5 text-purple-400" />
//               </div>
//               Rewards
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {challenge.rewards.map((reward, index) => (
//                 <div
//                   key={`${challenge.id}-reward-${index}`}
//                   className="bg-gray-800/30 rounded-xl p-4"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-yellow-500/10 rounded-lg">
//                       <Crown className="w-5 h-5 text-yellow-400" />
//                     </div>
//                     <div>
//                       <p className="font-medium">{reward.name}</p>
//                       <p className="text-sm text-gray-400">
//                         {reward.description}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Rules Section */}
//         {challenge.rules && challenge.rules.length > 0 && (
//           <div className="space-y-4">
//             <h2 className="text-xl font-bold flex items-center gap-3">
//               <div className="p-2 bg-purple-500/10 rounded-lg">
//                 <Flag className="w-5 h-5 text-purple-400" />
//               </div>
//               Rules
//             </h2>
//             <div className="space-y-3">
//               {challenge.rules.map((ruleObj, index) => (
//                 <div
//                   key={`${challenge.id}-rule-${index}`}
//                   className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/30"
//                 >
//                   <div className="p-1 mt-0.5">
//                     <CheckCircle className="w-4 h-4 text-green-400" />
//                   </div>
//                   <p className="text-gray-300 flex-1">{ruleObj.rule}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

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
//   Trash2,
// } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
// import { SelectItem } from "@/components/ui/select";
// import { BadgeImage } from "@/components/ui/badge-image";

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
//         <Tabs defaultValue="details" className="space-y-6">
//           <TabsList>
//             <TabsTrigger value="details">Details</TabsTrigger>
//             <TabsTrigger value="goals">Goals</TabsTrigger>
//             <TabsTrigger value="rewards">Rewards</TabsTrigger>
//           </TabsList>

//           <TabsContent value="details">
//             {/* Basic Info, Timeline, Participants */}
//           </TabsContent>

//           <TabsContent value="goals">
//             {/* Goals Section */}
//           </TabsContent>

//           <TabsContent value="rewards">
//             <div className="grid gap-6">
//               {form.watch("rewards")?.map((reward, index) => (
//                 <Card key={index}>
//                   <CardHeader className="pb-4">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <Trophy className="w-4 h-4 text-primary" />
//                         <CardTitle>Reward {index + 1}</CardTitle>
//                       </div>
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => {/* ... */}}
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     {/* Reward fields */}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { useChallengesStore } from "@/stores/useChallengesStore";
// import { Challenge, ChallengeStatus, ChallengeType } from "@/types/challenge";
// import { Card } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { formatDistanceToNow } from "date-fns";
// import Link from "next/link";
// import {
//   Users,
//   Calendar,
//   ChevronRight,
//   Search,
//   Loader2,
//   Gamepad2,
//   Target,
// } from "lucide-react";
// import Image from "next/image";

// type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// console.log(
//   "Rendering ChallengeList component from components/Challenges/ChallengeList.tsx"
// );

// export function ChallengeList() {
//   const { challenges, isLoading, error, fetchChallenges } =
//     useChallengesStore();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [typeFilter, setTypeFilter] = useState<ChallengeType | "all">("all");
//   const [statusFilter, setStatusFilter] = useState<ChallengeStatus | "all">(
//     "upcoming"
//   );
//   const [sortBy, setSortBy] = useState<string>("latest");

//   useEffect(() => {
//     fetchChallenges();
//   }, [fetchChallenges]);

//   useEffect(() => {
//     console.log("All challenges:", challenges);
//   }, [challenges]);

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

//   const filteredChallenges = challenges
//     .filter((challenge) => {
//       const matchesSearch = challenge.title
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase());
//       const matchesType = typeFilter === "all" || challenge.type === typeFilter;
//       const matchesStatus =
//         statusFilter === "all" || challenge.status === statusFilter;
//       return matchesSearch && matchesType && matchesStatus;
//     })
//     .sort((a, b) => {
//       switch (sortBy) {
//         case "latest":
//           return (
//             new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//           );
//         case "oldest":
//           return (
//             new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//           );
//         case "most-participants":
//           return (b.participants?.length || 0) - (a.participants?.length || 0);
//         case "ending-soon":
//           return (
//             new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
//           );
//         default:
//           return 0;
//       }
//     });

//   const handleTypeFilterChange = (value: string) => {
//     setTypeFilter(value as ChallengeType | "all");
//   };

//   const handleStatusFilterChange = (value: string) => {
//     setStatusFilter(value as ChallengeStatus | "all");
//   };

//   if (error) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-red-400">Error loading challenges: {error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-3 sticky top-0 bg-background z-10 pb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
//           <Input
//             placeholder="Search challenges..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-9 pr-4 py-2 h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors"
//           />
//         </div>
//         <div className="flex gap-2 sm:w-auto">
//           <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
//             <SelectTrigger className="w-[130px] h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors">
//               <SelectValue placeholder="All Types" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="competitive">Competitive</SelectItem>
//               <SelectItem value="collaborative">Collaborative</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
//             <SelectTrigger className="w-[130px] h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors">
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Statuses</SelectItem>
//               <SelectItem value="upcoming">Upcoming</SelectItem>
//               <SelectItem value="active">Active</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//               <SelectItem value="cancelled">Cancelled</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={sortBy} onValueChange={setSortBy}>
//             <SelectTrigger className="w-[130px] h-9 bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors">
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="latest">Latest</SelectItem>
//               <SelectItem value="oldest">Oldest</SelectItem>
//               <SelectItem value="most-participants">
//                 Most Participants
//               </SelectItem>
//               <SelectItem value="ending-soon">Ending Soon</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center py-8">
//           <Loader2 className="w-8 h-8 animate-spin" />
//         </div>
//       ) : filteredChallenges.length === 0 ? (
//         <div className="text-center py-8">
//           <p className="text-muted-foreground">No challenges found</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredChallenges.map((challenge) => (
//             <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
//               <ChallengeCard
//                 title={challenge.title}
//                 description={challenge.description}
//                 organizer={{
//                   name: challenge.creator?.username || "Unknown",
//                   avatar: challenge.creator?.avatar_url || undefined,
//                 }}
//                 media={challenge.media}
//                 coverImage={challenge.cover_url}
//                 participantCount={challenge.participant_count || 0}
//                 participantAvatars={
//                   challenge.participants?.map((p) => ({
//                     image: p.user?.avatar_url,
//                     fallback: p.user?.username?.[0] || "U",
//                   })) || []
//                 }
//                 status={challenge.status}
//                 type={challenge.type}
//               />
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

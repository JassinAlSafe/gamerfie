// "use client";

// import { useState, useEffect } from "react";
// import { useSupabase } from "@/components/providers/supabase-provider";
// import { Badge as BadgeType } from "@/types/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Loader2, Medal, Plus, Trophy } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import { v4 as uuidv4 } from "uuid";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// interface ChallengeBadgesProps {
//   challengeId: string;
//   isCreator: boolean;
//   isCompleted?: boolean;
// }

// const DEFAULT_BADGE_ICON = "/images/default-badge.png";

// interface FileUploadResponse {
//   path: string;
//   url: string;
// }

// export function ChallengeBadges({
//   challengeId,
//   isCreator,
//   isCompleted = false,
// }: ChallengeBadgesProps) {
//   const { supabase } = useSupabase();
//   const { toast } = useToast();
//   const [badges, setBadges] = useState<BadgeType[]>([]);
//   const [availableBadges, setAvailableBadges] = useState<BadgeType[]>([]);
//   const [selectedBadgeId, setSelectedBadgeId] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAssigning, setIsAssigning] = useState(false);
//   const [isClaiming, setIsClaiming] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);

//   useEffect(() => {
//     fetchChallengeBadges();
//     if (isCreator) {
//       fetchAvailableBadges();
//     }
//   }, [challengeId]);

//   const fetchChallengeBadges = async () => {
//     try {
//       const response = await fetch(`/api/challenges/${challengeId}/badges`);
//       if (!response.ok) throw new Error("Failed to fetch badges");
//       const data = await response.json();
//       setBadges(data);
//     } catch (error) {
//       console.error("Error fetching challenge badges:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch challenge badges",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchAvailableBadges = async () => {
//     try {
//       const response = await fetch("/api/badges");
//       if (!response.ok) throw new Error("Failed to fetch available badges");
//       const data = await response.json();
//       setAvailableBadges(data);
//     } catch (error) {
//       console.error("Error fetching available badges:", error);
//     }
//   };

//   const uploadBadgeImage = async (
//     file: File
//   ): Promise<FileUploadResponse | null> => {
//     try {
//       setIsUploading(true);

//       const fileExt = file.name.split(".").pop();
//       const fileName = `${uuidv4()}.${fileExt}`;
//       const filePath = `badges/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from("badges")
//         .upload(filePath, file);

//       if (uploadError) {
//         throw uploadError;
//       }

//       const { data } = await supabase.storage
//         .from("badges")
//         .getPublicUrl(filePath);

//       if (!data?.publicUrl) {
//         throw new Error("Failed to get public URL");
//       }

//       return {
//         path: filePath,
//         url: data.publicUrl,
//       };
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       toast({
//         title: "Error",
//         description: "Failed to upload badge image",
//         variant: "destructive",
//       });
//       return null;
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleAssignBadge = async (imageFile?: File) => {
//     if (!selectedBadgeId) return;

//     try {
//       setIsAssigning(true);

//       let imagePath = null;
//       if (imageFile) {
//         const uploadResult = await uploadBadgeImage(imageFile);
//         if (!uploadResult) {
//           throw new Error("Failed to upload image");
//         }
//         imagePath = uploadResult.path;
//       }

//       const response = await fetch(`/api/challenges/${challengeId}/badges`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           badge_id: selectedBadgeId,
//           icon_path: imagePath,
//         }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Failed to assign badge");
//       }

//       await fetchChallengeBadges();
//       setIsDialogOpen(false);
//       setSelectedBadgeId("");

//       toast({
//         title: "Success",
//         description: "Badge assigned to challenge",
//       });
//     } catch (error) {
//       console.error("Error assigning badge:", error);
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Failed to assign badge",
//         variant: "destructive",
//       });
//     } finally {
//       setIsAssigning(false);
//     }
//   };

//   const handleClaimBadge = async (badgeId: string) => {
//     try {
//       setIsClaiming(true);
//       const response = await fetch(`/api/badges/claim`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           badgeId,
//           challengeId,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to claim badge");
//       }

//       toast({
//         title: "Success",
//         description: "Badge claimed successfully!",
//       });

//       // Refresh badges to update UI
//       await fetchChallengeBadges();
//     } catch (error) {
//       console.error("Error claiming badge:", error);
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to claim badge. Please ensure you've completed the challenge.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsClaiming(false);
//     }
//   };

//   // const getBadgeIconUrl = async (iconPath: string | null): Promise<string> => {
//   //   if (!iconPath) return DEFAULT_BADGE_ICON;

//   //   if (iconPath.startsWith("http")) {
//   //     return iconPath;
//   //   }

//   //   try {
//   //     const { data } = await supabase.storage
//   //       .from("badges")
//   //       .getPublicUrl(iconPath);
//   //     return data?.publicUrl || DEFAULT_BADGE_ICON;
//   //   } catch (error) {
//   //     console.error("Error processing badge icon URL:", error);
//   //     return DEFAULT_BADGE_ICON;
//   //   }
//   // };

//   const getBadgeImageUrl = (badge: BadgeType): string => {
//     if (!badge.icon_url) return DEFAULT_BADGE_ICON;
//     if (badge.icon_url.startsWith("http")) return badge.icon_url;

//     const { data } = supabase.storage
//       .from("badges")
//       .getPublicUrl(badge.icon_url);

//     return data?.publicUrl || DEFAULT_BADGE_ICON;
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedImage(file);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await handleAssignBadge(selectedImage || undefined);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <Loader2 className="w-8 h-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
//             <Trophy className="h-5 w-5 text-purple-500" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold">Challenge Badges</h2>
//             <p className="text-muted-foreground">
//               Complete the challenge to earn these badges
//             </p>
//           </div>
//         </div>
//         {isCreator && (
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="gap-2">
//                 <Plus className="w-4 h-4" />
//                 Assign Badge
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <form onSubmit={handleSubmit}>
//                 <DialogHeader>
//                   <DialogTitle>Assign Badge to Challenge</DialogTitle>
//                   <DialogDescription>
//                     Select a badge and optionally upload a custom icon.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="badge">Select Badge</Label>
//                     <Select
//                       value={selectedBadgeId}
//                       onValueChange={setSelectedBadgeId}
//                     >
//                       <SelectTrigger id="badge">
//                         <SelectValue placeholder="Select a badge" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {availableBadges.map((badge) => (
//                           <SelectItem key={badge.id} value={badge.id}>
//                             {badge.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="image">Badge Icon (optional)</Label>
//                     <Input
//                       id="image"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       disabled={isUploading}
//                     />
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button
//                     type="submit"
//                     disabled={!selectedBadgeId || isAssigning || isUploading}
//                   >
//                     {isAssigning || isUploading ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         {isUploading ? "Uploading..." : "Assigning..."}
//                       </>
//                     ) : (
//                       "Assign Badge"
//                     )}
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>

//       {badges.length === 0 ? (
//         <Card className="bg-muted/50 border-0">
//           <CardContent className="flex flex-col items-center justify-center py-8 text-center">
//             <Medal className="w-12 h-12 text-muted-foreground/50 mb-4" />
//             <p className="text-muted-foreground text-lg font-medium">
//               No badges assigned to this challenge yet
//             </p>
//             {isCreator && (
//               <p className="text-muted-foreground text-sm mt-2">
//                 Click "Assign Badge" to add badges that participants can earn
//               </p>
//             )}
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {badges.map((badge) => (
//             <Card
//               key={badge.id}
//               className={cn(
//                 "group transition-all duration-300 border-0",
//                 badge.rarity === "legendary" && "bg-yellow-500/10",
//                 badge.rarity === "epic" && "bg-purple-500/10",
//                 badge.rarity === "rare" && "bg-blue-500/10",
//                 badge.rarity === "common" && "bg-gray-500/10",
//                 isCompleted && "hover:shadow-lg hover:shadow-purple-500/10"
//               )}
//             >
//               <CardHeader>
//                 <div className="flex items-center gap-4">
//                   <div
//                     className={cn(
//                       "relative h-16 w-16 rounded-lg overflow-hidden flex items-center justify-center",
//                       badge.rarity === "legendary" && "bg-yellow-500/20",
//                       badge.rarity === "epic" && "bg-purple-500/20",
//                       badge.rarity === "rare" && "bg-blue-500/20",
//                       badge.rarity === "common" && "bg-gray-500/20"
//                     )}
//                   >
//                     <Image
//                       src={getBadgeImageUrl(badge)}
//                       alt={badge.name}
//                       fill
//                       className="object-cover"
//                       sizes="(max-width: 64px) 100vw, 64px"
//                       onError={(e) => {
//                         const img = e.target as HTMLImageElement;
//                         if (img.src !== DEFAULT_BADGE_ICON) {
//                           img.src = DEFAULT_BADGE_ICON;
//                         }
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <CardTitle className="flex items-center gap-2">
//                       {badge.name}
//                       <span
//                         className={cn(
//                           "text-xs px-2 py-0.5 rounded-full",
//                           badge.rarity === "legendary" &&
//                             "bg-yellow-500/20 text-yellow-500",
//                           badge.rarity === "epic" &&
//                             "bg-purple-500/20 text-purple-500",
//                           badge.rarity === "rare" &&
//                             "bg-blue-500/20 text-blue-500",
//                           badge.rarity === "common" &&
//                             "bg-gray-500/20 text-gray-500"
//                         )}
//                       >
//                         {badge.rarity}
//                       </span>
//                     </CardTitle>
//                     <CardDescription className="mt-1">
//                       {badge.description}
//                     </CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 {isCompleted && (
//                   <Button
//                     className={cn(
//                       "w-full border-0",
//                       badge.rarity === "legendary" &&
//                         "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
//                       badge.rarity === "epic" &&
//                         "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
//                       badge.rarity === "rare" &&
//                         "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
//                       badge.rarity === "common" &&
//                         "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
//                     )}
//                     onClick={() => handleClaimBadge(badge.id)}
//                     disabled={isClaiming}
//                   >
//                     {isClaiming ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Claiming...
//                       </>
//                     ) : (
//                       <>
//                         <Trophy className="w-4 h-4 mr-2" />
//                         Claim Badge
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

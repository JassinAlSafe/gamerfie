// "use client";

// import { memo } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { Star, Users, Gamepad2 } from "lucide-react";
// import { Game } from "@/types/game";
// import { BlurImage } from "./blur-image";
// import { ensureAbsoluteUrl } from "@/lib/utils";

// export interface GameCardProps {
//   game: Game;
//   index: number;
//   inView: boolean;
// }

// const formatNumber = (num: number): string => {
//   if (num >= 1000) {
//     return `${(num / 1000).toFixed(1)}k`;
//   }
//   return num.toString();
// };

// const formatRating = (rating: number | null | undefined): string => {
//   if (!rating || rating === 0) return "";
//   return Math.round(rating).toString();
// };

// export const GameCard = memo(({ game, index, inView }: GameCardProps) => {
//   return (
//     <Link href={`/game/${game.id}`} className="flex-shrink-0 w-[240px] group">
//       <motion.div
//         className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer"
//         whileHover={{
//           scale: 1.05,
//           transition: { duration: 0.3, ease: "easeOut" },
//         }}
//       >
//         {game.cover?.url ? (
//           <BlurImage
//             src={ensureAbsoluteUrl(game.cover.url)}
//             alt={game.name}
//             priority={index < 4}
//             inView={inView}
//           />
//         ) : (
//           <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
//             <Gamepad2 className="w-10 h-10 text-gray-400" />
//           </div>
//         )}

//         {/* Permanent gradient overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

//         {/* Hover gradient overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent opacity-0 group-hover:opacity-80 transition-all duration-300 ease-out" />

//         {/* Game info container */}
//         <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
//           <h3 className="text-base font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
//             {game.name}
//           </h3>

//           <div className="flex items-center gap-4 text-sm">
//             {game.rating ? (
//               <div className="flex items-center text-yellow-300 font-medium">
//                 <Star className="h-4 w-4 mr-1.5 fill-current drop-shadow" />
//                 <span>{formatRating(game.rating)}</span>
//               </div>
//             ) : null}
//             {game.total_rating_count && game.total_rating_count > 0 && (
//               <div className="flex items-center text-gray-200 font-medium">
//                 <Users className="h-4 w-4 mr-1.5 drop-shadow" />
//                 <span>{formatNumber(game.total_rating_count)}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Platform badges could go here if needed */}
//       </motion.div>
//     </Link>
//   );
// });

// GameCard.displayName = "GameCard";

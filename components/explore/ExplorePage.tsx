// import React, { useMemo, Suspense } from "react";
// import dynamic from "next/dynamic";
// import { motion, AnimatePresence } from "framer-motion";
// import { TracingBeam } from "../ui/tracing-beam";
// import { ErrorBoundary } from "react-error-boundary";
// import PopularGamesSection from "../PopularGamesSection";
// import { GAME_CATEGORIES } from "./ExplorePage.definition";
// import { useGameSearch } from "@/hooks/use-game-search";
// import { useGameCategories } from "@/hooks/use-game-categories";
// import HeroSection from "./HeroSection/HeroSection";
// import { Search } from "lucide-react";
// import { Button } from "@/components/ui/button";

// import {
//   GameCategoriesSkeleton,
//   HeroSkeleton,
// } from "./GameCategoriesSkeleton/GameCategoriesSkeleton";
// import { ErrorFallback } from "../games/ui/error-display";

// const BackToTopButton = dynamic(() => import("@/components/BackToTopButton"), {
//   ssr: false,
//   loading: () => null,
// });

// export default function ExplorePage() {
//   const {
//     query: searchQuery,
//     handleSearch,
//     handleSearchChange,
//     handleKeyPress,
//   } = useGameSearch();
//   const { handleCategoryClick } = useGameCategories();

//   const searchButton = useMemo(() => {
//     if (!searchQuery) return null;

//     return (
//       <AnimatePresence>
//         <motion.div
//           initial={{ opacity: 0, x: 10 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 10 }}
//         >
//           <Button
//             onClick={handleSearch}
//             className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500/80 hover:bg-purple-500 text-white 
//                        transition-all duration-200 rounded-xl px-4 py-2 text-sm font-medium
//                        shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
//           >
//             <Search className="w-4 h-4 mr-2" />
//             Search
//           </Button>
//         </motion.div>
//       </AnimatePresence>
//     );
//   }, [searchQuery, handleSearch]);

//   const categoryButtons = useMemo(
//     () => (
//       <div className="mt-6 flex flex-wrap gap-3 justify-center">
//         {GAME_CATEGORIES.map(({ id, label, icon: Icon, color }) => (
//           <Button
//             key={id}
//             variant="ghost"
//             size="sm"
//             className="bg-white/5 hover:bg-white/10 text-gray-300 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
//             onClick={() => handleCategoryClick(id)}
//           >
//             <Icon className={`w-4 h-4 ${color}`} />
//             <span>{label}</span>
//           </Button>
//         ))}
//       </div>
//     ),
//     [handleCategoryClick]
//   );

//   return (
//     <div className="relative min-h-full">
//       <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F15] via-gray-900 to-[#0B0F15] pointer-events-none" />

//       <div className="relative z-10 pt-28 pb-24">
//         <TracingBeam className="px-4">
//           <div className="relative z-10 max-w-7xl mx-auto space-y-12">
//             <Suspense fallback={<HeroSkeleton />}>
//               <HeroSection
//                 searchQuery={searchQuery}
//                 handleSearchChange={handleSearchChange}
//                 handleKeyPress={handleKeyPress}
//                 searchButton={searchButton}
//                 categoryButtons={categoryButtons}
//               />
//             </Suspense>

//             <Suspense fallback={<GameCategoriesSkeleton />}>
//               <div className="space-y-12">
//                 {GAME_CATEGORIES.map(({ id }) => (
//                   <ErrorBoundary
//                     key={id}
//                     FallbackComponent={ErrorFallback}
//                     onReset={() => {
//                       // Reset the error boundary state
//                     }}
//                   >
//                     <PopularGamesSection category={id} />
//                   </ErrorBoundary>
//                 ))}
//               </div>
//             </Suspense>
//           </div>
//         </TracingBeam>

//         <BackToTopButton />
//       </div>
//     </div>
//   );
// }

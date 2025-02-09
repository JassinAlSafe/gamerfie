import { HeroSectionProps } from "./HeroSection.definition";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HeroSection({
  searchQuery,
  handleSearchChange,
  handleKeyPress,
  searchButton,
  categoryButtons,
}: HeroSectionProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-8">
          Discover Your Next Gaming Adventure
        </h1>

        <TextGenerateEffect
          words="Explore trending games, connect with fellow gamers, and keep track of your gaming journey."
          className="text-gray-300 text-xl"
        />

        <div className="relative max-w-2xl mx-auto space-y-8">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white/70 transition-colors duration-200"
              size={24}
            />
            <Input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-14 pr-24 py-7 rounded-full 
                         focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 text-xl
                         hover:bg-white/10 transition-all duration-200 shadow-lg"
            />
            {searchButton}
          </div>

          <div className="pt-2">{categoryButtons}</div>
        </div>
      </motion.div>
    </div>
  );
}

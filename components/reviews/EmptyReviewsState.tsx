import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyReviewsState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="bg-slate-800/30 rounded-full p-6 mb-6">
        <BookOpen className="w-12 h-12 text-slate-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        No Reviews Yet
      </h3>
      
      <p className="text-slate-400 mb-6 max-w-md">
        Be the first to share your gaming experience! Write a review and help other gamers discover great games.
      </p>
      
      <Link href="/games">
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Browse Games to Review
        </Button>
      </Link>
    </motion.div>
  );
}
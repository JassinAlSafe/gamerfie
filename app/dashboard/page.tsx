"use client";

import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import PopularGamesSection from "@/components/PopularGamesSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Library } from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 overflow-hidden flex flex-col items-center justify-start relative w-full" style={{ backgroundColor: "rgb(3, 6, 22"}}>
      <div className="w-full">
        <div className="relative z-10 mb-16 w-full">
          <LampContainer>
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent md:text-7xl"
            >
              Track Games <br /> the right way
            </motion.h1>
          </LampContainer>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex justify-center mb-16 w-full bg-transparent"
        >
          <Link href="/all-games" className="inline-block">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Library className="mr-2 h-5 w-5" />
              View All Games
            </Button>
          </Link>
          
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative z-20 w-full px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-transparent rounded-lg shadow-2xl overflow-hidden" style={{ backgroundColor: "rgb(3, 6, 22"}}>
            <PopularGamesSection />
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background to-background/0 pointer-events-none" />
    </div>
    
  );
};

export default Dashboard;
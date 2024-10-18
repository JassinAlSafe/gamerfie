"use client";
import React from "react";
import { SparklesCore } from "./ui/sparkles";
import { motion } from "framer-motion";
import { TypewriterEffectSmoothDemo } from "./TypeWritter";

export function SparklesPreview() {
  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden rounded-md ">
      <TypewriterEffectSmoothDemo />
      <motion.h1
        initial={{
          opacity: 0,
          y: 0,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 3,
        }}
        className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20"
      >
        Game Vault
      </motion.h1>
      <div>
        <p className="text-xl md:text-2xl mb-8">
          Discover, collect, analyze your games
        </p>
      </div>
      <div className="flex justify-center space-x-8 text-white mb-10">
        <Stat label="Games" value="200K" />

        <Stat label="Played" value="27M" />
        <Stat label="Ratings" value="15.8M" />
        <Stat label="Reviews" value="1.78M" />
        <Stat label="Lists" value="322K" />
      </div>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

"use client"

import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
  IconDeviceGamepad2,
  IconStars,
  IconUsers,
  IconBrain,
  IconPalette,
  IconCompass,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

const IconHeader = ({ Icon, gradient }: { Icon: React.ElementType, gradient: string }) => (
  <div className={`relative w-full h-[200px] rounded-xl overflow-hidden ${gradient}`}>
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Icon className="w-24 h-24 text-white" />
    </motion.div>
  </div>
);

const items = [
  {
    title: "What is Gamerfie",
    description:
      "Gamerfie is a place to virtually track your game collection. Keep your backlog updated, rate the games you've played and add those upcoming to your wishlist.",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
    headerIcon: IconDeviceGamepad2,
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    title: "Track your personal game collection",
    description:
      "Log any and every game you've played, are currently playing, and want to play. Be as detailed as you want with features such as time tracking, daily journaling, platform ownership and more.",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
    headerIcon: IconStars,
    gradient: "bg-gradient-to-br from-blue-500 to-green-500",
  },
  {
    title: "Express your thoughts with reviews",
    description:
      "See what everyone is thinking with reviews. Every game has an average rating comprised of everyone's rating to give you a quality score from a glance. Then once you're ready, add your review to define what the game means to you.",
    icon: <IconSignature className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
    headerIcon: IconSignature,
    gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
  },
  {
    title: "Keep up with the latest from friends",
    description:
      "Follow others for an all-in-one activity feed that will keep you updated with their latest gaming progress. Games, reviews, and lists from friends appear directly on your home page so you don't miss a thing.",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
    headerIcon: IconUsers,
    gradient: "bg-gradient-to-br from-teal-400 to-blue-500",
  },
  {
    title: "The Pursuit of Knowledge",
    description: "Join the quest for understanding and enlightenment.",
    icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
    headerIcon: IconBrain,
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-500",
  },
  {
    title: "The Joy of Creation",
    description: "Experience the thrill of bringing ideas to life.",
    icon: <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
    headerIcon: IconPalette,
    gradient: "bg-gradient-to-br from-pink-400 to-red-500",
  },
  {
    title: "The Spirit of Adventure",
    description: "Embark on exciting journeys and thrilling discoveries.",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
    headerIcon: IconCompass,
    gradient: "bg-gradient-to-br from-green-400 to-cyan-500",
  },
];

export function BentoShowcase() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <BentoGrid className="max-w-7xl mx-auto">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={<IconHeader Icon={item.headerIcon} gradient={item.gradient} />}
            icon={item.icon}
            className={cn(
              i === 3 || i === 6 ? "md:col-span-2" : "",
              "transition-all hover:scale-105 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
            )}
          />
        ))}
      </BentoGrid>
    </div>
  );
}
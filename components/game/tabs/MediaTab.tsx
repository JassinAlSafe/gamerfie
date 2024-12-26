"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Game } from "@/types/game";
import { ScreenshotModal } from "@/components/screenshot-modal";
import { getHighQualityImageUrl } from "@/utils/image-utils";

interface MediaTabProps {
  game: Game;
}

export function MediaTab({ game }: MediaTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScreenshotClick = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  if (!game.screenshots?.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <p className="text-gray-400 text-center">No screenshots available</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {game.screenshots.map((screenshot, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleScreenshotClick(index)}
            >
              <Image
                src={getHighQualityImageUrl(screenshot.url)}
                alt={`Screenshot ${index + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <ScreenshotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        screenshots={game.screenshots}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </>
  );
}

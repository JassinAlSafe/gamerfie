"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

interface GameImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const GameImage: React.FC<GameImageProps> = ({ 
  src, 
  alt, 
  width = 40, 
  height = 40, 
  className = "w-10 h-10 object-cover rounded" 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || imageError) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <Gamepad2 className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        unoptimized={false}
      />
    </div>
  );
};
import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GameCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function GameCoverImage({ src, alt, className }: GameCoverImageProps) {
  const [error, setError] = useState(false);

  // Placeholder gradient background for failed images
  const placeholderStyle = {
    background: "linear-gradient(to bottom right, #1f2937, #111827)",
  };

  return (
    <div
      className={cn(
        "relative aspect-[3/4] overflow-hidden rounded-md",
        className
      )}
      style={error ? placeholderStyle : undefined}
    >
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-all duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center p-4">
            {alt || "Game Cover"}
          </div>
        </div>
      )}
    </div>
  );
}

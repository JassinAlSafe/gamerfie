"use client";

import React, { memo, useState } from "react";
import Image from "next/image";

interface BlurImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  inView?: boolean;
}

export const BlurImage = memo(
  ({ src, alt, priority = false, inView = true }: BlurImageProps) => {
    const [isLoading, setLoading] = useState(true);

    if (!inView) {
      return <div className="absolute inset-0 bg-gray-800 animate-pulse" />;
    }

    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`
        object-cover transition-all duration-300
        ${isLoading ? "scale-110 blur-xl" : "scale-100 blur-0"}
      `}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
        quality={90}
        onLoad={() => setLoading(false)}
      />
    );
  }
);

BlurImage.displayName = "BlurImage";

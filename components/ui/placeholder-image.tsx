import { Trophy } from "lucide-react";
import Image from "next/image";

interface BadgeImageProps {
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

const DEFAULT_BADGE_IMAGE = "/images/default-badge.svg";

export function BadgeImage({ imageUrl, name, size = "md" }: BadgeImageProps) {
  const sizeClass = sizeClasses[size];

  // If no image URL or invalid URL, show placeholder
  if (!imageUrl || imageUrl.includes("example.com")) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gray-800/50 flex items-center justify-center ring-1 ring-border/50`}
      >
        <Trophy className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClass} rounded-full overflow-hidden ring-1 ring-border/50`}
    >
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        onError={(e) => {
          // If image fails to load, replace with default
          const img = e.target as HTMLImageElement;
          if (img.src !== DEFAULT_BADGE_IMAGE) {
            img.src = DEFAULT_BADGE_IMAGE;
          }
        }}
      />
    </div>
  );
}

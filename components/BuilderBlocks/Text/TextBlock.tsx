"use client";

import ASCIIText from "./ASCIIText/ASCIIText";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  className?: string;
  text: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
  variant?: "ghost";
}

export function TextBlock({
  className,
  text,
  asciiFontSize = 4,
  textFontSize = 4,
  textColor = "#9333ea",
  planeBaseHeight = 10,
  enableWaves = true,
}: TextBlockProps) {
  return (
    <div
      className={cn(
        "relative flex-1 min-h-0 w-full",
        "flex items-center justify-center",
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <ASCIIText
          text={text}
          asciiFontSize={asciiFontSize}
          textFontSize={textFontSize}
          textColor={textColor}
          planeBaseHeight={planeBaseHeight}
          enableWaves={enableWaves}
        />
      </div>
    </div>
  );
}

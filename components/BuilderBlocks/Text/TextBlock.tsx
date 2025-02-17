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
  variant = "ghost",
}: TextBlockProps) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <ASCIIText
        text={text}
        asciiFontSize={asciiFontSize}
        textFontSize={textFontSize}
        textColor={textColor}
        planeBaseHeight={planeBaseHeight}
        enableWaves={enableWaves}
      />
    </div>
  );
}

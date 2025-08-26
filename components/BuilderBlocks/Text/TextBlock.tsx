"use client";

import ASCIIText from "./ASCIIText/ASCIIText";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMemo } from "react";
import { formatDisplayDate } from "@/utils/date-formatting";

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
  const { user } = useAuthStore();

  const processedText = useMemo(() => {
    if (!text) return text;

    let processedText = text;

    // Replace user placeholders
    if (user?.profile) {
      // Now we can directly access display_name from the properly typed profile
      processedText = processedText.replace(
        /\{user\.display_name\}/g,
        user.profile.display_name || user.profile.username || "User"
      );
      processedText = processedText.replace(
        /\{user\.username\}/g,
        user.profile.username || "User"
      );
      processedText = processedText.replace(
        /\{user\.email\}/g,
        user.email || "user@example.com"
      );
    } else {
      // Fallback when user is not logged in
      processedText = processedText.replace(/\{user\.display_name\}/g, "Guest");
      processedText = processedText.replace(/\{user\.username\}/g, "Guest");
      processedText = processedText.replace(
        /\{user\.email\}/g,
        "guest@example.com"
      );
    }

    // Add more dynamic replacements as needed
    processedText = processedText.replace(
      /\{date\}/g,
      formatDisplayDate(new Date())
    );
    processedText = processedText.replace(
      /\{time\}/g,
      new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    );

    return processedText;
  }, [text, user]);

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
          text={processedText}
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

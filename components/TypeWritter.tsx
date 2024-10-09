"use client";
import { TypewriterEffectSmooth } from "./ui/TypewriterEffect";
export function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Track",
    },
    {
      text: "your",
    },
    {
      text: "gaming",
    },
    {
      text: "progress",
    },
    {
      text: "with",
    },
    {
      text: "Gamerfly.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center   ">
      <TypewriterEffectSmooth words={words} />
    </div>
  );
}

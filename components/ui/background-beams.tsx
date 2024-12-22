"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateMousePosition = (ev: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      container.style.setProperty("--x", `${x}px`);
      container.style.setProperty("--y", `${y}px`);
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute",
        className
      )}
      style={{
        background: `
          radial-gradient(600px circle at var(--x, 100px) var(--y, 100px),
          rgba(124, 58, 237, 0.15),
          transparent 40%)
        `,
      }}
    />
  );
};

"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!beamsRef.current) return;

    const updateMousePosition = (ev: MouseEvent) => {
      if (!beamsRef.current) return;
      const { clientX, clientY } = ev;
      beamsRef.current.style.setProperty("--x", `${clientX}px`);
      beamsRef.current.style.setProperty("--y", `${clientY}px`);
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute",
        className
      )}
      style={{
        background: `radial-gradient(600px circle at var(--x, 100px) var(--y, 100px),rgba(109, 40, 217, 0.15),transparent 40%)`,
      }}
    />
  );
}; 
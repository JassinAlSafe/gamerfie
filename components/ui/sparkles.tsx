"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SparkleType {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: {
    top: string;
    left: string;
    zIndex: number;
  };
}

export const SparklesCore = ({
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 1000,
  particleColor = "#FFF",
  className,
}: {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  className?: string;
}) => {
  const [sparks, setSparks] = useState<SparkleType[]>([]);
  const [density, setDensity] = useState(particleDensity);
  const frame = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDensity(particleDensity);
  }, [particleDensity]);

  const createSpark = useCallback((): SparkleType => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const containerHeight = containerRef.current?.offsetHeight || 0;

    return {
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      color: particleColor,
      size: Math.random() * (maxSize - minSize) + minSize,
      style: {
        top: Math.random() * containerHeight + "px",
        left: Math.random() * containerWidth + "px",
        zIndex: Math.floor(Math.random() * 3),
      },
    };
  }, [maxSize, minSize, particleColor]);

  useEffect(() => {
    const animate = () => {
      frame.current = requestAnimationFrame(animate);
      const now = Date.now();

      setSparks((prevSparks) => {
        const newSparks = prevSparks.filter(
          (spark) => now - spark.createdAt < 1000
        );

        if (newSparks.length < density) {
          return [...newSparks, createSpark()];
        }

        return newSparks;
      });
    };

    frame.current = requestAnimationFrame(animate);

    return () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [createSpark, density, maxSize, minSize, particleColor]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background }}
    >
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="absolute animate-glow pointer-events-none"
          style={{
            ...spark.style,
            background: spark.color,
            width: `${spark.size}px`,
            height: `${spark.size}px`,
            borderRadius: "50%",
            transform: "scale(0)",
          }}
        />
      ))}
    </div>
  );
};

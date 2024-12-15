"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  particleDensity,
  particleColor,
}: {
  id: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [particles, setParticles] = useState<Array<Particle>>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setContext(ctx);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const particleCount = particleDensity || 50;
    const minParticleSize = minSize || 0.5;
    const maxParticleSize = maxSize || 1.5;

    const newParticles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * (maxParticleSize - minParticleSize) + minParticleSize,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
    }));

    setParticles(newParticles);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [minSize, maxSize, particleDensity]);

  useEffect(() => {
    if (!context || !canvasRef.current) return;

    const animate = () => {
      if (!context || !canvasRef.current) return;
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      particles.forEach((particle) => {
        if (!context || !canvasRef.current) return;

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvasRef.current.width;
        if (particle.x > canvasRef.current.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvasRef.current.height;
        if (particle.y > canvasRef.current.height) particle.y = 0;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particleColor || "#ffffff";
        context.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [context, particles, particleColor]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn("pointer-events-none", className)}
      style={{
        background: background || "transparent",
      }}
    ></canvas>
  );
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
} 
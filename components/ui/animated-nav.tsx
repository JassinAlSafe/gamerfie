"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface AnimatedNavProps {
  items: NavItem[];
  className?: string;
}

export const AnimatedNav = ({ items, className }: AnimatedNavProps) => {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center space-x-6", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative py-2 px-1"
        >
          <span
            className={cn(
              "relative z-10 text-sm transition-colors duration-200",
              pathname === item.href 
                ? "text-white font-medium" 
                : "text-gray-400 hover:text-white"
            )}
          >
            {item.label}
          </span>
          {pathname === item.href && (
            <motion.div
              className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0"
              layoutId="navbar-active"
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
              }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
}; 
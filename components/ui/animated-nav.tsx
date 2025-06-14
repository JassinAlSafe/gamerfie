"use client";

import React from "react";
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
    <>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }
      `}</style>
      <ul className={cn("flex items-center space-x-6", className)} role="menubar">
        {items.map((item) => (
        <li key={item.href} role="none">
          <Link
            href={item.href}
            className="relative py-2 px-1"
            role="menuitem"
            aria-current={pathname === item.href ? 'page' : undefined}
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
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0 animate-slide-in" />
            )}
          </Link>
        </li>
        ))}
      </ul>
    </>
  );
}; 
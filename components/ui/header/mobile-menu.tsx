"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";

export const MobileMenu = React.memo(function MobileMenu() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { closeAllMenus } = useUIStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    const firstFocusableElement = menuRef.current?.querySelector('a, button') as HTMLElement;
    firstFocusableElement?.focus();

    // Trap focus within the menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllMenus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAllMenus]);

  const handleNavigation = (path: string) => {
    router.push(path);
    closeAllMenus();
  };

  return (
    <div 
      ref={menuRef}
      className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10 animate-slide-down"
      style={{
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
      <nav className="px-4 pt-2 pb-4" role="navigation" aria-label="Mobile navigation">
        <Link
          href="/"
          className="block py-2 text-gray-300 hover:text-white"
          onClick={closeAllMenus}
        >
          Home
        </Link>
        <Link
          href="/explore"
          className="block py-2 text-gray-300 hover:text-white"
          onClick={closeAllMenus}
        >
          Explore
        </Link>
        <Link
          href="/all-games"
          className="block py-2 text-gray-300 hover:text-white"
          onClick={closeAllMenus}
        >
          All Games
        </Link>
        <Link
          href="/about"
          className="block py-2 text-gray-300 hover:text-white"
          onClick={closeAllMenus}
        >
          About
        </Link>
        {user ? (
          <>
            <Link
              href="/profile"
              className="block py-2 text-gray-300 hover:text-white"
              onClick={closeAllMenus}
            >
              Profile
            </Link>
            <button
              onClick={() => handleNavigation("/signout")}
              className="block w-full text-left py-2 text-red-400 hover:text-red-300"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleNavigation("/signin")}
              className="block w-full text-left py-2 text-gray-300 hover:text-white"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation("/signup")}
              className="block w-full text-left py-2 text-purple-400 hover:text-purple-300"
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
    </div>
  );
});

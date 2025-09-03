"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { SmartPrefetchLink } from "@/components/ui/navigation/smart-prefetch-link";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/stores/useAuthStoreOptimized";
import { useUIStore } from "@/stores/useUIStore";
import { navigationItems } from "@/config/navigation";
import { performLogout } from "@/lib/auth-logout";

export const MobileMenu = React.memo(function MobileMenu() {
  const router = useRouter();
  const { user } = useAuthUser();
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

  const handleLogout = async () => {
    try {
      closeAllMenus();
      await performLogout('local');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // If logout fails, still close menu and redirect
      router.push('/');
    }
  };

  return (
    <div 
      ref={menuRef}
      className="lg:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10 animate-slideDown shadow-lg"
    >
      <nav className="px-3 sm:px-4 pt-2 pb-4" role="navigation" aria-label="Mobile navigation">
        {navigationItems.map((item) => (
          <SmartPrefetchLink
            key={item.href}
            href={item.href}
            className="block py-2.5 px-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            onClick={closeAllMenus}
            prefetchStrategy="hover"
          >
            {item.label}
          </SmartPrefetchLink>
        ))}
        {user ? (
          <>
            <Link
              href="/profile"
              className="block py-2.5 px-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={closeAllMenus}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2.5 px-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <div className="text-center text-gray-400 text-sm font-medium mb-4">
              Get Started
            </div>
            <button
              onClick={() => handleNavigation("/signin")}
              className="w-full px-4 py-3 text-center rounded-lg text-gray-300 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-gray-900 font-medium"
              aria-label="Sign in to your account"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation("/signup")}
              className="w-full px-4 py-3 text-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 focus:ring-offset-gray-900 font-medium"
              aria-label="Create a new account"
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>
    </div>
  );
});

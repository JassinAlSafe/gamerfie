"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import { AnimatedNav } from "../animated-nav";
import { SearchDialog } from "@/components/ui/search/search-dialog";
import { AuthButtons } from "./auth-buttons";
import { MobileMenu } from "./mobile-menu";
import { Button } from "@/components/ui/button";

export default function FloatingHeader() {
  const { initialize, isInitialized, checkUser, user } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize auth state once
  useEffect(() => {
    const initAuth = async () => {
      if (!hasInitialized && !isInitialized) {
        try {
          await initialize();
          // Only check user after successful initialization
          await checkUser();
        } catch (error) {
          // Silently fail initialization - user might not be logged in
          console.debug(
            "Auth initialization failed (user might not be logged in):",
            error
          );
        } finally {
          setHasInitialized(true);
        }
      }
    };

    initAuth();
  }, [initialize, isInitialized, checkUser, hasInitialized]);

  // Refresh user state periodically only if user is logged in and initialized
  useEffect(() => {
    if (!hasInitialized || !user) return;

    const interval = setInterval(async () => {
      try {
        await checkUser();
      } catch (error) {
        // Silently handle periodic check failures
        console.debug("Periodic auth check failed:", error);
      }
    }, 10 * 60 * 1000); // Check every 10 minutes only for logged in users

    return () => clearInterval(interval);
  }, [checkUser, hasInitialized, user]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigationItems = useMemo(() => [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/all-games", label: "All Games" },
    { href: "/info/about", label: "About" },
  ], []);

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleSearchToggle = useCallback((open: boolean) => {
    setIsSearchOpen(open);
  }, []);

  const renderMobileMenuButton = useMemo(() => (
    <Button
      onClick={toggleMobileMenu}
      variant="ghost"
      className="lg:hidden p-1 sm:p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-gray-900"
      aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      aria-expanded={isMobileMenuOpen}
    >
      {isMobileMenuOpen ? (
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      ) : (
        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
    </Button>
  ), [isMobileMenuOpen, toggleMobileMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 header-fixed">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 header-backdrop">
        <div className="container mx-auto max-w-[1920px] header-container px-4 sm:px-6 md:px-6 lg:px-8">
          <div className="relative flex header-height h-16 items-center justify-between">
            <Link
              href="/"
              className="font-bold text-xl sm:text-xl md:text-2xl text-white/90 hover:text-white transition-colors duration-200 shrink-0"
            >
              <span className="hidden xs:inline">GAME VAULT</span>
              <span className="inline xs:hidden">GV</span>
            </Link>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-6">
              <div className="flex-1 max-w-[300px]">
                <Button
                  variant="ghost"
                  className="relative w-full h-10 justify-start text-sm text-muted-foreground pr-12"
                  onClick={handleSearchOpen}
                >
                  Search games...
                  <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>
              <SearchDialog
                open={isSearchOpen}
                onOpenChange={handleSearchToggle}
              />
              <nav className="hidden lg:flex items-center" role="navigation" aria-label="Main navigation">
                <AnimatedNav items={navigationItems} />
              </nav>
              <AuthButtons />
            </div>

            {/* Mobile Layout */}
            <div className="flex md:hidden items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchOpen}
                className="p-2 text-gray-400 hover:text-white"
                aria-label="Search games"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
              <SearchDialog
                open={isSearchOpen}
                onOpenChange={handleSearchToggle}
              />
              {renderMobileMenuButton}
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && <MobileMenu />}
    </header>
  );
}

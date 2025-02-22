"use client";

import React, { useEffect, useState } from "react";
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
  const { initialize, isInitialized, user } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Debug logging
  useEffect(() => {
    console.log("FloatingHeader auth state:", { user, isInitialized });
  }, [user, isInitialized]);

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

  const renderMobileMenuButton = () => (
    <Button
      onClick={toggleMobileMenu}
      variant="ghost"
      className="md:hidden p-2 text-gray-400 hover:text-white"
    >
      {isMobileMenuOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </Button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link
            href="/"
            className="font-bold text-2xl text-white/90 hover:text-white transition-colors duration-200 ml-10"
          >
            GAME VAULT
          </Link>

          <div className="flex items-center gap-6 ml-auto">
            <Button
              variant="ghost"
              className="relative w-full h-10 justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
              onClick={() => setIsSearchOpen(true)}
            >
              <span className="hidden lg:inline-flex">Search games...</span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />

            <nav className="hidden md:flex items-center gap-6">
              <AnimatedNav
                items={[
                  { href: "/", label: "Home" },
                  { href: "/explore", label: "Explore" },
                  { href: "/all-games", label: "All Games" },
                  { href: "/about", label: "About" },
                ]}
              />
            </nav>
            <AuthButtons />
          </div>

          {renderMobileMenuButton()}
        </div>
      </div>

      {isMobileMenuOpen && <MobileMenu />}
    </header>
  );
}

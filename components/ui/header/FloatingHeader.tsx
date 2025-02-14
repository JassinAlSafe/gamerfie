"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import { AnimatedNav } from "../animated-nav";
import { SearchBar } from "./search-bar";
import { AuthButtons } from "./auth-buttons";
import { MobileMenu } from "./mobile-menu";

export function FloatingHeader() {
  const { checkUser } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const renderMobileMenuButton = () => (
    <button
      onClick={toggleMobileMenu}
      className="md:hidden p-2 text-gray-400 hover:text-white"
    >
      {isMobileMenuOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-bold text-2xl text-white/90 hover:text-white transition-colors duration-200"
          >
            GAME VAULT
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <AnimatedNav
              items={[
                { href: "/", label: "Home" },
                { href: "/explore", label: "Explore" },
                { href: "/all-games", label: "All Games" },
                { href: "/about", label: "About" },
              ]}
            />
            <SearchBar />
            <AuthButtons />
          </div>

          {renderMobileMenuButton()}
        </div>
      </div>

      {isMobileMenuOpen && <MobileMenu />}
    </header>
  );
}

export default FloatingHeader;

"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, Gamepad2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useSearchStore } from "@/stores/useSearchStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import { ProfileDropdown } from "./profile-dropdown";
import { AnimatedNav } from "./animated-nav";
import { AnimatedButton } from "./animated-button";
import { motion } from "framer-motion";

// Add this utility function near the top of the file
const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
};

export const FloatingHeader: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const {
    query,
    results: searchResults,
    isLoading: isSearching,
    isOpen: searchOpen,
    setQuery,
    search,
    setIsOpen,
    reset,
  } = useSearchStore();
  const { user, signOut, checkUser } = useAuthStore();
  const {
    isMobileMenuOpen,
    isProfileMenuOpen,
    toggleMobileMenu,
    closeAllMenus,
  } = useUIStore();

  // Check auth status on mount and route changes
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
      toast({
        title: "Signed out",
        description: "Successfully signed out",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleLogIn = () => {
    router.push("/signin");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileButtonRef.current &&
        profileMenuRef.current &&
        !profileButtonRef.current.contains(event.target as Node) &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        if (isProfileMenuOpen) {
          closeAllMenus();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen, closeAllMenus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, search]);

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

            <motion.div
              className="relative w-full md:w-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Popover
                open={searchOpen}
                onOpenChange={(open) => {
                  if (!open && !query) {
                    setIsOpen(false);
                  } else {
                    setIsOpen(true);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div className="relative group">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white/70 transition-colors duration-200"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search games..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                      }}
                      onFocus={() => setIsOpen(true)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full md:w-[300px] bg-white/10 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-full 
                                focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/20
                                hover:bg-white/15 transition-all duration-200"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Search className="w-4 h-4 text-purple-400" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-xl"
                  align="start"
                  sideOffset={5}
                >
                  <Command className="bg-transparent">
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-sm">
                        {isSearching ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Search className="w-4 h-4 text-purple-400" />
                            </motion.div>
                            <span className="text-gray-400">Searching...</span>
                          </div>
                        ) : query.length < 3 ? (
                          <span className="text-gray-400">Type at least 3 characters to search...</span>
                        ) : (
                          <span className="text-gray-400">No results found.</span>
                        )}
                      </CommandEmpty>
                      {searchResults && searchResults.length > 0 && (
                        <CommandGroup heading="Games" className="text-gray-400">
                          {searchResults.map((game) => (
                            <motion.div
                              key={game.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer text-white transition-colors duration-200"
                              onClick={() => {
                                router.push(`/game/${game.id}`);
                                reset();
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  router.push(`/game/${game.id}`);
                                  reset();
                                }
                              }}
                            >
                              {game.cover ? (
                                <div className="relative w-10 h-14 rounded overflow-hidden">
                                  <Image
                                    src={ensureAbsoluteUrl(game.cover.url)}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-14 rounded bg-gray-800 flex items-center justify-center">
                                  <Gamepad2 className="w-5 h-5 text-gray-600" />
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-200">
                                  {game.name}
                                </span>
                                {game.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs text-gray-400">
                                      {Math.round(game.rating)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </motion.div>

            <div className="flex items-center space-x-4">
              {user ? (
                <ProfileDropdown user={user} onSignOut={handleSignOut} />
              ) : (
                <div className="flex items-center space-x-4">
                  <AnimatedButton
                    variant="ghost"
                    onClick={handleLogIn}
                  >
                    Sign In
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={handleSignUp}
                  >
                    Sign Up
                  </AnimatedButton>
                </div>
              )}
            </div>
          </div>

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
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10">
          <nav className="px-4 pt-2 pb-4">
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
                  onClick={() => {
                    handleSignOut();
                    closeAllMenus();
                  }}
                  className="block w-full text-left py-2 text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleLogIn();
                    closeAllMenus();
                  }}
                  className="block w-full text-left py-2 text-gray-300 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    handleSignUp();
                    closeAllMenus();
                  }}
                  className="block w-full text-left py-2 text-purple-400 hover:text-purple-300"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href,
  children,
  ...props
}) => (
  <Link
    href={href ?? "/"}
    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
    {...props}
  >
    {children}
  </Link>
);

export default FloatingHeader;

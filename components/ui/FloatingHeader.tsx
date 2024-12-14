"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  User,
  Settings,
  Heart,
  LogOut,
  Gamepad2,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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
import { useSearchStore } from '@/stores/useSearchStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';

// Add this utility function near the top of the file
const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
};

// Add this new component for the profile menu items
interface ProfileMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

const ProfileMenuItem = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: ProfileMenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors duration-200
      ${
        variant === "danger"
          ? "text-red-400 hover:text-red-300"
          : "text-gray-300 hover:text-white"
      }`}
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
  </button>
);

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
    reset
  } = useSearchStore();
  const {
    user,
    signOut,
    checkUser
  } = useAuthStore()
  const {
    isMobileMenuOpen,
    isProfileMenuOpen,
    toggleMobileMenu,
    toggleProfileMenu,
    closeAllMenus
  } = useUIStore();

  // Check auth status on mount and route changes
  useEffect(() => {
    checkUser()
  }, [checkUser])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
      toast({
        title: "Signed out",
        description: "Successfully signed out",
      })
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleLogIn = () => {
    router.push("/signin");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", query);
  };

  const getUserInitial = () => {
    if (user && user.user_metadata && user.user_metadata.name) {
      return user.user_metadata.name[0].toUpperCase();
    }
    if (user && user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, closeAllMenus]);

  const handleProfileClick = () => {
    toggleProfileMenu();
  };

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
            <nav className="flex items-center space-x-6">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/dashboard">Games</NavLink>
              <NavLink href="/about">About</NavLink>
            </nav>

            <div className="relative w-full md:w-auto">
              <Popover open={searchOpen} onOpenChange={(open) => {
                if (!open && !query) {
                  setIsOpen(false);
                } else {
                  setIsOpen(true);
                }
              }}>
                <PopoverTrigger>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                                focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/20"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0 bg-gray-900/95 backdrop-blur-md border border-gray-700"
                  align="start"
                  sideOffset={5}
                >
                  <Command className="bg-transparent">
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-sm text-gray-400">
                        {isSearching ? (
                          <div className="flex items-center justify-center gap-2">
                            <span>Searching...</span>
                          </div>
                        ) : (
                          searchResults?.length === 0 && query.length >= 3 && "No results found."
                        )}
                      </CommandEmpty>
                      {searchResults && searchResults.length > 0 && (
                        <CommandGroup heading="Games" className="text-gray-400">
                          {searchResults.map((game) => (
                            <div
                              key={game.id}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer text-white"
                              onClick={() => {
                                router.push(`/game/${game.id}`);
                                reset();
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  router.push(`/game/${game.id}`);
                                  reset();
                                }
                              }}
                            >
                              {game.cover ? (
                                <div className="relative w-8 h-8 rounded overflow-hidden">
                                  <Image
                                    src={ensureAbsoluteUrl(game.cover.url)}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                                  <Gamepad2 className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <span className="text-sm text-gray-200">
                                {game.name}
                              </span>
                            </div>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {user ? (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProfileMenu();
                  }}
                  className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 rounded-lg transition duration-200"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={user.user_metadata.avatar_url || "/default-avatar.png"}
                      alt="Profile"
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isProfileMenuOpen && (
                  <div
                    ref={profileMenuRef}
                    className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center">
                          {getUserInitial()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            {user.user_metadata?.name ||
                              user.email?.split("@")[0]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1.5">
                      <ProfileMenuItem
                        icon={User}
                        label="Your Profile"
                        onClick={() => {
                          router.push("/profile");
                          closeAllMenus();
                        }}
                      />
                      <ProfileMenuItem
                        icon={Settings}
                        label="Settings"
                        onClick={() => {
                          router.push("/settings");
                          closeAllMenus();
                        }}
                      />
                      <ProfileMenuItem
                        icon={Heart}
                        label="Your Library"
                        onClick={() => {
                          router.push("/profile/games");
                          closeAllMenus();
                        }}
                      />
                    </div>

                    <div className="h-px bg-white/10 my-1" />

                    <div className="py-1.5">
                      <ProfileMenuItem
                        icon={LogOut}
                        label="Sign Out"
                        onClick={() => {
                          handleSignOut();
                          closeAllMenus();
                        }}
                        variant="danger"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogIn}
                  className="text-gray-300 hover:text-white font-medium transition duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={handleSignUp}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-1.5 rounded-full transition duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              toggleMobileMenu();
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden container mx-auto" onClick={(e) => e.stopPropagation()}>
          <nav className="flex flex-col items-center py-4 space-y-4">
            <NavLink href="/" onClick={toggleMobileMenu}>
              Home
            </NavLink>
            <NavLink href="/dashboard" onClick={toggleMobileMenu}>
              Games
            </NavLink>
            <NavLink href="/about" onClick={toggleMobileMenu}>
              About
            </NavLink>

            <form onSubmit={handleSearch} className="relative w-full px-4">
              <input
                type="text"
                placeholder="Search games..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-2 pr-10 rounded-full 
                          focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/20"
              />
              <button
                type="submit"
                className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Search size={16} />
              </button>
            </form>

            {user ? (
              <div className="flex flex-col items-center space-y-4 w-full px-4">
                <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center text-white">
                  {getUserInitial()}
                </div>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white font-medium transition duration-200"
                  onClick={toggleMobileMenu}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-300 hover:text-white font-medium transition duration-200"
                  onClick={toggleMobileMenu}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    toggleMobileMenu();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-red-400 hover:text-red-300 font-medium 
                           py-2 px-4 rounded-full transition duration-200 w-full max-w-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 w-full px-4">
                <button
                  onClick={() => {
                    handleLogIn();
                    toggleMobileMenu();
                  }}
                  className="text-gray-300 hover:text-white font-medium transition duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    handleSignUp();
                    toggleMobileMenu();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium 
                           py-2 px-4 rounded-full transition duration-200 w-full max-w-xs"
                >
                  Sign Up
                </button>
              </div>
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

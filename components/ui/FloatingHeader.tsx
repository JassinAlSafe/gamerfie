"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";

const FloatingHeader: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const supabase = createClientComponentClient();

  // Check auth status on mount and route changes
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "Successfully signed in",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "Successfully signed out",
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, toast]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsProfileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
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
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link
            href="/"
            className="font-bold text-3xl text-white hover:text-blue-300 transition-colors duration-200"
          >
            GAME VAULT
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/dashboard">Games</NavLink>
              <NavLink href="/about">About</NavLink>
            </nav>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-blue-800/50 text-white px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 w-48 transition-all duration-300 focus:w-64"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Search size={18} />
              </button>
            </form>
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  ref={profileButtonRef}
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold">
                    {getUserInitial()}
                  </div>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogIn}
                  className="text-white hover:text-blue-300 font-semibold transition duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={handleSignUp}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          <button
            className="md:hidden text-white hover:text-blue-300 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-blue-900/95 backdrop-blur-sm">
          <nav className="flex flex-col items-center py-6 space-y-4">
            <NavLink href="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>
              Games
            </NavLink>
            <NavLink href="/about" onClick={() => setIsMenuOpen(false)}>
              About
            </NavLink>
            <form onSubmit={handleSearch} className="relative w-full px-4">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-blue-800/50 text-white px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Search size={18} />
              </button>
            </form>
            {user ? (
              <div className="flex flex-col items-center space-y-4 w-full px-4">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                  {getUserInitial()}
                </div>
                <Link
                  href="/profile"
                  className="text-white hover:text-blue-300 font-semibold transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-white hover:text-blue-300 font-semibold transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 transform hover:scale-105 w-full max-w-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleLogIn();
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:text-blue-300 font-semibold transition duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    handleSignUp();
                    setIsMenuOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 transform hover:scale-105 w-full max-w-xs"
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
    className="text-white hover:text-blue-300 transition-colors duration-200 text-lg font-medium"
    {...props}
  >
    {children}
  </Link>
);

export default FloatingHeader;

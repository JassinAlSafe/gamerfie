"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, User, Settings, Heart, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";

// Add this new component for the profile menu items
interface ProfileMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const ProfileMenuItem = ({ icon: Icon, label, onClick, variant = 'default' }: ProfileMenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors duration-200
      ${variant === 'danger' ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'}`}
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
  </button>
);

const FloatingHeader: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
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
    <header className="fixed top-0 left-0 right-0 bg-gray-900/70 backdrop-blur-md border-b border-white/10 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 text-white placeholder-gray-400 px-4 py-1.5 pr-10 rounded-full 
                          focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/20
                          w-48 transition-all duration-300 focus:w-64"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                <Search size={16} />
              </button>
            </form>

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  ref={profileButtonRef}
                  onClick={toggleProfileMenu}
                  className="group flex items-center space-x-2 focus:outline-none"
                >
                  <div className="relative">
                    <div className="bg-white/10 group-hover:bg-white/20 transition-all duration-200 
                                  rounded-full w-9 h-9 flex items-center justify-center text-white font-semibold
                                  ring-2 ring-transparent group-hover:ring-purple-500/50">
                      {getUserInitial()}
                    </div>
                    {/* Online status indicator */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full 
                                  ring-2 ring-gray-900/70" />
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-md rounded-lg 
                                border border-white/10 shadow-xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                    {/* User Info Section */}
                    <div className="px-4 py-2 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center">
                          {getUserInitial()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            {user.user_metadata?.name || user.email?.split('@')[0]}
                          </span>
                          <span className="text-xs text-gray-400">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <ProfileMenuItem
                        icon={User}
                        label="Your Profile"
                        onClick={() => {
                          router.push('/profile');
                          setIsProfileMenuOpen(false);
                        }}
                      />
                      <ProfileMenuItem
                        icon={Settings}
                        label="Settings"
                        onClick={() => {
                          router.push('/settings');
                          setIsProfileMenuOpen(false);
                        }}
                      />
                      <ProfileMenuItem
                        icon={Heart}
                        label="Your Library"
                        onClick={() => {
                          router.push('/profile/games');
                          setIsProfileMenuOpen(false);
                        }}
                      />
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/10 my-1" />

                    {/* Sign Out Button */}
                    <div className="py-1.5">
                      <ProfileMenuItem
                        icon={LogOut}
                        label="Sign Out"
                        onClick={() => {
                          handleSignOut();
                          setIsProfileMenuOpen(false);
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10">
          <nav className="flex flex-col items-center py-4 space-y-4">
            <NavLink href="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>Games</NavLink>
            <NavLink href="/about" onClick={() => setIsMenuOpen(false)}>About</NavLink>
            
            <form onSubmit={handleSearch} className="relative w-full px-4">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-2 pr-10 rounded-full 
                          focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/20"
              />
              <button type="submit" className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
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
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-300 hover:text-white font-medium transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
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
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white font-medium transition duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    handleSignUp();
                    setIsMenuOpen(false);
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

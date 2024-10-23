"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface HeaderProps {
  session: Session | null;
}

const Header: React.FC<HeaderProps> = ({ session }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

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

  const handleSignOut = async () => {
    try {
      const response = await fetch("/auth/signout", { method: "POST" });
      if (response.ok) {
        console.log("User signed out successfully");
        router.refresh();
      } else {
        console.error("Sign out failed");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link
            href="/"
            className="font-bold text-3xl text-white hover:text-blue-300 transition-colors duration-200"
          >
            GAME VAULT
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/dashboard">Games</NavLink>
            <NavLink href="/profile">Profile</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
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
            {session ? (
              <>
                <span>Signed in as {session.user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 transform hover:scale-105"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
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
              </>
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
            <NavLink href="/profile" onClick={() => setIsMenuOpen(false)}>
              Profile
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
            {session ? (
              <>
                <span>Signed in as {session.user.email}</span>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 transform hover:scale-105 w-full max-w-xs"
                >
                  Sign Out
                </button>
              </>
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

export default Header;

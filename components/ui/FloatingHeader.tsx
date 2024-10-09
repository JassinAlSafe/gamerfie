"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const FloatingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="font-bold text-2xl text-white hover:text-blue-400 transition-colors duration-200"
          >
            GAMERFLY
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/dashboard">Games</NavLink>
            <NavLink href="/profile">Profile</NavLink>
            <NavLink href="/about">About</NavLink>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800/50 text-white px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={18} />
              </button>
            </form>
            <button
              onClick={handleLogIn}
              className="text-white hover:text-blue-400 font-semibold transition duration-200"
            >
              Log In
            </button>
            <button
              onClick={handleSignUp}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Sign Up
            </button>
          </nav>
          <button
            className="md:hidden text-white hover:text-blue-400 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm">
          <nav className="flex flex-col items-center py-4 space-y-4">
            <NavLink href="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink href="/games" onClick={() => setIsMenuOpen(false)}>
              Games
            </NavLink>
            <NavLink href="/profile" onClick={() => setIsMenuOpen(false)}>
              Profile
            </NavLink>
            <NavLink href="/about" onClick={() => setIsMenuOpen(false)}>
              About
            </NavLink>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800/50 text-white px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={18} />
              </button>
            </form>
            <button
              onClick={() => {
                handleLogIn();
                setIsMenuOpen(false);
              }}
              className="text-white hover:text-blue-400 font-semibold transition duration-200"
            >
              Log In
            </button>
            <button
              onClick={() => {
                handleSignUp();
                setIsMenuOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Sign Up
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ href, children, ...props }) => (
  <Link
    href={href}
    className="text-white hover:text-blue-400 transition-colors duration-200"
    {...props}
  >
    {children}
  </Link>
);

export default FloatingHeader;
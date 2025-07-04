"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Star, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";

interface GameReview {
  id: string;
  user: {
    username: string;
  };
  game_details?: {
    name: string;
    genres?: string[];
  };
  review_text?: string;
  rating: number;
}

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  reviews: GameReview[];
  placeholder?: string;
  className?: string;
}

export function SearchWithSuggestions({ 
  value, 
  onChange, 
  reviews, 
  placeholder = "Search reviews, games, or users...",
  className 
}: SearchWithSuggestionsProps) {
  const [, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate suggestions based on current input
  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return { games: [], users: [], recentSearches: [] };

    const query = value.toLowerCase();
    const gameNames = new Set<string>();
    const usernames = new Set<string>();

    reviews.forEach(review => {
      // Collect game names
      if (review.game_details?.name?.toLowerCase().includes(query)) {
        gameNames.add(review.game_details.name);
      }
      
      // Collect usernames
      if (review.user.username.toLowerCase().includes(query)) {
        usernames.add(review.user.username);
      }
    });

    return {
      games: Array.from(gameNames).slice(0, 4),
      users: Array.from(usernames).slice(0, 3),
      recentSearches: [] // Could be implemented with localStorage
    };
  }, [value, reviews]);

  const hasSuggestions = suggestions.games.length > 0 || suggestions.users.length > 0;

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length >= 2);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    onChange("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (value.length >= 2) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          className="pl-12 bg-gray-800/50 border-gray-700/50 h-12 text-white placeholder:text-gray-400 transition-all duration-200 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && hasSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* Games Section */}
            {suggestions.games.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <Star className="w-3 h-3" />
                  Games
                </div>
                {suggestions.games.map((game, index) => (
                  <button
                    key={`game-${index}`}
                    onClick={() => handleSuggestionClick(game)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/50 rounded transition-colors flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    {game}
                  </button>
                ))}
              </div>
            )}

            {/* Users Section */}
            {suggestions.users.length > 0 && (
              <div className="p-2 border-t border-gray-700/30">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <User className="w-3 h-3" />
                  Users
                </div>
                {suggestions.users.map((username, index) => (
                  <button
                    key={`user-${index}`}
                    onClick={() => handleSuggestionClick(username)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/50 rounded transition-colors flex items-center gap-2"
                  >
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                      {username[0].toUpperCase()}
                    </div>
                    {username}
                  </button>
                ))}
              </div>
            )}

            {/* Quick tip */}
            <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700/30">
              <p className="text-xs text-gray-500">
                Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Enter</kbd> to search
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
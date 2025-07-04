"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Gamepad2, Star, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Game } from "@/types/game";

interface GameSearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  games: Game[];
  placeholder?: string;
  className?: string;
}

export function GameSearchWithSuggestions({ 
  value, 
  onChange, 
  games, 
  placeholder = "Search games...",
  className 
}: GameSearchWithSuggestionsProps) {
  const [, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate suggestions based on current input
  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return { games: [], genres: [], developers: [] };

    const query = value.toLowerCase();
    const gameMatches: Game[] = [];
    const genreSet = new Set<string>();
    const developerSet = new Set<string>();

    games.forEach(game => {
      // Collect matching games
      if (game.name?.toLowerCase().includes(query)) {
        gameMatches.push(game);
      }
      
      // Collect matching genres
      game.genres?.forEach(genre => {
        if (genre.name?.toLowerCase().includes(query)) {
          genreSet.add(genre.name);
        }
      });

      // Collect matching developers from involved_companies
      if ((game as any).involved_companies) {
        (game as any).involved_companies.forEach((company: any) => {
          if (company.developer && company.company?.name?.toLowerCase().includes(query)) {
            developerSet.add(company.company.name);
          }
        });
      }
    });

    return {
      games: gameMatches.slice(0, 5),
      genres: Array.from(genreSet).slice(0, 3),
      developers: Array.from(developerSet).slice(0, 3)
    };
  }, [value, games]);

  const hasSuggestions = suggestions.games.length > 0 || suggestions.genres.length > 0 || suggestions.developers.length > 0;

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

  const formatReleaseYear = (game: Game) => {
    if (game.first_release_date) {
      return new Date(game.first_release_date * 1000).getFullYear();
    }
    return null;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (value.length >= 2) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-gray-800/70 border-gray-700/50 focus:border-purple-500/50 transition-colors pl-10 pr-10 rounded-full h-10 placeholder:text-gray-500"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-700/50 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
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
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto"
          >
            {/* Games Section */}
            {suggestions.games.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <Gamepad2 className="w-3 h-3" />
                  Games
                </div>
                {suggestions.games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleSuggestionClick(game.name)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700/50 rounded transition-colors flex items-center gap-3"
                  >
                    {/* Game Cover */}
                    <div className="w-8 h-10 bg-gray-700 rounded flex-shrink-0 overflow-hidden relative">
                      {game.cover_url ? (
                        <Image 
                          src={game.cover_url} 
                          alt=""
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Game Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-200 font-medium truncate">{game.name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {game.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{game.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {formatReleaseYear(game) && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatReleaseYear(game)}</span>
                          </div>
                        )}
                        {game.platforms && game.platforms.length > 0 && (
                          <span className="truncate">
                            {game.platforms.slice(0, 2).map(p => p.name).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Genres Section */}
            {suggestions.genres.length > 0 && (
              <div className="p-2 border-t border-gray-700/30">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <div className="w-3 h-3 bg-purple-400 rounded-full" />
                  Genres
                </div>
                {suggestions.genres.map((genre, index) => (
                  <button
                    key={`genre-${index}`}
                    onClick={() => handleSuggestionClick(genre)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/50 rounded transition-colors flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    {genre}
                  </button>
                ))}
              </div>
            )}

            {/* Developers Section */}
            {suggestions.developers.length > 0 && (
              <div className="p-2 border-t border-gray-700/30">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <Clock className="w-3 h-3" />
                  Developers
                </div>
                {suggestions.developers.map((developer, index) => (
                  <button
                    key={`dev-${index}`}
                    onClick={() => handleSuggestionClick(developer)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/50 rounded transition-colors flex items-center gap-2"
                  >
                    <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center text-xs text-white">
                      {developer[0].toUpperCase()}
                    </div>
                    {developer}
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
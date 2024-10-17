"use client";

import React, { useState, useCallback, useRef } from "react";
import { FetchedGame } from "@/lib/igdb";
import { Input } from "@/components/ui/input";
import { Gamepad2, Search } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface IGDBSearchProps {
  onSelect: (game: FetchedGame) => void;
  onSearch?: (term: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  resultsClassName?: string;
  iconClassName?: string;
}

export default function IGDBSearch({
  onSelect,
  onSearch,
  placeholder = "Search for a game...",
  className = "",
  inputClassName = "",
  resultsClassName = "",
  iconClassName = "",
}: IGDBSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<FetchedGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchGames = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowResults(true);

    try {
      const response = await axios.post("/api/igdb-search", {
        searchTerm: term,
      });
      setResults(response.data);
    } catch (err) {
      console.error("Error searching games:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchGames(searchTerm);
      if (onSearch) onSearch(searchTerm);
    }
  };

  const handleSelectGame = (game: FetchedGame) => {
    onSelect(game);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleSearchClick = () => {
    searchGames(searchTerm);
    if (onSearch) onSearch(searchTerm);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className={`w-full pl-10 pr-4 ${inputClassName}`}
          ref={searchInputRef}
        />
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${iconClassName}`}
          onClick={handleSearchClick}
        />
      </div>
      {showResults && (
        <div
          className={`absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-96 overflow-y-auto ${resultsClassName}`}
        >
          {isLoading && (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          )}
          {error && <div className="p-4 text-center text-red-500">{error}</div>}
          {!isLoading && !error && results.length === 0 && searchTerm && (
            <div className="p-4 text-center text-gray-400">
              No results found
            </div>
          )}
          {results.map((game) => (
            <div
              key={game.id}
              className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelectGame(game)}
            >
              {game.cover ? (
                <Image
                  src={game.cover.url.replace("t_thumb", "t_cover_small")}
                  alt={game.name}
                  width={45}
                  height={60}
                  className="rounded-md mr-3"
                />
              ) : (
                <div className="w-[45px] h-[60px] bg-gray-600 rounded-md mr-3 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-white">{game.name}</h3>
                {game.first_release_date && (
                  <p className="text-xs text-gray-400">
                    {new Date(game.first_release_date * 1000).getFullYear()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

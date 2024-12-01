"use client"; // For Next.js App Router if needed

import React, { useState } from "react";
import { fetchNewToken } from "../services/tokenService";
import { clearAuthCookies } from "../utils/cookieUtils";
import { TokenError } from "../types/auth";

const FetchTokenButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TokenError | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFetchToken = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await fetchNewToken();
      setMessage("Token fetched successfully!");
    } catch (err) {
      setError({ message: (err as Error).message });
      console.error("Error fetching token:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCookies = () => {
    clearAuthCookies();
    setMessage("Cookies cleared. Ready to fetch new token.");
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleFetchToken}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                   text-white py-2 px-4 rounded transition-colors"
      >
        {loading ? "Fetching Token..." : "Fetch Token"}
      </button>

      <button
        onClick={handleClearCookies}
        className="bg-red-500 hover:bg-red-600 
                   text-white py-2 px-4 rounded transition-colors"
      >
        Clear Cookies
      </button>

      {error && <p className="text-red-500">{error.message}</p>}
      {message && <p className="text-green-500">{message}</p>}
    </div>
  );
};

export default FetchTokenButton;

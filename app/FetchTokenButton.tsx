"use client"; // For Next.js App Router if needed

import React, { useState } from "react";

const FetchTokenButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Function to fetch the token from /api/auth
  async function fetchToken() {
    setLoading(true);
    setError(null);
    setMessage(null);

    // Check if token already exists and is still valid
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    const tokenExpiry = document.cookie
      .split("; ")
      .find((row) => row.startsWith("tokenExpiry="))
      ?.split("=")[1];

    if (token && tokenExpiry && new Date(tokenExpiry) > new Date()) {
      console.log("Token already exists and is still valid:", token);
      setMessage("Token already exists and is valid.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`Error fetching token: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.accessToken) {
        throw new Error("Invalid response from server");
      }
      setMessage("Token fetched successfully!");
      console.log("Token fetched successfully:", data);
    } catch (error) {
      console.error("Error fetching token:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Function to clear the cookies for testing
  const clearCookies = () => {
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "tokenExpiry=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log("Cookies cleared");
    setMessage("Cookies cleared. Ready to fetch new token.");
  };

  return (
    <div>
      <button
        onClick={fetchToken}
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        {loading ? "Fetching Token..." : "Fetch Token"}
      </button>

      <button
        onClick={clearCookies}
        className="bg-red-500 text-white py-2 px-4 rounded mt-4"
      >
        Clear Cookies
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {message && <p className="text-green-500 mt-2">{message}</p>}
    </div>
  );
};

export default FetchTokenButton;

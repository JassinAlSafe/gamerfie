"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Profile page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Profile Error
          </h1>
          
          <p className="text-gray-400 mb-6">
            Something went wrong while loading your profile. This could be due to a temporary connection issue or a problem with your profile data.
          </p>

          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && error.digest && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
              <p className="text-xs text-gray-500 font-mono">
                Error ID: {error.digest}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
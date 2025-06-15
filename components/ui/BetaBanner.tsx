"use client";

import { X, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/stores/useUIStore";

export function BetaBanner() {
  const { isBetaBannerVisible, dismissBetaBanner } = useUIStore();

  if (!isBetaBannerVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-900/90 to-violet-900/90 backdrop-blur-sm border-b border-purple-500/20 px-4 py-2 text-white text-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-purple-300" />
            <span className="font-medium">
              🚧 Game Vault is in{" "}
              <span className="text-purple-200 font-semibold">Beta</span>
            </span>
          </div>

          <div className="hidden sm:block text-purple-100">
            We're actively improving the platform!
          </div>

          <Link
            href="https://threads.net/@babajassin" // TODO: Replace with your actual Threads username
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-purple-700/50 hover:bg-purple-600/50 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 ml-auto sm:ml-2"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-medium">Ask questions on Threads</span>
          </Link>
        </div>

        <button
          onClick={dismissBetaBanner}
          className="ml-3 p-1 hover:bg-purple-700/50 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

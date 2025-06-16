"use client";

import { X, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/stores/useUIStore";

export function BetaBanner() {
  const { isBetaBannerVisible, dismissBetaBanner } = useUIStore();

  if (!isBetaBannerVisible) return null;

  const handleDismiss = async () => {
    dismissBetaBanner();

    // Save dismissal to cookies if consent allows
    try {
      const CookieManager = (await import("@/utils/cookieManager")).default;
      if (CookieManager.hasConsent("functional")) {
        CookieManager.setUserPreferences({ betaBannerDismissed: true });
      }
    } catch (error) {
      console.warn("Failed to save beta banner dismissal to cookies:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 to-violet-900/95 backdrop-blur-md border-b border-purple-500/30 px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm z-50 shadow-lg shadow-purple-900/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-300" />
            <span className="font-medium whitespace-nowrap">
              🚧 Game Vault is in{" "}
              <span className="text-purple-200 font-semibold">Beta</span>
            </span>
          </div>

          <div className="hidden md:block text-purple-100 truncate">
            We're actively improving the platform!
          </div>

          <Link
            href="https://threads.net/@babajassin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-1.5 bg-purple-700/60 hover:bg-purple-600/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-200 hover:scale-105 ml-auto sm:ml-2 flex-shrink-0 text-xs sm:text-sm"
          >
            <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="font-medium hidden xs:inline">
              Ask questions on Threads
            </span>
            <span className="font-medium xs:hidden">Questions</span>
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          className="ml-2 sm:ml-3 p-1 hover:bg-purple-700/50 rounded-full transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}

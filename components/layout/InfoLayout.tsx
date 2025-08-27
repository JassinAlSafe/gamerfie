"use client";
import React, { useState } from "react";
import { InfoSidebar } from "./InfoSidebar";
import { IconMenu2 } from "@tabler/icons-react";
import { useUIStore } from "@/stores/useUIStore";

interface InfoLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function InfoLayout({ children, title }: InfoLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isBetaBannerVisible } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile Header */}
      <div 
        className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 p-4 z-50 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <IconMenu2 className="h-5 w-5" />
          </button>
          {title && (
            <h1 className="text-lg font-semibold text-white truncate mx-4">{title}</h1>
          )}
          <div className="w-9 h-9" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <InfoSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
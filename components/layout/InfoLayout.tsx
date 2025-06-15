"use client";
import React, { useState } from "react";
import { InfoSidebar } from "./InfoSidebar";
import { IconMenu2 } from "@tabler/icons-react";

interface InfoLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function InfoLayout({ children, title }: InfoLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 p-4 sticky top-0 z-50">
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
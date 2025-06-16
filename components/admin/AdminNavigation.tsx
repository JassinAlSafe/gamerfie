"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Database,
  FileText,
  Trophy,
  Users,
  Shield,
  ChevronDown,
  ExternalLink,
  Zap,
  BarChart3,
  Newspaper,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminRoute {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  category: 'content' | 'system' | 'users';
}

const adminRoutes: AdminRoute[] = [
  // Content Management
  {
    name: "News Management",
    href: "/admin/news",
    icon: Newspaper,
    description: "Create and manage news posts",
    category: 'content',
    badge: "New"
  },
  {
    name: "Badge Management",
    href: "/admin/badges",
    icon: Trophy,
    description: "Manage user badges and achievements",
    category: 'content'
  },
  {
    name: "Playlist Management",
    href: "/admin/playlists",
    icon: FileText,
    description: "Create and manage game playlists",
    category: 'content'
  },
  
  // System Management
  {
    name: "Database Health",
    href: "/admin/database",
    icon: Database,
    description: "Monitor database performance",
    category: 'system'
  },
  
  // User Management (placeholder for future)
  {
    name: "User Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "View user engagement metrics",
    category: 'users'
  },
];

interface AdminNavigationProps {
  variant?: 'dropdown' | 'floating';
  className?: string;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ 
  variant = 'dropdown',
  className 
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut to toggle admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + A to toggle admin panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getCategoryRoutes = (category: AdminRoute['category']) => 
    adminRoutes.filter(route => route.category === category);

  const isCurrentRoute = (href: string) => pathname === href;

  if (variant === 'floating') {
    return (
      <div className={cn("fixed bottom-6 left-6 z-50", className)}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="mb-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] max-h-[70vh] overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Ctrl+Shift+A
                  </Badge>
                </div>

                {/* Content Management */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Content
                  </h4>
                  <div className="space-y-1">
                    {getCategoryRoutes('content').map((route) => {
                      const Icon = route.icon;
                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md text-sm transition-colors",
                            isCurrentRoute(route.href)
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {route.name}
                              {route.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {route.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {route.description}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* System Management */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    System
                  </h4>
                  <div className="space-y-1">
                    {getCategoryRoutes('system').map((route) => {
                      const Icon = route.icon;
                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md text-sm transition-colors",
                            isCurrentRoute(route.href)
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {route.name}
                              {route.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {route.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {route.description}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group",
            isOpen && "rotate-45"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className={cn(
            "w-6 h-6 transition-transform duration-200",
            isOpen ? "rotate-45" : "group-hover:rotate-12"
          )} />
        </motion.button>
      </div>
    );
  }

  // Dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("gap-2", className)}
        >
          <Shield className="w-4 h-4" />
          Admin
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Admin Panel
          <Badge variant="outline" className="ml-auto text-xs">
            Ctrl+Shift+A
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Content Management */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Content Management
        </DropdownMenuLabel>
        {getCategoryRoutes('content').map((route) => {
          const Icon = route.icon;
          return (
            <DropdownMenuItem key={route.href} asChild>
              <Link href={route.href} className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {route.name}
                    {route.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {route.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {route.description}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {/* System Management */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          System Management
        </DropdownMenuLabel>
        {getCategoryRoutes('system').map((route) => {
          const Icon = route.icon;
          return (
            <DropdownMenuItem key={route.href} asChild>
              <Link href={route.href} className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {route.name}
                    {route.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {route.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {route.description}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminNavigation;
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Edit, 
  Plus, 
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'outline' | 'destructive';
  badge?: string;
}

interface AdminQuickActionsProps {
  actions?: QuickAction[];
  context?: 'news' | 'playlists' | 'badges' | 'general';
  className?: string;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({
  actions: customActions,
  context,
  className
}) => {
  const { isAdmin } = useAdmin();
  const pathname = usePathname();

  if (!isAdmin) return null;

  // Context-specific quick actions
  const getContextActions = (): QuickAction[] => {
    switch (context) {
      case 'news':
        return [
          {
            label: "Create Post",
            href: "/admin/news",
            icon: Plus,
            badge: "New"
          },
          {
            label: "Manage News",
            href: "/admin/news",
            icon: Settings
          }
        ];
      
      case 'playlists':
        return [
          {
            label: "New Playlist",
            href: "/admin/playlists/new",
            icon: Plus
          },
          {
            label: "Manage Playlists",
            href: "/admin/playlists",
            icon: Settings
          }
        ];
      
      case 'badges':
        return [
          {
            label: "Create Badge",
            href: "/admin/badges",
            icon: Plus
          },
          {
            label: "Manage Badges",
            href: "/admin/badges",
            icon: Settings
          }
        ];
      
      default:
        // General actions based on current page
        if (pathname.includes('/news/') && !pathname.includes('/admin/')) {
          return [
            {
              label: "Edit Post",
              href: "/admin/news",
              icon: Edit,
              variant: 'outline' as const
            }
          ];
        }
        return [];
    }
  };

  const actions = customActions || getContextActions();

  if (actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
        <Settings className="w-3 h-3" />
        <span className="font-medium">Admin</span>
      </div>
      
      <div className="flex items-center gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          const content = (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={action.onClick}
              className="gap-1 h-7 text-xs"
            >
              <Icon className="w-3 h-3" />
              {action.label}
              {action.badge && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {action.badge}
                </Badge>
              )}
            </Button>
          );

          return action.href ? (
            <Link key={index} href={action.href}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>
    </motion.div>
  );
};

export default AdminQuickActions;
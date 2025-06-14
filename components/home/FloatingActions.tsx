"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Users, 
  Trophy, 
  Gamepad2,
  X,
  Zap,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

interface FloatingActionsProps {
  className?: string;
}

export const FloatingActions = memo(function FloatingActions({
  className
}: FloatingActionsProps) {
  const { user, isInitialized } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for authenticated users
  if (!isInitialized || !user) {
    return null;
  }

  const actions = [
    {
      icon: Gamepad2,
      label: "Add Game",
      href: "/all-games",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    {
      icon: Users,
      label: "Find Friends",
      href: "/friends",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700"
    },
    {
      icon: Trophy,
      label: "Achievements",
      href: "/achievements",
      color: "from-yellow-500 to-orange-500",
      hoverColor: "hover:from-yellow-600 hover:to-orange-600"
    },
    {
      icon: Search,
      label: "Discover",
      href: "/explore",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700"
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ 
                  opacity: 0, 
                  x: 50, 
                  scale: 0.8,
                  transition: { delay: (actions.length - index - 1) * 0.05 }
                }}
                className="flex items-center gap-3"
              >
                {/* Label */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-full shadow-lg text-sm font-medium text-white whitespace-nowrap"
                >
                  {action.label}
                </motion.div>
                
                {/* Action Button */}
                <Link href={action.href}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-14 h-14 rounded-full bg-gradient-to-r shadow-lg flex items-center justify-center text-white transition-all duration-200",
                      action.color,
                      action.hoverColor
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <action.icon className="h-6 w-6" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg flex items-center justify-center text-white transition-all duration-300",
          isOpen && "rotate-45"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <Plus className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

// Quick notification component for actions
export const QuickNotification = memo(function QuickNotification({
  message,
  type = "success",
  onClose
}: {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}) {
  const config = {
    success: {
      icon: Star,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-200"
    },
    error: {
      icon: X,
      color: "from-red-500 to-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-200"
    },
    info: {
      icon: Zap,
      color: "from-blue-500 to-purple-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-200"
    }
  };

  const { icon: Icon, color, bg, text } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className={cn(
        "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm",
        bg
      )}
    >
      <div className={cn("p-1 rounded-full bg-gradient-to-r", color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <span className={cn("font-medium", text)}>{message}</span>
      <button
        onClick={onClose}
        className={cn("p-1 rounded-full hover:bg-black/10 transition-colors", text)}
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
});
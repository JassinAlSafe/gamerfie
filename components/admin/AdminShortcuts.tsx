"use client";

import React from "react";
import { useAdmin } from "@/hooks/useAdmin";
import AdminNavigation from "./AdminNavigation";
import { motion } from "framer-motion";

interface AdminShortcutsProps {
  variant?: 'dropdown' | 'floating' | 'both';
  className?: string;
}

const AdminShortcuts: React.FC<AdminShortcutsProps> = ({ 
  variant = 'floating',
  className 
}) => {
  const { isAdmin, isLoading } = useAdmin();

  // Don't render anything while loading or if not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      {variant === 'both' ? (
        <>
          <AdminNavigation variant="dropdown" className={className} />
          <AdminNavigation variant="floating" />
        </>
      ) : (
        <AdminNavigation variant={variant} className={className} />
      )}
    </motion.div>
  );
};

export default AdminShortcuts;
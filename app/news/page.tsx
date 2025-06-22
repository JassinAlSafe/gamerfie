"use client";

import React from "react";
import NewsList from "@/components/news/NewsList";
import { motion } from "framer-motion";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Latest News
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest Gamerfie developments, new features, and community updates.
          </p>
        </motion.div>

        {/* Featured News */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured
          </h2>
          <NewsList 
            variant="featured"
            limit={3}
            featured={true}
            showFilters={false}
            showSearch={false}
            className="mb-8"
          />
        </motion.section>

        {/* All News */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All News
          </h2>
          <NewsList 
            variant="list"
            limit={12}
            showFilters={true}
            showSearch={true}
          />
        </motion.section>
      </div>
    </div>
  );
}
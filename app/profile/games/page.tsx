"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { LibraryView } from '@/components/library/library-view';
import { LibraryStats } from '@/components/library/library-stats';
import { LibraryFilters } from '@/components/library/library-filters';

export default function GamesPage() {
  const { user } = useAuthStore();
  const { fetchUserLibrary } = useLibraryStore();
  const [filters, setFilters] = useState({
    status: 'all',
    platforms: [],
    genres: [],
    search: '',
  });

  useEffect(() => {
    if (user) {
      fetchUserLibrary(user.id);
    }
  }, [user, fetchUserLibrary]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8">Your Library</h2>
      <LibraryStats />
      <LibraryFilters onFilterChange={setFilters} />
      <LibraryView filters={filters} />
    </div>
  );
} 
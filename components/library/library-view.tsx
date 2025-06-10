"use client";

import { useLibraryStore } from '@/stores/useLibraryStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Game } from '@/types';
import { LoadingSpinner } from '@/components/loadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableGameCard } from './sortable-game-card';

interface LibraryViewProps {
  filters: {
    status: string;
    platforms: string[];
    genres: string[];
    search: string;
  };
}

export function LibraryView({ filters }: LibraryViewProps) {
  const { games, loading, updateGamesOrder } = useLibraryStore();
  const { libraryView, sortBy, sortOrder } = useSettingsStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) return <LoadingSpinner />;
  if (!games.length) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
        <p className="text-gray-400">Start adding games to your library!</p>
      </div>
    );
  }

  const filteredGames = filterGames(games, filters);
  const sortedGames = sortGames(filteredGames, sortBy, sortOrder);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedGames.findIndex((game) => game.id === active.id);
      const newIndex = sortedGames.findIndex((game) => game.id === over.id);
      
      const newOrder = arrayMove(sortedGames, oldIndex, newIndex);
      updateGamesOrder(newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence mode="popLayout">
        {libraryView === 'grid' ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SortableContext
              items={sortedGames.map(game => game.id)}
              strategy={rectSortingStrategy}
            >
              {sortedGames.map((game) => (
                <SortableGameCard
                  key={game.id}
                  game={game}
                  view="grid"
                />
              ))}
            </SortableContext>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SortableContext
              items={sortedGames.map(game => game.id)}
              strategy={rectSortingStrategy}
            >
              {sortedGames.map((game) => (
                <SortableGameCard
                  key={game.id}
                  game={game}
                  view="list"
                />
              ))}
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>
    </DndContext>
  );
}

function sortGames(games: Game[], sortBy: string, sortOrder: 'asc' | 'desc'): Game[] {
  return [...games].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'rating':
        comparison = (b.rating || 0) - (a.rating || 0);
        break;
      case 'releaseDate':
        comparison = (b.first_release_date || 0) - (a.first_release_date || 0);
        break;
      case 'playTime':
        comparison = ((b as any).playTime || 0) - ((a as any).playTime || 0);
        break;
      case 'dateAdded':
      default:
        comparison = ((b as any).timestamp || 0) - ((a as any).timestamp || 0);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

function filterGames(games: Game[], filters: {
  status: string;
  platforms: string[];
  genres: string[];
  search: string;
}): Game[] {
  return games.filter(game => {
    // Status filter
    if (filters.status !== 'all' && (game as any).playStatus !== filters.status) {
      return false;
    }

    // Platform filter
    if (filters.platforms.length > 0) {
      const gamePlatforms = game.platforms?.map(p => p.name) || [];
      if (!filters.platforms.some(p => gamePlatforms.includes(p))) {
        return false;
      }
    }

    // Genre filter
    if (filters.genres.length > 0) {
      const gameGenres = game.genres?.map(g => g.name) || [];
      if (!filters.genres.some(g => gameGenres.includes(g))) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return game.name.toLowerCase().includes(searchTerm);
    }

    return true;
  });
} 
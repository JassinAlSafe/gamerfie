'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const { closeAllMenus } = useUIStore();
  const {
    libraryView,
    sortBy,
    sortOrder,
    showCompletedGames,
    setLibraryView,
    setSortBy,
    setSortOrder,
    setShowCompletedGames
  } = useSettingsStore();

  useEffect(() => {
    closeAllMenus();
  }, [closeAllMenus]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="max-w-4xl mx-auto p-6" onClick={handleContainerClick}>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Theme</h2>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="bg-gray-800 text-white rounded-lg px-4 py-2 w-full"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Library View</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setLibraryView('grid')}
                className={`px-4 py-2 rounded-lg ${
                  libraryView === 'grid' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setLibraryView('list')}
                className={`px-4 py-2 rounded-lg ${
                  libraryView === 'list' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Sort Options</h2>
            <div className="space-y-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 w-full"
              >
                <option value="dateAdded">Date Added</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="releaseDate">Release Date</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 w-full"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Show Completed Games</h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompletedGames}
                  onChange={(e) => setShowCompletedGames(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                              peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
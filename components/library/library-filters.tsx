"use client";

import { useState } from 'react';
import { Filter, SortAsc, SortDesc, LayoutGrid as Grid, List, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterState {
  status: string;
  platforms: string[];
  genres: string[];
  search: string;
}

export function LibraryFilters() {
  const {
    libraryView,
    sortBy,
    sortOrder,
    setLibraryView,
    setSortBy,
    setSortOrder,
  } = useSettingsStore();

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    platforms: [],
    genres: [],
    search: '',
  });

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      platforms: [],
      genres: [],
      search: '',
    });
  };

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.platforms.length > 0,
    filters.genres.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup 
                value={filters.status} 
                onValueChange={v => handleFilterChange('status', v)}
              >
                <DropdownMenuRadioItem value="all">All Games</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="notStarted">Not Started</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inProgress">In Progress</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="abandoned">Abandoned</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Platforms</DropdownMenuLabel>
              {platforms.map(platform => (
                <DropdownMenuCheckboxItem
                  key={platform}
                  checked={filters.platforms.includes(platform)}
                  onCheckedChange={() => handlePlatformToggle(platform)}
                >
                  {platform}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Genres</DropdownMenuLabel>
              {genres.map(genre => (
                <DropdownMenuCheckboxItem
                  key={genre}
                  checked={filters.genres.includes(genre)}
                  onCheckedChange={() => handleGenreToggle(genre)}
                >
                  {genre}
                </DropdownMenuCheckboxItem>
              ))}

              {activeFiltersCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <span>Sort by</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={libraryView === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLibraryView('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={libraryView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLibraryView('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className={cn(
        "transition-all duration-200 overflow-hidden",
        isSearchVisible ? "h-10" : "h-0"
      )}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search your library..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => handleFilterChange('search', '')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleFilterChange('status', 'all')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.platforms.map(platform => (
            <Badge key={platform} variant="secondary">
              {platform}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handlePlatformToggle(platform)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
          {filters.genres.map(genre => (
            <Badge key={genre} variant="secondary">
              {genre}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleGenreToggle(genre)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

const platforms = [
  'PC',
  'PlayStation 5',
  'PlayStation 4',
  'Xbox Series X/S',
  'Xbox One',
  'Nintendo Switch',
];

const genres = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Shooter',
  'Sports',
  'Racing',
  'Puzzle',
];

const sortOptions = [
  { label: 'Date Added', value: 'dateAdded' },
  { label: 'Name', value: 'name' },
  { label: 'Rating', value: 'rating' },
  { label: 'Release Date', value: 'releaseDate' },
  { label: 'Play Time', value: 'playTime' },
] as const; 
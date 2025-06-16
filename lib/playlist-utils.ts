import { PlaylistType } from "@/types/playlist";

export const PLAYLIST_TYPE_CONFIG = {
  featured: {
    label: "🌟 Featured",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500"
  },
  collection: {
    label: "📚 Collection", 
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500"
  },
  event: {
    label: "📅 Event",
    color: "from-green-500 to-emerald-500", 
    bgColor: "bg-green-500/10",
    textColor: "text-green-500"
  },
  genre: {
    label: "🎮 Genre",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10", 
    textColor: "text-orange-500"
  },
  custom: {
    label: "⚡ Custom",
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-500"
  }
} as const;

export const getPlaylistTypeConfig = (type: PlaylistType) => {
  return PLAYLIST_TYPE_CONFIG[type] || PLAYLIST_TYPE_CONFIG.custom;
};

export const getTypeColor = (type: PlaylistType) => {
  return `bg-gradient-to-r ${getPlaylistTypeConfig(type).color}`;
};

export const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const formatPlaylistDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};

export const getPlaylistStats = (playlists: any[]) => {
  const total = playlists.length;
  const published = playlists.filter(p => p.isPublished).length;
  const drafts = total - published;
  const totalGames = playlists.reduce((acc, p) => acc + (p.gameIds?.length || 0), 0);
  const mostPopular = playlists.reduce((prev, current) => 
    (current.gameIds?.length || 0) > (prev.gameIds?.length || 0) ? current : prev, 
    playlists[0]
  );

  return { total, published, drafts, totalGames, mostPopular };
};
/**
 * Configuration constants for GameTabs component
 * Single source of truth for tab definitions, animations, and UI behavior
 */

import { 
  Activity,
  Camera,
  Trophy,
  Gamepad2,
  Loader2
} from "lucide-react";

// Tab priority levels
export const TAB_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

// Animation configuration
export const TAB_ANIMATIONS = {
  DURATIONS: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5
  },
  TRANSITIONS: {
    EASE_OUT: [0.4, 0, 0.2, 1],
    BOUNCE: [0.68, -0.55, 0.265, 1.55],
    SMOOTH: 'ease-in-out'
  },
  VARIANTS: {
    ENTER: { opacity: 1, y: 0 },
    EXIT: { opacity: 0, y: -20 },
    INITIAL: { opacity: 0, y: 20 }
  }
} as const;

// Scroll configuration
export const SCROLL_CONFIG = {
  AMOUNT: 200,
  BEHAVIOR: 'smooth' as const,
  GRADIENT_WIDTH: 12, // Tailwind w-12
  BUTTON_SIZE: 'sm' as const
} as const;

// Tab definitions with complete configuration
export const TAB_DEFINITIONS = {
  OVERVIEW: {
    id: 'overview',
    label: 'Overview',
    icon: Gamepad2,
    description: 'Game details and summary',
    priority: TAB_PRIORITIES.HIGH,
    alwaysVisible: true,
    requiresContent: false
  },
  MEDIA: {
    id: 'media',
    label: 'Media',
    icon: Camera,
    description: 'Screenshots and videos',
    priority: TAB_PRIORITIES.HIGH,
    alwaysVisible: false,
    requiresContent: true,
    contentCheck: (game: any) => 
      (game.screenshots?.length || 0) > 0 || (game.videos?.length || 0) > 0
  },
  ACHIEVEMENTS: {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    description: 'Game achievements',
    priority: TAB_PRIORITIES.MEDIUM,
    alwaysVisible: false,
    requiresContent: true,
    contentCheck: (game: any) => 
      game.achievements && game.achievements.total > 0
  },
  RELATED: {
    id: 'related',
    label: 'Related',
    icon: Gamepad2,
    description: 'Similar games',
    priority: TAB_PRIORITIES.LOW,
    alwaysVisible: true,
    requiresContent: false
  },
  ACTIVITY: {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    description: 'Recent activities',
    priority: TAB_PRIORITIES.LOW,
    alwaysVisible: false,
    requiresContent: true,
    contentCheck: (game: any, activities: any) => 
      activities.data.length > 0 || !activities.loading
  }
} as const;

// Loading skeleton configurations
export const SKELETON_CONFIGS = {
  MEDIA: {
    type: 'grid',
    columns: { sm: 2, md: 3, lg: 4 },
    itemCount: 8,
    aspectRatio: 'aspect-video',
    className: 'bg-gray-800/50 rounded-lg animate-pulse'
  },
  ACHIEVEMENTS: {
    type: 'list',
    itemCount: 6,
    template: {
      icon: { width: 12, height: 12, className: 'bg-gray-800/50 rounded-lg animate-pulse' },
      content: [
        { height: 4, className: 'bg-gray-800/50 rounded animate-pulse' },
        { height: 3, width: '2/3', className: 'bg-gray-800/30 rounded animate-pulse' }
      ]
    }
  },
  RELATED: {
    type: 'grid',
    columns: { sm: 2, md: 3, lg: 4 },
    itemCount: 8,
    template: {
      image: { aspectRatio: 'aspect-[3/4]', className: 'bg-gray-800/50 rounded-lg animate-pulse' },
      content: [
        { height: 4, className: 'bg-gray-800/50 rounded animate-pulse' },
        { height: 3, width: '2/3', className: 'bg-gray-800/30 rounded animate-pulse' }
      ]
    }
  },
  ACTIVITY: {
    type: 'list',
    itemCount: 10,
    template: {
      avatar: { width: 10, height: 10, className: 'bg-gray-800/50 rounded-full animate-pulse' },
      container: { className: 'p-4 bg-gray-800/20 rounded-lg' },
      content: [
        { height: 4, className: 'bg-gray-800/50 rounded animate-pulse' },
        { height: 3, width: '1/2', className: 'bg-gray-800/30 rounded animate-pulse' }
      ]
    }
  },
  DEFAULT: {
    type: 'centered',
    icon: Loader2,
    iconClassName: 'w-8 h-8 animate-spin text-purple-500',
    message: 'Loading content...',
    containerClassName: 'flex items-center justify-center py-16'
  }
} as const;

// Mobile dropdown configuration
export const MOBILE_CONFIG = {
  BUTTON: {
    variant: 'outline' as const,
    className: 'w-full justify-between bg-gray-800/50 border-gray-700 text-white'
  },
  DROPDOWN: {
    className: 'absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl z-50',
    animation: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    }
  },
  BACKDROP: {
    className: 'fixed inset-0 z-40'
  }
} as const;

// Desktop navigation configuration  
export const DESKTOP_CONFIG = {
  CONTAINER: {
    className: 'hidden md:flex items-center relative'
  },
  SCROLL_CONTAINER: {
    className: 'flex overflow-x-auto scrollbar-hide gap-1 px-8',
    style: { scrollbarWidth: 'none', msOverflowStyle: 'none' }
  },
  TAB_BUTTON: {
    className: {
      base: 'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap hover:bg-gray-800/50',
      active: 'bg-purple-600/20 text-purple-400 shadow-lg',
      inactive: 'text-gray-400 hover:text-gray-200'
    }
  },
  SCROLL_BUTTONS: {
    className: 'absolute z-10 bg-gray-900/80 backdrop-blur-sm',
    variant: 'ghost' as const,
    size: 'sm' as const
  },
  GRADIENTS: {
    left: 'absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-950/80 to-transparent pointer-events-none z-5',
    right: 'absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-950/80 to-transparent pointer-events-none z-5'
  }
} as const;

// Main container styling
export const CONTAINER_CONFIG = {
  MAIN: {
    className: 'bg-gradient-to-b from-gray-950/60 to-gray-950/80 backdrop-blur-md border-t border-gray-800/30'
  },
  INNER: {
    className: 'container mx-auto px-4 sm:px-6 lg:px-8'
  },
  NAVIGATION: {
    className: 'py-6 border-b border-gray-800/30'
  },
  CONTENT: {
    className: 'py-8'
  },
  TAB_CONTENT: {
    className: 'focus-visible:outline-none'
  }
} as const;

// Type exports for configuration
export type TabId = keyof typeof TAB_DEFINITIONS;
export type TabPriority = typeof TAB_PRIORITIES[keyof typeof TAB_PRIORITIES];
export type SkeletonType = keyof typeof SKELETON_CONFIGS;
export type AnimationDuration = keyof typeof TAB_ANIMATIONS.DURATIONS;

// Helper to get tab configuration array
export const getTabConfigArray = () => Object.values(TAB_DEFINITIONS);

// Helper to get tab by ID
export const getTabById = (id: string) => 
  Object.values(TAB_DEFINITIONS).find(tab => tab.id === id);

// Helper to get skeleton config
export const getSkeletonConfig = (tabId: string) => 
  SKELETON_CONFIGS[tabId.toUpperCase() as keyof typeof SKELETON_CONFIGS] || SKELETON_CONFIGS.DEFAULT;
import { Game } from "@/types";
import { Profile } from "@/types/profile";
import { 
  TAB_DEFINITIONS, 
  TAB_PRIORITIES,
  getSkeletonConfig,
  getTabById,
  type TabId 
} from "@/config/game-tabs-config";

export function getAvailableTabs(
  game: Game, 
  activities: { data: any[]; loading: boolean }
): typeof TAB_DEFINITIONS[TabId][] {
  return Object.values(TAB_DEFINITIONS).filter(tab => {
    if (!tab.requiresContent) return true;
    
    if (tab.contentCheck) {
      return tab.contentCheck(game, activities);
    }
    
    return true;
  });
}

export function validateActiveTab(
  activeTab: string,
  availableTabs: ReturnType<typeof getAvailableTabs>
): boolean {
  return availableTabs.some(tab => tab.id === activeTab);
}

export function getDefaultTab(
  availableTabs: ReturnType<typeof getAvailableTabs>
): string {
  const highPriorityTab = availableTabs.find(
    tab => tab.priority === TAB_PRIORITIES.HIGH
  );
  return highPriorityTab?.id || 'overview';
}

export function shouldShowScrollButtons(
  container: HTMLDivElement | null
): { canScrollLeft: boolean; canScrollRight: boolean } {
  if (!container) {
    return { canScrollLeft: false, canScrollRight: false };
  }

  const canScrollLeft = container.scrollLeft > 0;
  const canScrollRight = 
    container.scrollLeft < container.scrollWidth - container.clientWidth;

  return { canScrollLeft, canScrollRight };
}

export function scrollTabContainer(
  container: HTMLDivElement | null,
  direction: 'left' | 'right',
  scrollAmount: number = 200
): void {
  if (!container) return;

  container.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  });
}

export function getTabSkeletonContent(tabId: string) {
  const config = getSkeletonConfig(tabId);
  
  if (config === getSkeletonConfig('DEFAULT')) {
    return {
      type: 'default',
      config
    };
  }
  
  return {
    type: tabId.toLowerCase(),
    config
  };
}

export function buildTabFilterQuery(
  game: Game,
  tab: typeof TAB_DEFINITIONS[TabId]
): Record<string, any> {
  const baseQuery = {
    gameId: game.id,
    tabId: tab.id
  };

  switch (tab.id) {
    case 'media':
      return {
        ...baseQuery,
        hasScreenshots: (game.screenshots?.length || 0) > 0,
        hasVideos: (game.videos?.length || 0) > 0
      };
    
    case 'achievements':
      return {
        ...baseQuery,
        totalAchievements: game.achievements?.total || 0
      };
    
    case 'related':
      return {
        ...baseQuery,
        genres: game.genres || [],
        platforms: game.platforms || []
      };
    
    default:
      return baseQuery;
  }
}

export function getTabContentKey(
  tabId: string, 
  game: Game, 
  profile: Profile | null
): string {
  const baseKey = `tab-${tabId}-${game.id}`;
  
  if (profile && (tabId === 'achievements' || tabId === 'activity')) {
    return `${baseKey}-${profile.id}`;
  }
  
  return baseKey;
}

export function getTabAnalytics(tabId: string) {
  const tab = getTabById(tabId);
  
  return {
    event: 'tab_viewed',
    properties: {
      tab_id: tabId,
      tab_label: tab?.label,
      tab_priority: tab?.priority,
      timestamp: new Date().toISOString()
    }
  };
}

export function getTabAccessibilityProps(
  tab: typeof TAB_DEFINITIONS[TabId],
  isActive: boolean
) {
  return {
    role: 'tab',
    'aria-selected': isActive,
    'aria-label': `${tab.label} tab - ${tab.description}`,
    tabIndex: isActive ? 0 : -1
  };
}

export function getTabPanelAccessibilityProps(
  tab: typeof TAB_DEFINITIONS[TabId],
  isActive: boolean
) {
  return {
    role: 'tabpanel',
    'aria-labelledby': `tab-${tab.id}`,
    hidden: !isActive,
    tabIndex: isActive ? 0 : -1
  };
}
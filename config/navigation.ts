/**
 * Centralized navigation configuration for consistent menu items across the application
 * This ensures a single source of truth for all navigation menus
 */

export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
}

/**
 * Main navigation items used across desktop and mobile menus
 */
export const navigationItems: NavigationItem[] = [
  { 
    href: "/", 
    label: "Home",
    description: "Dashboard and overview"
  },
  { 
    href: "/explore", 
    label: "Explore",
    description: "Discover new games and trending content"
  },
  { 
    href: "/all-games", 
    label: "All Games",
    description: "Browse the complete game database"
  },
  { 
    href: "/reviews", 
    label: "Reviews",
    description: "Game reviews and ratings"
  },
  { 
    href: "/forum", 
    label: "Forum",
    description: "Community discussions and topics"
  },
  { 
    href: "/info/about", 
    label: "About",
    description: "Learn more about Game Vault"
  },
];

/**
 * User-specific navigation items (shown when authenticated)
 */
export const userNavigationItems: NavigationItem[] = [
  { 
    href: "/profile", 
    label: "Profile",
    description: "View and edit your profile"
  },
  { 
    href: "/library", 
    label: "Library",
    description: "Your game collection"
  },
  { 
    href: "/achievements", 
    label: "Achievements",
    description: "Your gaming achievements"
  },
  { 
    href: "/friends", 
    label: "Friends",
    description: "Manage your gaming friends"
  },
];

/**
 * Footer navigation items
 */
export const footerNavigationItems: NavigationItem[] = [
  { 
    href: "/info/privacy", 
    label: "Privacy Policy",
    description: "How we handle your data"
  },
  { 
    href: "/info/terms", 
    label: "Terms of Service",
    description: "Terms and conditions"
  },
  { 
    href: "/info/contact", 
    label: "Contact",
    description: "Get in touch with us"
  },
];

/**
 * Get navigation items based on user authentication status
 */
export const getNavigationItems = (isAuthenticated: boolean = false): NavigationItem[] => {
  if (isAuthenticated) {
    return [...navigationItems, ...userNavigationItems];
  }
  return navigationItems;
};
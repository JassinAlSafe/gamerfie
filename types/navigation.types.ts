/**
 * Navigation types for profile tab system
 * Provides comprehensive type safety and documentation
 */

import { LucideIcon } from 'lucide-react';

/**
 * Individual navigation item configuration
 */
export interface NavItem {
  /** Display label for the navigation item */
  label: string;
  /** URL path for navigation */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional badge count for notifications */
  badge?: number;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional accessibility description */
  ariaLabel?: string;
}

/**
 * Tab dimensions for dynamic indicator positioning
 */
export interface TabDimensions {
  /** Width of the tab element in pixels */
  width: number;
  /** Left offset position relative to container */
  left: number;
}

/**
 * Active indicator style properties
 */
export interface TabIndicatorStyle {
  /** Width of the indicator in pixels */
  width: number;
  /** CSS transform string for positioning */
  transform: string;
  /** Opacity value (0-1) */
  opacity: number;
  /** Optional box shadow for depth effect */
  boxShadow?: string;
}

/**
 * Scroll indicator state
 */
export interface ScrollIndicatorState {
  /** Whether to show left scroll indicator */
  showLeft: boolean;
  /** Whether to show right scroll indicator */
  showRight: boolean;
}

/**
 * Navigation configuration options
 */
export interface NavConfig {
  /** Array of navigation items */
  items: NavItem[];
  /** Whether to enable mobile optimization */
  mobileOptimized: boolean;
  /** Whether to show scroll indicators */
  showScrollIndicators: boolean;
  /** Animation duration in milliseconds */
  animationDuration: number;
  /** Whether to enable glass effect on active indicator */
  glassEffect: boolean;
}

/**
 * Navigation event handlers
 */
export interface NavEventHandlers {
  /** Called when a navigation item is clicked */
  onItemClick?: (href: string, label: string) => void;
  /** Called when navigation becomes visible */
  onVisible?: () => void;
  /** Called when navigation scroll state changes */
  onScrollChange?: (state: ScrollIndicatorState) => void;
}

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveConfig {
  /** Mobile breakpoint in pixels */
  mobile: number;
  /** Tablet breakpoint in pixels */
  tablet: number;
  /** Desktop breakpoint in pixels */
  desktop: number;
  /** Large desktop breakpoint in pixels */
  largeDesktop: number;
}

/**
 * Animation easing options based on Apple's design system
 */
export const APPLE_EASING = {
  /** Standard ease in out - cubic-bezier(0.25, 0.1, 0.25, 1) */
  EASE_IN_OUT: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  /** Ease out - cubic-bezier(0.16, 1, 0.3, 1) */
  EASE_OUT: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Ease in - cubic-bezier(0.4, 0, 1, 1) */
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Spring - cubic-bezier(0.175, 0.885, 0.32, 1.275) */
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

/**
 * Default responsive configuration following Apple HIG guidelines
 */
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  largeDesktop: 1536,
};

/**
 * Default navigation configuration
 */
export const DEFAULT_NAV_CONFIG: Partial<NavConfig> = {
  mobileOptimized: true,
  showScrollIndicators: true,
  animationDuration: 500,
  glassEffect: true,
};

/**
 * Touch target sizes following Apple HIG guidelines
 */
export const TOUCH_TARGETS = {
  /** Minimum touch target size - 44pt (Apple HIG) */
  MINIMUM: 44,
  /** Recommended touch target size - 48pt */
  RECOMMENDED: 48,
  /** Comfortable touch target size - 56pt */
  COMFORTABLE: 56,
} as const;

/**
 * Z-index layers for proper stacking
 */
export const Z_INDEX = {
  /** Base navigation container */
  NAVIGATION: 40,
  /** Active indicator */
  INDICATOR: 1,
  /** Scroll indicators */
  SCROLL_INDICATORS: 10,
  /** Focus overlay */
  FOCUS: 20,
} as const;
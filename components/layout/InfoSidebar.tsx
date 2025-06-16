"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/useUIStore";
import {
  IconInfoCircle,
  IconHelp,
  IconMail,
  IconNews,
  IconMap,
  IconFileText,
  IconShield,
  IconBrandDiscord,
  IconHeart,
  IconX,
} from "@tabler/icons-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: "About",
    items: [
      {
        label: "About",
        href: "/info/about",
        icon: IconInfoCircle,
        description: "Learn about Game Vault",
      },
      {
        label: "FAQ",
        href: "/info/faq",
        icon: IconHelp,
        description: "Frequently asked questions",
      },
      {
        label: "Contact Us",
        href: "/info/contact",
        icon: IconMail,
        description: "Get in touch with us",
      },
      {
        label: "Recent News",
        href: "/info/news",
        icon: IconNews,
        description: "Latest updates and announcements",
      },
    ],
  },
  {
    title: "Development",
    items: [
      {
        label: "Roadmap",
        href: "/info/roadmap",
        icon: IconMap,
        description: "Our development roadmap",
      },
      {
        label: "Changelog",
        href: "/info/changelog",
        icon: IconFileText,
        description: "Version history and updates",
      },
    ],
  },
  {
    title: "Legal",
    items: [
      {
        label: "Terms of Service",
        href: "/info/terms",
        icon: IconFileText,
        description: "Terms and conditions",
      },
      {
        label: "Privacy Policy",
        href: "/info/privacy",
        icon: IconShield,
        description: "How we protect your data",
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        label: "Discord",
        href: "https://discord.gg/gamervault",
        icon: IconBrandDiscord,
        description: "Join our community",
      },
      {
        label: "Support Us",
        href: "/info/support",
        icon: IconHeart,
        description: "Help keep Game Vault running",
      },
    ],
  },
];

interface InfoSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationListItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClose?: () => void;
}

const NavigationListItem: React.FC<NavigationListItemProps> = ({
  item,
  isActive,
  onClose,
}) => {
  const Icon = item.icon;
  const isExternal = item.href.startsWith("http");

  const linkClasses = useMemo(
    () =>
      cn(
        "group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      ),
    [isActive]
  );

  const iconClasses = useMemo(
    () =>
      cn(
        "h-5 w-5 mr-3 transition-colors duration-200",
        isActive ? "text-purple-400" : "text-gray-500 group-hover:text-gray-300"
      ),
    [isActive]
  );

  const content = useMemo(
    () => (
      <>
        <Icon className={iconClasses} />
        <div className="flex-1 min-w-0">
          <div className="font-medium">{item.label}</div>
          {item.description && (
            <div className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5">
              {item.description}
            </div>
          )}
        </div>
        {isActive && (
          <div
            className="w-2 h-2 bg-purple-400 rounded-full"
            aria-hidden="true"
          />
        )}
      </>
    ),
    [Icon, iconClasses, item.label, item.description, isActive]
  );

  const handleClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  if (isExternal) {
    return (
      <li>
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        className={linkClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {content}
      </Link>
    </li>
  );
};

interface NavigationSectionProps {
  groups: NavigationGroup[];
  isActiveItem: (href: string) => boolean;
  onClose?: () => void;
}

const NavigationSection: React.FC<NavigationSectionProps> = React.memo(
  ({ groups, isActiveItem, onClose }) => (
    <nav className="space-y-8">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            {group.title}
          </h3>
          <ul className="space-y-1" role="list">
            {group.items.map((item) => (
              <NavigationListItem
                key={item.href}
                item={item}
                isActive={isActiveItem(item.href)}
                onClose={onClose}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
);

NavigationSection.displayName = "NavigationSection";

export function InfoSidebar({ isOpen = true, onClose }: InfoSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isBetaBannerVisible } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveItem = useCallback(
    (href: string) => {
      if (href.startsWith("http")) return false;
      return pathname === href;
    },
    [pathname]
  );

  const handleOverlayClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose?.();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [handleEscapeKey, isOpen]);

  const sidebarHeader = useMemo(
    () => (
      <div className="p-6 border-b border-gray-800/50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
            <IconInfoCircle className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Information</h2>
            <p className="text-sm text-gray-400">Help & Resources</p>
          </div>
        </div>
      </div>
    ),
    []
  );

  const sidebarFooter = useMemo(
    () => (
      <div className="p-4 border-t border-gray-800/50 flex-shrink-0">
        <div className="text-xs text-gray-500 text-center">
          <div className="mb-2">Game Vault v1.0</div>
          <div className="flex items-center justify-center space-x-1">
            <span>Made with</span>
            <IconHeart className="h-3 w-3 text-purple-400" />
            <span>for gamers</span>
          </div>
        </div>
      </div>
    ),
    []
  );

  // Desktop sidebar (rendered in place)
  const DesktopSidebar = useMemo(
    () => (
      <aside
        className={`w-80 bg-gradient-to-b from-gray-950 to-gray-900 border-r border-gray-800/50 flex-shrink-0 sticky h-screen flex-col hidden lg:flex transition-all duration-300 ${
          isBetaBannerVisible ? "top-[120px] sm:top-[128px]" : "top-16"
        }`}
        style={{
          height: isBetaBannerVisible 
            ? "calc(100vh - 120px)" 
            : "calc(100vh - 64px)"
        }}
        role="complementary"
        aria-label="Information navigation"
      >
        {sidebarHeader}

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <NavigationSection
            groups={navigationGroups}
            isActiveItem={isActiveItem}
          />
        </div>

        {sidebarFooter}
      </aside>
    ),
    [sidebarHeader, sidebarFooter, isActiveItem, isBetaBannerVisible]
  );

  // Mobile sidebar content
  const mobileSidebarContent = useMemo(
    () => (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] lg:hidden"
            onClick={handleOverlayClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOverlayClick();
              }
            }}
            aria-label="Close navigation overlay"
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 w-full bg-gradient-to-b from-gray-950 to-gray-900 border-r border-gray-800/50
          transform transition-transform duration-300 ease-in-out z-[100000]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden flex flex-col h-screen
        `}
          role="complementary"
          aria-label="Information navigation"
          aria-hidden={!isOpen}
        >
          {/* Header with Close Button */}
          <div className="p-6 border-b border-gray-800/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
                  <IconInfoCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Information</h2>
                  <p className="text-sm text-gray-400">Help & Resources</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center justify-center"
                aria-label="Close navigation menu"
                type="button"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <NavigationSection
              groups={navigationGroups}
              isActiveItem={isActiveItem}
              onClose={onClose}
            />
          </div>

          {sidebarFooter}
        </aside>
      </>
    ),
    [isOpen, handleOverlayClick, onClose, isActiveItem, sidebarFooter]
  );

  return (
    <>
      {/* Desktop sidebar renders in place */}
      {DesktopSidebar}

      {/* Mobile sidebar renders via portal to body */}
      {mounted &&
        typeof window !== "undefined" &&
        document?.body &&
        createPortal(mobileSidebarContent, document.body)}
    </>
  );
}

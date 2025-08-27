"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { isMobileDevice } from "@/utils/mobile-detection";
import {
  User,
  Gamepad2,
  BookText,
  Activity,
  Star,
  ListOrdered,
  Users,
  Heart,
  Medal,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Simplified, focused navigation items following Apple's clarity principle
const navItems = [
  { label: "Overview", href: "/profile", icon: User },
  { label: "Games", href: "/profile/games", icon: Gamepad2 },
  { label: "Activity", href: "/profile/activity", icon: Activity },
  { label: "Friends", href: "/profile/friends", icon: Users },
  { label: "Challenges", href: "/profile/challenges", icon: Target },
  { label: "Reviews", href: "/profile/reviews", icon: Star },
  { label: "Lists", href: "/profile/list", icon: ListOrdered },
  { label: "Journal", href: "/profile/journal", icon: BookText },
  { label: "Badges", href: "/profile/badges", icon: Medal },
];

export function ProfileNav() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Handle scroll indicators for better UX
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftGradient(scrollLeft > 10);
        setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      handleScroll(); // Initial check
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Find active item index for indicator animation
  const activeIndex = navItems.findIndex(item => pathname === item.href);

  return (
    <nav className="relative w-full bg-transparent" role="navigation" aria-label="Profile navigation">
      {/* Elegant container with subtle depth */}
      <div className="relative">
        {/* Scroll indicators - subtle gradients at edges (Apple's deference principle) */}
        {isMobile && showLeftGradient && (
          <div className="scroll-indicator absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-950/90 to-transparent z-10 pointer-events-none flex items-center">
            <ChevronLeft className="w-4 h-4 text-gray-300/60 ml-1" style={{ animation: "gentle-pulse 2s infinite" }} />
          </div>
        )}
        {isMobile && showRightGradient && (
          <div className="scroll-indicator absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-950/90 to-transparent z-10 pointer-events-none flex items-center justify-end">
            <ChevronRight className="w-4 h-4 text-gray-300/60 mr-1" style={{ animation: "gentle-pulse 2s infinite" }} />
          </div>
        )}

        {/* Navigation container */}
        <div 
          ref={scrollContainerRef}
          className={cn(
            "flex items-center px-4 py-2 max-w-7xl mx-auto overflow-x-auto",
            // Hide scrollbar for cleaner look (Apple's simplicity)
            "scrollbar-hide",
            // Smooth scrolling with snap points for mobile
            isMobile && "snap-x snap-mandatory scroll-smooth"
          )}
        >
          {/* Active indicator background (Apple's depth principle) */}
          <div 
            className="absolute h-12 glass-effect rounded-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
              width: isMobile ? "100px" : "90px",
              transform: `translateX(${activeIndex * (isMobile ? 110 : 100)}px)`,
              opacity: activeIndex >= 0 ? 1 : 0,
              boxShadow: activeIndex >= 0 ? "0 4px 20px rgba(0, 0, 0, 0.1)" : "none",
            }}
          />

          {/* Navigation items */}
          {navItems.map(({ label, href, icon: Icon }, index) => {
            const isActive = pathname === href;
            
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  // Base styles with focus on content (Apple's clarity)
                  "profile-nav-item touch-feedback relative flex flex-col items-center justify-center",
                  "min-w-[90px] h-14 px-3 py-2 rounded-xl",
                  // Mobile snap alignment
                  isMobile && "snap-center",
                  // Hover and active states (subtle, not competing with content)
                  !isActive && "hover:bg-white/3",
                  // Accessibility: proper touch targets
                  "touch-manipulation",
                  // Enhanced focus styles
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
                )}
                aria-current={isActive ? "page" : undefined}
                tabIndex={0}
              >
                {/* Icon with subtle animation */}
                <Icon 
                  className={cn(
                    "nav-icon transition-all duration-300",
                    isActive 
                      ? "w-5 h-5 text-white nav-icon active" 
                      : "w-5 h-5 text-gray-400 hover:text-gray-200",
                    // Subtle scale on active for delight
                    isActive && "scale-110"
                  )}
                  aria-hidden="true"
                />
                
                {/* Label with beautiful typography (Apple's clarity) */}
                <span 
                  className={cn(
                    "nav-label text-[11px] font-medium mt-1.5 leading-tight",
                    isActive 
                      ? "text-white font-semibold" 
                      : "text-gray-400 hover:text-gray-300",
                    // Smooth opacity transitions
                    "transition-all duration-300 ease-out"
                  )}
                >
                  {label}
                </span>

                {/* Active indicator dot (micro-interaction for delight) */}
                {isActive && (
                  <div 
                    className="active-indicator absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-sm"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Subtle bottom border for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
    </nav>
  );
}
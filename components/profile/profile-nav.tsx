"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Gamepad2,
  BookText,
  Activity,
  Star,
  ListOrdered,
  Users,
  Medal,
  Target,
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

export const ProfileNav = memo(function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-border/10" role="navigation">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center overflow-x-auto scrollbar-hide">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 max-w-[120px] px-3 py-4 text-center transition-colors",
                  isActive 
                    ? "text-foreground border-b-2 border-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

ProfileNav.displayName = 'ProfileNav';
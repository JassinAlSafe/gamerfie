"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

const navItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Games", href: "/profile/games", icon: Gamepad2 },
  { label: "Challenges", href: "/profile/challenges", icon: Target },
  { label: "Journal", href: "/profile/journal", icon: BookText },
  { label: "Activity", href: "/profile/activity", icon: Activity },
  { label: "Reviews", href: "/profile/reviews", icon: Star },
  { label: "Lists", href: "/profile/list", icon: ListOrdered },
  { label: "Friends", href: "/profile/friends", icon: Users },
  { label: "Likes", href: "/profile/likes", icon: Heart },
  { label: "Badges", href: "/profile/badges", icon: Medal },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center w-full">
      <div className="flex items-center gap-1 px-4 py-3 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 mr-2.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

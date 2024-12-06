"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  GamepadIcon,
  ScrollText,
  Activity,
  Star,
  ListIcon,
  Users,
  Heart,
  Trophy,
} from "lucide-react";

const navItems = [
  { name: "Profile", href: "/profile", icon: GamepadIcon },
  { name: "Games", href: "/profile/games", icon: GamepadIcon },
  { name: "Journal", href: "/profile/journal", icon: ScrollText },
  { name: "Activity", href: "/profile/activity", icon: Activity },
  { name: "Reviews", href: "/profile/reviews", icon: Star },
  { name: "Lists", href: "/profile/lists", icon: ListIcon },
  { name: "Friends", href: "/profile/friends", icon: Users },
  { name: "Likes", href: "/profile/likes", icon: Heart },
  { name: "GOTY", href: "/profile/goty", icon: Trophy },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 py-4 mb-8 overflow-x-auto">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              href={href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                pathname === href
                  ? "bg-purple-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 mr-2" />
              {name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

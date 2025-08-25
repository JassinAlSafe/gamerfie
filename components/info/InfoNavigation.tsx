"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  FileQuestion, 
  Mail, 
  Shield, 
  FileText, 
  User, 
  Newspaper,
  ChevronRight 
} from "lucide-react";

const infoPages = [
  {
    title: "About",
    href: "/info/about",
    icon: User,
    description: "Learn about our platform"
  },
  {
    title: "FAQ",
    href: "/info/faq", 
    icon: FileQuestion,
    description: "Frequently asked questions"
  },
  {
    title: "Contact",
    href: "/info/contact",
    icon: Mail,
    description: "Get in touch with us"
  },
  {
    title: "Privacy",
    href: "/info/privacy",
    icon: Shield,
    description: "How we protect your data"
  },
  {
    title: "Terms",
    href: "/info/terms",
    icon: FileText,
    description: "Terms of service"
  },
  {
    title: "News",
    href: "/info/news",
    icon: Newspaper,
    description: "Latest updates & announcements"
  }
];

interface InfoNavigationProps {
  className?: string;
  variant?: "sidebar" | "breadcrumb" | "grid";
}

export function InfoNavigation({ className, variant = "sidebar" }: InfoNavigationProps) {
  const pathname = usePathname();

  if (variant === "breadcrumb") {
    const currentPage = infoPages.find(page => page.href === pathname);
    
    return (
      <nav className={cn("flex items-center space-x-2 text-sm text-gray-400 mb-6", className)}>
        <Link 
          href="/" 
          className="hover:text-purple-400 transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href="/info" 
          className="hover:text-purple-400 transition-colors"
        >
          Info
        </Link>
        {currentPage && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{currentPage.title}</span>
          </>
        )}
      </nav>
    );
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {infoPages.map((page) => {
          const Icon = page.icon;
          const isActive = pathname === page.href;
          
          return (
            <Link
              key={page.href}
              href={page.href}
              className={cn(
                "group p-4 rounded-xl border transition-all duration-300 hover:scale-105",
                isActive
                  ? "bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10"
                  : "bg-gray-900/30 border-gray-800/50 hover:border-purple-500/30"
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-purple-500/20 border border-purple-500/30"
                    : "bg-gray-800/50 group-hover:bg-purple-500/20"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-400"
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className={cn(
                    "font-semibold mb-1 transition-colors",
                    isActive ? "text-purple-300" : "text-white group-hover:text-purple-300"
                  )}>
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {page.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // Default sidebar variant
  return (
    <nav className={cn("space-y-2", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Information</h3>
      {infoPages.map((page) => {
        const Icon = page.icon;
        const isActive = pathname === page.href;
        
        return (
          <Link
            key={page.href}
            href={page.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
              isActive
                ? "bg-purple-500/20 text-purple-300 border-l-2 border-purple-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{page.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
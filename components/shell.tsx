"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Home, Gamepad2, Trophy, Users, Bell, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardShellProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Friends", href: "/friends", icon: Users },
];

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-8">
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-6 w-6 text-purple-500" />
              <span className="font-bold">Gamerfie</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-500 text-[10px] font-medium text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <main className="container py-6 md:py-8">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">
              © 2024 Gamerfie. All rights reserved.
            </span>
          </div>
          <nav className="flex space-x-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

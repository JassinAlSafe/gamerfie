// "use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
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
  );
}

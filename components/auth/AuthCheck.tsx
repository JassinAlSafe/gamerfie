"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { Gamepad2 } from "lucide-react";

interface AuthCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAuth?: () => void;
}

export function AuthCheck({ children, onAuth }: AuthCheckProps) {
  const { user } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleAction = () => {
    if (user) {
      onAuth?.();
    } else {
      setShowDialog(true);
    }
  };

  const handleLogin = () => {
    setShowDialog(false);
    router.push("/signin");
  };

  return (
    <>
      <span onClick={handleAction}>{children}</span>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border border-zinc-800/50 text-white">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50">
              <Gamepad2 className="h-6 w-6 text-purple-500" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Join the Gaming Community
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Create an account to add games to your library, track your
              progress, and connect with other gamers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Log In
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/signup")}
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, X } from "lucide-react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
  title?: string;
  description?: string;
  actionContext?: string; // e.g., "to reply to this post", "to like this thread"
}

export function AuthDialog({
  isOpen,
  onClose,
  defaultTab = "signin",
  title,
  description,
  actionContext = "to continue"
}: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleClose = () => {
    onClose();
    // Reset to default tab when closing
    setActiveTab(defaultTab);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {title || `Sign ${activeTab === "signin" ? "In" : "Up"} Required`}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {description || `You need to be signed in ${actionContext}.`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <SignInForm onSuccess={handleClose} />
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <SignUpForm onSuccess={handleClose} />
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground text-center">
          {activeTab === "signin" ? (
            <span>
              Don't have an account?{" "}
              <button
                onClick={() => setActiveTab("signup")}
                className="text-primary hover:underline"
              >
                Sign up here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setActiveTab("signin")}
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to easily manage auth dialog state
 */
export function useAuthDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    defaultTab?: "signin" | "signup";
    title?: string;
    description?: string;
    actionContext?: string;
  }>({});

  const openDialog = (options?: {
    defaultTab?: "signin" | "signup";
    title?: string;
    description?: string;
    actionContext?: string;
  }) => {
    setConfig(options || {});
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openDialog,
    closeDialog,
    Dialog: (props: Omit<AuthDialogProps, "isOpen" | "onClose">) => (
      <AuthDialog
        isOpen={isOpen}
        onClose={closeDialog}
        {...config}
        {...props}
      />
    ),
  };
}
"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gamepad2, Users, Trophy, Edit3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  href?: string;
  action?: () => void;
  variant: "navigation" | "modal" | "external";
  color: string;
}

export const QuickActionsCard = memo(function QuickActionsCard() {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: "add-game",
      icon: <Gamepad2 className="h-5 w-5" />,
      label: "Add New Game",
      description: "Search and add games to your library",
      action: () => setSelectedAction({ id: "add-game", icon: <Gamepad2 className="h-5 w-5" />, label: "Add New Game", description: "Search and add games to your library", variant: "modal", color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20" }),
      variant: "modal",
      color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
    },
    {
      id: "find-friends",
      icon: <Users className="h-5 w-5" />,
      label: "Find Friends",
      description: "Connect with fellow gamers",
      href: "/friends",
      variant: "navigation",
      color: "text-green-500 bg-green-500/10 hover:bg-green-500/20 border-green-500/20",
    },
    {
      id: "view-achievements",
      icon: <Trophy className="h-5 w-5" />,
      label: "View Achievements",
      description: "See your badges and accomplishments",
      href: "/achievements",
      variant: "navigation",
      color: "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20",
    },
    {
      id: "write-review",
      icon: <Edit3 className="h-5 w-5" />,
      label: "Write Review",
      description: "Share your thoughts on games",
      action: () => setSelectedAction({ id: "write-review", icon: <Edit3 className="h-5 w-5" />, label: "Write Review", description: "Share your thoughts on games", variant: "modal", color: "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20" }),
      variant: "modal",
      color: "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.variant === "modal" && action.action) {
      action.action();
    }
  };

  return (
    <>
      <Card className="p-6 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
              <Plus className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
          </div>

          {/* Actions Grid */}
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuickActionButton
                  action={action}
                  onClick={() => handleActionClick(action)}
                />
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="pt-4 border-t border-border/30">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Library</p>
                <p className="text-sm font-semibold text-foreground">24 Games</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Reviews</p>
                <p className="text-sm font-semibold text-foreground">8 Written</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={selectedAction?.id === "add-game"}
        onClose={() => setSelectedAction(null)}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={selectedAction?.id === "write-review"}
        onClose={() => setSelectedAction(null)}
      />
    </>
  );
});

const QuickActionButton = memo(function QuickActionButton({
  action,
  onClick,
}: {
  action: QuickAction;
  onClick: () => void;
}) {
  const content = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-auto p-4 rounded-xl transition-all duration-200 group",
        "bg-card/30 hover:bg-card/60 border border-transparent hover:border-border/50",
        action.color
      )}
      onClick={action.variant === "modal" ? onClick : undefined}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={cn("p-2 rounded-lg border transition-colors", action.color)}>
          {action.icon}
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-foreground group-hover:text-current transition-colors">
            {action.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {action.description}
          </p>
        </div>
      </div>
    </Button>
  );

  if (action.variant === "navigation" && action.href) {
    return <Link href={action.href}>{content}</Link>;
  }

  return content;
});

const AddGameModal = memo(function AddGameModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-blue-500" />
            Add New Game
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Choose how you'd like to discover and add games:
          </p>
          
          <div className="grid gap-3">
            <Link href="/all-games" onClick={onClose}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 bg-card/30 hover:bg-blue-500/10 hover:border-blue-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Gamepad2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Browse All Games</p>
                    <p className="text-xs text-muted-foreground">
                      Explore games with filters and search
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
            
            <Link href="/explore" onClick={onClose}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 bg-card/30 hover:bg-green-500/10 hover:border-green-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Trophy className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Explore Featured</p>
                    <p className="text-xs text-muted-foreground">
                      Discover trending and recommended games
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/profile/games" onClick={onClose}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 bg-card/30 hover:bg-purple-500/10 hover:border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Manage Library</p>
                    <p className="text-xs text-muted-foreground">
                      View and organize your current games
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

const ReviewModal = memo(function ReviewModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-purple-500" />
            Write a Review
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Choose how you'd like to write your review:
          </p>
          
          <div className="grid gap-3">
            <Link href="/profile/reviews" onClick={onClose}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 bg-card/30 hover:bg-purple-500/10 hover:border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Edit3 className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Browse & Review</p>
                    <p className="text-xs text-muted-foreground">
                      View your games and write reviews
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
            
            <Link href="/profile/games" onClick={onClose}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 bg-card/30 hover:bg-blue-500/10 hover:border-blue-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Gamepad2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">From Library</p>
                    <p className="text-xs text-muted-foreground">
                      Review games from your library
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});